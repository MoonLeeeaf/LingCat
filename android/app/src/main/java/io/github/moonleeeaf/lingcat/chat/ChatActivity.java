package io.github.moonleeeaf.lingcat.chat;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ProfileCache;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.classes.Classes;
import lingcat.classes.Classes.IMessage;
import lingcat.client_protocol.ChatApi;
import lingcat.client_protocol.LingCatClient;
import lingcat.client_protocol.MessageParser;
import lingcat.methods.Methods.Message_Edited_Event;
import lingcat.methods.Methods.Receive_Chat_Message_Event;
import lingcat.protocol.Methods;
import lingcat.protocol.Package;
import moon3.app.Activity;
import moon3.utils.FastToast;

public class ChatActivity extends Activity {

    public static final String EXTRA_CHAT_ID = "chat_id";
    public static final String EXTRA_CHAT_TITLE = "chat_title";

    private static final int PAGE_SIZE = 30;
    private static final long API_TIMEOUT_MS = 15_000L;
    private static final ExecutorService IO = Executors.newSingleThreadExecutor();

    private String chatId;
    private String chatTitle;

    private RecyclerView recycler;
    private LinearLayoutManager layoutManager;
    private MessageListAdapter adapter;
    private EditText input;
    private ImageButton sendBtn;

    private LingCatClient client;
    private String accessToken;

    /** messages[0] = 最新, messages[n-1] = 最旧（与 reverseLayout 对齐） */
    private final List<IMessage> messages = new ArrayList<>();

    private volatile boolean initialLoaded = false;
    private volatile boolean loadingOlder = false;
    private volatile boolean hasMoreOlder = true;
    private volatile boolean sending = false;
    private String myUserId;

    private IMessage replyingTo;
    private IMessage editingMessage;

    private android.view.View chatStateBar;
    private android.widget.TextView chatStateTitle;
    private android.widget.TextView chatStatePreview;

    private final LingCatClient.OnReceiveListener onMessageEvent = this::onPackageReceived;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_chat);

        chatId = getIntent().getStringExtra(EXTRA_CHAT_ID);
        chatTitle = getIntent().getStringExtra(EXTRA_CHAT_TITLE);
        if (TextUtils.isEmpty(chatId)) {
            toast("缺少 chat_id");
            finish();
            return;
        }

        // 依赖
        client = LingCatClientManager.getInstance().getCurrent();
        ServerConfig server = LingCatClientManager.getInstance().getCurrentServer();
        if (client == null || server == null) {
            toast("连接已断开");
            return;
        }
        Account acc = AppDataStore.data().getActiveAccount(server.url);
        accessToken = acc != null ? acc.accessToken : null;
        if (accessToken == null) {
            toast("登录已失效");
            return;
        }

        // Toolbar（moon3.app.Activity 自带的那个）
        moon3.widget.Toolbar tb = getFirstToolbar();
        if (tb != null) {
            tb.setNavigationIcon(androidx.appcompat.R.drawable.abc_ic_ab_back_material);
            tb.setNavigationOnClickListener(v -> finish());
            tb.setOnClickListener(v ->
                    ChatProfileSheet.show(ChatActivity.this, chatId, chatId));
        }

        setTitle(chatTitle != null && !chatTitle.isEmpty() ? chatTitle : "对话");

        // RecyclerView（反向布局）
        recycler = findViewById(R.id.chat_messages);
        layoutManager = new LinearLayoutManager(this);
        layoutManager.setReverseLayout(true);   // index 0 在底部
        layoutManager.setStackFromEnd(true);
        recycler.setLayoutManager(layoutManager);

        chatStateBar     = findViewById(R.id.chat_state_bar);
        chatStateTitle   = findViewById(R.id.chat_state_title);
        chatStatePreview = findViewById(R.id.chat_state_preview);

        findViewById(R.id.chat_state_close).setOnClickListener(v -> exitStateMode());

        // 在 Account acc 那几行之后加：
         myUserId = acc.userId;

        // 改 adapter 构造
        adapter = new MessageListAdapter(this, messages, myUserId, new MessageActionListener() {
            @Override public void onMessageLongClick(IMessage msg, View anchor) {
                showMessageMenu(msg);
            }
            @Override public void onAvatarLongClick(String userId, View anchor) {
                showAvatarMenu(userId);
            }
            @Override public void onAvatarClick(String userId, View anchor) {
                UserProfileSheet.show(ChatActivity.this, userId, chatId);
            }

            @Override public void onMentionUser(String userId) {
                onAvatarClick(userId, null);
            }
            @Override public void onMentionChat(String chatId) {
                toast("对话 " + chatId);
            }
            @Override public void onReplyClick(int seq) {
                scrollToMessage(seq);
            }
            @Override public IMessage findMessage(int seq) {
                for (IMessage m : messages) {
                    if (m.getId() == seq) return m;
                }
                return null;
            }
            @Override
            public void onAttachmentImageClick(String url, String name) {
                ImageViewerActivity.show(ChatActivity.this, url);
            }

            @Override
            public void onAttachmentFileClick(String url, String name) {
                try {
                    android.content.Intent i = new android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url));
                    startActivity(i);
                } catch (Exception e) {
                    toast("无法打开: " + e.getMessage());
                }
            }
        });
        recycler.setAdapter(adapter);

        recycler.addOnScrollListener(new RecyclerView.OnScrollListener() {
            @Override
            public void onScrolled(@NonNull RecyclerView rv, int dx, int dy) {
                maybeLoadOlder();
            }
        });

        // 输入
        input = findViewById(R.id.chat_input);
        sendBtn = findViewById(R.id.chat_send);
        sendBtn.setOnClickListener(v -> onSendClicked());

        // 事件
        client.addOnReceiveListener(onMessageEvent);

        // 首屏
        loadInitial();
    }

    /**
     * 滚动到指定 seq 的消息。
     * 如果目标已加载 → 平滑滚动；否则提示（未来可做"加载目标周围"）。
     */
    private void scrollToMessage(int seq) {
        if (seq <= 0) return;
        for (int i = 0; i < messages.size(); i++) {
            if (messages.get(i).getId() == seq) {
                recycler.smoothScrollToPosition(i);
                return;
            }
        }
        toast("消息 #" + seq + " 未加载");
    }

    // ============================================================
