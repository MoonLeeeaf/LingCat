package io.github.moonleeeaf.lingcat.chat;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;

import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ProfileCache;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.classes.Classes.IChatAdmin;
import lingcat.classes.Classes.IUser;
import lingcat.client_protocol.ChatApi;
import lingcat.client_protocol.LingCatClient;
import moon3.app.Activity;
import moon3.utils.FastToast;

public class ChatMembersActivity extends Activity {

    public static final String EXTRA_CHAT_ID = "chat_id";
    public static final String EXTRA_CHAT_TITLE = "chat_title";

    private static final long API_TIMEOUT_MS = 15_000L;
    private static final ExecutorService IO = Executors.newSingleThreadExecutor();

    private String chatId;
    private String myUserId;

    private LingCatClient client;
    private String accessToken;

    private ChatMembersAdapter adapter;

    private boolean iAmOwner = false;
    private boolean iAmAdmin = false;

    private final List<IUser> members = new ArrayList<>();
    private final List<IChatAdmin> admins = new ArrayList<>();

    public static void show(Context ctx, String chatId, @Nullable String chatTitle) {
        Intent i = new Intent(ctx, ChatMembersActivity.class);
        i.putExtra(EXTRA_CHAT_ID, chatId);
        i.putExtra(EXTRA_CHAT_TITLE, chatTitle);
        ctx.startActivity(i);
    }

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat_members);

        chatId = getIntent().getStringExtra(EXTRA_CHAT_ID);
        String chatTitle = getIntent().getStringExtra(EXTRA_CHAT_TITLE);
        if (chatId == null || chatId.isEmpty()) {
            toast("缺少 chat_id");
            finish();
            return;
        }

        client = LingCatClientManager.getInstance().getCurrent();
        ServerConfig server = LingCatClientManager.getInstance().getCurrentServer();
        if (client == null || server == null) {
            toast("连接已断开");
            finish();
            return;
        }
        Account acc = AppDataStore.data().getActiveAccount(server.url);
        if (acc == null || acc.accessToken == null) {
            toast("登录已失效");
            finish();
            return;
        }
        accessToken = acc.accessToken;
        myUserId = acc.userId;

        moon3.widget.Toolbar tb = getFirstToolbar();
        if (tb != null) {
            tb.setNavigationIcon(androidx.appcompat.R.drawable.abc_ic_ab_back_material);
            tb.setNavigationOnClickListener(v -> finish());
        }
        setTitle((chatTitle != null && !chatTitle.isEmpty()) ? chatTitle : "对话成员");

        RecyclerView recycler = findViewById(R.id.members_list);
        recycler.setLayoutManager(new LinearLayoutManager(this));
        adapter = new ChatMembersAdapter(this, this::onMemberClick, this::onMemberLongClick);
        recycler.setAdapter(adapter);

        load();
    }

    // ============================================================
    //                      加载
    // ============================================================

    private void load() {
        IO.execute(() -> {
            try {
                List<IUser> m = ChatApi.getChatMembers(client, accessToken, chatId, API_TIMEOUT_MS);
                List<IChatAdmin> a = ChatApi.getChatAdmins(client, accessToken, chatId, API_TIMEOUT_MS);

                final List<IUser> fm = m != null ? m : new ArrayList<>();
                final List<IChatAdmin> fa = a != null ? a : new ArrayList<>();

                // 权限判断
                boolean owner = false, admin = false;
                for (IChatAdmin ca : fa) {
                    if (ca.getId().equals(myUserId)) {
                        admin = true;
                        if ("owner".equals(ca.getRole())) owner = true;
                    }
                }
                final boolean fOwner = owner, fAdmin = admin;

                // 预取用户资料
                Set<String> ids = new HashSet<>();
                for (IUser u : fm) {
                    if (ProfileCache.getCachedUser(u.getId()) == null) ids.add(u.getId());
                }
                for (IChatAdmin u : fa) {
                    if (ProfileCache.getCachedUser(u.getId()) == null) ids.add(u.getId());
                }
                if (!ids.isEmpty()) {
                    List<CompletableFuture<?>> futures = new ArrayList<>();
                    for (String id : ids) futures.add(ProfileCache.queryUserInfo(id));
                    try {
                        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                                .get(API_TIMEOUT_MS, TimeUnit.MILLISECONDS);
                    } catch (Exception ignored) {}
                }

                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    members.clear();
                    members.addAll(fm);
                    admins.clear();
                    admins.addAll(fa);
                    iAmOwner = fOwner;
                    iAmAdmin = fAdmin;
                    rebuildRows();
                });
            } catch (Exception e) {
                runOnUiThread(() -> toast("加载失败: " + e.getMessage()));
            }
        });
    }

    /** IChatAdmin → IUser（protobuf 生成的类不真继承，需要手动转） */
    private static IUser adminToUser(IChatAdmin a) {
        IUser.Builder b = IUser.newBuilder()
                .setId(a.getId())
                .setNickname(a.getNickname());
        if (a.hasUsername())        b.setUsername(a.getUsername());
        if (a.hasDescription())     b.setDescription(a.getDescription());
        if (a.hasAvatarFileHash())  b.setAvatarFileHash(a.getAvatarFileHash());
        return b.build();
    }

    private void rebuildRows() {
        List<ChatMembersAdapter.Row> rows = new ArrayList<>();

        List<IChatAdmin> owners = new ArrayList<>();
        List<IChatAdmin> adminsOnly = new ArrayList<>();
        Set<String> adminIds = new HashSet<>();
        for (IChatAdmin a : admins) {
            adminIds.add(a.getId());
            if ("owner".equals(a.getRole())) owners.add(a);
            else adminsOnly.add(a);
        }

        List<IUser> normalMembers = new ArrayList<>();
        for (IUser u : members) {
            if (!adminIds.contains(u.getId())) normalMembers.add(u);
        }

        if (!owners.isEmpty()) {
            rows.add(ChatMembersAdapter.Row.header("所有者"));
            for (IChatAdmin a : owners) rows.add(ChatMembersAdapter.Row.member(adminToUser(a), a));
        }
        if (!adminsOnly.isEmpty()) {
            rows.add(ChatMembersAdapter.Row.header("管理员"));
            for (IChatAdmin a : adminsOnly) rows.add(ChatMembersAdapter.Row.member(adminToUser(a), a));
        }
        if (!normalMembers.isEmpty()) {
            rows.add(ChatMembersAdapter.Row.header("成员 (" + normalMembers.size() + ")"));
            for (IUser u : normalMembers) rows.add(ChatMembersAdapter.Row.member(u, null));
        }

        adapter.submit(rows);
    }

    // ============================================================
    //                      交互
    // ============================================================

    private void onMemberClick(IUser user) {
        UserProfileSheet.show(this, user.getId(), chatId);
    }

    private void onMemberLongClick(IUser user, @Nullable IChatAdmin admin) {
        boolean isSelf = myUserId != null && myUserId.equals(user.getId());
        boolean isOwner = admin != null && "owner".equals(admin.getRole());

        List<ActionSheet.Action> actions = new ArrayList<>();

        // 移除成员（iAmAdmin 或 iAmOwner；不能踢 owner；不能踢自己）
        if ((iAmAdmin || iAmOwner) && !isOwner && !isSelf) {
            actions.add(new ActionSheet.Action(
                    R.drawable.ic_delete,
                    "移除成员",
                    () -> confirmRemoveMember(user)));
        }

        // 添加为管理员（iAmOwner；当前不是 admin；不是自己）
        if (iAmOwner && admin == null && !isSelf) {
            actions.add(new ActionSheet.Action(
                    R.drawable.ic_admin_panel,
                    "添加为管理员",
                    () -> confirmAddAdmin(user)));
        }

        // 编辑权限（iAmOwner；是 admin 但非 owner）
        if (iAmOwner && admin != null && !isOwner) {
            actions.add(new ActionSheet.Action(
                    R.drawable.ic_edit,
                    "编辑权限",
                    () -> EditAdminPermissionsSheet.show(this, chatId, admin, this::load)));
        }

        // 移除管理员（iAmOwner；是 admin 但非 owner）
        if (iAmOwner && admin != null && !isOwner) {
            actions.add(new ActionSheet.Action(
                    R.drawable.ic_person_remove,
                    "移除管理员",
                    () -> confirmRemoveAdmin(admin)));
        }

        if (actions.isEmpty()) {
            // 没权限 → 直接开资料
            onMemberClick(user);
            return;
        }

        ActionSheet.show(this, displayName(user), actions);
    }

    private String displayName(IUser user) {
        IUser cached = ProfileCache.getCachedUser(user.getId());
        if (cached != null && cached.getNickname() != null && !cached.getNickname().isEmpty()) {
            return cached.getNickname();
        }
        if (user.getNickname() != null && !user.getNickname().isEmpty()) {
            return user.getNickname();
        }
        return user.getId();
    }

    // ============================================================
    //                      确认框 + API 调用
    // ============================================================

    private void confirmRemoveMember(IUser user) {
        new com.google.android.material.dialog.MaterialAlertDialogBuilder(this)
                .setTitle("移除成员")
                .setMessage("确定要从对话中移除「" + displayName(user) + "」吗？")
                .setPositiveButton("移除", (d, w) -> doRemoveMember(user))
                .setNegativeButton("取消", null)
                .show();
    }

    private void doRemoveMember(IUser user) {
        IO.execute(() -> {
            try {
                ChatApi.removeChatMember(client, accessToken, chatId, user.getId(), API_TIMEOUT_MS);
                runOnUiThread(() -> {
                    toast("已移除");
                    load();
                });
            } catch (Exception e) {
                runOnUiThread(() -> toast("移除失败: " + e.getMessage()));
            }
        });
    }

    private void confirmAddAdmin(IUser user) {
        new com.google.android.material.dialog.MaterialAlertDialogBuilder(this)
                .setTitle("添加为管理员")
                .setMessage("确定要把「" + displayName(user) + "」添加为管理员吗？")
                .setPositiveButton("添加", (d, w) -> doAddAdmin(user))
                .setNegativeButton("取消", null)
                .show();
    }

    private void doAddAdmin(IUser user) {
        IO.execute(() -> {
            try {
                ChatApi.addChatAdmin(client, accessToken, chatId, user.getId(), "{}", API_TIMEOUT_MS);
                runOnUiThread(() -> {
                    toast("已添加");
                    load();
                });
            } catch (Exception e) {
                runOnUiThread(() -> toast("添加失败: " + e.getMessage()));
            }
        });
    }

    private void confirmRemoveAdmin(IChatAdmin admin) {
        IUser u = ProfileCache.getCachedUser(admin.getId());
        String name = (u != null) ? u.getNickname() : admin.getId();
        new com.google.android.material.dialog.MaterialAlertDialogBuilder(this)
                .setTitle("移除管理员")
                .setMessage("确定要移除管理员「" + name + "」吗？")
                .setPositiveButton("移除", (d, w) -> doRemoveAdmin(admin))
                .setNegativeButton("取消", null)
                .show();
    }

    private void doRemoveAdmin(IChatAdmin admin) {
        IO.execute(() -> {
            try {
                ChatApi.removeChatAdmin(client, accessToken, chatId, admin.getId(), API_TIMEOUT_MS);
                runOnUiThread(() -> {
                    toast("已移除");
                    load();
                });
            } catch (Exception e) {
                runOnUiThread(() -> toast("移除失败: " + e.getMessage()));
            }
        });
    }

    // ============================================================
    //                      工具
    // ============================================================

    private void toast(String msg) {
        if (isFinishing()) return;
        FastToast.shortSnack(getRootContentViewHandler(), msg).show();
    }
}