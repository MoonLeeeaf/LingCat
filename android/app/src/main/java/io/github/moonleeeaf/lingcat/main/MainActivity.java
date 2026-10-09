package io.github.moonleeeaf.lingcat.main;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;

import androidx.annotation.Nullable;
import androidx.viewpager2.widget.ViewPager2;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.tabs.TabLayout;
import com.google.android.material.tabs.TabLayoutMediator;

import java.util.ArrayList;
import java.util.List;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.auth.AuthActivity;
import io.github.moonleeeaf.lingcat.chat.ChatActivity;
import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.client_protocol.LingCatClient;
import moon3.app.Activity;

public class MainActivity extends Activity {

    private TabLayout tabs;
    private ViewPager2 pager;

    private void requestNotificationPermissionIfNeeded() {
        if (Build.VERSION.SDK_INT < 33) return;
        if (checkSelfPermission(android.Manifest.permission.POST_NOTIFICATIONS)
                == android.content.pm.PackageManager.PERMISSION_GRANTED) return;
        requestPermissions(
                new String[]{android.Manifest.permission.POST_NOTIFICATIONS}, 1001);
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        requestNotificationPermissionIfNeeded();

        if (LingCatClientManager.getInstance().getCurrent() == null) {
            goToAuth();
            return;
        }

        setContentView(R.layout.activity_main);

        tabs = findViewById(R.id.main_tabs);
        pager = findViewById(R.id.main_pager);

        ChatListPagerAdapter adapter = new ChatListPagerAdapter(this);
        pager.setAdapter(adapter);
        pager.setOffscreenPageLimit(2);

        new TabLayoutMediator(tabs, pager, (tab, position) -> {
            switch (position) {
                case 0: tab.setText("最近"); break;
                case 1: tab.setText("收藏"); break;
                case 2: tab.setText("全部"); break;
            }
        }).attach();

        io.github.moonleeeaf.lingcat.app.ServiceController.ensureRunning(this);

        // 预热收藏列表缓存
        LingCatClientManager.getInstance().refreshFavourites();
    }

