package io.github.moonleeeaf.lingcat.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import io.github.moonleeeaf.lingcat.MainActivity
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.ui.screens.chat.meeting.MeetingManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch

class MeetingService : Service() {
    private val CHANNEL_ID = "lingcat_meeting_ongoing"
    private val NOTIFICATION_ID = 1001
    private val serviceScope = CoroutineScope(Dispatchers.Main + Job())
    private var stateJob: Job? = null

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()

        // 监听会议状态，如果退出了会议，自动关闭服务
        stateJob = serviceScope.launch {
            MeetingManager.uiState.collectLatest { state ->
                if (state.phase == io.github.moonleeeaf.lingcat.ui.screens.chat.meeting.MeetingPhase.IDLE) {
                    stopSelf()
                } else {
                    startForeground(NOTIFICATION_ID, buildNotification(state.chatTitle ?: "会议"))
                }
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_NOT_STICKY
    }

    override fun onDestroy() {
        stateJob?.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun buildNotification(title: String): Notification {
        // 点击通知回到会议
        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("open_meeting", true)
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // 挂断按钮
        val hangupIntent = Intent(this, MeetingHangupReceiver::class.java)
        val hangupPending = PendingIntent.getBroadcast(
            this, 1, hangupIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_call)
            .setContentTitle(title)
            .setContentText("会议进行中，点击返回")
            .setContentIntent(pendingIntent)
            .addAction(R.drawable.ic_call_end, "挂断", hangupPending)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID, "会议状态",
                NotificationManager.IMPORTANCE_LOW // 降低提示音，保持常驻
            ).apply {
                setShowBadge(false)
                description = "保持会议在后台运行"
            }
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }
}