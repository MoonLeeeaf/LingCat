package io.github.moonleeeaf.lingcat.chat;

import android.content.Context;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import moon3.widget.Switch;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;

import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.button.MaterialButton;
import com.google.android.material.imageview.ShapeableImageView;

import org.json.JSONObject;

import java.util.LinkedHashMap;
import java.util.Map;
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
import lingcat.classes.Classes.IChatAdmin;
import lingcat.classes.Classes.IUser;
import lingcat.client_protocol.ChatApi;
import lingcat.client_protocol.LingCatClient;

/**
 * 编辑管理员权限 BottomSheet。
 */
public class EditAdminPermissionsSheet {

    public interface OnSaved {
        void onSaved();
    }

    private static final long API_TIMEOUT_MS = 15_000L;
    private static final ExecutorService IO = Executors.newSingleThreadExecutor();

    private final BottomSheetDialog dialog;
    private final String chatId;
    private final IChatAdmin admin;
    private final OnSaved onSaved;

    /** key → 是否勾选 */
    private final Map<String, Boolean> perms = new LinkedHashMap<>();
    private final Map<String, Switch> switches = new LinkedHashMap<>();

    private EditAdminPermissionsSheet(Context ctx, String chatId,
                                      IChatAdmin admin, @Nullable OnSaved onSaved) {
        this.chatId = chatId;
        this.admin = admin;
        this.onSaved = onSaved;
        this.dialog = new BottomSheetDialog(ctx);

        // 解析已有权限
        try {
            JSONObject obj = new JSONObject(admin.getPermissions());
            for (String key : PermissionNames.ALL.keySet()) {
                perms.put(key, obj.optBoolean(key, false));
            }
        } catch (Exception e) {
            for (String key : PermissionNames.ALL.keySet()) perms.put(key, false);
        }

        buildUi(ctx);
    }

    public static void show(Context ctx, String chatId, IChatAdmin admin,
                            @Nullable OnSaved onSaved) {
        if (ctx == null || chatId == null || admin == null) return;
        new EditAdminPermissionsSheet(ctx, chatId, admin, onSaved).dialog.show();
    }

    // ============================================================
    //                      UI
    // ============================================================

    private void buildUi(Context ctx) {
        LinearLayout root = new LinearLayout(ctx);
        root.setOrientation(LinearLayout.VERTICAL);

        // Header: 头像 + 昵称 + role
        LinearLayout header = new LinearLayout(ctx);
        header.setOrientation(LinearLayout.HORIZONTAL);
        header.setGravity(Gravity.CENTER_VERTICAL);
        int padH = dp(ctx, 24);
        int padV = dp(ctx, 20);
        header.setPadding(padH, padV, padH, dp(ctx, 12));

        ShapeableImageView avatar = new ShapeableImageView(ctx);
        LinearLayout.LayoutParams avLp = new LinearLayout.LayoutParams(dp(ctx, 56), dp(ctx, 56));
        avLp.setMarginEnd(dp(ctx, 16));
        avatar.setLayoutParams(avLp);
        avatar.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
        avatar.setImageResource(R.drawable.ic_default_avatar);
        com.google.android.material.shape.ShapeAppearanceModel model =
                com.google.android.material.shape.ShapeAppearanceModel.builder()
                        .setAllCornerSizes(com.google.android.material.shape.ShapeAppearanceModel.PILL)
                        .build();
        avatar.setShapeAppearanceModel(model);
        loadAvatar(avatar, admin.getAvatarFileHash());
        header.addView(avatar);

        LinearLayout texts = new LinearLayout(ctx);
        texts.setOrientation(LinearLayout.VERTICAL);
        TextView nameTv = new TextView(ctx);
        nameTv.setTextSize(18);
        nameTv.setTextColor(themeColor(ctx, com.google.android.material.R.attr.colorOnSurface));
        IUser cached = ProfileCache.getCachedUser(admin.getId());
        String nickname = (cached != null && cached.getNickname() != null && !cached.getNickname().isEmpty())
                ? cached.getNickname() : admin.getId();
        nameTv.setText(nickname);
        texts.addView(nameTv);

        TextView roleTv = new TextView(ctx);
        roleTv.setTextSize(13);
        roleTv.setAlpha(0.7f);
        roleTv.setText("owner".equals(admin.getRole()) ? "所有者" : "管理员");
        texts.addView(roleTv);
        header.addView(texts);

        root.addView(header);

        // 权限开关列表
        boolean disabled = "owner".equals(admin.getRole());

        LayoutInflater inf = LayoutInflater.from(ctx);
        for (Map.Entry<String, String> e : PermissionNames.ALL.entrySet()) {
            String key = e.getKey();
            String label = e.getValue();

            View item = inf.inflate(R.layout.sheet_admin_permission_item, root, false);
            TextView title = item.findViewById(R.id.perm_title);
            moon3.widget.Switch sw = item.findViewById(R.id.perm_switch);

            title.setText(label);
            sw.setChecked(perms.get(key) != null && perms.get(key));
            sw.setEnabled(!disabled);
            sw.setClickable(!disabled);

            sw.setOnCheckedChangeListener((v, checked) -> perms.put(key, checked));
            item.setOnClickListener(v -> {
                if (disabled) return;
                sw.toggle();
            });

            switches.put(key, sw);
            root.addView(item);
        }

        // 底部按钮
        LinearLayout bottom = new LinearLayout(ctx);
        bottom.setOrientation(LinearLayout.HORIZONTAL);
        bottom.setGravity(Gravity.END);
        bottom.setPadding(padH, dp(ctx, 8), padH, dp(ctx, 16));

        MaterialButton cancelBtn = new MaterialButton(ctx, null,
                com.google.android.material.R.attr.borderlessButtonStyle);
        cancelBtn.setText("取消");
        cancelBtn.setOnClickListener(v -> dialog.dismiss());
        bottom.addView(cancelBtn);

        if (!disabled) {
            MaterialButton saveBtn = new MaterialButton(ctx, null,
                    com.google.android.material.R.attr.materialButtonStyle);
            LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT);
            lp.setMarginStart(dp(ctx, 8));
            saveBtn.setLayoutParams(lp);
            saveBtn.setText("保存");
            saveBtn.setOnClickListener(v -> save());
            bottom.addView(saveBtn);
        }

