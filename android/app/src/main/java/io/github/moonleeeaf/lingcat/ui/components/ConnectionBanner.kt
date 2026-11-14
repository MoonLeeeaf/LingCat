package io.github.moonleeeaf.lingcat.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.Sync
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import io.github.moonleeeaf.lingcat.R
import lingcat.client_protocol.LingCatClient

/**
 * 全局网络连接状态提示条。
 *
 * - CONNECTING / RECONNECTING：使用 secondaryContainer，明确是“进行中”而不是普通文字
 * - DISCONNECTED：使用 error，并提供“重试”按钮
 *
 * 由 AppRouter 统一挂在 NavHost 之上，任何页面都能看到。
 */
@Composable
fun ConnectionStateBanner(
    state: LingCatClient.ConnectionState,
    errorMessage: String?,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier,
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
        modifier = modifier
            .fillMaxWidth()
            .background(background)
            .padding(horizontal = 16.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
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
                text = if (isDisconnected) {
                    stringResource(R.string.chat_list_disconnected)
                } else {
                    stringResource(R.string.chat_list_reconnecting)
                },
                color = contentColor,
                style = MaterialTheme.typography.bodyMedium,
            )
            if (!errorMessage.isNullOrBlank()) {
                Text(
                    text = errorMessage,
                    color = contentColor.copy(alpha = 0.85f),
                    style = MaterialTheme.typography.bodySmall,
                    maxLines = 3,
                    overflow = TextOverflow.Ellipsis,
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