//                      私聊 / 提及 辅助
// ============================================================

    private void openPrivateChat(String targetUserId) {
        IO.execute(() -> {
            try {
                String targetChatId = ChatApi.getOrCreatePrivateChat(
                        client, accessToken, targetUserId, API_TIMEOUT_MS);
                if (targetChatId == null) return;

                // 拿对方昵称做初始标题（已有缓存则秒回，没有则网络拉）
                String title = targetUserId;
                try {
                    Classes.IUser u = ProfileCache.queryUserInfo(targetUserId)
                            .get(5, java.util.concurrent.TimeUnit.SECONDS);
                    if (u != null && u.getNickname() != null && !u.getNickname().isEmpty()) {
                        title = u.getNickname();
                    }
                } catch (Exception ignored) {
                    // 拿不到就 userId 兜底
                }

                final String finalChatId = targetChatId;
                final String finalTitle = title;
                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    if (finalChatId.equals(chatId)) return;   // 已是当前对话

                    Intent i = new Intent(this, ChatActivity.class);
                    i.putExtra(EXTRA_CHAT_ID, finalChatId);
                    i.putExtra(EXTRA_CHAT_TITLE, finalTitle);
                    startActivity(i);
                });
            } catch (Exception e) {
                runOnUiThread(() -> toast("打开对话失败: " + e.getMessage()));
            }
        });
    }

    private void mentionUser(String userId) {
        Classes.IUser u = ProfileCache.getCachedUser(userId);
        String nickname = (u != null && u.getNickname() != null && !u.getNickname().isEmpty())
                ? u.getNickname() : userId;
        insertText("[@" + nickname + "](user:" + userId + ") ");
    }

    // ============================================================
