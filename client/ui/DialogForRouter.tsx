import React from 'react'
import { useBlocker } from '@tanstack/react-router'
import { Dialog } from 'mdui'

interface DialogForRouterProps {
    open: boolean
    onCloseRequest: () => void
    onClosed?: () => void
    children?: React.ReactNode
    closeOnEsc?: boolean
    closeOnOverlayClick?: boolean
    fullscreen?: boolean
}

export function DialogForRouter({
    open,
    onCloseRequest,
    onClosed,
    children,
    closeOnEsc = true,
    closeOnOverlayClick = true,
    fullscreen,
}: DialogForRouterProps) {
    const ref = React.useRef<Dialog>(null)
    const selfClosingRef = React.useRef(false)
    const initializedRef = React.useRef(false)

    const onCloseRequestRef = React.useRef(onCloseRequest)
    const onClosedRef = React.useRef(onClosed)
    React.useEffect(() => { onCloseRequestRef.current = onCloseRequest })
    React.useEffect(() => { onClosedRef.current = onClosed })

    // ============================================================
    //  ★ 拦截浏览器历史导航（返回/前进/跳跃），
    //    让关闭动画播完再真正导航
    // ============================================================
    const blocker = useBlocker({
        shouldBlockFn: ({ action }) => {
            // PUSH / REPLACE = 程序内部 navigate，不拦
            // BACK / FORWARD / GO = 浏览器历史导航，拦下来播动画
            return action === 'BACK' || action === 'FORWARD' || action === 'GO'
        },
        // ★ 必须加这个才能拿到 blocker 对象（否则返回 void）
        withResolver: true,
        enableBeforeUnload: false,
    })

    // 首次挂载：等 Lit 完成首次更新再设 open，走"非首次渲染"路径 → 有动画
    React.useEffect(() => {
        const el = ref.current
        if (!el) return
        let cancelled = false
        el.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (cancelled) return
                if (!open) selfClosingRef.current = true
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
        if (!open) selfClosingRef.current = true
        el.open = open
    }, [open])

    // 拦截用户触发的关闭（ESC / 遮罩 / X 按钮）
    React.useEffect(() => {
        const el = ref.current
        if (!el) return

        const handleClose = (e: Event) => {
            if (selfClosingRef.current) return
            // 阻止 mdui 直接关闭，改由外部 navigate 触发 → blocker 统一处理
            e.preventDefault()
            onCloseRequestRef.current()
        }
        const handleClosed = () => {
            selfClosingRef.current = false
            onClosedRef.current?.()
        }

        el.addEventListener('close', handleClose)
        el.addEventListener('closed', handleClosed)
        return () => {
            el.removeEventListener('close', handleClose)
            el.removeEventListener('closed', handleClosed)
        }
    }, [])

    // ★ blocker 拦截生效时：播放关闭动画，动画结束再放行导航
    React.useEffect(() => {
        if (blocker?.status !== 'blocked') return
        const el = ref.current
        if (!el) {
            blocker.proceed?.()
            return
        }
        selfClosingRef.current = true
        el.open = false

        const handleClosed = () => {
            blocker.proceed?.()
        }
        el.addEventListener('closed', handleClosed, { once: true })
        return () => el.removeEventListener('closed', handleClosed)
    }, [blocker?.status])

    return (
        <mdui-dialog
            ref={ref as any}
            close-on-esc={closeOnEsc}
            close-on-overlay-click={closeOnOverlayClick}
            fullscreen={fullscreen}
        >
            {children}
        </mdui-dialog>
    )
}