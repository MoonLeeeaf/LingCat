import React from 'react'
import { motion } from 'motion/react'
import { useChatAudioStore, formatAudioTime } from './chatAudioStore.ts'

export interface AudioAttachmentProps {
    url: string
    name?: string
    hash?: string
    chatId?: string
    chatTitle?: string
    messageId?: number
    senderName?: string
}

function parseAudioName(name?: string) {
    const raw = name || ''
    const base = raw.replace(/\.[^.]+$/, '').replace(/^音频-/, '')
    const voice = base.match(/^语音\s*(\d+)\s*秒/)
    if (voice) return { isVoice: true, label: '语音', seconds: Number(voice[1]) }
    if (base.startsWith('语音')) return { isVoice: true, label: '语音', seconds: 0 }
    if (/^\d{4}-\d{2}-\d{2}/.test(base) && /\.(webm|ogg|oga|m4a|mp3|wav|aac|caf|flac)$/i.test(raw)) {
        // 旧版录音文件名是时间戳，尽量按语音展示
        return { isVoice: true, label: '语音', seconds: 0 }
    }
    return { isVoice: false, label: base || '音频', seconds: 0 }
}

/** 消息内的音频附件: 只负责控制全局播放器, 播放不随消息项卸载而停止 */
export default function AudioAttachment({ url, name, hash, chatId, chatTitle, messageId, senderName }: AudioAttachmentProps) {
    const key = hash || url
    const active = useChatAudioStore(s => s.track?.key === key)
    const playing = useChatAudioStore(s => (s.track?.key === key ? s.playing : false))
    const buffering = useChatAudioStore(s => (s.track?.key === key ? s.buffering : false))
    const currentTime = useChatAudioStore(s => (s.track?.key === key ? s.currentTime : 0))
    const duration = useChatAudioStore(s => (s.track?.key === key ? s.duration : 0))
    const error = useChatAudioStore(s => (s.track?.key === key ? s.error : undefined))

    const display = parseAudioName(name)
    const shownDuration = duration || display.seconds

    const [dragTime, setDragTime] = React.useState<number | null>(null)
    const barRef = React.useRef<HTMLDivElement>(null)
    const displayTime = dragTime ?? currentTime

    const toggle = () => {
        if (active) useChatAudioStore.getState().toggle()
        else useChatAudioStore.getState().play({
            key,
            url,
            name: display.isVoice ? '语音' : display.label,
            hash,
            chatId,
            chatTitle,
            messageId,
            senderName,
            isVoice: display.isVoice,
        })
    }

    const timeFromPointer = (e: React.PointerEvent<HTMLDivElement>) => {
        const rect = barRef.current?.getBoundingClientRect()
        if (!rect || !duration) return 0
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        return ratio * duration
    }
    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!active || !duration) return
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
    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (!active || !duration) return
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            e.preventDefault()
            e.stopPropagation()
            const delta = e.key === 'ArrowLeft' ? -5 : 5
            useChatAudioStore.getState().seek(Math.max(0, Math.min(duration, currentTime + delta)))
        }
    }

    return (
        <div
            onClick={(e) => e.stopPropagation()}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '220px',
                maxWidth: '320px',
                padding: '4px 8px 4px 2px',
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
                    onClick={toggle}
                />
            </motion.div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '86%',
                    opacity: 0.78,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {display.isVoice ? '语音' : display.label}
                    {display.isVoice && shownDuration > 0 && (
                        <span style={{ opacity: 0.55 }}> · {formatAudioTime(shownDuration)}</span>
                    )}
                    {senderName ? <span style={{ opacity: 0.6 }}> · {senderName}</span> : null}
                </div>

                <div
                    ref={barRef}
                    role="slider"
                    aria-label="播放进度"
                    aria-valuemin={0}
                    aria-valuemax={Math.round(shownDuration)}
                    aria-valuenow={Math.round(displayTime)}
                    tabIndex={active && duration ? 0 : -1}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={() => setDragTime(null)}
                    onKeyDown={onKeyDown}
                    style={{
                        position: 'relative',
                        height: '5px',
                        touchAction: 'none',
                        borderRadius: '999px',
                        background: 'rgba(var(--mdui-color-on-surface), 0.12)',
                        marginTop: '6px',
                        cursor: active && duration ? 'pointer' : 'default',
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: shownDuration ? `${Math.min(100, (displayTime / shownDuration) * 100)}%` : '0%',
                        borderRadius: '999px',
                        background: 'rgb(var(--mdui-color-primary))',
                        transition: 'width 120ms linear',
                    }} />
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '74%',
                    opacity: 0.55,
                    marginTop: '2px',
                }}>
                    <span>{active && buffering ? '加载中…' : formatAudioTime(displayTime)}</span>
                    <span>{shownDuration ? formatAudioTime(shownDuration) : '--:--'}</span>
                </div>

                {active && error && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: 'rgb(var(--mdui-color-error))',
                        fontSize: '74%',
                    }}>
                        <span>{error}</span>
                        <button
                            onClick={(e) => { e.stopPropagation(); useChatAudioStore.getState().retry() }}
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
        </div>
    )
}
