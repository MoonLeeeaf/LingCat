package io.github.moonleeeaf.lingcat.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import io.github.moonleeeaf.lingcat.ui.screens.chat.meeting.MeetingManager

class MeetingHangupReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context?, intent: Intent?) {
        if (intent?.action == "ACTION_HANGUP_MEETING") {
            // 调用 MeetingManager 挂断逻辑
            // 如果会议是用户自己发起的，可以直接调 endMeeting(context) 彻底结束会议
            // 如果是参与别人，调 leaveMeeting(disconnectRoom = true)
            MeetingManager.leaveMeeting(disconnectRoom = true)
            
            // 注意：这里不需要手动 stopSelf()，因为 MeetingManager 的 state 变成 IDLE 后，
            // MeetingService 的协程会自动捕获到并调用 stopSelf()
        }
    }
}