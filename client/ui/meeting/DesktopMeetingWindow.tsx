import React from 'react'
import { MeetingView } from './MeetingView.tsx'
import { useMeetingUIStore } from './MeetingUIStore.ts'

const MIN_W = 320
const MIN_H = 240

export function DesktopMeetingWindow() {
    const isOpen = useMeetingUIStore(s => s.isOpen)
    const isMinimized = useMeetingUIStore(s => s.isMinimized)
    const isMaximized = useMeetingUIStore(s => s.isMaximized)
    const position = useMeetingUIStore(s => s.position)
    const size = useMeetingUIStore(s => s.size)
    const close = useMeetingUIStore(s => s.close)
    const setPosition = useMeetingUIStore(s => s.setPosition)
    const setSize = useMeetingUIStore(s => s.setSize)
    const toggleMinimized = useMeetingUIStore(s => s.toggleMinimized)
    const toggleMaximized = useMeetingUIStore(s => s.toggleMaximized)

    // ============================================================
    //  拖动
    // ============================================================
    const dragRef = React.useRef<{ dx: number, dy: number } | null>(null)

    const onPointerDown = (e: React.PointerEvent) => {
        if (isMaximized) return
        // 点击按钮时不动
        if ((e.target as HTMLElement).closest('mdui-button-icon, mdui-button, button')) return
        dragRef.current = { dx: e.clientX - position.x, dy: e.clientY - position.y }
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }

    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current) return
        const w = size.w
        const x = Math.min(Math.max(0, e.clientX - dragRef.current.dx), window.innerWidth - w)
        const y = Math.min(Math.max(0, e.clientY - dragRef.current.dy), window.innerHeight - 40)
        setPosition({ x, y })
    }

    const onPointerUp = (e: React.PointerEvent) => {
        dragRef.current = null
        try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { }
    }

    // ============================================================
    //  Resize
    // ============================================================
    const resizeRef = React.useRef<{ startX: number, startY: number, startW: number, startH: number } | null>(null)

    const onResizeDown = (e: React.PointerEvent) => {
        e.stopPropagation()
        resizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startW: size.w,
            startH: size.h,
        }
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }

    const onResizeMove = (e: React.PointerEvent) => {
        if (!resizeRef.current) return
        const { startX, startY, startW, startH } = resizeRef.current
        const maxW = window.innerWidth - position.x - 12
        const maxH = window.innerHeight - position.y - 12
        const w = Math.min(Math.max(MIN_W, startW + (e.clientX - startX)), maxW)
        const h = Math.min(Math.max(MIN_H, startH + (e.clientY - startY)), maxH)
        setSize({ w, h })
    }

    const onResizeUp = (e: React.PointerEvent) => {
        resizeRef.current = null
        try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { }
    }

    // ============================================================
    //  渲染
    // ============================================================
    if (!isOpen) return null

    const style: React.CSSProperties = isMaximized
        ? { top: 0, left: 0, right: 0, bottom: 0 }
        : {
            left: position.x,
            top: position.y,
            width: size.w,
            height: isMinimized ? 'auto' : size.h,
        }

    const headerExtra = (
        <>
            <mdui-tooltip content={isMinimized ? '展开' : '最小化'}>
                <mdui-button-icon
                    icon={isMinimized ? 'open_in_full' : 'minimize'}
                    onClick={toggleMinimized}
                />
            </mdui-tooltip>
            <mdui-tooltip content={isMaximized ? '退出全屏' : '铺满'}>
                <mdui-button-icon
                    icon={isMaximized ? 'close_fullscreen' : 'fullscreen'}
                    onClick={toggleMaximized}
                />
            </mdui-tooltip>
        </>
    )

    return (
        <div
            style={{
                position: 'fixed',
                zIndex: 2100,
                background: 'rgb(var(--mdui-color-surface-container-low))',
                color: 'rgb(var(--mdui-color-on-surface))',
                borderRadius: isMaximized ? 0 : '12px',
                boxShadow: isMaximized ? 'none' : 'var(--mdui-elevation-level3)',
                border: isMaximized ? 'none' : '1px solid rgb(var(--mdui-color-outline-variant))',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                ...style,
            }}
        >
            <MeetingView
                onClose={close}
                headerPointer={{ onPointerDown, onPointerMove, onPointerUp }}
                headerExtra={headerExtra}
            />
            {!isMinimized && !isMaximized && (
                <div
                    onPointerDown={onResizeDown}
                    onPointerMove={onResizeMove}
                    onPointerUp={onResizeUp}
                    style={{
                        position: 'absolute',
                        right: 0,
                        bottom: 0,
                        width: '18px',
                        height: '18px',
                        cursor: 'nwse-resize',
                        touchAction: 'none',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'flex-end',
                        justifyContent: 'flex-end',
                        padding: '2px',
                        color: 'rgb(var(--mdui-color-outline))',
                    }}
                >
                    <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: 'block' }}>
                        <path d="M11 1 L11 11 L1 11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
                        <path d="M11 5 L11 11 L5 11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
                    </svg>
                </div>
            )}
        </div>
    )
}