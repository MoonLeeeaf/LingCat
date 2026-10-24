import { Room, RoomEvent, Track, type Participant } from 'livekit-client'
import { create } from 'zustand'
import { ChatApi, MeetingApi } from 'lingcat-client-protocol'
import { Methods, LingCatProto, type IChat, type IMessageEntity, type Package } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'

// ============================================================
//                      类型
// ============================================================

export type MeetingPhase = 'idle' | 'connecting' | 'connected' | 'error'

export interface ActiveMeeting {
    meetingId: string
    room: string
    title?: string
    starterUserId: string
    startedAt: number
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

const DEFAULT_SETTINGS: MeetingSettings = {
    showBubble: true,
    showLocalMute: true,
    showCameraButton: true,
    autoMuteStreams: true,
    showMediaStats: false,
}

function loadMeetingSettings(): MeetingSettings {
    try {
        const raw = localStorage.getItem('lingcat.meeting.settings')
        return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : { ...DEFAULT_SETTINGS }
    } catch {
        return { ...DEFAULT_SETTINGS }
    }
}

function saveMeetingSettings(s: MeetingSettings): void {
    try { localStorage.setItem('lingcat.meeting.settings', JSON.stringify(s)) } catch { }
}

// ============================================================
//                      工具
// ============================================================

/**
 * 把消息精简成气泡里显示的纯文本。
 * 消息结构是 text + entities (附件在 text 里是 \uFFFC 占位符), 需按 entity 语义替换。
 */
function bubbleTextFromEntities(text: string, entities: IMessageEntity[]): string {
    const collapse = (s: string): string => {
        const t = s.replace(/\uFFFC/g, ' ').replace(/\s+/g, ' ').trim()
        return t.length > 100 ? t.slice(0, 100) + '…' : t
    }
    if (!entities?.length) return collapse(text)

    const sorted = [...entities].sort((a, b) => a.offset - b.offset)
    let out = ''
    let cursor = 0
    for (const e of sorted) {
        if (e.offset > cursor) out += text.slice(cursor, e.offset)
        const seg = text.slice(e.offset, e.offset + e.length)
        switch (e.type) {
            case 'attachment': out += '[附件]'; break
            case 'reply': out += '[回复] '; break
            default: out += seg
        }
        cursor = e.offset + e.length
    }
    if (cursor < text.length) out += text.slice(cursor)
    return collapse(out)
}

// ============================================================
//                      模块级私有状态
//                      (不需要响应式，不进 store)
// ============================================================

let autoMuteDecided: Record<string, boolean> = {}
let chatMsgListener: ((pkg: Package) => void) | undefined
let bubbleTimers: Record<string, ReturnType<typeof setTimeout>> = {}

// ============================================================
//                      Store
// ============================================================

interface MeetingState {
    // 连接
    room?: Room
    phase: MeetingPhase
    error?: string

    chatId?: string
    chatTitle?: string
    meetingId?: string
    roomName?: string
    starterUserId?: string

    // 权限
    iAmChatAdmin: boolean
    myChatAdminRole: string | null
    myChatAdminPermissions: string | null

    // 本地媒体
    isMicOn: boolean
    isCameraOn: boolean
    isSharingScreen: boolean
    isSharingAudio: boolean
    audioBlocked: boolean
    noiseSuppression: boolean

    audioInputs: { deviceId: string, label: string }[]
    activeAudioInput?: string

    // 其他成员
    locallyMuted: Record<string, boolean>

    // 设置
    settings: MeetingSettings

    // 消息气泡
    bubbles: Record<string, { text: string, at: number }>

    // 聚焦
    focusedIdentity?: string
    focusedSource: 'screen' | 'camera'

    // 活跃会议（由广播事件维护）
    activeMeetings: Record<string, ActiveMeeting>

    /** 用于强制刷新订阅者：LiveKit 内部状态变化时 +1 */
    rev: number
}

interface MeetingActions {
    joinMeeting(chatId: string, meetingId: string, chatTitle?: string): Promise<void>
    startMeeting(chat: Pick<IChat, 'id' | 'title'>, title?: string): Promise<void>
    leave(): void
    endMeeting(): Promise<void>

