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

/** 消息内的音频附件: 只负责控制全局播放器, 播放不随消息项卸载而停止 */
export default function AudioAttachment({ url, name, hash, chatId, chatTitle, messageId, senderName }: AudioAttachmentProps) {
    const active = useChatAudioStore(s => s.track?.url === url)
    const playing = useChatAudioStore(s => (s.track?.url === url ? s.playing : false))
    const currentTime = useChatAudioStore(s => (s.track?.url === url ? s.currentTime : 0))
    const duration = useChatAudioStore(s => (s.track?.url === url ? s.duration : 0))
    const error = useChatAudioStore(s => (s.track?.url === url ? s.error : undefined))

    const toggle = () => {
        if (active) useChatAudioStore.getState().toggle()
        else useChatAudioStore.getState().play({
            url,
            name: name || '语音',
            hash,
            chatId,
            chatTitle,
            messageId,
            senderName,
        })
    }

    const seek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!active || !duration) return
        const rect = e.currentTarget.getBoundingClientRect()
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        useChatAudioStore.getState().seek(ratio * duration)
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
                    {name || '语音'}
                    {senderName ? <span style={{ opacity: 0.6 }}> · {senderName}</span> : null}
                </div>

                <div
                    onClick={seek}
                    style={{
                        position: 'relative',
                        height: '5px',
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
                        width: duration ? `${Math.min(100, (currentTime / duration) * 100)}%` : '0%',
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
                    <span>{formatAudioTime(currentTime)}</span>
                    <span>{duration ? formatAudioTime(duration) : '--:--'}</span>
                </div>

                {active && error && (
                    <div style={{ color: 'rgb(var(--mdui-color-error))', fontSize: '74%' }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    )
}
