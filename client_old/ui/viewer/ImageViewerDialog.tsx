import { Dialog } from 'mdui'
import PinchZoom from 'pinch-zoom-element/dist/pinch-zoom'
import ReactClient from "react-dom/client"
import React from 'react'
import useEventListener from '../useEventListener.ts'

export default function ImageViewerDialog({ src, onClose }: { src: string, onClose?: () => void }) {
    const dialogRef = React.useRef<Dialog>(null)
    const innerRef = React.useRef<PinchZoom>(null)
    const [uniqueClass] = React.useState(() => `image-viewer-${Math.random().toString(36).substr(2, 8)}`)

    useEventListener(dialogRef, 'closed', () => {
        onClose?.()
    })

    // 注入样式（含 ::part 和 内部按钮样式）
    React.useEffect(() => {
        const styleEl = document.createElement('style')
        styleEl.textContent = `
        .${uniqueClass}::part(panel) {
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
        .${uniqueClass} > mdui-button-icon[icon="close"],
        .${uniqueClass} > mdui-button-icon[icon="open_in_new"] {
            z-index: 114514;
            position: fixed;
            top: 15px;
            color: #ffffff;
        }
        .${uniqueClass} > mdui-button-icon[icon="close"] {
            right: 15px;
        }
        .${uniqueClass} > mdui-button-icon[icon="open_in_new"] {
            right: 65px;
        }`
        document.head.appendChild(styleEl)
        requestAnimationFrame(() => {
            dialogRef.current!.open = true
        })
        return () => {
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
            }}>
            <mdui-button-icon
                icon="open_in_new"
                onClick={() => window.open(src, '_blank')} />
            <mdui-button-icon
                icon="close"
                onClick={() => dialogRef.current!.open = false} />
            {/* @ts-ignore */}
            <pinch-zoom
                ref={innerRef}
                style={{
                    width: '100%',
                    height: '100%',
                }}>
                {src && <img src={src} alt="预览" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />}
                {/* @ts-ignore */}
            </pinch-zoom>
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
    root.render(<ImageViewerDialog src={src} onClose={onClose} />)
}
