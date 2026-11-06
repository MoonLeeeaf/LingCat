package io.github.moonleeeaf.lingcat.ui.screens.chat.meeting

import androidx.compose.runtime.Composable
import androidx.compose.ui.ExperimentalComposeUiApi
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import io.livekit.android.renderer.SurfaceViewRenderer
import io.livekit.android.room.track.VideoTrack
import androidx.compose.ui.input.pointer.pointerInteropFilter
import livekit.org.webrtc.RendererCommon

@OptIn(ExperimentalComposeUiApi::class)
@Composable
fun VideoTrackView(
    videoTrack: VideoTrack?,
    modifier: Modifier = Modifier,
    isScreenShare: Boolean = false // ★ 新增参数，用于区分屏幕共享
) {
    if (videoTrack == null) return

    AndroidView(
        modifier = modifier.pointerInteropFilter { false },
        factory = { context ->
            SurfaceViewRenderer(context).apply {
                tag = "uninitialized"
            }
        },
        update = { view ->
            val renderer = view as SurfaceViewRenderer

            // 1. 设置缩放模式
            // 屏幕共享：完整显示，可能有黑边 (FIT)
            // 摄像头：铺满容器，裁切边缘 (FILL)
            val scalingType = if (isScreenShare) {
                RendererCommon.ScalingType.SCALE_ASPECT_FIT
            } else {
                RendererCommon.ScalingType.SCALE_ASPECT_FILL
            }
            renderer.setScalingType(scalingType)

            // 2. 初始化 Renderer
            if (view.tag == "uninitialized") {
                MeetingManager.currentRoom?.initVideoRenderer(renderer)
                view.tag = null
            }

            // 3. 安全绑定 Track
            val currentTrack = view.tag as? VideoTrack
            if (currentTrack != videoTrack) {
                currentTrack?.removeRenderer(renderer)
                videoTrack.addRenderer(renderer)
                view.tag = videoTrack
            }
        },
        onRelease = { view ->
            val renderer = view as SurfaceViewRenderer
            val currentTrack = view.tag as? VideoTrack
            currentTrack?.removeRenderer(renderer)
            renderer.release()
            view.tag = null
        }
    )
}