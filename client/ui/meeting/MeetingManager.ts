import React from 'react'
import { Room, RoomEvent, Track, type Participant } from 'livekit-client'
import { MeetingApi } from 'lingcat-client-protocol'
import { IChat, Methods, LingCatProto, type Package } from 'lingcat-protocol'
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

    /** 已按 metadata 自动决定过本地静音的 identity (用户手动操作后不再自动覆盖) */
    private autoMuteDecided: { [identity: string]: boolean } = {}

    /** 会议本地设置 (持久化到 localStorage) */
    settings = loadMeetingSettings()

    /** 群消息气泡: identity -> { 文本, 时间戳 } (短暂显示在对应瓦片上) */
    bubbles: { [identity: string]: { text: string, at: number } } = {}
    private chatMsgListener?: (p: Package) => void
    private bubbleTimers: { [identity: string]: ReturnType<typeof setTimeout> } = {}

    /** 会议面板是否停靠为分栏模式 (左侧画面 / 右侧聊天) */
    dock = false
    /** 分栏模式下会议面板宽度百分比 (可拖动分隔条调整) */
    dockWidthPercent = 50
    /** 正在最大化的成员 (通常是某人的屏幕共享) */
    focusedIdentity?: string
    /** 最大化的是该成员的哪一路画面 */
    focusedSource: 'screen' | 'camera' = 'screen'

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

    /** 修改并保存会议本地设置 */
    setMeetingSetting(key: keyof ReturnType<typeof loadMeetingSettings>, value: boolean) {
        this.settings[key] = value
        saveMeetingSettings(this.settings)
        this.emit()
    }

    setDockWidthPercent(v: number) {
        this.dockWidthPercent = Math.min(80, Math.max(20, v))
        this.emit()
    }

    setFocused(identity?: string, source: 'screen' | 'camera' = 'screen') {
        this.focusedIdentity = identity
        this.focusedSource = source
        this.emit()
    }

    private bindRoom(room: Room) {
        const refresh = () => this.emit()
        room.on(RoomEvent.ParticipantConnected, (p) => { this.maybeAutoLocalMute(p); refresh() })
        room.on(RoomEvent.ParticipantDisconnected, refresh)
        room.on(RoomEvent.TrackSubscribed, refresh)
        room.on(RoomEvent.TrackUnsubscribed, refresh)
        room.on(RoomEvent.TrackMuted, refresh)
        room.on(RoomEvent.TrackUnmuted, refresh)
        // 参与者改名/改元数据 (例: 机器人改成主播备注) -> 重新渲染;
        // 元数据带 auto_local_mute 时自动本地静音
        room.on(RoomEvent.ParticipantNameChanged, refresh)
        room.on(RoomEvent.ParticipantMetadataChanged, (_meta, p) => { this.maybeAutoLocalMute(p); refresh() })
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

    async startMeeting(chat: Pick<IChat, 'id' | 'title'>) {
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

            // adaptiveStream: 客户端按 <video> 显示尺寸订阅对应 simulcast 层, 小瓦片/不可见时降层或暂停
            // dynacast: 发布端只发送有订阅者的层
            const room = new Room({ adaptiveStream: true, dynacast: true })
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
            this.startChatBubbles(chatId)
            this.syncLocalFlags()
            // 对已在房间内、metadata 标记 auto_local_mute 的成员自动本地静音
            room.remoteParticipants.forEach((p) => this.maybeAutoLocalMute(p))
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
        // 用户手动操作过 -> 记录, 之后不再按 metadata 自动覆盖
        this.autoMuteDecided[identity] = true
        if (this.locallyMuted[identity]) delete this.locallyMuted[identity]
        else this.locallyMuted[identity] = true
        this.emit()
    }
    isLocallyMuted(identity: string) {
        return !!this.locallyMuted[identity]
    }

    /**
     * 若参与者 metadata 带 auto_local_mute (如直播流转发), 则自动对其开启本地静音。
     * 仅在客户端开关 autoMuteStreams 打开、且用户未手动操作过该成员时生效。
     */
    private maybeAutoLocalMute(participant: Participant) {
        if (!this.settings.autoMuteStreams) return
        if (this.autoMuteDecided[participant.identity]) return
        let meta: any = {}
        try { meta = JSON.parse(participant.metadata || '{}') } catch { }
        if (!meta?.auto_local_mute) return
        this.autoMuteDecided[participant.identity] = true
        if (!this.locallyMuted[participant.identity]) {
            this.locallyMuted[participant.identity] = true
            this.emit()
        }
    }

    /**
     * 监听当前对话的群消息, 给发送者在瓦片上冒出对话气泡
     */
    private startChatBubbles(chatId: string) {
        this.stopChatBubbles()
        const listener = (p: Package) => {
            if (p.method_id !== Methods.Receive_Chat_Message_Event) return
            let raw: any
            try { raw = LingCatProto.methods.Receive_Chat_Message_Event.decode(p.data).msg } catch { return }
            if (!raw || raw.chatId !== chatId) return
            if (raw.system || !raw.senderUserId) return
            const text = bubbleText(raw.text || '')
            if (!text) return
            this.setBubble(raw.senderUserId, text)
        }
        this.chatMsgListener = listener
        ClientManager.client?.addOnReceiveListener(listener)
    }
    private stopChatBubbles() {
        if (this.chatMsgListener) {
            ClientManager.client?.removeOnReceiveListener(this.chatMsgListener)
            this.chatMsgListener = undefined
        }
        Object.values(this.bubbleTimers).forEach((t) => clearTimeout(t))
        this.bubbleTimers = {}
        this.bubbles = {}
    }
    private setBubble(identity: string, text: string) {
        this.bubbles[identity] = { text, at: Date.now() }
        if (this.bubbleTimers[identity]) clearTimeout(this.bubbleTimers[identity])
        // 停留时长与 CSS 动画 lingcat-bubble 的 6s 保持一致 (末尾淡出)
        this.bubbleTimers[identity] = setTimeout(() => {
            delete this.bubbles[identity]
            delete this.bubbleTimers[identity]
            this.emit()
        }, 6000)
        this.emit()
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
        this.autoMuteDecided = {}
        this.stopChatBubbles()
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
        this.autoMuteDecided = {}
        this.stopChatBubbles()
        this.emit()
    }
}

