import React from 'react'
import ReactClient from 'react-dom/client'
import { Dialog } from 'mdui'

export default function CircleProgressDialog({ text, onClose, closeRequested }: { text: string; onClose?: () => void; closeRequested?: { current: boolean } }) {
    const ref = React.useRef<Dialog>(null)

    React.useEffect(() => {
        const dialog = ref.current
        if (!dialog) return

        const onClosed = () => {
            onClose?.()
        }
        dialog.addEventListener('closed', onClosed)

        // 如果已经请求关闭，则直接关闭（opened 事件中处理）
        const onOpened = () => {
            if (closeRequested?.current) {
                dialog.open = false
            }
        }
        dialog.addEventListener('opened', onOpened)

        // 检查当前是否已请求关闭
        if (closeRequested?.current) {
            // 如果已经请求关闭，立即打开并关闭？不，直接关闭可能导致动画异常，但可以打开后立即关闭
            // 更好：直接设置 open = false，但 dialog 尚未打开，需要等 opened 再关
            // 这里我们不打开，让 opened 事件处理
        } else {
            dialog.open = true
        }

        return () => {
            dialog.removeEventListener('closed', onClosed)
            dialog.removeEventListener('opened', onOpened)
        }
    }, [onClose, closeRequested])

    return (
        <mdui-dialog ref={ref}>
            <div style={{ display: 'flex', alignItems: 'center', overflowY: 'hidden' }}>
                <mdui-circular-progress style={{ marginLeft: '3px' }} />
                <span style={{ marginLeft: '20px' }}>{text}</span>
            </div>
        </mdui-dialog>
    )
}

CircleProgressDialog.show = function (text: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const closeRequested = { current: false }

    let unmounted = false
    const onClose = () => {
        if (unmounted) return
        unmounted = true
        root.unmount()
        container.remove()
    }

    root.render(<CircleProgressDialog text={text} onClose={onClose} closeRequested={closeRequested} />)

    // 返回关闭函数
    return () => {
        closeRequested.current = true
        // 尝试立即关闭
        const dialog = container.querySelector('mdui-dialog') as any
        if (dialog) {
            dialog.open = false
        } else {
            // 如果尚未渲染，等待元素出现
            const check = () => {
                const d = container.querySelector('mdui-dialog') as any
                if (d) {
                    d.open = false
                } else {
                    // 继续等待，但设置超时避免死循环
                    requestAnimationFrame(check)
                }
            }
            // 延迟一帧开始检查，让 React 有机会渲染
            requestAnimationFrame(check)
        }
    }
}