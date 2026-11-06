package io.github.moonleeeaf.lingcat.ui.screens.chat.meeting

import android.content.Context
import android.util.Log
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.app.MeetingService
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
import lingcat.client_protocol.ChatApi // ★ 新增导入

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
    val starterUserId: String? = null,
    val iAmChatAdmin: Boolean = false,
    val myChatAdminRole: String? = null,
    val myChatAdminPermissions: String? = null,

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

    private var managerScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var room: Room? = null
    private var roomEventsJob: Job? = null

    private val _uiState = MutableStateFlow(MeetingUiState())
    val uiState: StateFlow<MeetingUiState> = _uiState.asStateFlow()

    val currentRoom: Room? get() = room

    private fun normalizeLiveKitUrl(rawUrl: String?): String {
        // ... (保持不变) ...
        if (rawUrl.isNullOrBlank() || rawUrl == "same-origin") {
            val httpUrl = LingCatClientManager.currentServer?.httpUrl
                ?: throw IllegalStateException("无法获取当前服务器地址且后端未提供有效的 LiveKit URL")
            val isSecure = httpUrl.startsWith("https", ignoreCase = true)
            val scheme = if (isSecure) "wss://" else "ws://"
            val host = httpUrl
                .replace("https://", "", ignoreCase = true)
                .replace("http://", "", ignoreCase = true)
                .substringBefore("/")
            return "$scheme$host"
        }
        if (rawUrl.startsWith("ws://") || rawUrl.startsWith("wss://")) return rawUrl
        if (rawUrl.startsWith("http://")) return rawUrl.replace("http://", "ws://", ignoreCase = true)
        if (rawUrl.startsWith("https://")) return rawUrl.replace("https://", "wss://", ignoreCase = true)
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

        leaveMeeting(disconnectRoom = true)

        _uiState.value = _uiState.value.copy(
            phase = MeetingPhase.CONNECTING,
            chatId = chatId,
            chatTitle = chatTitle,
            meetingId = meetingId,
            errorMsg = null
        )

        try {
            MeetingService.start(context)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start MeetingService", e)
        }

        managerScope.launch {
            try {
                val client = LingCatClientManager.currentClient ?: throw Exception("客户端未连接")
                val token = LingCatClientManager.currentToken ?: throw Exception("登录失效")

                // 1. 向服务端请求 LiveKit Token
                val creds = withContext(Dispatchers.IO) {
                    MeetingApi.getMeetingToken(client, token, chatId, meetingId)
                }

                // ★ 假设 creds 里有 starterUserId，如果没有需要向后端确认
                // 如果后端的 getMeetingToken 接口没有返回 starterUserId，
                // 你可能需要在加入后调用 MeetingApi.getActiveMeeting 获取，并更新这里
                _uiState.value = _uiState.value.copy(
                    roomName = creds.room,
                    // starterUserId = creds.starterUserId // 如果接口有这个字段，请解开注释
                )

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
                
                // ★ 新增：拉取当前用户的群管权限
                loadChatAdminFlag(chatId)

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
     * ★ 新增：拉取群管理员权限
     */
    private fun loadChatAdminFlag(chatId: String) {
        managerScope.launch(Dispatchers.IO) {
            try {
                val client = LingCatClientManager.currentClient ?: return@launch
                val token = LingCatClientManager.currentToken ?: return@launch
                
                // 调用 ChatApi 获取管理员列表
                // 注意：根据你的 Java SDK 定义，方法名或返回值可能略有不同
                // 假设返回的是一个包含 id, role, permissions 的对象列表
                val admins = ChatApi.getChatAdmins(client, token, chatId)
                val myUserId = LingCatClientManager.currentUserId
                
                // 查找自己是否在管理员列表中
                val mine = admins?.find { it.id == myUserId }
                
                if (_uiState.value.chatId != chatId) return@launch // 防止用户已经切走
                
                _uiState.value = _uiState.value.copy(
                    iAmChatAdmin = mine != null,
                    myChatAdminRole = mine?.role,
                    myChatAdminPermissions = mine?.permissions
                )
            } catch (e: Exception) {
                Log.e(TAG, "loadChatAdminFlag failed", e)
                if (_uiState.value.chatId != chatId) return@launch
                _uiState.value = _uiState.value.copy(
                    iAmChatAdmin = false,
                    myChatAdminRole = null,
                    myChatAdminPermissions = null
                )
            }
        }
    }

    private fun listenRoomEvents(targetRoom: Room) {
        // ... (保持不变) ...
        roomEventsJob?.cancel()
        roomEventsJob = managerScope.launch {
            targetRoom.events.collect { event ->
                when (event) {
                    is RoomEvent.ParticipantConnected -> refreshParticipants()
                    is RoomEvent.ParticipantDisconnected -> refreshParticipants()
                    is RoomEvent.TrackSubscribed -> refreshParticipants()
                    is RoomEvent.TrackUnsubscribed -> refreshParticipants()
                    is RoomEvent.TrackMuted -> refreshParticipants()
                    is RoomEvent.TrackUnmuted -> refreshParticipants()

                    is RoomEvent.TrackPublished -> {
                        if (event.participant is io.livekit.android.room.participant.LocalParticipant) {
                            updateLocalState()
                        } else {
                            refreshParticipants()
                        }
                    }
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
                        refreshParticipants()
                    }
                    else -> {}
                }
            }
        }
    }

    private fun refreshParticipants() {
        val r = room ?: return
        val list = mutableListOf<Participant>()
        list.add(r.localParticipant)
        list.addAll(r.remoteParticipants.values)

        _uiState.value = _uiState.value.copy(
            participants = list,
            rev = _uiState.value.rev + 1
        )
    }

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

    fun toggleMic() {
        managerScope.launch {
            try {
                val lp = room?.localParticipant ?: return@launch
                lp.setMicrophoneEnabled(!_uiState.value.isMicOn)
                updateLocalState()
            } catch (e: Throwable) {
                Log.e(TAG, "toggleMic failed", e)
            }
        }
    }

    fun toggleCamera() {
        managerScope.launch {
            try {
                val lp = room?.localParticipant ?: return@launch
                lp.setCameraEnabled(!_uiState.value.isCameraOn)
                updateLocalState()
            } catch (e: Throwable) {
                Log.e(TAG, "toggleCamera failed", e)
            }
        }
    }

    fun toggleScreenShare() {
        managerScope.launch {
            try {
                val lp = room?.localParticipant ?: return@launch
                if (_uiState.value.isScreenShareOn) {
                    lp.setScreenShareEnabled(false)
                } else {
                    lp.setScreenShareEnabled(true)
                }
                updateLocalState()
            } catch (e: Exception) {
                Log.e(TAG, "toggleScreenShare failed", e)
            }
        }
    }

    fun setFocused(identity: String?, source: String? = null) {
        _uiState.value = _uiState.value.copy(
            focusedIdentity = identity,
            focusedSource = source
        )
    }

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
        _uiState.value = MeetingUiState()
    }
}