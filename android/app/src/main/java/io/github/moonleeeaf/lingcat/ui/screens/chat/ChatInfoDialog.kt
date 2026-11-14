package io.github.moonleeeaf.lingcat.ui.screens.chat

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
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
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.e2e.E2EInfoDialog
import io.github.moonleeeaf.lingcat.ui.Feedback
import io.github.moonleeeaf.lingcat.ui.components.ImageViewerDialog
import io.github.moonleeeaf.lingcat.ui.components.LingCatActionItem
import io.github.moonleeeaf.lingcat.ui.components.LingCatAvatar

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatInfoDialog(
    chatId: String,
    onDismiss: () -> Unit,
    onOpenMembers: () -> Unit,
    onOpenUserProfile: (String) -> Unit, // ★ 新增：打开用户资料的回调
    viewModel: ChatInfoViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val clipboardManager = LocalClipboardManager.current

    var showE2EInfo by remember { mutableStateOf(false) }

    LaunchedEffect(chatId) {
        viewModel.init(chatId)
    }

    val chat = uiState.chat

    var previewImageUrl by remember { mutableStateOf<String?>(null) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        dragHandle = { BottomSheetDefaults.DragHandle() }
    ) {
        if (uiState.isLoading && chat == null) {
            Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (chat != null) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp)
            ) {
                // ==========================================
                // 1. 头部：头像、名称、类型
                // ==========================================
                // 如果是私聊且群头像为空，尝试用对方头像
                val peerUser = if (chat.type == "private" && chat.hasPeerUserId()) ProfileCache.getCachedUser(chat.peerUserId) else null
                val finalAvatarHash = chat.avatarFileHash?.takeIf { it.isNotEmpty() } ?: peerUser?.avatarFileHash
                val finalTitle = if (chat.title.isNotEmpty()) chat.title else (peerUser?.nickname ?: peerUser?.username ?: stringResource(R.string.label_chat))
                val finalAvatarUrl = io.github.moonleeeaf.lingcat.ui.components.rememberAvatarUrl(finalAvatarHash)

                Column(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    LingCatAvatar(
                        avatarHash = finalAvatarHash,
                        size = 80.dp,
                        contentDescription = stringResource(R.string.label_avatar),
                        onClick = { previewImageUrl = finalAvatarUrl },
                    )
                    Spacer(Modifier.height(12.dp))
                    Text(
                        text = finalTitle,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (chat.type == "group") stringResource(R.string.label_group) else stringResource(R.string.label_private_chat),
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))

                // ==========================================
                // 2. 信息列表
                // ==========================================
                // 对话 ID
                LingCatActionItem(
                    icon = Icons.Default.Info,
                    title = chat.id,
                    subtitle = stringResource(R.string.label_chat_id),
                    onClick = {
                        clipboardManager.setText(AnnotatedString(chat.id))
                        Feedback.show(R.string.chat_info_copied_id)
                    }
                )

                // 标识符 (如果有)
                if (chat.hasChatUnique() && chat.chatUnique.isNotEmpty()) {
                    LingCatActionItem(
                        icon = Icons.Default.AlternateEmail,
                        title = chat.chatUnique,
                        subtitle = stringResource(R.string.chat_info_unique),
                        onClick = {
                            clipboardManager.setText(AnnotatedString(chat.chatUnique))
                            Feedback.show(R.string.chat_info_copied_unique)
                        }
                    )
                }

                // 描述 (如果有)
                if (chat.hasDescription() && chat.description.isNotEmpty()) {
                    LingCatActionItem(
                        icon = Icons.Default.Description,
                        title = chat.description,
                        subtitle = stringResource(R.string.label_description),
                        onClick = {
                            clipboardManager.setText(AnnotatedString(chat.description))
                            Feedback.show(R.string.chat_info_copied_description)
                        }
                    )
                }

                if (chat.type == "group") {
                    LingCatActionItem(
                        icon = Icons.Default.Group,
                        title = stringResource(R.string.chat_members_title),
                        subtitle = null,
                        onClick = {
                            onDismiss() // 先关闭面板
                            onOpenMembers() // 触发跳转
                        }
                    )
                }

                // 用户信息 (私聊)
                if (chat.type == "private" && chat.hasPeerUserId()) {
                    LingCatActionItem(
                        icon = Icons.Default.Person,
                        title = stringResource(R.string.chat_info_user_info),
                        subtitle = null,
                        onClick = {
                            onDismiss() // 先关掉当前对话信息面板
                            onOpenUserProfile(chat.peerUserId) // ★ 触发打开用户资料
                        }
                    )
                }

                // 端到端加密 (私聊)
                if (chat.type == "private") {
                    LingCatActionItem(
                        icon = Icons.Default.Lock,
                        title = stringResource(R.string.chat_info_e2e),
                        subtitle = null,
                        onClick = { showE2EInfo = true }
                    )
                }

                // 收藏 / 取消收藏
                LingCatActionItem(
                    icon = if (uiState.isFavourite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                    title = if (uiState.isFavourite) stringResource(R.string.chat_info_unfavorite) else stringResource(R.string.chat_info_favorite),
                    subtitle = null,
                    onClick = { viewModel.toggleFavourite() }
                )
            }
        }
    }

    if (showE2EInfo) {
        E2EInfoDialog(
            peerUserId = chat?.peerUserId,
            onDismiss = { showE2EInfo = false }
        )
    }

    ImageViewerDialog(
        imageUrl = previewImageUrl,
        onDismiss = { previewImageUrl = null }
    )
}
