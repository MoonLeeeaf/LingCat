package io.github.moonleeeaf.lingcat.chat.meeting

import android.content.Context
import android.util.Log
import io.livekit.android.LiveKit
import io.livekit.android.events.RoomEvent
import io.livekit.android.events.collect
import io.livekit.android.room.Room
import io.livekit.android.room.participant.Participant
import io.livekit.android.room.track.Track
import io.livekit.android.room.track.VideoTrack
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * LiveKit Room 的 Kotlin 桥接层。
 *
 * ★ listener 可换（[updateListener]）——Activity 销毁时传 null，防内存泄漏；
 *   重进会议时把新 Activity 的 listener 装回来。
 */
class MeetingRoomController(
    private val context: Context,
    initialListener: Listener,
) {

    interface Listener {
        fun onConnected()
        fun onDisconnected()
        fun onReconnecting()
        fun onReconnected()
        fun onParticipantJoined(participant: Participant)
        fun onParticipantLeft(participant: Participant)
        fun onVideoTrackSubscribed(participant: Participant, track: VideoTrack, source: Track.Source)
        fun onVideoTrackUnsubscribed(participant: Participant, track: VideoTrack, source: Track.Source)
        fun onLocalTrackSubscribed(track: VideoTrack, source: Track.Source)
        fun onError(t: Throwable)
        fun onInitialState(participants: List<Participant>)
    }

    private val tag = "MeetingRoom"
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    @Volatile private var room: Room? = null
    private var eventJob: Job? = null

    @Volatile private var listener: Listener? = initialListener

    val currentRoom: Room? get() = room

    /** 更换 listener；传 null 表示暂时不接收回调（Activity 销毁时用） */
    fun updateListener(l: Listener?) {
        listener = l
    }

    // ============================================================
    //                      连接 / 断开
    // ============================================================

    fun connect(url: String, token: String) {
        scope.launch {
            try {
                val r = LiveKit.create(context)
                room = r
                observeEvents(r)
                r.connect(url, token)
                Log.i(tag, "connected to $url")

                // ★ 先通知初始化状态
                val existing = r.remoteParticipants.values.toList()
                listener?.onInitialState(existing)

                listener?.onConnected()
            } catch (t: Throwable) {
                Log.e(tag, "connect failed", t)
                listener?.onError(t)
            }
        }
    }

    fun disconnect() {
        eventJob?.cancel()
        eventJob = null
        val r = room
        room = null
        try { r?.disconnect() } catch (_: Exception) {}
        listener?.onDisconnected()
    }

    // ============================================================
    //                      控制
    // ============================================================

    fun setCameraEnabled(enabled: Boolean) {
        scope.launch {
            try { room?.localParticipant?.setCameraEnabled(enabled) }
            catch (t: Throwable) { listener?.onError(t) }
        }
    }

    fun setMicrophoneEnabled(enabled: Boolean) {
        scope.launch {
            try { room?.localParticipant?.setMicrophoneEnabled(enabled) }
            catch (t: Throwable) { listener?.onError(t) }
        }
    }

    // ============================================================
    //                      本地 track（按 source 分开）
    // ============================================================

    fun getLocalCameraTrack(): VideoTrack? = try {
        room?.localParticipant?.getTrackPublication(Track.Source.CAMERA)?.track as? VideoTrack
    } catch (_: Throwable) { null }

    fun getLocalScreenShareTrack(): VideoTrack? = try {
        room?.localParticipant?.getTrackPublication(Track.Source.SCREEN_SHARE)?.track as? VideoTrack
    } catch (_: Throwable) { null }

    // ============================================================
    //                      参与者
    // ============================================================

    fun getLocalParticipant(): Participant? = room?.localParticipant

    fun getRemoteParticipants(): List<Participant> =
        room?.remoteParticipants?.values?.toList() ?: emptyList()

    // ============================================================
    //                      事件
    // ============================================================

    private fun observeEvents(r: Room) {
        eventJob = scope.launch {
            r.events.collect { event ->
                when (event) {
                    is RoomEvent.ParticipantConnected ->
                        listener?.onParticipantJoined(event.participant)

                    is RoomEvent.ParticipantDisconnected ->
                        listener?.onParticipantLeft(event.participant)

                    is RoomEvent.TrackSubscribed -> {
                        val t = event.track
                        if (t is VideoTrack) {
                            listener?.onVideoTrackSubscribed(
                                event.participant, t, event.publication.source)
                        }
                    }

                    is RoomEvent.TrackUnsubscribed -> {
                        val t = event.track
                        if (t is VideoTrack) {
                            listener?.onVideoTrackUnsubscribed(
                                event.participant, t, event.publications.source)
                        }
                    }

                    is RoomEvent.LocalTrackSubscribed -> {
                        val t = event.publication.track
                        if (t is VideoTrack) {
                            listener?.onLocalTrackSubscribed(t, event.publication.source)
                        }
                    }

                    is RoomEvent.Reconnecting -> listener?.onReconnecting()
                    is RoomEvent.Reconnected -> listener?.onReconnected()
                    is RoomEvent.Disconnected -> listener?.onDisconnected()
                    else -> {}
                }
            }
        }
    }
}