import React from 'react'
import PinchZoom from 'pinch-zoom-element/dist/pinch-zoom'

export interface ImageViewerContentProps {
    src: string
    onClose: () => void
}

/**
 * 图片查看器内容。
 * 样式注入到 <head>，作用到容器（父级 mdui-dialog）的 ::part。
 * 需要父级 mdui-dialog 使用本组件返回的 className。
 */
export function ImageViewerContent({ src, onClose, uniqueClass }: ImageViewerContentProps & { uniqueClass: string }) {
    const innerRef = React.useRef<PinchZoom>(null)

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
        return () => {
            document.head.removeChild(styleEl)
        }
    }, [uniqueClass])

    return (
        <>
            <mdui-button-icon
                icon="open_in_new"
                onClick={() => window.open(src, '_blank')}
            />
            <mdui-button-icon
                icon="close"
                onClick={onClose}
            />
            {/* @ts-ignore */}
            <pinch-zoom
                ref={innerRef}
                style={{ width: '100%', height: '100%' }}
            >
                {src && (
                    <img
                        src={src}
                        alt="预览"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                )}
                {/* @ts-ignore */}
            </pinch-zoom>
        </>
    )
}

/** 导出给路由用：把 className 也一起暴露 */
export function useImageViewerClassName(): string {
    const [uniqueClass] = React.useState(
        () => `image-viewer-${Math.random().toString(36).slice(2, 10)}`,
    )
    return uniqueClass
}
