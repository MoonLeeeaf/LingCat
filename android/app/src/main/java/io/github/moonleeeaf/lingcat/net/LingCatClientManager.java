package io.github.moonleeeaf.lingcat.net;

import android.content.Context;
import android.util.Log;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ProfileCache;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import lingcat.client_protocol.FileApi;
import lingcat.client_protocol.LingCatClient;

/**
 * 会话作用域的单例：管理一个"当前活跃"的 LingCatClient。
 *
 * 生命周期：
 *   - 用户点服务器 → connectTo(server) → 建连 + 握手
 *   - 登录 + authorize → getCurrent() 被上层持续复用
 *   - 登出 / 切服务器 → disconnect() → 重新走上面
 *
 * 单活跃：同一时刻只持有一个连接。切服务器时旧连接先断。
 */
public class LingCatClientManager {

    private static final String TAG = "LingCatClientMgr";
    private static final long HANDSHAKE_TIMEOUT_MS = 15_000L;

    private volatile String fileAccessToken;
    private volatile ScheduledFuture<?> fileTokenRefreshTask;

    private static final long FILE_TOKEN_REFRESH_MS = 30 * 60 * 1000L;  // 30 分钟

    private static volatile LingCatClientManager instance;

    public static LingCatClientManager getInstance() {
        LingCatClientManager i = instance;
        if (i == null) {
            throw new IllegalStateException(
                    "LingCatClientManager 未初始化，请在 Application.onCreate 里调 init()");
        }
        return i;
    }

    public static void init(Context appContext) {
        if (instance == null) {
            synchronized (LingCatClientManager.class) {
                if (instance == null) {
                    instance = new LingCatClientManager(appContext.getApplicationContext());
                }
            }
        }
    }

    // ============================================================
    //                      实例字段
    // ============================================================

    private final Context appContext;
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    private volatile LingCatClient current;
    private volatile ServerConfig currentServer;
    private volatile String currentSessionId;
    private volatile CompletableFuture<LingCatClient> pendingConnect;

    private LingCatClientManager(Context ctx) {
        this.appContext = ctx;
    }

    // ============================================================
    //                      对外 API
    // ============================================================

    public LingCatClient getCurrent() {
        return current;
    }

    public ServerConfig getCurrentServer() {
        return currentServer;
    }

    public String getSessionId() {
        return currentSessionId;
    }

    public boolean isConnected() {
        return current != null;
    }

