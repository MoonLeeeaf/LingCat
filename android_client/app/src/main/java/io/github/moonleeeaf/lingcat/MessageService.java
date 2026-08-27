package io.github.moonleeeaf.lingcat;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.Binder;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import com.google.protobuf.InvalidProtocolBufferException;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import lingcat.classes.Classes;
import lingcat.client_protocol.LingCatClient;
import lingcat.methods.Methods;
import lingcat.protocol.Package;

public class MessageService extends Service {
    private static final String TAG = "MessageService";
    private static final int NOTIFICATION_ID = 1001;
    private static final String CHANNEL_ID = "lingcat_message_channel";

    private LingCatClient client;
    private ExecutorService executor = Executors.newSingleThreadExecutor();

    public static byte[] hexToByte(String hex){
        int m = 0, n = 0;
        int byteLen = hex.length() / 2; // 每两个字符描述一个字节
        byte[] ret = new byte[byteLen];
        for (int i = 0; i < byteLen; i++) {
            m = i * 2 + 1;
            n = m + 1;
            int intVal = Integer.decode("0x" + hex.substring(i * 2, m) + hex.substring(m, n));
            ret[i] = (byte) intVal;
        }
        return ret;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        Log.d(TAG, "onCreate");

        // 1. 创建前台通知
        createNotificationChannel();
        startForeground(NOTIFICATION_ID, buildNotification());

        String wsUrl = KV.getKV(this).getString("server", "ws://localhost/");
        String httpUrl = wsUrl;
        byte[] publicKey = hexToByte(KV.getKV(this).getString("public_key", ""));

        client = new LingCatClient(wsUrl, httpUrl, publicKey);

        client.addOnReceiveListener(pkg -> {
            Log.w(TAG, "[RAW] methodId=" + pkg.getMethodId() + " (" + lingcat.protocol.Methods.getMethodName(pkg.getMethodId()) + ")");
            if (pkg.getMethodId() == lingcat.protocol.Methods.Receive_Chat_Message_Event) {
                try {
                    Classes.IMessage msg = Methods.Receive_Chat_Message_Event.parseFrom(pkg.getData()).getMsg();

                    getSystemService(NotificationManager.class).notify(1, new NotificationCompat.Builder(MessageService.this, CHANNEL_ID)
                            .setContentTitle(msg.getChatId() + " | 灵猫")
                            .setContentText(msg.getText())
                            .setSmallIcon(R.drawable.ic_launcher)
                            .setPriority(NotificationCompat.PRIORITY_MIN)
                            .setVisibility(NotificationCompat.VISIBILITY_SECRET)
                            .build());
                } catch (InvalidProtocolBufferException e) {
                    Log.w(TAG, e);
                }
            }
        });
    }


    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Log.d(TAG, "onStartCommand");
        executor.execute(() -> {
            if (client != null) {
                client.init();
            }
        });
        return START_STICKY;
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "onDestroy");
        if (client != null) {
            client.disconnect();
        }
        executor.shutdownNow();
    }

    // 处理消息（可扩展为发送广播或更新数据库）
    private void handleMessage(Package pkg) {
        // 根据 methodId 处理不同类型的消息
        // 例如：解析 IMessage 并发送广播通知 Activity
        Intent intent = new Intent("lingcat.NEW_MESSAGE");
        intent.putExtra("methodId", pkg.getMethodId());
        intent.putExtra("data", pkg.getData());
        sendBroadcast(intent);
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "消息通知与前台服务",
                    NotificationManager.IMPORTANCE_LOW
            );
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification buildNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this, 0, notificationIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("灵猫")
                .setContentText("消息服务运行中...")
                .setSmallIcon(R.drawable.ic_launcher)
                .setPriority(NotificationCompat.PRIORITY_MIN)
                .setContentIntent(pendingIntent)
                .build();
    }

}