package io.github.moonleeeaf.lingcat.app;

import android.Manifest;
import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.ActivityCompat;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.main.MainActivity;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.client_protocol.LingCatClient;

public class ConnectionKeepAliveService extends Service {

    private static final String TAG = "KeepAliveSvc";
    private static final int NOTIF_ID = 0x4C43;
    private static final long CHECK_INTERVAL_SEC = 60;
    private static final long INITIAL_DELAY_SEC = 10;

    private ScheduledExecutorService scheduler;
    private ScheduledFuture<?> checkTask;
    private volatile String lastState = "";

    @Override
    public void onCreate() {
        super.onCreate();
        Log.i(TAG, "onCreate");

        NotificationHelper.get().ensureChannels(this);

        try {
            startForeground(NOTIF_ID, buildNotification("初始化中..."));
        } catch (Exception e) {
            Log.w(TAG, "startForeground failed in onCreate", e);
            stopSelf();
            return;
        }

        startGuardLoop();
    }

    @Override
    public int onStartCommand(@Nullable Intent intent, int flags, int startId) {
        // 前台服务被系统杀后不要在后台自动重启——后台 startForeground 会被拒
        return START_NOT_STICKY;
    }

    @Override
    public void onDestroy() {
        Log.i(TAG, "onDestroy");
        stopGuardLoop();
        super.onDestroy();
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    // ============================================================
    //                      守护循环
    // ============================================================

    private void startGuardLoop() {
        scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "keepalive-guard");
            t.setDaemon(true);
            return t;
        });
        checkTask = scheduler.scheduleAtFixedRate(
                this::checkAndKeepAlive,
                INITIAL_DELAY_SEC, CHECK_INTERVAL_SEC, TimeUnit.SECONDS);
    }

    private void stopGuardLoop() {
        if (checkTask != null) {
            checkTask.cancel(false);
            checkTask = null;
        }
        if (scheduler != null) {
            scheduler.shutdownNow();
            scheduler = null;
        }
    }

    private void checkAndKeepAlive() {
        try {
            LingCatClientManager mgr = LingCatClientManager.getInstance();
            ServerConfig server = mgr.getCurrentServer();
            LingCatClient client = mgr.getCurrent();

            final String state;
            if (server == null) {
                state = "未登录";
            } else if (client == null || !client.isReady()) {
                state = "重连中...";
                if (!mgr.isConnecting()) {
                    Log.i(TAG, "client not ready, reconnecting...");
                    mgr.connectTo(server);
                }
            } else {
                state = "已连接 · " + hostOf(server.url);
            }
            updateNotification(state);
        } catch (Exception e) {
            Log.w(TAG, "check failed", e);
        }
    }

    // ============================================================
    //                      通知
    // ============================================================

    private void updateNotification(String state) {
        if (state.equals(lastState)) return;
        lastState = state;
        try {
            if (ActivityCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                // TODO: Consider calling
                //    ActivityCompat#requestPermissions
                // here to request the missing permissions, and then overriding
                //   public void onRequestPermissionsResult(int requestCode, String[] permissions,
                //                                          int[] grantResults)
                // to handle the case where the user grants the permission. See the documentation
                // for ActivityCompat#requestPermissions for more details.
                return;
            }
            NotificationManagerCompat.from(this).notify(
                    NOTIF_ID, buildNotification(state));
        } catch (Exception e) {
            Log.w(TAG, "update notification failed", e);
        }
    }

    private Notification buildNotification(String state) {
        Intent click = new Intent(this, MainActivity.class);
        click.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(
                this, 0, click,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new androidx.core.app.NotificationCompat.Builder(this,
                NotificationHelper.CHANNEL_KEEPALIVE)
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setContentTitle("LingCat")
                .setContentText("正在接收消息 · " + state)
                .setContentIntent(pi)
                .setOngoing(true)
                .setSilent(true)
                .setShowWhen(false)
                .setPriority(NotificationCompat.PRIORITY_MIN)
                .setCategory(androidx.core.app.NotificationCompat.CATEGORY_SERVICE)
                .build();
    }

    // ============================================================
    //                      工具
    // ============================================================

    private static String hostOf(String url) {
        if (url == null) return "?";
        try {
            android.net.Uri u = android.net.Uri.parse(url);
            String host = u.getHost();
            if (host == null) return url;
            int port = u.getPort();
            return port > 0 ? host + ":" + port : host;
        } catch (Exception e) {
            return url;
        }
    }
}