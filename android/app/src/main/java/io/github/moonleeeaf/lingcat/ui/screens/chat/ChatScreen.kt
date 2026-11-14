package io.github.moonleeeaf.lingcat.ui.screens.chat

import android.content.ActivityNotFoundException
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.webkit.MimeTypeMap
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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Reply
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.FileProvider
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.app.AppState
import io.github.moonleeeaf.lingcat.app.NotificationHelper
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.data.RemarksCache
import io.github.moonleeeaf.lingcat.e2e.E2EInfoDialog
import io.github.moonleeeaf.lingcat.e2e.E2EStateManager
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.Feedback
import io.github.moonleeeaf.lingcat.ui.components.ImageViewerDialog
import io.github.moonleeeaf.lingcat.ui.components.LingCatAvatar
import io.github.moonleeeaf.lingcat.ui.components.LingCatAvatarMinTouchTarget
import io.github.moonleeeaf.lingcat.ui.components.rememberAvatarUrl
import io.github.moonleeeaf.lingcat.ui.rememberUserDisplayName
import io.github.moonleeeaf.lingcat.ui.screens.chat.meeting.MeetingManager
import io.github.moonleeeaf.lingcat.ui.screens.chat.meeting.MeetingPhase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.classes.Classes.IMessage
import lingcat.client_protocol.HttpClientProvider
import lingcat.client_protocol.MeetingApi
import okhttp3.Request
import java.io.File
import java.util.Calendar
import kotlin.math.roundToInt

private fun openFileExternally(
    context: Context,
    scope: CoroutineScope,
    url: String,
    fileName: String,
    hash: String // ★ 新增：直接传入 hash
) {
    scope.launch {
        try {
            // ★ 自动获取扩展名，如果没有就用 "bin" 兜底
            val extension = fileName.substringAfterLast('.', "bin")
            val cacheFileName = if (extension != "bin") "$hash.$extension" else hash

            val tempFile = withContext(Dispatchers.IO) {
                val cacheDir = File(context.cacheDir, "shared_files")
                if (!cacheDir.exists()) cacheDir.mkdirs()

                // 目标缓存文件
                val cachedFile = File(cacheDir, cacheFileName)

                // ★ 命中缓存：直接返回
                if (cachedFile.exists() && cachedFile.length() > 0) {
                    return@withContext cachedFile
                }

                // 没命中缓存，提示用户
                withContext(Dispatchers.Main) {
                    Feedback.show(R.string.chat_downloading)
                }

                // 清理策略：只保留最近 20 个文件
                val files = cacheDir.listFiles()
                if (files != null && files.size > 20) {
                    files.sortBy { it.lastModified() }
                    for (i in 0 until files.size - 20) {
                        files[i].delete()
                    }
                }

                // 开始下载
                val client = HttpClientProvider.get()
                val response = client.newCall(Request.Builder().url(url).build()).execute()
                if (!response.isSuccessful) throw Exception(context.getString(R.string.chat_download_failed, response.code))

                // ★ 先写临时文件，防止下到一半断网变成坏文件
                val downloadingFile = File(cacheDir, "$cacheFileName.downloading")

                response.body?.byteStream()?.use { inputStream ->
                    downloadingFile.outputStream().use { outputStream ->
                        val buffer = ByteArray(8192)
                        var bytesRead: Int
                        while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                            outputStream.write(buffer, 0, bytesRead)
                        }
                        outputStream.flush()
                    }
                }

                if (cachedFile.exists()) cachedFile.delete()
                downloadingFile.renameTo(cachedFile)

                cachedFile
            }

            // 调起外部应用
            withContext(Dispatchers.Main) {
                // 优先根据扩展名获取 MimeType，获取不到就通配 */*
                val mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) ?: "*/*"

                val uri = FileProvider.getUriForFile(
                    context,
                    "${context.packageName}.fileprovider",
                    tempFile
                )

                val intent = Intent(Intent.ACTION_VIEW).apply {
                    setDataAndType(uri, mimeType)
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }

                try {
                    context.startActivity(Intent.createChooser(intent, context.getString(R.string.chat_opening)))
                } catch (e: ActivityNotFoundException) {
                    Feedback.show(R.string.chat_no_app_to_open)
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
            withContext(Dispatchers.Main) {
                Feedback.show(R.string.chat_open_failed, e.message ?: "")
            }
        }
    }
}

