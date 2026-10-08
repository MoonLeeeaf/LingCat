package io.github.moonleeeaf.lingcat;

import android.app.Activity;
import android.app.Application;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import coil.Coil;
import coil.ImageLoader;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;

import lingcat.client_protocol.HttpClientProvider;
import lingcat.client_protocol.LingCatClient;
import okhttp3.OkHttpClient;
import okhttp3.Request;

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
        AppDataStore.init(this);
        LingCatClientManager.init(this);
        setupCoil();

        registerActivityLifecycleCallbacks(new ActivityLifecycleCallbacks() {

            @Override
            public void onActivityStarted(Activity a) {
                startedCount++;

                // 取消"进入后台"的待确认任务
                if (backgroundConfirmRunnable != null) {
                    mainHandler.removeCallbacks(backgroundConfirmRunnable);
                    backgroundConfirmRunnable = null;
                }

                // 从后台回到前台
                if (startedCount == 1 && isInBackground) {
                    isInBackground = false;
                    Log.i(TAG, "app foregrounded");
                    onAppForeground();
                }
            }

            @Override
            public void onActivityStopped(Activity a) {
                startedCount--;
                if (startedCount == 0) {
                    // 延迟确认，避免 Activity 切换误判
                    backgroundConfirmRunnable = () -> {
                        isInBackground = true;
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

    private void onAppForeground() {
        LingCatClientManager mgr = LingCatClientManager.getInstance();
        LingCatClient cur = mgr.getCurrent();
        ServerConfig server = mgr.getCurrentServer();

        if (server == null) {
            Log.i(TAG, "foreground: no server, skip");
            return;
        }

        // 完全没连接 / 连接对象在但没握手好
        if (cur == null || !cur.isReady()) {
            Log.i(TAG, "foreground: reconnecting to " + server.url);
            // 强制重建：先断干净，避免和进行中的握手打架
            mgr.disconnect();
            mgr.connectTo(server);
        } else {
            Log.i(TAG, "foreground: connection ready, no action");
        }
    }

    /** 给所有 Coil 图片请求自动加 file_access_token header */
    private void setupCoil() {
        OkHttpClient client = HttpClientProvider.get().newBuilder()
                .addInterceptor(chain -> {
                    Request req = chain.request();
                    String token = LingCatClientManager.getInstance().getFileAccessToken();
                    if (token != null && !token.isEmpty()) {
                        req = req.newBuilder()
                                .header("file_access_token", token)
                                .build();
                    }
                    return chain.proceed(req);
                })
                .build();

        ImageLoader loader = new ImageLoader.Builder(this)
                .okHttpClient(client)
                .crossfade(true)
                .build();

        Coil.setImageLoader(loader);
    }
}