    /**
     * 连接到指定服务器并完成握手。
     *
     * 语义：
     *   - 若已连同一个 server 且握手未失败，直接返回已有 future（幂等）
     *   - 若连的是不同 server，先断开旧的
     *   - 返回的 future 完成时，握手已成功，可直接调业务 API
     *
     * 线程：任意线程调用；回调在任意线程执行（调用方自己切回主线程）
     */
    public CompletableFuture<LingCatClient> connectTo(ServerConfig server) {
        if (server == null) {
            CompletableFuture<LingCatClient> f = new CompletableFuture<>();
            f.completeExceptionally(new IllegalArgumentException("server is null"));
            return f;
        }

        synchronized (this) {
            // 幂等：同一个 server 且已连好 → 复用
            // 幂等：同一个 server 且已连好 → 复用
            if (current != null
                    && currentServer != null
                    && server.url.equals(currentServer.url)
                    && pendingConnect == null
                    && current.isReady()) {              // ← 加这一句
                CompletableFuture<LingCatClient> f = new CompletableFuture<>();
                f.complete(current);
                return f;
            }
            // 已有连接（不同 server）→ 先断
            if (current != null) {
                disconnectInternal();
            }

            // 已有 pending → 取消
            if (pendingConnect != null && !pendingConnect.isDone()) {
                pendingConnect.completeExceptionally(
                        new IOException("Superseded by a new connectTo() call"));
            }

            final CompletableFuture<LingCatClient> future = new CompletableFuture<>();
            pendingConnect = future;

            byte[] pubKeyBytes = server.getPublicKeyBytes();
            if (pubKeyBytes == null) {
                pendingConnect = null;
                future.completeExceptionally(new IOException(
                        "服务器缺少公钥，无法建立加密连接"));
                return future;
            }

            String wsUrl   = server.getWsUrl();
            String httpUrl = server.getHttpUrl();
            String sessionId = UUID.randomUUID().toString();

            Log.i(TAG, "connecting to " + wsUrl + " (session=" + sessionId + ")");

            final LingCatClient client = new LingCatClient(wsUrl, httpUrl, pubKeyBytes);
            // 注意：init() 之后才真正建立连接

            // 握手完成 → 成功
            client.setOnInitListener(() -> {
                synchronized (LingCatClientManager.this) {
                    if (pendingConnect != future) { client.disconnect(); return; }
                    current = client;
                    currentServer = server;
                    currentSessionId = sessionId;
                    pendingConnect = null;
                }
                Log.i(TAG, "handshake done: " + wsUrl);
                future.complete(client);

                // 后台拉 file_access_token 并开始定时刷新
                startFileTokenRefresh(server, client, sessionId);
                autoAuthorize(client, server);
            });

            // 服务器拒绝（4001） → 未来视作失败
            client.setOnAuthFailed(() -> {
                synchronized (LingCatClientManager.this) {
                    if (pendingConnect == future) {
                        pendingConnect = null;
                    }
                }
                future.completeExceptionally(new SecurityException(
                        "服务端拒绝连接（握手验证失败 / 鉴权失败）"));
            });

            // 启动连接
            current = client;   // 暂存，让断开时能拿到
            currentServer = server;
            currentSessionId = sessionId;
            client.init();

            // 握手超时
            final ScheduledFuture<?> timeoutTask = scheduler.schedule(() -> {
                if (!future.isDone()) {
                    future.completeExceptionally(
                            new TimeoutException("握手超时（" + HANDSHAKE_TIMEOUT_MS + "ms）"));
                    synchronized (LingCatClientManager.this) {
                        if (pendingConnect == future) pendingConnect = null;
                        if (current == client) {
                            client.disconnect();
                            current = null;
                            currentServer = null;
                            currentSessionId = null;
                        }
                    }
                }
            }, HANDSHAKE_TIMEOUT_MS, TimeUnit.MILLISECONDS);

            future.whenComplete((c, e) -> timeoutTask.cancel(false));

            return future;
        }
    }

    private void autoAuthorize(LingCatClient client, ServerConfig server) {
        scheduler.execute(() -> {
            try {
                Account acc = AppDataStore.data().getActiveAccount(server.url);
                if (acc == null || acc.accessToken == null) return;
                String sessionId = currentSessionId;
                lingcat.client_protocol.UserApi.authorize(
                        client, acc.accessToken, sessionId, 15_000L);
                Log.i(TAG, "auto authorize done after reconnect");
            } catch (Exception e) {
                Log.w(TAG, "auto authorize failed", e);
            }
        });
    }

    /**
     * 主动断开当前连接。幂等。
     */
    public void disconnect() {
        synchronized (this) {
            disconnectInternal();
        }
    }

    private void disconnectInternal() {
        ProfileCache.clearAll();
        stopFileTokenRefresh();
        favouritedChatIds.clear();
        LingCatClient c = current;
        if (c != null) {
            try { c.disconnect(); } catch (Exception ignored) {}
        }
        current = null;
        currentServer = null;
        currentSessionId = null;

        if (pendingConnect != null && !pendingConnect.isDone()) {
            pendingConnect.completeExceptionally(new IOException("Disconnected"));
        }
        pendingConnect = null;
    }

    // ============================================================
//                      收藏缓存
// ============================================================

    private final java.util.Set<String> favouritedChatIds =
            java.util.Collections.synchronizedSet(new java.util.HashSet<>());
    private final CopyOnWriteArrayList<OnFavouritesChangedListener> favListeners =
            new CopyOnWriteArrayList<>();

    public interface OnFavouritesChangedListener {
        void onFavouritesChanged();
    }

    public void addOnFavouritesChangedListener(OnFavouritesChangedListener l) {
        favListeners.add(l);
    }

    public void removeOnFavouritesChangedListener(OnFavouritesChangedListener l) {
        favListeners.remove(l);
    }

    public boolean isFavourited(String chatId) {
        return chatId != null && favouritedChatIds.contains(chatId);
    }

