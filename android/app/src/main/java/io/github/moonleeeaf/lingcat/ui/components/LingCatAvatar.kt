package io.github.moonleeeaf.lingcat.ui.components

import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import coil.compose.AsyncImage
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.net.LingCatClientManager

/**
 * 统一解析头像 URL。
 *
 * 头像的缓存键永远使用文件 Hash（而不是带 token 的 URL），
 * 这样 token 轮换时不会把整份头像缓存全部击穿。
 */
@Composable
fun rememberAvatarUrl(avatarHash: String?): String? {
    val fileToken by LingCatClientManager.fileAccessToken.collectAsStateWithLifecycle()
    return remember(avatarHash, fileToken) {
        val token = fileToken
        if (!avatarHash.isNullOrEmpty() && !token.isNullOrEmpty()) {
            LingCatClientManager.currentClient?.getFileUrlByHashAndToken(avatarHash, token)
        } else {
            null
        }
    }
}

/**
 * 全局统一的头像组件。
 *
 * - 视觉尺寸由 [size] 决定；
 * - 如果头像可点击，会自动把触控区域扩展到至少 48dp；
 * - 所有页面共用同一套 Coil 缓存策略和默认头像。
 */
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun LingCatAvatar(
    avatarHash: String?,
    modifier: Modifier = Modifier,
    size: Dp = 40.dp,
    contentDescription: String? = null,
    onClick: (() -> Unit)? = null,
    onLongClick: (() -> Unit)? = null,
) {
    val context = LocalContext.current
    val avatarUrl = rememberAvatarUrl(avatarHash)

    val hasAction = onClick != null || onLongClick != null
    val touchSize = if (hasAction) maxOf(size, 48.dp) else size
    val actionModifier = if (hasAction) {
        Modifier.combinedClickable(
            onClick = { onClick?.invoke() },
            onLongClick = { onLongClick?.invoke() },
        )
    } else {
        Modifier
    }

    Box(
        modifier = modifier
            .size(touchSize)
            .then(actionModifier),
        contentAlignment = Alignment.Center,
    ) {
        if (avatarUrl != null) {
            AsyncImage(
                model = coil.request.ImageRequest.Builder(context)
                    .data(avatarUrl)
                    .memoryCacheKey(avatarHash)
                    .diskCacheKey(avatarHash)
                    .crossfade(true)
                    .build(),
                contentDescription = contentDescription,
                modifier = Modifier
                    .size(size)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop,
                placeholder = painterResource(id = R.drawable.ic_default_avatar),
                error = painterResource(id = R.drawable.ic_default_avatar),
            )
        } else {
            Image(
                painter = painterResource(id = R.drawable.ic_default_avatar),
                contentDescription = contentDescription,
                modifier = Modifier
                    .size(size)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop,
            )
        }
    }
}
