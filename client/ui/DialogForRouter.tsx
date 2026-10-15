import React from 'react'
import { useBlocker } from '@tanstack/react-router'
import { Dialog } from 'mdui'
import { applyFullBleed } from '../lib/dialogFullBleed.ts'

interface DialogForRouterProps {
    open: boolean
    onCloseRequest: () => void
    onClosed?: () => void
    children?: React.ReactNode
    closeOnEsc?: boolean
    closeOnOverlayClick?: boolean
    fullscreen?: boolean
    className?: string
    fullBleed?: boolean
}

export function DialogForRouter({
    open,
    onCloseRequest,
    onClosed,
    children,
    closeOnEsc = true,
    closeOnOverlayClick = true,
    fullscreen,
    className,
    fullBleed = false,
}: DialogForRouterProps) {
    const ref = React.useRef<Dialog>(null)
    const selfClosingRef = React.useRef(false)
    const initializedRef = React.useRef(false)

    const onCloseRequestRef = React.useRef(onCloseRequest)
    const onClosedRef = React.useRef(onClosed)
    React.useEffect(() => { onCloseRequestRef.current = onCloseRequest })
    React.useEffect(() => { onClosedRef.current = onClosed })

    React.useEffect(() => {
        if (!fullBleed) return
        const el = ref.current
        if (!el) return
    
        let cancelled = false
        applyFullBleed(el, () => cancelled)
    
        return () => { cancelled = true }
    }, [fullBleed])

    // ============================================================
    //  blocker：拦截浏览器返回/前进
    // ============================================================
    const blocker = useBlocker({
        shouldBlockFn: ({ action }) =>
            action === 'BACK' || action === 'FORWARD' || action === 'GO',
        withResolver: true,
        enableBeforeUnload: false,
    })

    // 首次挂载：等 Lit 首次更新完成，走"非首次渲染"路径 → 有打开动画
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

    // ============================================================
    //  closed 事件：用户触发 vs 我们主动关
    //  ★ 必须过滤 e.target，否则 mdui-dropdown 的 closed 冒泡会误触发
    // ============================================================
    React.useEffect(() => {
        const el = ref.current
        if (!el) return

        const handleClosed = (e: Event) => {
            if (e.target !== el) return    // ★ 忽略子元素的 closed 冒泡
            if (selfClosingRef.current) {
                selfClosingRef.current = false
                onClosedRef.current?.()
            } else {
                onCloseRequestRef.current()
            }
        }

        el.addEventListener('closed', handleClosed)
        return () => el.removeEventListener('closed', handleClosed)
    }, [])

    // ============================================================
    //  blocker 拦截：浏览器返回键
    // ============================================================
    React.useEffect(() => {
        if (blocker?.status !== 'blocked') return
        const el = ref.current
        if (!el) {
            blocker.proceed?.()
            return
        }

        // 用户操作已经关过了 → 直接放行
        if (!el.open) {
            blocker.proceed?.()
            return
        }

        selfClosingRef.current = true
        el.open = false

        // ★ 同样过滤 e.target
        const handleClosed = (e: Event) => {
            if (e.target !== el) return
            el.removeEventListener('closed', handleClosed)
            blocker.proceed?.()
        }
        el.addEventListener('closed', handleClosed)

        return () => el.removeEventListener('closed', handleClosed)
    }, [blocker?.status])

    return (
        <mdui-dialog
            ref={ref as any}
            className={className}
            close-on-esc={closeOnEsc}
            close-on-overlay-click={closeOnOverlayClick}
            fullscreen={fullscreen}
        >
            {children}
        </mdui-dialog>
    )
}