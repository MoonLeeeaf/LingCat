package lingcat.client_protocol;

import android.util.Log;

import com.google.protobuf.ByteString;
import com.goterl.lazysodium.utils.KeyPair;

import lingcat.methods.Methods.HandShake_Request;
import lingcat.methods.Methods.HandShake_Response;
import lingcat.methods.Methods.Ping_Response;
import lingcat.protocol.Methods;
import lingcat.protocol.Package;
import lingcat.protocol.SecureKey;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class LingCatClient {

    private static final String TAG = "LingCatClient";

    private final String serverWs;
    private final String serverHttp;
    private final byte[] serverPublicKey;

    private final OkHttpClient okHttpClient;
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);
    private final Session session = new Session();
    private final Map<String, PendingRequest> pendingRequests = new ConcurrentHashMap<>();
    private final CopyOnWriteArrayList<OnReceiveListener> onReceiveListeners = new CopyOnWriteArrayList<>();

    private volatile WebSocket webSocket;
    private volatile boolean manualDisconnect = false;
    private volatile KeyPair handshakeKeyPair;

    private volatile int reconnectAttempt = 0;
    private volatile ScheduledFuture<?> reconnectTask;

    private volatile ScheduledFuture<?> pingTask;
    private volatile ScheduledFuture<?> pingCheckTask;
    private volatile long lastPongTime = 0;

    private static final long PING_INTERVAL_MS = 30_000;
    private static final long PING_TIMEOUT_MS = 90_000;
    private static final long RECONNECT_BASE_MS = 1_000;
    private static final long RECONNECT_CAP_MS = 30_000;

    private volatile OnInitListener onInitListener;
    private volatile Runnable onAuthFailed;
    private volatile ExecutorCallback executorCallback = Runnable::run;

    /** 保护"取 seq → encrypt → send"三步的原子性 */
    private final Object sendLock = new Object();

    public interface OnReceiveListener {
        void onReceive(Package pkg);
    }

    public interface OnInitListener {
        void onInit();
    }

    /** 用于把 OkHttp 的 IO 线程回调切到主线程 / 工作线程 */
    public interface ExecutorCallback {
        void run(Runnable r);
    }

    public static class Session {
        private byte[] keySend;
        private byte[] keyRecv;
        private long sendSeq = -1L;
        private long recvSeq = -1L;

        public synchronized byte[] getKeySend() { return keySend; }
        public synchronized void setKeySend(byte[] k) { keySend = k; }
        public synchronized byte[] getKeyRecv() { return keyRecv; }
        public synchronized void setKeyRecv(byte[] k) { keyRecv = k; }

        public synchronized long getSendSeq() { return sendSeq; }
        public synchronized void setSendSeq(long v) { sendSeq = v; }
        public synchronized long getRecvSeq() { return recvSeq; }
        public synchronized void setRecvSeq(long v) { recvSeq = v; }

        public synchronized long nextSendSeq() {
            long current = sendSeq < 0 ? 0L : sendSeq;
            long next = (current + 1) & 0xFFFFFFFFL;
            sendSeq = next;
            return current;
        }

        public synchronized void reset() {
            keySend = null;
            keyRecv = null;
            sendSeq = -1L;
            recvSeq = -1L;
        }
    }

    private static class PendingRequest {
        final CompletableFuture<Package> future;
        final ScheduledFuture<?> timeoutTask;
        final int methodId;

        PendingRequest(CompletableFuture<Package> future, ScheduledFuture<?> timeoutTask, int methodId) {
            this.future = future;
            this.timeoutTask = timeoutTask;
            this.methodId = methodId;
        }
    }

    public LingCatClient(String serverWs, String serverHttp, byte[] serverPublicKey) {
        this.serverWs = serverWs;
        this.serverHttp = serverHttp;
        this.serverPublicKey = serverPublicKey;
        this.okHttpClient = HttpClientProvider.get();
    }

    /** 是否已完成握手，可以发业务请求 */
    public boolean isReady() {
        return webSocket != null && session.getKeySend() != null;
    }

    public String getServerHttp()   { return serverHttp; }
    public String getServerWs()     { return serverWs; }
    public OkHttpClient getOkHttpClient() { return okHttpClient; }

    public void setOnInitListener(OnInitListener l) { this.onInitListener = l; }
    public void setOnAuthFailed(Runnable r) { this.onAuthFailed = r; }
    public void setExecutorCallback(ExecutorCallback cb) {
        this.executorCallback = cb != null ? cb : Runnable::run;
    }

    public void addOnReceiveListener(OnReceiveListener l) { onReceiveListeners.add(l); }
    public void removeOnReceiveListener(OnReceiveListener l) { onReceiveListeners.remove(l); }

    public String getFileUrlByHash(String hash) {
        return serverHttp.endsWith("/")
                ? serverHttp + "uploaded_files/" + hash
                : serverHttp + "/uploaded_files/" + hash;
    }

    public String getFileUrlByHashAndToken(String hash, String fileAccessToken) {
        return getFileUrlByHash(hash) + "?file_access_token=" + fileAccessToken;
    }

    public CompletableFuture<Package> invoke(int methodId, byte[] data, int flags, long timeoutMs) {
        byte[] keySend = session.getKeySend();
        if (keySend == null) {
            CompletableFuture<Package> f = new CompletableFuture<>();
            f.completeExceptionally(new IllegalStateException("Client not ready (handshake not done)"));
            return f;
        }
        try {
            synchronized (sendLock) {
                Package.Input in = new Package.Input();
                in.method_id = methodId;
                in.flags = flags;
                in.data = data;

                Package pkg = Package.encode(in)
                        .encrypt(session.nextSendSeq(), keySend);
                return invokeInternal(pkg, timeoutMs);
            }
        } catch (Exception e) {
            Log.e(TAG, "invoke: encrypt failed", e);
            CompletableFuture<Package> f = new CompletableFuture<>();
            f.completeExceptionally(e);
            return f;
        }
    }

    public CompletableFuture<Package> invokeUnencrypted(int methodId, byte[] data, int flags, long timeoutMs) {
        Package.Input in = new Package.Input();
        in.method_id = methodId;
        in.flags = flags;
        in.data = data;

        Package pkg = Package.encode(in);
        return invokeInternal(pkg, timeoutMs);
    }

    private CompletableFuture<Package> invokeInternal(Package pkg, long timeoutMs) {
        CompletableFuture<Package> future = new CompletableFuture<>();
        String requestId = bytesToHex(pkg.request_id);
        int methodId = pkg.method_id;

        ScheduledFuture<?> timeoutTask = scheduler.schedule(() -> {
            PendingRequest removed = pendingRequests.remove(requestId);
            if (removed != null) {
                Log.w(TAG, "request timeout: " + Methods.getMethodName(methodId)
                        + " reqId=" + requestId);
                removed.future.completeExceptionally(new TimeoutException(
                        "Request timeout " + timeoutMs + "ms (" + Methods.getMethodName(methodId) + ")"));
            }
        }, timeoutMs, TimeUnit.MILLISECONDS);

        pendingRequests.put(requestId, new PendingRequest(future, timeoutTask, methodId));

        WebSocket ws = this.webSocket;
        if (ws == null) {
            pendingRequests.remove(requestId);
            timeoutTask.cancel(false);
            future.completeExceptionally(new IOException("WebSocket not connected"));
            return future;
        }

        boolean sent = ws.send(okio.ByteString.of(pkg.toBuffer()));
        if (!sent) {
            pendingRequests.remove(requestId);
            timeoutTask.cancel(false);
            future.completeExceptionally(new IOException("WebSocket send failed"));
            return future;
        }

        Log.d(TAG, "invoke sent: " + Methods.getMethodName(methodId) + " reqId=" + requestId);
        return future;
    }

    private void startPing() {
        stopPing();
        lastPongTime = System.currentTimeMillis();

        pingTask = scheduler.scheduleAtFixedRate(() -> {
            WebSocket ws = this.webSocket;
            byte[] keySend = session.getKeySend();
            if (ws == null || keySend == null) return;
            try {
                byte[] pingData = lingcat.methods.Methods.Ping_Request.newBuilder()
                        .setTime(System.currentTimeMillis())
                        .build().toByteArray();

                synchronized (sendLock) {
                    Package.Input in = new Package.Input();
                    in.method_id = Methods.Ping_Request;
                    in.flags = 0;
                    in.data = pingData;

                    Package pkt = Package.encode(in)
                            .encrypt(session.nextSendSeq(), keySend);
                    ws.send(okio.ByteString.of(pkt.toBuffer()));
                }
            } catch (Exception e) {
                Log.w(TAG, "ping failed", e);
            }
        }, PING_INTERVAL_MS, PING_INTERVAL_MS, TimeUnit.MILLISECONDS);

        pingCheckTask = scheduler.scheduleAtFixedRate(() -> {
            long silent = System.currentTimeMillis() - lastPongTime;
            if (silent > PING_TIMEOUT_MS) {
                Log.w(TAG, "ping timeout (" + silent + "ms silent), closing");
                WebSocket ws = this.webSocket;
                if (ws != null) {
                    try { ws.close(4000, "ping timeout"); } catch (Exception ignored) { }
                }
            }
        }, 15_000, 15_000, TimeUnit.MILLISECONDS);
    }

    private void stopPing() {
        ScheduledFuture<?> p = pingTask;
        if (p != null) { p.cancel(false); pingTask = null; }
        ScheduledFuture<?> c = pingCheckTask;
        if (c != null) { c.cancel(false); pingCheckTask = null; }
    }

    private void rejectAllPending(String reason) {
        for (Map.Entry<String, PendingRequest> e : pendingRequests.entrySet()) {
            PendingRequest p = e.getValue();
            p.timeoutTask.cancel(false);
            p.future.completeExceptionally(new IOException(
                    reason + " (" + Methods.getMethodName(p.methodId) + ")"));
        }
        pendingRequests.clear();
    }

    private void scheduleReconnect() {
        if (manualDisconnect) return;
        if (reconnectTask != null && !reconnectTask.isDone()) return;

        long exp = Math.min(RECONNECT_BASE_MS * (1L << Math.min(reconnectAttempt, 5)), RECONNECT_CAP_MS);
        long jitter = Math.round(exp * (0.75 + Math.random() * 0.5));

        reconnectAttempt++;
        Log.i(TAG, "reconnect in " + jitter + "ms (attempt " + reconnectAttempt + ")");

        reconnectTask = scheduler.schedule(() -> {
            reconnectTask = null;
            if (manualDisconnect) return;
            init();
        }, jitter, TimeUnit.MILLISECONDS);
    }

    private void cancelReconnect() {
        ScheduledFuture<?> t = reconnectTask;
        if (t != null) { t.cancel(false); reconnectTask = null; }
    }

    public void init() {
        if (this.webSocket != null) {
            Log.w(TAG, "init() called but webSocket already exists, skip");
            return;
        }
        Log.i(TAG, "init() called, ws url = " + serverWs);
        this.manualDisconnect = false;
        cancelReconnect();

        Request request = new Request.Builder().url(serverWs).build();

        this.webSocket = okHttpClient.newWebSocket(request, new WebSocketListener() {

            @Override
            public void onOpen(WebSocket ws, Response response) {
                Log.i(TAG, "onOpen! ws=" + serverWs + " code=" + response.code());
                try {
                    KeyPair kp = SecureKey.All_generateExchangeKeyPair();
                    Log.i(TAG, "onOpen: keypair generated, pub="
                            + bytesToHex(kp.getPublicKey().getAsBytes()).substring(0, 16) + "...");
                    handshakeKeyPair = kp;
                    byte[] clientPublicKey = kp.getPublicKey().getAsBytes();

                    HandShake_Request handshake = HandShake_Request.newBuilder()
                            .setClientPublicKey(ByteString.copyFrom(clientPublicKey))
                            .build();

                    Package.Input in = new Package.Input();
                    in.method_id = Methods.HandShake_Request;
                    in.flags = 0;
                    in.data = handshake.toByteArray();

                    Package pkg = Package.encode(in);
                    byte[] buf = pkg.toBuffer();
                    Log.i(TAG, "onOpen: sending HandShake_Request, " + buf.length + " bytes");

                    boolean sent = ws.send(okio.ByteString.of(buf));
                    Log.i(TAG, "onOpen: ws.send returned " + sent);
                } catch (Exception e) {
                    Log.e(TAG, "onOpen: handshake init failed", e);
                    ws.close(4002, "handshake init failed");
                }
            }

            @Override
            public void onMessage(WebSocket ws, okio.ByteString bytes) {
                Log.i(TAG, "onMessage: " + bytes.size() + " bytes");
                byte[] raw = bytes.toByteArray();
                executorCallback.run(() -> handleMessage(raw));
            }

            @Override
            public void onMessage(WebSocket ws, String text) {
                Log.w(TAG, "onMessage: got text frame (unexpected): " + text);
            }

            @Override
            public void onClosing(WebSocket ws, int code, String reason) {
                Log.w(TAG, "onClosing: code=" + code + " reason=" + reason);
                ws.close(1000, null);
            }

            @Override
            public void onClosed(WebSocket ws, int code, String reason) {
                Log.w(TAG, "onClosed: code=" + code + " reason=" + reason);
                handleDisconnected(code, reason);
            }

            @Override
            public void onFailure(WebSocket ws, Throwable t, Response response) {
                Log.e(TAG, "onFailure: " + t + " (response="
                        + (response != null ? response.code() : "null") + ")", t);
                handleFailure(t);
            }
        });
    }

    public void disconnect() {
        Log.i(TAG, "disconnect() called");
        manualDisconnect = true;
        cancelReconnect();
        stopPing();
        rejectAllPending("Client disconnected");
        session.reset();
        handshakeKeyPair = null;

        WebSocket ws = this.webSocket;
        this.webSocket = null;
        if (ws != null) {
            try { ws.close(1000, "manual disconnect"); } catch (Exception ignored) { }
        }
    }

    private void handleMessage(byte[] raw) {
        Log.d(TAG, "handleMessage: raw " + raw.length + " bytes");
        try {
            byte[] keyRecv = session.getKeyRecv();

            // 先解出明文包头，判断是否为加密包
            Package header = Package.decode(raw, null, null);
            Log.d(TAG, "handleMessage: header method=" + header.method_id
                    + " flags=" + header.flags + " seq=" + header.seq
                    + " requestId=" + bytesToHex(header.request_id));

            boolean encrypted = (header.flags & Package.FLAG_ENCRYPTED) != 0;
            if (encrypted && keyRecv == null) {
                throw new IllegalStateException(
                        "Received encrypted package but no session key (method_id="
                                + Methods.getMethodName(header.method_id) + ")");
            }

            Package pkg = encrypted
                    ? Package.decode(raw, keyRecv, session.getRecvSeq())
                    : header;

            // 更新 lastPongTime：任何包都算活着
            lastPongTime = System.currentTimeMillis();

            if (pkg.seq >= 0) {
                session.setRecvSeq(pkg.seq);
            }

            switch (pkg.method_id) {
                case Methods.HandShake_Response:
                    handleHandshakeResponse(pkg);
                    break;
                case Methods.Ping_Response:
                    try {
                        Ping_Response ping = Ping_Response.parseFrom(pkg.data);
                        Log.d(TAG, "Ping_Response: usage=" + ping.getUsage() + "ms");
                    } catch (Exception e) {
                        Log.w(TAG, "Ping_Response parse failed", e);
                    }
                    break;
                default:
                    break;
            }

            // 请求响应匹配
            String requestId = bytesToHex(pkg.request_id);
            PendingRequest pending = pendingRequests.remove(requestId);
            if (pending != null) {
                Log.d(TAG, "handleMessage: matched pending request "
                        + Methods.getMethodName(pending.methodId));
                pending.timeoutTask.cancel(false);
                pending.future.complete(pkg);
            } else {
                Log.d(TAG, "handleMessage: no pending request matches reqId=" + requestId);
            }

            // 全局事件分发
            for (OnReceiveListener l : onReceiveListeners) {
                try {
                    l.onReceive(pkg);
                } catch (Exception e) {
                    Log.e(TAG, "onReceiveListener error", e);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "handleMessage error", e);
        }
    }

    private void handleHandshakeResponse(Package pkg) {
        Log.i(TAG, "handleHandshakeResponse: entered");
        KeyPair kp = handshakeKeyPair;
        if (kp == null) {
            Log.e(TAG, "handshake response without pending keypair");
            return;
        }

        try {
            HandShake_Response res = HandShake_Response.parseFrom(pkg.data);
            Log.d(TAG, "handleHandshakeResponse: parsed, serverPub="
                    + bytesToHex(res.getServerPublicKey().toByteArray()).substring(0, 16)
                    + "..., saltLen=" + res.getSalt().size()
                    + ", msgToVerifyLen=" + res.getMessageToBeVerify().size());

            boolean verified = SecureKey.Client_checkSignedMessage(
                    res.getMessageToBeVerify().toByteArray(),
                    res.getServerPublicKey().toByteArray(),
                    kp.getPublicKey().getAsBytes(),
                    serverPublicKey
            );
            Log.i(TAG, "handleHandshakeResponse: signature verified=" + verified);

            if (!verified) {
                Log.e(TAG, "server verification failed, closing connection");
                WebSocket ws = this.webSocket;
                if (ws != null) ws.close(4001, "handshake verify failed");
                return;
            }

            byte[] shared = SecureKey.All_getSharedSecret(
                    kp.getSecretKey().getAsBytes(),
                    res.getServerPublicKey().toByteArray()
            );
            SecureKey.ClientSessionKeys keys = SecureKey.Client_hkdf(shared, res.getSalt().toByteArray());
            Arrays.fill(shared, (byte) 0);

            session.setKeyRecv(keys.keyRecv);
            session.setKeySend(keys.keySend);
            session.setSendSeq(-1L);
            session.setRecvSeq(-1L);

            handshakeKeyPair = null;
            reconnectAttempt = 0;

            Log.i(TAG, "handshake complete, session keys established");

            startPing();
            OnInitListener l = onInitListener;
            if (l != null) l.onInit();

        } catch (Exception e) {
            Log.e(TAG, "handshake handling error", e);
            WebSocket ws = this.webSocket;
            if (ws != null) ws.close(4002, "handshake parse failed");
        }
    }

    private void handleDisconnected(int code, String reason) {
        Log.i(TAG, "closed: code=" + code + " reason=" + reason);

        stopPing();
        rejectAllPending("Connection closed");
        session.reset();
        handshakeKeyPair = null;
        webSocket = null;

        if (manualDisconnect) {
            Log.d(TAG, "manual disconnect, no reconnect");
            return;
        }
        if (code == 1000) {
            Log.d(TAG, "normal close, no reconnect");
            return;
        }
        if (code == 1008) {
            Log.d(TAG, "policy violation close, no reconnect");
            return;
        }
        if (code == 4001) {
            Log.w(TAG, "auth failed close, triggering onAuthFailed");
            Runnable cb = onAuthFailed;
            if (cb != null) cb.run();
            return;
        }
        Log.i(TAG, "scheduling reconnect due to close code " + code);
        scheduleReconnect();
    }

    private void handleFailure(Throwable t) {
        Log.e(TAG, "failure: " + t, t);

        stopPing();
        rejectAllPending("Connection failure");
        session.reset();
        handshakeKeyPair = null;
        webSocket = null;

        if (manualDisconnect) {
            Log.d(TAG, "manual disconnect, no reconnect");
            return;
        }
        Log.i(TAG, "scheduling reconnect due to failure");
        scheduleReconnect();
    }

    private static String bytesToHex(byte[] bytes) {
        if (bytes == null) return "";
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(Character.forDigit((b >> 4) & 0xF, 16));
            sb.append(Character.forDigit(b & 0xF, 16));
        }
        return sb.toString();
    }
}