    /** 手动更新一个 chat 的收藏状态（setChatFavourited 成功后调用） */
    public void setFavourited(String chatId, boolean favourited) {
        if (chatId == null) return;
        if (favourited) favouritedChatIds.add(chatId);
        else favouritedChatIds.remove(chatId);
        notifyFavouritesChanged();
    }

    /**
     * 从服务端拉一次收藏列表填充缓存。
     * 在 MainActivity.onCreate / 切账号后 / 收到 Update_My_Chats_Event 时调用。
     */
    public void refreshFavourites() {
        final LingCatClient c = current;
        final ServerConfig s = currentServer;
        if (c == null || s == null) return;

        scheduler.execute(() -> {
            try {
                Account acc = AppDataStore.data().getActiveAccount(s.url);
                if (acc == null || acc.accessToken == null) return;

                java.util.List<lingcat.classes.Classes.IChat> fav =
                        lingcat.client_protocol.ChatApi.getMyFavouriteChats(
                                c, acc.accessToken, null, null, 15_000L);

                synchronized (favouritedChatIds) {
                    favouritedChatIds.clear();
                    for (lingcat.classes.Classes.IChat f : fav) {
                        favouritedChatIds.add(f.getId());
                    }
                }
                notifyFavouritesChanged();
                Log.i(TAG, "favourites refreshed: " + favouritedChatIds.size());
            } catch (Exception e) {
                Log.w(TAG, "refreshFavourites failed", e);
            }
        });
    }

    private void notifyFavouritesChanged() {
        for (OnFavouritesChangedListener l : favListeners) {
            try { l.onFavouritesChanged(); } catch (Exception ignored) {}
        }
    }

    // ============================================================
//                      file_access_token
// ============================================================

    public String getFileAccessToken() {
        return fileAccessToken;
    }

    private void startFileTokenRefresh(ServerConfig server, LingCatClient client, String sessionId) {
        stopFileTokenRefresh();
        // 第一次异步拉
        refreshFileTokenOnce(server, client, sessionId);
        // 每 30 分钟刷新
        fileTokenRefreshTask = scheduler.scheduleAtFixedRate(
                () -> refreshFileTokenOnce(server, client, sessionId),
                FILE_TOKEN_REFRESH_MS, FILE_TOKEN_REFRESH_MS, TimeUnit.MILLISECONDS);
    }

    public interface OnFileTokenChangedListener {
        void onFileTokenChanged(String token);
    }

    private final java.util.concurrent.CopyOnWriteArrayList<OnFileTokenChangedListener> fileTokenListeners
            = new java.util.concurrent.CopyOnWriteArrayList<>();

    public void addOnFileTokenChangedListener(OnFileTokenChangedListener l) {
        fileTokenListeners.add(l);
    }

    public void removeOnFileTokenChangedListener(OnFileTokenChangedListener l) {
        fileTokenListeners.remove(l);
    }

    private void refreshFileTokenOnce(ServerConfig server, LingCatClient client, String sessionId) {
        scheduler.execute(() -> {
            try {
                // 从 DataStore 拿当前活跃账号的 token
                Account acc = AppDataStore.data().getActiveAccount(server.url);
                if (acc == null || acc.accessToken == null) return;

                String t = FileApi.requestAccessUploadFileToken(
                        client, acc.accessToken, null, 15_000L);

                // 确认连接未变（防止已切服务器后旧的回填）
                if (current == client && currentServer != null
                        && server.url.equals(currentServer.url)) {
                    boolean changed = !t.equals(fileAccessToken);
                    fileAccessToken = t;
                    Log.i(TAG, "file_access_token refreshed, len=" + t.length());
                    if (changed) {
                        for (OnFileTokenChangedListener l : fileTokenListeners) {
                            try { l.onFileTokenChanged(t); } catch (Exception ignored) {}
                        }
                    }
                }
            } catch (Exception e) {
                Log.w(TAG, "file_access_token refresh failed", e);
            }
        });
    }

    private void stopFileTokenRefresh() {
        ScheduledFuture<?> t = fileTokenRefreshTask;
        if (t != null) { t.cancel(false); fileTokenRefreshTask = null; }
        fileAccessToken = null;
    }
}