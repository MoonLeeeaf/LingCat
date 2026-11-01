package io.github.moonleeeaf.lingcat.ui.screens.chat

import android.content.Context
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Reply
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.app.AppState
import io.github.moonleeeaf.lingcat.app.NotificationHelper
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.e2e.E2EInfoDialog
import io.github.moonleeeaf.lingcat.e2e.E2EStateManager
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.components.ImageViewerDialog
import kotlinx.coroutines.launch
import lingcat.classes.Classes.IMessage
import java.util.Calendar

/**
 * 判断是否需要在 msg 上方显示时间分隔条
 */
fun shouldShowTime(msg: IMessage, prevMsg: IMessage?): Boolean {
    // if (msg.system || msg.senderUserId.isNullOrEmpty()) return false // 系统消息不显示
    if (prevMsg == null) return true // 第一条一定显示

    val d = Calendar.getInstance().apply { timeInMillis = msg.time }
    val ld = Calendar.getInstance().apply { timeInMillis = prevMsg.time }

    return d.get(Calendar.YEAR) != ld.get(Calendar.YEAR) ||
            d.get(Calendar.MONTH) != ld.get(Calendar.MONTH) ||
            d.get(Calendar.DAY_OF_MONTH) != ld.get(Calendar.DAY_OF_MONTH) ||
            d.get(Calendar.HOUR_OF_DAY) != ld.get(Calendar.HOUR_OF_DAY) ||
            d.get(Calendar.MINUTE) != ld.get(Calendar.MINUTE)
}

/**
 * 格式化分隔条文本
 */
