package io.github.moonleeeaf.lingcat.ui.screens.chat.meeting

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.livekit.android.room.participant.Participant
import io.livekit.android.room.track.Track
import io.livekit.android.room.track.VideoTrack

@Composable
fun ParticipantTile(
    participant: Participant,
    isFocused: Boolean = false,
    onClick: (() -> Unit)? = null,
    rev: Int = 0,
) {
    // 1. 获取所有相关发布信息
    val screenPublication = participant.getTrackPublication(Track.Source.SCREEN_SHARE)
    val cameraPublication = participant.getTrackPublication(Track.Source.CAMERA)
    val micPublication = participant.getTrackPublication(Track.Source.MICROPHONE)

    // 2. 提取轨道和激活状态
    val screenTrack = screenPublication?.track as? VideoTrack
    val isScreenActive = screenTrack != null && screenPublication.muted.not() && screenTrack.streamState == Track.StreamState.ACTIVE

    val cameraTrack = cameraPublication?.track as? VideoTrack
    val isCameraActive = cameraTrack != null && cameraPublication.muted.not() && cameraTrack.streamState == Track.StreamState.ACTIVE

    // 3. 状态判断
    val isMicMuted = if (micPublication?.track != null) {
        micPublication.muted
    } else {
        !participant.isMicrophoneEnabled()
    }

    val clickableModifier = if (onClick != null) {
        Modifier.clickable { onClick() }
    } else {
        Modifier // 不传 onClick 时，不添加 clickable
    }

    val activePublication = if (screenPublication?.track != null && !screenPublication.muted) {
        screenPublication
    } else {
        cameraPublication
    }

    val videoTrack = activePublication?.track as? VideoTrack
    val isVideoMuted = activePublication?.muted ?: true

    val name = participant.name ?: participant.identity!!.value

    val isScreenShare = activePublication?.source == Track.Source.SCREEN_SHARE

    Box(
        modifier = Modifier
            .fillMaxSize()
            .clip(RoundedCornerShape(8.dp))
            .background(Color(0xFF222222))
            .then(clickableModifier)
    ) {
        if (videoTrack != null && !isVideoMuted) {
            // ★ 根据是否是屏幕共享，动态调整宽高比和缩放
            val containerModifier = if (isScreenShare) {
                // 如果是屏幕共享，在竖屏手机上，按 16:9 的比例居中显示，
                // 避免被拉伸或上下留太大的黑边
                Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 9f)
                    .align(Alignment.Center)
            } else {
                Modifier.fillMaxSize()
            }

            VideoTrackView(
                videoTrack = videoTrack,
                modifier = containerModifier, // ★ 应用宽高比
                isScreenShare = isScreenShare // ★ 传给渲染器，使用 FIT 模式
            )
        } else {
            // 情况 C: 啥也没开，显示头像
            Icon(
                imageVector = Icons.Default.Person,
                contentDescription = null,
                modifier = Modifier.align(Alignment.Center).size(48.dp),
                tint = Color.Gray
            )
        }

        // ================= 画中画 (PiP) 区域 =================
        // 如果屏幕共享和摄像头同时开启，摄像头作为小窗悬浮在右上角
        if (isScreenActive && isCameraActive) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(8.dp)
                    .width(100.dp) // 小窗宽度
                    .aspectRatio(3f / 4f) // 竖屏比例 (如果想横屏改为 4f/3f)
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color.Black)
            ) {
                VideoTrackView(
                    videoTrack = cameraTrack,
                    modifier = Modifier.fillMaxSize()
                )
            }
        }

        // ================= 底部信息栏 =================
        Row(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .fillMaxWidth()
                .background(Color(0x80000000))
                .padding(horizontal = 6.dp, vertical = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (isMicMuted) {
                Icon(
                    imageVector = Icons.Default.MicOff,
                    contentDescription = "已静音",
                    tint = Color.Red,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
            }
            Text(
                text = if (isScreenActive) "$name (共享中)" else name,
                color = Color.White,
                fontSize = 12.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
    }
}