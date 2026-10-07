package io.github.moonleeeaf.lingcat.main;

import androidx.annotation.NonNull;
import androidx.lifecycle.LiveData;
import androidx.lifecycle.MutableLiveData;
import androidx.lifecycle.ViewModel;
import androidx.lifecycle.ViewModelProvider;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import lingcat.classes.Classes.IChat;
import lingcat.client_protocol.ChatApi;
import lingcat.client_protocol.LingCatClient;

public class ChatListViewModel extends ViewModel {

    public enum TabType { RECENT, FAVOURITE, ALL }

    private static final long API_TIMEOUT_MS = 15_000L;
    private static final int RECENT_LIMIT = 50;
    private static final int ALL_LIMIT = 1000;

    private final ExecutorService io = Executors.newSingleThreadExecutor();
    private final TabType tabType;

    private final MutableLiveData<List<IChat>> chats = new MutableLiveData<>(new ArrayList<>());
    private final MutableLiveData<Boolean> loading = new MutableLiveData<>(false);
    private final MutableLiveData<String> error = new MutableLiveData<>();

    public ChatListViewModel(TabType tabType) {
        this.tabType = tabType;
    }

    public LiveData<List<IChat>> getChats() { return chats; }
    public LiveData<Boolean> getLoading() { return loading; }
    public LiveData<String> getError() { return error; }

    public void load(LingCatClient client, String accessToken) {
        if (client == null || accessToken == null) {
            error.setValue("连接已断开");
            return;
        }

        loading.setValue(true);
        io.execute(() -> {
            try {
                List<IChat> result;
                switch (tabType) {
                    case FAVOURITE:
                        result = ChatApi.getMyFavouriteChats(client, accessToken,
                                null, null, API_TIMEOUT_MS);
                        break;
                    case RECENT: {
                        List<IChat> all = ChatApi.getMyChats(client, accessToken,
                                ALL_LIMIT, null, API_TIMEOUT_MS);
                        int n = Math.min(all.size(), RECENT_LIMIT);
                        result = new ArrayList<>(all.subList(0, n));
                        break;
                    }
                    case ALL:
                    default:
                        result = ChatApi.getMyChats(client, accessToken,
                                ALL_LIMIT, null, API_TIMEOUT_MS);
                        break;
                }
                chats.postValue(result);
            } catch (Exception e) {
                error.postValue(e.getMessage() != null ? e.getMessage() : e.toString());
            } finally {
                loading.postValue(false);
            }
        });
    }

    /** 清除错误（消费后） */
    public void clearError() {
        error.setValue(null);
    }

    @Override
    protected void onCleared() {
        super.onCleared();
        io.shutdownNow();
    }

    // ============================================================
    //                      Factory
    // ============================================================

    public static class Factory implements ViewModelProvider.Factory {
        private final TabType tabType;

        public Factory(TabType t) { this.tabType = t; }

        @NonNull
        @Override
        @SuppressWarnings("unchecked")
        public <T extends ViewModel> T create(@NonNull Class<T> modelClass) {
            return (T) new ChatListViewModel(tabType);
        }
    }
}