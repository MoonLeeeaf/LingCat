package io.github.moonleeeaf.lingcat.auth.fragment;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.google.android.material.button.MaterialButton;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.auth.AuthActivity;
import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.classes.Classes;
import lingcat.client_protocol.LingCatClient;
import lingcat.client_protocol.UserApi;
import moon3.utils.FastToast;

public class LoginFragment extends Fragment {

    private static final String ARG_SERVER_URL = "server_url";
    private static final long API_TIMEOUT_MS = 15_000L;
    private static final ExecutorService IO = Executors.newSingleThreadExecutor();

    private ServerConfig server;
    private LingCatClient client;

    private TextView serverTitle, serverUrl;
    private EditText inputAccount, inputPassword;
    private MaterialButton btnLogin, btnRegister;
    private ProgressBar progress;
    private TextView oauthTitle;
    private LinearLayout oauthContainer;

    private MaterialButton btnPickAccount;

    public static LoginFragment newInstance(String serverUrl) {
        LoginFragment f = new LoginFragment();
        Bundle b = new Bundle();
        b.putString(ARG_SERVER_URL, serverUrl);
        f.setArguments(b);
        return f;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_login, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        View serverHeader = view.findViewById(R.id.login_server_header);

        serverTitle     = view.findViewById(R.id.login_server_title);
        serverUrl       = view.findViewById(R.id.login_server_url);
        inputAccount    = view.findViewById(R.id.input_account);
        inputPassword   = view.findViewById(R.id.input_password);
        btnLogin        = view.findViewById(R.id.btn_login);
        btnRegister     = view.findViewById(R.id.btn_register);
        progress        = view.findViewById(R.id.login_progress);
        oauthTitle      = view.findViewById(R.id.oauth_section_title);
        oauthContainer  = view.findViewById(R.id.oauth_container);

        serverHeader.setOnClickListener(v -> switchServer());

        String url = getArguments() != null ? getArguments().getString(ARG_SERVER_URL) : null;
        server = url != null ? AppDataStore.data().findServer(url) : null;
        if (server == null) {
            toast("服务器不存在");
            ((AuthActivity) requireActivity()).showServerList();
            return;
        }

        client = LingCatClientManager.getInstance().getCurrent();
        if (client == null || !LingCatClientManager.getInstance().isConnected()) {
            toast("连接已断开，请返回重试");
            return;
        }

        String title = (server.siteTitle != null && !server.siteTitle.isEmpty())
                ? server.siteTitle
                : "登录";
        serverTitle.setText(title);
        serverUrl.setText(server.url);

        Account active = AppDataStore.data().getActiveAccount(server.url);
        if (active != null) {
            if (active.username != null) inputAccount.setText(active.username);
            else if (active.nickname != null) inputAccount.setText(active.nickname);
        }

        btnLogin.setOnClickListener(v -> onLoginClicked());
        btnRegister.setOnClickListener(v ->
                ((AuthActivity) requireActivity()).showRegister(server));

        btnPickAccount = view.findViewById(R.id.btn_pick_account);
        btnPickAccount.setOnClickListener(v -> showPickAccountDialog());
        refreshPickAccountButton();

        renderOAuthButtons();
    }

    // ============================================================
    //                      选择已保存账号（跨服务器）
    // ============================================================

    /** (服务器, 账号) 组合 */
    private static class AccountRef {
        final ServerConfig server;
        final Account account;
        AccountRef(ServerConfig s, Account a) { this.server = s; this.account = a; }
    }

    /** 只要任何服务器存过账号就显示按钮 */
    private void refreshPickAccountButton() {
        if (btnPickAccount == null) return;
        boolean any = false;
        for (ServerConfig s : AppDataStore.data().servers) {
            if (!AppDataStore.data().getAccounts(s.url).isEmpty()) {
                any = true;
                break;
            }
        }
        btnPickAccount.setVisibility(any ? View.VISIBLE : View.GONE);
    }

    private void showPickAccountDialog() {
        var data = AppDataStore.data();

        // 收集所有服务器的所有账号
        List<AccountRef> entries = new ArrayList<>();
        for (ServerConfig s : data.servers) {
            for (Account a : data.getAccounts(s.url)) {
                entries.add(new AccountRef(s, a));
            }
        }
        if (entries.isEmpty()) return;

        String currentActiveId = data.activeAccountByServer.get(server.url);

        String[] labels = new String[entries.size()];
        for (int i = 0; i < entries.size(); i++) {
            AccountRef ref = entries.get(i);
            String name = displayName(ref.account);
            String host = serverLabel(ref.server);
            boolean isActive = ref.server.url.equals(server.url)
                    && ref.account.userId.equals(currentActiveId);
            labels[i] = (isActive ? "→ " : "   ") + name + "  ·  " + host;
        }

        new com.google.android.material.dialog.MaterialAlertDialogBuilder(requireContext())
                .setTitle("选择账号")
                .setItems(labels, (d, which) -> {
                    AccountRef chosen = entries.get(which);
                    if (chosen.server.url.equals(server.url)) {
                        // 同服务器 → 直接走 AuthActivity 的 connect + authorize
                        AppDataStore.setActiveAccount(server.url, chosen.account.userId);
                        ((AuthActivity) requireActivity())
                                .connectAndProceed(server, chosen.account, false);
                    } else {
                        // 跨服务器 → 切 currentServer，重启 AuthActivity
                        AppDataStore.setCurrentServer(chosen.server.url);
                        AppDataStore.setActiveAccount(chosen.server.url, chosen.account.userId);
                        LingCatClientManager.getInstance().disconnect();

                        Intent i = new Intent(requireContext(), AuthActivity.class);
                        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(i);
                        requireActivity().finish();
                    }
                })
                .setNegativeButton("取消", null)
                .show();
    }

