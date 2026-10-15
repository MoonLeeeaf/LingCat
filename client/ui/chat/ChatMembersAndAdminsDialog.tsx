import ReactClient from 'react-dom/client'
import React from 'react'
import { $, dialog, Dialog, Tabs } from 'mdui'
import type { IChatAdmin, IUser } from 'lingcat-protocol'
import { AvailableChatAdminPermissions } from 'lingcat-protocol'
import EffectOnly from '../EffectOnly.tsx'
import CircleProgressDialog from '../CircleProgressDialog.tsx'
import ClientManager from '../../ClientManager.ts'
import default_avatar from '../../default_avatar.png'
import { ChatApi } from 'lingcat-client-protocol'
import Avatar from '../Avatar.tsx'
import tipError from '../tipError.ts'
import UserProfileDialog from '../viewer/UserProfileDialog.tsx'
import showSnackbar from '../showSnackbar.ts'
import SessionEnv from '../../SessionEnv.ts'
import getFileUrl from '../../lib/getFileUrl.ts'

interface ChatMembersAndAdminsDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    chatId: string
    onClose?: () => void
}

export default function ChatMembersAndAdminsDialog({
    ref,
    chatId,
    onClose,
}: ChatMembersAndAdminsDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)
    const tabsRef = React.useRef<Tabs>(null)

    const [loading, setLoading] = React.useState(true)
    const [iAmOwner, setIAmOwner] = React.useState(false)
    const [iAmAdmin, setIAmAdmin] = React.useState(false)
    const [members, setMembers] = React.useState<IUser[]>()
    const [admins, setAdmins] = React.useState<IChatAdmin[]>()

    const refreshData = React.useCallback(async () => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        try {
            const m = await ChatApi.getChatMembers(client, {
                access_token: session.token,
                chat_id: chatId,
            })
            setMembers(m)
        } catch (e) {
            tipError(e, '加载成员列表失败')
        }

        try {
            const a = await ChatApi.getChatAdmins(client, {
                access_token: session.token,
                chat_id: chatId,
            })
            setAdmins(a)
            const me = await ClientManager.getMe()
            setIAmAdmin(!!a?.find(x => x.id === me.id))
            setIAmOwner(!!a?.find(x => x.id === me.id && x.role === 'owner'))
        } catch (e) {
            tipError(e, '加载管理员列表失败')
        }
    }, [chatId])

    React.useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                await refreshData()
            } finally {
                if (!cancelled) setLoading(false)
            }
        })()
        return () => { cancelled = true }
    }, [chatId, refreshData])

    // 打开 + 关闭监听
    React.useEffect(() => {
        if (loading) return
        const el = ref.current
        if (!el) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== el) return    // ★ 忽略 dropdown 等子元素的 closed 冒泡
            onClose?.()
        }
        el.addEventListener('closed', handleClosed)

        el.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (cancelled) return
                el.open = true
                const tabs = tabsRef.current
                if (tabs?.shadowRoot) {
                    $(tabs.shadowRoot).append(`
                        <style>
                            .container { background-color: inherit !important; }
                        </style>
                    `)
                }
            })
        })

        return () => {
            cancelled = true
            el.removeEventListener('closed', handleClosed)
        }
    }, [loading, onClose])

    if (loading) {
        return <EffectOnly deps={[]} effect={() => CircleProgressDialog.show('加载中...')} />
    }

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc headline="对话成员">
            <mdui-tabs value="成员" ref={tabsRef}>
                <mdui-tab value="成员">成员</mdui-tab>
                <mdui-tab value="管理员">管理员</mdui-tab>

                <mdui-tab-panel slot="panel" value="成员">
                    <mdui-list>
                        {members?.map((v) => (
                            <mdui-dropdown trigger="hover" key={v.id}>
                                <mdui-list-item
                                    slot="trigger"
                                    rounded
                                    onClick={() => UserProfileDialog.show(v.id)}
                                >
                                    <Avatar
                                        slot="icon"
                                        src={v.avatar_file_hash
                                            ? getFileUrl(v.avatar_file_hash, SessionEnv.myFileAccessToken)
                                            : default_avatar}
                                    />
                                    {v.nickname}
                                </mdui-list-item>

                                <mdui-menu style={{ display: iAmAdmin ? undefined : 'none' }}>
                                    {iAmAdmin && (
                                        <mdui-menu-item
                                            icon="delete"
                                            onClick={() => confirmRemoveMember(chatId, v, refreshData)}
                                        >
                                            移除成员
                                        </mdui-menu-item>
                                    )}
                                    {iAmOwner && (
                                        <mdui-menu-item
                                            icon="admin_panel_settings"
                                            onClick={() => confirmAddAdmin(chatId, v, refreshData)}
                                        >
                                            添加为管理员
                                        </mdui-menu-item>
                                    )}
                                </mdui-menu>
                            </mdui-dropdown>
                        ))}
                    </mdui-list>
                </mdui-tab-panel>

                <mdui-tab-panel slot="panel" value="管理员">
                    <mdui-list>
                        {admins?.map((v) => (
                            <mdui-dropdown trigger="hover" key={v.id}>
                                <mdui-list-item
                                    slot="trigger"
                                    rounded
                                    onClick={() => UserProfileDialog.show(v.id)}
                                >
                                    <Avatar
                                        slot="icon"
                                        src={v.avatar_file_hash
                                            ? getFileUrl(v.avatar_file_hash, SessionEnv.myFileAccessToken)
                                            : default_avatar}
                                    />
                                    {v.nickname}
                                    <span slot="description">
                                        {({ admin: '管理员', owner: '所有者' } as const)[v.role as 'admin' | 'owner']}
                                        <br />
                                        权能: {(() => {
                                            try {
                                                const perms = JSON.parse(v.permissions || '{}')
                                                return Object.keys(perms).filter(k => perms[k]).join(', ') || '(无)'
                                            } catch { return '(无)' }
                                        })()}
                                    </span>
                                </mdui-list-item>

                                <mdui-menu style={{ display: iAmOwner ? undefined : 'none' }}>
                                    <mdui-menu-item
                                        icon="edit"
                                        onClick={() => EditAdminDialog.show(chatId, v, refreshData)}
                                    >
                                        编辑权能
                                    </mdui-menu-item>
                                    <mdui-menu-item
                                        icon="delete"
                                        onClick={() => confirmRemoveAdmin(chatId, v, refreshData)}
                                    >
                                        移除管理员
                                    </mdui-menu-item>
                                </mdui-menu>
                            </mdui-dropdown>
                        ))}
                    </mdui-list>
                </mdui-tab-panel>
            </mdui-tabs>
        </mdui-dialog>
    )
}

