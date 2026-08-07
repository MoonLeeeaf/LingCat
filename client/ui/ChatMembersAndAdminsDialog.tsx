import ReactClient from "react-dom/client"
import React from 'react'
import ReloadableImage from "./ReloadableImage.tsx"
import { $, dialog, Dialog, Tabs } from "mdui"
import useEventListener from "./useEventListener.ts"
import { IChat, IChatAdmin, IUser } from "lingcat-protocol"
import EffectOnly from "./EffectOnly.tsx"
import CircleProgressDialog from "./CircleProgressDialog.tsx"
import ClientManager from "../ClientManager.ts"
import default_avatar from '../default_avatar.png'
import { ChatApi, FileApi, UserApi } from "lingcat-client-protocol"
import Avatar from "./Avatar.tsx"
import tipError from "./tipError.ts"
import EditMyProfileDialog from "./EditMyProfileDialog.tsx"
import ProfileCache from "../ProfileCache.ts"
import AppState from "./AppState.ts"
import UserProfileDialog from "./UserProfileDialog.tsx"
import ImageViewerDialog from "./ImageViewerDialog.tsx"
import showSnackbar from "./showSnackbar.ts"

export default function ChatMembersAndAdminsDialog({ ref, chat_id, onClose }: { ref?: React.RefObject<any>, chat_id: string, onClose?: Function }) {
    ref = ref || React.useRef<Dialog>(undefined)

    const [loading, setLoading] = React.useState(true)
    const [members, setMembers] = React.useState<IUser[]>()
    const [admins, setAdmins] = React.useState<IChatAdmin[]>()

    React.useEffect(() => {
        (async () => {
            try {
                const members = await ChatApi.getChatMembers(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    chat_id,
                })
                setMembers(members)
            } catch (e) {
                tipError(e, '加载成员列表失败')
            }
            try {
                const admins = await ChatApi.getChatAdmins(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    chat_id,
                })
                setAdmins(admins)
            } catch (e) {
                tipError(e, '加载管理员列表失败')
            }
            setLoading(false)
        })()
    }, [chat_id])

    React.useEffect(() => {
        if (loading) return
        const eventName = 'closed'
        ref.current!.addEventListener(eventName, onClose)

        setTimeout(() => {
            ref.current!.open = true

            $(tabsRef.current!.shadowRoot).append(`
                <style>
                    .container {
                        background-color: inherit !important;
                    }
                </style>
            `)
        }, 10)

        return () => {
            ref.current?.removeEventListener(eventName, onClose)
        }
    }, [loading])

    const uploadChatAvatarRef = React.useRef<HTMLInputElement>(null)
    const tabsRef = React.useRef<Tabs>(null)

    return loading ? (<EffectOnly deps={[]} effect={() => {
        return CircleProgressDialog.show('加载中...')
    }} />)
        : (
            <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc headline="对话成员">
                <mdui-tabs value="成员" ref={tabsRef}>
                    <mdui-tab value="成员">成员</mdui-tab>
                    <mdui-tab value="管理员">管理员</mdui-tab>

                    <mdui-tab-panel slot="panel" value="成员">
                        <mdui-list>
                            {
                                members?.map((v) => <mdui-list-item rounded onClick={() => UserProfileDialog.show(v.id)}>
                                    <Avatar
                                        slot="icon"
                                        src={v.avatar_file_hash ? ClientManager.client.getFileUrlByHash(v.avatar_file_hash) : default_avatar}
                                    />
                                    {v.nickname}
                                </mdui-list-item>)
                            }
                        </mdui-list>
                    </mdui-tab-panel>
                    <mdui-tab-panel slot="panel" value="管理员">
                        <mdui-list>
                            {
                                admins?.map((v) => <mdui-list-item rounded onClick={() => UserProfileDialog.show(v.id)}>
                                    <Avatar
                                        slot="icon"
                                        src={v.avatar_file_hash ? ClientManager.client.getFileUrlByHash(v.avatar_file_hash) : default_avatar}
                                    />
                                    {v.nickname}
                                    <span slot="description">{({
                                        admin: "管理员",
                                        owner: "所有者",
                                    })[v.role]}<br></br>权能: {(() => {
                                        const perms = JSON.parse(v.permissions)
                                        return Object.keys(perms).filter((v) => perms[v]).join(', ')
                                    })()}</span>
                                </mdui-list-item>)
                            }
                        </mdui-list>
                    </mdui-tab-panel>
                </mdui-tabs>
            </mdui-dialog>
        )
}

ChatMembersAndAdminsDialog.show = function (chat_id: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    /**
     * 长点记性!!!!!!!!!!
     * Dropdown 放在 Dialog 里面
     * 会导致 Dropdown 关闭时
     * 反而触发 Dialog 的 onClose!!!!!
     */
    const onClose = (e: Event) => {
        if ((e.target as HTMLElement).tagName.toLowerCase() == 'mdui-dialog') {
            root.unmount()
            container.remove()
        }
    }
    root.render(<ChatMembersAndAdminsDialog chat_id={chat_id} onClose={onClose} />)
}

function EditAdminDialog({ ref, chat_id, admin, onClose }: { ref?: React.RefObject<any>, chat_id: string, admin: IChatAdmin, onClose?: () => void }) {
    ref = ref || React.useRef<Dialog>(undefined)
    const [localPerms, setLocalPerms] = React.useState<Record<string, boolean>>(() => {
        // 初始化为管理员当前的权限（解析 JSON）
        try {
            return JSON.parse(admin.permissions || '{}')
        } catch {
            return {}
        }
    })
    const [saving, setSaving] = React.useState(false)

    React.useEffect(() => {
        const eventName = 'closed'
        ref.current!.addEventListener(eventName, onClose)
        setTimeout(() => ref.current!.open = true, 10)
        return () => ref.current?.removeEventListener(eventName, onClose)
    }, [])

    const togglePermission = (perm: string) => {
        setLocalPerms(prev => ({
            ...prev,
            [perm]: !prev[perm],
        }))
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            await ChatApi.editChatAdminPermissions(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                chat_id,
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

    const avatar = admin?.avatar_file_hash ? ClientManager.client.getFileUrlByHash(admin.avatar_file_hash) : default_avatar

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
                    <span style={{
                        fontSize: '1.25rem'
                    }}>{admin?.nickname} ({admin.role == 'owner' ? '所有者' : '管理员'})</span>
                </div>
            </div>
            <mdui-list>
                {AvailableChatAdminPermissions.map(perm => (
                    <mdui-list-item
                        key={perm}
                        rounded
                        disabled={admin.role == 'owner'}
                        onClick={() => togglePermission(perm)}>
                        {perm}
                        <mdui-switch disabled={admin.role == 'owner'} slot="end-icon" checked={!!localPerms[perm]} checked-icon="" onChange={() => togglePermission(perm)} />
                    </mdui-list-item>
                ))}
            </mdui-list>

            <mdui-button slot="action" variant="text" onClick={() => ref.current!.open = false}>取消</mdui-button>
            {admin.role != 'owner' && <mdui-button slot="action" variant="text" onClick={handleSave} disabled={saving}>
                {saving ? '保存中...' : '保存'}
            </mdui-button>}
        </mdui-dialog>
    )
}

EditAdminDialog.show = function (chat_id: string, admin: IChatAdmin) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ChatMembersAndAdminsDialog chat_id={chat_id} onClose={onClose} />)
}
