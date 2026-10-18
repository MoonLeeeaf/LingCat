package io.github.moonleeeaf.lingcat.chat.e2e;

import android.content.Context;
import android.text.InputType;
import moon3.widget.MaterialEditText;
import android.widget.LinearLayout;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;

import io.github.moonleeeaf.lingcat.e2e.E2EStateManager;
import moon3.utils.FastToast;

public class E2EUnlockDialog {
    public interface OnUnlockSuccess {
        void onSuccess();
    }

    public static void showUnlock(Context ctx, OnUnlockSuccess callback) {
        MaterialEditText input = new MaterialEditText(ctx);
        input.setHint("请输入安全密码");
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);

        LinearLayout container = new LinearLayout(ctx);
        container.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (20 * ctx.getResources().getDisplayMetrics().density);
        container.setPadding(pad, pad / 2, pad, 0);
        container.addView(input);

        new MaterialAlertDialogBuilder(ctx)
                .setTitle("解锁加密消息")
                .setView(container)
                .setCancelable(false)
                .setPositiveButton("解锁", (d, w) -> {
                    String pwd = input.getText().toString();
                    boolean ok = E2EStateManager.getInstance().unlock(pwd);
                    if (ok) {
                        callback.onSuccess();
                    } else {
                        FastToast.shortToast(ctx, "密码错误或网络异常").show();
                    }
                })
                .setNegativeButton("取消", null)
                .show();
    }

    public static void showUnlockSpecificVersion(Context ctx, int version, OnUnlockSuccess callback) {
        MaterialEditText input = new MaterialEditText(ctx);
        input.setHint("请输入该版本的旧密码");
        input.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);

        LinearLayout container = new LinearLayout(ctx);
        container.setOrientation(LinearLayout.VERTICAL);
        int pad = (int) (20 * ctx.getResources().getDisplayMetrics().density);
        container.setPadding(pad, pad / 2, pad, 0);
        container.addView(input);

        new MaterialAlertDialogBuilder(ctx)
                .setTitle("解锁历史消息 (v" + version + ")")
                .setView(container)
                .setCancelable(false)
                .setPositiveButton("解锁", (d, w) -> {
                    String pwd = input.getText().toString();
                    boolean ok = E2EStateManager.getInstance().unlockSpecificVersion(version, pwd);
                    if (ok) {
                        callback.onSuccess();
                    } else {
                        FastToast.shortToast(ctx, "密码错误").show();
                    }
                })
                .setNegativeButton("取消", null)
                .show();
    }
}