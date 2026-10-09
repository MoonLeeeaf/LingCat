package io.github.moonleeeaf.lingcat.app;

import android.annotation.SuppressLint;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Build;
import android.util.LruCache;

import androidx.annotation.RequiresApi;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.Person;
import androidx.core.app.RemoteInput;
import androidx.core.graphics.drawable.IconCompat;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.chat.ChatActivity;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.FileUrlBuilder;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.client_protocol.HttpClientProvider;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;

/**
 * 通知发送核心。
 * 每个 chat 复用同一个 notificationId（= chatId.hashCode()），
 * 使用 MessagingStyle 累积消息，系统自动折叠成对话样式。
 */
public final class NotificationHelper {

    public static final String CHANNEL_PRIVATE = "msg_private";
    public static final String CHANNEL_MENTION = "msg_mention";
    public static final String CHANNEL_REPLY   = "msg_reply";
    public static final String CHANNEL_KEEPALIVE = "keepalive";

    public static final String KEY_REPLY = "key_reply";

    private static final int MAX_STYLE_MESSAGES = 8;

    /** 头像缓存 */
    private static final LruCache<String, Bitmap> AVATAR_CACHE = new LruCache<>(64);

    private static volatile NotificationHelper INSTANCE;

    public static NotificationHelper get() {
        if (INSTANCE == null) {
            synchronized (NotificationHelper.class) {
                if (INSTANCE == null) INSTANCE = new NotificationHelper();
            }
        }
        return INSTANCE;
    }

    private NotificationHelper() {}

    // ============================================================
    //                      数据
    // ============================================================

    public static class Entry {
        public final CharSequence text;
        public final long time;
        /** 用于显示名字；null 表示"我发的"，会替换成 myNickname */
        public final CharSequence sender;
        /** 用户头像的 hash（可为空） */
        public final String avatarHash;

        public Entry(CharSequence text, long time, CharSequence sender, String avatarHash) {
            this.text = text;
            this.time = time;
            this.sender = sender;
            this.avatarHash = avatarHash;
        }
    }

    /** chatId -> 消息历史 */
    private final Map<String, List<Entry>> history = new LinkedHashMap<>();
    /** chatId -> 对话头像 hash（首条消息时记录） */
    private final Map<String, String> chatAvatarHashes = new LinkedHashMap<>();

    // ============================================================
    //                      渠道
    // ============================================================

    public void ensureChannels(Context ctx) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;

        NotificationManager nm = ctx.getSystemService(NotificationManager.class);
        if (nm == null) return;

        createChannel(nm, CHANNEL_PRIVATE, "私聊消息", "来自私聊的新消息");
        createChannel(nm, CHANNEL_MENTION, "@我的消息", "群里 @我 的消息");
        createChannel(nm, CHANNEL_REPLY,   "被回复消息", "有人回复了我的消息");
        createSilentChannel(nm, CHANNEL_KEEPALIVE, "后台连接", "保持与服务器的长连接");
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private void createSilentChannel(NotificationManager nm, String id, String name, String desc) {
        if (nm.getNotificationChannel(id) != null) return;
        NotificationChannel ch = new NotificationChannel(id, name, NotificationManager.IMPORTANCE_LOW);
        ch.setDescription(desc);
        ch.setShowBadge(false);
        ch.enableVibration(false);
        ch.setSound(null, null);
        nm.createNotificationChannel(ch);
    }

    @RequiresApi(api = Build.VERSION_CODES.O)
    private void createChannel(NotificationManager nm, String id, String name, String desc) {
        NotificationChannel ch = nm.getNotificationChannel(id);
        if (ch == null) {
            ch = new NotificationChannel(id, name, NotificationManager.IMPORTANCE_HIGH);
            ch.setDescription(desc);
            ch.enableVibration(true);
            nm.createNotificationChannel(ch);
        }
    }

    // ============================================================
    //                      发送通知
    // ============================================================

    public void notifyMessage(Context ctx,
                              String chatId, String chatTitle,
                              String chatAvatarHash,
                              String msgText, long msgTime,
                              String senderName, String senderAvatarHash,
                              String channelId,
                              String myUserId, String myNickname, String myAvatarHash) {
        if (chatId == null) return;

        if (chatAvatarHash != null && !chatAvatarHash.isEmpty()) {
            chatAvatarHashes.put(chatId, chatAvatarHash);
        }

        List<Entry> list = history.computeIfAbsent(chatId, k -> new ArrayList<>());
        list.add(new Entry(msgText, msgTime, senderName, senderAvatarHash));
        if (list.size() > MAX_STYLE_MESSAGES) list.remove(0);

        buildAndNotify(ctx, chatId, chatTitle, channelId,
                myNickname, myAvatarHash);
    }

    public void appendMyReply(Context ctx,
                              String chatId, String chatTitle,
                              String replyText, String channelId,
                              String myNickname, String myAvatarHash) {
        if (chatId == null) return;

        List<Entry> list = history.computeIfAbsent(chatId, k -> new ArrayList<>());
        // sender 用 myNickname 明确标记"我发的"
        list.add(new Entry(replyText, System.currentTimeMillis(),
                myNickname, myAvatarHash));
        if (list.size() > MAX_STYLE_MESSAGES) list.remove(0);

        buildAndNotify(ctx, chatId, chatTitle, channelId,
                myNickname, myAvatarHash);
    }

