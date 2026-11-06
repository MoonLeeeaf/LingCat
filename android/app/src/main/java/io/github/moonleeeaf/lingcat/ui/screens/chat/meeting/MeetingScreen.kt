package io.github.moonleeeaf.lingcat.ui.screens.chat.meeting

import android.Manifest
import android.content.pm.PackageManager
import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CallEnd
import androidx.compose.material.icons.filled.CloseFullscreen
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material.icons.filled.VideocamOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.core.content.ContextCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.ui.utils.ZoomableBox
import io.github.moonleeeaf.lingcat.ui.utils.rememberPermissionRequestHandler

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MeetingScreen(
    onBack: () -> Unit // 返回但不挂断
) {
    val uiState by MeetingManager.uiState.collectAsState()
    val context = LocalContext.current

    val requestMicPermission = rememberPermissionRequestHandler(
        permission = Manifest.permission.RECORD_AUDIO,
        rationaleMessage = "为了能在会议中发言，我们需要您的麦克风权限",
        onGranted = { MeetingManager.toggleMic() }
    )

    // 摄像头权限拦截
    val requestCameraPermission = rememberPermissionRequestHandler(
        permission = Manifest.permission.CAMERA,
        rationaleMessage = "为了能在会议中展示画面，我们需要您的摄像头权限",
        onGranted = { MeetingManager.toggleCamera() }
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(uiState.chatTitle ?: "会议中", style = MaterialTheme.typography.titleMedium)
                        Text("${uiState.participants.size} 人正在参与", style = MaterialTheme.typography.labelSmall)
                    }
                },
                navigationIcon = {
                    if (uiState.focusedIdentity != null) {
                        // 焦点模式下，显示退出焦点按钮
                        IconButton(onClick = { MeetingManager.setFocused(null) }) {
                            Icon(Icons.Default.CloseFullscreen, contentDescription = "退出最大化")
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.Black.copy(alpha = 0.8f),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                )
            )
        },
        bottomBar = {
            // 底部控制栏
            BottomAppBar(
                containerColor = Color.Black.copy(alpha = 0.9f),
                contentColor = Color.White
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(onClick = { requestMicPermission() }) {
                        Icon(
                            imageVector = if (uiState.isMicOn) Icons.Default.Mic else Icons.Default.MicOff,
                            contentDescription = "麦克风",
                            tint = if (uiState.isMicOn) Color.White else Color.Red
                        )
                    }

                    // 摄像头按钮
                    IconButton(onClick = { requestCameraPermission() }) {
                        Icon(
                            imageVector = if (uiState.isCameraOn) Icons.Default.Videocam else Icons.Default.VideocamOff,
                            contentDescription = "摄像头",
                            tint = if (uiState.isCameraOn) Color.White else Color.Red
                        )
                    }

                    // 挂断
                    IconButton(
                        onClick = {
                            MeetingManager.leaveMeeting()
                            onBack()
                        },
                        colors = IconButtonDefaults.iconButtonColors(contentColor = Color.Red)
                    ) {
                        Icon(Icons.Default.CallEnd, contentDescription = "挂断", modifier = Modifier.size(32.dp))
                    }
                }
            }
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color.Black)
        ) {
            if (uiState.phase == MeetingPhase.CONNECTING) {
                CircularProgressIndicator(modifier = Modifier.align(Alignment.Center), color = Color.White)
            } else if (uiState.phase == MeetingPhase.ERROR) {
                Text(
                    text = uiState.errorMsg ?: "发生错误",
                    color = Color.Red,
                    modifier = Modifier.align(Alignment.Center)
                )
            } else {
                val focusedParticipant = uiState.participants.find { it.identity!!.value == uiState.focusedIdentity }

                if (focusedParticipant != null) {
                    // ★ 焦点布局
                    Column(modifier = Modifier.fillMaxSize()) {
                        // 大屏
                        Box(modifier = Modifier.weight(1f).padding(8.dp)) {
                            ZoomableBox(
                                modifier = Modifier.fillMaxSize(),
                                onSingleTap = { MeetingManager.setFocused(null) } // 点击退出交给 ZoomableBox
                            ) {
                                ParticipantTile(
                                    participant = focusedParticipant,
                                    rev = uiState.rev,
                                    isFocused = true,
                                    // ★★★ 绝对不能传 onClick！
                                    // onClick = { ... }  <-- 把这一行删掉！
                                )
                            }
                        }

                        // 底部缩略图横排
                        LazyRow(
                            modifier = Modifier.fillMaxWidth().height(100.dp).padding(bottom = 8.dp),
                            contentPadding = PaddingValues(horizontal = 8.dp),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(uiState.participants, key = { it.identity!!.value }) { p ->
                                Box(modifier = Modifier.width(120.dp).fillMaxHeight()) {
                                    ParticipantTile(
                                        participant = p,
                                        rev = uiState.rev, // ★ 传入版本号
                                        onClick = { MeetingManager.setFocused(p.identity!!.value, "camera") }
                                    )
                                }
                            }
                        }
                    }
                } else {
                    // ★ 网格布局
                    val cols = if (uiState.participants.size <= 1) 1 else if (uiState.participants.size <= 4) 2 else 3
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(cols),
                        modifier = Modifier.fillMaxSize().padding(8.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(uiState.participants, key = { it.identity!!.value }) { p ->
                            Box(modifier = Modifier.aspectRatio(1f)) {
                                ParticipantTile(
                                    participant = p,
                                    rev = uiState.rev, // ★ 传入版本号
                                    onClick = { MeetingManager.setFocused(p.identity!!.value, "camera") }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}