//                      回复 / 编辑 状态
// ============================================================

    private void enterReplyMode(IMessage msg) {
        editingMessage = null;
        replyingTo = msg;
        showStateBar("回复 " + senderNameOf(msg), previewOf(msg));
        input.requestFocus();
    }

    private void enterEditMode(IMessage msg) {
        replyingTo = null;
        editingMessage = msg;

        String raw = MessageParser.entitiesToRawRichText(
                msg.getText(), msg.getEntitiesList());
        input.setText(raw);
        input.setSelection(raw.length());

        showStateBar("编辑消息", previewOf(msg));
        input.requestFocus();
    }

    private void exitStateMode() {
        boolean wasEditing = (editingMessage != null);
        replyingTo = null;
        editingMessage = null;
        chatStateBar.setVisibility(android.view.View.GONE);
        if (wasEditing) {
            input.setText("");
        }
    }

    private void showStateBar(String title, String preview) {
        chatStateTitle.setText(title);
        chatStatePreview.setText(preview);
        chatStateBar.setVisibility(android.view.View.VISIBLE);
    }

    private String senderNameOf(IMessage msg) {
        if (msg.getSystem()) return "系统消息";
        String sid = msg.getSenderUserId();
        if (sid == null || sid.isEmpty()) return "?";
        Classes.IUser u = io.github.moonleeeaf.lingcat.data.ProfileCache.getCachedUser(sid);
        if (u != null && u.getNickname() != null && !u.getNickname().isEmpty()) {
            return u.getNickname();
        }
        return sid.length() > 8 ? sid.substring(0, 8) : sid;
    }

    private String previewOf(IMessage msg) {
        String t = msg.getText();
        if (t == null) t = "";
        t = t.replace("[回复]", "").replace("[附件]", "").trim();
        if (t.length() > 60) t = t.substring(0, 60) + "...";
        return t;
    }

    private void showMessageMenu(IMessage msg) {
        List<ActionSheet.Action> actions = new ArrayList<>();

        // 复制
        actions.add(new ActionSheet.Action(
                R.drawable.ic_content_copy,
                "复制",
                () -> {
                    android.content.ClipboardManager cm =
                            (android.content.ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
                    cm.setPrimaryClip(android.content.ClipData.newPlainText("message", msg.getText()));
                    toast("已复制");
                }));

        // 回复
        // 回复
        actions.add(new ActionSheet.Action(
                R.drawable.ic_reply,
                "回复",
                () -> enterReplyMode(msg)));

        // 编辑（仅自己的消息 + 非系统）
        boolean isMine = myUserId != null
                && msg.getSenderUserId() != null
                && myUserId.equals(msg.getSenderUserId())
                && !msg.getSystem();
        if (isMine) {
            actions.add(new ActionSheet.Action(
                   R.drawable.ic_edit,
                    "编辑",
                    () -> enterEditMode(msg)));
        }

        // Info
        actions.add(new ActionSheet.Action(
                R.drawable.ic_info,
                "Info",
                () -> {
                    StringBuilder sb = new StringBuilder();
                    sb.append("id = ").append(msg.getId()).append('\n');
                    sb.append("sender = ").append(msg.getSenderUserId()).append('\n');
                    sb.append("time = ").append(msg.getTime()).append('\n');
                    sb.append("edited_at = ").append(msg.getEditedAt()).append('\n');
                    sb.append("system = ").append(msg.getSystem()).append('\n');
                    sb.append("entities = ").append(msg.getEntitiesCount());

                    new com.google.android.material.dialog.MaterialAlertDialogBuilder(this)
                            .setTitle("消息信息")
                            .setMessage(sb.toString())
                            .setPositiveButton("关闭", null)
                            .show();
                }));

        ActionSheet.show(this, "消息 #" + msg.getId(), actions);
    }

    private void showAvatarMenu(String userId) {
        List<ActionSheet.Action> actions = new ArrayList<>();

        Classes.IUser u = ProfileCache.getCachedUser(userId);

        actions.add(new ActionSheet.Action(
                R.drawable.ic_info,
                "用户资料",
                () -> UserProfileSheet.show(ChatActivity.this, userId, chatId)));

        actions.add(new ActionSheet.Action(
                R.drawable.ic_alternate_email,
                "提及用户",
                () -> {
                    String nickname = (u != null && u.getNickname() != null)
                            ? u.getNickname() : userId;
                    insertText("[@" + nickname + "](user:" + userId + ") ");
                }));

        ActionSheet.show(this, (u != null && u.getNickname() != null)
                ? u.getNickname() : userId , actions);
    }

    private void insertText(String text) {
        if (input == null) return;
        int start = Math.max(input.getSelectionStart(), 0);
        input.getText().insert(start, text);
    }

    @Override
    protected void onDestroy() {
        if (client != null) client.removeOnReceiveListener(onMessageEvent);
        super.onDestroy();
    }

    // ============================================================
    //                      加载
    // ============================================================

    private void loadInitial() {
        IO.execute(() -> {
            try {
                // 服务端返回升序（旧 → 新）
                List<IMessage> list = ChatApi.getChatMessages(
                        client, accessToken, chatId,
                        null, null, PAGE_SIZE, API_TIMEOUT_MS);

                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    messages.clear();
                    for (int i = list.size() - 1; i >= 0; i--) messages.add(list.get(i));
                    adapter.notifyDataSetChanged();   // 全部重算，简单直接
                    hasMoreOlder = list.size() >= PAGE_SIZE;
                    initialLoaded = true;
                    if (!messages.isEmpty()) {
                        recycler.scrollToPosition(0);
                    }
                    prefetchUsers(list);
                });
            } catch (Exception e) {
                runOnUiThread(() -> toast("加载消息失败: " + e.getMessage()));
            }
        });
    }

    private void maybeLoadOlder() {
        if (!initialLoaded || loadingOlder || !hasMoreOlder) return;
        if (messages.isEmpty()) return;

        // 反向布局：last visible = 视觉上最靠上 = 最旧的
        int lastVisible = layoutManager.findLastVisibleItemPosition();
        if (lastVisible >= messages.size() - 5) {
            loadOlder();
        }
    }

    private void loadOlder() {
        if (loadingOlder || !hasMoreOlder || messages.isEmpty()) return;
        loadingOlder = true;

        final int oldestId = messages.get(messages.size() - 1).getId();

        IO.execute(() -> {
            try {
                List<IMessage> older = ChatApi.getChatMessages(
                        client, accessToken, chatId,
                        oldestId, null, PAGE_SIZE, API_TIMEOUT_MS);

                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    if (older.isEmpty()) {
                        hasMoreOlder = false;
                        loadingOlder = false;
                        return;
                    }
                    // 倒序追加到末尾（视觉上向上扩展）
                    int oldSize = messages.size();
                    for (int i = older.size() - 1; i >= 0; i--) {
                        messages.add(older.get(i));
                    }
                    adapter.notifyItemRangeInserted(oldSize, older.size());
                    // 原最旧那条（现在上方有邻居了）需要重判
                    if (oldSize > 0) {
                        adapter.notifyItemChanged(oldSize - 1);
                    }
                    if (older.size() < PAGE_SIZE) hasMoreOlder = false;
                    loadingOlder = false;
                    prefetchUsers(older);
                });
            } catch (Exception e) {
                loadingOlder = false;
                runOnUiThread(() -> toast("加载更早消息失败: " + e.getMessage()));
            }
        });
    }

    // ============================================================
    //                      发送
    // ============================================================

    private void onSendClicked() {
        if (sending) return;

        String rawInput = input.getText().toString();
        if (TextUtils.isEmpty(rawInput.trim()) && editingMessage == null) return;

        // 拼装：回复模式拼接 [reply:seq] 前缀
        final String rawText;
        final IMessage editing = editingMessage;
        final IMessage replying = replyingTo;

        if (editing != null) {
            rawText = rawInput;
        } else if (replying != null) {
            rawText = "[reply:" + replying.getId() + "] " + rawInput;
        } else {
            rawText = rawInput;
        }

        // 解析成 text + entities
        final MessageParser.ParsedMessage parsed;
        try {
            parsed = MessageParser.parseMessage(rawText);
        } catch (Exception e) {
            toast("解析失败: " + e.getMessage());
            return;
        }

        sending = true;
        sendBtn.setEnabled(false);
        input.setEnabled(false);

        IO.execute(() -> {
            try {
                if (editing != null) {
                    ChatApi.editChatMessage(client, accessToken, chatId,
                            editing.getId(), parsed.text, parsed.entities, API_TIMEOUT_MS);
                } else {
                    ChatApi.sendChatMessage(client, accessToken, chatId,
                            parsed.text, parsed.entities, API_TIMEOUT_MS);
                }

                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    input.setText("");
                    input.setEnabled(true);
                    sendBtn.setEnabled(true);
                    sending = false;
                    exitStateMode();
                    // 新消息通过 WS 回来插入；编辑通过 Message_Edited_Event 更新
                });
            } catch (Exception e) {
                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    input.setEnabled(true);
                    sendBtn.setEnabled(true);
                    sending = false;
                    toast((editing != null ? "编辑" : "发送") + "失败: " + e.getMessage());
                });
            }
        });
    }

    // ============================================================
    //                      WS 事件分发
    // ============================================================

    private void onPackageReceived(Package pkg) {
        if (pkg.method_id == Methods.Receive_Chat_Message_Event) {
            handleReceive(pkg);
        } else if (pkg.method_id == Methods.Message_Edited_Event) {
            handleEdited(pkg);
        }
    }

    private void handleReceive(Package pkg) {
        try {
            Receive_Chat_Message_Event ev = Receive_Chat_Message_Event.parseFrom(pkg.data);
            if (!ev.hasMsg()) return;
            IMessage raw = ev.getMsg();
            if (!chatId.equals(raw.getChatId())) return;

            // 已存在（发送方自己可能收到回显）→ 忽略
            for (IMessage m : messages) {
                if (m.getId() == raw.getId()) return;
            }

            runOnUiThread(() -> {
                if (isFinishing()) return;
                boolean atLatest = layoutManager.findFirstVisibleItemPosition() <= 1;
                messages.add(0, raw);
                adapter.notifyItemInserted(0);
                // 原 index 0 现在是 index 1，hideSender 状态可能变了
                if (messages.size() > 1) {
                    adapter.notifyItemChanged(1);
                }
                if (atLatest) {
                    recycler.smoothScrollToPosition(0);
                }
                prefetchUsers(java.util.Collections.singletonList(raw));
            });
        } catch (Exception e) {
            // ignore
        }
    }
    // ============================================================
