package io.github.moonleeeaf.lingcat.ui.screens.chat

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.Feedback
import io.github.moonleeeaf.lingcat.ui.components.ErrorState
import io.github.moonleeeaf.lingcat.ui.components.ImageViewerDialog
import io.github.moonleeeaf.lingcat.ui.components.LingCatActionItem
import io.github.moonleeeaf.lingcat.ui.components.LingCatAvatar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UserProfileDialog(
    userId: String,
    chatId: String? = null, // 如果是从聊天界面打开，用于提及
    onDismiss: () -> Unit,
    onNavigateToChat: (String) -> Unit = {}, // 发起私聊的回调
    onMention: (String) -> Unit = {}, // 提及的回调
    viewModel: UserProfileViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val clipboardManager = LocalClipboardManager.current

    var showRemarkDialog by remember { mutableStateOf(false) }

    LaunchedEffect(userId) {
        viewModel.init(userId)
    }

    val user = uiState.user
    val isMyself = userId == LingCatClientManager.currentUserId

    var previewImageUrl by remember { mutableStateOf<String?>(null) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        dragHandle = { BottomSheetDefaults.DragHandle() }
    ) {
        if (user != null) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // 1. 头部资料区
                // 显示优先级：备注 > 昵称 > 用户名 > ID
                val displayName = uiState.remark ?: user.nickname.ifEmpty { user.username.ifEmpty { user.id } }
                val avatarUrl = io.github.moonleeeaf.lingcat.ui.components.rememberAvatarUrl(user.avatarFileHash)

                LingCatAvatar(
                    avatarHash = user.avatarFileHash,
                    size = 80.dp,
                    contentDescription = stringResource(R.string.label_avatar),
                    onClick = { previewImageUrl = avatarUrl },
                )

                Spacer(Modifier.height(12.dp))
                Text(
                    text = displayName,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )

                if (uiState.remark != null && user.nickname.isNotEmpty()) {
                    Text(
                        text = stringResource(R.string.profile_original_nickname, user.nickname),
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                Text(
                    text = "@${user.username}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.primary
                )

                Spacer(Modifier.height(24.dp))
                HorizontalDivider(color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))

                // 2. 操作列表
                // ID 复制
                LingCatActionItem(
                    icon = Icons.Default.Info,
                    title = user.id,
                    subtitle = stringResource(R.string.label_user_id),
                    onClick = {
                        clipboardManager.setText(AnnotatedString(user.id))
                        Feedback.show(R.string.profile_copied_id)
                    }
                )

                if (user.hasDescription() && user.description.isNotEmpty()) {
                    LingCatActionItem(
                        icon = Icons.Default.Description,
                        title = user.description,
                        subtitle = stringResource(R.string.label_description),
                        onClick = {
                            clipboardManager.setText(AnnotatedString(user.description))
                            Feedback.show(R.string.chat_info_copied_description)
                        }
                    )
                }

                // 修改备注 (只能给别人改)
                if (!isMyself) {
                    LingCatActionItem(
                        icon = Icons.Default.Edit,
                        title = if (uiState.remark != null) stringResource(R.string.profile_edit_remark) else stringResource(R.string.profile_add_remark),
                        subtitle = stringResource(R.string.profile_remark_private),
                        onClick = { showRemarkDialog = true }
                    )
                }

                // 发起私聊（不能对自己发起私聊）
                if (!isMyself) {
                    LingCatActionItem(
                        icon = Icons.AutoMirrored.Filled.Chat,
                        title = stringResource(R.string.profile_open_chat),
                        subtitle = null,
                        onClick = {
                            viewModel.startPrivateChat { newChatId ->
                                onDismiss()
                                onNavigateToChat(newChatId)
                            }
                        }
                    )
                }

                // 提及 (如果是从聊天界面打开，且不是自己)
                if (!isMyself && chatId != null) {
                    LingCatActionItem(
                        icon = Icons.Default.AlternateEmail,
                        title = stringResource(R.string.profile_mention),
                        subtitle = null,
                        onClick = {
                            val name = uiState.remark ?: user.nickname.ifEmpty { user.username }
                            onMention(name)
                            onDismiss()
                        }
                    )
                }
            }
        } else if (uiState.isLoading) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(32.dp),
                contentAlignment = Alignment.Center,
            ) {
                CircularProgressIndicator()
            }
        } else {
            // 拿不到资料时（网络异常 / 用户不存在）必须给明确的「重试」入口。
            ErrorState(
                message = stringResource(R.string.profile_load_failed),
                onRetry = viewModel::retry,
                modifier = Modifier.padding(bottom = 24.dp),
            )
        }
    }

    // 修改备注弹窗
    if (showRemarkDialog) {
        var inputRemark by remember { mutableStateOf(uiState.remark ?: "") }
        AlertDialog(
            onDismissRequest = { showRemarkDialog = false },
            title = { Text(stringResource(R.string.profile_remark_title)) },
            text = {
                OutlinedTextField(
                    value = inputRemark,
                    onValueChange = { inputRemark = it },
                    label = { Text(stringResource(R.string.profile_remark_label)) },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.saveRemark(inputRemark)
                    showRemarkDialog = false
                }) { Text(stringResource(R.string.action_save)) }
            },
            dismissButton = {
                TextButton(onClick = { showRemarkDialog = false }) { Text(stringResource(R.string.action_cancel)) }
            }
        )
    }

    ImageViewerDialog(
        imageUrl = previewImageUrl,
        onDismiss = { previewImageUrl = null }
    )
}
