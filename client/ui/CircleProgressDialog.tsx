import { $, Dialog, dialog } from 'mdui'
import React from 'react'
import useEventListener from './useEventListener.ts'
import ReactClient from "react-dom/client"

const closeList: { [k: string]: () => void } = {}
export default function CircleProgressDialog({ ref, text, closeId, onClose }: { closeId?: string, ref?: React.RefObject<any>, text: string, onClose?: () => void }) {
     ref = ref || React.useRef<Dialog>(undefined)

    useEventListener(ref, 'closed', () => onClose?.())

    closeId && (closeList[closeId] = () => ref.current!.open = false)
    
    return <mdui-dialog ref={ref}>
        <div style={{
            display: 'flex',
            alignItems: 'center',
        }}>
            <mdui-circular-progress style={{
                marginLeft: '3px',
            }}></mdui-circular-progress>
            <span style={{
                marginLeft: '20px',
            }}>{text}</span>
        </div>
    </mdui-dialog>
}

CircleProgressDialog.show = function(text: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }

    const closeId = new Date().toTimeString()

    root.render(<CircleProgressDialog text={text} closeId={closeId} onClose={onClose} />)

    return () => closeList[closeId]?.()
}