// ============================================================
//  二次确认（独立函数，避免在 JSX 里堆太多逻辑）
// ============================================================

function confirmRemoveMember(chatId: string, user: IUser, onDone: () => void) {
    dialog({
        headline: '提示',
        body: `确定要从对话中移除 ${user.nickname} 吗?`,
        closeOnEsc: true,
        closeOnOverlayClick: true,
        actions: [
            { text: '取消', onClick: () => true },
            {
                text: '确定',
                variant: 'text',
                onClick: async () => {
                    const client = ClientManager.getActiveClient()
                    const session = ClientManager.getActiveSession()
                    if (!client || !session) return
                    try {
                        await ChatApi.removeChatMember(client, {
                            access_token: session.token,
                            chat_id: chatId,
                            target_user_id: user.id,
                        })
                        showSnackbar({ message: '已移除成员' })
                        onDone()
                    } catch (e) {
                        tipError(e, '移除成员失败')
                    }
                },
            },
        ],
    })
}

function confirmAddAdmin(chatId: string, user: IUser, onDone: () => void) {
    dialog({
        headline: '提示',
        body: `确定要添加 ${user.nickname} 为管理员吗?`,
        closeOnEsc: true,
        closeOnOverlayClick: true,
        actions: [
            { text: '取消', onClick: () => true },
            {
                text: '确定',
                variant: 'text',
                onClick: async () => {
                    const client = ClientManager.getActiveClient()
                    const session = ClientManager.getActiveSession()
                    if (!client || !session) return
                    try {
                        await ChatApi.addChatAdmin(client, {
                            access_token: session.token,
                            chat_id: chatId,
                            target_user_id: user.id,
                            permissions: {},
                        })
                        showSnackbar({ message: '已添加为管理员' })
                        onDone()
                    } catch (e) {
                        tipError(e, '添加管理员失败')
                    }
                },
            },
        ],
    })
}

