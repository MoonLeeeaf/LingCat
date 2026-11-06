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
import io.github.moonleeeaf.lingcat.app.MeetingService
import android.app.Activity
import android.content.Context
import android.media.projection.MediaProjectionManager
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import org.json.JSONObject
import androidx.compose.material.icons.filled.ScreenShare 
import androidx.compose.material.icons.filled.StopScreenShare 

/**
 * 判断当前用户是否有结束会议的权限
 */
fun MeetingUiState.canEndMeeting(): Boolean {
    // 获取当前登录用户 ID
    val myUserId = LingCatClientManager.currentUserId
    
    // 1. 如果未知发起人（比如还没拉取到），或者自己就是发起人
    if (starterUserId == null || starterUserId == myUserId) return true
    
    // 2. 如果不是群管理员
    if (!iAmChatAdmin) return false
    
    // 3. 如果是群主 (owner)
    if (myChatAdminRole == "owner") return true
    
    // 4. 解析具体的权限 JSON
    return try {
        val json = JSONObject(myChatAdminPermissions ?: "{}")
        json.optBoolean("end_meeting", false)
    } catch (e: Exception) {
        false
    }
}

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
        onGranted = {
            MeetingService.updateServiceType(context)
            MeetingManager.toggleMic()
        }
    )

    // 摄像头权限拦截
    val requestCameraPermission = rememberPermissionRequestHandler(
        permission = Manifest.permission.CAMERA,
        rationaleMessage = "为了能在会议中展示画面，我们需要您的摄像头权限",
        onGranted = {
            MeetingService.updateServiceType(context)
            MeetingManager.toggleCamera()
        }
    )

    // ★ 新增：监听外部挂断（如通知栏挂断）自动退出
    LaunchedEffect(uiState.phase) {
        if (uiState.phase == MeetingPhase.IDLE) {
            onBack()
        }
    }

        // ★ 1. 定义系统录屏权限请求器
    val screenCaptureLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            // 用户同意了，把结果传给 MeetingManager
            MeetingManager.toggleScreenShare(result.resultCode, result.data)
            // ★ 通知前台服务更新类型（Android 14 必须）
            MeetingService.updateServiceType(context)
        } else {
            // 用户拒绝了
            // 这里可以加个 Toast 提示
        }
    }

    // ★ 2. 准备录屏意图
    val mediaProjectionManager = context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
    val captureIntent = mediaProjectionManager.createScreenCaptureIntent()

    var showEndMeetingDialog by remember { mutableStateOf(false) }

    // ★ 获取是否有权限（请替换为你真实的判断逻辑）
    // 比如：是否是发起人，或者是否是群管理员
    // 假设你 uiState 里有一个 starterUserId，并且 LingCatClientManager.currentUserId 可用
    // val canEndMeeting = LingCatClientManager.currentUserId == uiState.starterUserId
    val canEndMeeting = uiState.canEndMeeting()

    if (showEndMeetingDialog) {
        AlertDialog(
            onDismissRequest = { showEndMeetingDialog = false },
            title = { Text("退出会议") },
            text = { Text("是否要结束该会议？\n\n结束后所有参与者都将被移出。") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showEndMeetingDialog = false
                        // 结束会议（包括服务端通知 + 本地退出）
                        MeetingManager.endMeeting(context)
                        // 注意：endMeeting 内部会触发 phase -> IDLE，
                        // LaunchedEffect 会自动调用 onBack()，所以这里不需要手动调
                    }
                ) {
                    Text("结束会议", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                // 用户选择只退出自己
                TextButton(
                    onClick = {
                        showEndMeetingDialog = false
                        MeetingManager.leaveMeeting()
                        onBack()
                    }
                ) {
                    Text("仅离开")
                }
            }
        )
    }

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

                     // ★ 3. 屏幕共享按钮
                    IconButton(
                        onClick = {
                            if (uiState.isScreenShareOn) {
                                // 如果已经在共享，直接停止
                                MeetingManager.toggleScreenShare()
                            } else {
                                // 如果没在共享，唤起系统弹窗
                                screenCaptureLauncher.launch(captureIntent)
                            }
                        }
                    ) {
                        Icon(
                            // 这里用 Material 默认图标，你有自定义的可以换
                            imageVector = if (uiState.isScreenShareOn) Icons.Default.ScreenShare else Icons.Default.StopScreenShare,
                            contentDescription = "屏幕共享",
                            tint = if (uiState.isScreenShareOn) Color.Green else Color.White
                        )
                    }

                    // 挂断
                    IconButton(
                        onClick = {
                            if (canEndMeeting) {
                                // 有权限，弹窗询问
                                showEndMeetingDialog = true
                            } else {
                                // 没权限，直接退出
                                MeetingManager.leaveMeeting()
                                onBack()
                            }
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