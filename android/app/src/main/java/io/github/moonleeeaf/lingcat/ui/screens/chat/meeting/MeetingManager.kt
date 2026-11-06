package io.github.moonleeeaf.lingcat.ui.screens.chat.meeting

import android.content.Context
import android.util.Log
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.livekit.android.LiveKit
import io.livekit.android.LiveKitOverrides
import io.livekit.android.RoomOptions
import io.livekit.android.events.RoomEvent
import io.livekit.android.events.collect
import io.livekit.android.room.Room
import io.livekit.android.room.participant.Participant
import io.livekit.android.room.track.Track
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.client_protocol.HttpClientProvider
import lingcat.client_protocol.MeetingApi

enum class MeetingPhase { IDLE, CONNECTING, CONNECTED, ERROR }

data class MeetingUiState(
    val phase: MeetingPhase = MeetingPhase.IDLE,
    val errorMsg: String? = null,

    // 基础信息
    val chatId: String? = null,
    val chatTitle: String? = null,
    val meetingId: String? = null,
    val roomName: String? = null,

    // 参会者列表
    val participants: List<Participant> = emptyList(),

    // 本地媒体状态
    val isMicOn: Boolean = false,
    val isCameraOn: Boolean = false,
    val isScreenShareOn: Boolean = false,

    // 焦点视图状态 (如果要最大化某人)
    val focusedIdentity: String? = null,
    val focusedSource: String? = null, // "camera" 或 "screen"
    val rev: Int = 0,
)

object MeetingManager {
    private const val TAG = "MeetingManager"

    // 内部协程作用域，生命周期与 Room 绑定
    private var managerScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var room: Room? = null
    private var roomEventsJob: Job? = null

    private val _uiState = MutableStateFlow(MeetingUiState())
    val uiState: StateFlow<MeetingUiState> = _uiState.asStateFlow()

    val currentRoom: Room? get() = room

    /**
     * 处理 Web 端遗留的 same-origin 或相对路径问题
     * 确保 Android 端拿到的是包含 scheme 的绝对 WebSocket / HTTP URL
     */
    /**
     * 处理 Web 端遗留的 same-origin 或相对路径问题
     * 确保 Android 端拿到的是包含 scheme 的绝对 WebSocket / HTTP URL
     */
    private fun normalizeLiveKitUrl(rawUrl: String?): String {
        // 如果为空或者为 same-origin，对齐 Web 端：直接使用当前主站的 host，并将协议转为 ws/wss
        if (rawUrl.isNullOrBlank() || rawUrl == "same-origin") {
            val httpUrl = LingCatClientManager.currentServer?.httpUrl
                ?: throw IllegalStateException("无法获取当前服务器地址且后端未提供有效的 LiveKit URL")

            // 判断当前环境是 https 还是 http
            val isSecure = httpUrl.startsWith("https", ignoreCase = true)
            val scheme = if (isSecure) "wss://" else "ws://"

            // 提取纯 Host（域名:端口），去掉可能存在的协议头和后续路径
            // 比如 https://chat.lingcat.com/api -> chat.lingcat.com
            val host = httpUrl
                .replace("https://", "", ignoreCase = true)
                .replace("http://", "", ignoreCase = true)
                .substringBefore("/")

            return "$scheme$host"
        }

        // 如果后端直接给了完整的 ws/wss 链接，直接用
        if (rawUrl.startsWith("ws://") || rawUrl.startsWith("wss://")) {
            return rawUrl
        }

        // 如果给的是 http/https，转换为 ws/wss (LiveKit 官方推荐 wss)
        if (rawUrl.startsWith("http://")) {
            return rawUrl.replace("http://", "ws://", ignoreCase = true)
        }
        if (rawUrl.startsWith("https://")) {
            return rawUrl.replace("https://", "wss://", ignoreCase = true)
        }

        // 如果是纯相对路径，拼接当前服务器的 Host
        val baseUrl = LingCatClientManager.currentServer?.httpUrl
            ?: throw IllegalStateException("无法解析 LiveKit URL: $rawUrl")

        val isSecure = baseUrl.startsWith("https", ignoreCase = true)
        val scheme = if (isSecure) "wss://" else "ws://"
        val host = baseUrl
            .replace("https://", "", ignoreCase = true)
            .replace("http://", "", ignoreCase = true)
            .substringBefore("/")

        val path = if (rawUrl.startsWith("/")) rawUrl else "/$rawUrl"
        return "$scheme$host$path"
    }

