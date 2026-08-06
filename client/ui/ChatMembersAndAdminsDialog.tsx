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

export default function ChatMembersAndAdminsDialog({ ref, chat_id, onClose }: { ref?: React.RefObject<any>, chat_id: string, onClose?: () => void }) {
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

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ChatMembersAndAdminsDialog chat_id={chat_id} onClose={onClose} />)
}
