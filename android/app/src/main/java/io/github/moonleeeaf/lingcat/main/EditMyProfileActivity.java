package io.github.moonleeeaf.lingcat.main;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;

import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.Nullable;

import com.google.android.material.button.MaterialButton;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.imageview.ShapeableImageView;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.net.URLEncoder;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import coil.Coil;
import coil.request.ImageRequest;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.FileUrlBuilder;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.classes.Classes.IUser;
import lingcat.client_protocol.FileApi;
import lingcat.client_protocol.LingCatClient;
import lingcat.client_protocol.OAuthApi;
import lingcat.client_protocol.UserApi;
import moon3.app.Activity;
import moon3.utils.FastToast;

/**
 * 编辑我的资料（对齐 Web 端 EditMyProfileDialog）。
 *
 * 功能：
 *   - 修改头像（选图 → 裁剪 1:1 → 上传 → 立即生效）
 *   - 修改昵称 / 用户名 / 简介（点保存提交）
 *   - OAuth 账号绑定 / 解绑
 */
public class EditMyProfileActivity extends Activity {

    private static final String TAG = "EditProfile";
    private static final long API_TIMEOUT_MS = 15_000L;
    private static final int AVATAR_SIZE = 512;
    private static final ExecutorService IO = Executors.newSingleThreadExecutor();

    public static void show(android.content.Context ctx) {
        Intent i = new Intent(ctx, EditMyProfileActivity.class);
        ctx.startActivity(i);
    }

    // UI
    private ShapeableImageView avatarView;
    private EditText nicknameInput, usernameInput, descriptionInput, userIdInput;
    private LinearLayout oauthSection, oauthContainer;
    private ProgressBar progress;
    private MaterialButton cancelBtn, saveBtn;

    // 依赖
    private LingCatClient client;
    private ServerConfig server;
    private String accessToken;

    // 状态
    private IUser profile;
    private final List<String> bindings = new ArrayList<>();
    private final JSONArray oauthProviders = new JSONArray();
    private volatile boolean busy = false;

    private ActivityResultLauncher<String> imagePicker;

