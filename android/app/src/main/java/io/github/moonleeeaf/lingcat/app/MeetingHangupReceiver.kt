package io.github.moonleeeaf.lingcat.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import io.github.moonleeeaf.lingcat.ui.screens.chat.meeting.MeetingManager

class MeetingHangupReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        MeetingManager.leaveMeeting(disconnectRoom = true)
        context.stopService(Intent(context, MeetingService::class.java))
    }
}