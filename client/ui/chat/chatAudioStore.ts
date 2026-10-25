import { create } from 'zustand'
import { FileApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import SessionEnv from '../../SessionEnv.ts'
import getFileUrl from '../../lib/getFileUrl.ts'

/**
 * 全局聊天音频播放器。
 * 真正的 <audio> 元素独立于消息列表/React 生命周期, 滚动、切会话都不会中断。
 * 只会被 Attachment 的 audio 分支调用 (mime audio/*), 图片/webp 不会进来。
 */

export interface ChatAudioTrack {
    /** 稳定标识 (hash 或 url), 用于重试换 URL 后仍保持同一条 */
    key: string
    url: string
    name: string
    /** 用于点击横幅跳回对应会话 */
    chatId?: string
    chatTitle?: string
    /** 消息 seq, 用于跳转后定位 */
    messageId?: number
    senderName?: string
    /** 文件 hash (P2: token 过期后续播) */
    hash?: string
    /** 语音消息不进入顶部横幅, 仅消息内播放 */
    isVoice?: boolean
}

interface ChatAudioState {
    track: ChatAudioTrack | null
    playing: boolean
    buffering: boolean
    currentTime: number
    duration: number
    rate: number
    error?: string

    play: (track: ChatAudioTrack) => void
    toggle: () => void
    resume: () => void
    pause: () => void
    stop: () => void
    seek: (time: number) => void
    setRate: (rate: number) => void
    retry: () => void
}

let audio: HTMLAudioElement | null = null
const retriedKeys = new Set<string>()
const RATE_STORAGE_KEY = 'lingcat_audio_rate'
const PLAYBACK_RATES = [1, 1.5, 2]

function loadPlaybackRate(): number {
    try {
        if (typeof localStorage === 'undefined') return 1
        const rate = Number(localStorage.getItem(RATE_STORAGE_KEY))
        return PLAYBACK_RATES.includes(rate) ? rate : 1
    } catch {
        return 1
    }
}

const initialRate = loadPlaybackRate()

function hasMediaSession(): boolean {
    return typeof navigator !== 'undefined' && 'mediaSession' in navigator
}

function setPlaybackState(state: MediaSessionPlaybackState) {
    if (!hasMediaSession()) return
    try { navigator.mediaSession.playbackState = state } catch { /* ignore */ }
}

function updateMediaMetadata(track: ChatAudioTrack | null) {
    if (!hasMediaSession()) return
    if (!track) {
        try { navigator.mediaSession.metadata = null } catch { /* ignore */ }
        return
    }
    if (typeof MediaMetadata === 'undefined') return
    try {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: track.name || '语音消息',
            artist: track.senderName || track.chatTitle || '',
            album: track.chatTitle || '',
        })
    } catch { /* ignore */ }
}

function updatePositionState() {
    if (!hasMediaSession() || typeof navigator.mediaSession.setPositionState !== 'function') return
    const d = audio?.duration
    if (!audio || !Number.isFinite(d) || !d || d <= 0) return
    try {
        navigator.mediaSession.setPositionState({
            duration: d,
            playbackRate: audio.playbackRate,
            position: Math.min(audio.currentTime, d),
        })
    } catch { /* ignore */ }
}

function getAudio(): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null
    if (audio) return audio

    audio = new Audio()
    audio.preload = 'metadata'
    audio.playbackRate = initialRate

    if (hasMediaSession()) {
        const ms = navigator.mediaSession
        const safe = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
            try { ms.setActionHandler(action, handler) } catch { /* unsupported */ }
        }
        safe('play', () => useChatAudioStore.getState().resume())
        safe('pause', () => useChatAudioStore.getState().pause())
        safe('stop', () => useChatAudioStore.getState().stop())
        safe('seekbackward', (d) => {
            const st = useChatAudioStore.getState()
            st.seek(st.currentTime - (typeof d.seekOffset === 'number' ? d.seekOffset : 10))
        })
        safe('seekforward', (d) => {
            const st = useChatAudioStore.getState()
            st.seek(st.currentTime + (typeof d.seekOffset === 'number' ? d.seekOffset : 10))
        })
        safe('seekto', (d) => {
            if (typeof d.seekTime === 'number') useChatAudioStore.getState().seek(d.seekTime)
        })
    }

    const updateDuration = () => {
        const d = audio?.duration
        useChatAudioStore.setState({ duration: Number.isFinite(d) ? Number(d) : 0 })
        updatePositionState()
    }

    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('timeupdate', () => {
        if (!useChatAudioStore.getState().track) return
        useChatAudioStore.setState({ currentTime: audio?.currentTime ?? 0 })
        updatePositionState()
    })
    audio.addEventListener('loadstart', () => {
        if (useChatAudioStore.getState().track) useChatAudioStore.setState({ buffering: true })
    })
    audio.addEventListener('waiting', () => {
        if (useChatAudioStore.getState().track) useChatAudioStore.setState({ buffering: true })
    })
    audio.addEventListener('stalled', () => {
        if (useChatAudioStore.getState().track) useChatAudioStore.setState({ buffering: true })
    })
    audio.addEventListener('canplay', () => useChatAudioStore.setState({ buffering: false }))
    audio.addEventListener('play', () => {
        useChatAudioStore.setState({ playing: true, buffering: false, error: undefined })
        setPlaybackState('playing')
    })
    audio.addEventListener('pause', () => {
        useChatAudioStore.setState({ playing: false, buffering: false })
        setPlaybackState('paused')
    })
    audio.addEventListener('ended', () => {
        useChatAudioStore.setState({ playing: false, buffering: false, currentTime: audio?.duration || 0 })
        setPlaybackState('paused')
    })
    audio.addEventListener('error', () => {
        const state = useChatAudioStore.getState()
        const track = state.track
        useChatAudioStore.setState({ playing: false, buffering: false, error: '音频播放失败' })
        if (track?.hash && !retriedKeys.has(track.key)) {
            retriedKeys.add(track.key)
            void retryWithFreshToken(track, state.currentTime)
        }
    })

    return audio
}

