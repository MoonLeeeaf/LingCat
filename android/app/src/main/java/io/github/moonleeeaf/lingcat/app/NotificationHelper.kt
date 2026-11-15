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

    /** 通知所属账号的 userId，点击 / 回复时用来确认这条通知没有被切号。 */
    const val EXTRA_ACCOUNT_USER_ID = "notification_account_user_id"
    /** 通知本身的 id，回复失败或账号不匹配时可以精确取消。 */
    const val EXTRA_NOTIFICATION_ID = "notification_id"

    private val CHAT_CHANNELS = setOf(CHANNEL_PRIVATE, CHANNEL_GROUP_AT, CHANNEL_GROUP_REPLY)

    // 前台服务的通知 id：清理聊天通知时必须保留，否则会让前台服务「掉通知」。
    private const val KEEP_ALIVE_NOTIFICATION_ID = 1
    private const val MEETING_NOTIFICATION_ID = 1001

    // 缓存聊天历史记录。
    // key 必须带账号：同一个 chatId 在不同账号下可能是完全不同的会话，
    // 只按 chatId 存会让切换账号后的通知混进上一个账号的消息。
    private val chatHistory = mutableMapOf<String, MutableList<NotificationCompat.MessagingStyle.Message>>()

    private fun accountKey(userId: String?): String =
        userId?.trim()?.takeIf { it.isNotEmpty() } ?: "guest"

    private fun historyKey(accountUserId: String, chatId: String): String =
        "$accountUserId|$chatId"

    /** 该会话通知使用的 id（按账号区分，避免旧账号的通知被新账号覆盖 / 复用）。 */
    fun notificationId(chatId: String): Int =
        historyKey(accountKey(LingCatClientManager.currentUserId), chatId).hashCode()

    fun createChannels(context: Context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val manager = context.getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(NotificationChannel(
                CHANNEL_PRIVATE,
                context.getString(R.string.notif_channel_private),
                NotificationManager.IMPORTANCE_HIGH,
            ))
            manager.createNotificationChannel(NotificationChannel(
                CHANNEL_GROUP_AT,
                context.getString(R.string.notif_channel_group_at),
                NotificationManager.IMPORTANCE_HIGH,
            ))
            manager.createNotificationChannel(NotificationChannel(
                CHANNEL_GROUP_REPLY,
                context.getString(R.string.notif_channel_group_reply),
                NotificationManager.IMPORTANCE_HIGH,
            ))
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

    private fun buildAndNotify(
        context: Context,
        channelId: String,
        chatTitle: String,
        chatId: String,
        accountUserId: String,
        myPerson: Person,
    ) {
        val manager = context.getSystemService(NotificationManager::class.java)
        val key = historyKey(accountUserId, chatId)
        val notificationId = key.hashCode()

        val history = chatHistory[key] ?: mutableListOf()

        val messagingStyle = NotificationCompat.MessagingStyle(myPerson)
            .setConversationTitle(chatTitle)
        history.forEach { messagingStyle.addMessage(it) }

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("route_chat_id", chatId)
            putExtra(EXTRA_ACCOUNT_USER_ID, accountUserId)
        }
        val pendingIntent = PendingIntent.getActivity(
            context, notificationId, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // ★ 核心修复：对齐 ChatViewModel 的 E2E 判断逻辑
        // 必须同时满足以下三个条件才认为是 E2E 聊天：
        // 1. 是私聊 (type == "private") 且能拿到对方 ID
        // 2. 全局 E2E 状态不是 DISABLED (用户已经生成过密钥)
        // 3. 对方有公钥缓存 (对方也开启了 E2E)
        val chat = ProfileCache.getCachedChat(chatId)
        var isE2E = false
        if (chat != null && chat.type == "private" && chat.hasPeerUserId()) {
            val peerId = chat.peerUserId
            val status = E2EStateManager.status.value
            val hasPeerKey = E2EStateManager.getPeerPublicKey(peerId) != null

            if ((status == E2EStateManager.Status.LOCKED || status == E2EStateManager.Status.UNLOCKED) && hasPeerKey) {
                isE2E = true
            }
        }

        val labelText = if (isE2E) {
            context.getString(R.string.notif_reply_hint_e2e)
        } else {
            context.getString(R.string.notif_reply_hint)
        }

        val remoteInput = RemoteInput.Builder("reply_text").setLabel(labelText).build()

        val replyIntent = Intent(context, ReplyReceiver::class.java).apply {
            putExtra("chat_id", chatId)
            putExtra(EXTRA_ACCOUNT_USER_ID, accountUserId)
            putExtra(EXTRA_NOTIFICATION_ID, notificationId)
        }
        val replyPendingIntent = PendingIntent.getBroadcast(
            context, notificationId, replyIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )
        val replyAction = NotificationCompat.Action.Builder(
            android.R.drawable.ic_menu_send, context.getString(R.string.notif_action_reply), replyPendingIntent
        ).addRemoteInput(remoteInput).build()

        val lastSenderName = chatHistory[key]?.lastOrNull()?.person?.name

        // 1. 安全地拿到发送者名字，如果拿不到就默认显示 "新消息"
        val publicMessage = if (lastSenderName == null) {
            context.getString(R.string.notif_new_message)
        } else {
            context.getString(R.string.notif_new_message_from, lastSenderName)
        }

        // 2. 构建锁屏脱敏通知
        val publicNotification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_lingcat) // ★ 用你刚建的通知小图标
            .setContentTitle(chatTitle) // 显示群名或对方名字
            .setContentText(publicMessage)
            .build()

        val notification = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.drawable.ic_lingcat)
            .setStyle(messagingStyle)
            .setContentIntent(pendingIntent)
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .setPublicVersion(publicNotification)
            .addAction(replyAction)
            .setAutoCancel(true)
            .build()

        // 构建过程中可能刚好切换了账号：旧账号的消息不能再弹到新账号的通知栏里。
        if (accountKey(LingCatClientManager.currentUserId) != accountUserId) {
            chatHistory.remove(key)
            return
        }
        manager.notify(notificationId, notification)
    }

    suspend fun showNotification(context: Context, channelId: String, chatTitle: String, senderName: String, content: String, chatId: String) {
        // 账号在 suspend 期间可能变化，先固定一次，保证历史 key 和通知 id 用的是同一个账号。
        val accountUserId = accountKey(LingCatClientManager.currentUserId)
        val key = historyKey(accountUserId, chatId)
        val history = chatHistory.getOrPut(key) { mutableListOf() }
        val displayText = if (content.startsWith("🔒")) context.getString(R.string.encrypted_message_locked) else content

        // ★ 核心：防抖去重。只对比 Text。
        // 如果上一句完全一样，说明是重复推送，直接 return
        val lastMsg = history.lastOrNull()
        if (lastMsg != null && lastMsg.text == displayText) {
            return
        }

        val myPerson = buildPerson(context, LingCatClientManager.currentUserId, context.getString(R.string.notif_sender_me))

        history.add(NotificationCompat.MessagingStyle.Message(displayText, System.currentTimeMillis(), senderName))
        if (history.size > 5) history.removeAt(0)

        buildAndNotify(context, channelId, chatTitle, chatId, accountUserId, myPerson)
    }

    suspend fun addMyMessage(context: Context, channelId: String, chatTitle: String, content: String, chatId: String) {
        val accountUserId = accountKey(LingCatClientManager.currentUserId)
        val key = historyKey(accountUserId, chatId)
        val history = chatHistory.getOrPut(key) { mutableListOf() }
        val displayText = if (content.startsWith("🔒")) context.getString(R.string.encrypted_message_locked) else content

        val myPerson = buildPerson(context, LingCatClientManager.currentUserId, context.getString(R.string.notif_sender_me))

        history.add(NotificationCompat.MessagingStyle.Message(displayText, System.currentTimeMillis(), myPerson))
        if (history.size > 5) history.removeAt(0)

        buildAndNotify(context, channelId, chatTitle, chatId, accountUserId, myPerson)
    }

    /** 清除当前账号下某个会话的通知历史（不取消通知本身）。 */
    fun clearHistory(chatId: String) {
        chatHistory.remove(historyKey(accountKey(LingCatClientManager.currentUserId), chatId))
    }

    /** 进入会话时同时清除历史和通知栏里的通知。 */
    fun clearChat(context: Context, chatId: String) {
        clearHistory(chatId)
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.cancel(notificationId(chatId))
    }

    /**
     * 切换 / 退出账号时清空通知栏里的聊天通知。
     *
     * 只清理私聊 / 群聊通道，保留前台保活服务和会议通知。
     * 同时清空历史，防止新账号在同一个 chatId 下复用旧账号的消息。
     */
    fun clearAll(context: Context) {
        chatHistory.clear()
        val manager = context.getSystemService(NotificationManager::class.java)
        try {
            manager.activeNotifications.forEach { sbn ->
                val isChatNotification = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    sbn.notification.channelId in CHAT_CHANNELS
                } else {
                    // API 24/25 没有 channelId，按 id 排除两个前台服务通知
                    sbn.id != KEEP_ALIVE_NOTIFICATION_ID && sbn.id != MEETING_NOTIFICATION_ID
                }
                if (isChatNotification) manager.cancel(sbn.id)
            }
        } catch (e: Exception) {
            // 清理通知失败不应该影响切号本身
        }
    }
}
