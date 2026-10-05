import React from 'react'
import { Room, RoomEvent, Track } from 'livekit-client'
import { MeetingApi } from 'lingcat-client-protocol'
import { IChat } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'

export type MeetingPhase = 'idle' | 'connecting' | 'connected' | 'error'

export interface ActiveMeeting {
    meetingId: string
    room: string
    title?: string
    starterUserId: string
    startedAt: number
}

class MeetingManagerImpl {
    room?: Room
    phase: MeetingPhase = 'idle'
    error?: string

    chatId?: string
    chatTitle?: string
    meetingId?: string
    roomName?: string
    starterUserId?: string

    isMicOn = false
    /** 麦克风降噪 (WebRTC noiseSuppression) */
    noiseSuppression = true
    isCameraOn = false
    isSharingScreen = false
    /** 是否正在共享电脑/系统声音 */
    isSharingAudio = false
    audioBlocked = false

    /** 可选的麦克风输入设备 */
    audioInputs: { deviceId: string, label: string }[] = []
    activeAudioInput?: string

    /** 本地静音的成员 (仅影响自己听到的声音) identity -> true */
    locallyMuted: { [identity: string]: boolean } = {}

    /** 会议面板是否停靠为分栏模式 (左侧画面 / 右侧聊天) */
    dock = false
    /** 分栏模式下会议面板宽度百分比 (可拖动分隔条调整) */
    dockWidthPercent = 50
    /** 正在最大化的成员 (通常是某人的屏幕共享) */
    focusedIdentity?: string

    /** chat_id -> 进行中的会议 (由事件广播维护) */
    activeMeetings: { [chatId: string]: ActiveMeeting } = {}

    private listeners = new Set<() => void>()

    subscribe = (listener: () => void) => {
        this.listeners.add(listener)
        return () => { this.listeners.delete(listener) }
    }
    private emit() {
        this.listeners.forEach((l) => l())
    }

    private accessToken() {
        return ClientManager.getActiveUserSession().token
    }

    /** 由 UserMain 在收到 Meeting_Started_Event 时调用 */
    onMeetingStarted(ev: { chatId: string, meetingId: string, room: string, starterUserId: string, title?: string | null }) {
        this.activeMeetings[ev.chatId] = {
            meetingId: ev.meetingId,
            room: ev.room,
            title: ev.title ?? undefined,
            starterUserId: ev.starterUserId,
            startedAt: Date.now(),
        }
        this.emit()
    }

    /** 由 UserMain 在收到 Meeting_Ended_Event 时调用 */
    onMeetingEnded(ev: { chatId: string, meetingId: string }) {
        const m = this.activeMeetings[ev.chatId]
        if (m && m.meetingId == ev.meetingId) delete this.activeMeetings[ev.chatId]
        // 若我正身处该会议, 断开
        if (this.chatId == ev.chatId && this.meetingId == ev.meetingId) this.leave()
        else this.emit()
    }

    getActiveMeeting(chatId: string) {
        return this.activeMeetings[chatId]
    }

    /** 打开对话时向服务端查询是否有进行中的会议, 以同步横幅状态 */
    async refreshActiveMeeting(chatId: string) {
        try {
            const r = await MeetingApi.getActiveMeeting(ClientManager.client, {
                access_token: this.accessToken(),
                chat_id: chatId,
            })
            if (r.has_meeting) {
                this.activeMeetings[chatId] = {
                    meetingId: r.meeting_id,
                    room: r.room,
                    title: r.title,
                    starterUserId: r.starter_user_id,
                    startedAt: Date.now(),
                }
            } else {
                delete this.activeMeetings[chatId]
            }
            this.emit()
        } catch (e) {
            // 静默: 可能是网络/权限问题, 不打扰用户
        }
    }

    isInMeeting(chatId?: string) {
        return !!this.room && (chatId == undefined || this.chatId == chatId)
    }

    /** 是否有会议面板需要显示 (含连接中/出错) */
    isActive() {
        return this.phase != 'idle' || !!this.room
    }

    setDock(v: boolean) {
        this.dock = v
        this.emit()
    }

    setDockWidthPercent(v: number) {
        this.dockWidthPercent = Math.min(80, Math.max(20, v))
        this.emit()
    }

    setFocused(identity?: string) {
        this.focusedIdentity = identity
        this.emit()
    }

