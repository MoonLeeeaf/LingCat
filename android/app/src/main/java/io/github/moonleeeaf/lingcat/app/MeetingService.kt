package io.github.moonleeeaf.lingcat.app

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import io.github.moonleeeaf.lingcat.MainActivity
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.ui.screens.chat.meeting.MeetingManager
import io.github.moonleeeaf.lingcat.ui.screens.chat.meeting.MeetingPhase
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
    
    // 记录当前的服务类型
    private var currentServiceType = 0

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // 判断是否是动态更新类型的请求
        if (intent?.action == ACTION_UPDATE_TYPE) {
            updateServiceTypeIfNeeded()
            return START_NOT_STICKY
        }

        // 正常启动流程
        try {
            currentServiceType = calculateServiceType()
            val initialNotification = buildNotification("会议准备中...")
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIFICATION_ID, initialNotification, currentServiceType)
            } else {
                startForeground(NOTIFICATION_ID, initialNotification)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            stopSelf()
            return START_NOT_STICKY
        }

        if (stateJob == null) {
            stateJob = serviceScope.launch {
                MeetingManager.uiState.collectLatest { state ->
                    if (state.phase == MeetingPhase.IDLE) {
                        stopSelf()
                    } else {
                        val manager = getSystemService(NotificationManager::class.java)
                        manager.notify(NOTIFICATION_ID, buildNotification(state.chatTitle ?: "会议进行中"))
                    }
                }
            }
        }

        return START_NOT_STICKY
    }

    private fun calculateServiceType(): Int {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return 0
        
        var type = ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK
        
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
            type = type or ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) {
            type = type or ServiceInfo.FOREGROUND_SERVICE_TYPE_CAMERA
        }
        
        // ★ 新增：如果当前正在屏幕共享，或者系统支持，就把 MediaProjection 加上
        // 注意：Android 14 上直接加上这个通常没问题，但如果在没有授权的情况下强行启动会崩溃。
        // 稳妥的做法是：只有真正开启屏幕共享时，才把 Type 切过去。
        if (MeetingManager.uiState.value.isScreenShareOn) {
            type = type or ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PROJECTION
        }
        
        return type
    }

    /**
     * 如果权限变了，重新调用 startForeground 刷新类型
     */
    private fun updateServiceTypeIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val newType = calculateServiceType()
            if (newType != currentServiceType) {
                currentServiceType = newType
                val notification = buildNotification(MeetingManager.uiState.value.chatTitle ?: "会议进行中")
                // 重新调用 startForeground 更新类型
                startForeground(NOTIFICATION_ID, notification, currentServiceType)
            }
        }
    }

   
    override fun onDestroy() {
        stateJob?.cancel()
        stateJob = null
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun buildNotification(title: String): Notification {
        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("open_meeting", true)
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, openIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val hangupIntent = Intent(this, MeetingHangupReceiver::class.java).apply {
            action = "ACTION_HANGUP_MEETING"
        }
        val hangupPending = PendingIntent.getBroadcast(
            this, 1, hangupIntent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_call) // 确保你有这个图标
            .setContentTitle(title)
            .setContentText("会议进行中，点击返回")
            .setContentIntent(pendingIntent)
            .addAction(R.drawable.ic_call_end, "挂断", hangupPending) // 确保你有这个图标
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_CALL)
            .setForegroundServiceBehavior(NotificationCompat.FOREGROUND_SERVICE_IMMEDIATE)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID, "会议状态",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                setShowBadge(false)
                description = "保持会议在后台运行"
            }
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }


    companion object {
        const val ACTION_UPDATE_TYPE = "ACTION_UPDATE_TYPE"

        fun start(context: Context) {
            val intent = Intent(context, MeetingService::class.java)
            ContextCompat.startForegroundService(context, intent)
        }
        
        /**
         * 暴露给外部调用的更新类型方法
         */
        fun updateServiceType(context: Context) {
            val intent = Intent(context, MeetingService::class.java).apply {
                action = ACTION_UPDATE_TYPE
            }
            // 服务已经在运行，用普通的 startService 即可触发 onStartCommand
            context.startService(intent)
        }
    }
}