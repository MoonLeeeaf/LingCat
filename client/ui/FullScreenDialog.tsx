import React from 'react'
import { Dialog } from 'mdui'
import { applyFullBleed } from '../lib/dialogFullBleed.ts'

export interface FullScreenDialogProps {
    /** 是否打开 */
    open: boolean
    /**
     * 请求关闭（用户操作）。
     * 默认情况下 closeOnEsc / closeOnOverlayClick 都为 false，
     * 所以这个回调基本不会被触发——除非将来放开允许。
     */
    onCloseRequest?: () => void
    /** 关闭动画播放完成时触发（可用于清理资源） */
    onClosed?: () => void
    /** 附加 class（用于 ::part 定制样式） */
    className?: string
    children?: React.ReactNode
}

/**
 * 全屏内容 dialog。
 *
 * - 视觉：全屏 + panel 无 padding/背景 + body 撑满
 * - 默认禁用 ESC / 点击遮罩关闭（内容页不该被误关）
 * - 不做路由、不做 blocker——纯 store 驱动的开关
 */
export function FullScreenDialog({
    open,
    onCloseRequest,
    onClosed,
    className,
    children,
}: FullScreenDialogProps) {
    const ref = React.useRef<Dialog>(null)
    const initializedRef = React.useRef(false)

    // 用 ref 拿最新回调，避免 effect 重挂
    const onCloseRequestRef = React.useRef(onCloseRequest)
    const onClosedRef = React.useRef(onClosed)
    React.useEffect(() => { onCloseRequestRef.current = onCloseRequest })
    React.useEffect(() => { onClosedRef.current = onClosed })

    // fullBleed 样式注入（等 Lit 首次渲染完成）
    React.useEffect(() => {
        const el = ref.current
        if (!el) return

        let cancelled = false
        void applyFullBleed(el, () => cancelled)
        return () => { cancelled = true }
    }, [])

    // 首次挂载：等 Lit 首次更新完成再设 open（走"非首次渲染"路径 → 有打开动画）
    React.useEffect(() => {
        const el = ref.current
        if (!el) return
        let cancelled = false

        el.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (cancelled) return
                el.open = open
                initializedRef.current = true
            })
        })

        return () => { cancelled = true }
    }, [])

    // open prop 变化 → 同步到元素
    React.useEffect(() => {
        if (!initializedRef.current) return
        const el = ref.current
        if (!el) return
        if (el.open === open) return
        el.open = open
    }, [open])

    // closed 事件：过滤冒泡，通知外部
    React.useEffect(() => {
        const el = ref.current
        if (!el) return

        const handleClosed = (e: Event) => {
            if (e.target !== el) return    // ★ 忽略子元素（dropdown / 子 dialog）的 closed 冒泡
            onClosedRef.current?.()
        }
        el.addEventListener('closed', handleClosed)
        return () => el.removeEventListener('closed', handleClosed)
    }, [])

    return (
        <mdui-dialog
            ref={ref as any}
            className={className}
            fullscreen
            close-on-esc={false}
            close-on-overlay-click={false}
        >
            {children}
        </mdui-dialog>
    )
}