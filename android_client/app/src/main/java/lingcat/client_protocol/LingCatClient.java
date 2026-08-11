package lingcat.client_protocol;

import android.util.Log;

import androidx.annotation.NonNull;

import com.google.protobuf.ByteString;
import com.goterl.lazysodium.utils.KeyPair;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

import lingcat.protocol.Methods;
import lingcat.protocol.Package;
import lingcat.protocol.SecureKey;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

import lingcat.methods.Methods.HandShake_Request;
import lingcat.methods.Methods.HandShake_Response;
import lingcat.methods.Methods.Ping_Response;

public class LingCatClient {
    private static final String TAG = "LingCatClient";
    private final String serverWs;
    private final String serverHttp;
    private final byte[] serverPublicKey;

    private WebSocket webSocket;
    private OkHttpClient okHttpClient;

    private byte[] keySend;
    private byte[] keyRecv;
    private int recvSeq = -999;
    private int sendSeq = -999;

    private final Map<ByteBuffer, CompletableFuture<Package>> pendingRequests = new HashMap<>();
    private final Object pendingLock = new Object();

    private final List<OnReceiveListener> onReceiveListeners = new ArrayList<>();
    private final Object listenerLock = new Object();

    private final List<OnPackageListener> onPackageListeners = new ArrayList<>();
    private final Object packageLock = new Object();

    private final List<WebSocketListener> onWebSocketEventListeners = new ArrayList<>();
    private final Object websocketEventLock = new Object();

    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    private boolean isReconnecting = false;

    // 构造函数
    public LingCatClient(String serverWs, String serverHttp, byte[] serverPublicKey) {
        this.serverWs = serverWs;
        this.serverHttp = serverHttp;
        this.serverPublicKey = serverPublicKey;
        this.okHttpClient = new OkHttpClient.Builder()
                .build();
    }

    public String getFileUrlByHash(String hash) {
        return serverHttp.endsWith("/")
                ? serverHttp + "uploaded_files/" + hash
                : serverHttp + "/uploaded_files/" + hash;
    }

    public CompletableFuture<Package> invoke(int methodId, byte[] data, int flags, int timeoutMs) throws Exception {
        return invokeInternal(
                Package.encode(methodId, flags, data)
                        .encrypt(sendSeq++, keySend),
                timeoutMs);
    }

    public CompletableFuture<Package> invokeUnEncrypted(int methodId, byte[] data, int flags, int timeoutMs) {
        return invokeInternal(
                Package.encode(methodId, flags, data),
                timeoutMs);
    }

    private CompletableFuture<Package> invokeInternal(Package pkg, int timeoutMs) {
        ByteBuffer requestId = ByteBuffer.wrap(pkg.getRequestId());

        CompletableFuture<Package> future = new CompletableFuture<>();
        OnPackageListener listener = (p) -> {
            if (ByteBuffer.wrap(p.getRequestId()).equals(requestId)) {
                synchronized (packageLock) {
                    onPackageListeners.remove(this);
                }
                future.complete(p);
            }
        };

        synchronized (packageLock) {
            onPackageListeners.add(listener);
        }

        // 发送
        if (webSocket != null) {
            webSocket.send(okio.ByteString.of(pkg.toBuffer()));
        } else {
            future.completeExceptionally(new IOException("WebSocket not connected"));
            return future;
        }

        Log.d(TAG, String.format("[发] Method: %s | Flags: %d | Data length: %d | Request ID: %s",
                Methods.getMethodName(pkg.getMethodId()), pkg.getFlags(), pkg.getLength(),
                bytesToHex(pkg.getRequestId())));

        if (timeoutMs > 0) {
            scheduler.schedule(() -> {
                if (!future.isDone()) {
                    future.completeExceptionally(new java.util.concurrent.TimeoutException(
                            "Request timeout " + timeoutMs + "ms"));
                    synchronized (packageLock) {
                        onPackageListeners.remove(listener);
                    }
                }
            }, timeoutMs, TimeUnit.MILLISECONDS);
        }

        return future;
    }

    public interface OnReceiveListener {
        void onReceive(Package pkg);
    }

    public void addOnReceiveListener(OnReceiveListener listener) {
        synchronized (listenerLock) {
            onReceiveListeners.add(listener);
        }
    }

    public void removeOnReceiveListener(OnReceiveListener listener) {
        synchronized (listenerLock) {
            onReceiveListeners.remove(listener);
        }
    }

    public void addWebSocketListener(WebSocketListener listener) {
        synchronized (websocketEventLock) {
            onWebSocketEventListeners.add(listener);
        }
    }

    public void removeWebSocketListener(WebSocketListener listener) {
        synchronized (websocketEventLock) {
            onWebSocketEventListeners.remove(listener);
        }
    }