        root.addView(bottom);

        dialog.setContentView(root);
    }

    // ============================================================
    //                      保存
    // ============================================================

    private void save() {
        ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
        LingCatClient client = LingCatClientManager.getInstance().getCurrent();
        if (s == null || client == null) return;
        Account acc = AppDataStore.data().getActiveAccount(s.url);
        if (acc == null || acc.accessToken == null) return;

        JSONObject obj = new JSONObject();
        try {
            for (Map.Entry<String, Boolean> e : perms.entrySet()) {
                obj.put(e.getKey(), e.getValue());
            }
        } catch (Exception ignored) {}

        final String json = obj.toString();

        IO.execute(() -> {
            try {
                ChatApi.editChatAdminPermissions(
                        client, acc.accessToken, chatId, admin.getId(), json, API_TIMEOUT_MS);

                new android.os.Handler(android.os.Looper.getMainLooper()).post(() -> {
                    dialog.dismiss();
                    if (onSaved != null) onSaved.onSaved();
                });
            } catch (Exception e) {
                new android.os.Handler(android.os.Looper.getMainLooper()).post(() -> {
                    Toast.makeText(dialog.getContext(),
                            "保存失败: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                });
            }
        });
    }

    // ============================================================
    //                      工具
    // ============================================================

    private static int dp(Context ctx, int dp) {
        return Math.round(dp * ctx.getResources().getDisplayMetrics().density);
    }

    private static int themeColor(Context ctx, int attr) {
        try {
            return com.google.android.material.color.MaterialColors.getColor(ctx, attr, 0xFF000000);
        } catch (Exception e) {
            return 0xFF000000;
        }
    }

    private static void loadAvatar(ShapeableImageView iv, @Nullable String hash) {
        ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
        Object src;
        if (hash == null || hash.isEmpty() || s == null) {
            src = R.drawable.ic_default_avatar;
        } else {
            String url = FileUrlBuilder.fileUrl(s.getHttpUrl(), hash);
            src = (url != null) ? url : R.drawable.ic_default_avatar;
        }
        ImageRequest req = new ImageRequest.Builder(iv.getContext())
                .data(src)
                .crossfade(false)
                .placeholder(R.drawable.ic_default_avatar)
                .error(R.drawable.ic_default_avatar)
                .target(iv)
                .build();
        Coil.imageLoader(iv.getContext()).enqueue(req);
    }
}