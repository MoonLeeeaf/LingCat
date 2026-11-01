package io.github.moonleeeaf.lingcat.ui.screens.chat

import android.widget.Toast
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AttachFile
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.moonleeeaf.lingcat.e2e.E2EStateManager
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.classes.Classes.IMessage
import lingcat.classes.Classes.IMessageEntity
import lingcat.client_protocol.HttpClientProvider
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.util.concurrent.ConcurrentHashMap

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun MessageContent(
    message: IMessage,
    isMine: Boolean,
    isSystem: Boolean = false,
    onReplyClick: (Int) -> Unit,
    onMentionClick: (String, Boolean) -> Unit,
    onAttachmentClick: (hash: String, name: String, isImage: Boolean) -> Unit,
    onLongClick: () -> Unit,
    findMessage: suspend (Int) -> IMessage? = { null },
) {
    val coroutineScope = rememberCoroutineScope()
    val context = LocalContext.current

    // ★ 修复 1：直接使用 collectAsState，不要包在 remember 里
    val e2eState by E2EStateManager.status.collectAsState()

    var decryptedText by remember { mutableStateOf<String?>(null) }
    var decryptedEntities by remember { mutableStateOf<List<IMessageEntity>?>(null) } // ★ 新增：保存解密后的富文本实体
    var isDecrypting by remember { mutableStateOf(false) }
    var showUnlockDialog by remember { mutableStateOf(false) }

    val e2eEntity = message.entitiesList?.find { it.type == "e2e" }

    var needVersion by remember { mutableStateOf<Int?>(null) }

    // ★ 新增：当消息被编辑（文本或实体变化）时，重置缓存，强制重新解密
    LaunchedEffect(message.text, message.entitiesList) {
        decryptedText = null
        decryptedEntities = null
        needVersion = null
    }

    var forceRefresh by remember { mutableStateOf(0) }

    LaunchedEffect(e2eEntity, e2eState, forceRefresh) { // ★ 加入 forceRefresh 依赖
        if (e2eEntity != null && e2eState == E2EStateManager.Status.UNLOCKED && decryptedText == null) {
            isDecrypting = true
            val plainJson = E2EStateManager.decryptFromPeer(e2eEntity.data, message.senderUserId)
            if (plainJson != null) {
                android.util.Log.d("E2EDebug", "解密后的 JSON: $plainJson")
                try {
                    val obj = JSONObject(plainJson)
                    if (obj.has("needVersion")) {
                        needVersion = obj.getInt("needVersion")
                    } else {
                        decryptedText = obj.optString("text", "")
                        val entArr = obj.optJSONArray("entities")
                        val newEntities = mutableListOf<IMessageEntity>()
                        if (entArr != null) {
                            for (i in 0 until entArr.length()) {
                                val je = entArr.getJSONObject(i)
                                newEntities.add(IMessageEntity.newBuilder()
                                    .setType(je.getString("type"))
                                    .setOffset(je.getInt("offset"))
                                    .setLength(je.getInt("length"))
                                    .setData(je.optString("data", ""))
                                    .build())
                            }
                        }
                        decryptedEntities = newEntities
                        needVersion = null // 解密成功后清空需求
                    }
                } catch (e: Exception) {
                    decryptedText = plainJson
                }
            }
            isDecrypting = false
        }
    }

    if (e2eEntity != null && decryptedText == null) {
        // 还没解密出来的状态
        Row(
            modifier = Modifier
                .combinedClickable(
                    onClick = {
                        if (e2eState != E2EStateManager.Status.UNLOCKED) {
                            showUnlockDialog = true
                        }
                    },
                    onLongClick = onLongClick,
                )
                .padding(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (isDecrypting) {
                CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
            } else {
                if (needVersion != null) {
                    // ★ 显示需要解锁特定版本的 UI
                    val coroutineScope = rememberCoroutineScope()
                    var showVersionUnlockDialog by remember { mutableStateOf(false) }

                    Row(
                        modifier = Modifier
                            .clickable { showVersionUnlockDialog = true },
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.Lock, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("使用了旧密钥 (可能是 v$needVersion)，点击解锁", color = MaterialTheme.colorScheme.error)
                    }

                    // 弹窗让用户输入该版本的旧密码
                    if (showVersionUnlockDialog) {
                        var pwd by remember { mutableStateOf("") }
                        var isWorking by remember { mutableStateOf(false) }
                        var errorMsg by remember { mutableStateOf<String?>(null) }

                        AlertDialog(
                            onDismissRequest = { if (!isWorking) showVersionUnlockDialog = false },
                            title = { Text("解锁历史消息 (v$needVersion)") },
                            text = {
                                Column {
                                    OutlinedTextField(
                                        value = pwd,
                                        onValueChange = { pwd = it; errorMsg = null },
                                        label = { Text("请输入该版本的密码") },
                                        visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation()
                                    )
                                    if (errorMsg != null) {
                                        Text(errorMsg!!, color = MaterialTheme.colorScheme.error)
                                    }
                                }
                            },
                            confirmButton = {
                                TextButton(
                                    onClick = {
                                        coroutineScope.launch {
                                            isWorking = true
                                            val success = E2EStateManager.unlockSpecificVersion(needVersion!!, pwd)
                                            isWorking = false
                                            if (success) {
                                                showVersionUnlockDialog = false
                                                // ★ 核心修复：强行让这个组件重组并重新尝试解密
                                                forceRefresh++
                                            } else {
                                                errorMsg = "密码错误"
                                            }
                                        }
                                    },
                                    enabled = pwd.isNotBlank() && !isWorking
                                ) { Text(if (isWorking) "解锁中..." else "解锁") }
                            }
                        )
                    }
                } else {
                    Icon(
                        Icons.Default.Lock,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.error
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("加密消息，点击解锁", color = MaterialTheme.colorScheme.error)
                }
            }
        }

        if (showUnlockDialog) {
            var password by remember { mutableStateOf("") }
            var isUnlocking by remember { mutableStateOf(false) }
            var unlockError by remember { mutableStateOf<String?>(null) }

            AlertDialog(
                onDismissRequest = { if (!isUnlocking) showUnlockDialog = false },
                title = { Text("解锁端到端加密") },
                text = {
                    Column {
                        Text("请输入安全密码来解锁此消息")
                        Spacer(Modifier.height(8.dp))
                        OutlinedTextField(
                            value = password,
                            onValueChange = {
                                password = it
                                unlockError = null
                            },
                            label = { Text("安全密码") },
                            singleLine = true,
                            visualTransformation = PasswordVisualTransformation(),
                            enabled = !isUnlocking
                        )
                        if (unlockError != null) {
                            Text(unlockError!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                        }
                    }
                },
                confirmButton = {
                    TextButton(
                        onClick = {
                            if (password.isBlank()) return@TextButton

                            // ★ 核心修复：使用协程作用域调用挂起函数
                            coroutineScope.launch {
                                isUnlocking = true
                                val success = E2EStateManager.unlock(password)
                                isUnlocking = false

                                if (success) {
                                    showUnlockDialog = false
                                    // 解锁成功后，LaunchedEffect 会自动监听到状态变化并自动解密
                                } else {
                                    unlockError = "密码错误，请重试"
                                }
                            }
                        },
                        enabled = !isUnlocking && password.isNotBlank()
                    ) {
                        if (isUnlocking) {
                            CircularProgressIndicator(Modifier.size(16.dp), color = MaterialTheme.colorScheme.onPrimary, strokeWidth = 2.dp)
                        } else {
                            Text("确认")
                        }
                    }
                },
                dismissButton = {
                    TextButton(
                        onClick = { showUnlockDialog = false },
                        enabled = !isUnlocking
                    ) {
                        Text("取消")
                    }
                }
            )
        }
        return
    }

    // ★ 修复 2：统一在这里定义 displayText 和 displayEntities
    val displayText = decryptedText ?: message.text ?: ""
    val displayEntities = decryptedEntities ?: message.entitiesList ?: emptyList()

    if (displayText.isEmpty() && displayEntities.isEmpty()) {
        return // 空消息直接不渲染
    }

    // ==========================================
    // 分段解析
    // ==========================================
    val sortedEntities = displayEntities.sortedBy { it.offset }
    var cursor = 0
    val segments = mutableListOf<Segment>()

    for (e in sortedEntities) {
        val start = e.offset
        val end = start + e.length
        if (start < 0 || end > displayText.length || start >= end) continue
        if (start < cursor) continue

        if (start > cursor) {
            segments.add(Segment(displayText.substring(cursor, start), null))
        }
        segments.add(Segment(displayText.substring(start, end), e))
        cursor = end
    }
    if (cursor < displayText.length) {
        segments.add(Segment(displayText.substring(cursor), null))
    }

    // ==========================================
    // 渲染分组 (Block vs Inline)
    // ==========================================
    val groups = mutableListOf<MutableList<Segment>>()
    var inlineBuf = mutableListOf<Segment>()

    for (seg in segments) {
        if (seg.entity != null && (seg.entity.type == "reply" || seg.entity.type == "attachment")) {
            if (inlineBuf.isNotEmpty()) {
                groups.add(ArrayList(inlineBuf))
                inlineBuf.clear()
            }
            groups.add(mutableListOf(seg)) // block 独占一组
        } else {
            inlineBuf.add(seg)
        }
    }
    if (inlineBuf.isNotEmpty()) groups.add(inlineBuf)

    // ==========================================
    // 绘制 UI
    // ==========================================
    Column(
        modifier = Modifier.width(androidx.compose.foundation.layout.IntrinsicSize.Max),
        horizontalAlignment = if (isSystem) Alignment.CenterHorizontally else Alignment.Start,
    ) {
        for (group in groups) {
            val isBlock = group.size == 1 && (group[0].entity?.type == "reply" || group[0].entity?.type == "attachment")

            if (isBlock) {
                val seg = group[0]
                // ★ Block 级别（附件、引用）直接渲染，不包统一的 13dp padding
                when (seg.entity!!.type) {
                    "reply" -> ReplyBlock(seg.entity, onReplyClick, isMine, findMessage = findMessage)
                    "attachment" -> AttachmentBlock(seg.entity, onClick = { hash, name, isImage -> onAttachmentClick(hash, name, isImage) }, onLongClick = onLongClick)
                }
            } else {
                // ★ 文字级别：根据是否为系统消息，套用不同的 padding 容器
                val textModifier = if (isSystem) {
                    Modifier.padding(horizontal = 17.dp, vertical = 8.dp)
                } else {
                    Modifier.padding(13.dp) // 对齐 Web 端的 13px
                }

                Box(modifier = textModifier) {
                    InlineTextBlock(
                        segments = group,
                        isMine = isMine,
                        isSystem = isSystem,
                        onMentionClick = onMentionClick,
                        onLongClick = onLongClick // ★ 传下去
                    )
                }
            }
        }
    }
}

// ==========================================
// 内部数据结构
// ==========================================
data class Segment(val text: String, val entity: IMessageEntity?)

// ==========================================
// 内联文本渲染 (支持 Markdown 和提及)
// ==========================================
@Composable
fun InlineTextBlock(
    segments: List<Segment>,
    isMine: Boolean,
    isSystem: Boolean = false,
    onMentionClick: (String, Boolean) -> Unit,
    onLongClick: () -> Unit,
) {
    val primaryColor = MaterialTheme.colorScheme.primary
    val context = androidx.compose.ui.platform.LocalContext.current // ★ 获取 Context

    var textLayoutResult by remember { mutableStateOf<androidx.compose.ui.text.TextLayoutResult?>(null) }

    val annotatedString = buildAnnotatedString {
        for (seg in segments) {
            val e = seg.entity
            if (e == null) {
                append(seg.text)
                continue
            }

            if (e.type == "user_mention") pushStringAnnotation(tag = "USER", annotation = e.data)
            else if (e.type == "chat_mention") pushStringAnnotation(tag = "CHAT", annotation = e.data)
            else if (e.type == "link") pushStringAnnotation(tag = "LINK", annotation = e.data)

            withStyle(style = getSpanStyle(e.type, primaryColor)) {
                append(seg.text)
            }

            if (e.type == "user_mention" || e.type == "chat_mention" || e.type == "link") {
                pop()
            }
        }
    }

    Text(
        text = annotatedString,
        onTextLayout = { textLayoutResult = it },
        modifier = Modifier.widthIn(max = 240.dp).pointerInput(annotatedString) {
            detectTapGestures(
                onTap = { offset ->
                    val charOffset = textLayoutResult?.getOffsetForPosition(offset) ?: -1
                    if (charOffset != -1) {
                        annotatedString.getStringAnnotations(start = charOffset, end = charOffset)
                            .firstOrNull()?.let { annotation ->
                                when (annotation.tag) {
                                    "USER" -> onMentionClick(annotation.item, false)
                                    "CHAT" -> onMentionClick(annotation.item, true)
                                    "LINK" -> {
                                        // ★ 核心修改：直接调用系统 URI 打开链接
                                        val url = annotation.item
                                        if (url.isNotBlank()) {
                                            try {
                                                val intent = android.content.Intent(
                                                    android.content.Intent.ACTION_VIEW,
                                                    android.net.Uri.parse(url)
                                                )
                                                context.startActivity(intent)
                                            } catch (e: Exception) {
                                                android.widget.Toast.makeText(context, "无法打开链接: ${e.message}", android.widget.Toast.LENGTH_SHORT).show()
                                            }
                                        }
                                    }
                                }
                            }
                    }
                },
                onLongPress = { onLongClick() }
            )
        },
        style = if (isSystem) MaterialTheme.typography.bodySmall else MaterialTheme.typography.bodyMedium,
        color = when {
            isSystem -> MaterialTheme.colorScheme.onSurfaceVariant
            isMine -> MaterialTheme.colorScheme.onPrimary
            else -> MaterialTheme.colorScheme.onSurface
        },
        textAlign = if (isSystem) TextAlign.Center else TextAlign.Start
    )
}

private fun getSpanStyle(type: String, primaryColor: Color): SpanStyle {
    return when (type) {
        "bold" -> SpanStyle(fontWeight = FontWeight.Bold)
        "italic" -> SpanStyle(fontStyle = FontStyle.Italic)
        "strikethrough" -> SpanStyle(textDecoration = TextDecoration.LineThrough)
        "code" -> SpanStyle(
            fontFamily = FontFamily.Monospace,
            background = Color.Gray.copy(alpha = 0.2f),
            fontSize = 14.sp
        )
        "spoiler" -> SpanStyle(background = Color.Gray, color = Color.Transparent) // 简易版打码
        "user_mention", "chat_mention" -> SpanStyle(color = primaryColor, fontWeight = FontWeight.Medium)
        "link" -> SpanStyle(color = primaryColor, textDecoration = TextDecoration.Underline)
        else -> SpanStyle()
    }
}

// ==========================================
// 引用回复 (Block)
// ==========================================
@Composable
fun ReplyBlock(
    entity: IMessageEntity,
    onReplyClick: (Int) -> Unit,
    isMine: Boolean,
    findMessage: suspend (Int) -> IMessage?
) {
    val seq = entity.data?.toIntOrNull() ?: -1
    if (seq == -1) return

    // 异步拉取目标消息
    var targetMsg by remember { mutableStateOf<IMessage?>(null) }
    var senderName by remember { mutableStateOf("加载中...") }
    var previewText by remember { mutableStateOf("") }

    LaunchedEffect(seq) {
        val msg = findMessage(seq)
        if (msg != null) {
            targetMsg = msg

            // 1. 获取发送者昵称
            val user = io.github.moonleeeaf.lingcat.data.ProfileCache.fetchUser(msg.senderUserId)
            senderName = user?.nickname?.ifEmpty { user.username } ?: "未知用户"

            // 2. 解析内容预览 (处理 E2E)
            val e2eEntity = msg.entitiesList.find { it.type == "e2e" }
            if (e2eEntity != null) {
                val e2eStatus = E2EStateManager.status.value
                if (e2eStatus == E2EStateManager.Status.UNLOCKED) {
                    val plainJson = E2EStateManager.decryptFromPeer(e2eEntity.data, msg.senderUserId)
                    if (plainJson != null) {
                        try {
                            val obj = JSONObject(plainJson)
                            previewText = obj.optString("text", "[加密消息]")
                        } catch (e: Exception) {
                            previewText = "[加密消息]"
                        }
                    } else {
                        previewText = "🔒 [加密消息]"
                    }
                } else {
                    previewText = "🔒 [加密消息]"
                }
            } else {
                // 普通文本
                previewText = msg.text.ifEmpty { "[附件]" }
            }
        } else {
            senderName = "未知消息"
            previewText = "无法加载原消息"
        }
    }

    Surface(
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 6.dp)
            .clickable { onReplyClick(seq) }
    ) {
        Row(modifier = Modifier.fillMaxWidth()) {
            // 左侧装饰线
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .fillMaxHeight()
                    .background(MaterialTheme.colorScheme.primary)
            )
            Column(modifier = Modifier.padding(8.dp)) {
                Text(
                    text = senderName,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.primary
                )
                Spacer(Modifier.height(2.dp))
                Text(
                    text = previewText,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = 2,
                    overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                )
            }
        }
    }
}

val mimeCache = ConcurrentHashMap<String, String>()

@OptIn(androidx.compose.foundation.ExperimentalFoundationApi::class)
@Composable
fun AttachmentBlock(
    entity: IMessageEntity,
    onClick: (String, String, Boolean) -> Unit,
    onLongClick: () -> Unit // ★ 新增参数
) {
    var hash = ""
    var name = "附件"
    try {
        val json = JSONObject(entity.data ?: "")
        hash = json.optString("hash")
        name = json.optString("name")
    } catch (_: Exception) {}

    if (hash.isEmpty()) {
        Text("[无效附件]", color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(12.dp))
        return
    }

    val fileToken = LingCatClientManager.fileAccessToken.collectAsState().value ?: ""
    val fileUrl = LingCatClientManager.currentClient?.getFileUrlByHashAndToken(hash, fileToken) ?: ""

    var isImage by remember(hash, name) {
        mutableStateOf(
            name.endsWith(".webp", true) || name.endsWith(".png", true) ||
                    name.endsWith(".jpg", true) || name.endsWith(".jpeg", true) ||
                    name.endsWith(".gif", true)
        )
    }

    LaunchedEffect(hash, name, fileUrl) {
        if (isImage) return@LaunchedEffect
        if (fileUrl.isBlank()) return@LaunchedEffect // 如果 URL 还没拼出来，先跳过

        val cacheKey = hash
        // 如果缓存里有了，直接用
        if (mimeCache.containsKey(cacheKey)) {
            isImage = mimeCache[cacheKey]?.startsWith("image/") == true
            return@LaunchedEffect
        }

        withContext(Dispatchers.IO) {
            try {
                // ★ 核心修复 2：使用项目里配置了信任所有证书的 OkHttpClient
                val client = HttpClientProvider.get()
                val request = Request.Builder().url(fileUrl).head().build()
                val response = client.newCall(request).execute()
                val contentType = response.header("Content-Type") ?: ""
                mimeCache[cacheKey] = contentType

                // 只要 Content-Type 里包含 image，或者后缀名对得上，都认为是图片
                isImage = contentType.startsWith("image/") ||
                        name.endsWith(".webp", true) ||
                        name.endsWith(".png", true) ||
                        name.endsWith(".jpg", true)
            } catch (e: Exception) {
                // 如果 HEAD 请求出错，兜底按文件类型再猜一次
                isImage = name.endsWith(".png", true) || name.endsWith(".jpg", true)
            }
        }
    }

    if (isImage) {
        coil.compose.AsyncImage(
            model = coil.request.ImageRequest.Builder(androidx.compose.ui.platform.LocalContext.current)
                .data(fileUrl)
                .memoryCacheKey(hash)
                .diskCacheKey(hash)
                .crossfade(true)
                .build(),
            contentDescription = name,
            modifier = Modifier
                .widthIn(max = 240.dp)
                .defaultMinSize(minWidth = 100.dp, minHeight = 100.dp)
                // ★ 核心修复：图片用 combinedClickable
                .combinedClickable(
                    onClick = { onClick(hash, name, isImage) },
                    onLongClick = onLongClick
                ),
            contentScale = androidx.compose.ui.layout.ContentScale.Fit
        )
    } else {
        // ★ 核心修复：文件卡片用 combinedClickable（替换掉 Surface 的 onClick）
        Surface(
            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
            modifier = Modifier
                .fillMaxWidth()
                .combinedClickable(
                    onClick = { onClick(hash, name, isImage) },
                    onLongClick = onLongClick
                )
        ) {
            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(imageVector = androidx.compose.material.icons.Icons.Default.AttachFile, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text(
                    text = name,
                    style = MaterialTheme.typography.bodyMedium,
                    overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis,
                    maxLines = 1,
                )
            }
        }
    }
}