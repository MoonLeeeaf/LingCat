package io.github.moonleeeaf.lingcat.net

import android.content.Context
import android.util.Log
import io.github.moonleeeaf.lingcat.app.ConnectionKeepAliveService
import io.github.moonleeeaf.lingcat.app.NotificationHelper
import io.github.moonleeeaf.lingcat.data.AccountInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.data.ServerConfig
import io.github.moonleeeaf.lingcat.ui.UiTextException
import io.github.moonleeeaf.lingcat.ui.uiText
import io.github.moonleeeaf.lingcat.data.ServerStorage
import io.github.moonleeeaf.lingcat.data.AuthStorage
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.data.RemarksCache
import io.github.moonleeeaf.lingcat.data.db.AppDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withTimeout
import lingcat.client_protocol.FileApi
import lingcat.client_protocol.LingCatClient
import lingcat.client_protocol.UserApi
import lingcat.protocol.Package
import java.util.UUID
import kotlin.coroutines.resume
import kotlin.coroutines.resumeWithException

object LingCatClientManager {
    private const val TAG = "LingCatClientMgr"
    lateinit var appContext: Context
        private set

    var currentServer: ServerConfig? = null
    private var _currentClient: LingCatClient? = null
    val currentClient: LingCatClient? get() = _currentClient

    var currentToken: String? = null
        private set
    var currentUserId: String? = null
        private set

    private val _fileAccessToken = MutableStateFlow<String?>(null)
    val fileAccessToken: StateFlow<String?> = _fileAccessToken.asStateFlow()

    private var tokenRefreshJob: Job? = null

    private val _connectionState = MutableStateFlow(LingCatClient.ConnectionState.IDLE)
    val connectionState: StateFlow<LingCatClient.ConnectionState> = _connectionState.asStateFlow()

    /** 最近一次连接失败/断开的原因（如 HTTP 530），连接成功或重新发起连接时清空 */
    private val _connectionError = MutableStateFlow<String?>(null)
    val connectionError: StateFlow<String?> = _connectionError.asStateFlow()

    // ★ 全局持久化的事件流（唯一版本）
    private val _globalEvents = MutableSharedFlow<Package>(extraBufferCapacity = 100)
    val globalEvents: SharedFlow<Package> = _globalEvents.asSharedFlow()

    /**
     * 本地数据变化（例如改了群名 / 群头像）时通知对话列表刷新。
     *
     * 服务端的 Update_My_Chats_Event 只在收发消息、创建群、加入群时下发，
     * 修改对话资料不会广播，所以这里补一个只在进程内传播的刷新信号。
     */
    private val _chatListRefresh = MutableSharedFlow<Unit>(extraBufferCapacity = 1)
    val chatListRefresh: SharedFlow<Unit> = _chatListRefresh.asSharedFlow()

    fun notifyChatListChanged() {
        _chatListRefresh.tryEmit(Unit)
    }

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    fun getSavedServers(): List<ServerConfig> {
        return ServerStorage.getAll(appContext)
    }

    private var isAuthorized = false
    /** 当前连接实际授权使用的 token，用来识别「连接被旧账号授权过」的情况。 */
    private var authorizedToken: String? = null
    private val authMutex = Mutex() // ★ 新增防并发锁

