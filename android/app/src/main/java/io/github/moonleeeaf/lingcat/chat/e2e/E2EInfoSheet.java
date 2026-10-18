package io.github.moonleeeaf.lingcat.chat.e2e;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.text.InputType;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.Nullable;

import com.google.android.material.bottomsheet.BottomSheetDialog;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;

import java.util.Map;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.e2e.E2EManager;
import io.github.moonleeeaf.lingcat.e2e.E2EStateManager;
import moon3.widget.MaterialEditText;

public class E2EInfoSheet {

    private final BottomSheetDialog dialog;
    private final String chatId;
    private final String peerUserId;
    private final E2EStateManager mgr;

    private LinearLayout actionsContainer;

    // ★ 修复 1：保存监听器实例，防止移除时失效
    private final E2EStateManager.OnE2EStateChangedListener stateListener = this::triggerRender;

    public static void show(Context ctx, String chatId, @Nullable String peerUserId) {
        if (ctx == null || chatId == null) return;
        new E2EInfoSheet(ctx, chatId, peerUserId).dialog.show();
    }

    private E2EInfoSheet(Context ctx, String chatId, @Nullable String peerUserId) {
        this.chatId = chatId;
        this.peerUserId = peerUserId;
        this.mgr = E2EStateManager.getInstance();
        this.dialog = new BottomSheetDialog(ctx);
        buildUi(ctx);

        // ★ 修复 2：使用固定的 listener 实例
        mgr.addListener(stateListener);
        dialog.setOnDismissListener(d -> mgr.removeListener(stateListener));

        // ★ 修复 3：首次打开时，立即渲染一次，否则界面是空的
        triggerRender();
    }

    private void buildUi(Context ctx) {
        LinearLayout root = new LinearLayout(ctx);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(0, 32, 0, 32);

        // 标题
        TextView header = new TextView(ctx);
        header.setText("端到端加密");
        header.setTextSize(20);
        header.setPadding(48, 0, 48, 32);
        root.addView(header);

        actionsContainer = new LinearLayout(ctx);
        actionsContainer.setOrientation(LinearLayout.VERTICAL);
        root.addView(actionsContainer);

        dialog.setContentView(root);
    }

    // ★ 修复 4：确保渲染在 UI 线程执行，防崩溃
    private void triggerRender() {
        if (actionsContainer == null) return;
        actionsContainer.post(this::render);
    }

    private void render() {
        if (dialog == null || !dialog.isShowing()) return;
        Context ctx = actionsContainer.getContext();
        actionsContainer.removeAllViews();

        E2EStateManager.Status status = mgr.getStatus();
        if (status == E2EStateManager.Status.DISABLED) {
            actionsContainer.addView(makeItem(ctx, 0, "你尚未开启端到端加密", null, () -> {
                dialog.dismiss();
                E2EUnlockDialog.showUnlock(ctx, () -> {});
            }));
            return;
        }

        // 安全码展示
        if (peerUserId != null) {
            String peerPub = mgr.getPeerKeys().get(peerUserId);
            String myPub = mgr.getMyPublicKey();

            if (peerPub != null && myPub != null) {
                String safetyNumber = E2EManager.getSafetyNumber(myPub, peerPub);
                String verifyStatus = mgr.getPeerVerifyStatus().get(peerUserId);

                // 1. 安全码 + 复制
                actionsContainer.addView(makeItem(ctx, R.drawable.ic_lock,
                        safetyNumber, "点击复制安全码", () -> {
                            ClipboardManager cm = (ClipboardManager) ctx.getSystemService(Context.CLIPBOARD_SERVICE);
                            cm.setPrimaryClip(ClipData.newPlainText("safety", safetyNumber));
                            Toast.makeText(ctx, "已复制", Toast.LENGTH_SHORT).show();
                        }));

                // 2. 验证状态
                if ("verified".equals(verifyStatus)) {
                    actionsContainer.addView(makeItem(ctx, R.drawable.ic_check,
                            "安全码已验证", "你已确认对方身份", null));
                } else {
                    String desc = "mismatch".equals(verifyStatus) ? "对方安全码已变更！请核实身份！" : "请通过其他方式核对上方数字";
                    actionsContainer.addView(makeItem(ctx, R.drawable.ic_info,
                            "标记为已验证", desc, () -> {
                                mgr.setPeerVerified(peerUserId);
                            }));
                }
            }
        }

        // 3. 修改主密码
        actionsContainer.addView(makeItem(ctx, R.drawable.ic_edit,
                "修改主安全密码", "重新加密所有历史版本", this::showChangePasswordDialog));

        // 4. 历史密钥管理
        actionsContainer.addView(makeItem(ctx, R.drawable.ic_vpn_key,
                "管理历史密钥", "单独修改特定版本密码", this::showHistoryKeysDialog));

        // 5. 生成新密钥
        actionsContainer.addView(makeItem(ctx, R.drawable.ic_refresh,
                "生成新密钥 (v" + (mgr.getMyKeyVersion() + 1) + ")",
                "如果怀疑泄漏，可在此重置", this::showRotateKeyDialog));
    }

