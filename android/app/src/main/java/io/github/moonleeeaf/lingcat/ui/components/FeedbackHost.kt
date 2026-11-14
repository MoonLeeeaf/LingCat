package io.github.moonleeeaf.lingcat.ui.components

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import io.github.moonleeeaf.lingcat.ui.Feedback

/**
 * 在弹窗自己的 Window 里展示全局反馈（Snackbar）。
 *
 * `Dialog` / `ModalBottomSheet` 都会创建独立 Window，Activity 里那套全局 Snackbar 会被
 * 弹窗的遮罩层挡住，看起来像“没有任何提示”。把本组件放进弹窗内容里即可：
 *
 * ```kotlin
 * Dialog(onDismissRequest = onDismiss) {
 *     Box {
 *         // 弹窗内容
 *         FeedbackHost(Modifier.align(Alignment.BottomCenter))
 *     }
 * }
 * ```
 *
 * 注册期间全局 Snackbar 会自动让位，避免同一条提示出现在两个 Window 里。
 */
@Composable
fun FeedbackHost(modifier: Modifier = Modifier) {
    val hostState = remember { SnackbarHostState() }

    DisposableEffect(Unit) {
        val unregister = Feedback.registerModalHost()
        onDispose { unregister() }
    }

    LaunchedEffect(Unit) {
        Feedback.events.collect { hostState.showSnackbar(it) }
    }

    SwipeDismissSnackbarHost(
        hostState = hostState,
        modifier = modifier.padding(horizontal = 16.dp, vertical = 12.dp),
    )
}
