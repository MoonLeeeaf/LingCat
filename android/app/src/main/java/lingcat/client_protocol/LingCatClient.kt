package lingcat.client_protocol

import android.util.Log
import com.google.protobuf.ByteString
import kotlinx.coroutines.*
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import lingcat.methods.Methods.*
import lingcat.protocol.Methods
import lingcat.protocol.Package
import lingcat.protocol.SecureKey
import okhttp3.*
import okio.ByteString.Companion.toByteString
import java.io.IOException
import java.util.concurrent.CompletableFuture
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.TimeUnit
import java.util.concurrent.TimeoutException

class LingCatClient(
    private val serverWs: String,
    private val serverHttp: String,
    private val serverPublicKey: ByteArray
) {
    companion object {
        private const val TAG = "LingCatClient"
        private const val PING_INTERVAL_MS = 30_000L
        private const val PING_TIMEOUT_MS = 45_000L
        private const val RECONNECT_BASE_MS = 1_000L
        private const val RECONNECT_CAP_MS = 30_000L
    }

    enum class ConnectionState {
        IDLE, CONNECTING, CONNECTED, RECONNECTING, DISCONNECTED
    }

    // 协程作用域
    private val clientScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    // WebSocket 相关
    private val okHttpClient: OkHttpClient = HttpClientProvider.get()
    private var webSocket: WebSocket? = null

    // 状态管理
    private val _connectionState = MutableStateFlow(ConnectionState.IDLE)
    val connectionStateFlow: StateFlow<ConnectionState> = _connectionState.asStateFlow()
    private var manualDisconnect = false

    // 会话密钥与序号
    private var keySend: ByteArray? = null
    private var keyRecv: ByteArray? = null
    private var sendSeq = -1L
    private var recvSeq = -1L
    private val sendLock = Any()
    private var handshakeKeyPair: com.goterl.lazysodium.utils.KeyPair? = null

    // 挂起的请求 (requestId -> CompletableFuture)
    private val pendingRequests = ConcurrentHashMap<String, CompletableFuture<Package>>()

    // 监听器
    private val connectionStateListeners = mutableListOf<OnConnectionStateChangedListener>()
    private val receiveListeners = mutableListOf<OnReceiveListener>()
    private var onInitListener: OnInitListener? = null
    private var onAuthFailed: Runnable? = null
    private var onHandshakeFailedListener: OnHandshakeFailedListener? = null
    private var executorCallback: ExecutorCallback? = null

    private val _events = MutableSharedFlow<Package>(extraBufferCapacity = 100)
    val events: SharedFlow<Package> = _events.asSharedFlow()

    // 心跳任务
    private var pingJob: Job? = null
    private var reconnectJob: Job? = null
    private var reconnectAttempt = 0
    private var lastPongTime = 0L

    // ============================================================
    //                  Java 兼容的接口 (保持旧调用不变)
    // ============================================================

    fun setOnInitListener(l: OnInitListener?) { this.onInitListener = l }
    fun setOnAuthFailed(r: Runnable?) { this.onAuthFailed = r }
    fun setOnHandshakeFailedListener(l: OnHandshakeFailedListener?) { this.onHandshakeFailedListener = l }
    fun setExecutorCallback(cb: ExecutorCallback?) { this.executorCallback = cb }

    fun addConnectionStateListener(l: OnConnectionStateChangedListener) { connectionStateListeners.add(l) }
    fun removeConnectionStateListener(l: OnConnectionStateChangedListener) { connectionStateListeners.remove(l) }
    fun addOnReceiveListener(l: OnReceiveListener) { receiveListeners.add(l) }
    fun removeOnReceiveListener(l: OnReceiveListener) { receiveListeners.remove(l) }

    fun isReady(): Boolean = webSocket != null && keySend != null
    fun getServerHttp(): String = serverHttp
    fun getServerWs(): String = serverWs
    fun getOkHttpClient(): OkHttpClient = okHttpClient

    fun getFileUrlByHash(hash: String): String =
        if (serverHttp.endsWith("/")) "${serverHttp}uploaded_files/$hash" else "$serverHttp/uploaded_files/$hash"

    fun getFileUrlByHashAndToken(hash: String, token: String): String =
        "${getFileUrlByHash(hash)}?file_access_token=$token"

    fun interface OnConnectionStateChangedListener { fun onConnectionStateChanged(state: ConnectionState) }
    fun interface OnHandshakeFailedListener { fun onHandshakeFailed(reason: String) }
    fun interface OnReceiveListener { fun onReceive(pkg: Package) }
    fun interface OnInitListener { fun onInit() }
    interface ExecutorCallback { fun run(r: Runnable) }

    // ============================================================
    //                 核心逻辑: 连接与握手
    // ============================================================

    fun init() {
        if (webSocket != null) {
            Log.w(TAG, "init() called but webSocket already exists")
            if (isReady()) onInitListener?.onInit()
            return
        }

        manualDisconnect = false
        updateState(ConnectionState.CONNECTING)
        cancelReconnect()

        Log.i(TAG, "init() called, ws url = $serverWs")
        val request = Request.Builder().url(serverWs).build()

        webSocket = okHttpClient.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(ws: WebSocket, response: Response) {
                Log.i(TAG, "onOpen! ws=$serverWs code=${response.code}")
                try {
                    val kp = SecureKey.All_generateExchangeKeyPair()
                    handshakeKeyPair = kp

                    val handshake = HandShake_Request.newBuilder()
                        .setClientPublicKey(ByteString.copyFrom(kp.publicKey.asBytes))
                        .build()

                    val pkg = Package.encode(Package.Input().apply {
                        method_id = Methods.HandShake_Request
                        flags = 0
                        data = handshake.toByteArray()
                    })

                    ws.send(pkg.toBuffer().toByteString())
                } catch (e: Exception) {
                    Log.e(TAG, "handshake init failed", e)
                    ws.close(4002, "handshake init failed")
                }
            }

            override fun onMessage(ws: WebSocket, bytes: okio.ByteString) {
                val raw = bytes.toByteArray()
                executorCallback?.run { handleMessage(raw) } ?: handleMessage(raw)
            }

            override fun onClosed(ws: WebSocket, code: Int, reason: String) {
                handleDisconnected(code, reason)
            }

            override fun onFailure(ws: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "onFailure: $t", t)
                handleDisconnected(-1, t.message ?: "Unknown failure")
            }
        })
    }

    private fun handleMessage(raw: ByteArray) {
        try {
            val header = Package.decode(raw, null, null)
            val encrypted = (header.flags.toInt() and Package.FLAG_ENCRYPTED) != 0

            if (encrypted && keyRecv == null) {
                throw IllegalStateException("Received encrypted package but no session key")
            }

            val pkg = if (encrypted) Package.decode(raw, keyRecv, recvSeq) else header
            lastPongTime = System.currentTimeMillis()

            if (pkg.seq >= 0) recvSeq = pkg.seq

            when (pkg.method_id) {
                Methods.HandShake_Response -> handleHandshakeResponse(pkg)
                Methods.Ping_Response -> {
                    // 仅用于维持连接，不需要处理
                }
            }

            // 请求响应匹配
            val requestId = bytesToHex(pkg.request_id)
            val pending = pendingRequests.remove(requestId)
            if (pending != null) {
                pending.complete(pkg)
            }

            _events.tryEmit(pkg)

            // 全局事件分发
            receiveListeners.forEach {
                try { it.onReceive(pkg) } catch (e: Exception) { Log.e(TAG, "listener error", e) }
            }
        } catch (e: Exception) {
            Log.e(TAG, "handleMessage error", e)
        }
    }

    private fun handleHandshakeResponse(pkg: Package) {
        val kp = handshakeKeyPair ?: return
        try {
            val res = HandShake_Response.parseFrom(pkg.data)
            val verified = SecureKey.Client_checkSignedMessage(
                res.messageToBeVerify.toByteArray(),
                res.serverPublicKey.toByteArray(),
                kp.publicKey.asBytes,
                serverPublicKey
            )

            if (!verified) {
                Log.e(TAG, "server verification failed")
                manualDisconnect = true
                updateState(ConnectionState.DISCONNECTED)
                onHandshakeFailedListener?.onHandshakeFailed("server_public_key_mismatch")
                webSocket?.close(4001, "handshake verify failed")
                return
            }

            val shared = SecureKey.All_getSharedSecret(kp.secretKey.asBytes, res.serverPublicKey.toByteArray())
            val keys = SecureKey.Client_hkdf(shared, res.salt.toByteArray())
            shared.fill(0)

            keyRecv = keys.keyRecv
            keySend = keys.keySend
            sendSeq = -1L
            recvSeq = -1L
            handshakeKeyPair = null
            reconnectAttempt = 0

            Log.i(TAG, "handshake complete, session keys established")
            updateState(ConnectionState.CONNECTED)
            startPing()
            onInitListener?.onInit()
        } catch (e: Exception) {
            Log.e(TAG, "handshake handling error", e)
            webSocket?.close(4002, "handshake parse failed")
        }
    }

    // ============================================================
    //                 请求发送与挂起处理
    // ============================================================

    fun invoke(methodId: Int, data: ByteArray, flags: Int, timeoutMs: Long): CompletableFuture<Package> {
        val future = CompletableFuture<Package>()

        // 如果没有握手完成，直接异常
        val kSend = keySend
        if (kSend == null) {
            future.completeExceptionally(IllegalStateException("Client not ready"))
            return future
        }

        try {
            val requestId = synchronized(sendLock) {
                val currentSeq = if (sendSeq < 0) 0L else sendSeq
                sendSeq = (currentSeq + 1) and 0xFFFFFFFFL

                val pkg = Package.encode(Package.Input().apply {
                    this.method_id = methodId
                    this.flags = flags
                    this.data = data
                }).encrypt(currentSeq, kSend)

                sendPackageInternal(pkg, future, timeoutMs)
            }
            return future
        } catch (e: Exception) {
            future.completeExceptionally(e)
            return future
        }
    }

    fun invokeUnencrypted(methodId: Int, data: ByteArray, flags: Int, timeoutMs: Long): CompletableFuture<Package> {
        val future = CompletableFuture<Package>()
        try {
            val pkg = Package.encode(Package.Input().apply {
                this.method_id = methodId
                this.flags = flags
                this.data = data
            })
            sendPackageInternal(pkg, future, timeoutMs)
            return future
        } catch (e: Exception) {
            future.completeExceptionally(e)
            return future
        }
    }

    private fun sendPackageInternal(pkg: Package, future: CompletableFuture<Package>, timeoutMs: Long): String {
        val requestId = bytesToHex(pkg.request_id)
        val ws = webSocket

        if (ws == null) {
            future.completeExceptionally(IOException("WebSocket not connected"))
            return requestId
        }

        pendingRequests[requestId] = future

        // 启动超时协程
        clientScope.launch {
            delay(if (timeoutMs > 0) timeoutMs else 30000L)
            val pending = pendingRequests.remove(requestId)
            if (pending != null) {
                pending.completeExceptionally(TimeoutException("Request timeout (${Methods.getMethodName(pkg.method_id)})"))
            }
        }

        val sent = ws.send(pkg.toBuffer().toByteString())
        if (!sent) {
            pendingRequests.remove(requestId)
            future.completeExceptionally(IOException("WebSocket send failed"))
        } else {
            Log.d(TAG, "invoke sent: ${Methods.getMethodName(pkg.method_id)} reqId=$requestId")
        }
        return requestId
    }

    // ============================================================
    //                 心跳与重连
    // ============================================================

    private fun startPing() {
        pingJob?.cancel()
        lastPongTime = System.currentTimeMillis()
        pingJob = clientScope.launch {
            while (isActive) {
                delay(PING_INTERVAL_MS)
                val kSend = keySend
                if (kSend != null && webSocket != null) {
                    try {
                        val data = Ping_Request.newBuilder().setTime(System.currentTimeMillis()).build().toByteArray()
                        synchronized(sendLock) {
                            val currentSeq = if (sendSeq < 0) 0L else sendSeq
                            sendSeq = (currentSeq + 1) and 0xFFFFFFFFL
                            val pkt = Package.encode(Package.Input().apply {
                                method_id = Methods.Ping_Request
                                flags = 0
                                this.data = data
                            }).encrypt(currentSeq, kSend)
                            webSocket?.send(pkt.toBuffer().toByteString())
                        }
                    } catch (e: Exception) {
                        Log.w(TAG, "ping failed", e)
                    }
                }

                if (System.currentTimeMillis() - lastPongTime > PING_TIMEOUT_MS) {
                    Log.w(TAG, "ping timeout, closing")
                    webSocket?.close(4000, "ping timeout")
                    break
                }
            }
        }
    }

    private fun handleDisconnected(code: Int, reason: String) {
        Log.i(TAG, "closed: code=$code reason=$reason")
        pingJob?.cancel()
        rejectAllPending("Connection closed")
        keySend = null
        keyRecv = null
        webSocket = null

        // ★ 核心修复 3：如果还没握手成功就断开了，立刻通知外面报错，不要傻等！
        if (!isReady() && onHandshakeFailedListener != null) {
            onHandshakeFailedListener?.onHandshakeFailed("连接断开 ($code)")
        }

        if (manualDisconnect || code == 1000 || code == 1008 || code == 4001) {
            updateState(ConnectionState.DISCONNECTED)
            return
        }
        scheduleReconnect()
    }

    private fun scheduleReconnect() {
        if (manualDisconnect || reconnectJob?.isActive == true) return
        updateState(ConnectionState.RECONNECTING)

        val exp = minOf(RECONNECT_BASE_MS * (1L shl minOf(reconnectAttempt, 5)), RECONNECT_CAP_MS)
        val jitter = (exp * (0.75 + Math.random() * 0.5)).toLong()
        reconnectAttempt++

        reconnectJob = clientScope.launch {
            delay(jitter)
            if (!manualDisconnect) init()
        }
    }

    private fun cancelReconnect() {
        reconnectJob?.cancel()
        reconnectJob = null
    }

    fun disconnect() {
        manualDisconnect = true
        cancelReconnect()
        pingJob?.cancel()
        rejectAllPending("Client disconnected")
        keySend = null
        keyRecv = null
        webSocket?.close(1000, "manual disconnect")
        webSocket = null
        updateState(ConnectionState.DISCONNECTED)
    }

    private fun rejectAllPending(reason: String) {
        pendingRequests.forEach { (_, f) -> f.completeExceptionally(IOException(reason)) }
        pendingRequests.clear()
    }

    private fun updateState(state: ConnectionState) {
        if (_connectionState.value != state) {
            _connectionState.value = state
            connectionStateListeners.forEach { it.onConnectionStateChanged(state) }
        }
    }

    private fun bytesToHex(bytes: ByteArray?): String {
        if (bytes == null) return ""
        return bytes.joinToString("") { "%02x".format(it) }
    }
}