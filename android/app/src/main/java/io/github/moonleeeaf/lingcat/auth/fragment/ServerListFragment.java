package io.github.moonleeeaf.lingcat.auth.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.google.android.material.button.MaterialButton;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.auth.AuthActivity;
import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;

public class ServerListFragment extends Fragment {

    private LinearLayout listContainer;

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_server_list, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        listContainer = view.findViewById(R.id.server_list_container);
        MaterialButton addBtn = view.findViewById(R.id.btn_add_server);

        addBtn.setOnClickListener(v -> ((AuthActivity) requireActivity()).showAddServer());
        refresh();
    }

    @Override
    public void onResume() {
        super.onResume();
        refresh();
    }

    private void refresh() {
        listContainer.removeAllViews();
        var data = AppDataStore.data();

        LayoutInflater inflater = LayoutInflater.from(requireContext());
        for (ServerConfig s : data.servers) {
            View row = inflater.inflate(R.layout.item_server, listContainer, false);
            TextView title = row.findViewById(R.id.server_title);
            TextView url = row.findViewById(R.id.server_url);

            String displayTitle = (s.siteTitle != null && !s.siteTitle.isEmpty())
                    ? s.siteTitle
                    : s.url;
            title.setText(displayTitle);
            url.setText(s.url);

            row.setOnClickListener(v -> {
                AppDataStore.setCurrentServer(s.url);
                Account acc = AppDataStore.data().getActiveAccount(s.url);
                ((AuthActivity) requireActivity()).connectAndProceed(s, acc, false);
            });

            listContainer.addView(row);
        }
    }
}