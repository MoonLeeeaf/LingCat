package io.github.moonleeeaf.lingcat.app;

import android.content.Context;
import android.util.Log;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import io.github.moonleeeaf.lingcat.LingCatApplication;
import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ProfileCache;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.classes.Classes;
import lingcat.classes.Classes.IChat;
import lingcat.classes.Classes.IMessage;
import lingcat.classes.Classes.IMessageEntity;
import lingcat.client_protocol.ChatApi;
import lingcat.client_protocol.LingCatClient;
import lingcat.methods.Methods.Receive_Chat_Message_Event;
import lingcat.protocol.Methods;
import lingcat.protocol.Package;

/**
 * 全局消息 → 通知路由。
 * 在 LingCatClient 就绪时 attach，disconnect 时 detach。
 */
public final class NotificationRouter implements LingCatClient.OnReceiveListener {

    private static final String TAG = "NotifRouter";
    private static final ExecutorService IO = Executors.newFixedThreadPool(2);

    private static volatile NotificationRouter INSTANCE;
    private volatile LingCatClient attached;

    private NotificationRouter() {}

    public static NotificationRouter get() {
        if (INSTANCE == null) {
            synchronized (NotificationRouter.class) {
                if (INSTANCE == null) INSTANCE = new NotificationRouter();
            }
        }
        return INSTANCE;
    }

    // ============================================================
    //                      attach / detach
    // ============================================================

    public static void attach(LingCatClient client) {
        get().doAttach(client);
    }

    public static void detach(LingCatClient client) {
        get().doDetach(client);
    }

    private synchronized void doAttach(LingCatClient client) {
        if (client == null) return;
        if (attached == client) return;
        if (attached != null) {
            try { attached.removeOnReceiveListener(this); } catch (Exception ignored) {}
        }
        attached = client;
        client.addOnReceiveListener(this);
        Log.i(TAG, "attached");
    }

    private synchronized void doDetach(LingCatClient client) {
        if (client != null && attached == client) {
            try { client.removeOnReceiveListener(this); } catch (Exception ignored) {}
            attached = null;
            Log.i(TAG, "detached");
        }
    }

    // ============================================================
    //                      onReceive
    // ============================================================

    @Override
    public void onReceive(Package pkg) {
        if (pkg.method_id != Methods.Receive_Chat_Message_Event) return;

        IO.execute(() -> {
            try {
                handleMessage(pkg);
            } catch (Exception e) {
                Log.w(TAG, "handle failed", e);
            }
        });
    }

    private void handleMessage(Package pkg) throws Exception {
        IMessage msg = Receive_Chat_Message_Event.parseFrom(pkg.data).getMsg();
        if (msg == null || msg.getSystem()) return;

        String chatId = msg.getChatId();
        String senderId = msg.getSenderUserId();
        if (chatId == null || senderId == null) return;

        LingCatClientManager mgr = LingCatClientManager.getInstance();
        ServerConfig server = mgr.getCurrentServer();
        if (server == null) return;

        Account acc = AppDataStore.data().getActiveAccount(server.url);
        if (acc == null) return;
        String myUserId = acc.userId;
        String myNickname = acc.nickname != null ? acc.nickname : "我";

        // 自己发的 → 不通知
        if (myUserId.equals(senderId)) return;

        // App 前台 + 当前活跃 chat → 不通知
        if (AppState.foreground
                && chatId.equals(AppState.activeChatId)) return;

        Context ctx = LingCatApplication.getAppContext();
        if (ctx == null) return;

        // 判断渠道优先级：被回复 > @我 > 私聊
        String channelId = decideChannel(chatId, msg, myUserId, mgr.getCurrent(), acc.accessToken);
        if (channelId == null) return;

        // 拉 chat info（缓存优先）
        // 拉 chat info 后
        IChat chat = ProfileCache.getCachedChat(chatId);
        if (chat == null) {
            chat = ProfileCache.queryChatInfo(chatId).get();
        }
        if (chat == null) return;

        String chatTitle = chat.getTitle();
        if (chatTitle == null || chatTitle.isEmpty()) chatTitle = "对话";

// 对话头像
        String chatAvatarHash = chat.hasAvatarFileHash() ? chat.getAvatarFileHash() : null;

// 发送者昵称 + 头像
        String senderName = senderId;
        String senderAvatarHash = null;
        Classes.IUser senderUser = ProfileCache.getCachedUser(senderId);
        if (senderUser == null) {
            try { senderUser = ProfileCache.queryUserInfo(senderId).get(); } catch (Exception ignored) {}
        }
        if (senderUser != null) {
            if (senderUser.getNickname() != null && !senderUser.getNickname().isEmpty()) {
                senderName = senderUser.getNickname();
            }
            if (senderUser.hasAvatarFileHash()) {
                senderAvatarHash = senderUser.getAvatarFileHash();
            }
        }

// 自己的头像
        String myAvatarHash = acc.avatarFileHash;

// 发送通知
        NotificationHelper.get().notifyMessage(
                ctx, chatId, chatTitle, chatAvatarHash,
                notificationBody(msg.getText()), msg.getTime(),
                senderName, senderAvatarHash,
                channelId,
                myUserId, myNickname, myAvatarHash);

        Log.i(TAG, "notify: " + chatTitle + " / " + channelId + " / " + senderName);
    }