    @SuppressLint("MissingPermission")
    private void buildAndNotify(Context ctx, String chatId, String chatTitle,
                                String channelId,
                                String myNickname, String myAvatarHash) {
        List<Entry> list = history.get(chatId);
        if (list == null || list.isEmpty()) return;

        int notifId = chatId.hashCode();

        // 点击通知 → ChatActivity
        Intent clickIntent = new Intent(ctx, ChatActivity.class);
        clickIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        clickIntent.putExtra(ChatActivity.EXTRA_CHAT_ID, chatId);
        clickIntent.putExtra(ChatActivity.EXTRA_CHAT_TITLE, chatTitle);
        PendingIntent contentPi = PendingIntent.getActivity(
                ctx, notifId, clickIntent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

        // 对话头像 → largeIcon
        Bitmap chatAvatar = loadAvatarSync(ctx, chatAvatarHashes.get(chatId));
        Bitmap myAvatar = loadAvatarSync(ctx, myAvatarHash);

        // MessagingStyle
        NotificationCompat.MessagingStyle style;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            // API 28+：用 Person，可以显示每条消息的头像
            Person me = buildPerson(myNickname != null ? myNickname : "我", myAvatar);
            style = new NotificationCompat.MessagingStyle(me);
            style.setConversationTitle(chatTitle);

            for (Entry e : list) {
                boolean isMe = (e.sender == null || e.sender.equals(myNickname));
                Person sender = isMe
                        ? me
                        : buildPerson(e.sender, loadAvatarSync(ctx, e.avatarHash));
                style.addMessage(new NotificationCompat.MessagingStyle.Message(
                        e.text, e.time, sender));
            }
        } else {
            // API 24-27：降级，无用户头像
            style = new NotificationCompat.MessagingStyle(
                    (CharSequence) (myNickname != null ? myNickname : "我"));
            style.setConversationTitle(chatTitle);
            for (Entry e : list) {
                style.addMessage(new NotificationCompat.MessagingStyle.Message(
                        e.text, e.time, e.sender));
            }
        }

        // Reply Action
        NotificationCompat.Action replyAction = buildReplyAction(
                ctx, chatId, chatTitle, notifId, channelId);

        NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, channelId)
                .setSmallIcon(R.drawable.ic_notifications)
                .setStyle(style)
                .setContentIntent(contentPi)
                .setAutoCancel(true)
                .setOnlyAlertOnce(false)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setCategory(NotificationCompat.CATEGORY_MESSAGE)
                .setWhen(list.get(list.size() - 1).time)
                .addAction(replyAction);

        if (chatAvatar != null) {
            b.setLargeIcon(chatAvatar);
        }

        NotificationManagerCompat.from(ctx).notify(notifId, b.build());
    }

    private Person buildPerson(CharSequence name, Bitmap icon) {
        Person.Builder b = new Person.Builder().setName(name);
        if (icon != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            b.setIcon(IconCompat.createWithBitmap(icon));
        }
        return b.build();
    }

    // ============================================================
    //                      头像加载
    // ============================================================

    private Bitmap loadAvatarSync(Context ctx, String hash) {
        if (hash == null || hash.isEmpty()) return null;
        ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
        if (s == null) return null;
        String url = FileUrlBuilder.fileUrl(s.getHttpUrl(), hash);
        if (url == null) return null;

        Bitmap cached = AVATAR_CACHE.get(url);
        if (cached != null) return cached;

        try {
            OkHttpClient http = HttpClientProvider.get();
            Request.Builder rb = new Request.Builder().url(url);
            String token = LingCatClientManager.getInstance().getFileAccessToken();
            if (token != null && !token.isEmpty()) {
                rb.header("Cookie", "file_access_token=" + token);
            }
            try (Response resp = http.newCall(rb.build()).execute()) {
                if (!resp.isSuccessful() || resp.body() == null) return null;
                Bitmap bmp = BitmapFactory.decodeStream(resp.body().byteStream());
                if (bmp != null) AVATAR_CACHE.put(url, bmp);
                return bmp;
            }
        } catch (Exception e) {
            return null;
        }
    }

    // ============================================================
    //                      Reply Action
    // ============================================================

    private NotificationCompat.Action buildReplyAction(Context ctx,
                                                       String chatId, String chatTitle,
                                                       int notifId, String channelId) {
        Intent intent = new Intent(ctx, ReplyReceiver.class);
        intent.setAction(ReplyReceiver.ACTION_REPLY);
        intent.putExtra(ReplyReceiver.EXTRA_CHAT_ID, chatId);
        intent.putExtra(ReplyReceiver.EXTRA_CHAT_TITLE, chatTitle);
        intent.putExtra(ReplyReceiver.EXTRA_NOTIF_ID, notifId);
        intent.putExtra(ReplyReceiver.EXTRA_CHANNEL_ID, channelId);

        PendingIntent pi = PendingIntent.getBroadcast(
                ctx, notifId, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_MUTABLE);

        RemoteInput remoteInput = new RemoteInput.Builder(KEY_REPLY)
                .setLabel("回复")
                .build();

        return new NotificationCompat.Action.Builder(
                R.drawable.ic_reply, "回复", pi)
                .addRemoteInput(remoteInput)
                .setAllowGeneratedReplies(true)
                .build();
    }

    // ============================================================
    //                      清除
    // ============================================================

    public void cancel(Context ctx, String chatId) {
        if (chatId == null) return;
        history.remove(chatId);
        chatAvatarHashes.remove(chatId);
        NotificationManagerCompat.from(ctx).cancel(chatId.hashCode());
    }

    public void cancelAll(Context ctx) {
        history.clear();
        chatAvatarHashes.clear();
        NotificationManagerCompat.from(ctx).cancelAll();
    }
}