    /**
     * 发起或加入会议
     */
    fun joinMeeting(
        context: Context,
        chatId: String,
        chatTitle: String,
        meetingId: String
    ) {
        if (_uiState.value.phase == MeetingPhase.CONNECTED && _uiState.value.meetingId == meetingId) {
            Log.d(TAG, "Already in this meeting")
            return
        }

        // 如果已经在别的会议，先退出
        leaveMeeting(disconnectRoom = true)

        _uiState.value = _uiState.value.copy(
            phase = MeetingPhase.CONNECTING,
            chatId = chatId,
            chatTitle = chatTitle,
            meetingId = meetingId,
            errorMsg = null
        )

        managerScope.launch {
            try {
                val client = LingCatClientManager.currentClient ?: throw Exception("客户端未连接")
                val token = LingCatClientManager.currentToken ?: throw Exception("登录失效")

                // 1. 向服务端请求 LiveKit Token
                val creds = withContext(Dispatchers.IO) {
                    MeetingApi.getMeetingToken(client, token, chatId, meetingId)
                }

                _uiState.value = _uiState.value.copy(roomName = creds.room)

                // 2. 初始化 LiveKit Room
                val newRoom = LiveKit.create(
                    context.applicationContext,
                    RoomOptions(
                        adaptiveStream = true,
                        dynacast = true,
                    ), LiveKitOverrides(
                        okHttpClient = HttpClientProvider.get(),
                    )
                )
                room = newRoom

                // 3. 监听 Room 事件
                listenRoomEvents(newRoom)

                // 4. 规范化 URL 后连接到 LiveKit 服务器
                val safeUrl = normalizeLiveKitUrl(creds.url)
                Log.d(TAG, "Connecting to LiveKit URL: $safeUrl")
                newRoom.connect(safeUrl, creds.token)

                updateLocalState()

                _uiState.value = _uiState.value.copy(phase = MeetingPhase.CONNECTED)
                refreshParticipants()

            } catch (e: Exception) {
                Log.e(TAG, "joinMeeting failed", e)
                _uiState.value = _uiState.value.copy(
                    phase = MeetingPhase.ERROR,
                    errorMsg = e.message ?: "加入会议失败"
                )
            }
        }
    }

    /**
     * 监听 LiveKit 内部的各种事件
     */
    private fun listenRoomEvents(targetRoom: Room) {
        roomEventsJob?.cancel()
        roomEventsJob = managerScope.launch {
            // ★ 修复 1：直接使用 room.events.collect 监听事件
            targetRoom.events.collect { event ->
                when (event) {
                    is RoomEvent.ParticipantConnected -> refreshParticipants()
                    is RoomEvent.ParticipantDisconnected -> refreshParticipants()
                    is RoomEvent.TrackSubscribed -> refreshParticipants()
                    is RoomEvent.TrackUnsubscribed -> refreshParticipants()
                    is RoomEvent.TrackMuted -> refreshParticipants()
                    is RoomEvent.TrackUnmuted -> refreshParticipants()

                    // ★ 修复 2：官方没有 LocalTrackPublished，统一是 TrackPublished
                    is RoomEvent.TrackPublished -> {
                        if (event.participant is io.livekit.android.room.participant.LocalParticipant) {
                            updateLocalState()
                        } else {
                            refreshParticipants()
                        }
                    }
                    // ★ 修复 3：官方没有 LocalTrackUnpublished，统一是 TrackUnpublished
                    is RoomEvent.TrackUnpublished -> {
                        if (event.participant is io.livekit.android.room.participant.LocalParticipant) {
                            updateLocalState()
                        } else {
                            refreshParticipants()
                        }
                    }

                    is RoomEvent.Disconnected -> {
                        Log.d(TAG, "Room disconnected")
                        clearState()
                    }
                    is RoomEvent.ActiveSpeakersChanged -> {
                        // 如果你需要做说话音量波纹，可以在这里保存 activeSpeakers 并触发重组
                        refreshParticipants()
                    }
                    else -> {}
                }
            }
        }
    }

