package io.github.moonleeeaf.lingcat.ui.screens.chat

import ChatInputBar
import android.content.Context
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.draggable
import androidx.compose.foundation.gestures.rememberDraggableState
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Reply
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.IntOffset
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
import kotlin.math.roundToInt

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
    viewModel: ChatViewModel = viewModel(),
    onNavigateToChat: (String) -> Unit,
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

    var isSearchMode by remember { mutableStateOf(false) }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            if (isSearchMode) {
                // ★ 搜索模式下的顶栏
                TopAppBar(
                    title = {
                        TextField(
                            value = uiState.searchKeyword,
                            onValueChange = viewModel::onSearchKeywordChange,
                            placeholder = { Text("搜索聊天记录...") },
                            modifier = Modifier.fillMaxWidth(),
                            colors = TextFieldDefaults.colors(
                                focusedContainerColor = Color.Transparent,
                                unfocusedContainerColor = Color.Transparent,
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent
                            ),
                            singleLine = true
                        )
                    },
                    navigationIcon = {
                        IconButton(onClick = {
                            isSearchMode = false
                            viewModel.closeSearch()
                        }) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "退出搜索")
                        }
                    }
                )
            } else {
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
                        IconButton(onClick = { isSearchMode = true }) {
                            Icon(Icons.Default.Search, contentDescription = "搜索")
                        }
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
            }
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
                chatMembers = uiState.chatMembers,
                onRequestMembers = { viewModel.fetchChatMembersIfNeeded() },
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (isSearchMode) {
                // ★ 搜索结果列表
                if (uiState.isSearching) {
                    CircularProgressIndicator(Modifier.align(Alignment.Center))
                } else if (uiState.searchResults.isEmpty() && uiState.searchKeyword.isNotBlank()) {
                    Text("没有找到相关消息", Modifier.align(Alignment.Center))
                } else {
                    LazyColumn(Modifier.fillMaxSize()) {
                        items(uiState.searchResults) { msg ->
                            ListItem(
                                headlineContent = {
                                    Text(
                                        text = buildAnnotatedString {
                                            // 高亮关键字 (简易版)
                                            val start = msg.text.indexOf(uiState.searchKeyword, ignoreCase = true)
                                            if (start >= 0) {
                                                append(msg.text.substring(0, start))
                                                withStyle(SpanStyle(color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)) {
                                                    append(msg.text.substring(start, start + uiState.searchKeyword.length))
                                                }
                                                append(msg.text.substring(start + uiState.searchKeyword.length))
                                            } else {
                                                append(msg.text)
                                            }
                                        }
                                    )
                                },
                                supportingContent = {
                                    // 发送者名字和时间
                                    Text("${ProfileCache.getCachedUser(msg.senderUserId)?.nickname ?: ""} · ${formatTimeDivider(msg.time)}")
                                },
                                modifier = Modifier.clickable {
                                    // ★ 点击结果，跳转定位
                                    isSearchMode = false
                                    viewModel.closeSearch()
                                    coroutineScope.launch {
                                        viewModel.jumpToMessage(msg.id, listState)
                                    }
                                }
                            )
                            HorizontalDivider()
                        }
                    }
                }
            } else {
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

                            val sendStatus = uiState.sendStatusMap[msg.id]

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
                                            color = MaterialTheme.colorScheme.onSurfaceVariant.copy(
                                                alpha = 0.6f
                                            )
                                        )
                                    }
                                }

                                // 消息气泡
                                MessageBubble(
                                    message = msg,
                                    isMine = msg.senderUserId == LingCatClientManager.currentUserId,
                                    hideSender = hideSender,
                                    onAvatarLongClick = { userId -> selectedAvatarUserId = userId },
                                    onReplyClick = { replyId ->
                                        coroutineScope.launch {
                                            viewModel.jumpToMessage(replyId, listState)
                                        }
                                    },
                                    onSwipeReply = {
                                        val currentText = uiState.inputText
                                        viewModel.onInputChange("[reply:${msg.id}]$currentText")
                                        focusRequester.requestFocus()
                                    },
                                    // ★ 补全附件点击逻辑
                                    onAttachmentClick = { hash, name, isImage ->
                                        val client = LingCatClientManager.currentClient
                                        val token = LingCatClientManager.fileAccessToken.value ?: ""
                                        val url = client?.getFileUrlByHashAndToken(hash, token)

                                        if (url != null) {
                                            if (isImage) {
                                                // 弹出全屏预览
                                                previewImageUrl = url
                                            } else {
                                                // 普通文件走外部应用
                                                try {
                                                    val intent =
                                                        android.content.Intent(android.content.Intent.ACTION_VIEW)
                                                            .apply {
                                                                data = android.net.Uri.parse(url)
                                                                addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
                                                            }
                                                    context.startActivity(intent)
                                                } catch (e: Exception) {
                                                    Toast.makeText(
                                                        context,
                                                        "无法打开文件",
                                                        Toast.LENGTH_SHORT
                                                    ).show()
                                                }
                                            }
                                        } else {
                                            Toast.makeText(
                                                context,
                                                "文件地址无效",
                                                Toast.LENGTH_SHORT
                                            ).show()
                                        }
                                    },
                                    onLongClick = { selectedMessage = msg },
                                    onAvatarClick = { userId -> showUserProfileId = userId },
                                    // ★ 补全提及点击逻辑
                                    onMentionClick = { mentionId, isChat ->
                                        if (isChat) {
                                            // 群提及暂未做跳转，先给个提示
                                            android.widget.Toast.makeText(
                                                context,
                                                "点击了群: $mentionId",
                                                android.widget.Toast.LENGTH_SHORT
                                            ).show()
                                        } else {
                                            // 点击用户，打开资料面板
                                            showUserProfileId = mentionId
                                        }
                                    },
                                    sendStatus = sendStatus, // ★ 传入
                                    onRetrySend = { viewModel.resendMessage(msg.id) },
                                )
                            }
                        }

                        if (uiState.isLoadingMore) {
                            item {
                                Box(
                                    Modifier.fillMaxWidth().padding(16.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    CircularProgressIndicator(
                                        Modifier.size(24.dp),
                                        strokeWidth = 2.dp
                                    )
                                }
                            }
                        } else if (!uiState.hasMore) {
                            item {
                                Box(
                                    Modifier.fillMaxWidth().padding(16.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        "到底啦喵~",
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
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
            },
            onNavigateToChat = onNavigateToChat,
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

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun MessageBubble(
    message: IMessage,
    isMine: Boolean,
    hideSender: Boolean = false,
    sendStatus: SendStatus? = null,
    onRetrySend: () -> Unit = {},
    onSwipeReply: () -> Unit = {}, // ★ 新增：滑动回复
    onReplyClick: (Int) -> Unit,
    onLongClick: () -> Unit,
    onAvatarClick: (String) -> Unit,
    onAvatarLongClick: (String) -> Unit,
    onMentionClick: (String, Boolean) -> Unit,
    onAttachmentClick: (hash: String, name: String, isImage: Boolean) -> Unit
) {
    val fileToken by LingCatClientManager.fileAccessToken.collectAsState()
    val scope = rememberCoroutineScope()
    val offsetX = remember { Animatable(0f) }
    val density = LocalDensity.current
    // 触发回复的阈值（比如 60dp）
    val threshold = with(density) { 60.dp.toPx() }

    if (message.system) {
        Box(
            modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp, horizontal = 32.dp),
            contentAlignment = Alignment.Center
        ) {
            MessageContent(
                message = message,
                isMine = false,
                isSystem = true,
                onReplyClick = {},
                onMentionClick = onMentionClick,
                onAttachmentClick = onAttachmentClick,
                onLongClick = {}
            )
        }
        return
    }

    // 1. 获取发送者信息
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

    // ★ 核心包裹层：处理手势和滑动图标
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .draggable(
                orientation = Orientation.Horizontal,
                state = rememberDraggableState { delta ->
                    scope.launch {
                        // 只能向右滑，限制最大位移防止飘出屏幕
                        val newValue = (offsetX.value + delta).coerceIn(0f, threshold + with(density) { 20.dp.toPx() })
                        offsetX.snapTo(newValue)
                    }
                },
                onDragStopped = {
                    if (offsetX.value > threshold) {
                        onSwipeReply()
                        // 可选：加上触觉反馈（如震动）
                    }
                    // 松手后弹簧回弹到原位
                    scope.launch {
                        offsetX.animateTo(
                            targetValue = 0f,
                            animationSpec = spring(
                                dampingRatio = Spring.DampingRatioMediumBouncy,
                                stiffness = Spring.StiffnessLow
                            )
                        )
                    }
                }
            )
    ) {
        // ==========================================
        // 底层：回复图标（随滑动距离淡入）
        // ==========================================
        Box(
            modifier = Modifier
                .matchParentSize()
                .padding(start = 20.dp),
            contentAlignment = if (isMine) Alignment.CenterEnd else Alignment.CenterStart
        ) {
            val alpha = (offsetX.value / threshold).coerceIn(0f, 1f)
            if (alpha > 0f) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.Reply,
                    contentDescription = "滑动回复",
                    modifier = Modifier
                        .size(28.dp)
                        .graphicsLayer { this.alpha = alpha },
                    tint = MaterialTheme.colorScheme.primary
                )
            }
        }

        // ==========================================
        // 顶层：原来的 Row 气泡，加上平移
        // ==========================================
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .offset { IntOffset(offsetX.value.roundToInt(), 0) } // ★ 随着手指滑动
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
                ChatAvatar(
                    avatarUrl,
                    avatarHash,
                    onClick = { onAvatarClick(message.senderUserId) },
                    onLongClick = { onAvatarLongClick(message.senderUserId) }
                )
                Spacer(modifier = Modifier.width(8.dp))
            } else {
                // 左侧发送状态 (转圈/红叹号)
                if (sendStatus != null) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.CenterVertically)
                            .padding(end = 8.dp)
                    ) {
                        when (sendStatus) {
                            SendStatus.SENDING -> CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                strokeWidth = 2.dp,
                                color = MaterialTheme.colorScheme.primary
                            )
                            SendStatus.FAILED -> Icon(
                                imageVector = Icons.Default.Error,
                                contentDescription = "发送失败，点击重试",
                                tint = MaterialTheme.colorScheme.error,
                                modifier = Modifier
                                    .size(24.dp)
                                    .clickable { onRetrySend() }
                            )
                        }
                    }
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
                } else if (!isMine && hideSender) {
                    Spacer(modifier = Modifier.height(4.dp))
                } else {
                    Spacer(modifier = Modifier.height(15.dp))
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
                    // 气泡内部加上 Box 叠水印
                    Box {
                        MessageContent(
                            message = message,
                            isMine = isMine,
                            onReplyClick = onReplyClick,
                            onMentionClick = onMentionClick,
                            onAttachmentClick = onAttachmentClick,
                            onLongClick = onLongClick,
                            // findMessage = { /* 如果之前加过，就传进去 */ }
                        )
                        // 加密水印
                        val isE2EMessage = message.entitiesList.any { it.type == "e2e" }
                        if (isE2EMessage) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = "端到端加密",
                                modifier = Modifier
                                    .align(if (isMine) Alignment.BottomStart else Alignment.BottomEnd)
                                    .padding(6.dp)
                                    .size(12.dp),
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