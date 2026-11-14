package io.github.moonleeeaf.lingcat.ui.screens.chat.meeting

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.media.projection.MediaProjectionManager
import androidx.activity.compose.BackHandler
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CallEnd
import androidx.compose.material.icons.filled.CloseFullscreen
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.ScreenShare
import androidx.compose.material.icons.filled.StopScreenShare
import androidx.compose.material.icons.filled.Videocam
import androidx.compose.material.icons.filled.VideocamOff
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import androidx.core.view.WindowCompat
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.app.MeetingService
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.Feedback
import io.github.moonleeeaf.lingcat.ui.asString
import io.github.moonleeeaf.lingcat.ui.toUiTextOrNull
import io.github.moonleeeaf.lingcat.ui.uiText
import io.github.moonleeeaf.lingcat.ui.utils.ZoomableBox
import io.github.moonleeeaf.lingcat.ui.utils.rememberPermissionRequestHandler
import kotlinx.coroutines.launch
import org.json.JSONObject
import kotlin.math.ceil

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

private tailrec fun Context.findActivity(): Activity? = when (this) {
    is Activity -> this
    is ContextWrapper -> baseContext.findActivity()
    else -> null
}

/**
 * 会议页使用的深色配色。
 *
 * 会议场景必须是暗色底（视频画面为主），但如果沿用 App 的主题色，
 * 浅色模式下白色文字/白色系统栏图标会全部失配。这里单独造一套深色 scheme，
 * 只替换表面色，主色仍取自品牌色，保证和 App 其它页面一致。
 */