function confirmRemoveAdmin(chatId: string, admin: IChatAdmin, onDone: () => void) {
    dialog({
        headline: '提示',
        body: `确定要移除管理员 ${admin.nickname} 吗?`,
        closeOnEsc: true,
        closeOnOverlayClick: true,
        actions: [
            { text: '取消', onClick: () => true },
            {
                text: '确定',
                variant: 'text',
                onClick: async () => {
                    const client = ClientManager.getActiveClient()
                    const session = ClientManager.getActiveSession()
                    if (!client || !session) return
                    try {
                        await ChatApi.removeChatAdmin(client, {
                            access_token: session.token,
                            chat_id: chatId,
                            target_user_id: admin.id,
                        })
                        showSnackbar({ message: '已移除该管理员' })
                        onDone()
                    } catch (e) {
                        tipError(e, '移除管理员失败')
                    }
                },
            },
        ],
    })
}

ChatMembersAndAdminsDialog.show = function (chatId: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ChatMembersAndAdminsDialog chatId={chatId} onClose={onClose} />)
}

// ============================================================
//                      EditAdminDialog
// ============================================================

interface EditAdminDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    chatId: string
    admin: IChatAdmin
    onClose?: () => void
}

function EditAdminDialog({ ref, chatId, admin, onClose }: EditAdminDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const [localPerms, setLocalPerms] = React.useState<Record<string, boolean>>(() => {
        try {
            return JSON.parse(admin.permissions || '{}')
        } catch {
            return {}
        }
    })
    const [saving, setSaving] = React.useState(false)

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

    const togglePermission = (perm: string) => {
        setLocalPerms(prev => ({ ...prev, [perm]: !prev[perm] }))
    }

    const handleSave = async () => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        setSaving(true)
        try {
            await ChatApi.editChatAdminPermissions(client, {
                access_token: session.token,
                chat_id: chatId,
                target_user_id: admin.id,
                permissions: localPerms,
            })
            showSnackbar({ message: '权限已更新' })
            ref.current!.open = false
            onClose?.()
        } catch (e) {
            tipError(e, '更新权限失败')
        } finally {
            setSaving(false)
        }
    }

    const avatar = admin.avatar_file_hash
        ? getFileUrl(admin.avatar_file_hash, SessionEnv.myFileAccessToken)
        : default_avatar

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar onClick={() => UserProfileDialog.show(admin.id)} src={avatar} />
                <div style={{
                    display: 'flex',
                    marginLeft: '15px',
                    marginRight: '15px',
                    flexDirection: 'column',
                    wordBreak: 'break-word',
                }}>
                    <span style={{ fontSize: '1.25rem' }}>
                        {admin.nickname} ({admin.role === 'owner' ? '所有者' : '管理员'})
                    </span>
                </div>
            </div>

            <mdui-list>
                {AvailableChatAdminPermissions.map((perm) => (
                    <mdui-list-item
                        key={perm}
                        rounded
                        disabled={admin.role === 'owner'}
                        onClick={() => togglePermission(perm)}
                    >
                        {perm}
                        <mdui-switch
                            disabled={admin.role === 'owner'}
                            slot="end-icon"
                            checked={!!localPerms[perm]}
                            checked-icon=""
                            onChange={() => togglePermission(perm)}
                        />
                    </mdui-list-item>
                ))}
            </mdui-list>

            <mdui-button slot="action" variant="text" onClick={() => ref.current!.open = false}>
                取消
            </mdui-button>
            {admin.role !== 'owner' && (
                <mdui-button slot="action" variant="text" onClick={handleSave} disabled={saving}>
                    {saving ? '保存中...' : '保存'}
                </mdui-button>
            )}
        </mdui-dialog>
    )
}

EditAdminDialog.show = function (
    chatId: string,
    admin: IChatAdmin,
    onSaved?: () => void,
) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
        onSaved?.()   // ★ 保存后刷新父列表
    }
    root.render(<EditAdminDialog chatId={chatId} admin={admin} onClose={onClose} />)
}