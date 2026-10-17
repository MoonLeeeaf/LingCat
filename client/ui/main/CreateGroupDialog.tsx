import ReactClient from 'react-dom/client'
import React from 'react'
import { Dialog, TextField } from 'mdui'
import { ChatApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import tipError from '../tipError.ts'
import { Router } from '../routes/Router.ts'

interface CreateGroupDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    onClose?: () => void
}

export default function CreateGroupDialog({ ref, onClose }: CreateGroupDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const titleRef = React.useRef<TextField>(null)
    const uniqueRef = React.useRef<TextField>(null)
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

    const handleCreate = async () => {
        const title = titleRef.current?.value?.trim()
        if (!title) {
            tipError(new Error('请输入群组名称'), '创建群组')
            return
        }
        const unique = uniqueRef.current?.value?.trim() || undefined

        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        setLoading(true)
        try {
            const chatId = await ChatApi.createGroup(client, {
                access_token: session.token,
                title,
                unique,
            })
            ref.current!.open = false
            // ★ 通过 Router 实例导航（组件在 RouterProvider 之外）
            Router.navigate({
                to: '/chat/$chatId',
                params: { chatId },
                replace: true,
            })
        } catch (e) {
            tipError(e, '创建群组失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc headline="创建群组">
            <mdui-text-field
                variant="outlined"
                label="群组名称"
                ref={titleRef as any}
                style={{ width: '100%', marginBottom: '12px' }}
                required
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') uniqueRef.current?.focus()
                }}
            />
            <mdui-text-field
                variant="outlined"
                label="群标识符 (可选)"
                ref={uniqueRef as any}
                style={{ width: '100%' }}
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter') handleCreate()
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
                onClick={handleCreate}
            >
                {loading ? '创建中...' : '创建'}
            </mdui-button>
        </mdui-dialog>
    )
}

CreateGroupDialog.show = function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<CreateGroupDialog onClose={onClose} />)
}