import { Dialog } from 'mdui'
import PinchZoom from 'pinch-zoom-element/dist/pinch-zoom'
import ReactClient from "react-dom/client"
import React from 'react'
import { motion, MotionConfig } from 'motion/react'
import useEventListener from '../../lib/useEventListener.ts'

export default function ImageViewerDialog({ src, onClose }: { src: string, onClose?: () => void }) {
    const dialogRef = React.useRef<Dialog>(null)
    const innerRef = React.useRef<PinchZoom>(null)
    const [visible, setVisible] = React.useState(false)
    const imageRef = React.useRef<HTMLImageElement>(null)
    const activePointersRef = React.useRef(new Set<number>())
    const gestureRef = React.useRef<{ x: number, y: number, dragged: boolean } | null>(null)
    const [uniqueClass] = React.useState(() => `image-viewer-${Math.random().toString(36).substr(2, 8)}`)

    const trackPointerMove = (e: React.PointerEvent) => {
        const gesture = gestureRef.current
        if (gesture && Math.hypot(e.clientX - gesture.x, e.clientY - gesture.y) > 6) {
            gesture.dragged = true
        }
    }

    const closeOnBlankClick = (e: React.MouseEvent) => {
        const gesture = gestureRef.current
        gestureRef.current = null
        if (!gesture || gesture.dragged) return

        const image = imageRef.current
        if (image?.naturalWidth && image.naturalHeight) {
            // img 铺满预览层；object-fit: contain 产生的留白也属于可关闭区域。
            // 使用变换后的边界，保证缩放/平移后仍按图片的实际显示范围判断。
            const rect = image.getBoundingClientRect()
            const scale = Math.min(rect.width / image.naturalWidth, rect.height / image.naturalHeight)
            const width = image.naturalWidth * scale
            const height = image.naturalHeight * scale
            const left = rect.left + (rect.width - width) / 2
            const top = rect.top + (rect.height - height) / 2
            if (e.clientX >= left && e.clientX <= left + width &&
                e.clientY >= top && e.clientY <= top + height) return
        }

        if (dialogRef.current) dialogRef.current.open = false
    }

    useEventListener(dialogRef, 'closed', () => {
        onClose?.()
    })

    useEventListener(dialogRef, 'close', (e) => {
        if (e.target === dialogRef.current) setVisible(false)
    })

    // 注入样式（含 ::part 和 内部按钮样式）
    React.useEffect(() => {
        const styleEl = document.createElement('style')
        styleEl.textContent = `
        .${uniqueClass}::part(panel) {
            transform: none !important;
            background: rgba(0, 0, 0, 0) !important;
            padding: 0 !important;
            display: flex;
            width: 100%;
            height: 100%;
        }
        .${uniqueClass}::part(body) {
            display: flex;
            width: 100%;
            height: 100%;
        }
        .${uniqueClass} mdui-button-icon[icon="close"],
        .${uniqueClass} mdui-button-icon[icon="open_in_new"] {
            z-index: 114514;
            position: fixed;
            top: 15px;
            color: #ffffff;
        }
        .${uniqueClass} mdui-button-icon[icon="close"] {
            right: 15px;
        }
        .${uniqueClass} mdui-button-icon[icon="open_in_new"] {
            right: 65px;
        }`
        document.head.appendChild(styleEl)
        const frame = requestAnimationFrame(() => {
            if (!dialogRef.current) return
            dialogRef.current.open = true
            setVisible(true)
        })
        return () => {
            cancelAnimationFrame(frame)
            document.head.removeChild(styleEl)
        }
    }, [uniqueClass])

    return (
        <mdui-dialog
            ref={dialogRef}
            className={uniqueClass}
            fullscreen
            style={{
                width: '100%',
                height: '100%',
                '--mdui-motion-duration-medium4': '160ms',
                '--mdui-motion-duration-short3': '160ms',
            } as React.CSSProperties}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: visible ? 1 : 0 }}
                transition={{ duration: 0.16 }} style={{ width: '100%', height: '100%' }}>
            <mdui-button-icon
                icon="open_in_new"
                onClick={() => window.open(src, '_blank')} />
            <mdui-button-icon
                icon="close"
                onClick={() => dialogRef.current!.open = false} />
            {/* @ts-ignore */}
            <pinch-zoom
                ref={innerRef}
                onPointerDownCapture={(e: React.PointerEvent) => {
                    if (e.button !== 0) return
                    if (activePointersRef.current.size === 0) {
                        gestureRef.current = { x: e.clientX, y: e.clientY, dragged: false }
                    } else if (gestureRef.current) {
                        gestureRef.current.dragged = true
                    }
                    activePointersRef.current.add(e.pointerId)
                }}
                onPointerMoveCapture={trackPointerMove}
                onPointerUpCapture={(e: React.PointerEvent) => {
                    trackPointerMove(e)
                    activePointersRef.current.delete(e.pointerId)
                }}
                onPointerCancelCapture={(e: React.PointerEvent) => {
                    if (gestureRef.current) gestureRef.current.dragged = true
                    activePointersRef.current.delete(e.pointerId)
                }}
                onClick={closeOnBlankClick}
                style={{
                    width: '100%',
                    height: '100%',
                }}>
                {src && <img ref={imageRef} src={src} alt="预览" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                {/* @ts-ignore */}
            </pinch-zoom>
            </motion.div>
        </mdui-dialog>
    )
}

ImageViewerDialog.show = function (src: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<MotionConfig reducedMotion="user"><ImageViewerDialog src={src} onClose={onClose} /></MotionConfig>)
}