    // ============================================================
    //                      Toolbar 菜单
    // ============================================================

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        int id = item.getItemId();
        if (id == R.id.action_switch_account) {
            showSwitchAccountDialog();
            return true;
        }
        if (id == R.id.action_logout) {
            confirmLogout();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    // ============================================================
    //                      切换账号（跨服务器）
    // ============================================================

    /** (服务器, 账号) 组合，用于跨服务器切换 */
    private static class AccountRef {
        final ServerConfig server;
        final Account account;
        AccountRef(ServerConfig s, Account a) { this.server = s; this.account = a; }
    }

    private void showSwitchAccountDialog() {
        var data = AppDataStore.data();
        ServerConfig currentServer = LingCatClientManager.getInstance().getCurrentServer();
        String currentActiveUserId = (currentServer != null)
                ? data.activeAccountByServer.get(currentServer.url)
                : null;

        // 1. 遍历所有服务器，收集所有账号
        List<AccountRef> entries = new ArrayList<>();
        for (ServerConfig server : data.servers) {
            List<Account> list = data.getAccounts(server.url);
            for (Account acc : list) {
                entries.add(new AccountRef(server, acc));
            }
        }

        // 2. 构建标签：昵称 + 服务器 host
        String[] labels = new String[entries.size() + 1];
        for (int i = 0; i < entries.size(); i++) {
            AccountRef ref = entries.get(i);
            String name = displayName(ref.account);
            String host = serverLabel(ref.server);

            boolean isActive = currentServer != null
                    && ref.server.url.equals(currentServer.url)
                    && ref.account.userId.equals(currentActiveUserId);

            labels[i] = (isActive ? "→ " : "   ") + name + "  ·  " + host;
        }
        labels[entries.size()] = "添加新账号";

        // 3. 弹框
        new MaterialAlertDialogBuilder(this)
                .setTitle("切换账号")
                .setItems(labels, (d, which) -> {
                    if (which == entries.size()) {
                        // 添加新账号：仅针对当前服务器
                        if (currentServer != null) goToAddAccount(currentServer);
                        return;
                    }
                    AccountRef chosen = entries.get(which);
                    if (currentServer != null
                            && chosen.server.url.equals(currentServer.url)
                            && chosen.account.userId.equals(currentActiveUserId)) {
                        return;   // 已是当前账号
                    }
                    switchToAccountAcrossServers(chosen);
                })
                .setNegativeButton("取消", null)
                .show();
    }

    /** 从 URL 里提取 host[:port] 做显示 */
    private String serverLabel(ServerConfig s) {
        if (s == null || s.url == null) return "?";
        try {
            android.net.Uri u = android.net.Uri.parse(s.url);
            String host = u.getHost();
            if (host == null) return s.url;
            int port = u.getPort();
            return port > 0 ? host + ":" + port : host;
        } catch (Exception e) {
            return s.url;
        }
    }

    private String displayName(Account a) {
        if (a == null) return "未知账号";
        if (a.nickname != null && !a.nickname.isEmpty()) return a.nickname;
        if (a.username != null && !a.username.isEmpty()) return a.username;
        return a.userId;
    }

    /**
     * 跨服务器切换账号：
     *   1. 更新 currentServerUrl（可能换服务器）
     *   2. 更新该服务器的活跃账号
     *   3. 断当前连接
     *   4. 重启 AuthActivity —— route() 会读到新的 currentServer + activeAccount
     *      → connect + authorize → Main
     */
    private void switchToAccountAcrossServers(AccountRef ref) {
        AppDataStore.setCurrentServer(ref.server.url);
        AppDataStore.setActiveAccount(ref.server.url, ref.account.userId);
        LingCatClientManager.getInstance().disconnect();
        goToAuth();
    }

    /**
     * 添加新账号：
     *   清空当前服务器的活跃账号 → AuthActivity.route() 走登录页
     */
    private void goToAddAccount(ServerConfig s) {
        AppDataStore.clearActiveAccount(s.url);
        LingCatClientManager.getInstance().disconnect();
        goToAuth();
    }

    // ============================================================
    //                      退出登录
    // ============================================================

    private void confirmLogout() {
        ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
        if (s == null) return;

        Account active = AppDataStore.data().getActiveAccount(s.url);
        String name = displayName(active);

        new MaterialAlertDialogBuilder(this)
                .setTitle("退出登录")
                .setMessage("确定退出「" + name + "」吗？\n\n本机将删除该账号的登录凭证，下次需重新输入密码。")
                .setPositiveButton("退出", (d, w) -> doLogout(s, active))
                .setNegativeButton("取消", null)
                .show();
    }

    private void doLogout(ServerConfig s, Account active) {
        if (active != null) {
            AppDataStore.removeAccount(s.url, active.userId);
        }
        AppDataStore.clearActiveAccount(s.url);
        LingCatClientManager.getInstance().disconnect();
        goToAuth();
    }

    // ============================================================
    //                      公共跳转
    // ============================================================

    private void goToAuth() {
        Intent i = new Intent(this, AuthActivity.class);
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(i);
        finish();
    }

    // ============================================================
    //                      供 Fragment 取用
    // ============================================================

    public LingCatClient getClient() {
        return LingCatClientManager.getInstance().getCurrent();
    }

    public String getAccessToken() {
        ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
        if (s == null) return null;
        Account a = AppDataStore.data().getActiveAccount(s.url);
        return a != null ? a.accessToken : null;
    }

    public void openChat(String chatId, String chatTitle) {
        Intent i = new Intent(this, ChatActivity.class);
        i.putExtra(ChatActivity.EXTRA_CHAT_ID, chatId);
        i.putExtra(ChatActivity.EXTRA_CHAT_TITLE, chatTitle);
        startActivity(i);
    }
}