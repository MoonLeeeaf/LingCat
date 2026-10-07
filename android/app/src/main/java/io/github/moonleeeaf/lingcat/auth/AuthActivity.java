package io.github.moonleeeaf.lingcat.auth;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import java.util.concurrent.CompletableFuture;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.auth.fragment.AddServerFragment;
import io.github.moonleeeaf.lingcat.auth.fragment.LoginFragment;
import io.github.moonleeeaf.lingcat.auth.fragment.RegisterFragment;
import io.github.moonleeeaf.lingcat.auth.fragment.ServerListFragment;
import lingcat.client_protocol.LingCatClient;
import lingcat.client_protocol.UserApi;
import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.main.MainActivity;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import moon3.app.Activity;
import moon3.utils.FastToast;

public class AuthActivity extends Activity {

    private static final String TAG = "AuthActivity";
    public static final String EXTRA_SWITCH_ACCOUNT = "switch_account";

    private View loadingOverlay;
    private TextView loadingText;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_auth);

        loadingOverlay = findViewById(R.id.loading_overlay);
        loadingText    = findViewById(R.id.loading_text);

        if (savedInstanceState == null) {
            route();
        }
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
        String err = intent.getStringExtra("oauth_error");
        if (err != null) {
            Log.w(TAG, "oauth error: " + err);
            toast("OAuth 失败: " + err);
        }
    }

    // ============================================================
    //                      Loading overlay
    // ============================================================

    public void showLoading(@Nullable String message) {
        if (loadingOverlay == null) return;
        loadingText.setText(message != null && !message.isEmpty()
                ? message : "正在连接...");
        loadingOverlay.setVisibility(View.VISIBLE);
    }

    public void hideLoading() {
        if (loadingOverlay == null) return;
        loadingOverlay.setVisibility(View.GONE);
    }

    // ============================================================
    //                      启动路由
    // ============================================================

    private void route() {
        var data = AppDataStore.data();

        // 从 MainActivity 的"切换账号"跳来：强制走登录页
        if (getIntent().getBooleanExtra(EXTRA_SWITCH_ACCOUNT, false)) {
            ServerConfig s = data.getCurrentServer();
            if (s != null) {
                connectAndProceed(s, null, true);
                return;
            }
            showServerList();
            return;
        }

        // 原有逻辑
        if (data.servers.isEmpty()) {
            showAddServer();
            return;
        }

        ServerConfig current = data.getCurrentServer();
        if (current != null) {
            Account acc = data.getActiveAccount(current.url);
            connectAndProceed(current, acc, true);
            return;
        }

        showServerList();
    }

    // ============================================================
    //                      Fragment 切换
    // ============================================================

    public void showServerList() {
        replace(new ServerListFragment(), false);
    }

    public void showAddServer() {
        Fragment current = getSupportFragmentManager()
                .findFragmentById(R.id.auth_container);
        replace(new AddServerFragment(), current != null);
    }

    public void showRegister(ServerConfig server) {
        Fragment current = getSupportFragmentManager()
                .findFragmentById(R.id.auth_container);
        replace(RegisterFragment.newInstance(server.url), current != null);
    }

    public void showLogin(ServerConfig server) {
        Fragment current = getSupportFragmentManager()
                .findFragmentById(R.id.auth_container);
        replace(LoginFragment.newInstance(server.url), current != null);
    }

    private void replace(Fragment f, boolean addToBackStack) {
        var tx = getSupportFragmentManager().beginTransaction()
                .replace(R.id.auth_container, f);
        if (addToBackStack) tx.addToBackStack(null);
        tx.commit();
    }

    // ============================================================
    //                      连接 + 后续路由
    // ============================================================

    /**
     * 点击服务器后的入口。
     *
     * @param server          目标服务器
     * @param account         该服务器下当前活跃账号（可能为 null）
     * @param silentIfNoToken 若已有 token 但 authorize 失败，是否静默去登录页
     *                        （启动时静默，用户点击时弹提示）
     */
    public void connectAndProceed(ServerConfig server,
                                  @Nullable Account account,
                                  boolean silentIfNoToken) {
        LingCatClientManager mgr = LingCatClientManager.getInstance();

        showLoading("正在连接 " + server.url);

        CompletableFuture<LingCatClient> future = mgr.connectTo(server);

        future.whenComplete((client, err) -> runOnUiThread(() -> {
            if (err != null) {
                hideLoading();
                Log.w(TAG, "connect failed: " + err);
                toast("连接失败: " + err.getMessage());
                showServerList();
                return;
            }

            // 握手成功
            if (account == null || account.accessToken == null || account.accessToken.isEmpty()) {
                hideLoading();
                showLogin(server);
                return;
            }

            // 有 token → authorize（内部会保持 loading）
            authorizeThenRoute(client, server, account, silentIfNoToken);
        }));
    }

    /** 后台线程跑 authorize，成功跳主界面，失败去登录页 */
    private void authorizeThenRoute(LingCatClient client,
                                    ServerConfig server,
                                    Account account,
                                    boolean silentIfNoToken) {
        showLoading("正在验证登录...");

        new Thread(() -> {
            try {
                String sessionId = LingCatClientManager.getInstance().getSessionId();
                UserApi.authorize(client, account.accessToken, sessionId);

                runOnUiThread(() -> {
                    hideLoading();
                    goMain();
                });
            } catch (Exception e) {
                Log.w(TAG, "authorize failed: " + e);
                runOnUiThread(() -> {
                    hideLoading();
                    if (!silentIfNoToken) {
                        toast("登录已过期，请重新登录");
                    }
                    showLogin(server);
                });
            }
        }, "authorize").start();
    }

    public void goMain() {
        Intent i = new Intent(this, MainActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(i);
        finish();
    }

    private void toast(String msg) {
        FastToast.shortSnack(this, msg).show();
    }
}