    toggleMic(): Promise<void>
    toggleCamera(): Promise<void>
    toggleScreenShare(): Promise<void>
    stopScreenShare(): Promise<void>
    resumeAudio(): Promise<void>
    setNoiseSuppression(enabled: boolean): Promise<void>
    setAudioInput(deviceId: string): Promise<boolean>
    refreshAudioInputs(): Promise<void>

    toggleLocalMute(identity: string): void
    isLocallyMuted(identity: string): boolean

    setMeetingSetting<K extends keyof MeetingSettings>(key: K, value: MeetingSettings[K]): void
    setFocused(identity?: string, source?: 'screen' | 'camera'): void

    onMeetingStarted(ev: { chatId: string, meetingId: string, room: string, starterUserId: string, title?: string | null }): void
    onMeetingEnded(ev: { chatId: string, meetingId: string }): void
    refreshActiveMeeting(chatId: string): Promise<void>

    getActiveMeeting(chatId: string): ActiveMeeting | undefined
    isInMeeting(chatId?: string): boolean
    isActive(): boolean
}

export type MeetingStore = MeetingState & MeetingActions

export const useMeetingStore = create<MeetingStore>((set, get) => {
    // ============================================================
    //                      内部辅助
    // ============================================================

    const accessToken = (): string => {
        const session = ClientManager.getActiveSession()
        if (!session) throw new Error('no active session')
        return session.token
    }

    const micCaptureOptions = () => ({
        noiseSuppression: get().noiseSuppression,
        echoCancellation: true,
        autoGainControl: true,
    })

    const bumpRev = () => set(s => ({ rev: s.rev + 1 }))

    const syncLocalFlags = () => {
        const lp = get().room?.localParticipant
        if (!lp) return
        const mic = lp.getTrackPublication(Track.Source.Microphone)
        const cam = lp.getTrackPublication(Track.Source.Camera)
        const screen = lp.getTrackPublication(Track.Source.ScreenShare)
        const screenAudio = lp.getTrackPublication(Track.Source.ScreenShareAudio)
        set({
            isMicOn: !!mic?.track && !mic.isMuted,
            isCameraOn: !!cam?.track && !cam.isMuted,
            isSharingScreen: !!screen?.track,
            isSharingAudio: !!screenAudio?.track,
        })
    }

    const stopChatBubbles = () => {
        if (chatMsgListener) {
            ClientManager.getActiveClient()?.removeOnReceiveListener(chatMsgListener)
            chatMsgListener = undefined
        }
        Object.values(bubbleTimers).forEach(t => clearTimeout(t))
        bubbleTimers = {}
        set({ bubbles: {} })
    }

    const setBubble = (identity: string, text: string) => {
        if (bubbleTimers[identity]) clearTimeout(bubbleTimers[identity])
        bubbleTimers[identity] = setTimeout(() => {
            delete bubbleTimers[identity]
            set(s => {
                const next = { ...s.bubbles }
                delete next[identity]
                return { bubbles: next }
            })
        }, 6000)
        set(s => ({ bubbles: { ...s.bubbles, [identity]: { text, at: Date.now() } } }))
    }

    const startChatBubbles = (chatId: string) => {
        stopChatBubbles()
        const client = ClientManager.getActiveClient()
        if (!client) return

        const listener = (pkg: Package) => {
            if (pkg.method_id !== Methods.Receive_Chat_Message_Event) return
            let raw: any
            try {
                raw = LingCatProto.methods.Receive_Chat_Message_Event.decode(pkg.data).msg
            } catch { return }
            if (!raw || raw.chatId !== chatId) return
            if (raw.system || !raw.senderUserId) return
            const text = bubbleTextFromEntities(raw.text || '', (raw.entities ?? []) as IMessageEntity[])
            if (!text) return
            setBubble(raw.senderUserId, text)
        }
        chatMsgListener = listener
        client.addOnReceiveListener(listener)
    }

    const maybeAutoLocalMute = (participant: Participant) => {
        if (!get().settings.autoMuteStreams) return
        if (autoMuteDecided[participant.identity]) return
        let meta: any = {}
        try { meta = JSON.parse(participant.metadata || '{}') } catch { }
        if (!meta?.auto_local_mute) return
        autoMuteDecided[participant.identity] = true
        if (!get().locallyMuted[participant.identity]) {
            set(s => ({ locallyMuted: { ...s.locallyMuted, [participant.identity]: true } }))
        }
    }

    const handleDisconnected = () => {
        if (get().phase === 'error') return
        autoMuteDecided = {}
        stopChatBubbles()
        set({
            room: undefined,
            phase: 'idle',
            isMicOn: false,
            isCameraOn: false,
            isSharingScreen: false,
            isSharingAudio: false,
            activeAudioInput: undefined,
            locallyMuted: {},
            iAmChatAdmin: false,
            myChatAdminRole: null,
            myChatAdminPermissions: null,
        })
    }

    const bindRoom = (room: Room) => {
        const refresh = bumpRev
        room.on(RoomEvent.ParticipantConnected, (p) => { maybeAutoLocalMute(p); refresh() })
        room.on(RoomEvent.ParticipantDisconnected, refresh)
        room.on(RoomEvent.TrackSubscribed, refresh)
        room.on(RoomEvent.TrackUnsubscribed, refresh)
        room.on(RoomEvent.TrackMuted, refresh)
        room.on(RoomEvent.TrackUnmuted, refresh)
        room.on(RoomEvent.ParticipantNameChanged, refresh)
        room.on(RoomEvent.ParticipantMetadataChanged, (_meta, p) => { maybeAutoLocalMute(p); refresh() })
        room.on(RoomEvent.ActiveSpeakersChanged, refresh)
        room.on(RoomEvent.MediaDevicesChanged, () => { void get().refreshAudioInputs() })
        room.on(RoomEvent.LocalTrackPublished, syncLocalFlags)
        room.on(RoomEvent.LocalTrackUnpublished, syncLocalFlags)
        room.on(RoomEvent.AudioPlaybackStatusChanged, () => {
            set({ audioBlocked: !room.canPlaybackAudio })
        })
        room.on(RoomEvent.Reconnecting, () => set({ phase: 'connecting' }))
        room.on(RoomEvent.Reconnected, () => set({ phase: 'connected' }))
        room.on(RoomEvent.Disconnected, handleDisconnected)
    }

    const loadChatAdminFlag = async (chatId: string) => {
        try {
            const client = ClientManager.getActiveClient()
            if (!client) return
            const admins = await ChatApi.getChatAdmins(client, {
                access_token: accessToken(),
                chat_id: chatId,
            })
            const me = await ClientManager.getMe()
            const mine = admins?.find(a => a.id === me.id)
            if (get().chatId !== chatId) return
            set({
                iAmChatAdmin: !!mine,
                myChatAdminRole: mine?.role ?? null,
                myChatAdminPermissions: mine?.permissions ?? null,
            })
        } catch {
            if (get().chatId !== chatId) return
            set({
                iAmChatAdmin: false,
                myChatAdminRole: null,
                myChatAdminPermissions: null,
            })
        }
    }

    // ============================================================
    //                      Store 定义
    // ============================================================

    return {
        // -------------------- 初始状态 --------------------
        room: undefined,
        phase: 'idle',
        error: undefined,

        chatId: undefined,
        chatTitle: undefined,
        meetingId: undefined,
        roomName: undefined,
        starterUserId: undefined,

        iAmChatAdmin: false,
        myChatAdminRole: null,
        myChatAdminPermissions: null,

        isMicOn: false,
        isCameraOn: false,
        isSharingScreen: false,
        isSharingAudio: false,
        audioBlocked: false,
        noiseSuppression: true,

        audioInputs: [],
        activeAudioInput: undefined,

        locallyMuted: {},
        settings: loadMeetingSettings(),
        bubbles: {},

        focusedIdentity: undefined,
        focusedSource: 'screen',

        activeMeetings: {},
        rev: 0,

        // -------------------- Actions --------------------

        joinMeeting: async (chatId, meetingId, chatTitle) => {
            if (get().room) await get().leave()

            set({
                error: undefined,
                phase: 'connecting',
                chatId,
                chatTitle,
                meetingId,
                starterUserId: get().activeMeetings[chatId]?.starterUserId,
            })

            try {
                const client = ClientManager.getActiveClient()
                if (!client) throw new Error('no active client')

                const creds = await MeetingApi.getMeetingToken(client, {
                    access_token: accessToken(),
                    chat_id: chatId,
                    meeting_id: meetingId,
                })
                set({ roomName: creds.room })

                const serverUrl = creds.url === 'same-origin'
                    ? (location.protocol === 'https:' ? 'wss://' + location.host : 'ws://' + location.host)
                    : creds.url

                const room = new Room({ adaptiveStream: true, dynacast: true })
                set({ room })
                bindRoom(room)

                await room.connect(serverUrl, creds.token)

                try {
                    await room.localParticipant.setMicrophoneEnabled(true, micCaptureOptions())
                } catch (e) {
                    console.warn('[Meeting] 麦克风开启失败', e)
                }
                await get().refreshAudioInputs()

                set({ audioBlocked: !room.canPlaybackAudio })
                startChatBubbles(chatId)
                syncLocalFlags()
                room.remoteParticipants.forEach(p => maybeAutoLocalMute(p))
                set({ phase: 'connected' })

                void loadChatAdminFlag(chatId)
            } catch (e: any) {
                set({
                    phase: 'error',
                    error: e?.message || String(e),
                })
                throw e
            }
        },

        startMeeting: async (chat, title) => {
            const meetingTitle = title?.trim() || chat.title?.trim() || undefined
            set({
                error: undefined,
                phase: 'connecting',
                chatTitle: meetingTitle,
            })
            try {
                const client = ClientManager.getActiveClient()
                if (!client) throw new Error('no active client')

                const res = await MeetingApi.startMeeting(client, {
                    access_token: accessToken(),
                    chat_id: chat.id,
                    title: meetingTitle,
                })

                // 立即登记，发起人马上能拿到 starterUserId
                set(s => ({
                    activeMeetings: {
                        ...s.activeMeetings,
                        [chat.id]: {
                            meetingId: res.meeting_id,
                            room: res.room,
                            title: meetingTitle,
                            starterUserId: res.starter_user_id,
                            startedAt: Date.now(),
                        },
                    },
                }))

                await get().joinMeeting(chat.id, res.meeting_id, meetingTitle)
            } catch (e: any) {
                set({
                    phase: 'error',
                    error: e?.message || String(e),
                })
                throw e
            }
        },

        leave: () => {
            const { room } = get()
            autoMuteDecided = {}
            stopChatBubbles()
            try { room?.disconnect() } catch { }
            try { room?.removeAllListeners() } catch { }

            set({
                room: undefined,
                phase: 'idle',
                error: undefined,
                isMicOn: false,
                isCameraOn: false,
                isSharingScreen: false,
                isSharingAudio: false,
                audioBlocked: false,
                roomName: undefined,
                focusedIdentity: undefined,
                activeAudioInput: undefined,
                locallyMuted: {},
                bubbles: {},
                iAmChatAdmin: false,
                myChatAdminRole: null,
                myChatAdminPermissions: null,
            })
        },

        endMeeting: async () => {
            const { chatId, meetingId } = get()
            if (!chatId || !meetingId) return
            const client = ClientManager.getActiveClient()
            if (!client) return
            await MeetingApi.endMeeting(client, {
                access_token: accessToken(),
                chat_id: chatId,
                meeting_id: meetingId,
            })
            // 服务端广播 Meeting_Ended_Event → onMeetingEnded → leave
        },

        toggleMic: async () => {
            const lp = get().room?.localParticipant
            if (!lp) return
            await lp.setMicrophoneEnabled(!get().isMicOn, micCaptureOptions())
            syncLocalFlags()
        },

        toggleCamera: async () => {
            const lp = get().room?.localParticipant
            if (!lp) return
            await lp.setCameraEnabled(!get().isCameraOn)
            syncLocalFlags()
        },

        toggleScreenShare: async () => {
            if (get().isSharingScreen) {
                await get().stopScreenShare()
                return
            }
            const lp = get().room?.localParticipant
            if (!lp) return
            try {
                await lp.setScreenShareEnabled(true, { audio: true, systemAudio: 'include' })
            } catch (e) {
                console.warn('[Meeting] 带系统声音共享失败, 降级为仅视频', e)
                await lp.setScreenShareEnabled(true)
            }
            syncLocalFlags()
        },

        stopScreenShare: async () => {
            const lp = get().room?.localParticipant
            if (!lp) return
            await lp.setScreenShareEnabled(false)
            syncLocalFlags()
        },

        resumeAudio: async () => {
            const room = get().room
            if (!room) return
            try { await room.startAudio() } catch (e) { console.warn('[Meeting] 恢复音频失败', e) }
            set({ audioBlocked: !room.canPlaybackAudio })
        },

        setNoiseSuppression: async (enabled) => {
            set({ noiseSuppression: enabled })
            const lp = get().room?.localParticipant
            if (!lp || !get().isMicOn) return
            try {
                await lp.setMicrophoneEnabled(false)
                await lp.setMicrophoneEnabled(true, micCaptureOptions())
            } catch (e) {
                console.warn('[Meeting] 应用降噪失败', e)
            }
            syncLocalFlags()
        },

        setAudioInput: async (deviceId) => {
            const room = get().room
            if (!room) return false
            const ok = await room.switchActiveDevice('audioinput', deviceId)
            if (ok) set({ activeAudioInput: deviceId })
            return ok
        },

        refreshAudioInputs: async () => {
            try {
                const devices = await Room.getLocalDevices('audioinput')
                set({
                    audioInputs: devices.map(d => ({
                        deviceId: d.deviceId,
                        label: d.label || ('麦克风 ' + d.deviceId.slice(0, 4)),
                    })),
                    activeAudioInput: get().room?.getActiveDevice('audioinput') || devices[0]?.deviceId,
                })
            } catch (e) {
                console.warn('[Meeting] 枚举麦克风失败', e)
            }
        },

        toggleLocalMute: (identity) => {
            autoMuteDecided[identity] = true
            set(s => {
                const next = { ...s.locallyMuted }
                if (next[identity]) delete next[identity]
                else next[identity] = true
                return { locallyMuted: next }
            })
        },

        isLocallyMuted: (identity) => !!get().locallyMuted[identity],

        setMeetingSetting: (key, value) => {
            const next = { ...get().settings, [key]: value }
            set({ settings: next })
            saveMeetingSettings(next)
        },

        setFocused: (identity, source = 'screen') => {
            set({ focusedIdentity: identity, focusedSource: source })
        },

        onMeetingStarted: (ev) => {
            set(s => ({
                activeMeetings: {
                    ...s.activeMeetings,
                    [ev.chatId]: {
                        meetingId: ev.meetingId,
                        room: ev.room,
                        title: ev.title ?? undefined,
                        starterUserId: ev.starterUserId,
                        startedAt: Date.now(),
                    },
                },
            }))
        },

        onMeetingEnded: (ev) => {
            const m = get().activeMeetings[ev.chatId]
            set(s => {
                const next = { ...s.activeMeetings }
                if (m && m.meetingId === ev.meetingId) delete next[ev.chatId]
                return { activeMeetings: next }
            })
            if (get().chatId === ev.chatId && get().meetingId === ev.meetingId) {
                get().leave()
            }
        },

        refreshActiveMeeting: async (chatId) => {
            try {
                const client = ClientManager.getActiveClient()
                if (!client) return
                const r = await MeetingApi.getActiveMeeting(client, {
                    access_token: accessToken(),
                    chat_id: chatId,
                })
                if (r.has_meeting) {
                    set(s => ({
                        activeMeetings: {
                            ...s.activeMeetings,
                            [chatId]: {
                                meetingId: r.meeting_id,
                                room: r.room,
                                title: r.title ?? undefined,
                                starterUserId: r.starter_user_id,
                                startedAt: Date.now(),
                            },
                        },
                    }))
                } else {
                    set(s => {
                        const next = { ...s.activeMeetings }
                        delete next[chatId]
                        return { activeMeetings: next }
                    })
                }
            } catch {
                // 静默：可能是网络/权限问题
            }
        },

        getActiveMeeting: (chatId) => get().activeMeetings[chatId],

        isInMeeting: (chatId) => {
            const s = get()
            return !!s.room && (chatId === undefined || s.chatId === chatId)
        },

        isActive: () => {
            const s = get()
            return s.phase !== 'idle' || !!s.room
        },
    }
})