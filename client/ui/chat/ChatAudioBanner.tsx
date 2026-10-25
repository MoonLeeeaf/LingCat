import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from '@tanstack/react-router'
import { useChatAudioStore, formatAudioTime } from './chatAudioStore.ts'
import { useChatMessageStore } from './useChatMessageStore.ts'
import { useMeetingStore } from '../meeting/MeetingManager.ts'

const RATES = [1, 1.5, 2]

/**
 * 全局音频横幅: 位于聊天标题栏下方、会议横幅上方。
 * 切会话/滚动仍显示同一条音频; 点横幅可跳回消息 (P2)。
 * 语音消息不上横幅, 只在消息内播放; 离开会话时停止语音。
 */
export default function ChatAudioBanner({ translucent, chatId }: { translucent?: boolean; chatId?: string }) {
    const track = useChatAudioStore(s => s.track)
    const playing = useChatAudioStore(s => s.playing)
    const buffering = useChatAudioStore(s => s.buffering)
    const currentTime = useChatAudioStore(s => s.currentTime)
    const duration = useChatAudioStore(s => s.duration)
    const rate = useChatAudioStore(s => s.rate)
    const error = useChatAudioStore(s => s.error)
    const [dragTime, setDragTime] = React.useState<number | null>(null)
    const barRef = React.useRef<HTMLDivElement>(null)
    const displayTime = dragTime ?? currentTime
    const navigate = useNavigate()
    const meetingActive = useMeetingStore(s => s.phase === 'connected' || !!s.room)

    React.useEffect(() => {
        if (meetingActive) useChatAudioStore.getState().pause()
    }, [meetingActive])

    // 语音不跨会话继续播放, 避免没有横幅时变成“后台孤儿”
    React.useEffect(() => {
        const current = useChatAudioStore.getState().track
        if (current?.isVoice && current.chatId && current.chatId !== chatId) {
            useChatAudioStore.getState().stop()
        }
    }, [chatId])

    React.useEffect(() => {
        return () => {
            const current = useChatAudioStore.getState().track
            if (current?.isVoice) useChatAudioStore.getState().stop()
        }
    }, [])

    const openTrack = () => {
        if (!track?.chatId) return
        navigate({ to: '/chat/$chatId', params: { chatId: track.chatId } })
        if (track.messageId != null) {
            const seq = track.messageId
            window.setTimeout(() => useChatMessageStore.getState().requestScrollToSeq(seq), 100)
        }
    }

    const toggle = () => useChatAudioStore.getState().toggle()
    const stop = () => useChatAudioStore.getState().stop()
    const retry = () => useChatAudioStore.getState().retry()
    const timeFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = barRef.current?.getBoundingClientRect()
        if (!rect || !duration) return 0
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        return ratio * duration
    }
    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!duration) return
        e.stopPropagation()
        e.preventDefault()
        try { e.currentTarget.setPointerCapture(e.pointerId) } catch { /* ignore */ }
        setDragTime(timeFromPointer(e))
    }
    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (dragTime === null) return
        setDragTime(timeFromPointer(e))
    }
    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (dragTime === null) return
        e.stopPropagation()
        useChatAudioStore.getState().seek(timeFromPointer(e))
        setDragTime(null)
    }

    return (
        <AnimatePresence>
            {track && !track.isVoice && (
                <motion.div
                    key="chat-audio-banner"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    onClick={openTrack}
                    style={{
                        cursor: track.chatId ? 'pointer' : undefined,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        margin: '6px 10px',
                        padding: '6px 6px 6px 10px',
                        borderRadius: '999px',
                        background: translucent
                            ? 'rgba(var(--mdui-color-secondary-container), 0.82)'
                            : 'rgb(var(--mdui-color-secondary-container))',
                        color: 'rgb(var(--mdui-color-on-secondary-container))',
                        boxShadow: 'var(--mdui-shadow-2)',
                        fontSize: '13px',
                        flexShrink: 0,
                    }}
                >
                    <motion.div
                        whileTap={{ scale: 0.92 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                        style={{ display: 'inline-flex', flexShrink: 0 }}
                    >
                        <mdui-button-icon
                            icon={playing ? 'pause' : 'play_arrow'}
                            title={playing ? '暂停' : '播放'}
                            onClick={(e) => { e.stopPropagation(); toggle() }}
                        />
                    </motion.div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                                minWidth: 0,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                opacity: 0.9,
                            }}>
                                {track.name}
                            </span>
                            {(track.senderName || track.chatTitle) && (
                                <span style={{
                                    opacity: 0.55,
                                    fontSize: '11px',
                                    minWidth: 0,
                                    maxWidth: '35%',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    flexShrink: 1,
                                }}>
                                    {track.senderName || track.chatTitle}
                                </span>
                            )}
                            <div style={{ flex: 1 }} />
                            <span style={{ opacity: 0.6, fontSize: '11px', flexShrink: 0 }}>
                                {buffering ? '加载中…' : formatAudioTime(displayTime)} / {duration ? formatAudioTime(duration) : '--:--'}
                            </span>
                        </div>

                        <div
                            ref={barRef}
                            onClick={(e) => e.stopPropagation()}
                            onPointerDown={onPointerDown}
                            onPointerMove={onPointerMove}
                            onPointerUp={onPointerUp}
                            onPointerCancel={() => setDragTime(null)}
                            style={{
                                position: 'relative',
                                height: '4px',
                                touchAction: 'none',
                                borderRadius: '999px',
                                background: 'rgba(var(--mdui-color-on-secondary-container), 0.2)',
                                marginTop: '5px',
                                cursor: duration ? 'pointer' : 'default',
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                bottom: 0,
                                width: duration ? `${Math.min(100, (displayTime / duration) * 100)}%` : '0%',
                                borderRadius: '999px',
                                background: 'rgb(var(--mdui-color-primary))',
                                transition: 'width 120ms linear',
                            }} />
                        </div>

                        {error && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: 'rgb(var(--mdui-color-error))',
                                fontSize: '11px',
                                marginTop: '2px',
                            }}>
                                <span>{error}</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); retry() }}
                                    style={{
                                        border: 'none',
                                        background: 'transparent',
                                        color: 'inherit',
                                        textDecoration: 'underline',
                                        cursor: 'pointer',
                                        padding: 0,
                                        fontSize: 'inherit',
                                    }}
                                >重试</button>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            const index = RATES.indexOf(rate)
                            useChatAudioStore.getState().setRate(RATES[(index + 1) % RATES.length])
                        }}
                        title="播放速度"
                        style={{
                            flexShrink: 0,
                            border: 'none',
                            background: 'rgba(var(--mdui-color-on-secondary-container), 0.1)',
                            color: 'inherit',
                            borderRadius: '999px',
                            padding: '0 7px',
                            height: '24px',
                            fontSize: '11px',
                            cursor: 'pointer',
                        }}
                    >{rate}x</button>

                    <mdui-button-icon
                        icon="close"
                        title="关闭"
                        onClick={(e) => { e.stopPropagation(); stop() }}
                        style={{ flexShrink: 0 }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    )
}