    private bindRoom(room: Room) {
        const refresh = () => this.emit()
        room.on(RoomEvent.ParticipantConnected, refresh)
        room.on(RoomEvent.ParticipantDisconnected, refresh)
        room.on(RoomEvent.TrackSubscribed, refresh)
        room.on(RoomEvent.TrackUnsubscribed, refresh)
        room.on(RoomEvent.TrackMuted, refresh)
        room.on(RoomEvent.TrackUnmuted, refresh)
        // 活跃说话者变化 -> 重新渲染, 用于本地/其他人的说话音量条
        room.on(RoomEvent.ActiveSpeakersChanged, refresh)
        room.on(RoomEvent.MediaDevicesChanged, () => { this.refreshAudioInputs() })
        room.on(RoomEvent.LocalTrackPublished, () => { this.syncLocalFlags() })
        room.on(RoomEvent.LocalTrackUnpublished, () => { this.syncLocalFlags() })
        room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
            this.audioBlocked = !room.canPlaybackAudio
            this.emit()
        })
        room.on(RoomEvent.Reconnecting, () => { this.phase = 'connecting'; this.emit() })
        room.on(RoomEvent.Reconnected, () => { this.phase = 'connected'; this.emit() })
        room.on(RoomEvent.Disconnected, () => this.handleDisconnected())
    }

    private syncLocalFlags() {
        const lp = this.room?.localParticipant
        const mic = lp?.getTrackPublication(Track.Source.Microphone)
        this.isMicOn = !!mic?.track && !mic.isMuted
        const cam = lp?.getTrackPublication(Track.Source.Camera)
        this.isCameraOn = !!cam?.track && !cam.isMuted
        const screen = lp?.getTrackPublication(Track.Source.ScreenShare)
        this.isSharingScreen = !!screen?.track
        const screenAudio = lp?.getTrackPublication(Track.Source.ScreenShareAudio)
        this.isSharingAudio = !!screenAudio?.track
        this.emit()
    }

    async startMeeting(chat: IChat) {
        this.error = undefined
        this.phase = 'connecting'
        this.chatTitle = chat.title ?? undefined
        this.emit()
        try {
            const res = await MeetingApi.startMeeting(ClientManager.client, {
                access_token: this.accessToken(),
                chat_id: chat.id,
                title: chat.title ?? undefined,
            })
            // 立即登记, 保证发起人立刻拿到 starterUserId (不依赖广播事件到达的时机)
            this.activeMeetings[chat.id] = {
                meetingId: res.meeting_id,
                room: res.room,
                title: chat.title ?? undefined,
                starterUserId: res.starter_user_id,
                startedAt: Date.now(),
            }
            await this.joinMeeting(chat.id, res.meeting_id, chat.title ?? undefined)
        } catch (e: any) {
            this.phase = 'error'
            this.error = e?.message || String(e)
            this.emit()
            throw e
        }
    }

    async joinMeeting(chatId: string, meetingId: string, chatTitle?: string) {
        if (this.room) await this.leave()
        this.error = undefined
        this.phase = 'connecting'
        this.chatId = chatId
        this.chatTitle = chatTitle
        this.meetingId = meetingId
        this.starterUserId = this.activeMeetings[chatId]?.starterUserId
        this.emit()

        try {
            const creds = await MeetingApi.getMeetingToken(ClientManager.client, {
                access_token: this.accessToken(),
                chat_id: chatId,
                meeting_id: meetingId,
            })
            this.roomName = creds.room

            // 同源模式: 由当前页面地址推导 LiveKit 信令地址 (nginx/frp 反代 /rtc)
            const serverUrl = creds.url === 'same-origin'
                ? (location.protocol === 'https:' ? 'wss://' + location.host : 'ws://' + location.host)
                : creds.url

            // adaptiveStream 会按元素可见性暂停订阅, 与自定义瓦片(会切换屏幕/摄像头源)配合时
            // 容易出现"切回摄像头后一直黑屏", 6 人以内无需它
            const room = new Room({ adaptiveStream: false, dynacast: true })
            this.room = room
            this.bindRoom(room)

            await room.connect(serverUrl, creds.token)

            // 入会由用户手势触发, 默认开启麦克风 (含降噪/回声消除/自动增益)
            try {
                await room.localParticipant.setMicrophoneEnabled(true, this.micCaptureOptions())
            } catch (e) {
                console.warn('[Meeting] 麦克风开启失败', e)
            }
            await this.refreshAudioInputs()

            this.audioBlocked = !room.canPlaybackAudio
            this.syncLocalFlags()
            this.phase = 'connected'
            this.emit()
        } catch (e: any) {
            this.phase = 'error'
            this.error = e?.message || String(e)
            this.emit()
            throw e
        }
    }

    /** 麦克风采集选项: 降噪 + 回声消除 + 自动增益 */
    private micCaptureOptions() {
        return {
            noiseSuppression: this.noiseSuppression,
            echoCancellation: true,
            autoGainControl: true,
        }
    }

    async toggleMic() {
        const lp = this.room?.localParticipant
        if (!lp) return
        await lp.setMicrophoneEnabled(!this.isMicOn, this.micCaptureOptions())
        this.syncLocalFlags()
    }

    /** 开关降噪 (正在通话则重启麦克风轨道以生效) */
    async setNoiseSuppression(enabled: boolean) {
        this.noiseSuppression = enabled
        this.emit()
        const lp = this.room?.localParticipant
        if (!lp || !this.isMicOn) return
        try {
            await lp.setMicrophoneEnabled(false)
            await lp.setMicrophoneEnabled(true, this.micCaptureOptions())
        } catch (e) {
            console.warn('[Meeting] 应用降噪失败', e)
        }
        this.syncLocalFlags()
    }

    /** 枚举可用的麦克风输入设备 */
    async refreshAudioInputs() {
        try {
            const devices = await Room.getLocalDevices('audioinput')
            this.audioInputs = devices.map((d) => ({
                deviceId: d.deviceId,
                label: d.label || ('麦克风 ' + d.deviceId.slice(0, 4)),
            }))
            this.activeAudioInput = this.room?.getActiveDevice('audioinput') || this.audioInputs[0]?.deviceId
            this.emit()
        } catch (e) {
            console.warn('[Meeting] 枚举麦克风失败', e)
        }
    }

    /** 本地静音/取消静音某个成员 (只影响自己) */
    toggleLocalMute(identity: string) {
        if (this.locallyMuted[identity]) delete this.locallyMuted[identity]
        else this.locallyMuted[identity] = true
        this.emit()
    }
    isLocallyMuted(identity: string) {
        return !!this.locallyMuted[identity]
    }

    /** 切换到指定麦克风设备 */
    async setAudioInput(deviceId: string) {
        const room = this.room
        if (!room) return false
        const ok = await room.switchActiveDevice('audioinput', deviceId)
        if (ok) {
            this.activeAudioInput = deviceId
            this.emit()
        }
        return ok
    }

    async toggleCamera() {
        const lp = this.room?.localParticipant
        if (!lp) return
        await lp.setCameraEnabled(!this.isCameraOn)
        this.syncLocalFlags()
    }

    /**
     * 开始共享屏幕, 始终尝试一并共享系统/桌面声音;
     * 浏览器不支持时降级为仅视频。
     *
     * 返回值只用于判断"是否降级", 不用于判断"是否成功共享音频"
     * 实际音频状态请读 MeetingManager.isSharingAudio (由事件驱动, 更准确)
     */
    async startScreenShare(): Promise<{ audioUnsupported: boolean }> {
        const lp = this.room?.localParticipant
        if (!lp) return { audioUnsupported: false }

        try {
            await lp.setScreenShareEnabled(true, { audio: true, systemAudio: 'include' })
        } catch (e) {
            console.warn('[Meeting] 带系统声音共享失败, 降级为仅视频', e)
            await lp.setScreenShareEnabled(true)
            this.syncLocalFlags()
            return { audioUnsupported: true }
        }
        this.syncLocalFlags()
        return { audioUnsupported: false }
    }

    async stopScreenShare() {
        const lp = this.room?.localParticipant
        if (!lp) return
        await lp.setScreenShareEnabled(false)
        this.syncLocalFlags()
    }

    async toggleScreenShare() {
        if (this.isSharingScreen) return this.stopScreenShare()
        return this.startScreenShare()
    }

    async resumeAudio() {
        try {
            await this.room?.startAudio()
        } catch (e) {
            console.warn('[Meeting] 恢复音频失败', e)
        }
        this.audioBlocked = !(this.room?.canPlaybackAudio ?? true)
        this.emit()
    }

    async endMeeting() {
        if (!this.chatId || !this.meetingId) return
        await MeetingApi.endMeeting(ClientManager.client, {
            access_token: this.accessToken(),
            chat_id: this.chatId,
            meeting_id: this.meetingId,
        })
        // 服务端会广播 Meeting_Ended_Event, 由 onMeetingEnded 负责收尾
    }

    async leave() {
        const room = this.room
        this.room = undefined
        this.phase = 'idle'
        this.error = undefined
        this.isMicOn = false
        this.isCameraOn = false
        this.isSharingScreen = false
        this.isSharingAudio = false
        this.audioBlocked = false
        this.roomName = undefined
        this.focusedIdentity = undefined
        this.activeAudioInput = undefined
        this.locallyMuted = {}
        this.emit()
        try {
            room?.disconnect()
            room?.removeAllListeners()
        } catch (e) {
            console.warn('[Meeting] 断开失败', e)
        }
    }

    private handleDisconnected() {
        if (this.phase == 'error') return
        this.room = undefined
        this.phase = 'idle'
        this.isMicOn = false
        this.isCameraOn = false
        this.isSharingScreen = false
        this.isSharingAudio = false
        this.activeAudioInput = undefined
        this.locallyMuted = {}
        this.emit()
    }
}

export const MeetingManager = new MeetingManagerImpl()

export function useMeeting() {
    const [, force] = React.useReducer((x: number) => x + 1, 0)
    React.useEffect(() => MeetingManager.subscribe(force), [])
    return MeetingManager
}