    private String displayName(Account a) {
        if (a == null) return "未知账号";
        if (a.nickname != null && !a.nickname.isEmpty()) return a.nickname;
        if (a.username != null && !a.username.isEmpty()) return a.username;
        return a.userId;
    }

    /** 从 URL 提取 host[:port] */
    private String serverLabel(ServerConfig s) {
        if (s == null || s.url == null) return "?";
        try {
            Uri u = Uri.parse(s.url);
            String host = u.getHost();
            if (host == null) return s.url;
            int port = u.getPort();
            return port > 0 ? host + ":" + port : host;
        } catch (Exception e) {
            return s.url;
        }
    }

    // ============================================================
    //                      切换服务器
    // ============================================================

    private void switchServer() {
        if (getParentFragmentManager().getBackStackEntryCount() > 0) {
            getParentFragmentManager().popBackStack();
        } else {
            if (getActivity() instanceof AuthActivity) {
                ((AuthActivity) getActivity()).showServerList();
            }
        }
    }

    // ============================================================
    //                      密码登录
    // ============================================================

    private void onLoginClicked() {
        String account  = inputAccount.getText().toString().trim();
        String password = inputPassword.getText().toString();

        if (TextUtils.isEmpty(account)) {
            toast("请输入账号");
            return;
        }
        if (TextUtils.isEmpty(password)) {
            toast("请输入密码");
            return;
        }

        setLoading(true);

        final ServerConfig s = server;
        final LingCatClient c = client;

        IO.execute(() -> {
            try {
                String accessToken = UserApi.login(c, account, password, API_TIMEOUT_MS);
                Classes.IUser user = UserApi.queryMyUserInfo(c, accessToken, API_TIMEOUT_MS);

                if (!isAdded()) return;
                requireActivity().runOnUiThread(() -> {
                    persistAccountAndRoute(s, c, user, accessToken);
                });
            } catch (Exception e) {
                if (!isAdded()) return;
                requireActivity().runOnUiThread(() -> {
                    setLoading(false);
                    toast("登录失败: " + e.getMessage());
                });
            }
        });
    }

    // ============================================================
    //                      登录后的公共路由
    // ============================================================

    private void persistAccountAndRoute(ServerConfig s,
                                        LingCatClient c,
                                        Classes.IUser user,
                                        String accessToken) {
        Account acc = new Account(user.getId(), accessToken);
        acc.nickname = user.getNickname();
        acc.username = user.hasUsername() ? user.getUsername() : null;
        acc.avatarFileHash = user.hasAvatarFileHash() ? user.getAvatarFileHash() : null;
        AppDataStore.addAccount(s.url, acc);
        AppDataStore.setActiveAccount(s.url, user.getId());

        IO.execute(() -> {
            try {
                String sessionId = LingCatClientManager.getInstance().getSessionId();
                UserApi.authorize(c, accessToken, sessionId, API_TIMEOUT_MS);
            } catch (Exception e) {
                android.util.Log.w("LoginFragment", "authorize failed", e);
            }
            if (!isAdded()) return;
            requireActivity().runOnUiThread(() -> {
                setLoading(false);
                ((AuthActivity) requireActivity()).goMain();
            });
        });
    }

    // ============================================================
    //                      OAuth 按钮组
    // ============================================================

    private void renderOAuthButtons() {
        oauthContainer.removeAllViews();
        String json = server.oauthProvidersJson;
        if (json == null || json.isEmpty()) {
            oauthTitle.setVisibility(View.GONE);
            return;
        }

        try {
            JSONArray arr = new JSONArray(json);
            if (arr.length() == 0) {
                oauthTitle.setVisibility(View.GONE);
                return;
            }
            oauthTitle.setVisibility(View.VISIBLE);

            for (int i = 0; i < arr.length(); i++) {
                JSONObject p = arr.getJSONObject(i);
                String id = p.optString("id");
                String displayName = p.optString("display_name", id);
                if (id.isEmpty()) continue;

                MaterialButton btn = new MaterialButton(requireContext(), null,
                        com.google.android.material.R.attr.materialButtonOutlinedStyle);
                btn.setText(displayName);
                btn.setAllCaps(false);
                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT);
                lp.topMargin = (int) (8 * getResources().getDisplayMetrics().density);
                btn.setLayoutParams(lp);
                btn.setOnClickListener(v -> onOAuthClicked(id));
                oauthContainer.addView(btn);
            }
        } catch (Exception e) {
            android.util.Log.w("LoginFragment", "oauth providers parse failed", e);
            oauthTitle.setVisibility(View.GONE);
        }
    }

    private void onOAuthClicked(String providerId) {
        if (server == null) return;
        try {
            String redirect = "lingcat://oauth/callback";
            String encodedRedirect = java.net.URLEncoder.encode(redirect, "UTF-8");
            String url = server.url + "/oauth/" + providerId + "/login?redirect=" + encodedRedirect;

            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(i);
        } catch (Exception e) {
            toast("无法打开登录页: " + e.getMessage());
        }
    }

    // ============================================================
    //                      工具
    // ============================================================

    private void setLoading(boolean loading) {
        progress.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnLogin.setEnabled(!loading);
        btnRegister.setEnabled(!loading);
        inputAccount.setEnabled(!loading);
        inputPassword.setEnabled(!loading);
        if (btnPickAccount != null) btnPickAccount.setEnabled(!loading);
        for (int i = 0; i < oauthContainer.getChildCount(); i++) {
            oauthContainer.getChildAt(i).setEnabled(!loading);
        }
    }

    private void toast(String msg) {
        if (getView() == null) return;
        FastToast.shortSnack(getView(), msg).show();
    }
}