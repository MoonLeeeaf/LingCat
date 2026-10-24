import React from 'react'
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react'

interface PawSendButtonProps {
    hasContent: boolean
    isSending: boolean
    sendVersion: number
    editing: boolean
    onSend: () => void
}

export default function PawSendButton({ hasContent, isSending, sendVersion, editing, onSend }: PawSendButtonProps) {
    const reduceMotion = useReducedMotion()
    const iconScale = useMotionValue(1)
    const gestureRef = React.useRef(false)
    const gestureSendVersionRef = React.useRef(0)
    const previousSendVersion = React.useRef(sendVersion)
    const [completedVersion, setCompletedVersion] = React.useState(sendVersion)
    const sending = sendVersion > completedVersion
    const primary = 'rgb(var(--mdui-color-primary))'
    const onPrimary = 'rgb(var(--mdui-color-on-primary))'
    const ready = hasContent && !isSending
    const idleColor = ready ? onPrimary : 'rgb(var(--mdui-color-on-surface-variant))'
    const releaseIcon = () => {
        animate(iconScale, 1, { duration: reduceMotion ? 0 : 0.35, ease: [0.2, 1.5, 0.35, 1] })
    }
    const pressIcon = () => {
        gestureRef.current = true
        animate(iconScale, reduceMotion ? 1 : 0.9, { duration: reduceMotion ? 0 : 0.06, ease: 'easeOut' })
    }
    const cancelPress = () => {
        if (!gestureRef.current) return
        gestureRef.current = false
        releaseIcon()
    }

    React.useEffect(() => {
        if (sendVersion === previousSendVersion.current) return
        previousSendVersion.current = sendVersion
        // 长按已完成缩小，直接回弹；轻点/快捷键补足按压，避免快速点击没有反馈。
        const fullyPressed = gestureSendVersionRef.current === sendVersion && iconScale.get() <= 0.901
        const animation = fullyPressed
            ? animate(iconScale, 1, { duration: reduceMotion ? 0 : 0.35, ease: [0.2, 1.5, 0.35, 1] })
            : animate(iconScale, [iconScale.get(), 0.9, 1.025, 1], {
                duration: reduceMotion ? 0 : 0.41, times: [0, 0.15, 0.6, 1], ease: 'easeInOut',
            })
        return () => animation.stop()
    }, [sendVersion, reduceMotion, iconScale])

    React.useEffect(() => {
        if (reduceMotion) {
            iconScale.stop()
            iconScale.set(1)
        }
        return () => iconScale.stop()
    }, [reduceMotion, iconScale])

    // 独立保持背景，等图标回弹结束后再向中心收缩。
    const fillDelay = reduceMotion ? 0 : 0.41
    const fillDuration = reduceMotion ? 0 : 0.18

    return (
        <button type="button" className="lingcat-paw-send"
            aria-label={editing ? '保存编辑' : '发送消息'} aria-busy={isSending}
            disabled={!hasContent || isSending}
            onPointerDown={event => {
                if (event.isPrimary && event.button === 0) pressIcon()
            }}
            onPointerUp={() => { if (gestureRef.current) releaseIcon() }}
            onPointerLeave={cancelPress} onPointerCancel={cancelPress}
            onKeyDown={event => {
                if (!event.repeat && (event.key === ' ' || event.key === 'Enter')) pressIcon()
            }}
            onKeyUp={event => {
                if (gestureRef.current && (event.key === ' ' || event.key === 'Enter')) releaseIcon()
            }}
            onBlur={cancelPress}
            onClick={() => {
                gestureSendVersionRef.current = gestureRef.current ? sendVersion + 1 : 0
                gestureRef.current = false
                onSend()
            }}>
            <motion.span className="lingcat-paw-fill"
                key={`fill-${sendVersion}`}
                initial={sending ? { scale: 1 } : false}
                animate={{ scale: sending ? 0 : ready ? 1 : 0 }}
                transition={sending
                    ? { delay: fillDelay, duration: fillDuration, ease: [0.22, 1, 0.36, 1] }
                    : { duration: reduceMotion ? 0 : 0.14 }}
                onAnimationComplete={() => {
                    if (sending) setCompletedVersion(current => Math.max(current, sendVersion))
                }}
                style={{ background: primary }} />
            <motion.svg viewBox="0 0 32 32" aria-hidden="true"
                initial={false}
                style={{ scale: iconScale }}
                animate={{ color: idleColor }}
                transition={sending ? {
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
