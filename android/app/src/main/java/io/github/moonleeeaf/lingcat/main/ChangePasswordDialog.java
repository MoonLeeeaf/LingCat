package io.github.moonleeeaf.lingcat.main;

import android.app.AlertDialog;
import android.content.Context;
import android.text.TextUtils;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;
import com.google.android.material.textfield.TextInputLayout;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.client_protocol.LingCatClient;
import lingcat.client_protocol.UserApi;

/**
 * 修改密码 Dialog。
 *
 * 流程：
 *   1. 校验：当前密码非空、两次新密码一致
 *   2. UserApi.verifyPasswordIdentity(oldPassword) → changeToken
 *   3. UserApi.changePassword(changeToken, newPassword)
 */
public final class ChangePasswordDialog {

    private static final String TAG = "ChangePwdDialog";
    private static final long API_TIMEOUT_MS = 15_000L;
    private static final ExecutorService IO = Executors.newSingleThreadExecutor();

    private ChangePasswordDialog() {}

    /** 便捷入口 */
    public static void show(@NonNull android.app.Activity activity) {
        new ChangePasswordDialog().showInternal(activity);
    }

    private void showInternal(@NonNull android.app.Activity activity) {
        Context ctx = activity;

        // 依赖检查
        LingCatClient client = LingCatClientManager.getInstance().getCurrent();
        ServerConfig server = LingCatClientManager.getInstance().getCurrentServer();
        if (client == null || server == null) {
            android.widget.Toast.makeText(ctx, "连接已断开", android.widget.Toast.LENGTH_SHORT).show();
            return;
        }
        Account acc = AppDataStore.data().getActiveAccount(server.url);
        if (acc == null || acc.accessToken == null) {
            android.widget.Toast.makeText(ctx, "登录已失效", android.widget.Toast.LENGTH_SHORT).show();
            return;
        }
        final String accessToken = acc.accessToken;

        // 加载布局
        View root = LayoutInflater.from(ctx).inflate(R.layout.dialog_change_password, null);
        EditText oldInput     = root.findViewById(R.id.pwd_old);
        EditText newInput     = root.findViewById(R.id.pwd_new);
        EditText confirmInput = root.findViewById(R.id.pwd_confirm);

        TextInputLayout oldLayout = root.findViewById(R.id.layout_pwd_old);
        TextInputLayout newLayout = root.findViewById(R.id.layout_pwd_new);

        // 显示/隐藏切换
        setupToggle(oldLayout, oldInput);
        setupToggle(newLayout, newInput);

        final androidx.appcompat.app.AlertDialog[] holder = new androidx.appcompat.app.AlertDialog[1];

        androidx.appcompat.app.AlertDialog dialog = new MaterialAlertDialogBuilder(ctx)
                .setTitle("修改密码")
                .setView(root)
                .setPositiveButton("确认修改", null)   // 后设监听，防止自动 dismiss
                .setNegativeButton("取消", null)
                .create();

        holder[0] = dialog;

        dialog.setOnShowListener(d -> {
            dialog.getButton(android.app.AlertDialog.BUTTON_POSITIVE)
                    .setOnClickListener(v -> onSubmit(
                            activity, dialog, client, accessToken,
                            oldInput, newInput, confirmInput));
        });

        dialog.show();
    }

    // ============================================================
    //                      密码可见性切换
    // ============================================================

    private void setupToggle(TextInputLayout layout, EditText input) {
        final boolean[] visible = {false};

        // 初始 endIcon 是 "隐藏"（斜杠眼睛），点击后切换
        layout.setEndIconOnClickListener(v -> {
            visible[0] = !visible[0];
            if (visible[0]) {
                // 显示明文
                input.setInputType(android.text.InputType.TYPE_CLASS_TEXT
                        | android.text.InputType.TYPE_TEXT_VARIATION_VISIBLE_PASSWORD);
                layout.setEndIconDrawable(R.drawable.ic_visibility);
            } else {
                // 显示密文
                input.setInputType(android.text.InputType.TYPE_CLASS_TEXT
                        | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);
                layout.setEndIconDrawable(R.drawable.ic_visibility_off);
            }
            // 光标移到末尾，避免 inputType 变化导致光标回到开头
            if (input.getText() != null) {
                input.setSelection(input.getText().length());
            }
        });
    }

    // ============================================================
    //                      提交
    // ============================================================

    private void onSubmit(android.app.Activity activity,
                          androidx.appcompat.app.AlertDialog dialog,
                          LingCatClient client,
                          String accessToken,
                          EditText oldInput,
                          EditText newInput,
                          EditText confirmInput) {

        String oldPwd = text(oldInput);
        String newPwd = newInput.getText() == null ? "" : newInput.getText().toString();
        String cfmPwd = confirmInput.getText() == null ? "" : confirmInput.getText().toString();

        // 1. 校验
        if (TextUtils.isEmpty(oldPwd)) {
            toast(activity, "请输入当前密码");
            return;
        }
        if (!newPwd.equals(cfmPwd)) {
            toast(activity, "两次输入的密码不一致");
            return;
        }
        if (TextUtils.isEmpty(newPwd)) {
            toast(activity, "请输入新密码");
            return;
        }

        // 2. 禁止重复提交
        dialog.getButton(android.app.AlertDialog.BUTTON_POSITIVE).setEnabled(false);

        IO.execute(() -> {
            try {
                // 2.1 获取 change_token
                String changeToken = UserApi.verifyPasswordIdentity(
                        client, accessToken, oldPwd, API_TIMEOUT_MS);

                if (changeToken == null || changeToken.isEmpty()) {
                    throw new Exception("服务端未返回 change_token");
                }

                // 2.2 修改密码
                UserApi.changePassword(client, accessToken, changeToken,
                        newPwd, API_TIMEOUT_MS);

                activity.runOnUiThread(() -> {
                    if (dialog.isShowing()) dialog.dismiss();
                    toast(activity, "修改密码成功");
                });
            } catch (Exception e) {
                Log.e(TAG, "change password failed", e);
                activity.runOnUiThread(() -> {
                    dialog.getButton(android.app.AlertDialog.BUTTON_POSITIVE).setEnabled(true);
                    toast(activity, "修改密码失败: " + e.getMessage());
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

    private static void toast(android.app.Activity activity, String msg) {
        if (activity.isFinishing()) return;
        android.widget.Toast.makeText(activity, msg, android.widget.Toast.LENGTH_SHORT).show();
    }
}