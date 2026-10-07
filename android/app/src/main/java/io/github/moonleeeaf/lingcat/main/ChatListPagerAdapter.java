package io.github.moonleeeaf.lingcat.main;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentActivity;
import androidx.viewpager2.adapter.FragmentStateAdapter;

public class ChatListPagerAdapter extends FragmentStateAdapter {

    public ChatListPagerAdapter(@NonNull FragmentActivity activity) {
        super(activity);
    }

    @NonNull
    @Override
    public Fragment createFragment(int position) {
        switch (position) {
            case 0:  return ChatListFragment.newInstance(ChatListViewModel.TabType.RECENT);
            case 1:  return ChatListFragment.newInstance(ChatListViewModel.TabType.FAVOURITE);
            default: return ChatListFragment.newInstance(ChatListViewModel.TabType.ALL);
        }
    }

    @Override
    public int getItemCount() {
        return 3;
    }
}