export interface MeetingSettings {
    /** 是否在瓦片上显示群消息气泡 */
    showBubble: boolean
    /** 是否显示瓦片上的"本地静音"按钮 */
    showLocalMute: boolean
    /** 是否显示摄像头按钮 (关闭可防误触) */
    showCameraButton: boolean
    /** 直播流等 (metadata.auto_local_mute) 加入时自动本地静音 */
    autoMuteStreams: boolean
    /** 在视频瓦片上显示统计信息 (调试) */
    showMediaStats: boolean
}
function loadMeetingSettings(): MeetingSettings {
    const def: MeetingSettings = { showBubble: true, showLocalMute: true, showCameraButton: true, autoMuteStreams: true, showMediaStats: false }
    try {
        const raw = localStorage.getItem('lingcat.meeting.settings')
        return raw ? { ...def, ...JSON.parse(raw) } : def
    } catch {
        return def
    }
}
function saveMeetingSettings(s: MeetingSettings) {
    try { localStorage.setItem('lingcat.meeting.settings', JSON.stringify(s)) } catch { }
}

/** 把消息富文本精简成气泡里显示的纯文本 */
function bubbleText(text: string): string {
    let out = text
        // 图片/视频/文件/提及: ![alt](url) -> alt(去语义前缀)
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, (_m, alt: string) => {
            const eq = alt.indexOf('=')
            if (eq >= 0) return alt.slice(eq + 1)          // UserMention=@name -> @name
            if (alt.startsWith('图片')) return '[图片]'
            if (alt.startsWith('视频')) return '[视频]'
            if (alt.startsWith('文件')) return '[文件]'
            return alt
        })
        // 普通链接 [label](url) -> label
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\s+/g, ' ')
        .trim()
    if (out.length > 100) out = out.slice(0, 100) + '…'
    return out
}

export const MeetingManager = new MeetingManagerImpl()

export function useMeeting() {
    const [, force] = React.useReducer((x: number) => x + 1, 0)
    React.useEffect(() => MeetingManager.subscribe(force), [])
    return MeetingManager
}