    // ============================================================
    //                      弹窗逻辑
    // ============================================================

    private void showChangePasswordDialog() {
        Context ctx = actionsContainer.getContext();
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(48, 0, 48, 0);

        MaterialEditText oldPwd = new MaterialEditText(ctx);
        oldPwd.setHint("当前密码"); oldPwd.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        MaterialEditText newPwd = new MaterialEditText(ctx);
        newPwd.setHint("新密码"); newPwd.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);

        layout.addView(oldPwd);
        layout.addView(newPwd);

        new MaterialAlertDialogBuilder(ctx)
                .setTitle("修改主安全密码")
                .setView(layout)
                .setPositiveButton("保存", (d, w) -> {
                    boolean ok = mgr.changePassword(oldPwd.getText().toString(), newPwd.getText().toString());
                    Toast.makeText(ctx, ok ? "修改成功，请用新密码解锁" : "旧密码错误或失败", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("取消", null)
                .show();
    }

    private void showRotateKeyDialog() {
        Context ctx = actionsContainer.getContext();
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(48, 0, 48, 0);
        MaterialEditText pwd = new MaterialEditText(ctx);
        pwd.setHint("输入当前密码"); pwd.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        layout.addView(pwd);

        new MaterialAlertDialogBuilder(ctx)
                .setTitle("生成新密钥")
                .setMessage("警告：对方的安全码将发生变更，需重新验证。")
                .setView(layout)
                .setPositiveButton("确认重置", (d, w) -> {
                    try {
                        // ★ 这里依赖 E2EStateManager.generateNewKey，见下文
                        mgr.generateNewKey(pwd.getText().toString(), mgr.getMyKeyVersion() + 1);
                        Toast.makeText(ctx, "新密钥已生成", Toast.LENGTH_SHORT).show();
                    } catch (Exception e) {
                        Toast.makeText(ctx, "生成失败", Toast.LENGTH_SHORT).show();
                    }
                })
                .setNegativeButton("取消", null)
                .show();
    }

    private void showHistoryKeysDialog() {
        Context ctx = actionsContainer.getContext();
        Map<Integer, String> keys = mgr.getMyPrivateKeys();
        if (keys.isEmpty()) {
            Toast.makeText(ctx, "暂无已解锁的历史密钥", Toast.LENGTH_SHORT).show();
            return;
        }

        String[] versions = new String[keys.size()];
        int i = 0;
        for (Integer v : keys.keySet()) {
            versions[i++] = "版本 v" + v + (v == mgr.getMyKeyVersion() ? " (当前)" : "");
        }

        new MaterialAlertDialogBuilder(ctx)
                .setTitle("选择要修改的密钥版本")
                .setItems(versions, (d, which) -> {
                    int version = (Integer) keys.keySet().toArray()[which];
                    showChangeSpecificVersionDialog(ctx, version);
                })
                .setNegativeButton("关闭", null)
                .show();
    }

    private void showChangeSpecificVersionDialog(Context ctx, int version) {
        LinearLayout layout = new LinearLayout(ctx);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(48, 0, 48, 0);

        MaterialEditText oldPwd = new MaterialEditText(ctx);
        oldPwd.setHint("旧密码"); oldPwd.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);
        MaterialEditText newPwd = new MaterialEditText(ctx);
        newPwd.setHint("新密码"); newPwd.setInputType(InputType.TYPE_CLASS_TEXT | InputType.TYPE_TEXT_VARIATION_PASSWORD);

        layout.addView(oldPwd);
        layout.addView(newPwd);

        new MaterialAlertDialogBuilder(ctx)
                .setTitle("修改 v" + version + " 的密码")
                .setView(layout)
                .setPositiveButton("保存", (d, w) -> {
                    boolean ok = mgr.changeVersionPassword(version, oldPwd.getText().toString(), newPwd.getText().toString());
                    Toast.makeText(ctx, ok ? "已更新" : "修改失败", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("取消", null)
                .show();
    }

    // ============================================================
    //                      UI 工具
    // ============================================================

    private View makeItem(Context ctx, int iconRes, String text, @Nullable String subtext, @Nullable Runnable onClick) {
        View v = LayoutInflater.from(ctx).inflate(R.layout.sheet_action_item, actionsContainer, false);
        android.widget.ImageView icon = v.findViewById(R.id.sheet_icon);
        TextView tvText = v.findViewById(R.id.sheet_text);
        TextView tvSub = v.findViewById(R.id.sheet_subtext);

        if (iconRes != 0) icon.setImageResource(iconRes);
        else icon.setVisibility(View.GONE);

        tvText.setText(text);
        if (subtext != null && !subtext.isEmpty()) {
            tvSub.setText(subtext);
            tvSub.setVisibility(View.VISIBLE);
        } else {
            tvSub.setVisibility(View.GONE);
        }

        if (onClick != null) v.setOnClickListener(vv -> onClick.run());
        return v;
    }
}