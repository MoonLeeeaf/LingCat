package io.github.moonleeeaf.lingcat.ui.utils

import androidx.compose.foundation.gestures.awaitEachGesture
import androidx.compose.foundation.gestures.awaitFirstDown
import androidx.compose.foundation.gestures.calculatePan
import androidx.compose.foundation.gestures.calculateZoom
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.unit.IntSize

@Composable
fun ZoomableBox(
    modifier: Modifier = Modifier,
    onSingleTap: (() -> Unit)? = null,
    content: @Composable BoxScope.() -> Unit
) {
    var scale by remember { mutableStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    var containerSize by remember { mutableStateOf(IntSize.Zero) }

    // 边界限制
    fun clampOffset(newOffset: Offset, currentScale: Float): Offset {
        if (currentScale <= 1f) return Offset.Zero
        val maxX = (containerSize.width * currentScale - containerSize.width) / 2f
        val maxY = (containerSize.height * currentScale - containerSize.height) / 2f
        return Offset(
            x = newOffset.x.coerceIn(-maxX, maxX),
            y = newOffset.y.coerceIn(-maxY, maxY)
        )
    }

    Box(
        modifier = modifier
            .onSizeChanged { containerSize = it }
            .pointerInput(Unit) {
                awaitEachGesture {
                    val down = awaitFirstDown(requireUnconsumed = false)
                    var isTransforming = false

                    do {
                        val event = awaitPointerEvent()
                        // 检测是否为多指或明显的滑动
                        val isMultiTouch = event.changes.size > 1
                        val pan = event.calculatePan()

                        if (isMultiTouch || pan.getDistance() > 5f) {
                            isTransforming = true
                        }

                        if (isTransforming) {
                            val zoom = event.calculateZoom()
                            val newScale = (scale * zoom).coerceIn(1f, 5f)
                            val newOffset = if (newScale > 1f) offset + pan else Offset.Zero

                            if (newScale != scale || newOffset != offset) {
                                scale = newScale
                                offset = clampOffset(newOffset, newScale)
                            }
                            // ★ 核心：消费掉事件，不让底下的 View 响应任何滑动
                            event.changes.forEach { if (it.pressed) it.consume() }
                        }
                    } while (event.changes.any { it.pressed })

                    // 判断为单纯的点击（没有发生拖拽/缩放）
                    if (!isTransforming && down.pressed) {
                        if (scale > 1f) {
                            // 放大状态下，单击复位
                            scale = 1f
                            offset = Offset.Zero
                        } else {
                            // 正常状态，触发单击回调（退出全屏）
                            onSingleTap?.invoke()
                        }
                    }
                }
            }
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                // 注意：这里没有加 clickable，只应用形变
                .graphicsLayer(
                    scaleX = scale,
                    scaleY = scale,
                    translationX = offset.x,
                    translationY = offset.y
                ),
            contentAlignment = Alignment.Center
        ) {
            content()
        }
    }
}