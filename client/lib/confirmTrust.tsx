import ReactDOM from 'react-dom/client'
import { TrustServerDialog, type TrustServerDialogProps } from '../ui/auth/TrustServerDialog.tsx'

/**
 * 弹出 TOFU 信任确认对话框，返回用户是否接受。
 */
export function confirmTrust(
    opts: Omit<TrustServerDialogProps, 'onAccept' | 'onReject'>,
): Promise<boolean> {
    return new Promise((resolve) => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = ReactDOM.createRoot(container)
        const cleanup = () => { root.unmount(); container.remove() }

        root.render(
            <TrustServerDialog
                {...opts}
                onAccept={() => { cleanup(); resolve(true) }}
                onReject={() => { cleanup(); resolve(false) }}
            />,
        )
    })
}