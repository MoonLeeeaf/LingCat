package io.github.moonleeeaf.lingcat.chat;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

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
import lingcat.classes.Classes.IChat;
import lingcat.client_protocol.ChatApi;
import lingcat.client_protocol.LingCatClient;

/**
 * 对话资料 BottomSheet。
 *
 * 入口：
 *   - ChatActivity 顶部标题点击（currentChatId = chatId）
 *   - 会话列表长按菜单 → 对话信息（currentChatId = null）
 */
public class ChatProfileSheet {

    private static final ExecutorService IO = Executors.newSingleThreadExecutor();
    private static final long API_TIMEOUT_MS = 15_000L;

    private final BottomSheetDialog dialog;
    private final String chatId;
    @Nullable private final String currentChatId;

    private ShapeableImageView avatar;
    private TextView title;
    private LinearLayout actionsContainer;

    // 收藏状态（动态刷新）
    private boolean favourited;
    private View favItem;
    private ImageView favIcon;
    private TextView favText;

    private ChatProfileSheet(Context ctx, String chatId, @Nullable String currentChatId) {
        this.chatId = chatId;
        this.currentChatId = currentChatId;
        this.dialog = new BottomSheetDialog(ctx);
        buildUi(ctx);
        bindData();
    }

    public static void show(Context ctx, String chatId, @Nullable String currentChatId) {
        if (ctx == null || chatId == null || chatId.isEmpty()) return;
        new ChatProfileSheet(ctx, chatId, currentChatId).dialog.show();
    }

    // ============================================================
    //                      UI
    // ============================================================

