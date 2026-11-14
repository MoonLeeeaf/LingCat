package io.github.moonleeeaf.lingcat.ui.screens.main

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.res.stringResource
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.Feedback
import io.github.moonleeeaf.lingcat.ui.asString
import io.github.moonleeeaf.lingcat.ui.components.EmptyState
import io.github.moonleeeaf.lingcat.ui.components.ErrorState
import io.github.moonleeeaf.lingcat.ui.components.LingCatAvatar
import io.github.moonleeeaf.lingcat.ui.components.LoadingState
import io.github.moonleeeaf.lingcat.data.ProfileCache
import lingcat.classes.Classes.IChat
import lingcat.client_protocol.LingCatClient

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
    val connectionState by viewModel.connectionState.collectAsState()
    val connectionError by viewModel.connectionError.collectAsState()
    var menuExpanded by remember { mutableStateOf(false) }

    // 最近 / 全部 内容高度重合，不再用三个 Tab 占首屏；只保留“只看收藏”一个筛选。
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

            // ★ 网络状态提示条
            val showConnectionBanner = connectionState == LingCatClient.ConnectionState.CONNECTING ||
                    connectionState == LingCatClient.ConnectionState.RECONNECTING ||
                    connectionState == LingCatClient.ConnectionState.DISCONNECTED
            AnimatedVisibility(
                visible = showConnectionBanner,
                enter = expandVertically() + fadeIn(),
                exit = shrinkVertically() + fadeOut()
            ) {
                ConnectionStateBanner(
                    state = connectionState,
                    errorMessage = connectionError,
                    onRetry = {
                        val server = LingCatClientManager.currentServer
                        if (server != null) {
                            viewModel.reconnect(server)
                        } else {
                            viewModel.initAndLoad()
                        }
                    }
                )
            }

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
 * 网络连接状态提示条。
 * - CONNECTING / RECONNECTING：使用 secondaryContainer，明确是“进行中”而不是普通文字
 * - DISCONNECTED：使用 error，并提供“重试”按钮
 */
@Composable
private fun ConnectionStateBanner(
    state: LingCatClient.ConnectionState,
    errorMessage: String?,
    onRetry: () -> Unit,
) {
    val isDisconnected = state == LingCatClient.ConnectionState.DISCONNECTED
    val background = if (isDisconnected) {
        MaterialTheme.colorScheme.error
    } else {
        MaterialTheme.colorScheme.secondaryContainer
    }
    val contentColor = if (isDisconnected) {
        MaterialTheme.colorScheme.onError
    } else {
        MaterialTheme.colorScheme.onSecondaryContainer
    }
    val icon: ImageVector = if (isDisconnected) Icons.Default.CloudOff else Icons.Default.Sync

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(background)
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            tint = contentColor,
            modifier = Modifier.size(20.dp),
        )
        Spacer(Modifier.width(12.dp))
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(2.dp),
        ) {
            Text(
                text = if (isDisconnected) stringResource(R.string.chat_list_disconnected) else stringResource(R.string.chat_list_reconnecting),
                color = contentColor,
                style = MaterialTheme.typography.bodyMedium,
            )
            if (!errorMessage.isNullOrBlank()) {
                Text(
                    text = errorMessage,
                    color = contentColor.copy(alpha = 0.85f),
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
        if (isDisconnected) {
            TextButton(onClick = onRetry) {
                Text(stringResource(R.string.action_retry), color = contentColor)
            }
        }
    }
}

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

    // 如果是私聊，且没有设置备注/标题，就显示对方的昵称
    val displayTitle = if (chat.title.isNotEmpty()) {
        chat.title
    } else if (chat.type == "private" && peerUser != null) {
        peerUser?.nickname?.ifEmpty { peerUser?.username } ?: stringResource(R.string.label_private_chat)
    } else {
        stringResource(R.string.chat_list_no_title)
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
