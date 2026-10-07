package io.github.moonleeeaf.lingcat.auth.fragment;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.google.android.material.button.MaterialButton;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.auth.AuthActivity;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.client_protocol.LingCatClient;
import lingcat.client_protocol.UserApi;
import moon3.utils.FastToast;

public class RegisterFragment extends Fragment {

    private static final String ARG_SERVER_URL = "server_url";
    private static final long API_TIMEOUT_MS = 15_000L;
    private static final ExecutorService IO = Executors.newSingleThreadExecutor();

    private ServerConfig server;
    private LingCatClient client;

    private EditText inputUsername, inputNickname, inputPassword, inputPassword2;
    private MaterialButton btnRegister, btnBackToLogin;
    private ProgressBar progress;

    public static RegisterFragment newInstance(String serverUrl) {
        RegisterFragment f = new RegisterFragment();
        Bundle b = new Bundle();
        b.putString(ARG_SERVER_URL, serverUrl);
        f.setArguments(b);
        return f;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_register, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        inputUsername   = view.findViewById(R.id.input_username);
        inputNickname   = view.findViewById(R.id.input_nickname);
        inputPassword   = view.findViewById(R.id.input_password);
        inputPassword2  = view.findViewById(R.id.input_password2);
        btnRegister     = view.findViewById(R.id.btn_register);
        btnBackToLogin  = view.findViewById(R.id.btn_back_to_login);
        progress        = view.findViewById(R.id.register_progress);

        String url = getArguments() != null ? getArguments().getString(ARG_SERVER_URL) : null;
        server = url != null ? AppDataStore.data().findServer(url) : null;
        if (server == null) {
            toast("服务器不存在");
            ((AuthActivity) requireActivity()).showServerList();
            return;
        }

        client = LingCatClientManager.getInstance().getCurrent();
        if (client == null) {
            toast("连接已断开，请返回重试");
            return;
        }

        btnRegister.setOnClickListener(v -> onRegisterClicked());
        btnBackToLogin.setOnClickListener(v ->
                ((AuthActivity) requireActivity()).showLogin(server));
    }

    private void onRegisterClicked() {
        String username  = inputUsername.getText().toString().trim();
        String nickname  = inputNickname.getText().toString().trim();
        String password  = inputPassword.getText().toString();
        String password2 = inputPassword2.getText().toString();

        if (TextUtils.isEmpty(nickname)) {
            toast("请输入昵称");
            return;
        }
        if (TextUtils.isEmpty(password)) {
            toast("请输入密码");
            return;
        }
        if (!password.equals(password2)) {
            toast("两次输入的密码不一致");
            return;
        }

        setLoading(true);

        final String u = username.isEmpty() ? null : username;
        final String n = nickname;
        final String p = password;

        IO.execute(() -> {
            try {
                String userId = UserApi.register(client, u, p, n, API_TIMEOUT_MS);
                android.util.Log.i("RegisterFragment", "registered: userId=" + userId);

                if (!isAdded()) return;
                requireActivity().runOnUiThread(() -> {
                    setLoading(false);
                    toast("注册成功，请登录");
                    // 回登录页，预填昵称/用户名
                    ((AuthActivity) requireActivity()).showLogin(server);
                });
            } catch (Exception e) {
                if (!isAdded()) return;
                requireActivity().runOnUiThread(() -> {
                    setLoading(false);
                    toast("注册失败: " + e.getMessage());
                });
            }
        });
    }

    private void setLoading(boolean loading) {
        progress.setVisibility(loading ? View.VISIBLE : View.GONE);
        btnRegister.setEnabled(!loading);
        btnBackToLogin.setEnabled(!loading);
        inputUsername.setEnabled(!loading);
        inputNickname.setEnabled(!loading);
        inputPassword.setEnabled(!loading);
        inputPassword2.setEnabled(!loading);
    }

    private void toast(String msg) {
        if (getView() == null) return;
        FastToast.shortSnack(getView(), msg).show();
    }
}