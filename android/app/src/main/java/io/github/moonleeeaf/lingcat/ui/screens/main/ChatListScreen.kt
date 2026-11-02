package io.github.moonleeeaf.lingcat.ui.screens.main

import android.Manifest
import android.os.Build
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.AccountCircle
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox // ★ 引入下拉刷新
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.launch
import lingcat.classes.Classes.IChat

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatListScreen(
    onManageAccounts: () -> Unit,
    onLogout: () -> Unit,
    onChatClick: (String) -> Unit,
    viewModel: ChatListViewModel = viewModel(),
    onEditProfile: () -> Unit,
) {
    val fileToken by LingCatClientManager.fileAccessToken.collectAsState()

    val uiState by viewModel.uiState.collectAsState()
    var menuExpanded by remember { mutableStateOf(false) }

    val pagerState = rememberPagerState(pageCount = { 3 })
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(pagerState.currentPage) {
        viewModel.selectTab(pagerState.currentPage)
    }

    val snackbarHostState = remember { SnackbarHostState() }

    // 注意：只有列表已经展示过（SUCCESS）或者是纯刷新时才显示下拉圈，全屏转圈时不需要
    LaunchedEffect(uiState.errorMsg) {
        uiState.errorMsg?.let {
            if (uiState.loadState == ListLoadState.SUCCESS) { // 只有在列表已经显示的情况下，刷新报错才弹 Snackbar
                snackbarHostState.showSnackbar(it)
            }
        }
    }

    val requestPermissionLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted -> }
    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    val showRefreshing = uiState.isRefreshing ||
            uiState.loadState == ListLoadState.CONNECTING ||
            uiState.loadState == ListLoadState.LOADING_DATA

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text(LingCatClientManager.currentServer?.siteTitle.toString()) },
                actions = {
                    Box {
                        IconButton(onClick = { menuExpanded = true }) {
                            Icon(Icons.Default.MoreVert, contentDescription = "更多")
                        }
                        DropdownMenu(
                            expanded = menuExpanded,
                            onDismissRequest = { menuExpanded = false }
                        ) {
                            DropdownMenuItem(
                                text = { Text("编辑资料") },
                                leadingIcon = { Icon(Icons.Default.Edit, contentDescription = null) },
                                onClick = {
                                    menuExpanded = false
                                    onEditProfile() // ★ 传入回调
                                }
                            )
                            DropdownMenuItem(
                                text = { Text("账号管理") },
                                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                                onClick = {
                                    menuExpanded = false
                                    onManageAccounts()
                                }
                            )
                            /*DropdownMenuItem(
                                text = { Text("退出登录") },
                                leadingIcon = { Icon(Icons.AutoMirrored.Filled.ExitToApp, contentDescription = null) },
                                onClick = {
                                    menuExpanded = false
                                    LingCatClientManager.logout()
                                    onLogout()
                                }
                            )*/
                        }
                    }
                }
            )
        }
    ) { padding ->
        Column(Modifier.fillMaxSize().padding(padding)) {

            val tabs = listOf("最近", "收藏", "全部")
            TabRow(selectedTabIndex = pagerState.currentPage) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = pagerState.currentPage == index,
                        onClick = {
                            coroutineScope.launch {
                                pagerState.animateScrollToPage(index)
                            }
                        },
                        text = { Text(title) }
                    )
                }
            }

            PullToRefreshBox(
                isRefreshing = showRefreshing, // ★ 绑定综合状态
                onRefresh = { viewModel.initAndLoad(isRefresh = true) },
                modifier = Modifier.fillMaxSize()
            ) {
                HorizontalPager(
                    state = pagerState,
                    modifier = Modifier.fillMaxSize()
                ) { pageIndex ->
                    val currentChats = when(pageIndex) {
                        0 -> uiState.recentChats
                        1 -> uiState.favouriteChats
                        else -> uiState.allChats
                    }

                    Box(Modifier.fillMaxSize()) {
                        when (uiState.loadState) {
                            // ★ 删掉原先的 CircularProgressIndicator，直接留空或显示透明的 Box
                            ListLoadState.IDLE, ListLoadState.CONNECTING, ListLoadState.LOADING_DATA -> {
                                // 如果列表里有旧数据，就展示旧数据；如果彻底没数据，显示个轻量提示
                                if (currentChats.isEmpty()) {
                                    Text(
                                        "正在拉取会话列表...",
                                        Modifier.align(Alignment.Center),
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                        style = MaterialTheme.typography.bodyMedium
                                    )
                                } else {
                                    // 有缓存数据的情况下，静默刷新，什么都不用管，直接渲染下面的列表
                                    LazyColumn(Modifier.fillMaxSize()) {
                                        items(currentChats, key = { it.id }) { chat ->
                                            ChatListItem(chat = chat, fileToken = fileToken, onClick = { onChatClick(chat.id) })
                                            HorizontalDivider(color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                        }
                                    }
                                }
                            }

                            ListLoadState.ERROR -> {
                                Column(
                                    modifier = Modifier.align(Alignment.Center),
                                    horizontalAlignment = Alignment.CenterHorizontally
                                ) {
                                    Text(text = uiState.errorMsg ?: "网络出错了喵", color = MaterialTheme.colorScheme.error)
                                    Spacer(modifier = Modifier.height(16.dp))
                                    Button(onClick = { viewModel.initAndLoad() }) {
                                        Text("点击重试")
                                    }
                                }
                            }

                            ListLoadState.SUCCESS -> {
                                if (currentChats.isEmpty()) {
                                    Column(
                                        Modifier.align(Alignment.Center),
                                        horizontalAlignment = Alignment.CenterHorizontally
                                    ) {
                                        Text("这里空空如也喵~", color = MaterialTheme.colorScheme.onSurfaceVariant)
                                    }
                                } else {
                                    LazyColumn(Modifier.fillMaxSize()) {
                                        items(currentChats, key = { it.id }) { chat ->
                                            ChatListItem(chat = chat, fileToken = fileToken, onClick = { onChatClick(chat.id) })
                                            HorizontalDivider(color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun ChatListItem(chat: IChat, fileToken: String?, onClick: () -> Unit) {
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
        peerUser?.nickname?.ifEmpty { peerUser?.username } ?: "私聊"
    } else {
        "无标题"
    }

    // 5. 拼接头像 URL
    val avatarUrl = if (!finalAvatarHash.isNullOrEmpty() && !fileToken.isNullOrEmpty()) {
        LingCatClientManager.currentClient?.getFileUrlByHashAndToken(finalAvatarHash, fileToken)
    } else null

    ListItem(
        leadingContent = {
            if (avatarUrl != null) {
                AsyncImage(
                    model = coil.request.ImageRequest.Builder(androidx.compose.ui.platform.LocalContext.current)
                        .data(avatarUrl) // 网络请求的地址（带动态 Token）
                        .memoryCacheKey(finalAvatarHash) // ★ 核心：内存缓存只认 Hash！
                        .diskCacheKey(finalAvatarHash)   // ★ 核心：磁盘缓存也只认 Hash！
                        .crossfade(true)
                        .build(),
                    contentDescription = "头像",
                    modifier = Modifier.size(48.dp).clip(CircleShape),
                    contentScale = ContentScale.Crop,
                    placeholder = painterResource(id = R.drawable.ic_default_avatar),
                    error = painterResource(id = R.drawable.ic_default_avatar)
                )
            } else {
                androidx.compose.foundation.Image(
                    painter = painterResource(id = R.drawable.ic_default_avatar),
                    contentDescription = "默认头像",
                    modifier = Modifier.size(48.dp).clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            }
        },
        headlineContent = { Text(displayTitle) },
        supportingContent = {
            Text(
                text = chat.lastMessageText ?: "",
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        },
        modifier = Modifier.clickable { onClick() }
    )
}