import React from 'react'
import { motion, useReducedMotion } from 'motion/react'

interface PawSendButtonProps {
    hasContent: boolean
    isSending: boolean
    sendVersion: number
    editing: boolean
    onSend: () => void
}

export default function PawSendButton({ hasContent, isSending, sendVersion, editing, onSend }: PawSendButtonProps) {
    const reduceMotion = useReducedMotion()
    const [completedVersion, setCompletedVersion] = React.useState(sendVersion)
    const sending = sendVersion > completedVersion
    const primary = 'rgb(var(--mdui-color-primary))'
    const onPrimary = 'rgb(var(--mdui-color-on-primary))'
    const ready = hasContent && !isSending
    const idleColor = ready ? onPrimary : 'rgb(var(--mdui-color-on-surface-variant))'
    // 图标独立按压 240ms，背景保持原尺寸；图标恢复后再收缩背景。
    const pressDuration = reduceMotion ? 0 : 0.24
    const fillDelay = reduceMotion ? 0 : 0.28
    const fillDuration = reduceMotion ? 0 : 0.22

    return (
        <button type="button" className="lingcat-paw-send"
            aria-label={editing ? '保存编辑' : '发送消息'} aria-busy={isSending}
            disabled={!hasContent || isSending} onClick={onSend}>
            <motion.span className="lingcat-paw-fill"
                key={`fill-${sendVersion}`}
                initial={sending ? { scale: 1 } : false}
                animate={{ scale: sending ? 0 : ready ? 1 : 0 }}
                transition={sending
                    ? { delay: fillDelay, duration: fillDuration, ease: 'easeIn' }
                    : { duration: reduceMotion ? 0 : 0.14 }}
                onAnimationComplete={() => {
                    if (sending) setCompletedVersion(current => Math.max(current, sendVersion))
                }}
                style={{ background: primary }} />
            <motion.svg key={`paw-${sendVersion}`} viewBox="0 0 32 32" aria-hidden="true"
                initial={sending ? { scale: 1, color: onPrimary } : false}
                animate={{
                    scale: sending ? [1, 0.86, 1] : 1,
                    color: idleColor,
                }}
                transition={sending ? {
                    scale: { duration: pressDuration, times: [0, 0.45, 1], ease: 'easeInOut' },
                    color: { delay: fillDelay, duration: fillDuration },
                } : { duration: reduceMotion ? 0 : 0.14 }}
                fill="currentColor">
                <ellipse cx="6.8" cy="12" rx="3.2" ry="3.7" transform="rotate(-32 6.8 12)" />
                <ellipse cx="12.4" cy="7" rx="3.3" ry="3.8" transform="rotate(-12 12.4 7)" />
                <ellipse cx="19.6" cy="7" rx="3.3" ry="3.8" transform="rotate(12 19.6 7)" />
                <ellipse cx="25.2" cy="12" rx="3.2" ry="3.7" transform="rotate(32 25.2 12)" />
                <path d="M16 16C13.2 12.6 10.2 14.8 9.3 17.4 8.7 19.1 5.7 20.5 6.4 23.5 6.9 26.1 9.4 27.1 11.8 25.7 13.8 28.8 18.2 28.8 20.2 25.7 22.6 27.1 25.1 26.1 25.6 23.5 26.3 20.5 23.3 19.1 22.7 17.4 21.8 14.8 18.8 12.6 16 16Z" />
            </motion.svg>
        </button>
    )
}
