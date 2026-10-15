import ReactClient from 'react-dom/client'
import React from 'react'
import { dialog, Dialog } from 'mdui'
import ClientManager from '../../ClientManager.ts'
import showSnackbar from '../showSnackbar.ts'
import type { LocalSession } from '../../lib/ClientStorage.ts'
import { LoginOrRegisterDialog } from '../auth/LoginOrRegisterDialog.tsx'

interface SwitchUserDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    onClose?: () => void
}

export default function SwitchUserDialog({ ref, onClose }: SwitchUserDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    // 用一个 key 强制重渲染（删除会话后刷新列表）
    const [k, setK] = React.useState(Date.now().toString())

    React.useEffect(() => {
        const dialogEl = ref.current
        if (!dialogEl) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== dialogEl) return    // ★ 过滤子元素 closed 冒泡
            onClose?.()
        }
        dialogEl.addEventListener('closed', handleClosed)

        dialogEl.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (!cancelled) dialogEl.open = true
            })
        })

        return () => {
            cancelled = true
            dialogEl.removeEventListener('closed', handleClosed)
        }
    }, [onClose])

    const activeKey = ClientManager.getActiveSession()?.key
    const sessions = ClientManager.listUserSessions()

    const handleSwitch = (session: LocalSession) => {
        if (session.key === activeKey) return
        ClientManager.setActiveUserSessionKey(session.key)
        // 切换后整页刷新：所有初始化（client / fileToken / profile）需要重新走
        location.reload()
    }

    const handleRemove = (session: LocalSession) => {
        dialog({
            headline: '提示',
            body: `确定要删除「${session.account}」(${session.server}) 吗？`,
            closeOnEsc: true,
            closeOnOverlayClick: true,
            actions: [
                { text: '取消', onClick: () => true },
                {
                    text: '确定',
                    variant: 'text',
                    onClick: () => {
                        ClientManager.removeUserSession(session.key)
                        setK(Date.now().toString())
                        showSnackbar({ message: '已删除' })
                        return true
                    },
                },
            ],
        })
    }

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc>
            <span slot="headline">切换用户</span>

            <mdui-list>
                <mdui-list-item rounded icon="refresh" onClick={() => setK(Date.now().toString())}>
                    刷新
                </mdui-list-item>

                <div key={k}>
                    {sessions.length === 0 && (
                        <mdui-list-item rounded disabled>没有可用的账号</mdui-list-item>
                    )}
                    {sessions.map((s) => (
                        <mdui-dropdown trigger="hover" key={s.key}>
                            <mdui-list-item
                                active={activeKey === s.key}
                                slot="trigger"
                                rounded
                                onClick={() => handleSwitch(s)}
                            >
                                {s.account || s.nickname || s.userId.slice(0, 8)}
                                <span slot="description">{s.server}</span>
                            </mdui-list-item>

                            <mdui-menu>
                                <mdui-menu-item
                                    icon="delete"
                                    onClick={() => handleRemove(s)}
                                >
                                    删除
                                </mdui-menu-item>
                            </mdui-menu>
                        </mdui-dropdown>
                    ))}
                    <mdui-list-item
                        rounded
                        icon="add"
                        onClick={() => {
                            LoginOrRegisterDialog.show({
                                allowClose: true,
                                onSuccess: () => {
                                    // 已登录新账号 → 整个 app 需要重新初始化
                                    location.reload()
                                },
                            })
                        }}
                    >
                        添加账号
                    </mdui-list-item>
                </div>
            </mdui-list>
        </mdui-dialog>
    )
}

SwitchUserDialog.show = function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<SwitchUserDialog onClose={onClose} />)
}