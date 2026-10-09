package io.github.moonleeeaf.lingcat.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;

/**
 * 前台服务的启停控制。
 * 调用方只管调 ensureRunning / stop，内部判断该不该开。
 */
public final class ServiceController {

    private static final String TAG = "ServiceController";

    private ServiceController() {}

    /**
     * 根据当前状态决定是否启动服务：
     *   - 开关关闭 → 停
     *   - 未登录 → 停
     *   - 已登录 + 开关开 → 启动
     */
    public static void ensureRunning(Context ctx) {
        if (ctx == null) return;

        boolean enabled = AppDataStore.data().keepAliveEnabled;
        boolean loggedIn = LingCatClientManager.getInstance().getCurrentServer() != null;

        if (enabled && loggedIn) {
            start(ctx);
        } else {
            stop(ctx);
        }
    }

    public static void start(Context ctx) {
        try {
            Intent i = new Intent(ctx, ConnectionKeepAliveService.class);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                ctx.startForegroundService(i);
            } else {
                ctx.startService(i);
            }
        } catch (Exception e) {
            Log.w(TAG, "start failed", e);
        }
    }

    public static void stop(Context ctx) {
        try {
            ctx.stopService(new Intent(ctx, ConnectionKeepAliveService.class));
        } catch (Exception e) {
            Log.w(TAG, "stop failed", e);
        }
    }
}