    /**
     * 用 [token] 给 [client] 授权。
     *
     * @return 是否授权成功。切换账号等场景必须检查返回值：
     *   授权失败却继续使用旧会话，会继续收到旧账号的消息。
     */
    suspend fun authorize(client: LingCatClient, token: String): Boolean = withContext(Dispatchers.IO) {
        // ★ 核心修复：锁住，保证同一时间只有一个授权在执行
        authMutex.withLock {
            if (client !== _currentClient) return@withLock false
            // 同一连接、同一个 token 才可以直接复用授权结果。
            // 只判断 isAuthorized 会让「旧 token 抢先授权」后新 token 被跳过。
            if (isAuthorized && authorizedToken == token) return@withLock true

            try {
                // 1. 主 WS 授权
                UserApi.authorize(client, token, UUID.randomUUID().toString())

                // 授权期间可能已经切到别的连接，不要把这个结果写到新连接上
                if (client !== _currentClient) return@withLock false
                isAuthorized = true
                authorizedToken = token
                Log.d(TAG, "authorize success, userId=$currentUserId")

                // 2. 同步等待首次获取 fileAccessToken
                try {
                    val newToken = FileApi.requestAccessUploadFileToken(client, token, null, 30_000L)
                    if (client === _currentClient) _fileAccessToken.value = newToken
                } catch (e: Exception) {
                    if (client === _currentClient) _fileAccessToken.value = token
                }

                // 3. 拉取备注
                RemarksCache.reloadForCurrentAccount()
                RemarksCache.fetchFromServer()

                // 4. 开启后台定时任务
                startFileTokenRefresh(client, token)
                true
            } catch (e: Exception) {
                Log.e(TAG, "Authorize failed", e)
                if (client === _currentClient) {
                    isAuthorized = false
                    authorizedToken = null
                }
                false
            }
        }
    }

    private fun startFileTokenRefresh(client: LingCatClient, token: String) {
        tokenRefreshJob?.cancel()
        tokenRefreshJob = CoroutineScope(Dispatchers.IO).launch {
            val refreshInterval = 30 * 60 * 1000L
            while (isActive) {
                delay(refreshInterval)
                try {
                    val newToken = FileApi.requestAccessUploadFileToken(client, token, null, 30_000L)
                    _fileAccessToken.value = newToken
                } catch (e: Exception) {
                    Log.w(TAG, "refresh file token failed", e)
                }
            }
        }
    }

    fun stopFileTokenRefresh() {
        tokenRefreshJob?.cancel()
        tokenRefreshJob = null
        _fileAccessToken.value = null
    }

    suspend fun switchAccount(account: AccountInfo): Result<Unit> = withContext(Dispatchers.IO) {
        val previousToken = currentToken
        val previousUserId = currentUserId
        val previousServer = currentServer
        try {
            val targetServer = getSavedServers().find { it.wsUrl == account.serverWsUrl }
                ?: return@withContext Result.failure(UiTextException(uiText(R.string.error_server_not_found)))
            Log.d(TAG, "switchAccount -> ${account.username} (${account.userId})")
            disconnect()
            isAuthorized = false
            authorizedToken = null
            // 先把旧账号的聊天通知从通知栏撤掉，避免切换过程中被误点
            NotificationHelper.clearAll(appContext)
            // 上一个账号的资料 / 对话 / 备注都是内存缓存，切换时立刻丢弃，
            // 避免新账号的界面在服务器数据回来之前先闪一下旧账号的信息。
            ProfileCache.clearMemory()
            RemarksCache.clearMemory()

            // ★ 必须先切换到新账号的会话，再建立连接。
            // connect() 握手成功后的自动授权会读取 currentToken；
            // 如果这里还留着上一个账号的 token，新连接就会被授权成旧账号，
            // 表现为「切到叶叶后仍然收到月月的消息和通知」。
            setAuthSession(account.token, account.userId)

            val connectRes = connect(targetServer)
            if (connectRes.isFailure) {
                restoreSession(previousToken, previousUserId, previousServer)
                return@withContext connectRes
            }
            val client = currentClient ?: run {
                restoreSession(previousToken, previousUserId, previousServer)
                return@withContext Result.failure(UiTextException(uiText(R.string.error_client_not_ready)))
            }
            if (!authorize(client, account.token)) {
                // 授权失败说明新账号并没有真正登录成功，不能假装切换完成
                disconnect()
                restoreSession(previousToken, previousUserId, previousServer)
                return@withContext Result.failure(UiTextException(uiText(R.string.error_session_expired)))
            }

            // 通知栏里可能还留着上一个账号的会话，切号成功后统一清掉，
            // 避免用户看到旧账号的通知、甚至从通知栏回复到旧账号的对话。
            NotificationHelper.clearAll(appContext)
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(TAG, "switchAccount failed", e)
            disconnect()
            restoreSession(previousToken, previousUserId, previousServer)
            Result.failure(e)
        }
    }

