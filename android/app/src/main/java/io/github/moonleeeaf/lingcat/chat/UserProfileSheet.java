package io.github.moonleeeaf.lingcat.chat;

import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;

import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.imageview.ShapeableImageView;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import coil.Coil;
import coil.request.ImageRequest;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ProfileCache;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.FileUrlBuilder;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.classes.Classes.IUser;
import lingcat.client_protocol.ChatApi;
import lingcat.client_protocol.LingCatClient;

/**
 * 用户资料 BottomSheet。
 *
 * 入口：
 *   - 消息点头像
 *   - @提及点击
 *   - 长按头像菜单 → 用户资料
 *   - 私聊 ChatProfileSheet → 用户信息
 *
 * 所有操作自包含：打开私聊、复制字段、查看大图都在内部完成。
 */
public class UserProfileSheet {

    private static final long API_TIMEOUT_MS = 15_000L;
    private static final ExecutorService IO = Executors.newSingleThreadExecutor();
    private static final Handler MAIN = new Handler(Looper.getMainLooper());

    private final BottomSheetDialog dialog;
    private final String userId;
    @Nullable private final String currentChatId;

    private ShapeableImageView avatar;
    private TextView title;
    private TextView subtitle;
    private LinearLayout actionsContainer;

    /** 当前渲染的用户资料，供"打开对话"用昵称 */
    private IUser renderedUser;

    private UserProfileSheet(Context ctx, String userId,
                             @Nullable String currentChatId) {
        this.userId = userId;
        this.currentChatId = currentChatId;

        dialog = new BottomSheetDialog(ctx);
        buildUi(ctx);
        bindData();
    }

    public static void show(Context ctx, String userId,
                            @Nullable String currentChatId) {
        if (ctx == null || userId == null || userId.isEmpty()) return;
        new UserProfileSheet(ctx, userId, currentChatId).dialog.show();
    }

    // ============================================================
    //                      UI
    // ============================================================

    private void buildUi(Context ctx) {
        LinearLayout root = new LinearLayout(ctx);
        root.setOrientation(LinearLayout.VERTICAL);

        View header = LayoutInflater.from(ctx)
                .inflate(R.layout.sheet_header_profile, root, false);
        avatar   = header.findViewById(R.id.sheet_avatar);
        title    = header.findViewById(R.id.sheet_title);
        subtitle = header.findViewById(R.id.sheet_subtitle);
        root.addView(header);

        actionsContainer = new LinearLayout(ctx);
        actionsContainer.setOrientation(LinearLayout.VERTICAL);
        root.addView(actionsContainer);

        dialog.setContentView(root);
    }

    // ============================================================
    //                      数据
    // ============================================================

    private void bindData() {
        IUser cached = ProfileCache.getCachedUser(userId);
        if (cached != null) render(cached);

        CompletableFuture<IUser> f = ProfileCache.queryUserInfo(userId);
        f.thenAccept(u -> {
            if (avatar == null) return;
            MAIN.post(() -> {
                if (avatar == null) return;
                render(u);
            });
        });
    }

    private void render(IUser user) {
        if (user == null) return;
        renderedUser = user;

        title.setText(user.getNickname() != null ? user.getNickname() : userId);

        if (user.hasUsername() && !TextUtils.isEmpty(user.getUsername())) {
            subtitle.setText("@" + user.getUsername());
            subtitle.setVisibility(View.VISIBLE);
        } else {
            subtitle.setVisibility(View.GONE);
        }

        loadAvatar(user.getAvatarFileHash());
        avatar.setOnClickListener(v -> {
            String url = currentAvatarUrl(user.getAvatarFileHash());
            if (url != null) {
                ImageViewerActivity.show(avatar.getContext(), url);
            }
        });

        buildActions(user);
    }

    private void buildActions(IUser user) {
        Context ctx = actionsContainer.getContext();
        actionsContainer.removeAllViews();

        // 用户名
        if (user.hasUsername() && !TextUtils.isEmpty(user.getUsername())) {
            actionsContainer.addView(makeItem(ctx,
                    R.drawable.ic_alternate_email,
                    user.getUsername(),
                    "用户名",
                    () -> copy(ctx, user.getUsername(), "用户名已复制")));
        }

        // 简介
        if (user.hasDescription() && !TextUtils.isEmpty(user.getDescription())) {
            actionsContainer.addView(makeItem(ctx,
                    R.drawable.ic_description,
                    user.getDescription(),
                    "简介",
                    () -> copy(ctx, user.getDescription(), "简介已复制")));
        }

        // 用户 ID
        actionsContainer.addView(makeItem(ctx,
                R.drawable.ic_info,
                user.getId(),
                "用户 ID",
                () -> copy(ctx, user.getId(), "用户 ID 已复制")));

        // 打开对话（自包含）
        actionsContainer.addView(makeItem(ctx,
                R.drawable.ic_chat_bubble,
                "打开对话",
                null,
                this::openPrivateChat));
    }

