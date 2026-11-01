package io.github.moonleeeaf.lingcat.ui.screens.chat

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.e2e.E2EInfoDialog
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.components.ImageViewerDialog

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
    val context = LocalContext.current
    val fileToken by LingCatClientManager.fileAccessToken.collectAsState()

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
                val avatarHash = chat.avatarFileHash
                val avatarUrl = if (!avatarHash.isNullOrEmpty() && !fileToken.isNullOrEmpty()) {
                    LingCatClientManager.currentClient?.getFileUrlByHashAndToken(avatarHash, fileToken ?: "")
                } else null

                // 如果是私聊且群头像为空，尝试用对方头像
                val peerUser = if (chat.type == "private" && chat.hasPeerUserId()) ProfileCache.getCachedUser(chat.peerUserId) else null
                val finalAvatarUrl = avatarUrl ?: peerUser?.avatarFileHash?.let {
                    if (!fileToken.isNullOrEmpty()) LingCatClientManager.currentClient?.getFileUrlByHashAndToken(it, fileToken ?: "") else null
                }
                val finalTitle = if (chat.title.isNotEmpty()) chat.title else (peerUser?.nickname ?: peerUser?.username ?: "对话")

                Column(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    if (finalAvatarUrl != null) {
                        AsyncImage(
                            model = coil.request.ImageRequest.Builder(context)
                                .data(finalAvatarUrl)
                                .memoryCacheKey(avatarHash ?: peerUser?.avatarFileHash)
                                .build(),
                            contentDescription = "头像",
                            modifier = Modifier.size(80.dp).clip(CircleShape).clickable { previewImageUrl = finalAvatarUrl },
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
                        text = finalTitle,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = if (chat.type == "group") "群聊" else "私聊",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                HorizontalDivider(color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))

                // ==========================================
                // 2. 信息列表
                // ==========================================
                // 对话 ID
                ChatInfoItem(
                    icon = Icons.Default.Info,
                    title = chat.id,
                    subtitle = "对话 ID",
                    onClick = {
                        clipboardManager.setText(AnnotatedString(chat.id))
                        // 弹 Toast
                    }
                )

                // 标识符 (如果有)
                if (chat.hasChatUnique() && chat.chatUnique.isNotEmpty()) {
                    ChatInfoItem(
                        icon = Icons.Default.AlternateEmail,
                        title = chat.chatUnique,
                        subtitle = "对话标识符",
                        onClick = {
                            clipboardManager.setText(AnnotatedString(chat.chatUnique))
                        }
                    )
                }

                // 描述 (如果有)
                if (chat.hasDescription() && chat.description.isNotEmpty()) {
                    ChatInfoItem(
                        icon = Icons.Default.Description,
                        title = chat.description,
                        subtitle = "简介",
                        onClick = {
                            clipboardManager.setText(AnnotatedString(chat.description))
                        }
                    )
                }

                if (chat.type == "group") {
                    ChatInfoItem(
                        icon = Icons.Default.Group,
                        title = "对话成员",
                        subtitle = null,
                        onClick = {
                            onDismiss() // 先关闭面板
                            onOpenMembers() // 触发跳转
                        }
                    )
                }

                // 用户信息 (私聊)
                if (chat.type == "private" && chat.hasPeerUserId()) {
                    ChatInfoItem(
                        icon = Icons.Default.Person,
                        title = "用户信息",
                        subtitle = null,
                        onClick = {
                            onDismiss() // 先关掉当前对话信息面板
                            onOpenUserProfile(chat.peerUserId) // ★ 触发打开用户资料
                        }
                    )
                }

                // 端到端加密 (私聊)
                if (chat.type == "private") {
                    ChatInfoItem(
                        icon = Icons.Default.Lock,
                        title = "端到端加密信息",
                        subtitle = null,
                        onClick = { showE2EInfo = true }
                    )
                }

                // 收藏 / 取消收藏
                ChatInfoItem(
                    icon = if (uiState.isFavourite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                    title = if (uiState.isFavourite) "取消收藏" else "收藏对话",
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

// 封装一个优雅的列表项，带圆角点击效果
@Composable
fun ChatInfoItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    subtitle: String?,
    iconTint: Color = MaterialTheme.colorScheme.onSurfaceVariant,
    textColor: Color = MaterialTheme.colorScheme.onSurface,
    onClick: () -> Unit
) {
    ListItem(
        headlineContent = {
            Text(
                text = title,
                color = textColor,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        },
        supportingContent = if (subtitle != null) {
            { Text(subtitle, style = MaterialTheme.typography.labelSmall) }
        } else null,
        leadingContent = { Icon(icon, contentDescription = null, tint = iconTint) },
        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
        modifier = Modifier
            .clip(RoundedCornerShape(12.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 8.dp)
    )
}