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
    // 0–180ms 先按压猫掌；180–420ms 才收缩纯色圆形背景。
    const sequence = { duration: reduceMotion ? 0 : 0.42, times: [0, 0.22, 0.43, 1], ease: 'easeInOut' as const }

    return (
        <button type="button" className="lingcat-paw-send"
            aria-label={editing ? '保存编辑' : '发送消息'} aria-busy={isSending}
            disabled={!hasContent || isSending} onClick={onSend}>
            <motion.span className="lingcat-paw-fill"
                key={`fill-${sendVersion}`}
                initial={sending ? { scale: 1 } : false}
                animate={{ scale: sending ? [1, 1, 1, 0] : ready ? 1 : 0 }}
                transition={sending ? sequence : { duration: reduceMotion ? 0 : 0.14 }}
                style={{ background: primary }} />
            <motion.svg key={`paw-${sendVersion}`} viewBox="0 0 32 32" aria-hidden="true"
                initial={sending ? { scale: 1, color: onPrimary } : false}
                animate={{
                    scale: sending ? [1, 0.78, 1, 1] : 1,
                    color: sending ? [onPrimary, onPrimary, onPrimary, idleColor] : idleColor,
                }}
                transition={sending ? sequence : { duration: reduceMotion ? 0 : 0.14 }}
                onAnimationComplete={() => {
                    if (sending) setCompletedVersion(current => Math.max(current, sendVersion))
                }}
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