/**
* 下载文件并保存到公共下载目录
*/
private suspend fun saveFileToDownloads(context: Context, url: String, fileName: String): Boolean = withContext(Dispatchers.IO) {
    try {
        val client = HttpClientProvider.get()
        val response = client.newCall(Request.Builder().url(url).build()).execute()
        if (!response.isSuccessful) return@withContext false
        val body = response.body ?: return@withContext false

        val extension = fileName.substringAfterLast('.', "bin")
        val mimeType = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension) ?: "*/*"
        val finalFileName = if (fileName.contains(".")) fileName else "$fileName.$extension"

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            // Android 10+ 使用 MediaStore 保存到 Downloads，无需权限
            val values = ContentValues().apply {
                put(MediaStore.Downloads.DISPLAY_NAME, finalFileName)
                put(MediaStore.Downloads.MIME_TYPE, mimeType)
                put(MediaStore.Downloads.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/LingCat")
                put(MediaStore.Downloads.IS_PENDING, 1)
            }
            val resolver = context.contentResolver
            val uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values) ?: return@withContext false

            resolver.openOutputStream(uri)?.use { outputStream ->
                body.byteStream().use { inputStream ->
                    val buffer = ByteArray(8192)
                    var bytesRead: Int
                    while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                        outputStream.write(buffer, 0, bytesRead)
                    }
                    outputStream.flush()
                }
            }

            values.clear()
            values.put(MediaStore.Downloads.IS_PENDING, 0)
            resolver.update(uri, values, null, null)
        } else {
            // Android 9 及以下，由于没有 WRITE_EXTERNAL_STORAGE 权限容易崩溃，
            // 我们保存到 App 专属的外部目录，不需要权限，且卸载 App 时自动清理
            val dir = context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS)
            if (!dir?.exists()!!) dir.mkdirs()
            val file = File(dir, finalFileName)
            file.outputStream().use { outputStream ->
                body.byteStream().use { inputStream ->
                    val buffer = ByteArray(8192)
                    var bytesRead: Int
                    while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                        outputStream.write(buffer, 0, bytesRead)
                    }
                    outputStream.flush()
                }
            }
            withContext(Dispatchers.Main) {
                Feedback.show(R.string.chat_saved_to, file.absolutePath)
            }
        }
        return@withContext true
    } catch (e: Exception) {
        e.printStackTrace()
        return@withContext false
    }
}

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
fun formatTimeDivider(context: Context, time: Long): String {
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
            context.getString(R.string.date_month_day, d.get(Calendar.MONTH) + 1, d.get(Calendar.DAY_OF_MONTH), hm)
        }
        // 往年
        else -> {
            context.getString(R.string.date_year_month_day, d.get(Calendar.YEAR), d.get(Calendar.MONTH) + 1, d.get(Calendar.DAY_OF_MONTH), hm)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatScreen(
    chatId: String,
    onBack: () -> Unit,
    onNavigateToMembers: (String) -> Unit,
    onNavigateToSettings: (String) -> Unit,
    viewModel: ChatViewModel = viewModel(),
    onNavigateToChat: (String) -> Unit,
    onNavigateToMeeting: () -> Unit,
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    // 标题可能还没拉到（chatTitle == null），此时退回「私聊 / 群聊 / 对话」占位文案。
    // 私聊再优先套一层备注：资料页改完备注后标题会立即更新。
    val fallbackChatTitle = uiState.chatTitle
        ?: uiState.chatTitleRes?.let { stringResource(it) }
        ?: stringResource(R.string.label_chat)
    val chatTitleText = rememberUserDisplayName(uiState.peerUserId).ifEmpty { fallbackChatTitle }
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(chatId) {
        // 尝试拿一次标题：私聊优先用备注，避免先闪一下服务端昵称。
        val cachedChat = ProfileCache.getCachedChat(chatId)
        val cachedTitle = when {
            cachedChat == null -> null
            cachedChat.type == "private" && cachedChat.hasPeerUserId() ->
                RemarksCache.getRemark(cachedChat.peerUserId)
                    ?.takeIf { it.isNotBlank() }
                    ?: cachedChat.title.takeIf { it.isNotBlank() }
            else -> cachedChat.title.takeIf { it.isNotBlank() }
        }
        viewModel.initChat(chatId, initialTitle = cachedTitle)
    }

    // 监听错误：统一走全局 Snackbar
    LaunchedEffect(uiState.errorMsg) {
        uiState.errorMsg?.let { Feedback.show(it) }
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
                // 从「对话设定」等页面返回时，用缓存里的最新资料同步标题，
                // 避免改了群名还要退出重进才看得到。
                viewModel.refreshCachedChatInfo()
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

    var activeMeeting by remember { mutableStateOf<MeetingApi.ActiveMeetingResult?>(null) }

    // 发起会议时填写会议标题（默认使用对话标题）
    var showStartMeetingDialog by remember { mutableStateOf(false) }
    var meetingTitleInput by remember { mutableStateOf("") }

    // 2. 进聊天室时拉取一次
    LaunchedEffect(chatId) {
        val client = LingCatClientManager.currentClient
        val token = LingCatClientManager.currentToken
        if (client != null && token != null) {
            try {
                val res = withContext(Dispatchers.IO) {
                    MeetingApi.getActiveMeeting(client, token, chatId)
                }
                if (res.hasMeeting) {
                    activeMeeting = res
                }
            } catch (e: Exception) { }
        }
    }

    var selectedFile by remember { mutableStateOf<Triple<String, String, String>?>(null) }

    Scaffold(
        topBar = {
            if (isSearchMode) {
                // ★ 搜索模式下的顶栏
                TopAppBar(
                    title = {
                        TextField(
                            value = uiState.searchKeyword,
                            onValueChange = viewModel::onSearchKeywordChange,
                            placeholder = { Text(stringResource(R.string.chat_search_hint)) },
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
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.chat_exit_search))
                        }
                    }
                )
            } else {
                TopAppBar(
                    modifier = Modifier.clickable { showChatInfoId = chatId },
                    title = {
                        Column {
                            Text(chatTitleText)
                        }
                    },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.action_back))
                        }
                    },
                    actions = {
                        // 非成员不能开会 / 搜索历史，先只保留返回入口。
                        if (uiState.isMember) {
                            IconButton(onClick = {
                                if (activeMeeting != null) {
                                    // 如果已有会议，直接加入（优先使用会议标题）
                                    MeetingManager.joinMeeting(
                                        context,
                                        chatId,
                                        activeMeeting!!.title ?: chatTitleText,
                                        activeMeeting!!.meetingId
                                    )
                                    onNavigateToMeeting()
                                } else {
                                    // 没有会议，发起前先填写会议标题（默认对话标题）
                                    meetingTitleInput = chatTitleText
                                    showStartMeetingDialog = true
                                }
                            }) {
                                Icon(Icons.Default.Call, contentDescription = stringResource(R.string.chat_meeting))
                            }
                            IconButton(onClick = { isSearchMode = true }) {
                                Icon(Icons.Default.Search, contentDescription = stringResource(R.string.action_search))
                            }
                        }
                        if (uiState.isE2EActive) {
                            IconButton(onClick = { showE2EInfo = true }) {
                                Icon(
                                    imageVector = Icons.Default.Lock,
                                    contentDescription = stringResource(R.string.chat_e2e_info),
                                    tint = MaterialTheme.colorScheme.primary
                                )
                            }
                        }
                    }
                )
            }
        },
        bottomBar = {
            if (uiState.isMember) {
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
                    Text(stringResource(R.string.chat_search_empty), Modifier.align(Alignment.Center))
                } else {
                    val meetingState by MeetingManager.uiState.collectAsState()
                    if (meetingState.phase != MeetingPhase.IDLE && meetingState.chatId == chatId) {
                        Surface(
                            color = MaterialTheme.colorScheme.primaryContainer,
                            modifier = Modifier.fillMaxWidth().padding(8.dp).clickable {
                                // 点击回到会议
                                onNavigateToMeeting() // 加个回调去 navigate("meeting")
                            }
                        ) {
                            Row(modifier = Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Call, contentDescription = null)
                                Spacer(Modifier.width(8.dp))
                                Text(stringResource(R.string.chat_meeting_active, meetingState.participants.size), modifier = Modifier.weight(1f))
                                Text(stringResource(R.string.action_back), color = MaterialTheme.colorScheme.primary)
                            }
                        }
                    }
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
                                    Text("${rememberUserDisplayName(msg.senderUserId)} · ${formatTimeDivider(context, msg.time)}")
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
                if (!uiState.isMember) {
                    ChatJoinPrompt(
                        isJoining = uiState.isJoining,
                        joinPending = uiState.joinPending,
                        onJoin = viewModel::joinChat,
                        modifier = Modifier.align(Alignment.Center),
                    )
                } else if (uiState.isLoading) {
                    CircularProgressIndicator(Modifier.align(Alignment.Center))
                } else {
                    LazyColumn(
                        state = listState,
                        reverseLayout = true, // index 0 是最新的（在底部）
                        modifier = Modifier.fillMaxSize(),
                        contentPadding = PaddingValues(16.dp),
                        // 间距交给 MessageBubble 自己控制：连续同一个人时收紧，换人时留白，
                        // 这里只保留一个很小的基准值。
                        verticalArrangement = Arrangement.spacedBy(2.dp, Alignment.Bottom)
                    ) {
                        // ★ 核心修改：使用 itemsIndexed
                        itemsIndexed(safeMessages, key = { _, msg -> msg.id }) { index, msg ->
                            // 在 reverseLayout 中，index + 1 是视觉上位于其“上方”的较老消息
                            val prevMsg = safeMessages.getOrNull(index + 1)

                            val showTime = shouldShowTime(msg, prevMsg)
                            val timeText = if (showTime) formatTimeDivider(context, msg.time) else null

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
                                                // 图片：直接弹全屏预览
                                                previewImageUrl = url
                                            } else {
                                                // ★ 普通文件：走下载缓存 + FileProvider 打开的逻辑
                                                selectedFile = Triple(hash, name, url)
                                            }
                                        } else {
                                            Feedback.show(R.string.chat_file_url_invalid)
                                        }
                                    },
                                    onLongClick = { selectedMessage = msg },
                                    onAvatarClick = { userId -> showUserProfileId = userId },
                                    // ★ 补全提及点击逻辑
                                    onMentionClick = { mentionId, isChat ->
                                        if (isChat) {
                                            showChatInfoId = mentionId
                                        } else {
                                            // 点击用户，打开资料面板
                                            showUserProfileId = mentionId
                                        }
                                    },
                                    sendStatus = sendStatus, // ★ 传入
                                    onRetrySend = { viewModel.resendMessage(msg.id) },
                                    uploadProgress = uiState.uploadProgress[msg.id] ?: 0,
                                )
                            }
                        }

                        if (uiState.isLoadingMore) {
                            item {
                                Box(
                                    Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
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
                                    Modifier
                                        .fillMaxWidth()
                                        .padding(16.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        stringResource(R.string.chat_end_of_messages),
                                        style = MaterialTheme.typography.labelSmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                    if (!isAtBottom) {
                        // 标准 FAB（56dp）；原来的 SmallFloatingActionButton 只有 40dp，低于 48dp 触控下限。
                        FloatingActionButton(
                            onClick = {
                                coroutineScope.launch { listState.animateScrollToItem(0) }
                            },
                            modifier = Modifier
                                .align(Alignment.BottomEnd)
                                .padding(16.dp),
                            containerColor = MaterialTheme.colorScheme.surfaceContainerHigh,
                        ) {
                            Icon(Icons.Default.ArrowDownward, contentDescription = stringResource(R.string.chat_back_to_bottom))
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
                onOpenSettings = {
                    showChatInfoId = null
                    onNavigateToSettings(chatId)
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

    if (showStartMeetingDialog) {
        AlertDialog(
            onDismissRequest = { showStartMeetingDialog = false },
            title = { Text(stringResource(R.string.chat_start_meeting)) },
            text = {
                OutlinedTextField(
                    value = meetingTitleInput,
                    onValueChange = { if (it.length <= 64) meetingTitleInput = it },
                    label = { Text(stringResource(R.string.meeting_title_label)) },
                    singleLine = true
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    showStartMeetingDialog = false
                    val title = meetingTitleInput.trim().ifEmpty { null }
                    coroutineScope.launch {
                        val client = LingCatClientManager.currentClient
                        val token = LingCatClientManager.currentToken
                        if (client != null && token != null) {
                            try {
                                val result = withContext(Dispatchers.IO) {
                                    MeetingApi.startMeeting(client, token, chatId, title)
                                }
                                // 发起成功后，直接加入
                                MeetingManager.joinMeeting(context, chatId, title ?: chatTitleText, result.meetingId)
                                onNavigateToMeeting()
                            } catch (e: Exception) {
                                Feedback.show(R.string.chat_start_meeting_failed, e.message ?: "")
                            }
                        }
                    }
                }) { Text(stringResource(R.string.chat_start)) }
            },
            dismissButton = {
                TextButton(onClick = { showStartMeetingDialog = false }) { Text(stringResource(R.string.action_cancel)) }
            }
        )
    }

    if (showMessageInfo != null) {
        val msg = showMessageInfo!!
        AlertDialog(
            onDismissRequest = { showMessageInfo = null },
            title = { Text(stringResource(R.string.chat_message_elements, msg.id)) },
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
                TextButton(onClick = { showMessageInfo = null }) { Text(stringResource(R.string.action_close)) }
            }
        )
    }

    if (selectedAvatarUserId != null) {
        val userId = selectedAvatarUserId!!
        val userInfo = ProfileCache.getCachedUser(userId)
        val displayName = rememberUserDisplayName(userId, fallback = stringResource(R.string.chat_this_user))

        ModalBottomSheet(
            onDismissRequest = { selectedAvatarUserId = null }
        ) {
            Column(modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 10.dp)) {
                Text(
                    text = displayName,
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )

                // 查看资料
                ListItem(
                    headlineContent = { Text(stringResource(R.string.chat_view_profile)) },
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
                        headlineContent = { Text(stringResource(R.string.chat_mention_user)) },
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
            Column(modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 10.dp)) {
                Text(
                    text = stringResource(R.string.chat_message_id, selectedMessage?.id ?: 0),
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
                )

                ListItem(
                    headlineContent = { Text(stringResource(R.string.action_copy)) },
                    leadingContent = { Icon(Icons.Default.ContentCopy, contentDescription = null) },
                    colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    modifier = Modifier.clickable {
                        clipboardManager.setText(AnnotatedString(selectedMessage?.text ?: ""))
                        Feedback.show(R.string.chat_copied)
                        selectedMessage = null
                    }
                )

                if (selectedMessage?.senderUserId == LingCatClientManager.currentUserId && selectedMessage?.system != true) {
                    ListItem(
                        headlineContent = { Text(stringResource(R.string.action_edit)) },
                        leadingContent = { Icon(Icons.Default.Edit, contentDescription = null) },
                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                        modifier = Modifier.clickable {
                            selectedMessage?.let { viewModel.startEditing(it) }
                            selectedMessage = null
                        }
                    )
                }

                ListItem(
                    headlineContent = { Text(stringResource(R.string.action_reply)) },
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
                    headlineContent = { Text(stringResource(R.string.chat_view_elements)) },
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

    // ★ 文件操作 BottomSheet
    if (selectedFile != null) {
        val (hash, name, url) = selectedFile!!
        val extension = name.substringAfterLast('.', "").uppercase()

        // 简单根据后缀名给个图标
        val fileIcon = when (extension) {
            "ZIP", "RAR", "7Z" -> Icons.Default.FolderZip
            "PDF" -> Icons.Default.PictureAsPdf
            "DOC", "DOCX", "TXT" -> Icons.Default.Description
            "MP4", "MKV", "AVI" -> Icons.Default.Movie
            "MP3", "WAV" -> Icons.Default.AudioFile
            else -> Icons.Default.InsertDriveFile
        }

        ModalBottomSheet(
            onDismissRequest = { selectedFile = null }
        ) {
            Column(modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 32.dp)) {

                // 文件头部信息
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 24.dp, vertical = 16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = fileIcon,
                        contentDescription = null,
                        modifier = Modifier.size(48.dp),
                        tint = MaterialTheme.colorScheme.primary
                    )
                    Spacer(modifier = Modifier.width(16.dp))
                    Column {
                        Text(
                            text = name,
                            style = MaterialTheme.typography.titleMedium,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                        if (extension.isNotEmpty()) {
                            Text(
                                text = stringResource(R.string.chat_file_type, extension),
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }

                HorizontalDivider()

                // 用其他应用打开
                ListItem(
                    headlineContent = { Text(stringResource(R.string.chat_open_with_other)) },
                    leadingContent = { Icon(Icons.Default.OpenInNew, contentDescription = null) },
                    colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    modifier = Modifier.clickable {
                        openFileExternally(context, coroutineScope, url, name, hash)
                        selectedFile = null
                    }
                )

                // 保存到下载目录
                ListItem(
                    headlineContent = { Text(stringResource(R.string.chat_save_to_downloads)) },
                    leadingContent = { Icon(Icons.Default.Download, contentDescription = null) },
                    colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                    modifier = Modifier.clickable {
                        selectedFile = null
                        coroutineScope.launch {
                            val success = saveFileToDownloads(context, url, name)
                            if (success) {
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                                    Feedback.show(R.string.chat_saved_to_downloads)
                                }
                            } else {
                                Feedback.show(R.string.save_failed_retry)
                            }
                        }
                    }
                )
            }
        }
    }

    if (uiState.needUnlock) {
        var password by remember { mutableStateOf("") }

        AlertDialog(
            onDismissRequest = { viewModel.clearNeedUnlock() },
            title = { Text(stringResource(R.string.chat_e2e)) },
            text = {
                Column {
                    Text(stringResource(R.string.chat_unlock_hint))
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
                }) { Text(stringResource(R.string.action_unlock)) }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.clearNeedUnlock() }) { Text(stringResource(R.string.action_cancel)) }
            }
        )
    }

    ImageViewerDialog(
        imageUrl = previewImageUrl,
        onDismiss = { previewImageUrl = null }
    )
}

/**
 * 非成员提示：加入对话后才会显示历史消息与输入框。
 */
@Composable
private fun ChatJoinPrompt(
    isJoining: Boolean,
    joinPending: Boolean,
    onJoin: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier.padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(
            imageVector = Icons.Default.Group,
            contentDescription = null,
            modifier = Modifier.size(48.dp),
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
        )
        Spacer(Modifier.height(16.dp))
        Text(
            text = stringResource(R.string.chat_not_member_title),
            style = MaterialTheme.typography.titleMedium,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.height(8.dp))
        Text(
            text = stringResource(
                if (joinPending) R.string.chat_join_pending else R.string.chat_not_member_desc
            ),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center,
        )
        if (!joinPending) {
            Spacer(Modifier.height(20.dp))
            Button(onClick = onJoin, enabled = !isJoining) {
                if (isJoining) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(16.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary,
                    )
                    Spacer(Modifier.width(8.dp))
                }
                Text(
                    stringResource(
                        if (isJoining) R.string.chat_joining else R.string.chat_join_action
                    )
                )
            }
        }
    }
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
    onAttachmentClick: (hash: String, name: String, isImage: Boolean) -> Unit,
    uploadProgress: Int,
) {
    val scope = rememberCoroutineScope()
    val offsetX = remember { Animatable(0f) }
    val density = LocalDensity.current
    // 触发回复的阈值（比如 60dp）
    val threshold = with(density) { 60.dp.toPx() }

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

    val senderName = rememberUserDisplayName(userInfo, fallback = stringResource(R.string.label_unknown_user))
    val avatarHash = userInfo?.avatarFileHash

    // ★ 核心包裹层：处理手势和滑动图标
    BoxWithConstraints(
        modifier = Modifier
            .fillMaxWidth()
            .draggable(
                orientation = Orientation.Horizontal,
                state = rememberDraggableState { delta ->
                    scope.launch {
                        // 只能向左滑，限制最大位移防止飘出屏幕
                        val maxOffset = threshold + with(density) { 20.dp.toPx() }
                        val newValue = (offsetX.value + delta).coerceIn(-maxOffset, 0f)
                        offsetX.snapTo(newValue)
                    }
                },
                onDragStopped = {
                    if (offsetX.value < -threshold) {
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
        // 气泡最大宽度：手机上是 76% 的行宽，平板上再收紧到 560dp，
        // 既不会出现一条消息占满整块屏幕，也不会在宽屏上被拉成一行超长文本。
        val maxBubbleWidth = (maxWidth * 0.76f).coerceAtMost(560.dp)

        // 头像视觉尺寸 40dp，但可点击时触控区会扩到 48dp；隐藏头像时要用「同样的总宽度」占位，
        // 否则有头像和没头像两种行的气泡左边距会差 8dp。
        val avatarSize = 40.dp
        val avatarSlotWidth = maxOf(avatarSize, LingCatAvatarMinTouchTarget) + 4.dp

        // ==========================================
        // 底层：回复图标（随滑动距离淡入）
        // ==========================================
        Box(
            modifier = Modifier
                .matchParentSize()
                .padding(end = 20.dp),
            contentAlignment = Alignment.CenterEnd
        ) {
            val alpha = (-offsetX.value / threshold).coerceIn(0f, 1f)
            if (alpha > 0f) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.Reply,
                    contentDescription = stringResource(R.string.chat_swipe_reply),
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
                // 换人 / 新时间段时上下各留一点呼吸感；同一个人连发时只留最小间距。
                .padding(top = if (hideSender) 1.dp else 7.dp, bottom = 2.dp),
            horizontalArrangement = if (isMine) Arrangement.End else Arrangement.Start,
            verticalAlignment = Alignment.Top,
        ) {
            if (!isMine) {
                if (hideSender) {
                    // 同一个人连续发消息：不重复显示头像，但要占住同样的宽度，气泡不能左右跳动。
                    Spacer(modifier = Modifier.width(avatarSlotWidth))
                } else {
                    LingCatAvatar(
                        avatarHash = avatarHash,
                        size = avatarSize,
                        contentDescription = stringResource(R.string.label_avatar),
                        onClick = { onAvatarClick(message.senderUserId) },
                        onLongClick = { onAvatarLongClick(message.senderUserId) },
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                }
            } else {
                // 左侧发送状态 (转圈/红叹号)
                if (sendStatus != null) {
                    Box(
                        modifier = Modifier
                            .align(Alignment.CenterVertically)
                            .padding(end = 8.dp)
                    ) {
                        when (sendStatus) {
                            SendStatus.SENDING -> {
                                val progress = uploadProgress // 0~100，如果没在传文件就是 0
                                if (progress > 0 && progress < 100) {
                                    // 显示带百分比的圆形进度条
                                    Box(contentAlignment = Alignment.Center) {
                                        CircularProgressIndicator(
                                            progress = { progress / 100f },
                                            modifier = Modifier.size(24.dp),
                                            strokeWidth = 2.dp,
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                        Text(
                                            text = "$progress",
                                            style = MaterialTheme.typography.labelSmall.copy(fontSize = 8.sp),
                                            color = MaterialTheme.colorScheme.primary
                                        )
                                    }
                                } else {
                                    // 未开始传或已经传完，显示单纯的转圈
                                    CircularProgressIndicator(
                                        modifier = Modifier.size(16.dp),
                                        strokeWidth = 2.dp,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                }
                            }
                            SendStatus.FAILED -> Icon(
                                imageVector = Icons.Default.Error,
                                contentDescription = stringResource(R.string.chat_send_failed_retry),
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
                // 昵称：同一个人连续发消息时只在第一条显示
                if (!isMine) {
                    if (!hideSender) {
                        Text(
                            text = senderName,
                            // labelSmall（11sp）在群聊里偏小，提到 12sp 并稍加字重，和气泡文字拉开层级。
                            style = MaterialTheme.typography.labelMedium,
                            fontWeight = FontWeight.Medium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(start = 4.dp, bottom = 3.dp)
                        )
                    }
                } else {
                    // 自己的气泡没有昵称行；换人时补一段空白保持和对方气泡的节奏一致，
                    // 连续发送时不再补，避免同一个人连发看起来被拉开。
                    if (!hideSender) Spacer(modifier = Modifier.height(15.dp))
                }

                Surface(
                    // 自己的气泡用 primary；对方用 surfaceContainerHigh，
                    // 保证在浅色/深色下都和背景有明确层次（之前双方都是 surface，等于没有气泡）。
                    color = if (isMine) {
                        MaterialTheme.colorScheme.primary
                    } else {
                        MaterialTheme.colorScheme.surfaceContainerHigh
                    },
                    shape = RoundedCornerShape(
                        bottomEnd = 16.dp,
                        bottomStart = 16.dp,
                        topStart = if (isMine) 16.dp else 4.dp,
                        topEnd = if (isMine) 4.dp else 16.dp
                    ),
                    shadowElevation = 1.dp,
                    modifier = Modifier.widthIn(max = maxBubbleWidth),
                ) {
                    // 气泡内部加上 Box 叠水印
                    Box {
                        CompositionLocalProvider(LocalMessageMaxWidth provides maxBubbleWidth) {
                            MessageContent(
                                message = message,
                                isMine = isMine,
                                onReplyClick = onReplyClick,
                                onMentionClick = onMentionClick,
                                onAttachmentClick = onAttachmentClick,
                                onLongClick = onLongClick,
                                // findMessage = { /* 如果之前加过，就传进去 */ }
                            )
                        }
                        // 加密水印
                        val isE2EMessage = message.entitiesList.any { it.type == "e2e" }
                        if (isE2EMessage) {
                            Icon(
                                imageVector = Icons.Default.Lock,
                                contentDescription = stringResource(R.string.chat_e2e),
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
                if (hideSender) {
                    // 自己连续发消息时同样不重复头像，但保留占位
                    Spacer(modifier = Modifier.width(avatarSlotWidth))
                } else {
                    Spacer(modifier = Modifier.width(4.dp))
                    LingCatAvatar(
                        avatarHash = avatarHash,
                        size = avatarSize,
                        contentDescription = stringResource(R.string.label_avatar),
                        onClick = { onAvatarClick(message.senderUserId) },
                        onLongClick = { onAvatarLongClick(message.senderUserId) },
                    )
                }
            }
        }
    }
}