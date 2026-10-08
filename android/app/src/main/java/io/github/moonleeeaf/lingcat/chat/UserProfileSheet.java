package io.github.moonleeeaf.lingcat.chat;

import android.content.Context;
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

import coil.Coil;
import coil.request.ImageRequest;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.data.ProfileCache;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.FileUrlBuilder;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.classes.Classes.IUser;

/**
 * 用户资料 BottomSheet。
 *
 * 入口：
 *   - 消息点头像
 *   - @提及点击
 *   - 长按头像菜单 → 用户资料
 *   - 私聊 ChatProfileSheet → 用户信息
 */
public class UserProfileSheet {

    public interface Listener {
        /** 点"打开对话" */
        void onOpenChat(String userId);
        /** 点"提及用户" */
        void onMention(String userId);
        /** 判断是否要显示"打开对话"（已经是私聊对象时可以隐藏，或显示但只关闭） */
        default boolean shouldShowOpenChat() { return true; }
    }

    private final BottomSheetDialog dialog;
    private final String userId;
    private final String currentChatId;
    private final Listener listener;

    private ShapeableImageView avatar;
    private TextView title;
    private TextView subtitle;
    private LinearLayout actionsContainer;

    private UserProfileSheet(Context ctx, String userId,
                             @Nullable String currentChatId,
                             @Nullable Listener listener) {
        this.userId = userId;
        this.currentChatId = currentChatId;
        this.listener = listener;

        dialog = new BottomSheetDialog(ctx);
        buildUi(ctx);
        bindData();
    }

    public static void show(Context ctx, String userId,
                            @Nullable String currentChatId,
                            @Nullable Listener listener) {
        if (ctx == null || userId == null || userId.isEmpty()) return;
        new UserProfileSheet(ctx, userId, currentChatId, listener).dialog.show();
    }

    // ============================================================
    //                      UI
    // ============================================================

    private void buildUi(Context ctx) {
        LinearLayout root = new LinearLayout(ctx);
        root.setOrientation(LinearLayout.VERTICAL);

        // Header
        View header = LayoutInflater.from(ctx)
                .inflate(R.layout.sheet_header_profile, root, false);
        avatar   = header.findViewById(R.id.sheet_avatar);
        title    = header.findViewById(R.id.sheet_title);
        subtitle = header.findViewById(R.id.sheet_subtitle);
        root.addView(header);

        // Actions
        actionsContainer = new LinearLayout(ctx);
        actionsContainer.setOrientation(LinearLayout.VERTICAL);
        root.addView(actionsContainer);

        dialog.setContentView(root);
    }

    // ============================================================
    //                      数据
    // ============================================================

    private void bindData() {
        // 缓存秒开
        IUser cached = ProfileCache.getCachedUser(userId);
        if (cached != null) render(cached);

        // 异步刷新
        CompletableFuture<IUser> f = ProfileCache.queryUserInfo(userId);
        f.thenAccept(u -> {
            if (avatar == null) return;
            avatar.post(() -> {
                if (avatar == null) return;
                render(u);
            });
        });
    }

    private void render(IUser user) {
        if (user == null) return;

        title.setText(user.getNickname() != null ? user.getNickname() : userId);

        if (user.hasUsername() && !TextUtils.isEmpty(user.getUsername())) {
            subtitle.setText("@" + user.getUsername());
            subtitle.setVisibility(View.VISIBLE);
        } else {
            subtitle.setVisibility(View.GONE);
        }

        // 头像
        loadAvatar(user.getAvatarFileHash());
        avatar.setOnClickListener(v -> {
            String url = currentAvatarUrl(user.getAvatarFileHash());
            if (url != null) {
                ImageViewerActivity.show(avatar.getContext(), url);
            }
        });

        // Actions
        buildActions(user);
    }

    private void buildActions(IUser user) {
        Context ctx = actionsContainer.getContext();
        actionsContainer.removeAllViews();

        // 用户名（复制）
        if (user.hasUsername() && !TextUtils.isEmpty(user.getUsername())) {
            actionsContainer.addView(makeItem(ctx,
                    R.drawable.ic_alternate_email,
                    user.getUsername(),
                    "用户名",
                    () -> copy(ctx, user.getUsername(), "用户名已复制")));
        }

        // 简介（复制）
        if (user.hasDescription() && !TextUtils.isEmpty(user.getDescription())) {
            actionsContainer.addView(makeItem(ctx,
                    R.drawable.ic_description,
                    user.getDescription(),
                    "简介",
                    () -> copy(ctx, user.getDescription(), "简介已复制")));
        }

        // 用户 ID（复制）
        actionsContainer.addView(makeItem(ctx,
                R.drawable.ic_info,
                user.getId(),
                "用户 ID",
                () -> copy(ctx, user.getId(), "用户 ID 已复制")));

        // 打开对话
        if (listener == null || listener.shouldShowOpenChat()) {
            actionsContainer.addView(makeItem(ctx,
                    R.drawable.ic_chat_bubble,
                    "打开对话",
                    null,
                    () -> {
                        dialog.dismiss();
                        if (listener != null) listener.onOpenChat(user.getId());
                    }));
        }

        // 提及用户（仅在某个聊天页打开时）
        /*
        if (listener != null && currentChatId != null) {
            actionsContainer.addView(makeItem(ctx,
                    R.drawable.ic_alternate_email,
                    "提及用户",
                    null,
                    () -> {
                        dialog.dismiss();
                        listener.onMention(user.getId());
                    }));

        }*/
    }

    // ============================================================
    //                      工具
    // ============================================================

    private View makeItem(Context ctx, int iconRes,
                          String text, @Nullable String subtext,
                          Runnable onClick) {
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
            // 有 subtext 说明是"值 + 说明"，长按复制
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
        android.widget.Toast.makeText(ctx, toast, android.widget.Toast.LENGTH_SHORT).show();
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