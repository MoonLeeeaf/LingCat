import { create } from 'zustand'

/**
 * 全局聊天音频播放器。
 * 真正的 <audio> 元素独立于消息列表/React 生命周期, 滚动、切会话都不会中断。
 * 只会被 Attachment 的 audio 分支调用 (mime audio/*), 图片/webp 不会进来。
 */

export interface ChatAudioTrack {
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
}

interface ChatAudioState {
    track: ChatAudioTrack | null
    playing: boolean
    currentTime: number
    duration: number
    error?: string

    play: (track: ChatAudioTrack) => void
    toggle: () => void
    pause: () => void
    stop: () => void
    seek: (time: number) => void
}

let audio: HTMLAudioElement | null = null

function getAudio(): HTMLAudioElement | null {
    if (typeof Audio === 'undefined') return null
    if (audio) return audio

    audio = new Audio()
    audio.preload = 'metadata'

    const updateDuration = () => {
        const d = audio?.duration
        useChatAudioStore.setState({ duration: Number.isFinite(d) ? Number(d) : 0 })
    }

    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('timeupdate', () => {
        if (!useChatAudioStore.getState().track) return
        useChatAudioStore.setState({ currentTime: audio?.currentTime ?? 0 })
    })
    audio.addEventListener('play', () => useChatAudioStore.setState({ playing: true, error: undefined }))
    audio.addEventListener('pause', () => useChatAudioStore.setState({ playing: false }))
    audio.addEventListener('ended', () => {
        useChatAudioStore.setState({ playing: false, currentTime: audio?.duration || 0 })
    })
    audio.addEventListener('error', () => {
        useChatAudioStore.setState({ playing: false, error: '音频播放失败' })
    })

    return audio
}

export const useChatAudioStore = create<ChatAudioState>((set, get) => ({
    track: null,
    playing: false,
    currentTime: 0,
    duration: 0,

    play: (track) => {
        const el = getAudio()
        if (!el) return

        const current = get().track
        if (current?.url === track.url) {
            // 同一条音频: 续播/重播
            if (el.ended || (el.duration && el.currentTime >= el.duration - 0.05)) el.currentTime = 0
            set({ track: { ...current, ...track }, error: undefined })
            void el.play().catch(() => set({ playing: false, error: '音频播放失败' }))
            return
        }

        el.pause()
        el.src = track.url
        el.load()
        set({ track, playing: false, currentTime: 0, duration: 0, error: undefined })
        void el.play().catch(() => set({ playing: false, error: '音频播放失败' }))
    },

    toggle: () => {
        const el = getAudio()
        const track = get().track
        if (!el || !track) return
        if (!el.paused) {
            el.pause()
            return
        }
        if (el.ended || (el.duration && el.currentTime >= el.duration - 0.05)) el.currentTime = 0
        void el.play().catch(() => set({ playing: false, error: '音频播放失败' }))
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
        set({ track: null, playing: false, currentTime: 0, duration: 0, error: undefined })
    },

    seek: (time) => {
        const el = getAudio()
        const duration = get().duration
        if (!el || !Number.isFinite(time)) return
        const next = Math.max(0, Math.min(duration || 0, time))
        try { el.currentTime = next } catch { /* ignore */ }
        set({ currentTime: next })
    },
}))

export function formatAudioTime(sec: number): string {
    if (!Number.isFinite(sec) || sec < 0) sec = 0
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${String(s).padStart(2, '0')}`
}
