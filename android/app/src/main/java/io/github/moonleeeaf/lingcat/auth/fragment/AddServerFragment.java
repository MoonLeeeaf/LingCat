package io.github.moonleeeaf.lingcat.auth.fragment;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.google.android.material.dialog.MaterialAlertDialogBuilder;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.auth.AuthActivity;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.data.ServerUrl;
import io.github.moonleeeaf.lingcat.net.ServerConfigFetcher;
import moon3.utils.FastToast;

public class AddServerFragment extends Fragment {

    private static final ExecutorService IO = Executors.newSingleThreadExecutor();
    private static final Pattern HEX = Pattern.compile("^[0-9a-f]+$");

    private EditText inputUrl;
    private EditText inputPublicKey;
    private Button btnConfirm;
    private ProgressBar progress;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_add_server, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        inputUrl       = view.findViewById(R.id.input_server_url);
        inputPublicKey = view.findViewById(R.id.input_public_key);
        btnConfirm     = view.findViewById(R.id.btn_confirm_add);
        progress       = view.findViewById(R.id.progress);

        btnConfirm.setOnClickListener(v -> onConfirmClicked());
    }

    // ============================================================
    //                      点击确认
    // ============================================================

    private void onConfirmClicked() {
        String raw = inputUrl.getText().toString().trim();
        if (TextUtils.isEmpty(raw)) {
            toast("请输入服务器地址");
            return;
        }

        String normalized = ServerUrl.normalize(raw);
        if (normalized == null) {
            toast("地址格式不对，请以 http:// 或 https:// 开头");
            return;
        }

        // 先校验公钥格式（如果有输入）
        String rawKey = inputPublicKey.getText().toString();
        String userKey = normalizePublicKey(rawKey);
        if (!TextUtils.isEmpty(rawKey.trim()) && userKey == null) {
            toast("公钥格式不正确（应为偶数长度的 hex 字符串）");
            return;
        }

        setLoading(true);

        IO.execute(() -> {
            try {
                ServerConfigFetcher.Result result = ServerConfigFetcher.fetch(normalized);
                if (!isAdded()) return;
                requireActivity().runOnUiThread(
                        () -> handleFetched(normalized, result, userKey));
            } catch (Exception e) {
                if (!isAdded()) return;
                requireActivity().runOnUiThread(() -> {
                    setLoading(false);
                    toast("无法连接服务器: " + e.getMessage());
                });
            }
        });
    }

    // ============================================================
    //                      分支处理
    // ============================================================

    private void handleFetched(String url,
                               ServerConfigFetcher.Result result,
                               String userKey) {
        setLoading(false);

        // Case 1：用户填了公钥
        if (userKey != null) {
            handleUserProvidedKey(url, result, userKey);
            return;
        }

        // Case 2：用户没填，服务器也没提供 → 警告
        if (result.publicKey == null) {
            showMissingKeyDialog(url, result);
            return;
        }

        // Case 3：用户没填，服务器提供了 → 原有 TOFU 流程
        ServerConfig existing = AppDataStore.data().findServer(url);

        if (existing == null
                || existing.publicKey == null
                || existing.publicKey.isEmpty()) {
            showTofuDialog(url, result, null, false);
        } else if (!existing.publicKey.equals(result.publicKey)) {
            showTofuDialog(url, result, existing.publicKey, true);
        } else {
            saveAndFinish(url, result);
        }
    }

    // ============================================================
    //                      Case：用户填了公钥
    // ============================================================

    private void handleUserProvidedKey(String url,
                                       ServerConfigFetcher.Result result,
                                       String userKey) {

        // 子情况 1：服务器没返回公钥 → 确认使用用户公钥
        if (result.publicKey == null) {
            new MaterialAlertDialogBuilder(requireContext())
                    .setTitle("使用你提供的公钥")
                    .setMessage("服务器未提供公钥。将使用你输入的公钥作为验证依据：\n\n"
                            + formatKey(userKey)
                            + "\n\n请确认它来自可信渠道。")
                    .setPositiveButton("确认", (d, w) -> {
                        result.publicKey = userKey;
                        saveAndFinish(url, result);
                    })
                    .setNegativeButton("取消", null)
                    .show();
            return;
        }

        // 子情况 2：一致 → 静默保存
        if (userKey.equalsIgnoreCase(result.publicKey)) {
            saveAndFinish(url, result);
            return;
        }

        // 子情况 3：不一致 → 强烈警告
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("公钥不一致！")
                .setMessage("你输入的公钥与服务器返回的公钥不一致。\n\n"
                        + "你输入的:\n" + formatKey(userKey) + "\n\n"
                        + "服务器返回的:\n" + formatKey(result.publicKey) + "\n\n"
                        + "这可能意味着:\n"
                        + "  · 服务器更换了密钥，你手上的信息已过期\n"
                        + "  · 中间人攻击\n\n"
                        + "如果继续，将以你输入的公钥作为验证依据，"
                        + "服务器返回的公钥会被忽略。")
                .setPositiveButton("使用我输入的", (d, w) -> {
                    result.publicKey = userKey;
                    saveAndFinish(url, result);
                })
                .setNegativeButton("取消", null)
                .show();
    }

    // ============================================================
    //                      Case：无公钥可用
    // ============================================================

    private void showMissingKeyDialog(String url, ServerConfigFetcher.Result result) {
        new MaterialAlertDialogBuilder(requireContext())
                .setTitle("缺少服务器公钥")
                .setMessage("服务器未提供公钥，且你没有手动填写。\n\n"
                        + "没有公钥将无法验证服务器身份，也无法建立加密连接。\n\n"
                        + "建议：\n"
                        + "  · 点击「取消」，向服务器管理员索取公钥后填写\n"
                        + "  · 或点击「仍然添加」先保存服务器（后续补公钥）")
                .setPositiveButton("仍然添加", (d, w) -> {
                    // result.publicKey 保持 null，ServerConfig 里也存 null
                    saveAndFinish(url, result);
                })
                .setNegativeButton("取消", null)
                .show();
    }

    // ============================================================
    //                      原有 TOFU 弹窗（保留）
    // ============================================================

    private void showTofuDialog(String url,
                                ServerConfigFetcher.Result result,
                                String oldKey,
                                boolean isChanged) {
        String title = isChanged ? "服务器公钥已改变" : "确认服务器公钥";
        String message = buildTofuMessage(url, oldKey, result.publicKey, isChanged);

        new MaterialAlertDialogBuilder(requireContext())
                .setTitle(title)
                .setMessage(message)
                .setCancelable(false)
                .setPositiveButton(isChanged ? "仍然信任" : "确认", (d, w) ->
                        saveAndFinish(url, result))
                .setNegativeButton("取消", (d, w) -> {
                    if (isChanged) toast("已取消，未更新公钥");
                })
                .show();
    }

    private String buildTofuMessage(String url, String oldKey, String newKey, boolean isChanged) {
        StringBuilder sb = new StringBuilder();
        sb.append("服务器: ").append(url).append("\n\n");
        if (isChanged) {
            sb.append("该服务器之前记录的公钥与现在不一致。\n");
            sb.append("这可能意味着服务器更换了密钥，也可能是中间人攻击。\n\n");
            sb.append("旧公钥:\n").append(formatKey(oldKey)).append("\n\n");
            sb.append("新公钥:\n").append(formatKey(newKey)).append("\n\n");
            sb.append("请通过可信渠道向服务器管理员核对新公钥后再继续。");
        } else {
            sb.append("这是首次连接该服务器，请通过可信渠道核对下面的公钥，确认无误后继续。\n\n");
            sb.append("公钥:\n").append(formatKey(newKey));
        }
        return sb.toString();
    }

    // ============================================================
    //                      保存 / 工具
    // ============================================================

    private void saveAndFinish(String url, ServerConfigFetcher.Result result) {
        ServerConfig cfg = new ServerConfig(url, result.publicKey);
        cfg.siteTitle = result.siteTitle;
        cfg.livekitEnabled = result.livekitEnabled;
        cfg.oauthProvidersJson = result.oauthProvidersJson;

        AppDataStore.upsertServer(cfg);
        AppDataStore.setCurrentServer(url);

        toast("已保存");
        ((AuthActivity) requireActivity()).showServerList();
    }

    private void setLoading(boolean loading) {
        progress.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnConfirm.setEnabled(!loading);
        inputUrl.setEnabled(!loading);
        inputPublicKey.setEnabled(!loading);
    }

    /**
     * 公钥归一化：
     *  - 去空白、冒号、连字符（用户可能从不同格式粘贴）
     *  - 转小写
     *  - 校验 hex
     *
     * @return 归一化后的 hex，输入空或非法时返回 null
     */
    private String normalizePublicKey(String raw) {
        if (raw == null) return null;
        String s = raw.trim();
        if (s.isEmpty()) return null;
        s = s.replaceAll("[\\s:\\-]", "").toLowerCase();
        if (s.length() % 2 != 0) return null;
        if (!HEX.matcher(s).matches()) return null;
        return s;
    }

    /** 把 hex 公钥折行显示 */
    private String formatKey(String hex) {
        if (hex == null) return "(空)";
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < hex.length(); i++) {
            sb.append(hex.charAt(i));
            if ((i + 1) % 32 == 0 && i + 1 < hex.length()) sb.append('\n');
        }
        return sb.toString();
    }

    private void toast(String msg) {
        FastToast.shortSnack(requireView(), msg).show();
    }
}