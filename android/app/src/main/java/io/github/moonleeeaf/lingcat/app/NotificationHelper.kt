package io.github.moonleeeaf.lingcat.app

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.drawable.Drawable
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.Person
import androidx.core.app.RemoteInput
import androidx.core.graphics.drawable.IconCompat
import coil.imageLoader
import coil.request.ImageRequest
import coil.request.SuccessResult
import io.github.moonleeeaf.lingcat.MainActivity
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.e2e.E2EStateManager
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

object NotificationHelper {
    const val CHANNEL_PRIVATE = "channel_private"
    const val CHANNEL_GROUP_AT = "channel_group_at"
    const val CHANNEL_GROUP_REPLY = "channel_group_reply"

    // 缓存聊天历史记录
    private val chatHistory = mutableMapOf<String, MutableList<NotificationCompat.MessagingStyle.Message>>()

    fun createChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = context.getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(NotificationChannel(CHANNEL_PRIVATE, "私聊消息", NotificationManager.IMPORTANCE_HIGH))
            manager.createNotificationChannel(NotificationChannel(CHANNEL_GROUP_AT, "群组 @我", NotificationManager.IMPORTANCE_HIGH))
            manager.createNotificationChannel(NotificationChannel(CHANNEL_GROUP_REPLY, "群组回复我", NotificationManager.IMPORTANCE_HIGH))
        }
    }

    // 内部统一构建 Person 的方法
    private suspend fun buildPerson(context: Context, userId: String?, name: String): Person {
        val builder = Person.Builder().setName(name)
        if (!userId.isNullOrEmpty()) {
            // 如果有头像 hash，尝试用 Coil 异步加载头像
            val user = ProfileCache.getCachedUser(userId) ?: ProfileCache.fetchUser(userId)
            val avatarHash = user?.avatarFileHash
            val fileToken = LingCatClientManager.fileAccessToken.value

            if (!avatarHash.isNullOrEmpty() && !fileToken.isNullOrEmpty()) {
                val avatarUrl = LingCatClientManager.currentClient?.getFileUrlByHashAndToken(avatarHash, fileToken)
                if (avatarUrl != null) {
                    try {
                        val request = ImageRequest.Builder(context).data(avatarUrl).allowHardware(false).build()
                        val result = context.imageLoader.execute(request)
                        if (result is SuccessResult) {
                            val bitmap = result.drawable.toBitmap()
                            builder.setIcon(IconCompat.createWithBitmap(bitmap))
                        }
                    } catch (e: Exception) {
                        // 加载失败就用默认图标
                    }
                }
            }
        }
        return builder.build()
    }

    private fun Drawable.toBitmap(): Bitmap {
        if (this is android.graphics.drawable.BitmapDrawable) return bitmap
        val bitmap = Bitmap.createBitmap(intrinsicWidth, intrinsicHeight, Bitmap.Config.ARGB_8888)
        val canvas = android.graphics.Canvas(bitmap)
        setBounds(0, 0, canvas.width, canvas.height)
        draw(canvas)
        return bitmap
    }

    private fun buildAndNotify(context: Context, channelId: String, chatTitle: String, chatId: String, myPerson: Person) {
        val manager = context.getSystemService(NotificationManager::class.java)
        val notificationId = chatId.hashCode()

        val history = chatHistory[chatId] ?: mutableListOf()

        val messagingStyle = NotificationCompat.MessagingStyle(myPerson)
            .setConversationTitle(chatTitle)
        history.forEach { messagingStyle.addMessage(it) }

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("route_chat_id", chatId)
        }
        val pendingIntent = PendingIntent.getActivity(
            context, notificationId, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // ★ 核心修复 1：根据聊天类型动态显示提示词
        val chat = ProfileCache.getCachedChat(chatId)
        val isE2E = chat?.type == "private"

        val labelText = if (isE2E) {
            "输入回复... (端到端加密)"
        } else {
            "输入回复..."
        }

        val remoteInput = RemoteInput.Builder("reply_text").setLabel(labelText).build()

        val replyIntent = Intent(context, ReplyReceiver::class.java).apply {
            putExtra("chat_id", chatId)
        }
        val replyPendingIntent = PendingIntent.getBroadcast(
            context, notificationId, replyIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )
        val replyAction = NotificationCompat.Action.Builder(
            android.R.drawable.ic_menu_send, "回复", replyPendingIntent
        ).addRemoteInput(remoteInput).build()

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setStyle(messagingStyle)
            .setContentIntent(pendingIntent)
            .addAction(replyAction)
            .setAutoCancel(true)
            .build()

        manager.notify(notificationId, notification)
    }

    suspend fun showNotification(context: Context, channelId: String, chatTitle: String, senderName: String, content: String, chatId: String) {
        val history = chatHistory.getOrPut(chatId) { mutableListOf() }
        val displayText = if (content.startsWith("🔒")) "🔒 [加密消息]" else content

        // ★ 核心：防抖去重。只对比 Text。
        // 如果上一句完全一样，说明是重复推送，直接 return
        val lastMsg = history.lastOrNull()
        if (lastMsg != null && lastMsg.text == displayText) {
            return
        }

        val myPerson = buildPerson(context, LingCatClientManager.currentUserId, "我")

        history.add(NotificationCompat.MessagingStyle.Message(displayText, System.currentTimeMillis(), senderName))
        if (history.size > 5) history.removeAt(0)

        buildAndNotify(context, channelId, chatTitle, chatId, myPerson)
    }

    suspend fun addMyMessage(context: Context, channelId: String, chatTitle: String, content: String, chatId: String) {
        val history = chatHistory.getOrPut(chatId) { mutableListOf() }
        val displayText = if (content.startsWith("🔒")) "🔒 [加密消息]" else content

        val myPerson = buildPerson(context, LingCatClientManager.currentUserId, "我")

        history.add(NotificationCompat.MessagingStyle.Message(displayText, System.currentTimeMillis(), myPerson))
        if (history.size > 5) history.removeAt(0)

        buildAndNotify(context, channelId, chatTitle, chatId, myPerson)
    }

    fun clearHistory(chatId: String) {
        chatHistory.remove(chatId)
    }
}