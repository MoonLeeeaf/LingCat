import React from 'react'
import { createPortal } from 'react-dom'
import type { TrackPublication } from 'livekit-client'
import { ZoomableScreenShare } from './ZoomableScreenShare.tsx'

/**
 * 移动端屏幕共享全屏层。
 * 不把 <video> 交给浏览器原生全屏, 而是用 Portal + fixed 全屏层包住 pinch-zoom,
 * 这样横屏/全屏后双指缩放、双击、平移始终可用。
 */
export function MobileScreenShareFullscreen({
    publication,
    muted,
    onClose,
}: {
    publication?: TrackPublication
    muted?: boolean
    onClose: () => void
}) {
    const overlayRef = React.useRef<HTMLDivElement>(null)
    const [portrait, setPortrait] = React.useState(() => window.innerHeight > window.innerWidth)

    React.useEffect(() => {
        const update = () => setPortrait(window.innerHeight > window.innerWidth)
        update()
        window.addEventListener('resize', update)
        window.addEventListener('orientationchange', update)
        return () => {
            window.removeEventListener('resize', update)
            window.removeEventListener('orientationchange', update)
        }
    }, [])

    // 尽量进入原生全屏并锁定横屏; iOS 不支持时保留应用内全屏 + 提示.
    React.useEffect(() => {
        const el = overlayRef.current
        if (!el) return
        let locked = false
        let cancelled = false
        const orientation = (window.screen as any)?.orientation

        const enter = async () => {
            try {
                if (el.requestFullscreen) {
                    await el.requestFullscreen()
                    if (cancelled) {
                        try { if (document.fullscreenElement === el) await document.exitFullscreen() } catch { /* ignore */ }
                        return
                    }
                }
            } catch { /* 保留应用内全屏 */ }
            try {
                if (orientation?.lock) {
                    await orientation.lock('landscape')
                    locked = true
                    if (cancelled) {
                        try { orientation.unlock?.() } catch { /* ignore */ }
                        locked = false
                    }
                }
            } catch { /* iOS Safari 不支持方向锁定 */ }
        }
        void enter()

        return () => {
            cancelled = true
            try {
                if (document.fullscreenElement === el) void document.exitFullscreen()
            } catch { /* ignore */ }
            try {
                if (locked) orientation?.unlock?.()
            } catch { /* ignore */ }
        }
    }, [])

    return createPortal(
        <div
            ref={overlayRef}
            role="dialog"
            aria-modal="true"
            aria-label="屏幕共享全屏"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 3000,
                background: '#000',
                overflow: 'hidden',
                touchAction: 'none',
                overscrollBehavior: 'contain',
                height: '100dvh',
                width: '100vw',
            }}
        >
            <ZoomableScreenShare publication={publication} muted={muted} />

            {portrait && (
                <div
                    style={{
                        position: 'absolute',
                        left: 'calc(env(safe-area-inset-left) + 10px)',
                        top: 'calc(env(safe-area-inset-top) + 10px)',
                        zIndex: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        background: 'rgba(0,0,0,0.55)',
                        color: '#fff',
                        fontSize: '12px',
                        pointerEvents: 'none',
                    }}
                >
                    <mdui-icon name="screen_rotation" style={{ fontSize: '16px' }} />
                    横屏查看更清楚
                </div>
            )}

            <div style={{
                position: 'absolute',
                top: 'calc(env(safe-area-inset-top) + 8px)',
                right: 'calc(env(safe-area-inset-right) + 8px)',
                zIndex: 5,
            }}>
                <mdui-button-icon
                    icon="close_fullscreen"
                    title="退出全屏"
                    onClick={onClose}
                    style={{
                        color: '#fff',
                        background: 'rgba(0,0,0,0.45)',
                        borderRadius: '50%',
                    }}
                />
            </div>
        </div>,
        document.body,
    )
}
