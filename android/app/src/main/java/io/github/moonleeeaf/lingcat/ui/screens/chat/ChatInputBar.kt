import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.AttachFile
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.data.RemarksCache
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import lingcat.classes.Classes

@Composable
fun ChatInputBar(
    text: String,
    isSending: Boolean,
    isE2EActive: Boolean,
    encryptThisMessage: Boolean,
    onToggleEncrypt: () -> Unit,
    onTextChange: (String) -> Unit,
    onSend: () -> Unit,
    onAttachClick: () -> Unit,
    focusRequester: FocusRequester,
    editingMessage: lingcat.classes.Classes.IMessage? = null,
    onCancelEdit: () -> Unit = {},
    chatMembers: List<Classes.IUser> = emptyList(),
    onRequestMembers: () -> Unit = {},
) {
    val fileToken by LingCatClientManager.fileAccessToken.collectAsState()
    val context = LocalContext.current

    // ★ 使用 TextFieldValue 跟踪光标
    var textState by remember { mutableStateOf(TextFieldValue(text)) }

    // 同步外部传入的 text（比如发送后清空、插入引用等）
    LaunchedEffect(text) {
        if (text != textState.text) {
            textState = TextFieldValue(text, TextRange(text.length))
        }
    }

    // ==========================================
    // @ 提及状态管理
    // ==========================================
    var mentionQuery by remember { mutableStateOf<String?>(null) }
    var mentionStartIndex by remember { mutableStateOf(-1) }
    var activeMentionIndex by remember { mutableIntStateOf(0) }

    // 监听文本和光标变化，计算候选列表
    val mentionCandidates = remember(textState, chatMembers) {
        val cursor = textState.selection.start
        val textStr = textState.text
        if (cursor == 0) return@remember emptyList()

        val before = textStr.substring(0, cursor)
        val regex = Regex("(^|[^\\w\\[\\]])@([^\\s@\\[\\]()]{0,32})$")
        val match = regex.find(before)

        if (match != null) {
            val query = match.groupValues[2]
            mentionQuery = query
            mentionStartIndex = cursor - query.length - 1

            if (chatMembers.isEmpty()) {
                onRequestMembers()
            }

            chatMembers.map { m ->
                val remark = RemarksCache.getRemark(m.id) ?: ""
                val display = remark.ifEmpty { m.nickname.ifEmpty { m.username } }
                val hay = listOf(m.username, m.nickname, remark).filter { it.isNotEmpty() }.map { it.lowercase() }
                var score = 0
                for (h in hay) {
                    if (query.isEmpty()) score = maxOf(score, 1)
                    else if (h.startsWith(query.lowercase())) score = maxOf(score, 3)
                    else if (h.contains(query.lowercase())) score = maxOf(score, 2)
                }
                Pair(m, display to score)
            }.filter { it.second.second > 0 }
                .sortedWith(compareByDescending<Pair<Classes.IUser, Pair<String, Int>>> { it.second.second }.thenBy { it.second.first })
                // ★ 核心修复：删除了 .take(8)，只要匹配的统统返回
                .map { it.first }
        } else {
            mentionQuery = null
            mentionStartIndex = -1
            emptyList()
        }
    }

    // 插入提及
    val insertMention = { user: Classes.IUser ->
        val name = RemarksCache.getRemark(user.id).takeIf { !it.isNullOrEmpty() }
            ?: user.nickname.takeIf { it.isNotEmpty() }
            ?: user.username
            ?: user.id

        // ★ 直接拼接 Markdown 语法
        val token = "[@$name](user:${user.id}) "

        val cursor = textState.selection.start
        val textStr = textState.text
        val newText = textStr.substring(0, mentionStartIndex) + token + textStr.substring(cursor)

        // 计算新光标位置
        val newCursorPos = mentionStartIndex + token.length
        textState = TextFieldValue(newText, TextRange(newCursorPos))
        onTextChange(newText)

        mentionQuery = null
        mentionStartIndex = -1
    }

    // ==========================================
    // 绘制 UI
    // ==========================================
    Surface(
        tonalElevation = 2.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column {
            // 1. 编辑状态条
            if (editingMessage != null) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = "正在编辑消息...",
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(onClick = onCancelEdit, modifier = Modifier.size(24.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "取消编辑", modifier = Modifier.size(16.dp))
                    }
                }
            }

            // ★ 核心修复 1：将 @ 候选列表放在输入框的上方，使用普通的 Column 布局
            if (mentionQuery != null && mentionCandidates.isNotEmpty()) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 4.dp) // 左右留点边距对齐输入框
                        .heightIn(max = 240.dp), // 限制最大高度，超出内部滚动
                    shape = RoundedCornerShape(12.dp),
                ) {
                    LazyColumn {
                        itemsIndexed(mentionCandidates) { index, user ->
                            val isActive = index == activeMentionIndex
                            val remark = RemarksCache.getRemark(user.id) ?: ""
                            val displayName = remark.ifEmpty { user.nickname.ifEmpty { user.username } }
                            val avatarHash = user.avatarFileHash
                            val avatarUrl = if (!avatarHash.isNullOrEmpty() && !fileToken.isNullOrEmpty()) {
                                LingCatClientManager.currentClient?.getFileUrlByHashAndToken(avatarHash, fileToken!!)
                            } else null

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(if (isActive) MaterialTheme.colorScheme.primary.copy(alpha = 0.1f) else Color.Transparent)
                                    .clickable { insertMention(user) }
                                    .padding(horizontal = 12.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                if (avatarUrl != null) {
                                    AsyncImage(
                                        model = coil.request.ImageRequest.Builder(androidx.compose.ui.platform.LocalContext.current)
                                            .data(avatarUrl)
                                            .memoryCacheKey(avatarHash)
                                            .diskCacheKey(avatarHash)
                                            .build(),
                                        contentDescription = null,
                                        modifier = Modifier.size(28.dp).clip(CircleShape),
                                        contentScale = ContentScale.Crop
                                    )
                                } else {
                                    androidx.compose.foundation.Image(
                                        painter = painterResource(id = R.drawable.ic_default_avatar),
                                        contentDescription = null,
                                        modifier = Modifier.size(28.dp).clip(CircleShape)
                                    )
                                }
                                Spacer(Modifier.width(8.dp))

                                Column {
                                    Text(displayName, style = MaterialTheme.typography.bodyMedium)
                                    if (user.username.isNotEmpty() && user.username != displayName) {
                                        Text("@${user.username}", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 3. 输入行（去掉了外层乱糟糟的 Box）
            Row(
                verticalAlignment = Alignment.Bottom,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 8.dp)
                    .navigationBarsPadding()
                    .imePadding()
            ) {
                // 输入框胶囊背景
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = MaterialTheme.colorScheme.surface,
                    modifier = Modifier.weight(1f) // 占满剩余宽度
                ) {
                    Row(
                        verticalAlignment = Alignment.Bottom,
                        modifier = Modifier.padding(horizontal = 4.dp)
                    ) {
                        // 附件按钮
                        IconButton(
                            onClick = onAttachClick,
                            modifier = Modifier.size(40.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AttachFile,
                                contentDescription = "附件",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        // 输入框
                        BasicTextField(
                            value = textState,
                            onValueChange = { newVal ->
                                textState = newVal
                                onTextChange(newVal.text)
                            },
                            modifier = Modifier
                                .weight(1f)
                                .padding(vertical = 10.dp)
                                .focusRequester(focusRequester),
                            textStyle = MaterialTheme.typography.bodyLarge.copy(color = MaterialTheme.colorScheme.onSurface),
                            maxLines = 4,
                            decorationBox = { innerTextField ->
                                Box {
                                    if (textState.text.isEmpty()) {
                                        Text("输入...", color = MaterialTheme.colorScheme.onSurfaceVariant, style = MaterialTheme.typography.bodyLarge)
                                    }
                                    innerTextField()
                                }
                            }
                        )

                        // E2E 开关
                        if (isE2EActive) {
                            IconButton(
                                onClick = onToggleEncrypt,
                                modifier = Modifier.size(40.dp)
                            ) {
                                Icon(
                                    imageVector = if (encryptThisMessage) Icons.Default.Lock else Icons.Default.LockOpen,
                                    contentDescription = "切换加密",
                                    tint = if (encryptThisMessage) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        // 发送按钮
                        FilledIconButton(
                            onClick = onSend,
                            enabled = !isSending && text.isNotBlank(),
                            modifier = Modifier
                                .padding(end = 4.dp)
                                .size(36.dp),
                            colors = IconButtonDefaults.filledIconButtonColors(
                                containerColor = MaterialTheme.colorScheme.primary
                            )
                        ) {
                            if (isSending) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(18.dp),
                                    strokeWidth = 2.dp,
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                            } else {
                                Icon(
                                    imageVector = if (editingMessage != null) Icons.Default.Check else Icons.AutoMirrored.Filled.Send,
                                    contentDescription = if (editingMessage != null) "保存编辑" else "发送",
                                    modifier = Modifier.size(18.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}