    private final Runnable onOAuthBound = () -> runOnUiThread(this::reloadBindings);

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_edit_profile);

        // 依赖
        client = LingCatClientManager.getInstance().getCurrent();
        server = LingCatClientManager.getInstance().getCurrentServer();
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

        // Toolbar
        moon3.widget.Toolbar tb = getFirstToolbar();
        if (tb != null) {
            tb.setNavigationIcon(androidx.appcompat.R.drawable.abc_ic_ab_back_material);
            tb.setNavigationOnClickListener(v -> finish());
        }
        setTitle("编辑资料");

        avatarView      = findViewById(R.id.edit_avatar);
        nicknameInput   = findViewById(R.id.edit_nickname);
        usernameInput   = findViewById(R.id.edit_username);
        descriptionInput= findViewById(R.id.edit_description);
        userIdInput     = findViewById(R.id.edit_user_id);
        oauthSection    = findViewById(R.id.oauth_section);
        oauthContainer  = findViewById(R.id.oauth_container);
        progress        = findViewById(R.id.edit_progress);
        cancelBtn       = findViewById(R.id.btn_cancel);
        saveBtn         = findViewById(R.id.btn_save);

        // 解析 oauth providers
        parseOAuthProviders();

        // 图片选择器
        imagePicker = registerForActivityResult(
                new ActivityResultContracts.GetContent(),
                uri -> {
                    if (uri != null) onAvatarPicked(uri);
                });

        avatarView.setOnClickListener(v -> {
            if (busy) return;
            imagePicker.launch("image/*");
        });
        cancelBtn.setOnClickListener(v -> finish());
        saveBtn.setOnClickListener(v -> onSave());

        // 监听 OAuth 绑定事件
        OAuthBoundEvent.add(onOAuthBound);

        // 加载
        loadProfile();
        if (oauthProviders.length() > 0) {
            oauthSection.setVisibility(View.VISIBLE);
            loadBindings();
        }
    }

    @Override
    protected void onDestroy() {
        OAuthBoundEvent.remove(onOAuthBound);
        super.onDestroy();
    }

    // ============================================================
    //                      OAuth providers 解析
    // ============================================================

    private void parseOAuthProviders() {
        String json = server.oauthProvidersJson;
        if (json == null || json.isEmpty()) return;
        try {
            JSONArray arr = new JSONArray(json);
            for (int i = 0; i < arr.length(); i++) {
                oauthProviders.put(arr.get(i));
            }
        } catch (Exception e) {
            Log.w(TAG, "parse oauth providers failed", e);
        }
    }

    // ============================================================
    //                      加载
    // ============================================================

    private void loadProfile() {
        setLoading(true);
        IO.execute(() -> {
            try {
                IUser u = UserApi.queryMyUserInfo(client, accessToken, API_TIMEOUT_MS);
                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    profile = u;
                    renderProfile();
                    setLoading(false);
                });
            } catch (Exception e) {
                Log.e(TAG, "load profile failed", e);
                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    setLoading(false);
                    toast("加载失败: " + e.getMessage());
                    finish();
                });
            }
        });
    }

    private void renderProfile() {
        if (profile == null) return;

        nicknameInput.setText(profile.getNickname());
        usernameInput.setText(profile.hasUsername() ? profile.getUsername() : "");
        descriptionInput.setText(profile.hasDescription() ? profile.getDescription() : "");
        userIdInput.setText(profile.getId());

        loadAvatar(profile.hasAvatarFileHash() ? profile.getAvatarFileHash() : null);
    }

    private void loadAvatar(String hash) {
        Object src = R.drawable.ic_default_avatar;
        if (hash != null && !hash.isEmpty()) {
            String url = FileUrlBuilder.fileUrl(server.getHttpUrl(), hash);
            if (url != null) src = url;
        }
        ImageRequest req = new ImageRequest.Builder(this)
                .data(src)
                .crossfade(true)
                .placeholder(R.drawable.ic_default_avatar)
                .error(R.drawable.ic_default_avatar)
                .target(avatarView)
                .build();
        Coil.imageLoader(this).enqueue(req);
    }

    private void loadBindings() {
        IO.execute(() -> {
            try {
                List<String> list = OAuthApi.getOAuthBindings(client, accessToken, API_TIMEOUT_MS);
                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    bindings.clear();
                    if (list != null) bindings.addAll(list);
                    renderOAuthButtons();
                });
            } catch (Exception e) {
                Log.w(TAG, "load bindings failed", e);
            }
        });
    }

    private void reloadBindings() {
        loadBindings();
    }

    // ============================================================
    //                      OAuth 按钮
    // ============================================================

    private void renderOAuthButtons() {
        oauthContainer.removeAllViews();
        for (int i = 0; i < oauthProviders.length(); i++) {
            try {
                JSONObject p = oauthProviders.getJSONObject(i);
                String id = p.optString("id");
                String display = p.optString("display_name", id);
                if (id.isEmpty()) continue;

                final boolean bound = bindings.contains(id);

                MaterialButton btn = new MaterialButton(this, null,
                        bound ? com.google.android.material.R.attr.materialButtonOutlinedStyle
                                : com.google.android.material.R.attr.materialButtonStyle);
                btn.setAllCaps(false);
                btn.setText((bound ? "解绑 " : "绑定 ") + display);

                LinearLayout.LayoutParams lp = new LinearLayout.LayoutParams(
                        LinearLayout.LayoutParams.MATCH_PARENT,
                        LinearLayout.LayoutParams.WRAP_CONTENT);
                lp.topMargin = dp(8);
                btn.setLayoutParams(lp);

                final String fId = id;
                final String fName = display;
                btn.setOnClickListener(v -> {
                    if (busy) return;
                    if (bound) confirmUnbind(fId, fName);
                    else        openBindUrl(fId);
                });

                oauthContainer.addView(btn);
            } catch (Exception ignored) {}
        }
    }

    /** 打开浏览器进行绑定，服务端完成后回调 lingcat://oauth/callback?oauth_bound=xxx */
    private void openBindUrl(String providerId) {
        try {
            String redirect = URLEncoder.encode("lingcat://oauth/callback", "UTF-8");
            String tokenEnc = URLEncoder.encode(accessToken, "UTF-8");
            String url = server.getHttpUrl()
                    + "/oauth/" + providerId + "/login"
                    + "?mode=bind"
                    + "&access_token=" + tokenEnc
                    + "&redirect=" + redirect;

            Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(i);
        } catch (Exception e) {
            toast("无法打开浏览器: " + e.getMessage());
        }
    }

    private void confirmUnbind(String providerId, String displayName) {
        new MaterialAlertDialogBuilder(this)
                .setTitle("解绑 " + displayName)
                .setMessage("解绑后将无法使用 " + displayName + " 登录。如果未设置密码，解绑后将无法再进入此账号。确定继续？")
                .setPositiveButton("解绑", (d, w) -> doUnbind(providerId, displayName))
                .setNegativeButton("取消", null)
                .show();
    }

    private void doUnbind(String providerId, String displayName) {
        IO.execute(() -> {
            try {
                OAuthApi.unbindOAuth(client, accessToken, providerId, API_TIMEOUT_MS);
                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    toast("已解绑 " + displayName);
                    loadBindings();
                });
            } catch (Exception e) {
                runOnUiThread(() -> toast("解绑失败: " + e.getMessage()));
            }
        });
    }

    // ============================================================
    //                      头像
    // ============================================================

    private void onAvatarPicked(Uri uri) {
        setLoading(true);
        IO.execute(() -> {
            try {
                // 1. 裁剪为 512x512 PNG
                byte[] png = cropToSquare(uri, AVATAR_SIZE);
                if (png == null) throw new Exception("图片处理失败");

                // 2. 申请上传 token
                String uploadToken = FileApi.requestUploadFileToken(
                        client, accessToken, API_TIMEOUT_MS);

                // 3. 上传
                String hash = FileApi.uploadFile(
                        client, uploadToken, null, png, "image/png", "avatar.png");

                if (hash == null || hash.isEmpty()) throw new Exception("上传失败");

                // 4. 更新服务端
                UserApi.updateMyProfile(client, accessToken,
                        null, null, null, hash, API_TIMEOUT_MS);

                // 5. 更新本地缓存
                Account acc = AppDataStore.data().getActiveAccount(server.url);
                if (acc != null) {
                    acc.avatarFileHash = hash;
                    AppDataStore.addAccount(server.url, acc);
                }

                final String fHash = hash;
                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    setLoading(false);
                    if (profile != null) {
                        // 更新本地 profile 对象的头像字段
                        profile = profile.toBuilder().setAvatarFileHash(fHash).build();
                    }
                    loadAvatar(fHash);
                    toast("头像已更新");
                });
            } catch (Exception e) {
                Log.e(TAG, "avatar upload failed", e);
                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    setLoading(false);
                    toast("上传失败: " + e.getMessage());
                });
            }
        });
    }

    /**
     * 读取 Uri → 中心方形裁剪 → 缩放到 targetSize → PNG bytes。
     */
    @Nullable
    private byte[] cropToSquare(Uri uri, int targetSize) throws Exception {
        // 1. 先读边界
        BitmapFactory.Options opts = new BitmapFactory.Options();
        opts.inJustDecodeBounds = true;
        try (InputStream in = getContentResolver().openInputStream(uri)) {
            if (in == null) return null;
            BitmapFactory.decodeStream(in, null, opts);
        }
        if (opts.outWidth <= 0 || opts.outHeight <= 0) return null;

        // 2. 计算 inSampleSize 避免 OOM
        opts.inSampleSize = calcSampleSize(opts.outWidth, opts.outHeight, targetSize);
        opts.inJustDecodeBounds = false;

        // 3. 解码
        Bitmap bmp;
        try (InputStream in = getContentResolver().openInputStream(uri)) {
            if (in == null) return null;
            bmp = BitmapFactory.decodeStream(in, null, opts);
        }
        if (bmp == null) return null;

        try {
            // 4. 中心方形裁剪
            int w = bmp.getWidth();
            int h = bmp.getHeight();
            int side = Math.min(w, h);
            int x = (w - side) / 2;
            int y = (h - side) / 2;
            Bitmap square = Bitmap.createBitmap(bmp, x, y, side, side);

            // 5. 缩放到目标尺寸
            Bitmap scaled = Bitmap.createScaledBitmap(square, targetSize, targetSize, true);

            // 6. 转 PNG
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            scaled.compress(Bitmap.CompressFormat.PNG, 100, bos);

            if (square != bmp && !square.isRecycled()) square.recycle();
            if (scaled != square && !scaled.isRecycled()) scaled.recycle();

            return bos.toByteArray();
        } finally {
            if (!bmp.isRecycled()) bmp.recycle();
        }
    }

    private static int calcSampleSize(int w, int h, int target) {
        int sample = 1;
        int minSide = Math.min(w, h);
        while (minSide / sample > target * 2) sample *= 2;
        return Math.max(1, sample);
    }

    // ============================================================
    //                      保存
    // ============================================================

    private void onSave() {
        if (busy) return;

        String nickname = text(nicknameInput);
        String username = text(usernameInput);
        String description = text(descriptionInput);

        setLoading(true);
        IO.execute(() -> {
            try {
                UserApi.updateMyProfile(client, accessToken,
                        username.isEmpty() ? null : username,
                        nickname.isEmpty() ? null : nickname,
                        description.isEmpty() ? null : description,
                        null,   // 不改头像
                        API_TIMEOUT_MS);

                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    setLoading(false);
                    toast("已保存");
                    finish();
                });
            } catch (Exception e) {
                Log.e(TAG, "save failed", e);
                runOnUiThread(() -> {
                    if (isFinishing()) return;
                    setLoading(false);
                    toast("保存失败: " + e.getMessage());
                });
            }
        });
    }

    // ============================================================
    //                      工具
    // ============================================================

    private static String text(EditText e) {
        return e.getText() == null ? "" : e.getText().toString().trim();
    }

    private int dp(int v) {
        return Math.round(v * getResources().getDisplayMetrics().density);
    }

    private void setLoading(boolean loading) {
        busy = loading;
        progress.setVisibility(loading ? View.VISIBLE : View.GONE);
        saveBtn.setEnabled(!loading);
        cancelBtn.setEnabled(!loading);
        avatarView.setEnabled(!loading);
    }

    private void toast(String msg) {
        if (isFinishing()) return;
        try {
            FastToast.shortSnack(getRootContentViewHandler(), msg).show();
        } catch (Exception e) {
            android.widget.Toast.makeText(this, msg, android.widget.Toast.LENGTH_SHORT).show();
        }
    }
}