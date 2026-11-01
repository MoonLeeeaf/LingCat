package io.github.moonleeeaf.lingcat.ui.screens.chat

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.net.LingCatClientManager

@OptIn(ExperimentalMaterial3Api::class, ExperimentalFoundationApi::class)
@Composable
fun ChatMembersScreen(
    chatId: String,
    onBack: () -> Unit,
    // ★ 修复 1：补上缺失的跳转参数
    onNavigateToChatFromMember: (String) -> Unit = {},
    viewModel: ChatMembersViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val fileToken by LingCatClientManager.fileAccessToken.collectAsState()

    var selectedUserId by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(chatId) {
        viewModel.init(chatId)
    }

    Scaffold(
        topBar = {
            Column {
                TopAppBar(
                    title = { Text("对话成员") },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                        }
                    }
                )
                // 搜索框
                OutlinedTextField(
                    value = uiState.searchQuery,
                    onValueChange = viewModel::onSearchQueryChange,
                    placeholder = { Text("搜索昵称、账号或 ID") },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                )
            }
        }
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            if (uiState.isLoading) {
                CircularProgressIndicator(Modifier.align(Alignment.Center))
            } else if (uiState.errorMsg != null) {
                Text(
                    text = uiState.errorMsg!!,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.align(Alignment.Center).padding(16.dp)
                )
            } else {
                LazyColumn(modifier = Modifier.fillMaxSize()) {
                    // 群主组
                    if (uiState.owner.isNotEmpty()) {
                        stickyHeader { MemberGroupHeader("所有者") }
                        items(uiState.owner, key = { it.user.id }) { model ->
                            // ★ 修复 2：传入点击回调
                            MemberItem(model, fileToken) { selectedUserId = it }
                        }
                    }

                    // 管理员组
                    if (uiState.admins.isNotEmpty()) {
                        stickyHeader { MemberGroupHeader("管理员") }
                        items(uiState.admins, key = { it.user.id }) { model ->
                            MemberItem(model, fileToken) { selectedUserId = it }
                        }
                    }

                    // 普通成员组
                    if (uiState.members.isNotEmpty()) {
                        stickyHeader { MemberGroupHeader("成员 (${uiState.members.size})") }
                        items(uiState.members, key = { it.user.id }) { model ->
                            MemberItem(model, fileToken) { selectedUserId = it }
                        }
                    }
                }
            }
        }
    }

    if (selectedUserId != null) {
        UserProfileDialog(
            userId = selectedUserId!!,
            onDismiss = { selectedUserId = null },
            onNavigateToChat = { newChatId ->
                selectedUserId = null // 记得先关面板
                onNavigateToChatFromMember(newChatId)
            }
        )
    }
}

@Composable
fun MemberGroupHeader(title: String) {
    Surface(
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.95f),
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.labelMedium,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)
        )
    }
}

// ★ 修复 3：把 onClick 作为参数传进来
@Composable
fun MemberItem(
    model: MemberUiModel,
    fileToken: String?,
    onClick: (String) -> Unit
) {
    val user = model.user
    val avatarHash = user.avatarFileHash
    val avatarUrl = if (!avatarHash.isNullOrEmpty() && !fileToken.isNullOrEmpty()) {
        LingCatClientManager.currentClient?.getFileUrlByHashAndToken(avatarHash, fileToken)
    } else null

    ListItem(
        headlineContent = {
            Text(user.nickname.ifEmpty { user.username })
        },
        supportingContent = if (user.nickname.isNotEmpty() && user.username.isNotEmpty()) {
            { Text("@${user.username}", style = MaterialTheme.typography.bodySmall) }
        } else null,
        leadingContent = {
            if (avatarUrl != null) {
                AsyncImage(
                    model = coil.request.ImageRequest.Builder(androidx.compose.ui.platform.LocalContext.current)
                        .data(avatarUrl)
                        .memoryCacheKey(avatarHash)
                        .build(),
                    contentDescription = null,
                    modifier = Modifier.size(40.dp).clip(CircleShape),
                    contentScale = ContentScale.Crop
                )
            } else {
                androidx.compose.foundation.Image(
                    painter = painterResource(id = R.drawable.ic_default_avatar),
                    contentDescription = null,
                    modifier = Modifier.size(40.dp).clip(CircleShape)
                )
            }
        },
        trailingContent = if (model.role != "member") {
            {
                Text(
                    text = model.roleDisplayName,
                    style = MaterialTheme.typography.labelSmall,
                    color = if (model.role == "owner") MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                    fontWeight = FontWeight.Bold
                )
            }
        } else null,
        modifier = Modifier.clickable {
            onClick(user.id) // ★ 调用传入的回调
        }
    )
}