package io.github.moonleeeaf.lingcat.app;

import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.util.Log;

import androidx.core.app.RemoteInput;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.client_protocol.ChatApi;
import lingcat.client_protocol.LingCatClient;
import lingcat.client_protocol.MessageParser;

/**
 * 接收通知里的直接回复。
 */
public class ReplyReceiver extends BroadcastReceiver {

    private static final String TAG = "ReplyReceiver";

    public static final String ACTION_REPLY = "io.github.moonleeeaf.lingcat.ACTION_REPLY";

    public static final String EXTRA_CHAT_ID = "chat_id";
    public static final String EXTRA_CHAT_TITLE = "chat_title";
    public static final String EXTRA_NOTIF_ID = "notif_id";
    public static final String EXTRA_CHANNEL_ID = "channel_id";
    public static final String EXTRA_SERVER_URL = "server_url";

    private static final ExecutorService IO = Executors.newSingleThreadExecutor();

    @Override
    public void onReceive(Context ctx, Intent intent) {
        if (!ACTION_REPLY.equals(intent.getAction())) return;

        String chatId = intent.getStringExtra(EXTRA_CHAT_ID);
        String chatTitle = intent.getStringExtra(EXTRA_CHAT_TITLE);
        String channelId = intent.getStringExtra(EXTRA_CHANNEL_ID);
        String serverUrl = intent.getStringExtra(EXTRA_SERVER_URL);

        Bundle results = RemoteInput.getResultsFromIntent(intent);
        if (results == null) return;

        CharSequence reply = results.getCharSequence(NotificationHelper.KEY_REPLY);
        if (TextUtils.isEmpty(reply)) return;

        String replyText = reply.toString().trim();
        if (replyText.isEmpty()) return;

        Context appCtx = ctx.getApplicationContext();

        IO.execute(() -> {
            try {
                LingCatClientManager mgr = LingCatClientManager.getInstance();
                LingCatClient client = mgr.getCurrent();
                ServerConfig server = mgr.getCurrentServer();
                if (client == null || server == null) {
                    Log.w(TAG, "no active client");
                    return;
                }
                Account acc = AppDataStore.data().getActiveAccount(server.url);
                if (acc == null || acc.accessToken == null) {
                    Log.w(TAG, "no active account");
                    return;
                }

                MessageParser.ParsedMessage parsed = MessageParser.parseMessage(replyText);
                ChatApi.sendChatMessage(client, acc.accessToken, chatId,
                        parsed.text, parsed.entities, 15_000L);

                // 发送成功 → 更新通知（显示"我发的"）
                String myNickname = acc.nickname != null ? acc.nickname : "我";
                String myAvatarHash = acc.avatarFileHash;
                NotificationHelper.get().appendMyReply(
                        appCtx, chatId, chatTitle, replyText, channelId,
                        myNickname, myAvatarHash);

                Log.i(TAG, "reply sent: " + replyText);
            } catch (Exception e) {
                Log.e(TAG, "reply failed", e);
                // 失败：可取消通知或提示——暂时简单处理，保留原通知
            }
        });
    }
}