    public void init() {
        if (webSocket != null)
            return;

        Request request = new Request.Builder()
                .url(serverWs)
                .build();

        webSocket = okHttpClient.newWebSocket(request, new WebSocketListener() {
            private KeyPair tempKeyPair;

            @Override
            public void onOpen(@NonNull WebSocket webSocket, @NonNull Response response) {
                Log.d(TAG, "WebSocket opened");
                tempKeyPair = SecureKey.All_generateExchangeKeyPair();

                HandShake_Request handshake = HandShake_Request.newBuilder()
                        .setClientPublicKey(ByteString.copyFrom(tempKeyPair.getPublicKey().getAsBytes()))
                        .build();

                Package handshakePkg = Package.encode(
                        Methods.HandShake_Request,
                        0,
                        handshake.toByteArray());

                webSocket.send(okio.ByteString.of(handshakePkg.toBuffer()));

                onWebSocketEventListeners.forEach((v) -> v.onOpen(webSocket, response));
            }

            @Override
            public void onMessage(@NonNull WebSocket webSocket, @NonNull okio.ByteString bytes) {
                try {
                    Package pkg = Package.decode(bytes.toByteArray(), keyRecv, recvSeq);
                    recvSeq = pkg.getSeq();

                    boolean isEncrypted = pkg.isDecrypted();
                    Log.d(TAG, String.format("[收] Method: %s | Flags: %d | Data length: %d | Request ID: %s",
                            Methods.getMethodName(pkg.getMethodId()), pkg.getFlags(), pkg.getLength(),
                            bytesToHex(pkg.getRequestId())));

                    if (pkg.getMethodId() == Methods.HandShake_Response) {
                        HandShake_Response res = HandShake_Response.parseFrom(pkg.getData());

                        boolean verified = SecureKey.Client_checkSignedMessage(
                                res.getMessageToBeVerify().toByteArray(),
                                res.getServerPublicKey().toByteArray(),
                                tempKeyPair.getPublicKey().getAsBytes(),
                                serverPublicKey);

                        if (verified) {
                            Log.d(TAG, "[Client] Server verified!");
                            sendSeq = 0;
                            recvSeq = -1;

                            byte[] sharedSecret = SecureKey.All_getSharedSecret(
                                    res.getServerPublicKey().toByteArray(),
                                    tempKeyPair.getSecretKey().getAsBytes());

                            SecureKey.ClientSessionKeys keys = SecureKey.Client_hkdf(sharedSecret,
                                    res.getSalt().toByteArray());
                            keyRecv = keys.keyRecv;
                            keySend = keys.keySend;

                            java.util.Arrays.fill(sharedSecret, (byte) 0);

                            synchronized (initLock) {
                                for (OnInitListener listener : initListeners) {
                                    listener.onInit();
                                }
                            }
                        } else {
                            Log.e(TAG, "Server verification failed!");
                        }
                    }

                    if (pkg.getMethodId() == Methods.Ping_Response) {
                        Ping_Response pingRes = Ping_Response.parseFrom(pkg.getData());
                        Log.d(TAG, "[Client] Server recv time: " + pingRes.getUsage() + "ms");
                    }

                    synchronized (packageLock) {
                        for (OnPackageListener listener : onPackageListeners) {
                            listener.onReceive(pkg);
                        }
                    }

                    synchronized (listenerLock) {
                        for (OnReceiveListener listener : onReceiveListeners) {
                            listener.onReceive(pkg);
                        }
                    }

                } catch (Exception e) {
                    Log.e(TAG, "Error processing message", e);
                }
                onWebSocketEventListeners.forEach((v) -> v.onMessage(webSocket, bytes));
            }

            @Override
            public void onClosing(@NonNull WebSocket webSocket, int code, @NonNull String reason) {
                webSocket.close(1000, null);
                onWebSocketEventListeners.forEach((v) -> v.onClosing(webSocket, code, reason));
            }

            @Override
            public void onClosed(@NonNull WebSocket webSocket, int code, @NonNull String reason) {
                Log.d(TAG, "WebSocket closed");
                cleanupAndReconnect();
                onWebSocketEventListeners.forEach((v) -> v.onClosed(webSocket, code, reason));
            }

            @Override
            public void onFailure(@NonNull WebSocket webSocket, @NonNull Throwable t, Response response) {
                Log.e(TAG, "WebSocket failure", t);
                cleanupAndReconnect();
                onWebSocketEventListeners.forEach((v) -> v.onFailure(webSocket, t, response));
            }

        });
    }

    private void cleanupAndReconnect() {
        synchronized (pendingLock) {
            for (CompletableFuture<Package> future : pendingRequests.values()) {
                if (!future.isDone()) {
                    future.completeExceptionally(new IOException("WebSocket disconnected"));
                }
            }
            pendingRequests.clear();
        }

        synchronized (packageLock) {
            onPackageListeners.clear();
        }

        webSocket = null;
        if (!isReconnecting) {
            isReconnecting = true;
            // 延迟重连
            scheduler.schedule(() -> {
                isReconnecting = false;
                init();
            }, 1000, TimeUnit.MILLISECONDS);
        }
    }

    public void disconnect() {
        if (webSocket != null) {
            webSocket.close(1000, "manual close");
            webSocket = null;
        }
    }

    private final List<OnInitListener> initListeners = new ArrayList<>();
    private final Object initLock = new Object();

    public interface OnInitListener {
        public void onInit();
    }

    public void addOnInitListener(OnInitListener listener) {
        synchronized (initLock) {
            initListeners.add(listener);
        }
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    private interface OnPackageListener {
        void onReceive(Package pkg);
    }

    public String getServerWs() {
        return serverWs;
    }

    public String getServerHttp() {
        return serverHttp;
    }

    public byte[] getServerPublicKey() {
        return serverPublicKey;
    }
}
