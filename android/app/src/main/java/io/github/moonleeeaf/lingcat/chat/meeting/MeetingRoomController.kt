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
 * Java 侧只通过 Listener 回调，不直接碰协程。
 *
 * 支持同时展示同一参与者的摄像头 + 屏幕共享（通过 source 区分）。
 */
class MeetingRoomController(
    private val context: Context,
    private val listener: Listener,
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
    }

    private val tag = "MeetingRoom"
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())

    @Volatile private var room: Room? = null
    private var eventJob: Job? = null

    val currentRoom: Room? get() = room

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
                listener.onConnected()
            } catch (t: Throwable) {
                Log.e(tag, "connect failed", t)
                listener.onError(t)
            }
        }
    }

    fun disconnect() {
        eventJob?.cancel()
        eventJob = null
        val r = room
        room = null
        try { r?.disconnect() } catch (_: Exception) {}
        listener.onDisconnected()
    }

    // ============================================================
    //                      控制
    // ============================================================

    fun setCameraEnabled(enabled: Boolean) {
        scope.launch {
            try { room?.localParticipant?.setCameraEnabled(enabled) }
            catch (t: Throwable) { listener.onError(t) }
        }
    }

    fun setMicrophoneEnabled(enabled: Boolean) {
        scope.launch {
            try { room?.localParticipant?.setMicrophoneEnabled(enabled) }
            catch (t: Throwable) { listener.onError(t) }
        }
    }

    // ============================================================
    //                      本地 track（按 source 分开）
    // ============================================================

    fun getLocalCameraTrack(): VideoTrack? {
        return try {
            val pub = room?.localParticipant?.getTrackPublication(Track.Source.CAMERA)
            pub?.track as? VideoTrack
        } catch (t: Throwable) {
            null
        }
    }

    fun getLocalScreenShareTrack(): VideoTrack? {
        return try {
            val pub = room?.localParticipant?.getTrackPublication(Track.Source.SCREEN_SHARE)
            pub?.track as? VideoTrack
        } catch (t: Throwable) {
            null
        }
    }

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
                        listener.onParticipantJoined(event.participant)

                    is RoomEvent.ParticipantDisconnected ->
                        listener.onParticipantLeft(event.participant)

                    is RoomEvent.TrackSubscribed -> {
                        val t = event.track
                        if (t is VideoTrack) {
                            listener.onVideoTrackSubscribed(
                                event.participant, t, event.publication.source)
                        }
                    }

                    is RoomEvent.TrackUnsubscribed -> {
                        val t = event.track
                        if (t is VideoTrack) {
                            listener.onVideoTrackUnsubscribed(
                                event.participant, t, event.publications.source)
                        }
                    }

                    is RoomEvent.LocalTrackSubscribed -> {
                        val t = event.publication.track
                        if (t is VideoTrack) {
                            listener.onLocalTrackSubscribed(t, event.publication.source)
                        }
                    }

                    is RoomEvent.Reconnecting -> listener.onReconnecting()
                    is RoomEvent.Reconnected -> listener.onReconnected()
                    is RoomEvent.Disconnected -> listener.onDisconnected()
                    else -> {}
                }
            }
        }
    }
}