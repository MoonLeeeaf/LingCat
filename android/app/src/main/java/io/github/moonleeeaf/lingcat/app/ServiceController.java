package io.github.moonleeeaf.lingcat.app;

import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.util.Log;

import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;

public final class ServiceController {

    private static final String TAG = "ServiceController";

    private ServiceController() {}

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
        // Android 12+：后台启动 FGS 会被拒——只有 App 在前台才启动
        if (Build.VERSION.SDK_INT >= 31) {
            if (!AppState.foreground) {
                Log.i(TAG, "skip start: app not in foreground");
                return;
            }
        }
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