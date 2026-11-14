package io.github.moonleeeaf.lingcat.ui.screens.main

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Group
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.OpenInNew
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.res.stringResource
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.Feedback
import io.github.moonleeeaf.lingcat.ui.asString
import io.github.moonleeeaf.lingcat.ui.components.EmptyState
import io.github.moonleeeaf.lingcat.ui.components.ErrorState
import io.github.moonleeeaf.lingcat.ui.components.LingCatAvatar
import io.github.moonleeeaf.lingcat.ui.components.LoadingState
import io.github.moonleeeaf.lingcat.ui.rememberUserDisplayName
import lingcat.classes.Classes.IChat

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatListScreen(
    onManageAccounts: () -> Unit,
    onLogout: () -> Unit,
    onChatClick: (String) -> Unit,
    viewModel: ChatListViewModel = viewModel(),
    onEditProfile: () -> Unit,
    selectedChatId: String? = null,
) {
    val uiState by viewModel.uiState.collectAsState()
    var menuExpanded by remember { mutableStateOf(false) }
    // 「+」菜单：打开对话 / 创建群组
    var addMenuExpanded by remember { mutableStateOf(false) }
    var showOpenChatDialog by rememberSaveable { mutableStateOf(false) }
    var showCreateGroupDialog by rememberSaveable { mutableStateOf(false) }

    // 全部对话与收藏对话共用同一份数据，只保留“只看收藏”一个筛选。
    var showFavourites by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(uiState.errorMsg) {
        uiState.errorMsg?.let { Feedback.show(it) }
    }

    val requestPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { }
    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    val showRefreshing = uiState.isRefreshing ||
            uiState.loadState == ListLoadState.CONNECTING ||
            uiState.loadState == ListLoadState.LOADING_DATA

    val currentChats = if (showFavourites) uiState.favouriteChats else uiState.allChats

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(LingCatClientManager.currentServer?.siteTitle ?: "LingCat") },
                actions = {
                    Box {
                        IconButton(onClick = { addMenuExpanded = true }) {
                            Icon(Icons.Default.Add, contentDescription = stringResource(R.string.chat_list_add))
                        }
                        DropdownMenu(
                            expanded = addMenuExpanded,
                            onDismissRequest = { addMenuExpanded = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text(stringResource(R.string.chat_list_open_chat)) },
                                leadingIcon = { Icon(Icons.Default.OpenInNew, contentDescription = null) },
                                onClick = {
                                    addMenuExpanded = false
                                    viewModel.resetOpenChatState()
                                    showOpenChatDialog = true
                                }
                            )
                            DropdownMenuItem(
                                text = { Text(stringResource(R.string.chat_list_create_group)) },
                                leadingIcon = { Icon(Icons.Default.Group, contentDescription = null) },
                                onClick = {
                                    addMenuExpanded = false
                                    viewModel.resetCreateGroupState()
                                    showCreateGroupDialog = true
                                }
                            )
                        }
                    }
                    Box {
                        IconButton(onClick = { menuExpanded = true }) {
                            Icon(Icons.Default.MoreVert, contentDescription = stringResource(R.string.chat_list_more))
                        }
                        DropdownMenu(
                            expanded = menuExpanded,
                            onDismissRequest = { menuExpanded = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text(stringResource(R.string.chat_list_edit_profile)) },
                                leadingIcon = { Icon(Icons.Default.Edit, contentDescription = null) },
                                onClick = {
                                    menuExpanded = false
                                    onEditProfile()
                                }
                            )
                            DropdownMenuItem(
                                text = { Text(stringResource(R.string.account_management)) },
                                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                                onClick = {
                                    menuExpanded = false
                                    onManageAccounts()
                                }
                            )
                        }
                    }
                }
            )
        }
    ) { padding ->
        Column(
            Modifier
                .fillMaxSize()
                .padding(padding)
        ) {

            // ★ 轻量筛选：全部 / 收藏
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                FilterChip(
                    selected = !showFavourites,
                    onClick = { showFavourites = false },
                    label = { Text(stringResource(R.string.chat_list_all)) },
                )
                FilterChip(
                    selected = showFavourites,
                    onClick = { showFavourites = true },
                    label = { Text(stringResource(R.string.chat_list_favorites)) },
                    leadingIcon = {
                        Icon(
                            imageVector = if (showFavourites) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = null,
                            modifier = Modifier.size(18.dp),
                        )
                    },
                )
            }

            PullToRefreshBox(
                isRefreshing = showRefreshing,
                onRefresh = { viewModel.initAndLoad(isRefresh = true) },
                modifier = Modifier.fillMaxSize()
            ) {
                Box(Modifier.fillMaxSize()) {
                    when (uiState.loadState) {
                        ListLoadState.IDLE,
                        ListLoadState.CONNECTING,
                        ListLoadState.LOADING_DATA -> {
                            if (currentChats.isEmpty()) {
                                LoadingState(
                                    modifier = Modifier.align(Alignment.Center),
                                    label = stringResource(R.string.chat_list_syncing),
                                )
                            } else {
                                ChatList(
                                    chats = currentChats,
                                    selectedChatId = selectedChatId,
                                    onChatClick = onChatClick,
                                )
                            }
                        }

                        ListLoadState.ERROR -> {
                            if (currentChats.isEmpty()) {
                                ErrorState(
                                    message = uiState.errorMsg?.asString() ?: stringResource(R.string.chat_list_network_error),
                                    onRetry = { viewModel.initAndLoad() },
                                    modifier = Modifier.align(Alignment.Center),
                                )
                            } else {
                                // 有缓存时静默保留列表，错误通过 Snackbar 提示。
                                ChatList(
                                    chats = currentChats,
                                    selectedChatId = selectedChatId,
                                    onChatClick = onChatClick,
                                )
                            }
                        }

                        ListLoadState.SUCCESS -> {
                            if (currentChats.isEmpty()) {
                                EmptyState(
                                    title = if (showFavourites) stringResource(R.string.chat_list_empty_fav_title) else stringResource(R.string.chat_list_empty_title),
                                    description = if (showFavourites) {
                                        stringResource(R.string.chat_list_empty_fav_desc)
                                    } else {
                                        stringResource(R.string.chat_list_empty_desc)
                                    },
                                    icon = if (showFavourites) Icons.Default.FavoriteBorder else Icons.Default.Person,
                                    modifier = Modifier.align(Alignment.Center),
                                )
                            } else {
                                ChatList(
                                    chats = currentChats,
                                    selectedChatId = selectedChatId,
                                    onChatClick = onChatClick,
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // ==========================================
    // 打开对话 / 创建群组
    // ==========================================
    if (showOpenChatDialog) {
        OpenChatDialog(
            state = uiState.openChat,
            onDismiss = {
                showOpenChatDialog = false
                viewModel.resetOpenChatState()
            },
            onConfirm = viewModel::openChatByInput,
        )
    }

    if (showCreateGroupDialog) {
        CreateGroupDialog(
            state = uiState.createGroup,
            onDismiss = {
                showCreateGroupDialog = false
                viewModel.resetCreateGroupState()
            },
            onConfirm = { title, unique -> viewModel.createGroup(title, unique) },
        )
    }

    // 解析 / 创建成功后跳转，并清空状态，避免返回列表时再次跳转。
    LaunchedEffect(uiState.openChat.chatId) {
        uiState.openChat.chatId?.let { chatId ->
            showOpenChatDialog = false
            viewModel.resetOpenChatState()
            onChatClick(chatId)
        }
    }
    LaunchedEffect(uiState.createGroup.chatId) {
        uiState.createGroup.chatId?.let { chatId ->
            showCreateGroupDialog = false
            viewModel.resetCreateGroupState()
            onChatClick(chatId)
        }
    }
}

/**
 * 「打开对话」弹窗：输入对话 ID / 用户 ID / 用户名，解析成功后跳转。
 */
@Composable
private fun OpenChatDialog(
    state: OpenChatState,
    onDismiss: () -> Unit,
    onConfirm: (String) -> Unit,
) {
    var input by rememberSaveable { mutableStateOf("") }
    val canSubmit = input.isNotBlank() && !state.isResolving

    AlertDialog(
        onDismissRequest = { if (!state.isResolving) onDismiss() },
        title = { Text(stringResource(R.string.chat_list_open_chat)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = input,
                    onValueChange = { input = it },
                    singleLine = true,
                    enabled = !state.isResolving,
                    isError = state.errorMsg != null,
                    label = { Text(stringResource(R.string.open_chat_input_label)) },
                    keyboardOptions = KeyboardOptions(imeAction = ImeAction.Go),
                    keyboardActions = KeyboardActions(onGo = { if (canSubmit) onConfirm(input) }),
                    modifier = Modifier.fillMaxWidth(),
                )
                Text(
                    text = state.errorMsg?.asString() ?: stringResource(R.string.open_chat_help),
                    style = MaterialTheme.typography.bodySmall,
                    color = if (state.errorMsg != null) {
                        MaterialTheme.colorScheme.error
                    } else {
                        MaterialTheme.colorScheme.onSurfaceVariant
                    },
                )
            }
        },
        confirmButton = {
            TextButton(onClick = { onConfirm(input) }, enabled = canSubmit) {
                if (state.isResolving) {
                    CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                } else {
                    Text(stringResource(R.string.open_chat_action))
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !state.isResolving) {
                Text(stringResource(R.string.action_cancel))
            }
        },
    )
}

/**
 * 「创建群组」弹窗：群名称必填，唯一标识符可选。
 */
@Composable
private fun CreateGroupDialog(
    state: CreateGroupState,
    onDismiss: () -> Unit,
    onConfirm: (title: String, unique: String) -> Unit,
) {
    var title by rememberSaveable { mutableStateOf("") }
    var unique by rememberSaveable { mutableStateOf("") }
    val canSubmit = title.isNotBlank() && !state.isCreating

    AlertDialog(
        onDismissRequest = { if (!state.isCreating) onDismiss() },
        title = { Text(stringResource(R.string.chat_list_create_group)) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    singleLine = true,
                    enabled = !state.isCreating,
                    isError = state.errorMsg != null,
                    label = { Text(stringResource(R.string.create_group_name_label)) },
                    modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(
                    value = unique,
                    onValueChange = { unique = it },
                    singleLine = true,
                    enabled = !state.isCreating,
                    label = { Text(stringResource(R.string.create_group_unique_label)) },
                    supportingText = { Text(stringResource(R.string.create_group_unique_help)) },
                    modifier = Modifier.fillMaxWidth(),
                )
                if (state.errorMsg != null) {
                    Text(
                        text = state.errorMsg.asString(),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.error,
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = { onConfirm(title, unique) }, enabled = canSubmit) {
                if (state.isCreating) {
                    CircularProgressIndicator(modifier = Modifier.size(16.dp), strokeWidth = 2.dp)
                } else {
                    Text(stringResource(R.string.create_group_action))
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss, enabled = !state.isCreating) {
                Text(stringResource(R.string.action_cancel))
            }
        },
    )
}

@Composable
private fun ChatList(
    chats: List<IChat>,
    selectedChatId: String?,
    onChatClick: (String) -> Unit,
) {
    LazyColumn(Modifier.fillMaxSize()) {
        items(chats, key = { it.id }) { chat ->
            ChatListItem(
                chat = chat,
                selected = chat.id == selectedChatId,
                onClick = { onChatClick(chat.id) },
            )
        }
    }
}

/**
 * 对话列表项。
 */
@Composable
fun ChatListItem(
    chat: IChat,
    selected: Boolean = false,
    onClick: () -> Unit,
) {
    // 1. 获取对方的 ID（如果是私聊）
    val peerUserId = if (chat.type == "private") chat.peerUserId else null

    // 2. 尝试从缓存读取对方信息
    var peerUser by remember { mutableStateOf(ProfileCache.getCachedUser(peerUserId)) }

    // 3. 如果没缓存，异步拉取
    LaunchedEffect(peerUserId) {
        if (peerUserId != null && peerUser == null) {
            peerUser = ProfileCache.fetchUser(peerUserId)
        }
    }

    // 4. 决定最终使用的 Hash 和 标题
    // 私聊优先用对方头像，其次是 chat.avatarFileHash，最后兜底默认头像
    val finalAvatarHash = if (chat.type == "private") {
        peerUser?.avatarFileHash ?: chat.avatarFileHash
    } else {
        chat.avatarFileHash
    }

    // 私聊优先显示备注，其次是昵称 / 用户名；群聊仍然用群名。
    val peerDisplayName = rememberUserDisplayName(peerUser)
    val displayTitle = when {
        chat.type == "private" -> peerDisplayName
            .ifEmpty { chat.title }
            .ifEmpty { stringResource(R.string.label_private_chat) }
        chat.title.isNotEmpty() -> chat.title
        else -> stringResource(R.string.chat_list_no_title)
    }

    val containerColor = if (selected) {
        MaterialTheme.colorScheme.secondaryContainer
    } else {
        MaterialTheme.colorScheme.surface
    }

    ListItem(
        leadingContent = {
            LingCatAvatar(
                avatarHash = finalAvatarHash,
                size = 48.dp,
                contentDescription = stringResource(R.string.label_avatar),
            )
        },
        headlineContent = { Text(displayTitle) },
        supportingContent = chat.lastMessageText?.takeIf { it.isNotBlank() }?.let {
            {
                Text(
                    text = it,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        },
        colors = ListItemDefaults.colors(containerColor = containerColor),
        modifier = Modifier.clickable { onClick() }
    )
}
