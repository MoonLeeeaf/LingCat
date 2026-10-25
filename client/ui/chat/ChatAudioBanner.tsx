import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useNavigate } from '@tanstack/react-router'
import { useChatAudioStore, formatAudioTime } from './chatAudioStore.ts'
import { useChatMessageStore } from './useChatMessageStore.ts'
import { useMeetingStore } from '../meeting/MeetingManager.ts'

/**
 * 全局音频横幅: 位于聊天标题栏下方、会议横幅上方。
 * 切会话/滚动仍显示同一条音频; 点横幅可跳回消息 (P2)。
 */
export default function ChatAudioBanner({ translucent }: { translucent?: boolean }) {
    const track = useChatAudioStore(s => s.track)
    const playing = useChatAudioStore(s => s.playing)
    const currentTime = useChatAudioStore(s => s.currentTime)
    const duration = useChatAudioStore(s => s.duration)
    const error = useChatAudioStore(s => s.error)
    const navigate = useNavigate()
    const meetingActive = useMeetingStore(s => s.phase === 'connected' || !!s.room)

    React.useEffect(() => {
        if (meetingActive) useChatAudioStore.getState().pause()
    }, [meetingActive])

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
    const seek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!duration) return
        const rect = e.currentTarget.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        useChatAudioStore.getState().seek(ratio * duration)
    }

    return (
        <AnimatePresence>
            {track && (
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
                                {formatAudioTime(currentTime)} / {duration ? formatAudioTime(duration) : '--:--'}
                            </span>
                        </div>

                        <div
                            onClick={(e) => { e.stopPropagation(); seek(e) }}
                            style={{
                                position: 'relative',
                                height: '4px',
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
                                width: duration ? `${Math.min(100, (currentTime / duration) * 100)}%` : '0%',
                                borderRadius: '999px',
                                background: 'rgb(var(--mdui-color-primary))',
                                transition: 'width 120ms linear',
                            }} />
                        </div>

                        {error && (
                            <div style={{ color: 'rgb(var(--mdui-color-error))', fontSize: '11px', marginTop: '2px' }}>
                                {error}
                            </div>
                        )}
                    </div>

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
