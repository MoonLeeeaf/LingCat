package io.github.moonleeeaf.lingcat.ui.screens.chat

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Chat
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.components.ImageViewerDialog

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
    val context = LocalContext.current
    val fileToken by LingCatClientManager.fileAccessToken.collectAsState()

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
        if (uiState.isLoading && user == null) {
            Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (user != null) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // 1. 头部资料区
                val avatarHash = user.avatarFileHash
                val avatarUrl = if (!avatarHash.isNullOrEmpty() && !fileToken.isNullOrEmpty()) {
                    LingCatClientManager.currentClient?.getFileUrlByHashAndToken(avatarHash, fileToken ?: "")
                } else null

                // 显示优先级：备注 > 昵称 > 用户名 > ID
                val displayName = uiState.remark ?: user.nickname.ifEmpty { user.username.ifEmpty { user.id } }

                if (avatarUrl != null) {
                    AsyncImage(
                        model = coil.request.ImageRequest.Builder(context)
                            .data(avatarUrl)
                            .memoryCacheKey(avatarHash)
                            .build(),
                        contentDescription = "头像",
                        modifier = Modifier.size(80.dp).clip(CircleShape).clickable { previewImageUrl = avatarUrl },
                        contentScale = ContentScale.Crop
                    )
                } else {
                    androidx.compose.foundation.Image(
                        painter = painterResource(id = R.drawable.ic_default_avatar),
                        contentDescription = "默认头像",
                        modifier = Modifier.size(80.dp).clip(CircleShape)
                    )
                }

                Spacer(Modifier.height(12.dp))
                Text(
                    text = displayName,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold
                )

                if (uiState.remark != null && user.nickname.isNotEmpty()) {
                    Text(
                        text = "原昵称: ${user.nickname}",
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
                ProfileActionItem(
                    icon = Icons.Default.Info,
                    title = user.id,
                    subtitle = "用户 ID",
                    onClick = { clipboardManager.setText(AnnotatedString(user.id)) }
                )

                if (user.hasDescription() && user.description.isNotEmpty()) {
                    ChatInfoItem(
                        icon = Icons.Default.Description,
                        title = user.description,
                        subtitle = "简介",
                        onClick = {
                            clipboardManager.setText(AnnotatedString(user.description))
                        }
                    )
                }

                // 修改备注 (只能给别人改)
                if (!isMyself) {
                    ProfileActionItem(
                        icon = Icons.Default.Edit,
                        title = if (uiState.remark != null) "修改备注" else "添加备注",
                        subtitle = "仅自己可见",
                        onClick = { showRemarkDialog = true }
                    )
                }

                // 发起私聊 (如果不在当前聊天，且不是自己)
                ProfileActionItem(
                    icon = Icons.AutoMirrored.Filled.Chat,
                    title = "打开对话",
                    subtitle = null,
                    onClick = {
                        viewModel.startPrivateChat { newChatId ->
                            onDismiss()
                            onNavigateToChat(newChatId)
                        }
                    }
                )

                // 提及 (如果是从聊天界面打开，且不是自己)
                if (!isMyself && chatId != null) {
                    ProfileActionItem(
                        icon = Icons.Default.AlternateEmail,
                        title = "提及",
                        subtitle = null,
                        onClick = {
                            val name = uiState.remark ?: user.username.ifEmpty { user.nickname }
                            onMention(name)
                            onDismiss()
                        }
                    )
                }
            }
        }
    }

    // 修改备注弹窗
    if (showRemarkDialog) {
        var inputRemark by remember { mutableStateOf(uiState.remark ?: "") }
        AlertDialog(
            onDismissRequest = { showRemarkDialog = false },
            title = { Text("设置备注") },
            text = {
                OutlinedTextField(
                    value = inputRemark,
                    onValueChange = { inputRemark = it },
                    label = { Text("备注名") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.saveRemark(inputRemark)
                    showRemarkDialog = false
                }) { Text("保存") }
            },
            dismissButton = {
                TextButton(onClick = { showRemarkDialog = false }) { Text("取消") }
            }
        )
    }

    ImageViewerDialog(
        imageUrl = previewImageUrl,
        onDismiss = { previewImageUrl = null }
    )
}

@Composable
fun ProfileActionItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String?,
    onClick: () -> Unit
) {
    ListItem(
        headlineContent = { Text(title) },
        supportingContent = if (subtitle != null) {
            { Text(subtitle, style = MaterialTheme.typography.labelSmall) }
        } else null,
        leadingContent = { Icon(icon, contentDescription = null) },
        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 8.dp)
    )
}