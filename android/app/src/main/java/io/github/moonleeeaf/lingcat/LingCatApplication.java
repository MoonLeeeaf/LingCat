package io.github.moonleeeaf.lingcat;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import coil.Coil;
import coil.ImageLoader;
import io.github.moonleeeaf.lingcat.app.AppState;
import io.github.moonleeeaf.lingcat.app.NotificationHelper;
import io.github.moonleeeaf.lingcat.app.NotificationRouter;
import io.github.moonleeeaf.lingcat.app.ServiceController;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;

import lingcat.client_protocol.HttpClientProvider;
import lingcat.client_protocol.LingCatClient;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

public class LingCatApplication extends Application {

    private static final String TAG = "LingCatApplication";

    /** 确认"真的进入后台"的延迟；小于这个时间内的 Activity 切换不触发 */
    private static final long BACKGROUND_CONFIRM_DELAY_MS = 500L;

    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private Runnable backgroundConfirmRunnable;
    private boolean isInBackground = false;
    private int startedCount = 0;

    @Override
    public void onCreate() {
        super.onCreate();

        appContextStatic = this;

        AppDataStore.init(this);

        NotificationHelper.get().ensureChannels(this);
        NotificationRouter.get();
        LingCatClientManager.init(this);
        setupCoil();

        registerActivityLifecycleCallbacks(new ActivityLifecycleCallbacks() {

            @Override public void onActivityStarted(Activity a) {
                startedCount++;
                if (backgroundConfirmRunnable != null) {
                    mainHandler.removeCallbacks(backgroundConfirmRunnable);
                    backgroundConfirmRunnable = null;
                }
                if (startedCount == 1 && isInBackground) {
                    isInBackground = false;
                    AppState.foreground = true;   // ← 新增
                    Log.i(TAG, "app foregrounded");
                    onAppForeground();
                }
            }

            @Override public void onActivityStopped(Activity a) {
                startedCount--;
                if (startedCount == 0) {
                    backgroundConfirmRunnable = () -> {
                        isInBackground = true;
                        AppState.foreground = false;   // ← 新增
                        backgroundConfirmRunnable = null;
                        Log.i(TAG, "app backgrounded");
                    };
                    mainHandler.postDelayed(backgroundConfirmRunnable, BACKGROUND_CONFIRM_DELAY_MS);
                }
            }

            @Override public void onActivityCreated(Activity a, Bundle b) {}
            @Override public void onActivityResumed(Activity a) {}
            @Override public void onActivityPaused(Activity a) {}
            @Override public void onActivitySaveInstanceState(Activity a, Bundle b) {}
            @Override public void onActivityDestroyed(Activity a) {}
        });
    }

    // LingCatClientManager
    private static volatile Context appContextStatic;
    public static Context getAppContext() { return appContextStatic; }


    private void onAppForeground() {
        ServiceController.ensureRunning(this);

        LingCatClientManager mgr = LingCatClientManager.getInstance();
        LingCatClient cur = mgr.getCurrent();
        ServerConfig server = mgr.getCurrentServer();

        if (server == null) {
            Log.i(TAG, "foreground: no server, skip");
            return;
        }

        // 情况 1：完全没连接对象 → 直接连
        if (cur == null) {
            Log.i(TAG, "foreground: no client, connecting...");
            mgr.connectTo(server);
            return;
        }

        // 情况 2：正在握手中 → 不打断
        if (mgr.isConnecting()) {
            Log.i(TAG, "foreground: connecting in progress, no action");
            return;
        }

        // 情况 3：有 client 但未就绪（连接死了）→ 强制重连
        if (!cur.isReady()) {
            Log.i(TAG, "foreground: client dead, force reconnect");
            mgr.disconnect();
            mgr.connectTo(server);
            return;
        }

        // 情况 4：一切正常
        Log.i(TAG, "foreground: ready, no action");
    }

    /** 给所有 Coil 图片请求自动加 file_access_token header */
    private void setupCoil() {
        OkHttpClient client = HttpClientProvider.get().newBuilder()
                // 全局 OkHttpClient 加 CookieJar
                .addInterceptor(chain -> {
                    Request req = chain.request();
                    String token = LingCatClientManager.getInstance().getFileAccessToken();
                    if (token != null && !token.isEmpty()) {
                        req = req.newBuilder()
                                .header("Cookie", "file_access_token=" + token)
                                .build();
                    }

                    Response resp = chain.proceed(req);

                    // 上传文件 URL 带 hash → 内容不变 → 永久缓存
                    String path = req.url().encodedPath();
                    if (path.startsWith("/uploaded_files/")) {
                        resp = resp.newBuilder()
                                .removeHeader("Cache-Control")
                                .removeHeader("Pragma")
                                .removeHeader("Expires")
                                .header("Cache-Control", "max-age=31536000, immutable")
                                .build();
                    }
                    return resp;
                })
                .build();

        ImageLoader loader = new ImageLoader.Builder(this)
                .okHttpClient(client)
                .crossfade(true)
                .build();

        Coil.setImageLoader(loader);
    }
}