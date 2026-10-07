package io.github.moonleeeaf.lingcat.data;

import androidx.annotation.Nullable;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.classes.Classes.IChat;
import lingcat.classes.Classes.IUser;
import lingcat.client_protocol.ChatApi;
import lingcat.client_protocol.LingCatClient;
import lingcat.client_protocol.UserApi;

/**
 * 用户 / 对话信息缓存。
 *
 * 特性：
 *   - 并发去重：同一 id 短时间内多次请求 → 只发一次网络请求，其他等同一个 future
 *   - LRU 上限（500）：避免长时间运行占用内存
 *   - 失败即移除：网络错误后下次调用可以重试
 *   - 切服务器清空：不同服务器的 id 空间独立，避免串号
 */
public final class ProfileCache {

    private static final int MAX_SIZE = 500;
    private static final long API_TIMEOUT_MS = 15_000L;
    private static final ExecutorService IO = Executors.newFixedThreadPool(4);

    private static final Map<String, CompletableFuture<IUser>> USER_CACHE  = createLru();
    private static final Map<String, CompletableFuture<IChat>> CHAT_CACHE  = createLru();

    private ProfileCache() {}

    private static <T> Map<String, CompletableFuture<T>> createLru() {
        return Collections.synchronizedMap(
                new LinkedHashMap<String, CompletableFuture<T>>(16, 0.75f, true) {
                    @Override
                    protected boolean removeEldestEntry(Map.Entry<String, CompletableFuture<T>> eldest) {
                        return size() > MAX_SIZE;
                    }
                });
    }

    // ============================================================
    //                      同步读缓存
    // ============================================================

    /** 命中返回 IUser，未命中 / 加载中 / 失败 → null */
    @Nullable
    public static IUser getCachedUser(String userId) {
        if (userId == null) return null;
        CompletableFuture<IUser> f = USER_CACHE.get(userId);
        return doneValue(f);
    }

    @Nullable
    public static IChat getCachedChat(String chatId) {
        if (chatId == null) return null;
        CompletableFuture<IChat> f = CHAT_CACHE.get(chatId);
        return doneValue(f);
    }

    @Nullable
    private static <T> T doneValue(@Nullable CompletableFuture<T> f) {
        if (f == null || !f.isDone() || f.isCompletedExceptionally()) return null;
        try { return f.getNow(null); } catch (Exception e) { return null; }
    }

    // ============================================================
    //                      异步查询（去重）
    // ============================================================

    public static CompletableFuture<IUser> queryUserInfo(String userId) {
        return query(USER_CACHE, userId, (client, token) ->
                UserApi.queryUserInfo(client, token, userId, API_TIMEOUT_MS));
    }

    public static CompletableFuture<IChat> queryChatInfo(String chatId) {
        return query(CHAT_CACHE, chatId, (client, token) ->
                ChatApi.queryChatInfo(client, token, chatId, API_TIMEOUT_MS));
    }

    /** 泛化：缓存 + 去重 + 失败清理 */
    private interface Fetcher<T> {
        T fetch(LingCatClient client, String accessToken) throws Exception;
    }

    private static <T> CompletableFuture<T> query(
            Map<String, CompletableFuture<T>> cache,
            String id,
            Fetcher<T> fetcher) {

        if (id == null || id.isEmpty()) {
            CompletableFuture<T> f = new CompletableFuture<>();
            f.completeExceptionally(new IllegalArgumentException("id is empty"));
            return f;
        }

        synchronized (cache) {
            CompletableFuture<T> existing = cache.get(id);
            if (existing != null) return existing;

            CompletableFuture<T> future = new CompletableFuture<>();
            cache.put(id, future);

            IO.execute(() -> {
                try {
                    LingCatClientManager mgr = LingCatClientManager.getInstance();
                    LingCatClient client = mgr.getCurrent();
                    ServerConfig server = mgr.getCurrentServer();
                    if (client == null || server == null) {
                        throw new IllegalStateException("未连接");
                    }
                    Account acc = AppDataStore.data().getActiveAccount(server.url);
                    if (acc == null || acc.accessToken == null) {
                        throw new IllegalStateException("登录已失效");
                    }

                    T result = fetcher.fetch(client, acc.accessToken);
                    future.complete(result);
                } catch (Throwable t) {
                    future.completeExceptionally(t);
                    // 失败 → 移除缓存项，下次可重试
                    synchronized (cache) {
                        if (cache.get(id) == future) cache.remove(id);
                    }
                }
            });

            return future;
        }
    }

    // ============================================================
    //                      清空 / 失效
    // ============================================================

    /** 切换服务器 / 登出时调用 */
    public static void clearAll() {
        synchronized (USER_CACHE) { USER_CACHE.clear(); }
        synchronized (CHAT_CACHE) { CHAT_CACHE.clear(); }
    }

    /** 单个用户资料变更后手动失效 */
    public static void invalidateUser(String userId) {
        if (userId == null) return;
        USER_CACHE.remove(userId);
    }

    public static void invalidateChat(String chatId) {
        if (chatId == null) return;
        CHAT_CACHE.remove(chatId);
    }
}