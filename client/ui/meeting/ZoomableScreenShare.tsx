import React from 'react'
import PinchZoom from 'pinch-zoom-element/dist/pinch-zoom'
import type { TrackPublication } from 'livekit-client'
import { VideoPublication } from './VideoTrack.tsx'

const DOUBLE_TAP_SCALE = 2.5

/**
 * 聚焦视频的缩放层 (移动端屏幕共享 / 桌面端屏幕共享/摄像头)。
 * 复用 pinch-zoom-element 处理双指/滚轮/平移, 这里只补:
 * - 最小 1x, 不设最大倍率
 * - 双击 1x <-> 2.5x (触摸用双击手势, 桌面用鼠标双击)
 * - 右下角“适应”按钮
 * 顶部按钮/名称/统计浮层都放在组件外, 不参与缩放。
 */
export function ZoomableScreenShare({
    publication,
    muted,
    videoRef,
}: {
    publication?: TrackPublication
    muted?: boolean
    videoRef?: React.RefObject<HTMLVideoElement | null>
}) {
    const zoomRef = React.useRef<PinchZoom>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const [scale, setScale] = React.useState(1)

    // ★ 修复：拦截滚轮缩小到临界点时自动归位
    React.useEffect(() => {
        const container = containerRef.current
        const el = zoomRef.current
        if (!container || !el) return

        const handleWheel = (e: WheelEvent) => {
            // e.deltaY > 0 表示向下滚（缩小），且当前倍率接近 1
            if (e.deltaY > 0 && el.scale <= 1.05) {
                el.setTransform({ scale: 1, x: 0, y: 0, allowChangeEvent: true })
                e.preventDefault()
                e.stopPropagation()
            }
        }

        // 使用 capture 捕获阶段，防止事件被内部 Web Component 拦截
        container.addEventListener('wheel', handleWheel, { capture: true, passive: false })
        return () => container.removeEventListener('wheel', handleWheel, { capture: true })
    }, [])

    const activePointersRef = React.useRef(new Set<number>())
    const multiTouchRef = React.useRef(false)
    const tapStartRef = React.useRef<{ id: number, x: number, y: number } | null>(null)
    const tapMovedRef = React.useRef(false)
    const lastTapRef = React.useRef<{ t: number, x: number, y: number } | null>(null)

    const reset = React.useCallback(() => {
        const el = zoomRef.current
        if (!el) return
        el.setTransform({ scale: 1, x: 0, y: 0, allowChangeEvent: true })
        setScale(1)
    }, [])

    // 屏幕共享 track 变化时回到适应屏幕
    React.useEffect(() => {
        reset()
    }, [publication?.track?.sid, reset])

    // 旋转/进入或退出原生全屏后回到适应屏幕, 避免旧平移量落到可视区外
    React.useEffect(() => {
        const onRefit = () => reset()
        window.addEventListener('orientationchange', onRefit)
        document.addEventListener('fullscreenchange', onRefit)
        return () => {
            window.removeEventListener('orientationchange', onRefit)
            document.removeEventListener('fullscreenchange', onRefit)
        }
    }, [reset])

    // 复制 pinch-zoom 的 scale, 同时限制最小为 1.0
    React.useEffect(() => {
        const el = zoomRef.current
        if (!el) return
        const onChange = () => {
            const current = el.scale
            // ★ 只要试图缩小到 1 以下，立刻强制重置回原始比例和位置
            if (current < 1) {
                el.setTransform({ scale: 1, x: 0, y: 0, allowChangeEvent: true })
                setScale(1)
                return
            }
            // 为了避免 React 频繁重渲染，设定一个微小的阈值
            setScale(prev => Math.abs(prev - current) > 0.04 ? current : prev)
        }
        el.addEventListener('change', onChange)
        return () => el.removeEventListener('change', onChange)
    }, [])

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType !== 'touch') return
        activePointersRef.current.add(e.pointerId)
        if (activePointersRef.current.size > 1) {
            multiTouchRef.current = true
            lastTapRef.current = null
            return
        }
        tapStartRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY }
        tapMovedRef.current = false
    }

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        const start = tapStartRef.current
        if (!start || start.id !== e.pointerId) return
        if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 8) {
            tapMovedRef.current = true
        }
    }

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.pointerType !== 'touch') return
        activePointersRef.current.delete(e.pointerId)

        if (multiTouchRef.current) {
            if (activePointersRef.current.size === 0) multiTouchRef.current = false
            lastTapRef.current = null
            tapStartRef.current = null
            return
        }

        const start = tapStartRef.current
        if (!start || start.id !== e.pointerId) return
        const moved = tapMovedRef.current
        tapStartRef.current = null
        if (moved) {
            lastTapRef.current = null
            return
        }

        const now = performance.now()
        const last = lastTapRef.current
        if (last && now - last.t < 300 && Math.hypot(e.clientX - last.x, e.clientY - last.y) < 24) {
            lastTapRef.current = null
            const el = zoomRef.current
            if (!el) return
            if (el.scale > 1.01) {
                reset()
            } else {
                const rect = el.getBoundingClientRect()
                el.scaleTo(DOUBLE_TAP_SCALE, {
                    originX: e.clientX - rect.left,
                    originY: e.clientY - rect.top,
                    relativeTo: 'container',
                    allowChangeEvent: true,
                })
            }
        } else {
            lastTapRef.current = { t: now, x: e.clientX, y: e.clientY }
        }
    }

    const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
        activePointersRef.current.delete(e.pointerId)
        if (activePointersRef.current.size === 0) multiTouchRef.current = false
        tapStartRef.current = null
        lastTapRef.current = null
    }

    // 桌面鼠标双击缩放; 触摸设备继续用上面的双击手势, 避免重复触发
    const onDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.detail < 2) return
        if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) return
        if ((e.target as HTMLElement).closest('button')) return
        const el = zoomRef.current
        if (!el) return
        if (el.scale > 1.01) {
            reset()
        } else {
            const rect = el.getBoundingClientRect()
            el.scaleTo(DOUBLE_TAP_SCALE, {
                originX: e.clientX - rect.left,
                originY: e.clientY - rect.top,
                relativeTo: 'container',
                allowChangeEvent: true,
            })
        }
    }

    return (
        <div
            ref={containerRef}
            aria-label="屏幕共享，可双指缩放"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onDoubleClick={onDoubleClick}
            style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                background: '#000',
                touchAction: 'none',
            }}
        >
            {/* @ts-ignore */}
            <pinch-zoom
                ref={zoomRef}
                style={{ display: 'block', width: '100%', height: '100%' }}
            >
                <VideoPublication
                    publication={publication}
                    muted={muted}
                    videoRef={videoRef}
                />
                {/* @ts-ignore */}
            </pinch-zoom>

            {scale > 1.01 && (
                <button
                    type="button"
                    title="适应屏幕"
                    onClick={(e) => {
                        e.stopPropagation()
                        reset()
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                    style={{
                        position: 'absolute',
                        right: '8px',
                        bottom: '8px',
                        zIndex: 3,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        border: 'none',
                        borderRadius: '999px',
                        padding: '4px 10px',
                        background: 'rgba(0,0,0,0.65)',
                        color: '#fff',
                        fontSize: '12px',
                        lineHeight: 1.4,
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)',
                    }}
                >
                    {scale.toFixed(1)}× · 适应
                </button>
            )}
        </div>
    )
}
