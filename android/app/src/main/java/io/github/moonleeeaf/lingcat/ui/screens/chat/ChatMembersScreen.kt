package io.github.moonleeeaf.lingcat.ui.screens.chat

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.clickable
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AdminPanelSettings
import androidx.compose.material.icons.filled.PersonRemove
import androidx.compose.material.icons.filled.RemoveModerator
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.Group
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.ui.asString
import io.github.moonleeeaf.lingcat.ui.components.EmptyState
import io.github.moonleeeaf.lingcat.ui.components.ErrorState
import io.github.moonleeeaf.lingcat.ui.components.LingCatActionItem
import io.github.moonleeeaf.lingcat.ui.components.LingCatAvatar
import io.github.moonleeeaf.lingcat.ui.components.LoadingState
import io.github.moonleeeaf.lingcat.ui.rememberUserDisplayName

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

    var selectedUserId by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(chatId) {
        viewModel.init(chatId)
    }

    var selectedUserForAction by remember { mutableStateOf<MemberUiModel?>(null) }

    // ★ 新增：二次确认状态
    var userToConfirmRemoveMember by remember { mutableStateOf<lingcat.classes.Classes.IUser?>(null) }
    var userToConfirmAddAdmin by remember { mutableStateOf<lingcat.classes.Classes.IUser?>(null) }
    var userToConfirmRemoveAdmin by remember { mutableStateOf<lingcat.classes.Classes.IUser?>(null) }

    Scaffold(
        topBar = {
            Column {
                TopAppBar(
                    title = { Text(stringResource(R.string.chat_members_title)) },
                    navigationIcon = {
                        IconButton(onClick = onBack) {
                            Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.action_back))
                        }
                    }
                )
                // 搜索框
                OutlinedTextField(
                    value = uiState.searchQuery,
                    onValueChange = viewModel::onSearchQueryChange,
                    placeholder = { Text(stringResource(R.string.chat_members_search_hint)) },
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
                LoadingState(
                    modifier = Modifier.align(Alignment.Center),
                    label = stringResource(R.string.chat_members_loading),
                )
            } else if (uiState.errorMsg != null) {
                ErrorState(
                    message = uiState.errorMsg!!.asString(),
                    onRetry = { viewModel.init(chatId) },
                    modifier = Modifier.align(Alignment.Center),
                )
            } else if (uiState.owner.isEmpty() && uiState.admins.isEmpty() && uiState.members.isEmpty()) {
                EmptyState(
                    title = stringResource(R.string.chat_members_empty_title),
                    description = stringResource(R.string.chat_members_empty_desc),
                    icon = Icons.Outlined.Group,
                    modifier = Modifier.align(Alignment.Center),
                )
            } else {
                LazyColumn(modifier = Modifier.fillMaxSize()) {
                    // 群主组
                    if (uiState.owner.isNotEmpty()) {
                        stickyHeader { MemberGroupHeader(stringResource(R.string.label_owner)) }
                        items(uiState.owner, key = { it.user.id }) { model ->
                            // ★ 修复 2：传入点击回调
                            MemberItem(
                                model = model,
                                onClick = { selectedUserId = it },
                                onLongClick = { selectedUserForAction = model }, // ★
                            )
                        }
                    }

                    // 管理员组
                    if (uiState.admins.isNotEmpty()) {
                        stickyHeader { MemberGroupHeader(stringResource(R.string.chat_members_group_admin)) }
                        items(uiState.admins, key = { it.user.id }) { model ->
                            MemberItem(
                                model = model,
                                onClick = { selectedUserId = it },
                                onLongClick = { selectedUserForAction = model }, // ★
                            )
                        }
                    }

                    // 普通成员组
                    if (uiState.members.isNotEmpty()) {
                        stickyHeader { MemberGroupHeader(stringResource(R.string.chat_members_group_members, uiState.members.size)) }
                        items(uiState.members, key = { it.user.id }) { model ->
                            MemberItem(
                                model = model,
                                onClick = { selectedUserId = it },
                                onLongClick = { selectedUserForAction = model }, // ★
                            )
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

    // ==========================================
    // 二次确认弹窗组
    // ==========================================

    if (userToConfirmRemoveMember != null) {
        val user = userToConfirmRemoveMember!!
        val displayName = rememberUserDisplayName(user)
        AlertDialog(
            onDismissRequest = { userToConfirmRemoveMember = null },
            title = { Text(stringResource(R.string.chat_members_remove_title)) },
            text = { Text(stringResource(R.string.chat_members_remove_message, displayName)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.removeMember(chatId, user)
                        userToConfirmRemoveMember = null
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) { Text(stringResource(R.string.action_confirm)) }
            },
            dismissButton = {
                TextButton(onClick = { userToConfirmRemoveMember = null }) { Text(stringResource(R.string.action_cancel)) }
            }
        )
    }

    if (userToConfirmAddAdmin != null) {
        val user = userToConfirmAddAdmin!!
        val displayName = rememberUserDisplayName(user)
        AlertDialog(
            onDismissRequest = { userToConfirmAddAdmin = null },
            title = { Text(stringResource(R.string.chat_members_set_admin)) },
            text = { Text(stringResource(R.string.chat_members_set_admin_message, displayName)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.addAdmin(chatId, user)
                        userToConfirmAddAdmin = null
                    }
                ) { Text(stringResource(R.string.action_confirm)) }
            },
            dismissButton = {
                TextButton(onClick = { userToConfirmAddAdmin = null }) { Text(stringResource(R.string.action_cancel)) }
            }
        )
    }

    if (userToConfirmRemoveAdmin != null) {
        val user = userToConfirmRemoveAdmin!!
        val displayName = rememberUserDisplayName(user)
        AlertDialog(
            onDismissRequest = { userToConfirmRemoveAdmin = null },
            title = { Text(stringResource(R.string.chat_members_remove_admin)) },
            text = { Text(stringResource(R.string.chat_members_remove_admin_message, displayName)) },
            confirmButton = {
                TextButton(
                    onClick = {
                        viewModel.removeAdmin(chatId, user)
                        userToConfirmRemoveAdmin = null
                    }
                ) { Text(stringResource(R.string.action_confirm)) }
            },
            dismissButton = {
                TextButton(onClick = { userToConfirmRemoveAdmin = null }) { Text(stringResource(R.string.action_cancel)) }
            }
        )
    }

    if (selectedUserForAction != null) {
        val target = selectedUserForAction!!
        val targetUser = target.user
        val targetRole = target.role
        val myRole = uiState.myRole

        val canRemoveMember = myRole == "owner" || (myRole == "admin" && targetRole == "member")
        val canAddAdmin = myRole == "owner" && targetRole == "member"
        val canRemoveAdmin = myRole == "owner" && targetRole == "admin"
        val targetDisplayName = rememberUserDisplayName(targetUser)

        ModalBottomSheet(
            onDismissRequest = { selectedUserForAction = null }
        ) {
            Column(modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp)) {
                Text(
                    text = targetDisplayName,
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.padding(16.dp)
                )

                if (canAddAdmin) {
                    LingCatActionItem(
                        icon = Icons.Default.AdminPanelSettings,
                        title = stringResource(R.string.chat_members_set_admin),
                        onClick = {
                            // ★ 改为触发确认弹窗
                            userToConfirmAddAdmin = targetUser
                            selectedUserForAction = null
                        }
                    )
                }

                if (canRemoveAdmin) {
                    LingCatActionItem(
                        icon = Icons.Default.RemoveModerator,
                        title = stringResource(R.string.chat_members_remove_admin_action),
                        onClick = {
                            // ★ 改为触发确认弹窗
                            userToConfirmRemoveAdmin = targetUser
                            selectedUserForAction = null
                        }
                    )
                }

                if (canRemoveMember && targetRole != "owner") {
                    LingCatActionItem(
                        icon = Icons.Default.PersonRemove,
                        title = stringResource(R.string.chat_members_remove_title),
                        iconTint = MaterialTheme.colorScheme.error,
                        textColor = MaterialTheme.colorScheme.error,
                        onClick = {
                            // ★ 改为触发确认弹窗
                            userToConfirmRemoveMember = targetUser
                            selectedUserForAction = null
                        }
                    )
                }
            }
        }
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
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun MemberItem(
    model: MemberUiModel,
    onClick: (String) -> Unit,
    onLongClick: () -> Unit,
) {
    val user = model.user

    val displayName = rememberUserDisplayName(user)

    ListItem(
        headlineContent = {
            Text(displayName)
        },
        // 标题已经用了备注 / 昵称时，再用 @username 补齐真实账号，避免两人备注相同分不清。
        supportingContent = if (user.username.isNotEmpty() && displayName != user.username) {
            { Text("@${user.username}", style = MaterialTheme.typography.bodySmall) }
        } else null,
        leadingContent = {
            LingCatAvatar(
                avatarHash = user.avatarFileHash,
                size = 40.dp,
            )
        },
        trailingContent = if (model.role != "member") {
            {
                Text(
                    text = stringResource(model.roleLabelRes),
                    style = MaterialTheme.typography.labelSmall,
                    // 群主用 tertiary 而不是 error：红色在这套配色里代表危险操作，
                    // 群主身份只是“级别更高”，不该看起来像错误。
                    color = if (model.role == "owner") {
                        MaterialTheme.colorScheme.tertiary
                    } else {
                        MaterialTheme.colorScheme.primary
                    },
                    fontWeight = FontWeight.Bold
                )
            }
        } else null,
        modifier = Modifier.combinedClickable(
            onClick = { onClick(user.id) },
            onLongClick = onLongClick
        )
    )
}