@Composable
private fun meetingColorScheme(): ColorScheme {
    val base = MaterialTheme.colorScheme
    return darkColorScheme(
        primary = base.primary,
        onPrimary = base.onPrimary,
        primaryContainer = base.primaryContainer,
        onPrimaryContainer = base.onPrimaryContainer,
        secondary = base.secondary,
        onSecondary = base.onSecondary,
        secondaryContainer = base.secondaryContainer,
        onSecondaryContainer = base.onSecondaryContainer,
        tertiary = base.tertiary,
        onTertiary = base.onTertiary,
        background = Color(0xFF0B0B0D),
        onBackground = Color(0xFFE6E0E9),
        surface = Color(0xFF15151A),
        onSurface = Color(0xFFE6E0E9),
        surfaceVariant = Color(0xFF2A2A31),
        onSurfaceVariant = Color(0xFFC7C5CC),
        surfaceContainerLowest = Color(0xFF0B0B0D),
        surfaceContainerLow = Color(0xFF15151A),
        surfaceContainer = Color(0xFF1B1B21),
        surfaceContainerHigh = Color(0xFF26262D),
        surfaceContainerHighest = Color(0xFF31313A),
        outline = Color(0xFF8E8E96),
        outlineVariant = Color(0xFF46464E),
        error = Color(0xFFF2B8B5),
        onError = Color(0xFF601410),
        errorContainer = Color(0xFF8C1D18),
        onErrorContainer = Color(0xFFF9DEDC),
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MeetingScreen(
    onBack: () -> Unit // 返回但不挂断
) {
    val uiState by MeetingManager.uiState.collectAsState()
    val context = LocalContext.current
    val meetingColors = meetingColorScheme()

    // 会议页背景是深色，主题里按浅色模式算出来的系统栏图标（深色）会完全看不见，
    // 所以在会议页存活期间强制使用浅色图标，退出时恢复。
    val view = LocalView.current
    DisposableEffect(Unit) {
        val window = view.context.findActivity()?.window
        val controller = window?.let { WindowCompat.getInsetsController(it, view) }
        val prevStatus = controller?.isAppearanceLightStatusBars
        val prevNav = controller?.isAppearanceLightNavigationBars
        controller?.isAppearanceLightStatusBars = false
        controller?.isAppearanceLightNavigationBars = false
        onDispose {
            controller?.isAppearanceLightStatusBars = prevStatus ?: false
            controller?.isAppearanceLightNavigationBars = prevNav ?: false
        }
    }

    val requestMicPermission = rememberPermissionRequestHandler(
        permission = Manifest.permission.RECORD_AUDIO,
        rationaleMessage = stringResource(R.string.meeting_mic_permission),
        onGranted = {
            MeetingService.updateServiceType(context)
            MeetingManager.toggleMic()
        }
    )

    // 摄像头权限拦截
    val requestCameraPermission = rememberPermissionRequestHandler(
        permission = Manifest.permission.CAMERA,
        rationaleMessage = stringResource(R.string.meeting_camera_permission),
        onGranted = {
            MeetingService.updateServiceType(context)
            MeetingManager.toggleCamera()
        }
    )

    // ★ 监听外部挂断（如通知栏挂断）自动退出
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
            Feedback.show(R.string.meeting_screen_share_denied)
        }
    }

    // ★ 2. 准备录屏意图
    val mediaProjectionManager = context.getSystemService(Context.MEDIA_PROJECTION_SERVICE) as MediaProjectionManager
    val captureIntent = mediaProjectionManager.createScreenCaptureIntent()

    var showLeaveMeetingDialog by remember { mutableStateOf(false) }

    // 修改会议标题
    val coroutineScope = rememberCoroutineScope()
    var showEditTitleDialog by remember { mutableStateOf(false) }
    var meetingTitleInput by remember { mutableStateOf("") }

    val canEndMeeting = uiState.canEndMeeting()

    // 系统返回键：先退出焦点视图，再离开会议页（离开不等于挂断）。
    BackHandler(enabled = true) {
        if (uiState.focusedIdentity != null) {
            MeetingManager.setFocused(null)
        } else {
            onBack()
        }
    }

    if (showLeaveMeetingDialog) {
        AlertDialog(
            onDismissRequest = { showLeaveMeetingDialog = false },
            title = { Text(if (canEndMeeting) stringResource(R.string.meeting_end_title) else stringResource(R.string.meeting_leave_title)) },
            text = {
                Text(
                    if (canEndMeeting) {
                        stringResource(R.string.meeting_end_message)
                    } else {
                        stringResource(R.string.meeting_leave_message)
                    }
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        showLeaveMeetingDialog = false
                        if (canEndMeeting) {
                            // 结束会议（包括服务端通知 + 本地退出）
                            MeetingManager.endMeeting(context)
                            // endMeeting 内部会触发 phase -> IDLE，
                            // LaunchedEffect 会自动调用 onBack()，所以这里不需要手动调
                        } else {
                            MeetingManager.leaveMeeting()
                        }
                    }
                ) {
                    Text(
                        text = if (canEndMeeting) stringResource(R.string.meeting_end_all) else stringResource(R.string.action_leave),
                        color = if (canEndMeeting) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.primary,
                    )
                }
            },
            dismissButton = {
                TextButton(onClick = { showLeaveMeetingDialog = false }) {
                    Text(if (canEndMeeting) stringResource(R.string.meeting_leave_only) else stringResource(R.string.action_cancel))
                }
            }
        )
    }

    if (showEditTitleDialog) {
        AlertDialog(
            onDismissRequest = { showEditTitleDialog = false },
            title = { Text(stringResource(R.string.meeting_edit_title)) },
            text = {
                OutlinedTextField(
                    value = meetingTitleInput,
                    onValueChange = { if (it.length <= 64) meetingTitleInput = it },
                    label = { Text(stringResource(R.string.meeting_title_label)) },
                    singleLine = true
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    showEditTitleDialog = false
                    val title = meetingTitleInput.trim()
                    coroutineScope.launch {
                        try {
                            MeetingManager.updateMeetingTitle(title)
                        } catch (e: Exception) {
                            Feedback.show(
                                e.toUiTextOrNull()
                                    ?: uiText(R.string.meeting_edit_title_failed, e.message ?: "")
                            )
                        }
                    }
                }) { Text(stringResource(R.string.action_save)) }
            },
            dismissButton = {
                TextButton(onClick = { showEditTitleDialog = false }) { Text(stringResource(R.string.action_cancel)) }
            }
        )
    }

    MaterialTheme(colorScheme = meetingColors) {
        Scaffold(
            containerColor = MaterialTheme.colorScheme.background,
            topBar = {
                TopAppBar(
                    title = {
                        Column {
                            Text(
                                text = uiState.chatTitle ?: stringResource(R.string.meeting_in_progress),
                                style = MaterialTheme.typography.titleMedium,
                                maxLines = 1,
                            )
                            Text(
                                text = stringResource(R.string.meeting_participants_count, uiState.participants.size),
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    },
                    navigationIcon = {
                        // 返回按钮常驻：之前只有“焦点模式”才显示图标，
                        // 网格模式下用户只能靠系统手势退出，不明所以。
                        IconButton(onClick = {
                            if (uiState.focusedIdentity != null) {
                                MeetingManager.setFocused(null)
                            } else {
                                onBack()
                            }
                        }) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                                contentDescription = stringResource(R.string.action_back),
                            )
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.surfaceContainer,
                        titleContentColor = MaterialTheme.colorScheme.onSurface,
                        navigationIconContentColor = MaterialTheme.colorScheme.onSurface,
                        actionIconContentColor = MaterialTheme.colorScheme.onSurface,
                    ),
                    actions = {
                        if (uiState.focusedIdentity != null) {
                            IconButton(onClick = { MeetingManager.setFocused(null) }) {
                                Icon(
                                    imageVector = Icons.Default.CloseFullscreen,
                                    contentDescription = stringResource(R.string.meeting_exit_fullscreen),
                                )
                            }
                        }
                        IconButton(onClick = {
                            meetingTitleInput = uiState.chatTitle ?: ""
                            showEditTitleDialog = true
                        }) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = stringResource(R.string.meeting_edit_title),
                            )
                        }
                    }
                )
            },
            bottomBar = {
                // 底部控制栏
                BottomAppBar(
                    containerColor = MaterialTheme.colorScheme.surfaceContainer,
                    contentColor = MaterialTheme.colorScheme.onSurface,
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        IconButton(onClick = { requestMicPermission() }) {
                            Icon(
                                imageVector = if (uiState.isMicOn) Icons.Default.Mic else Icons.Default.MicOff,
                                contentDescription = if (uiState.isMicOn) stringResource(R.string.meeting_mic_off) else stringResource(R.string.meeting_mic_on),
                                tint = if (uiState.isMicOn) {
                                    MaterialTheme.colorScheme.primary
                                } else {
                                    MaterialTheme.colorScheme.onSurfaceVariant
                                },
                            )
                        }

                        // 摄像头按钮
                        IconButton(onClick = { requestCameraPermission() }) {
                            Icon(
                                imageVector = if (uiState.isCameraOn) Icons.Default.Videocam else Icons.Default.VideocamOff,
                                contentDescription = if (uiState.isCameraOn) stringResource(R.string.meeting_camera_off) else stringResource(R.string.meeting_camera_on),
                                tint = if (uiState.isCameraOn) {
                                    MaterialTheme.colorScheme.primary
                                } else {
                                    MaterialTheme.colorScheme.onSurfaceVariant
                                },
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
                                imageVector = if (uiState.isScreenShareOn) Icons.Default.ScreenShare else Icons.Default.StopScreenShare,
                                contentDescription = if (uiState.isScreenShareOn) stringResource(R.string.meeting_screen_share_stop) else stringResource(R.string.meeting_screen_share_start),
                                tint = if (uiState.isScreenShareOn) {
                                    MaterialTheme.colorScheme.primary
                                } else {
                                    MaterialTheme.colorScheme.onSurfaceVariant
                                },
                            )
                        }

                        // 挂断
                        FilledIconButton(
                            onClick = {
                                if (canEndMeeting) {
                                    // 有权限才能“结束会议”，否则只是自己离开
                                    showLeaveMeetingDialog = true
                                } else {
                                    MeetingManager.leaveMeeting()
                                    onBack()
                                }
                            },
                            colors = IconButtonDefaults.filledIconButtonColors(
                                containerColor = MaterialTheme.colorScheme.errorContainer,
                                contentColor = MaterialTheme.colorScheme.onErrorContainer,
                            ),
                            modifier = Modifier.size(48.dp),
                        ) {
                            Icon(
                                imageVector = Icons.Default.CallEnd,
                                contentDescription = stringResource(R.string.meeting_hang_up),
                                modifier = Modifier.size(24.dp),
                            )
                        }
                    }
                }
            }
        ) { padding ->
            BoxWithConstraints(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(MaterialTheme.colorScheme.background)
            ) {
                val availableWidth = maxWidth
                val availableHeight = maxHeight

                when {
                    uiState.phase == MeetingPhase.CONNECTING -> {
                        CircularProgressIndicator(
                            modifier = Modifier.align(Alignment.Center),
                            color = MaterialTheme.colorScheme.primary,
                        )
                    }

                    uiState.phase == MeetingPhase.ERROR -> {
                        Text(
                            text = uiState.errorMsg?.asString() ?: stringResource(R.string.meeting_error),
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier
                                .align(Alignment.Center)
                                .padding(24.dp)
                        )
                    }

                    else -> {
                        val participants = uiState.participants
                        val focusedParticipant = participants.find { it.identity!!.value == uiState.focusedIdentity }

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
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .heightIn(max = 104.dp)
                                        .padding(bottom = 8.dp),
                                    contentPadding = PaddingValues(horizontal = 8.dp),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    items(participants, key = { it.identity!!.value }) { p ->
                                        Box(modifier = Modifier.width(128.dp).fillMaxHeight()) {
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
                            // ★ 网格布局：列数按“屏幕宽度 + 人数”共同决定，
                            // 并且根据可用空间反推格子宽高比，避免平板上出现大片空白或超扁格子。
                            val count = participants.size.coerceAtLeast(1)
                            val spacing = 8.dp
                            val columns = when {
                                count <= 1 -> 1
                                availableWidth >= 840.dp -> if (count <= 4) 2 else 3
                                availableWidth >= 600.dp -> 2
                                count <= 4 -> 2
                                else -> 3
                            }
                            val rows = ceil(count / columns.toFloat()).toInt().coerceAtLeast(1)
                            val cellWidth = (availableWidth - spacing * (columns + 1)) / columns
                            val cellHeight = (availableHeight - spacing * (rows + 1)) / rows
                            val aspect = if (cellHeight.value > 0f) {
                                (cellWidth / cellHeight).coerceIn(0.55f, 1.9f)
                            } else {
                                1f
                            }

                            LazyVerticalGrid(
                                columns = GridCells.Fixed(columns),
                                modifier = Modifier.fillMaxSize().padding(8.dp),
                                horizontalArrangement = Arrangement.spacedBy(spacing),
                                verticalArrangement = Arrangement.spacedBy(spacing)
                            ) {
                                items(participants, key = { it.identity!!.value }) { p ->
                                    Box(modifier = Modifier.aspectRatio(aspect)) {
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
    }
}