    /**
     * 刷新参会者列表 (触发 UI 重组)
     */
    private fun refreshParticipants() {
        val r = room ?: return
        val list = mutableListOf<Participant>()
        list.add(r.localParticipant)
        list.addAll(r.remoteParticipants.values)

        _uiState.value = _uiState.value.copy(
            participants = list,
            rev = _uiState.value.rev + 1 // ★ 每次刷新让版本号 +1
        )
    }

    /**
     * 更新本地麦克风/摄像头状态
     */
    private fun updateLocalState() {
        val lp = room?.localParticipant ?: return
        val mic = lp.getTrackPublication(Track.Source.MICROPHONE)
        val cam = lp.getTrackPublication(Track.Source.CAMERA)
        val screen = lp.getTrackPublication(Track.Source.SCREEN_SHARE)

        _uiState.value = _uiState.value.copy(
            isMicOn = mic?.track != null && !mic.muted,
            isCameraOn = cam?.track != null && !cam.muted,
            isScreenShareOn = screen?.track != null && !screen.muted
        )
    }

    /**
     * 切换麦克风开关
     */
    fun toggleMic() {
        managerScope.launch {
            try {
                val lp = room?.localParticipant ?: return@launch
                lp.setMicrophoneEnabled(!_uiState.value.isMicOn)
                updateLocalState()
            } catch (e: Throwable) { // ★ 改为 Throwable 兜底
                Log.e(TAG, "toggleMic failed", e)
                // 可考虑在此处给 _uiState 加个提示，告诉 UI 层失败了
            }
        }
    }

    /**
     * 切换摄像头开关
     */
    fun toggleCamera() {
        managerScope.launch {
            try {
                val lp = room?.localParticipant ?: return@launch
                lp.setCameraEnabled(!_uiState.value.isCameraOn)
                updateLocalState()
            } catch (e: Throwable) { // ★ 改为 Throwable 兜底
                Log.e(TAG, "toggleCamera failed", e)
            }
        }
    }

    /**
     * 切换屏幕共享开关 (后续如果需要加上)
     */
    fun toggleScreenShare() {
        managerScope.launch {
            try {
                val lp = room?.localParticipant ?: return@launch
                if (_uiState.value.isScreenShareOn) {
                    lp.setScreenShareEnabled(false)
                } else {
                    // 需要配合 Activity 的 MediaProjection 权限申请
                    lp.setScreenShareEnabled(true)
                }
                updateLocalState()
            } catch (e: Exception) {
                Log.e(TAG, "toggleScreenShare failed", e)
            }
        }
    }

    /**
     * 设置焦点视图（放大某个人）
     * @param identity 参会者 ID
     * @param source "camera" 或 "screen"
     */
    fun setFocused(identity: String?, source: String? = null) {
        _uiState.value = _uiState.value.copy(
            focusedIdentity = identity,
            focusedSource = source
        )
    }

    /**
     * 离开会议 (只断开自己)
     */
    fun leaveMeeting(disconnectRoom: Boolean = true) {
        if (disconnectRoom) {
            managerScope.launch {
                try {
                    room?.disconnect()
                } catch (e: Exception) {
                    Log.w(TAG, "disconnect error", e)
                }
            }
        }
        clearState()
    }

    /**
     * 结束会议 (如果是发起人，需要通知服务端)
     */
    fun endMeeting(context: Context) {
        val chatId = _uiState.value.chatId
        val meetingId = _uiState.value.meetingId
        if (chatId != null && meetingId != null) {
            managerScope.launch(Dispatchers.IO) {
                try {
                    val client = LingCatClientManager.currentClient
                    val token = LingCatClientManager.currentToken
                    if (client != null && token != null) {
                        MeetingApi.endMeeting(client, token, chatId, meetingId)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "endMeeting api failed", e)
                }
            }
        }
        leaveMeeting(disconnectRoom = true)
    }

    private fun clearState() {
        roomEventsJob?.cancel()
        roomEventsJob = null
        room = null
        _uiState.value = MeetingUiState() // 重置为空闲状态
    }
}