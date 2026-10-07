package io.github.moonleeeaf.lingcat.auth;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.main.MainActivity;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.client_protocol.LingCatClient;
import lingcat.client_protocol.OAuthApi;
import lingcat.client_protocol.UserApi;

/**
 * OAuth 回调桥接 Activity。
 * 由系统通过 lingcat://oauth/callback?oauth_ticket=... 唤起。
 * - 无 UI（透明主题）
 * - 取 ticket → 换取 access_token → 存 DataStore → 跳 MainActivity
 * - 失败 → 回 AuthActivity 并带上错误
 */
public class OAuthCallbackActivity extends AppCompatActivity {

    private static final String TAG = "OAuthCallback";
    private static final String SCHEME = "lingcat";
    private static final String HOST = "oauth";
    private static final String PATH = "/callback";

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        Uri data = intent.getData();
        if (data == null
                || !SCHEME.equals(data.getScheme())
                || !HOST.equals(data.getHost())
                || !PATH.equals(data.getPath())) {
            Log.w(TAG, "invalid callback uri: " + data);
            goBackWithError("invalid_callback");
            return;
        }

        String error = data.getQueryParameter("oauth_error");
        String ticket = data.getQueryParameter("oauth_ticket");

        if (error != null && !error.isEmpty()) {
            // access_denied 是用户主动取消，不算错误
            if ("access_denied".equals(error)) {
                Log.i(TAG, "user denied oauth");
                goBackSilently();
            } else {
                Log.w(TAG, "oauth error: " + error);
                goBackWithError(error);
            }
            return;
        }

        if (ticket == null || ticket.isEmpty()) {
            Log.w(TAG, "missing oauth_ticket");
            goBackWithError("missing_ticket");
            return;
        }

        // 有 ticket → 开始换取 token
        exchangeTicket(ticket);
    }

    /**
     * 换取 access_token。
     *
     * 这里需要：
     *   1. 从 DataStore 读「正在登录的服务器」
     *   2. 建一个临时 LingCatClient（握手完成后调 OAuthApi.exchangeOAuthCode）
     *   3. 成功 → 存 token 到 DataStore → 跳 MainActivity
     *   4. 失败 → goBackWithError
     *
     * 因为 DataStore 和 LingCatClient 初始化还没做，这里先留出调用点。
     */
    private void exchangeTicket(String ticket) {
        LingCatClientManager mgr = LingCatClientManager.getInstance();
        LingCatClient client = mgr.getCurrent();
        ServerConfig server = mgr.getCurrentServer();

        if (client == null || server == null) {
            Log.w(TAG, "no active client/server");
            goBackWithError("no_active_client");
            return;
        }

        new Thread(() -> {
            try {
                String accessToken = OAuthApi.exchangeOAuthCode(client, ticket, 15_000L);
                lingcat.classes.Classes.IUser user = UserApi.queryMyUserInfo(
                        client, accessToken, 15_000L);

                Account acc = new Account(user.getId(), accessToken);
                acc.nickname = user.getNickname();
                acc.username = user.hasUsername() ? user.getUsername() : null;
                acc.avatarFileHash = user.hasAvatarFileHash() ? user.getAvatarFileHash() : null;

                AppDataStore.addAccount(server.url, acc);
                AppDataStore.setActiveAccount(server.url, user.getId());

                try {
                    String sessionId = mgr.getSessionId();
                    UserApi.authorize(client, accessToken, sessionId, 15_000L);
                } catch (Exception e) {
                    Log.w(TAG, "authorize failed", e);
                }

                runOnUiThread(() -> {
                    Intent i = new Intent(this, MainActivity.class);
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                    startActivity(i);
                    finish();
                });
            } catch (Exception e) {
                Log.e(TAG, "exchange failed", e);
                runOnUiThread(() -> goBackWithError("exchange_failed"));
            }
        }, "oauth-exchange").start();
    }

    private void goBackWithError(String code) {
        Intent i = new Intent(this, AuthActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        i.putExtra("oauth_error", code);
        startActivity(i);
        finish();
    }

    private void goBackSilently() {
        Intent i = new Intent(this, AuthActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        startActivity(i);
        finish();
    }
}