    private void buildUi(Context ctx) {
        LinearLayout root = new LinearLayout(ctx);
        root.setOrientation(LinearLayout.VERTICAL);

        View header = LayoutInflater.from(ctx)
                .inflate(R.layout.sheet_header_profile, root, false);
        avatar = header.findViewById(R.id.sheet_avatar);
        title = header.findViewById(R.id.sheet_title);
        TextView subtitle = header.findViewById(R.id.sheet_subtitle);
        subtitle.setVisibility(View.GONE);   // ChatProfile 不用副标题
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
        IChat cached = ProfileCache.getCachedChat(chatId);
        if (cached != null) render(cached);

        CompletableFuture<IChat> f = ProfileCache.queryChatInfo(chatId);
        f.thenAccept(c -> {
            if (avatar == null) return;
            avatar.post(() -> {
                if (avatar == null) return;
                render(c);
            });
        }).exceptionally(e -> {
            if (avatar != null) {
                avatar.post(() -> Toast.makeText(avatar.getContext(),
                        "加载失败: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            }
            return null;
        });
    }

    private void render(IChat chat) {
        if (chat == null) return;

        String t = chat.getTitle();
        if (t == null || t.isEmpty()) {
            t = (chat.getChatUnique() != null && !chat.getChatUnique().isEmpty())
                    ? chat.getChatUnique() : chat.getId();
        }
        title.setText(t);

        loadAvatar(chat.getAvatarFileHash());
        avatar.setOnClickListener(v -> {
            String url = currentAvatarUrl(chat.getAvatarFileHash());
            if (url != null) ImageViewerActivity.show(avatar.getContext(), url);
        });

        buildActions(chat);
    }

    private void buildActions(IChat chat) {
        Context ctx = actionsContainer.getContext();
        actionsContainer.removeAllViews();

        // 对话 ID
        actionsContainer.addView(makeItem(ctx, R.drawable.ic_info,
                chat.getId(), "对话 ID",
                () -> copy(ctx, chat.getId(), "对话 ID 已复制")));

        // 对话类型
        boolean isPrivate = "private".equals(chat.getType());
        actionsContainer.addView(makeItem(ctx,
                isPrivate ? R.drawable.ic_person : R.drawable.ic_group,
                isPrivate ? "私聊" : "群组",
                "对话类型",
                null));

        // 对话标识符（可选）
        if (chat.hasChatUnique() && !TextUtils.isEmpty(chat.getChatUnique())) {
            String uniq = chat.getChatUnique();
            actionsContainer.addView(makeItem(ctx, R.drawable.ic_alternate_email,
                    uniq, "对话标识符",
                    () -> copy(ctx, uniq, "标识符已复制")));
        }

        // 简介（可选）
        if (chat.hasDescription() && !TextUtils.isEmpty(chat.getDescription())) {
            String desc = chat.getDescription();
            actionsContainer.addView(makeItem(ctx, R.drawable.ic_description,
                    desc, "简介",
                    () -> copy(ctx, desc, "简介已复制")));
        }

        // 私聊：用户信息
        if (isPrivate) {
            actionsContainer.addView(makeItem(ctx, R.drawable.ic_info,
                    "用户信息", null,
                    this::openUserInfo));
        }

        // 收藏/取消收藏
        favourited = LingCatClientManager.getInstance().isFavourited(chatId);
        favItem = makeItem(ctx,
                favourited ? R.drawable.ic_favorite : R.drawable.ic_favorite_border,
                favourited ? "取消收藏" : "收藏对话",
                null,
                this::toggleFavourite);
        favIcon = favItem.findViewById(R.id.sheet_icon);
        favText = favItem.findViewById(R.id.sheet_text);
        actionsContainer.addView(favItem);

        // 打开对话
        actionsContainer.addView(makeItem(ctx, R.drawable.ic_chat_bubble,
                "打开对话", null,
                this::openChat));
    }

    // ============================================================
    //                      交互
    // ============================================================

    private void toggleFavourite() {
        final Context ctx = actionsContainer.getContext();
        ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
        LingCatClient client = LingCatClientManager.getInstance().getCurrent();
        if (s == null || client == null) return;
        Account acc = AppDataStore.data().getActiveAccount(s.url);
        if (acc == null || acc.accessToken == null) return;

        final boolean newState = !favourited;

        IO.execute(() -> {
            try {
                ChatApi.setChatFavourited(client, acc.accessToken, chatId, newState, API_TIMEOUT_MS);
                LingCatClientManager.getInstance().setFavourited(chatId, newState);

                if (favItem == null) return;
                favItem.post(() -> {
                    favourited = newState;
                    favIcon.setImageResource(newState
                            ? R.drawable.ic_favorite
                            : R.drawable.ic_favorite_border);
                    favText.setText(newState ? "取消收藏" : "收藏对话");
                });
            } catch (Exception e) {
                if (favItem != null) {
                    favItem.post(() -> Toast.makeText(ctx,
                            "操作失败: " + e.getMessage(), Toast.LENGTH_SHORT).show());
                }
            }
        });
    }

    private void openUserInfo() {
        final Context ctx = actionsContainer.getContext();
        ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
        LingCatClient client = LingCatClientManager.getInstance().getCurrent();
        if (s == null || client == null) return;
        Account acc = AppDataStore.data().getActiveAccount(s.url);
        if (acc == null || acc.accessToken == null) return;

        IO.execute(() -> {
            try {
                String otherUserId = ChatApi.getAnotherUserFromPrivateChat(
                        client, acc.accessToken, chatId, API_TIMEOUT_MS);
                if (otherUserId == null) return;

                actionsContainer.post(() -> {
                    dialog.dismiss();
                    UserProfileSheet.show(ctx, otherUserId, currentChatId);
                });
            } catch (Exception e) {
                actionsContainer.post(() -> Toast.makeText(ctx,
                        "获取用户失败: " + e.getMessage(), Toast.LENGTH_SHORT).show());
            }
        });
    }

    /**
     * 打开对话：
     *   currentChatId == null → 直接打开
     *   currentChatId == chatId → 关闭 Sheet
     *   currentChatId != chatId → 打开
     */
    private void openChat() {
        Context ctx = actionsContainer.getContext();
        dialog.dismiss();

        if (currentChatId != null && currentChatId.equals(chatId)) {
            return;   // 已是当前对话，不需要再打开
        }

        Intent i = new Intent(ctx, ChatActivity.class);
        i.putExtra(ChatActivity.EXTRA_CHAT_ID, chatId);
        i.putExtra(ChatActivity.EXTRA_CHAT_TITLE,
                title.getText() != null ? title.getText().toString() : null);
        ctx.startActivity(i);
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
            // 有 subtext = "值 + 说明"，长按复制
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
        ClipboardManager cm = (ClipboardManager) ctx.getSystemService(Context.CLIPBOARD_SERVICE);
        cm.setPrimaryClip(ClipData.newPlainText("lingcat", text));
        Toast.makeText(ctx, toast, Toast.LENGTH_SHORT).show();
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