async function retryWithFreshToken(track: ChatAudioTrack, position: number) {
    const client = ClientManager.getActiveClient()
    const session = ClientManager.getActiveSession()
    if (!client || !session || !track.hash) return
    useChatAudioStore.setState({ error: undefined, buffering: true })
    try {
        const token = await FileApi.requestAccessUploadFileToken(client, {
            access_token: session.token,
            file_hash: track.hash,
        })
        SessionEnv.myFileAccessToken = token
        const freshUrl = getFileUrl(track.hash, token)
        const el = getAudio()
        if (!freshUrl || !el) {
            useChatAudioStore.setState({ buffering: false })
            return
        }
        el.src = freshUrl
        el.load()
        el.playbackRate = useChatAudioStore.getState().rate
        const resume = Math.max(0, position)
        el.addEventListener('loadedmetadata', () => {
            try {
                el.currentTime = Math.min(resume, Number.isFinite(el.duration) ? el.duration : resume)
            } catch { /* ignore */ }
        }, { once: true })
        useChatAudioStore.setState({
            track: { ...track, url: freshUrl },
            currentTime: resume,
            duration: 0,
            error: undefined,
            buffering: true,
        })
        void el.play().catch(() => useChatAudioStore.setState({ playing: false, buffering: false, error: '音频播放失败' }))
    } catch {
        useChatAudioStore.setState({ playing: false, buffering: false, error: '音频播放失败' })
    }
}

export const useChatAudioStore = create<ChatAudioState>((set, get) => ({
    track: null,
    playing: false,
    buffering: false,
    currentTime: 0,
    duration: 0,
    rate: initialRate,

    play: (track) => {
        const el = getAudio()
        if (!el) return

        el.playbackRate = get().rate
        const current = get().track
        if (current?.key === track.key) {
            // 同一条音频: 续播/重播
            if (el.ended || (el.duration && el.currentTime >= el.duration - 0.05)) el.currentTime = 0
            set({ track: { ...current, ...track }, error: undefined })
            updateMediaMetadata({ ...current, ...track })
            void el.play().catch(() => set({ playing: false, buffering: false, error: '音频播放失败' }))
            return
        }

        el.pause()
        el.src = track.url
        el.load()
        set({ track, playing: false, buffering: true, currentTime: 0, duration: 0, error: undefined })
        updateMediaMetadata(track)
        void el.play().catch(() => set({ playing: false, buffering: false, error: '音频播放失败' }))
    },

    toggle: () => {
        const el = getAudio()
        const track = get().track
        if (!el || !track) return
        if (!el.paused) {
            el.pause()
            return
        }
        el.playbackRate = get().rate
        if (el.ended || (el.duration && el.currentTime >= el.duration - 0.05)) el.currentTime = 0
        void el.play().catch(() => set({ playing: false, buffering: false, error: '音频播放失败' }))
    },

    resume: () => {
        const el = getAudio()
        const track = get().track
        if (!el || !track) return
        el.playbackRate = get().rate
        if (el.ended || (el.duration && el.currentTime >= el.duration - 0.05)) el.currentTime = 0
        void el.play().catch(() => set({ playing: false, buffering: false, error: '音频播放失败' }))
    },

    pause: () => {
        getAudio()?.pause()
    },

    stop: () => {
        const el = getAudio()
        if (el) {
            el.pause()
            el.removeAttribute('src')
            el.load()
        }
        set({ track: null, playing: false, buffering: false, currentTime: 0, duration: 0, error: undefined })
        updateMediaMetadata(null)
        setPlaybackState('none')
    },

    seek: (time) => {
        const el = getAudio()
        const duration = get().duration
        if (!el || !Number.isFinite(time)) return
        const next = Math.max(0, Math.min(duration || 0, time))
        try { el.currentTime = next } catch { /* ignore */ }
        set({ currentTime: next })
        updatePositionState()
    },

    setRate: (rate) => {
        const next = PLAYBACK_RATES.includes(rate) ? rate : 1
        const el = getAudio()
        if (el) el.playbackRate = next
        try { localStorage.setItem(RATE_STORAGE_KEY, String(next)) } catch { /* ignore */ }
        set({ rate: next })
        updatePositionState()
    },

    retry: () => {
        const { track, currentTime } = get()
        if (!track) return
        set({ error: undefined, buffering: true })
        if (track.hash) {
            void retryWithFreshToken(track, currentTime)
            return
        }
        const el = getAudio()
        if (!el) {
            set({ buffering: false })
            return
        }
        el.playbackRate = get().rate
        el.src = track.url
        el.load()
        el.addEventListener('loadedmetadata', () => {
            try { el.currentTime = Math.min(currentTime, el.duration || currentTime) } catch { /* ignore */ }
        }, { once: true })
        void el.play().catch(() => set({ playing: false, buffering: false, error: '音频播放失败' }))
    },
}))

export function formatAudioTime(sec: number): string {
    if (!Number.isFinite(sec) || sec < 0) sec = 0
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${String(s).padStart(2, '0')}`
}
