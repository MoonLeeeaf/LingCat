package io.github.moonleeeaf.lingcat.net;

import androidx.annotation.Nullable;

import java.io.IOException;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import lingcat.client_protocol.HttpClientProvider;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * 附件 MIME 类型缓存。
 * HEAD 请求读 Content-Type；并发去重；LRU 上限 200。
 */
public final class AttachmentMimeCache {

    private static final int MAX_SIZE = 200;
    private static final ExecutorService IO = Executors.newFixedThreadPool(3);

    private static final Map<String, CompletableFuture<String>> CACHE =
            Collections.synchronizedMap(
                    new LinkedHashMap<String, CompletableFuture<String>>(16, 0.75f, true) {
                        @Override
                        protected boolean removeEldestEntry(Map.Entry<String, CompletableFuture<String>> e) {
                            return size() > MAX_SIZE;
                        }
                    });

    private AttachmentMimeCache() {}

    @Nullable
    public static String getCached(String url) {
        CompletableFuture<String> f = CACHE.get(url);
        if (f == null || !f.isDone() || f.isCompletedExceptionally()) return null;
        try { return f.getNow(null); } catch (Exception e) { return null; }
    }

    public static CompletableFuture<String> query(String url) {
        if (url == null || url.isEmpty()) {
            CompletableFuture<String> f = new CompletableFuture<>();
            f.completeExceptionally(new IllegalArgumentException("url is empty"));
            return f;
        }

        synchronized (CACHE) {
            CompletableFuture<String> existing = CACHE.get(url);
            if (existing != null) return existing;

            CompletableFuture<String> future = new CompletableFuture<>();
            CACHE.put(url, future);

            IO.execute(() -> {
                OkHttpClient http = HttpClientProvider.get();
                Request req = new Request.Builder()
                        .url(url)
                        .head()
                        .build();
                try (Response resp = http.newCall(req).execute()) {
                    if (!resp.isSuccessful()) {
                        throw new IOException("HTTP " + resp.code());
                    }
                    String ct = resp.header("Content-Type");
                    if (ct == null || ct.isEmpty()) ct = "application/octet-stream";
                    // 去掉 "; charset=xxx" 之类
                    int semi = ct.indexOf(';');
                    if (semi > 0) ct = ct.substring(0, semi).trim();
                    future.complete(ct);
                } catch (Throwable t) {
                    future.completeExceptionally(t);
                    synchronized (CACHE) {
                        if (CACHE.get(url) == future) CACHE.remove(url);
                    }
                }
            });

            return future;
        }
    }
}