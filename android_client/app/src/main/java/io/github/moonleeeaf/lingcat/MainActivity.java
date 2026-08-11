package io.github.moonleeeaf.lingcat;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import com.google.android.material.snackbar.Snackbar;

import lingcat.client_protocol.LingCatClient;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;

public class MainActivity extends BaseActivity {
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
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

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
    }
}
