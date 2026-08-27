package io.github.moonleeeaf.lingcat;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.NotificationCompat;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.snackbar.Snackbar;

import lingcat.client_protocol.LingCatClient;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

public class MainActivity extends BaseActivity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        getSupportActionBar().hide();

        WebView mWebView = new WebView(this);
        setContentView(mWebView);

        WebSettings settings = mWebView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setAllowFileAccessFromFileURLs(true);
        settings.setAllowUniversalAccessFromFileURLs(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowContentAccess(true);
        CookieManager.getInstance().setAcceptCookie(true);

        // startService(new Intent(MainActivity.this, MessageService.class));

        mWebView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void setCurrentSession(String token, String server, String publicKey) {
                KV.getKV(MainActivity.this).edit().putString("token", token).putString("server", server).putString("public_key", publicKey).apply();

                /* stopService(new Intent(MainActivity.this, MessageService.class));

                new Handler(Looper.getMainLooper()).postDelayed(() -> {
                    startService(new Intent(MainActivity.this, MessageService.class));
                }, 500); */
            }
            @JavascriptInterface
            public void showNotification(String title, String body, String iconUrl) {
                // 创建通知渠道（Android 8.0+）
                if (Build.VERSION.SDK_INT >= 26) {
                    NotificationChannel channel = new NotificationChannel(
                            "web_notification",
                            "网页通知",
                            NotificationManager.IMPORTANCE_HIGH
                    );
                    NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                    if (manager != null) {
                        manager.createNotificationChannel(channel);
                    }
                }

                NotificationCompat.Builder builder = new NotificationCompat.Builder(MainActivity.this, "web_notification")
                        .setContentTitle(title)
                        .setContentText(body)
                        .setSmallIcon(R.drawable.ic_launcher)
                        .setPriority(NotificationCompat.PRIORITY_HIGH)
                        .setContentIntent(
                                PendingIntent.getActivity(
                                        MainActivity.this, 0, new Intent(MainActivity.this, MainActivity.class),
                                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                                )
                        )
                        .setAutoCancel(true);

                NotificationManager manager = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
                if (manager != null) {
                    manager.notify((int) System.currentTimeMillis(), builder.build());
                }
            }
        }, "LingCatClientInterface");

        mWebView.loadUrl("file:///android_asset/offline-webpage/index.html");

        if (Build.VERSION.SDK_INT >= 33) {
            requestPermissions(new String[] {
                    Manifest.permission.POST_NOTIFICATIONS
            }, 0);
        }

        /*
        setContentView(R.layout.main_test);

        findViewById(R.id.test).setOnClickListener((view) -> {
            var client = new LingCatClient(
                    "http://192.168.0.38:3601/",
                    "http://192.168.0.38:3601/",
                    hexToByte("64846ebe222a455353051bbc364a42e01318e297a2e2cb8d4c7b8e98c95bf4df")
            );
            client.init();
            client.addWebSocketListener(new WebSocketListener() {
                @Override
                public void onOpen(@NonNull WebSocket webSocket, @NonNull Response response) {
                    super.onOpen(webSocket, response);
                    Snackbar.make(findViewById(android.R.id.content), "连接成功", Snackbar.LENGTH_LONG).show();
                }

                @Override
                public void onClosed(@NonNull WebSocket webSocket, int code, @NonNull String reason) {
                    super.onClosed(webSocket, code, reason);
                    Snackbar.make(findViewById(android.R.id.content), "断开连接", Snackbar.LENGTH_LONG).show();
                }

                @Override
                public void onFailure(@NonNull WebSocket webSocket, @NonNull Throwable t, @Nullable Response response) {
                    super.onFailure(webSocket, t, response);
                    Snackbar.make(findViewById(android.R.id.content), t + "", Snackbar.LENGTH_LONG).show();
                }
            });
            client.addOnInitListener(() -> {
                Snackbar.make(findViewById(android.R.id.content), "初始化成功", Snackbar.LENGTH_LONG).show();
            });
        });
         */
    }
}
