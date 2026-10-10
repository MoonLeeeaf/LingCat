package io.github.moonleeeaf.lingcat.chat.meeting;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ServiceInfo;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

import io.github.moonleeeaf.lingcat.R;

/**
 * 会议前台服务：
 *   - 让会议在后台持续运行（不因 Activity 停止被杀）
 *   - 通知栏显示"LingCat 会议中 [挂断]"
 *   - 挂断通过 Service 自身的 action 处理
 */
public class MeetingForegroundService extends Service {

    private static final String TAG = "MeetingFgSvc";
    private static final int NOTIF_ID = 0x4D45;   // "ME"
    public static final String CHANNEL_ID = "meeting";

    private static final String EXTRA_CHAT_TITLE = "chat_title";
    private static final String ACTION_START = "io.github.moonleeeaf.lingcat.MEETING_START";
    private static final String ACTION_HANGUP = "io.github.moonleeeaf.lingcat.MEETING_HANGUP";

    public static void start(Context ctx, String chatTitle) {
        Intent i = new Intent(ctx, MeetingForegroundService.class);
        i.setAction(ACTION_START);
        i.putExtra(EXTRA_CHAT_TITLE, chatTitle);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            ctx.startForegroundService(i);
        } else {
            ctx.startService(i);
        }
    }

    public static void stop(Context ctx) {
        try {
            ctx.stopService(new Intent(ctx, MeetingForegroundService.class));
        } catch (Exception ignored) {}
    }

    private String chatTitle;

    @Override
    public void onCreate() {
        super.onCreate();
        ensureChannel();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent != null && ACTION_HANGUP.equals(intent.getAction())) {
            // 用户从通知里点挂断
            MeetingManager.get().leave();
            stopSelf();
            return START_NOT_STICKY;
        }

        if (intent != null) {
            String t = intent.getStringExtra(EXTRA_CHAT_TITLE);
            if (t != null) chatTitle = t;
        }

        Notification n = buildNotification();

        if (Build.VERSION.SDK_INT >= 30) {
            int type = ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE;
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
                    == PackageManager.PERMISSION_GRANTED) {
                type |= ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA;
            }
            try {
                startForeground(NOTIF_ID, n, type);
            } catch (Exception e) {
                Log.e(TAG, "startForeground failed", e);
                stopSelf();
                return START_NOT_STICKY;
            }
        } else {
            startForeground(NOTIF_ID, n);
        }

        return START_STICKY;
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) { return null; }

    // ============================================================
    //                      通知
    // ============================================================

    private Notification buildNotification() {
        // 点击 → 打开 MeetingActivity
        Intent click = new Intent(this, MeetingActivity.class);
        click.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent clickPi = PendingIntent.getActivity(
                this, 0, click,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // 挂断 → 回到 Service 自己处理
        Intent hangup = new Intent(this, MeetingForegroundService.class);
        hangup.setAction(ACTION_HANGUP);
        PendingIntent hangupPi = PendingIntent.getService(
                this, 1, hangup,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(R.drawable.ic_videocam)
                .setContentTitle("正在会议中")
                .setContentText(chatTitle != null ? chatTitle : "点击返回会议")
                .setContentIntent(clickPi)
                .addAction(0, "挂断", hangupPi)
                .setOngoing(true)
                .setShowWhen(true)
                .setUsesChronometer(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setCategory(NotificationCompat.CATEGORY_CALL)
                .build();
    }

    private void ensureChannel() {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = getSystemService(NotificationManager.class);
        if (nm == null) return;
        if (nm.getNotificationChannel(CHANNEL_ID) != null) return;

        NotificationChannel ch = new NotificationChannel(
                CHANNEL_ID, "会议", NotificationManager.IMPORTANCE_LOW);
        ch.setDescription("正在进行的会议");
        ch.enableVibration(false);
        ch.setSound(null, null);
        ch.setShowBadge(false);
        nm.createNotificationChannel(ch);
    }
}