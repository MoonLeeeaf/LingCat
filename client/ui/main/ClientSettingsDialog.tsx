import ReactClient from 'react-dom/client'
import React from 'react'
import { Dialog } from 'mdui'
import SwitchUserDialog from './SwitchUserDialog.tsx'
import ManagePublicKeysDialog from './ManagePublicKeysDialog.tsx'

interface ClientSettingsDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    onClose?: () => void
}

export function ClientSettingsDialog({ ref, onClose }: ClientSettingsDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    React.useEffect(() => {
        const el = ref.current
        if (!el) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== el) return    // ★ 过滤子元素的 closed 冒泡
            onClose?.()
        }
        el.addEventListener('closed', handleClosed)

        el.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (!cancelled) el.open = true
            })
        })

        return () => {
            cancelled = true
            el.removeEventListener('closed', handleClosed)
        }
    }, [onClose])

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc>
            <span slot="headline">客户端设置</span>

            <mdui-list>
                <mdui-list-item
                    icon="switch_account"
                    rounded
                    onClick={() => SwitchUserDialog.show()}
                >
                    切换用户
                </mdui-list-item>
                <mdui-list-item
                    icon="key"
                    rounded
                    onClick={() => ManagePublicKeysDialog.show()}
                >
                    服务端公钥管理
                </mdui-list-item>
            </mdui-list>
        </mdui-dialog>
    )
}

ClientSettingsDialog.show = function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ClientSettingsDialog onClose={onClose} />)
}

export default ClientSettingsDialog