    // ============================================================
    //                      渠道判定
    // ============================================================

    /** @return null = 不通知 */
    private String decideChannel(String chatId, IMessage msg, String myUserId,
                                 LingCatClient client, String accessToken) {
        boolean repliedToMe = hasReplyToMe(chatId, msg, myUserId, client, accessToken);
        boolean mentionedMe = hasMentionMe(msg, myUserId);

        if (repliedToMe) return NotificationHelper.CHANNEL_REPLY;
        if (mentionedMe) return NotificationHelper.CHANNEL_MENTION;

        IChat chat = ProfileCache.getCachedChat(chatId);
        if (chat != null && "private".equals(chat.getType())) {
            return NotificationHelper.CHANNEL_PRIVATE;
        }
        return null;
    }

    private boolean hasReplyToMe(String chatId, IMessage msg, String myUserId,
                                 LingCatClient client, String accessToken) {
        for (IMessageEntity e : msg.getEntitiesList()) {
            if (!"reply".equals(e.getType())) continue;
            if (!e.hasData()) continue;

            int seq;
            try {
                seq = Integer.parseInt(e.getData().trim());
            } catch (Exception ex) {
                continue;
            }

            // 快路径：本地 LRU 命中
            if (MyMessageSeqs.contains(chatId, seq)) return true;

            // 慢路径：拉取该条消息确认发送者
            try {
                java.util.List<IMessage> list = ChatApi.getChatMessages(
                        client, accessToken, chatId,
                        seq + 1,        // before = seq+1 → 取 id <= seq
                        null,           // after
                        1,              // limit
                        15_000L);
                if (list != null && !list.isEmpty()) {
                    IMessage target = list.get(0);
                    if (target.getId() == seq
                            && myUserId.equals(target.getSenderUserId())) {
                        // 补回 LRU，下次命中
                        MyMessageSeqs.add(chatId, seq);
                        return true;
                    }
                }
            } catch (Exception ex) {
                Log.w(TAG, "fetch reply target failed: " + ex.getMessage());
            }
        }
        return false;
    }

    private boolean hasMentionMe(IMessage msg, String myUserId) {
        for (IMessageEntity e : msg.getEntitiesList()) {
            if (!"user_mention".equals(e.getType())) continue;
            if (myUserId.equals(e.getData())) return true;
        }
        return false;
    }

    // ============================================================
    //                      纯文本
    // ============================================================

    private static String notificationBody(String text) {
        if (text == null) return "";
        String s = text
                .replace("[回复]", "")
                .replace("[附件]", "[附件]");
        s = s.replaceAll("\\s+", " ").trim();
        if (s.length() > 120) s = s.substring(0, 120) + "…";
        return s;
    }
}