//                      预取用户信息
// ============================================================

    /**
     * 收集新消息里的非空 senderId，异步拉取用户信息（未缓存的）。
     * 完成后通知列表重绑（触发昵称显示）。
     */
    private void prefetchUsers(List<IMessage> msgs) {
        if (msgs == null || msgs.isEmpty()) return;

        java.util.Set<String> ids = new java.util.HashSet<>();
        for (IMessage m : msgs) {
            String sid = m.getSenderUserId();
            if (sid != null && !sid.isEmpty() && ProfileCache.getCachedUser(sid) == null) {
                ids.add(sid);
            }
        }
        if (ids.isEmpty()) return;

        List<CompletableFuture<?>> futures = new ArrayList<>();
        for (String id : ids) {
            futures.add(ProfileCache.queryUserInfo(id));
        }

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .whenComplete((v, e) -> runOnUiThread(() -> {
                    if (isFinishing()) return;
                    adapter.notifyDataSetChanged();
                }));
    }

    private void handleEdited(Package pkg) {
        try {
            Message_Edited_Event ev = Message_Edited_Event.parseFrom(pkg.data);
            if (!chatId.equals(ev.getChatId())) return;
            int id = ev.getId();

            runOnUiThread(() -> {
                if (isFinishing()) return;
                for (int i = 0; i < messages.size(); i++) {
                    IMessage m = messages.get(i);
                    if (m.getId() != id) continue;

                    IMessage.Builder b = m.toBuilder().setText(ev.getText());
                    b.clearEntities();
                    b.addAllEntities(ev.getEntitiesList());
                    b.setEditedAt(ev.getEditedAt());

                    messages.set(i, b.build());
                    adapter.notifyItemChanged(i);
                    return;
                }
            });
        } catch (Exception e) {
            // ignore
        }
    }

    // ============================================================
    //                      工具
    // ============================================================

    private void toast(String msg) {
        if (isFinishing()) return;
        FastToast.shortSnack(getRootContentViewHandler(), msg).show();
    }
}