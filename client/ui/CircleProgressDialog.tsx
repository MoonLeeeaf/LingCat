import React from 'react'
import ReactClient from 'react-dom/client'
import { Dialog } from 'mdui'
import useEventListener from './useEventListener.ts'

export default function CircleProgressDialog({ text, onClose }: { text: string, onClose?: () => void }) {
    const ref = React.useRef<Dialog>(null)

    useEventListener(ref, 'closed', () => onClose?.())

    React.useEffect(() => {
        if (ref.current) ref.current.open = true
    }, [])

    return (
        <mdui-dialog ref={ref}>
            <div style={{ display: 'flex', alignItems: 'center', }}>
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

    const onClose = () => {
        root.unmount()
        container.remove()
    }

    root.render(<CircleProgressDialog text={text} onClose={onClose} />)

    // 返回关闭函数，调用即销毁
    return onClose
}