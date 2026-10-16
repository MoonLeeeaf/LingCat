import ReactClient from 'react-dom/client'
import React from 'react'
import { Dialog, TextField } from 'mdui'
import { ChatApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import tipError from '../tipError.ts'
import { Router } from '../routes/Router.ts'

interface OpenChatDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    onClose?: () => void
}

export default function OpenChatDialog({ ref, onClose }: OpenChatDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const inputRef = React.useRef<TextField>(null)
    const [loading, setLoading] = React.useState(false)

    // 打开 + closed 过滤
    React.useEffect(() => {
        const el = ref.current
        if (!el) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== el) return
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

    const handleOpen = async () => {
        const identifier = inputRef.current?.value?.trim()
        if (!identifier) {
            tipError(new Error('请输入对话标识符 / 用户名 / 用户 ID'), '打开对话')
            return
        }

        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        setLoading(true)
        try {
            const chatId = await ChatApi.resolveChatIdentifier(client, {
                access_token: session.token,
                identifier,
            })
            ref.current!.open = false
            // ★ 通过 Router 实例导航（组件在 RouterProvider 之外）
            Router.navigate({
                to: '/chat/$chatId',
                params: { chatId },
                replace: true,
            })
        } catch (e) {
            tipError(e, '打开对话失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc headline="打开对话">
            <mdui-text-field
                variant="outlined"
                label="对话标识符 / 用户名 / 用户 ID"
                ref={inputRef as any}
                style={{ width: '100%' }}
                clearable
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') handleOpen()
                }}
            />
            <mdui-button
                slot="action"
                variant="text"
                onClick={() => ref.current!.open = false}
            >
                取消
            </mdui-button>
            <mdui-button
                slot="action"
                variant="text"
                disabled={loading || undefined}
                onClick={handleOpen}
            >
                {loading ? '打开中...' : '打开'}
            </mdui-button>
        </mdui-dialog>
    )
}

OpenChatDialog.show = function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<OpenChatDialog onClose={onClose} />)
}