    private fun restoreSession(token: String?, userId: String?, server: ServerConfig?) {
        currentToken = token
        currentUserId = userId
        currentServer = server
        // 切换失败时内存缓存已经被清空，这里把上一个账号的备注重新读回来
        RemarksCache.reloadForCurrentAccount()
    }

    class TofuMismatchException(val oldConfig: ServerConfig, val newConfig: ServerConfig) : Exception("服务器公钥已变更")

    suspend fun addAndVerifyServer(rawUrl: String): Result<ServerConfig> = withContext(Dispatchers.IO) {
        try {
            val config = ServerConfigFetcher.fetch(rawUrl)
            val existing = getSavedServers().find { it.wsUrl == config.wsUrl }
            if (existing != null && existing.publicKeyHex != config.publicKeyHex) {
                return@withContext Result.failure(TofuMismatchException(existing, config))
            }
            ServerStorage.save(appContext, config)
            Result.success(config)
        } catch (e: Exception) {
            Log.e(TAG, "add server failed", e)
            Result.failure(e)
        }
    }

    fun forceSaveServer(config: ServerConfig) {
        ServerStorage.save(appContext, config)
    }

    fun deleteServer(server: ServerConfig) {
        ServerStorage.delete(appContext, server.wsUrl)
        if (currentServer?.wsUrl == server.wsUrl) disconnect()
    }

    fun setAuthSession(token: String, userId: String?) {
        this.currentToken = token
        this.currentUserId = userId
    }

    private var connectingDeferred: kotlinx.coroutines.Deferred<Result<Unit>>? = null
    private var connectingServerUrl: String? = null

    private var bridgeJob: Job? = null

    suspend fun connect(server: ServerConfig): Result<Unit> = withContext(Dispatchers.IO) {
        // 1. 已连接且是同一个服务器，直接返回
        if (_currentClient?.isReady() == true && currentServer?.wsUrl == server.wsUrl) {
            return@withContext Result.success(Unit)
        }

        // 2. 正在连接相同的服务器，等待
        if (connectingServerUrl == server.wsUrl && connectingDeferred != null) {
            Log.d(TAG, "Already connecting to ${server.wsUrl}, waiting for result...")
            return@withContext connectingDeferred!!.await()
        }

        // 3. 取消之前的连接任务
        connectingDeferred?.cancel()

        _connectionError.value = null
        disconnect()
        currentServer = server
        isAuthorized = false // 重置授权标记
        authorizedToken = null
        connectingServerUrl = server.wsUrl

        val deferred = async(Dispatchers.IO) {
            try {
                val publicKeyBytes = hexToBytes(server.publicKeyHex)
                val client = LingCatClient(server.wsUrl, server.httpUrl, publicKeyBytes)

                client.addConnectionStateListener { state ->
                    if (client === _currentClient) {
                        _connectionState.value = state
                        if (state == LingCatClient.ConnectionState.CONNECTED) {
                            _connectionError.value = null
                        }
                    }
                    if (state == LingCatClient.ConnectionState.DISCONNECTED ||
                        state == LingCatClient.ConnectionState.RECONNECTING) {
                        isAuthorized = false // ★ 断开时重置，允许重连后再次授权
                        authorizedToken = null
                    }
                }
                _currentClient = client

                bridgeJob?.cancel()
                bridgeJob = CoroutineScope(Dispatchers.IO).launch {
                    client.events.collect { pkg ->
                        // 切换账号 / 重连时旧 client 可能还有少量缓冲事件，
                        // 不能再转发到当前账号的全局流里。
                        if (client === _currentClient) {
                            _globalEvents.emit(pkg)
                        }
                    }
                }

                // 等待握手成功
                val result = withTimeout(10000L) {
                    suspendCancellableCoroutine<Unit> { cont ->
                        client.setOnInitListener {
                            if (cont.isActive) cont.resume(Unit)

                            // 握手成功后，如果已有 Token，强制重新授权
                            val t = currentToken
                            if (t != null) {
                                CoroutineScope(Dispatchers.IO).launch {
                                    try {
                                        // 这里因为上面断线时重置了 isAuthorized，所以一定会真正发请求
                                        authorize(client, t)
                                        Log.d(TAG, "Auto re-authorized after (re)connect")
                                    } catch (e: Exception) {
                                        Log.e(TAG, "Auto re-authorize failed", e)
                                    }
                                }
                            }
                        }
                        client.setOnHandshakeFailedListener { reason ->
                            if (client === _currentClient) {
                                _connectionError.value = reason
                            }
                            if (cont.isActive) cont.resumeWithException(Exception(reason))
                        }

                        client.init()
                        cont.invokeOnCancellation { client.disconnect() }
                    }
                }
                Result.success(result)
            } catch (e: Exception) {
                Log.e(TAG, "connect failed", e)
                _currentClient?.disconnect()
                _currentClient = null
                _connectionState.value = LingCatClient.ConnectionState.DISCONNECTED
                val detail = e.message?.takeIf { it.isNotBlank() }
                _connectionError.value = detail
                Result.failure(
                    UiTextException(
                        if (detail != null) uiText(R.string.error_network_detail, detail) else uiText(R.string.error_network)
                    )
                )
            } finally {
                if (connectingServerUrl == server.wsUrl) {
                    connectingServerUrl = null
                    connectingDeferred = null
                }
            }
        }

        connectingDeferred = deferred
        deferred.await()
    }