fun formatTimeDivider(time: Long): String {
    val d = Calendar.getInstance().apply { timeInMillis = time }
    val now = Calendar.getInstance()

    val pad = { n: Int -> String.format("%02d", n) }
    val hm = "${pad(d.get(Calendar.HOUR_OF_DAY))}:${pad(d.get(Calendar.MINUTE))}"

    return when {
        // 今天
        d.get(Calendar.YEAR) == now.get(Calendar.YEAR) &&
                d.get(Calendar.MONTH) == now.get(Calendar.MONTH) &&
                d.get(Calendar.DAY_OF_MONTH) == now.get(Calendar.DAY_OF_MONTH) -> {
            hm
        }
        // 今年
        d.get(Calendar.YEAR) == now.get(Calendar.YEAR) -> {
            "${d.get(Calendar.MONTH) + 1}月${d.get(Calendar.DAY_OF_MONTH)}日 $hm"
        }
        // 往年
        else -> {
            "${d.get(Calendar.YEAR)}年${d.get(Calendar.MONTH) + 1}月${d.get(Calendar.DAY_OF_MONTH)}日 $hm"
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    chatId: String,
    onBack: () -> Unit,
    onNavigateToMembers: (String) -> Unit,
    viewModel: ChatViewModel = viewModel()
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val listState = rememberLazyListState()
    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    val cachedChat = remember(chatId) { ProfileCache.getCachedChat(chatId) }

    LaunchedEffect(chatId) {
        // 尝试拿一次标题
        val cachedTitle = ProfileCache.getCachedChat(chatId)?.title
        viewModel.initChat(chatId, initialTitle = cachedTitle)
    }

    // 监听错误
    LaunchedEffect(uiState.errorMsg) {
        uiState.errorMsg?.let {
            snackbarHostState.showSnackbar(it)
        }
    }

    // 记录上一条最新消息的 ID
    var previousFirstMsgId by remember { mutableStateOf<Int?>(null) }

    // 监听最新消息的 ID 变化
    LaunchedEffect(uiState.messages.firstOrNull()?.id) {
        val currentFirstId = uiState.messages.firstOrNull()?.id

        if (currentFirstId != null && currentFirstId != previousFirstMsgId) {
            if (previousFirstMsgId == null) {
                listState.scrollToItem(0)
            } else {
                val isAtBottom = listState.firstVisibleItemIndex <= 1
                val isMe = uiState.messages.firstOrNull()?.senderUserId == LingCatClientManager.currentUserId

                if (isAtBottom || isMe) {
                    listState.animateScrollToItem(0)
                }
            }
            previousFirstMsgId = currentFirstId
        }
    }

    val isAtBottom by remember {
        derivedStateOf {
            listState.firstVisibleItemIndex <= 1
        }
    }

    val shouldLoadMore by remember {
        derivedStateOf {
            val layoutInfo = listState.layoutInfo
            val visibleItemsInfo = layoutInfo.visibleItemsInfo
            if (visibleItemsInfo.isEmpty()) return@derivedStateOf false

            val lastVisibleItem = visibleItemsInfo.lastOrNull()
            lastVisibleItem != null && lastVisibleItem.index >= uiState.messages.size - 3
        }
    }

    LaunchedEffect(shouldLoadMore) {
        if (shouldLoadMore) {
            viewModel.loadMoreMessages()
        }
    }

    // 在 ChatScreen 里增加监听
    val shouldLoadNewer by remember {
        derivedStateOf {
            val layoutInfo = listState.layoutInfo
            val visibleItemsInfo = layoutInfo.visibleItemsInfo
            if (visibleItemsInfo.isEmpty()) return@derivedStateOf false

            val firstVisibleItem = visibleItemsInfo.firstOrNull()
            // 如果第一个可见元素是 index 0，说明滑到了底部
            firstVisibleItem != null && firstVisibleItem.index == 0
        }
    }

    LaunchedEffect(shouldLoadNewer) {
        if (shouldLoadNewer) {
            // 如果不在底部，或者认为还有更新的没拉出来，就去尝试拉
            viewModel.loadMoreNewer()
        }
    }

    // 弹窗状态
    var selectedMessage by remember { mutableStateOf<IMessage?>(null) }
    val clipboardManager = LocalClipboardManager.current
    val sheetState = rememberModalBottomSheetState()

    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris: List<Uri> ->
        if (uris.isNotEmpty()) {
            uris.forEach { uri -> viewModel.addFileToInput(context, uri) }
        }
    }

    var selectedAvatarUserId by remember { mutableStateOf<String?>(null) }
    val focusRequester = remember { FocusRequester() }

    var previewImageUrl by remember { mutableStateOf<String?>(null) }
    var showE2EInfo by remember { mutableStateOf(false) }
    var showChatInfoId by remember { mutableStateOf<String?>(null) }
    var showUserProfileId by remember { mutableStateOf<String?>(null) }

    var showMessageInfo by remember { mutableStateOf<IMessage?>(null) }

    val lifecycleOwner = androidx.lifecycle.compose.LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner, chatId) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                AppState.activeChatId = chatId
                // ★ 进入聊天时，清除该聊天的通知和历史
                NotificationHelper.clearHistory(chatId)
                val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
                manager.cancel(chatId.hashCode())
            } else if (event == Lifecycle.Event.ON_PAUSE || event == Lifecycle.Event.ON_STOP) {
                if (AppState.activeChatId == chatId) {
                    AppState.activeChatId = null
                }
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
            if (AppState.activeChatId == chatId) {
                AppState.activeChatId = null
            }
        }
    }

    val safeMessages by remember(uiState.messages) {
        derivedStateOf { uiState.messages.distinctBy { it.id } }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                modifier = Modifier.clickable { showChatInfoId = chatId },
                title = {
                    Column {
                        Text(uiState.chatTitle)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                },
                actions = {
                    if (uiState.isE2EActive) {
                        IconButton(onClick = { showE2EInfo = true }) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "E2E 信息",
                                tint = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                }
            )
        },
        bottomBar = {
            ChatInputBar(
                text = uiState.inputText,
                isSending = uiState.isSending,
                isE2EActive = uiState.isE2EActive,
                encryptThisMessage = uiState.encryptThisMessage,
                onToggleEncrypt = viewModel::toggleEncryptThisMessage,
                onTextChange = viewModel::onInputChange,
                onSend = viewModel::sendMessage,
                onAttachClick = { filePickerLauncher.launch("*/*") },
                focusRequester = focusRequester,
                editingMessage = uiState.editingMessage,
                onCancelEdit = viewModel::cancelEditing,
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(Modifier.align(Alignment.Center))
            } else {
                LazyColumn(
                    state = listState,
                    reverseLayout = true, // index 0 是最新的（在底部）
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp, Alignment.Bottom)
                ) {
                    // ★ 核心修改：使用 itemsIndexed
                    itemsIndexed(safeMessages, key = { _, msg -> msg.id }) { index, msg ->
                        // 在 reverseLayout 中，index + 1 是视觉上位于其“上方”的较老消息
                        val prevMsg = safeMessages.getOrNull(index + 1)

                        val showTime = shouldShowTime(msg, prevMsg)
                        val timeText = if (showTime) formatTimeDivider(msg.time) else null

                        // 如果当前没显示时间，且和上一条是同一个人（非系统消息），就隐藏头像/昵称
                        val hideSender = !showTime &&
                                !msg.system &&
                                prevMsg != null &&
                                !prevMsg.system &&
                                prevMsg.senderUserId == msg.senderUserId

                        Column {
                            // 时间条
                            if (timeText != null) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 12.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = timeText,
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                                    )
                                }
                            }

                            // 消息气泡
                            MessageBubble(
                                message = msg,
                                isMine = msg.senderUserId == LingCatClientManager.currentUserId,
                                hideSender = hideSender, // ★ 传入
                                onAvatarLongClick = { userId -> selectedAvatarUserId = userId },
                                onReplyClick = { replyId ->
                                    coroutineScope.launch { viewModel.jumpToMessage(replyId, listState) }
                                },
                                onAttachmentClick = { hash, name -> /* ... */ },
                                onLongClick = { selectedMessage = msg },
                                onAvatarClick = { userId -> showUserProfileId = userId },
                                onMentionClick = { mentionId, isChat -> /* ... */ }
                            )
                        }
                    }

                    if (uiState.isLoadingMore) {
                        item {
                            Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                                CircularProgressIndicator(Modifier.size(24.dp), strokeWidth = 2.dp)
                            }
                        }
                    } else if (!uiState.hasMore) {
                        item {
                            Box(Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                                Text("到底啦喵~", style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }
                        }
                    }
                }
                if (!isAtBottom) {
                    FloatingActionButton(
                        onClick = {
                            coroutineScope.launch { listState.animateScrollToItem(0) }
                        },
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(16.dp)
                            .size(40.dp),
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    ) {
                        Icon(Icons.Default.ArrowDownward, contentDescription = "回到底部")
                    }
                }
            }
        }
    }

    // ==========================================
    // 各种弹窗
    // ==========================================

    if (showUserProfileId != null) {
        UserProfileDialog(
            userId = showUserProfileId!!,
            chatId = chatId,
            onDismiss = { showUserProfileId = null },
            onMention = { name ->
                val mentionSyntax = "[@$name](user:${showUserProfileId}) "
                viewModel.onInputChange(uiState.inputText + mentionSyntax)
                focusRequester.requestFocus()
            }
        )
    }

    if (!showChatInfoId.isNullOrEmpty()) {
        showChatInfoId?.let {
            ChatInfoDialog(
                chatId = it,
                onDismiss = { showChatInfoId = null },
                onOpenMembers = {
                    showChatInfoId = null
                    onNavigateToMembers(chatId)
                },
                onOpenUserProfile = { peerId -> // ★ 修复 2：接上用户资料回调
                    showChatInfoId = null
                    showUserProfileId = peerId
                }
            )
        }
    }

    if (showE2EInfo) {
        E2EInfoDialog(
            peerUserId = uiState.peerUserId,
            onDismiss = { showE2EInfo = false }
        )
    }

    if (showMessageInfo != null) {
        val msg = showMessageInfo!!
        AlertDialog(
            onDismissRequest = { showMessageInfo = null },
            title = { Text("消息元素信息 #${msg.id}") },
            text = {
                Column(
                    modifier = Modifier.verticalScroll(rememberScrollState()),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text("Text:", fontWeight = FontWeight.Bold)
                    Text(msg.text ?: "null", style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace))

                    Text("Entities (${msg.entitiesCount}):", fontWeight = FontWeight.Bold)
                    if (msg.entitiesCount == 0) {
                        Text("empty", style = MaterialTheme.typography.bodySmall)
                    } else {
                        msg.entitiesList.forEachIndexed { index, entity ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant)
                            ) {
                                Column(modifier = Modifier.padding(8.dp)) {
                                    Text("Type: ${entity.type}", style = MaterialTheme.typography.bodySmall, fontWeight = FontWeight.Bold)
                                    Text("Offset: ${entity.offset}, Length: ${entity.length}", style = MaterialTheme.typography.bodySmall)
                                    if (entity.hasData()) {
                                        Text("Data: ${entity.data}", style = MaterialTheme.typography.bodySmall.copy(fontFamily = FontFamily.Monospace))
                                    }
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showMessageInfo = null }) { Text("关闭") }
            }
        )
    }

    if (selectedAvatarUserId != null) {
        val userId = selectedAvatarUserId!!
        val userInfo = ProfileCache.getCachedUser(userId)
        val displayName = userInfo?.nickname?.ifEmpty { userInfo?.username } ?: "该用户"

        ModalBottomSheet(
            onDismissRequest = { selectedAvatarUserId = null }
        ) {
            Column(modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp)) {
                Text(
                    text = displayName,
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )

                // 查看资料
                ListItem(
                    headlineContent = { Text("查看资料") },
                    leadingContent = { Icon(Icons.Default.Person, contentDescription = null) },
                    colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    modifier = Modifier.clickable {
                        selectedAvatarUserId = null
                        showUserProfileId = userId // ★ 修复 3：接上查看资料
                    }
                )

                // 提及用户
                if (userId != LingCatClientManager.currentUserId) {
                    ListItem(
                        headlineContent = { Text("提及用户") },
                        leadingContent = { Icon(Icons.Default.AlternateEmail, contentDescription = null) },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        modifier = Modifier.clickable {
                            val mentionSyntax = "[@${displayName}](user:${userId}) "
                            viewModel.onInputChange(uiState.inputText + mentionSyntax)
                            selectedAvatarUserId = null
                            focusRequester.requestFocus()
                        }
                    )
                }
            }
        }
    }

    if (selectedMessage != null) {
        ModalBottomSheet(
            onDismissRequest = { selectedMessage = null },
            sheetState = sheetState
        ) {
            Column(modifier = Modifier.fillMaxWidth().padding(bottom = 10.dp)) {
                Text(
                    text = "消息 #${selectedMessage?.id}",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )

                ListItem(
                    headlineContent = { Text("复制") },
                    leadingContent = { Icon(Icons.Default.ContentCopy, contentDescription = null) },
                    colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    modifier = Modifier.clickable {
                        clipboardManager.setText(AnnotatedString(selectedMessage?.text ?: ""))
                        selectedMessage = null
                    }
                )

                if (selectedMessage?.senderUserId == LingCatClientManager.currentUserId && selectedMessage?.system != true) {
                    ListItem(
                        headlineContent = { Text("编辑") },
                        leadingContent = { Icon(Icons.Default.Edit, contentDescription = null) },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        modifier = Modifier.clickable {
                            selectedMessage?.let { viewModel.startEditing(it) }
                            selectedMessage = null
                        }
                    )
                }

                ListItem(
                    headlineContent = { Text("回复") },
                    leadingContent = { Icon(Icons.AutoMirrored.Filled.Reply, contentDescription = null) },
                    colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    modifier = Modifier.clickable {
                        selectedMessage?.let { msg ->
                            val currentText = uiState.inputText
                            viewModel.onInputChange("[reply:${msg.id}]$currentText")
                        }
                        selectedMessage = null
                    }
                )

                ListItem(
                    headlineContent = { Text("查看元素") },
                    leadingContent = { Icon(Icons.Default.Info, contentDescription = null) },
                    colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    modifier = Modifier.clickable {
                        showMessageInfo = selectedMessage
                        selectedMessage = null
                    }
                )
            }
        }
    }

    if (uiState.needUnlock) {
        var password by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { viewModel.clearNeedUnlock() },
            title = { Text("端到端加密") },
            text = {
                Column {
                    Text("请输入安全密码解锁")
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(
                        value = password,
                        onValueChange = { password = it },
                        singleLine = true,
                        visualTransformation = androidx.compose.ui.text.input.PasswordVisualTransformation()
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = {
                    coroutineScope.launch {
                        val success = E2EStateManager.unlock(password)
                        if (success) {
                            viewModel.clearNeedUnlock()
                            viewModel.sendMessage()
                        }
                    }
                }) { Text("解锁") }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.clearNeedUnlock() }) { Text("取消") }
            }
        )
    }

    ImageViewerDialog(
        imageUrl = previewImageUrl,
        onDismiss = { previewImageUrl = null }
    )
}

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
    editingMessage: IMessage?,
    onCancelEdit: () -> Unit,
) {
    Surface(
        tonalElevation = 2.dp,
        modifier = Modifier.fillMaxWidth()
    ) {
        Column { // ★ 外层套个 Column
            // ★ 编辑状态条
            if (editingMessage != null) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Edit,
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
                        Icon(
                            Icons.Default.Close,
                            contentDescription = "取消编辑",
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }
            Row(
                modifier = Modifier
                    .padding(horizontal = 8.dp, vertical = 8.dp)
                    .navigationBarsPadding()
                    .imePadding(),
                verticalAlignment = Alignment.Bottom
            ) {
                Surface(
                    shape = RoundedCornerShape(24.dp),
                    color = MaterialTheme.colorScheme.surface,
                    modifier = Modifier.weight(1f)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 4.dp)
                    ) {
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

                        BasicTextField(
                            value = text,
                            onValueChange = onTextChange,
                            modifier = Modifier
                                .weight(1f)
                                .padding(vertical = 10.dp)
                                .then(
                                    if (focusRequester != null) Modifier.focusRequester(
                                        focusRequester
                                    ) else Modifier
                                ),
                            textStyle = MaterialTheme.typography.bodyLarge.copy(
                                color = MaterialTheme.colorScheme.onSurface
                            ),
                            maxLines = 4,
                            decorationBox = { innerTextField ->
                                Box {
                                    if (text.isEmpty()) {
                                        Text(
                                            text = "输入...",
                                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                                            style = MaterialTheme.typography.bodyLarge
                                        )
                                    }
                                    innerTextField()
                                }
                            }
                        )

                        if (isE2EActive) {
                            IconButton(onClick = onToggleEncrypt) {
                                Icon(
                                    imageVector = if (encryptThisMessage) Icons.Default.Lock else Icons.Default.LockOpen,
                                    contentDescription = "切换加密",
                                    tint = if (encryptThisMessage) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

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
                                    // ★ 编辑时显示对勾，发送时显示纸飞机
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

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun MessageBubble(
    message: IMessage,
    isMine: Boolean,
    onReplyClick: (Int) -> Unit,
    onLongClick: () -> Unit,
    onAvatarClick: (String) -> Unit,
    onAvatarLongClick: (String) -> Unit,
    onMentionClick: (String, Boolean) -> Unit,
    onAttachmentClick: (hash: String, name: String) -> Unit,
    findMessage: suspend (Int) -> IMessage? = { null },
    hideSender: Boolean = false,
) {
    val fileToken by LingCatClientManager.fileAccessToken.collectAsState()
    if (message.system) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 8.dp, horizontal = 32.dp),
            contentAlignment = Alignment.Center
        ) {
            MessageContent(
                message = message,
                isMine = false,
                isSystem = true,
                onReplyClick = {},
                onMentionClick = onMentionClick,
                onAttachmentClick = onAttachmentClick,
                onLongClick = onLongClick,
                findMessage = findMessage,
            )
        }
        return
    }

    var userInfo by remember { mutableStateOf(ProfileCache.getCachedUser(message.senderUserId)) }

    LaunchedEffect(message.senderUserId) {
        if (userInfo == null && !message.senderUserId.isNullOrEmpty()) {
            userInfo = ProfileCache.fetchUser(message.senderUserId)
        }
    }

    val senderName = userInfo?.nickname?.ifEmpty { userInfo?.username } ?: "未知用户"
    val avatarHash = userInfo?.avatarFileHash
    val avatarUrl = if (!avatarHash.isNullOrEmpty() && !fileToken.isNullOrEmpty()) {
        LingCatClientManager.currentClient?.getFileUrlByHashAndToken(avatarHash ?: "", fileToken ?: "")
    } else null

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .combinedClickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = {},
                onLongClick = onLongClick
            )
            .padding(vertical = 4.dp),
        horizontalArrangement = if (isMine) Arrangement.End else Arrangement.Start,
        verticalAlignment = Alignment.Top,
    ) {
        if (!isMine) {
            if (hideSender) {
                // 隐藏头像，但用 Spacer 占位，保持气泡对齐
                Spacer(modifier = Modifier.width(36.dp + 8.dp))
            } else {
                ChatAvatar(
                    avatarUrl,
                    avatarHash,
                    onClick = { onAvatarClick(message.senderUserId) },
                    onLongClick = { onAvatarLongClick(message.senderUserId) }
                )
                Spacer(modifier = Modifier.width(8.dp))
            }
        }

        Column(
            horizontalAlignment = if (isMine) Alignment.End else Alignment.Start
        ) {
            // 昵称
            if (!isMine && !hideSender) {
                Text(
                    text = senderName,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(start = 4.dp, bottom = 4.dp)
                )
            } else {
                // 如果是连续消息且不需要显示昵称，给一点极小的顶部间距
                Spacer(modifier = Modifier.height(4.dp))
            }


            Surface(
                color = if (isMine) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.surface,
                shape = RoundedCornerShape(
                    bottomEnd = 16.dp,
                    bottomStart = 16.dp,
                    topStart = if (isMine) 16.dp else 4.dp,
                    topEnd = if (isMine) 4.dp else 16.dp
                ),
                shadowElevation = 1.dp,
                modifier = Modifier.widthIn(max = 280.dp)
            ) {
                // ★ 核心修改：用 Box 包裹，把锁图标叠在内部
                Box {
                    MessageContent(
                        message = message,
                        isMine = isMine,
                        onReplyClick = onReplyClick,
                        onMentionClick = onMentionClick,
                        onAttachmentClick = onAttachmentClick,
                        onLongClick = onLongClick,
                        findMessage = findMessage,
                    )

                    // 判断是否是 E2E 消息，如果是，则在右下角/左下角画一个极淡的锁
                    val isE2EMessage = message.entitiesList.any { it.type == "e2e" }
                    if (isE2EMessage) {
                        Icon(
                            imageVector = Icons.Default.Lock,
                            contentDescription = "端到端加密",
                            modifier = Modifier
                                // 自己的消息在右下角，别人的消息在左下角，或者统一放在右下角都可以
                                .align(if (isMine) Alignment.BottomStart else Alignment.BottomEnd)
                                .padding(6.dp)
                                .size(12.dp),
                            // 颜色极淡，作为背景水印，不抢文字的视线
                            tint = if (isMine) {
                                MaterialTheme.colorScheme.onPrimary.copy(alpha = 0.4f)
                            } else {
                                MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f)
                            }
                        )
                    }
                }
            }
        }

        if (isMine) {
            if (hideSender) {
                Spacer(modifier = Modifier.width(36.dp + 8.dp))
            } else {
                Spacer(modifier = Modifier.width(8.dp))
                ChatAvatar(
                    avatarUrl,
                    avatarHash,
                    onClick = { onAvatarClick(message.senderUserId) },
                    onLongClick = { onAvatarLongClick(message.senderUserId) }
                )
            }
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ChatAvatar(
    avatarUrl: String?,
    avatarHash: String?,
    onClick: () -> Unit = {},
    onLongClick: () -> Unit = {}
) {
    val modifier = Modifier
        .size(36.dp)
        .clip(CircleShape)
        .combinedClickable(
            onClick = onClick,
            onLongClick = onLongClick
        )

    if (avatarUrl != null && avatarHash != null) {
        AsyncImage(
            model = coil.request.ImageRequest.Builder(androidx.compose.ui.platform.LocalContext.current)
                .data(avatarUrl)
                .memoryCacheKey(avatarHash)
                .diskCacheKey(avatarHash)
                .build(),
            contentDescription = "头像",
            modifier = modifier,
            contentScale = ContentScale.Crop,
            placeholder = painterResource(id = R.drawable.ic_default_avatar),
            error = painterResource(id = R.drawable.ic_default_avatar)
        )
    } else {
        androidx.compose.foundation.Image(
            painter = painterResource(id = R.drawable.ic_default_avatar),
            contentDescription = "默认头像",
            modifier = modifier,
            contentScale = ContentScale.Crop
        )
    }
}