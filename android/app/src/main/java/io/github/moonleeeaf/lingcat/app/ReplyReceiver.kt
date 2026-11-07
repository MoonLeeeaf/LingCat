package io.github.moonleeeaf.lingcat.app

import android.app.RemoteInput
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import io.github.moonleeeaf.lingcat.e2e.E2EStateManager
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.classes.Classes.IMessageEntity
import lingcat.client_protocol.ChatApi
import lingcat.client_protocol.MessageParser
import org.json.JSONArray
import org.json.JSONObject

class ReplyReceiver : BroadcastReceiver() {
    private val TAG = "ReplyReceiver"

    override fun onReceive(context: Context, intent: Intent) {
        val chatId = intent.getStringExtra("chat_id") ?: return
        val remoteInput = RemoteInput.getResultsFromIntent(intent) ?: return
        val replyText = remoteInput.getCharSequence("reply_text")?.toString()?.trim() ?: return
        if (replyText.isEmpty()) return

        val client = LingCatClientManager.currentClient
        val token = LingCatClientManager.currentToken
        
        // ★ 优化 1：前置检查网络状态，防止 goAsync 耗时过长导致 10 秒超时崩溃
        if (client == null || token == null || !client.isReady()) {
            CoroutineScope(Dispatchers.Main).launch {
                android.widget.Toast.makeText(
                    context, 
                    "网络未连接，请打开 App 重试", 
                    android.widget.Toast.LENGTH_SHORT
                ).show()
            }
            return
        }

        val pendingResult = goAsync()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                // 1. 获取真实的 Chat 信息
                val chat = ChatApi.queryChatInfo(client, token, chatId)
                if (chat == null) {
                    Log.e(TAG, "无法获取 chat 信息")
                    return@launch
                }

                val peerId = if (chat.type == "private") chat.peerUserId else null
                var finalText = replyText
                var finalEntities: List<IMessageEntity>? = null

                // 2. 如果是私聊，强制初始化 E2E 状态并判断
                if (chat.type == "private" && peerId != null) {
                    // ★ 绝杀 1：强制拉取 E2E 状态（如果没解锁会自动走本地 Keystore 免密解锁）
                    E2EStateManager.loadKeyState()

                    val e2eStatus = E2EStateManager.status.value

                    if (e2eStatus == E2EStateManager.Status.DISABLED) {
                        // 对方或自己确实没开 E2E，允许发明文
                    } else {
                        // 开启了 E2E，那就必须处于 UNLOCKED 状态才能发
                        if (e2eStatus != E2EStateManager.Status.UNLOCKED) {
                            withContext(Dispatchers.Main) {
                                android.widget.Toast.makeText(context, "端到端加密已锁定，请打开 App 输入密码后重试", android.widget.Toast.LENGTH_LONG).show()
                            }
                            return@launch // ★ 绝杀 2：未解锁绝对不降级发明文！
                        }

                        // 强制同步公钥
                        E2EStateManager.fetchPeerKey(peerId, force = true)

                        // ★ 优化 2：完整解析富文本实体，防止回复/提及等格式丢失
                        val parsed = MessageParser.parseMessage(replyText)
                        val payloadJson = JSONObject().apply {
                            put("text", parsed.text)
                            val arr = JSONArray()
                            parsed.entities?.forEach { e ->
                                arr.put(JSONObject().apply {
                                    put("type", e.type)
                                    put("offset", e.offset)
                                    put("length", e.length)
                                    put("data", e.data)
                                })
                            }
                            put("entities", arr)
                        }.toString()

                        val encryptedData = E2EStateManager.encryptForPeer(payloadJson, peerId)
                        if (encryptedData != null) {
                            finalText = "🔒"
                            finalEntities = listOf(
                                IMessageEntity.newBuilder()
                                    .setType("e2e")
                                    .setOffset(0)
                                    .setLength(1)
                                    .setData(encryptedData)
                                    .build()
                            )
                        } else {
                            withContext(Dispatchers.Main) {
                                android.widget.Toast.makeText(context, "加密失败，请打开 App 重试", android.widget.Toast.LENGTH_SHORT).show()
                            }
                            return@launch // ★ 绝杀 3：加密失败绝对不发明文！
                        }
                    }
                }

                // 3. 发送
                ChatApi.sendChatMessage(client, token, chatId, finalText, finalEntities)
                Log.d(TAG, "Notification reply sent successfully")

                // 4. 更新通知栏
                val chatTitle = chat.title.ifEmpty { "会话" }
                // 如果 finalEntities 不为空，说明走了 E2E 加密
                val displayContent = if (finalEntities != null) "🔒 [加密消息]" else replyText
                NotificationHelper.addMyMessage(
                    context = context,
                    channelId = if (chat.type == "private") NotificationHelper.CHANNEL_PRIVATE else NotificationHelper.CHANNEL_GROUP_AT,
                    chatTitle = chatTitle,
                    content = displayContent,
                    chatId = chatId
                )

            } catch (e: Exception) {
                Log.e(TAG, "Notification reply failed", e)
            } finally {
                pendingResult.finish()
            }
        }
    }
}