    fun disconnect() {
        stopFileTokenRefresh()
        _currentClient?.disconnect()
        _currentClient = null
        _connectionState.value = LingCatClient.ConnectionState.DISCONNECTED
        isAuthorized = false // ★ 断开时重置授权标记
        authorizedToken = null
        bridgeJob?.cancel() // ★ 断开时也取消
        bridgeJob = null
    }

    fun logout() {
        // getDatabase 依赖 currentUserId，必须在清空登录态之前拿到当前账号的库。
        val accountDb = AppDatabase.getDatabase(appContext)
        stopKeepAliveService()
        disconnect()
        NotificationHelper.clearAll(appContext)
        currentServer = null
        currentToken = null
        currentUserId = null
        AuthStorage.clear(appContext)

        // ★ 核心修复：用后台协程异步清理数据库和缓存
        CoroutineScope(Dispatchers.IO).launch {
            ProfileCache.clearMemory()
            RemarksCache.clearMemory()

            // 把当前账号本地的消息、会话列表、用户资料也一并清空，防止多人共用设备时数据残留
            try {
                accountDb.messageDao().clearMessages()
                accountDb.chatDao().clearChats()
                accountDb.userDao().clearUsers()
            } catch (e: Exception) {
                Log.e(TAG, "clear db on logout failed", e)
            }
        }

        // 清理本地 Keystore 缓存
        appContext.getSharedPreferences("lingcat_e2e_local_keys", Context.MODE_PRIVATE).edit().clear().apply()
    }

    private fun hexToBytes(hex: String): ByteArray {
        val len = hex.length
        val data = ByteArray(len / 2)
        var i = 0
        while (i < len) {
            data[i / 2] = ((Character.digit(hex[i], 16) shl 4) +
                    Character.digit(hex[i + 1], 16)).toByte()
            i += 2
        }
        return data
    }

    fun startKeepAliveService() {
        try {
            val intent = android.content.Intent(appContext, ConnectionKeepAliveService::class.java)
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                appContext.startForegroundService(intent)
            } else {
                appContext.startService(intent)
            }
        } catch (e: Exception) {
            Log.e(TAG, "start service failed", e)
        }
    }

    fun stopKeepAliveService() {
        try {
            val intent = android.content.Intent(appContext, ConnectionKeepAliveService::class.java)
            appContext.stopService(intent)
        } catch (e: Exception) {
            Log.e(TAG, "stop service failed", e)
        }
    }
}