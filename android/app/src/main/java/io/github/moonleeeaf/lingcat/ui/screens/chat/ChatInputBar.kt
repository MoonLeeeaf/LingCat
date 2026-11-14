package io.github.moonleeeaf.lingcat.ui.screens.chat

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.union
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.AttachFile
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.LockOpen
import androidx.compose.material.icons.filled.Mood
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.data.RemarksCache
import io.github.moonleeeaf.lingcat.ui.components.LingCatAvatar
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
    editingMessage: Classes.IMessage? = null,
    onCancelEdit: () -> Unit = {},
    chatMembers: List<Classes.IUser> = emptyList(),
    onRequestMembers: () -> Unit = {},
) {
    // ★ 使用 TextFieldValue 跟踪光标
    var textState by remember { mutableStateOf(TextFieldValue(text)) }
    // 备注变化时让 @ 候选列表重新排序 / 刷新显示
    val remarks by RemarksCache.remarks.collectAsState()

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
    val mentionCandidates = remember(textState, chatMembers, remarks) {
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
                val remark = remarks[m.id] ?: ""
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
                .map { it.first }
        } else {
            mentionQuery = null
            mentionStartIndex = -1
            emptyList()
        }
    }

    // 插入提及
    val insertMention = { user: Classes.IUser ->
        val name = remarks[user.id].takeIf { !it.isNullOrEmpty() }
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
    // 贴纸
    // ==========================================
    var showStickerPicker by remember { mutableStateOf(false) }

    val insertSticker = { hash: String, packId: String, emoji: String?, mime: String ->
        val token = buildStickerText(hash, packId, emoji, mime)
        val cursor = textState.selection.start
        val textStr = textState.text
        val newText = textStr.substring(0, cursor) + token + textStr.substring(cursor)
        textState = TextFieldValue(newText, TextRange(cursor + token.length))
        onTextChange(newText)
    }

    if (showStickerPicker) {
        StickerPickerSheet(
            onDismiss = { showStickerPicker = false },
            onPick = { hash, packId, emoji, mime ->
                insertSticker(hash, packId, emoji, mime)
                showStickerPicker = false
            },
        )
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
                        .padding(horizontal = 12.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(Modifier.width(8.dp))
                    Text(
                        text = stringResource(R.string.chat_input_editing),
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.weight(1f)
                    )
                    IconButton(onClick = onCancelEdit) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = stringResource(R.string.chat_input_cancel_edit),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            // ★ @ 候选列表放在输入框的上方
            if (mentionQuery != null && mentionCandidates.isNotEmpty()) {
                Surface(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                        .heightIn(max = 240.dp),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    LazyColumn {
                        itemsIndexed(mentionCandidates) { index, user ->
                            val isActive = index == activeMentionIndex
                            val remark = remarks[user.id] ?: ""
                            val displayName = remark.ifEmpty { user.nickname.ifEmpty { user.username } }

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        if (isActive) {
                                            MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                                        } else {
                                            Color.Transparent
                                        }
                                    )
                                    .clickable { insertMention(user) }
                                    .heightIn(min = 48.dp)
                                    .padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                LingCatAvatar(
                                    avatarHash = user.avatarFileHash,
                                    size = 28.dp,
                                )
                                Spacer(Modifier.width(8.dp))

                                Column {
                                    Text(displayName, style = MaterialTheme.typography.bodyMedium)
                                    if (user.username.isNotEmpty() && user.username != displayName) {
                                        Text(
                                            "@${user.username}",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 3. 输入行
            Row(
                verticalAlignment = Alignment.Bottom,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp, vertical = 8.dp)
                    // IME 和导航栏取“并集”，避免 navigationBarsPadding + imePadding 叠加出双倍留白
                    .windowInsetsPadding(WindowInsets.ime.union(WindowInsets.navigationBars))
            ) {
                // 输入框胶囊背景
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = MaterialTheme.colorScheme.surfaceContainerHigh,
                    modifier = Modifier.weight(1f)
                ) {
                    Row(
                        verticalAlignment = Alignment.Bottom,
                        modifier = Modifier.padding(horizontal = 4.dp)
                    ) {
                        // 附件按钮
                        IconButton(
                            onClick = onAttachClick,
                            modifier = Modifier.size(48.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AttachFile,
                                contentDescription = stringResource(R.string.chat_input_attach),
                                tint = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        // 贴纸按钮
                        IconButton(
                            onClick = { showStickerPicker = true },
                            modifier = Modifier.size(48.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Mood,
                                contentDescription = stringResource(R.string.sticker_input_action),
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
                                .padding(vertical = 12.dp)
                                .focusRequester(focusRequester),
                            textStyle = MaterialTheme.typography.bodyLarge.copy(color = MaterialTheme.colorScheme.onSurface),
                            maxLines = 4,
                            decorationBox = { innerTextField ->
                                Box {
                                    if (textState.text.isEmpty()) {
                                        Text(
                                            stringResource(R.string.chat_input_hint),
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            style = MaterialTheme.typography.bodyLarge
                                        )
                                    }
                                    innerTextField()
                                }
                            }
                        )

                        // E2E 开关
                        if (isE2EActive) {
                            IconButton(
                                onClick = onToggleEncrypt,
                                modifier = Modifier.size(48.dp)
                            ) {
                                Icon(
                                    imageVector = if (encryptThisMessage) Icons.Default.Lock else Icons.Default.LockOpen,
                                    contentDescription = stringResource(R.string.chat_input_toggle_encrypt),
                                    tint = if (encryptThisMessage) {
                                        MaterialTheme.colorScheme.primary
                                    } else {
                                        MaterialTheme.colorScheme.onSurfaceVariant
                                    }
                                )
                            }
                        }

                        // 发送按钮：视觉 40dp，触控区域 48dp
                        IconButton(
                            onClick = onSend,
                            enabled = !isSending && text.isNotBlank(),
                            modifier = Modifier
                                .padding(end = 4.dp)
                                .size(48.dp),
                        ) {
                            if (isSending) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    strokeWidth = 2.dp,
                                    color = MaterialTheme.colorScheme.onPrimary
                                )
                            } else {
                                Icon(
                                    imageVector = if (editingMessage != null) Icons.Default.Check else Icons.AutoMirrored.Filled.Send,
                                    contentDescription = if (editingMessage != null) stringResource(R.string.chat_input_save_edit) else stringResource(R.string.chat_input_send),
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