    // ============================================================
    //                      打开私聊（自包含）
    // ============================================================

    private void openPrivateChat() {
        final Context ctx = actionsContainer.getContext();

        LingCatClient client = LingCatClientManager.getInstance().getCurrent();
        ServerConfig server = LingCatClientManager.getInstance().getCurrentServer();
        if (client == null || server == null) {
            toast(ctx, "连接已断开");
            return;
        }
        Account acc = AppDataStore.data().getActiveAccount(server.url);
        if (acc == null || acc.accessToken == null) {
            toast(ctx, "登录已失效");
            return;
        }

        final LingCatClient fClient = client;
        final String fToken = acc.accessToken;

        IO.execute(() -> {
            try {
                String targetChatId = ChatApi.getOrCreatePrivateChat(
                        fClient, fToken, userId, API_TIMEOUT_MS);
                if (targetChatId == null) return;

                // 已是当前对话 → 只关 Sheet
                if (currentChatId != null && currentChatId.equals(targetChatId)) {
                    MAIN.post(dialog::dismiss);
                    return;
                }

                // 优先用已渲染的昵称做标题
                final String finalTitle;
                IUser u = renderedUser;
                if (u != null && u.getNickname() != null && !u.getNickname().isEmpty()) {
                    finalTitle = u.getNickname();
                } else {
                    finalTitle = userId;
                }

                final String finalChatId = targetChatId;
                MAIN.post(() -> {
                    Intent i = new Intent(ctx, ChatActivity.class);
                    i.putExtra(ChatActivity.EXTRA_CHAT_ID, finalChatId);
                    i.putExtra(ChatActivity.EXTRA_CHAT_TITLE, finalTitle);
                    ctx.startActivity(i);
                    dialog.dismiss();
                });
            } catch (Exception e) {
                MAIN.post(() -> toast(ctx, "打开对话失败: " + e.getMessage()));
            }
        });
    }

    // ============================================================
    //                      工具
    // ============================================================

    private View makeItem(Context ctx, int iconRes,
                          String text, @Nullable String subtext,
                          @Nullable Runnable onClick) {
        View v = LayoutInflater.from(ctx)
                .inflate(R.layout.sheet_action_item, actionsContainer, false);
        ImageView icon = v.findViewById(R.id.sheet_icon);
        TextView tvText = v.findViewById(R.id.sheet_text);
        TextView tvSub = v.findViewById(R.id.sheet_subtext);

        if (iconRes != 0) icon.setImageResource(iconRes);
        else icon.setVisibility(View.GONE);

        tvText.setText(text);
        if (subtext != null && !subtext.isEmpty()) {
            tvSub.setText(subtext);
            tvSub.setVisibility(View.VISIBLE);
            v.setOnLongClickListener(vv -> {
                copy(ctx, text, "已复制");
                return true;
            });
        } else {
            tvSub.setVisibility(View.GONE);
        }

        if (onClick != null) v.setOnClickListener(vv -> onClick.run());
        return v;
    }

    private void copy(Context ctx, String text, String toast) {
        android.content.ClipboardManager cm =
                (android.content.ClipboardManager) ctx.getSystemService(Context.CLIPBOARD_SERVICE);
        cm.setPrimaryClip(android.content.ClipData.newPlainText("lingcat", text));
        toast(ctx, toast);
    }

    private void toast(Context ctx, String msg) {
        android.widget.Toast.makeText(ctx, msg, android.widget.Toast.LENGTH_SHORT).show();
    }

    private void loadAvatar(String hash) {
        String url = currentAvatarUrl(hash);
        Object src = (url != null) ? url : R.drawable.ic_default_avatar;

        ImageRequest req = new ImageRequest.Builder(avatar.getContext())
                .data(src)
                .crossfade(true)
                .placeholder(R.drawable.ic_default_avatar)
                .error(R.drawable.ic_default_avatar)
                .target(avatar)
                .build();
        Coil.imageLoader(avatar.getContext()).enqueue(req);
    }

    @Nullable
    private String currentAvatarUrl(String hash) {
        if (hash == null || hash.isEmpty()) return null;
        ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
        if (s == null) return null;
        return FileUrlBuilder.fileUrl(s.getHttpUrl(), hash);
    }
}