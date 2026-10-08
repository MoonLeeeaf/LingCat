package io.github.moonleeeaf.lingcat.main;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import java.util.ArrayList;
import java.util.List;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.chat.ActionSheet;
import io.github.moonleeeaf.lingcat.chat.ChatProfileSheet;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.classes.Classes.IChat;
import lingcat.client_protocol.LingCatClient;
import lingcat.protocol.Methods;
import lingcat.protocol.Package;
import moon3.utils.FastToast;

public class ChatListFragment extends Fragment {

    private static final String ARG_TAB = "tab_type";

    public static ChatListFragment newInstance(ChatListViewModel.TabType tab) {
        ChatListFragment f = new ChatListFragment();
        Bundle b = new Bundle();
        b.putString(ARG_TAB, tab.name());
        f.setArguments(b);
        return f;
    }

    private ChatListViewModel vm;
    private ChatListAdapter adapter;
    private SwipeRefreshLayout refresh;
    private RecyclerView recycler;
    private TextView emptyText;
    private View emptyView;

    /** WebSocket 事件：对话列表有变化 → 刷新 */
    private final LingCatClient.OnReceiveListener onChatsUpdated = pkg -> {
        if (pkg.method_id == Methods.Update_My_Chats_Event) {
            reload();
        }
    };

    private final LingCatClientManager.OnFileTokenChangedListener onTokenChanged = token -> {
        if (getActivity() == null || adapter == null) return;
        getActivity().runOnUiThread(() -> adapter.notifyDataSetChanged());
    };

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_chat_list, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        refresh    = view.findViewById(R.id.chat_list_refresh);
        recycler   = view.findViewById(R.id.chat_list_recycler);
        emptyView  = view.findViewById(R.id.chat_list_empty);
        emptyText  = view.findViewById(R.id.chat_list_empty_text);

        ChatListViewModel.TabType tab = ChatListViewModel.TabType.valueOf(
                getArguments() != null
                        ? getArguments().getString(ARG_TAB, "RECENT")
                        : "RECENT");

        vm = new ViewModelProvider(this, new ChatListViewModel.Factory(tab))
                .get(ChatListViewModel.class);

        adapter = new ChatListAdapter(new ChatListAdapter.OnChatClickListener() {
            @Override public void onChatClick(IChat chat) {
                if (getActivity() instanceof MainActivity) {
                    ((MainActivity) getActivity()).openChat(chat.getId(), chat.getTitle());
                }
            }
            @Override public void onChatLongClick(IChat chat) {
                showChatMenu(chat);
            }
        });

        recycler.setLayoutManager(new LinearLayoutManager(requireContext()));
        recycler.setAdapter(adapter);

        refresh.setOnRefreshListener(this::reload);

        vm.getChats().observe(getViewLifecycleOwner(), list -> {
            adapter.submitList(list);
            updateEmptyState(list);
        });

        vm.getLoading().observe(getViewLifecycleOwner(), loading ->
                refresh.setRefreshing(loading != null && loading));

        vm.getError().observe(getViewLifecycleOwner(), err -> {
            if (err == null || err.isEmpty()) return;
            if (getView() != null) FastToast.shortSnack(getView(), "加载失败: " + err).show();
            vm.clearError();
        });

        reload();
    }

    private void showChatMenu(IChat chat) {
        List<ActionSheet.Action> actions = new ArrayList<>();
        actions.add(new ActionSheet.Action(
                R.drawable.ic_info,
                "对话信息",
                () -> ChatProfileSheet.show(requireContext(), chat.getId(), null)));
        ActionSheet.show(requireContext(),
                chat.getTitle() != null ? chat.getTitle() : chat.getId(), actions);
    }

    @Override
    public void onStart() {
        super.onStart();
        LingCatClient c = getClient();
        if (c != null) c.addOnReceiveListener(onChatsUpdated);
        LingCatClientManager.getInstance().addOnFileTokenChangedListener(onTokenChanged);
    }

    @Override
    public void onStop() {
        super.onStop();
        LingCatClient c = getClient();
        if (c != null) c.removeOnReceiveListener(onChatsUpdated);
        LingCatClientManager.getInstance().removeOnFileTokenChangedListener(onTokenChanged);
    }

    // ============================================================
    //                      工具
    // ============================================================

    private void reload() {
        vm.load(getClient(), getToken());
    }

    private LingCatClient getClient() {
        if (getActivity() instanceof MainActivity) {
            return ((MainActivity) getActivity()).getClient();
        }
        return null;
    }

    private String getToken() {
        if (getActivity() instanceof MainActivity) {
            return ((MainActivity) getActivity()).getAccessToken();
        }
        return null;
    }

    private void updateEmptyState(java.util.List<IChat> list) {
        boolean empty = list == null || list.isEmpty();
        emptyView.setVisibility(empty ? View.VISIBLE : View.GONE);
        recycler.setVisibility(empty ? View.GONE : View.VISIBLE);

        if (empty) {
            emptyText.setText(textForTab());
        }
    }

    private String textForTab() {
        if (getArguments() == null) return "暂无对话";
        String tab = getArguments().getString(ARG_TAB, "");
        switch (tab) {
            case "FAVOURITE": return "还没有收藏的对话";
            default: return "暂无对话";
        }
    }
}