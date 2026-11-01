package io.github.moonleeeaf.lingcat.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.*
import lingcat.classes.Classes
import lingcat.client_protocol.ChatApi
import lingcat.methods.Methods.Receive_Chat_Message_Event
import lingcat.protocol.Methods

class ConnectionKeepAliveService : Service() {
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val CHANNEL_ID = "lingcat_keep_alive"

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForeground(1, buildNotification())

        serviceScope.launch {
            LingCatClientManager.globalEvents.collect { pkg ->
                if (pkg.method_id == Methods.Receive_Chat_Message_Event) {
                    val ev = Receive_Chat_Message_Event.parseFrom(pkg.data)
                    if (ev.hasMsg()) {
                        processMessageForNotification(ev.msg)
                    }
                }
            }
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // ★ 兜底重连：如果进入服务时发现没连上，顺手发个重连
        val currentClient = LingCatClientManager.currentClient
        if (currentClient == null || !currentClient.isReady()) {
            val server = LingCatClientManager.currentServer
            val token = LingCatClientManager.currentToken
            if (server != null && token != null) {
                val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
                serviceScope.launch {
                    LingCatClientManager.connect(server)
                }
            }
        }
        return START_STICKY
    }

    override fun onDestroy() {
        serviceScope.cancel()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID, "后台保活服务",
                NotificationManager.IMPORTANCE_LOW
            ).apply { setShowBadge(false) }
            getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
        }
    }

    private fun buildNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("LingCat 正在运行")
            .setContentText("保持与服务器的连接中...")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .build()
    }

    private suspend fun processMessageForNotification(msg: Classes.IMessage) {
        // 1. 过滤自己发的消息
        if (msg.senderUserId == LingCatClientManager.currentUserId) return

        // 2. 过滤当前正在看的聊天（如果是聊天页，且 App 在前台，就不弹）
        if (AppState.isAppForeground && msg.chatId == AppState.activeChatId) {
            return
        }

        // 3. 获取聊天信息判断是私聊还是群聊
        val chat = ProfileCache.fetchChat(msg.chatId) ?: return
        val sender = ProfileCache.fetchUser(msg.senderUserId)
        val senderName = sender?.nickname?.ifEmpty { sender.username } ?: "未知用户"
        val title = chat.title.ifEmpty { senderName }

        var previewText = msg.text
        if (msg.entitiesList.any { it.type == "e2e" }) {
            previewText = "🔒 [加密消息]"
        } else if (msg.entitiesList.any { it.type == "attachment" }) {
            previewText = "[附件] $previewText"
        }

        if (chat.type == "private") {
            // 私聊直接弹
            NotificationHelper.showNotification(
                context = this,
                channelId = NotificationHelper.CHANNEL_PRIVATE,
                chatTitle = title,
                senderName = senderName,
                content = previewText,
                chatId = msg.chatId
            )
            return
        }

        // 群聊：判断是否 @ 我
        val isMentioned = msg.entitiesList.any { it.type == "user_mention" && it.data == LingCatClientManager.currentUserId }
        if (isMentioned) {
            NotificationHelper.showNotification(
                context = this,
                channelId = NotificationHelper.CHANNEL_GROUP_AT,
                chatTitle = "$title (有人@你)",
                senderName = senderName,
                content = previewText,
                chatId = msg.chatId
            )
            return
        }

        // 群聊：判断是否回复我
        val replyEntity = msg.entitiesList.find { it.type == "reply" }
        if (replyEntity != null) {
            val targetSeq = replyEntity.data.toIntOrNull() ?: -1
            if (targetSeq != -1) {
                // ★ 核心：手动调一次 API 查这条被回复的消息是谁发的
                try {
                    val client = LingCatClientManager.currentClient
                    val token = LingCatClientManager.currentToken
                    if (client != null && token != null) {
                        val fetched = withContext(Dispatchers.IO) {
                            ChatApi.getChatMessages(client, token, msg.chatId, targetSeq + 1, targetSeq - 1, 1)
                        }
                        val targetMsg = fetched.find { it.id == targetSeq }
                        if (targetMsg?.senderUserId == LingCatClientManager.currentUserId) {
                            NotificationHelper.showNotification(
                                context = this,
                                channelId = NotificationHelper.CHANNEL_GROUP_REPLY,
                                chatTitle = "$title (有人回复你)",
                                senderName = senderName,
                                content = previewText,
                                chatId = msg.chatId
                            )
                            return
                        }
                    }
                } catch (e: Exception) {
                    Log.e("Notification", "fetch target msg failed", e)
                }
            }
        }

        // 如果既没@也没回复，就不弹通知了（静默）
    }
}