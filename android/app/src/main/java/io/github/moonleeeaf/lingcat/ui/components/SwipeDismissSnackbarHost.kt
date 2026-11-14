package io.github.moonleeeaf.lingcat.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.draggable
import androidx.compose.foundation.gestures.rememberDraggableState
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.offset
import androidx.compose.material3.Snackbar
import androidx.compose.material3.SnackbarData
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import kotlinx.coroutines.launch
import kotlin.math.abs
import kotlin.math.roundToInt

/** 拖动超过这个距离（或甩动速度足够快）就关闭 Snackbar */
private val DISMISS_THRESHOLD = 72.dp
private const val DISMISS_VELOCITY = 1200f

/**
 * 支持左右滑动关闭的 SnackbarHost。
 *
 * Material3 默认的 SnackbarHost 只能等自动关闭或点操作按钮。这里在默认 Snackbar 外面
 * 包一层水平 draggable：拖动跟手、松手后回弹；超过阈值（或快速甩动）则直接 dismiss。
 */
@Composable
fun SwipeDismissSnackbarHost(
    hostState: SnackbarHostState,
    modifier: Modifier = Modifier,
) {
    SnackbarHost(hostState = hostState, modifier = modifier) { data ->
        SwipeDismissSnackbar(data)
    }
}

@Composable
private fun SwipeDismissSnackbar(data: SnackbarData) {
    val scope = rememberCoroutineScope()
    val offsetX = remember { Animatable(0f) }
    val threshold = with(LocalDensity.current) { DISMISS_THRESHOLD.toPx() }

    Box(
        modifier = Modifier
            .offset { IntOffset(offsetX.value.roundToInt(), 0) }
            .graphicsLayer {
                // 拖动时轻微变淡，给出“正在被移除”的反馈
                alpha = 1f - (abs(offsetX.value) / (threshold * 3f)).coerceIn(0f, 0.45f)
            }
            .draggable(
                orientation = Orientation.Horizontal,
                state = rememberDraggableState { delta ->
                    scope.launch { offsetX.snapTo(offsetX.value + delta) }
                },
                onDragStopped = { velocity ->
                    if (abs(offsetX.value) >= threshold || abs(velocity) >= DISMISS_VELOCITY) {
                        data.dismiss()
                    } else {
                        offsetX.animateTo(
                            targetValue = 0f,
                            animationSpec = spring(
                                dampingRatio = Spring.DampingRatioMediumBouncy,
                                stiffness = Spring.StiffnessMedium,
                            ),
                        )
                    }
                },
            ),
    ) {
        Snackbar(data)
    }
}
