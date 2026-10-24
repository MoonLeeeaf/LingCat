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
                <ellipse cx="6.4" cy="12" rx="3.1" ry="4.2" transform="rotate(-28 6.4 12)" />
                <ellipse cx="12.7" cy="7.3" rx="3.1" ry="4.3" transform="rotate(-9 12.7 7.3)" />
                <ellipse cx="20" cy="7.3" rx="3.1" ry="4.3" transform="rotate(9 20 7.3)" />
                <ellipse cx="26" cy="12" rx="3.1" ry="4.2" transform="rotate(28 26 12)" />
                <path d="M16.2 14c-3.3 0-4.9 3.5-6.9 5.8-1.7 2-3 3.5-2.3 5.8.8 2.8 4 3.3 6.6 2.4a7.9 7.9 0 0 1 5.2 0c2.6.9 5.8.4 6.6-2.4.7-2.3-.6-3.8-2.3-5.8-2-2.3-3.6-5.8-6.9-5.8Z" />
            </motion.svg>
        </button>
    )
}
