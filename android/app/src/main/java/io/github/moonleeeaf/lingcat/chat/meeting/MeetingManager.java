package io.github.moonleeeaf.lingcat.chat.meeting;

import android.content.Context;
import android.content.Intent;
import android.util.Log;

import androidx.annotation.Nullable;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

import io.github.moonleeeaf.lingcat.chat.ChatActivity;
import lingcat.methods.Methods.Meeting_Ended_Event;
import lingcat.methods.Methods.Meeting_Started_Event;

/**
 * 会议状态机。
 *
 * 职责：
 *   - 记录每个 chat 是否在开会
 *   - 处理 Meeting_Started / Ended 事件
 *   - 发起 / 加入 / 离开
 *   - 通知 UI 层刷新 banner
 */
public final class MeetingManager {

    private static final String TAG = "MeetingManager";
    private static volatile MeetingManager INSTANCE;

    public static MeetingManager get() {
        if (INSTANCE == null) {
            synchronized (MeetingManager.class) {
                if (INSTANCE == null) INSTANCE = new MeetingManager();
            }
        }
        return INSTANCE;
    }

    private MeetingManager() {}

    // ============================================================
    //                      数据结构
    // ============================================================

    /** 一个正在进行的会议 */
    public static class ActiveMeeting {
        public final String chatId;
        public final String meetingId;
        public final String room;
        public final String starterUserId;
        @Nullable public final String title;

        public ActiveMeeting(String chatId, String meetingId, String room,
                             String starterUserId, @Nullable String title) {
            this.chatId = chatId;
            this.meetingId = meetingId;
            this.room = room;
            this.starterUserId = starterUserId;
            this.title = title;
        }
    }

    public interface OnMeetingChangedListener {
        void onMeetingChanged(String chatId);
    }

    /** chatId -> ActiveMeeting */
    private final Map<String, ActiveMeeting> activeMeetings = new ConcurrentHashMap<>();
    private final CopyOnWriteArrayList<OnMeetingChangedListener> listeners = new CopyOnWriteArrayList<>();

    /** 当前我参与的会议 chatId（一个 App 同一时刻只在一个会议里） */
    private volatile String currentChatId;
    /** 当前 LiveKit 控制器（我在会议中时非空） */
    private volatile MeetingRoomController currentController;

    // ============================================================
    //                      监听
    // ============================================================

    public void addListener(OnMeetingChangedListener l) { listeners.add(l); }
    public void removeListener(OnMeetingChangedListener l) { listeners.remove(l); }

    private void notifyChanged(String chatId) {
        for (OnMeetingChangedListener l : listeners) {
            try { l.onMeetingChanged(chatId); } catch (Exception ignored) {}
        }
    }

    // ============================================================
    //                      查询
    // ============================================================

    @Nullable
    public ActiveMeeting getActiveMeeting(String chatId) {
        return chatId == null ? null : activeMeetings.get(chatId);
    }

    public boolean isInMeeting(String chatId) {
        return chatId != null && chatId.equals(currentChatId);
    }

    public boolean hasAnyMeeting(String chatId) {
        return chatId != null && activeMeetings.containsKey(chatId);
    }

    @Nullable
    public MeetingRoomController getCurrentController() {
        return currentController;
    }

    @Nullable
    public String getCurrentChatId() {
        return currentChatId;
    }

    // ============================================================
    //                      服务端事件
    // ============================================================

    public void onMeetingStarted(Meeting_Started_Event ev) {
        String chatId = ev.getChatId();
        if (chatId == null) return;

        ActiveMeeting m = new ActiveMeeting(
                chatId,
                ev.getMeetingId(),
                ev.getRoom(),
                ev.getStarterUserId(),
                ev.hasTitle() ? ev.getTitle() : null
        );
        activeMeetings.put(chatId, m);
        Log.i(TAG, "meeting started in " + chatId);
        notifyChanged(chatId);
    }

    public void onMeetingEnded(Meeting_Ended_Event ev) {
        String chatId = ev.getChatId();
        if (chatId == null) return;

        activeMeetings.remove(chatId);
        Log.i(TAG, "meeting ended in " + chatId);

        // 如果我在这个会议里，自动挂断
        if (chatId.equals(currentChatId)) {
            leave();
        }
        notifyChanged(chatId);
    }

    // ============================================================
    //                      进入 / 离开
    // ============================================================

    /**
     * 打开 MeetingActivity。
     * @param isStarter true = 我是发起人（会先调 MeetingApi.startMeeting）
     */
    public void openMeeting(Context ctx, String chatId, String title, boolean isStarter) {
        Intent i = new Intent(ctx, MeetingActivity.class);
        i.putExtra(MeetingActivity.EXTRA_CHAT_ID, chatId);
        i.putExtra(MeetingActivity.EXTRA_CHAT_TITLE, title);
        i.putExtra(MeetingActivity.EXTRA_IS_STARTER, isStarter);
        ctx.startActivity(i);
    }

    /** 由 MeetingActivity 在连接成功后调用 */
    public void attach(String chatId, MeetingRoomController controller) {
        this.currentChatId = chatId;
        this.currentController = controller;
    }

    /** 由 MeetingActivity 在断开前调用 */
    public void detach() {
        this.currentChatId = null;
        this.currentController = null;
    }

    /** 主动离开会议（MeetingActivity 调） */
    public void leave() {
        MeetingRoomController c = currentController;
        if (c != null) {
            try { c.disconnect(); } catch (Exception ignored) {}
        }
        detach();
    }
}