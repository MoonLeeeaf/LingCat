import ReactClient from "react-dom/client"
import React from 'react'
import ReloadableImage from "./ReloadableImage.tsx"
import { Dialog } from "mdui"
import useEventListener from "./useEventListener.ts"
import { IChat, IUser } from "lingcat-protocol"
import EffectOnly from "./EffectOnly.tsx"
import CircleProgressDialog from "./CircleProgressDialog.tsx"
import ClientManager from "../ClientManager.ts"
import default_avatar from '../default_avatar.png'
import { ChatApi, UserApi } from "lingcat-client-protocol"
import Avatar from "./Avatar.tsx"
import tipError from "./tipError.ts"
import EditMyProfileDialog from "./EditMyProfileDialog.tsx"
import ProfileCache from "../ProfileCache.ts"
import AppState from "./AppState.ts"
import UserProfileDialog from "./UserProfileDialog.tsx"
import ImageViewerDialog from "./ImageViewerDialog.tsx"

function findFavourited(chatId: string) {
    return AppState.favouritedChats?.findIndex(chat => chat.id == chatId)
}

export default function ChatProfileDialog({ ref, chat_id, onClose }: { ref?: React.RefObject<any>, chat_id: string, onClose?: () => void }) {
    ref = ref || React.useRef<Dialog>(undefined)

    const [loading, setLoading] = React.useState(true)
    const [profile, setProfile] = React.useState<IChat>()
    const [favourited, setFavourited] = React.useState(findFavourited(chat_id) != -1)

    React.useEffect(() => {
        (async () => {
            try {
                const chat = await ProfileCache.queryChatInfo(chat_id)
                setProfile(chat!)
            } catch (e) {
                tipError(e, '加载失败')
            }
            setLoading(false)
        })()
    }, [chat_id])

    React.useEffect(() => {
        if (loading) return
        const eventName = 'closed'
        ref.current!.addEventListener(eventName, onClose)
        setTimeout(() => ref.current!.open = true, 10)
        return () => ref.current?.removeEventListener(eventName, onClose)
    }, [loading])

    const avatar = profile ? (profile?.avatar_file_hash ? ClientManager.client?.getFileUrlByHash(profile?.avatar_file_hash) : default_avatar) : default_avatar

    return loading ? (<EffectOnly deps={[]} effect={() => {
        return CircleProgressDialog.show('加载中...')
    }} />)
        : (
            <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Avatar onClick={() => ImageViewerDialog.show(avatar)} src={avatar} />
                    <div style={{
                        display: 'flex',
                        marginLeft: '15px',
                        marginRight: '15px',
                        flexDirection: 'column',
                        wordBreak: 'break-word',
                    }}>
                        <span style={{
                            fontSize: '1.25rem'
                        }}>{profile?.title}</span>
                    </div>
                </div>
                <div style={{
                    marginTop: "10px",
                }}></div>
                <mdui-list>
                    <mdui-list-item icon="info" rounded>{profile?.id}<span slot="description">对话 ID</span></mdui-list-item>
                    <mdui-list-item icon={({
                        group: "group",
                        private: "person",
                    })[profile?.type!]} rounded>{({
                        group: "群组",
                        private: "私聊",
                    })[profile?.type!]}<span slot="description">对话类型</span></mdui-list-item>
                    {profile?.chat_unique && <mdui-list-item icon="alternate_email" rounded>{profile?.chat_unique}<span slot="description">对话标识符</span></mdui-list-item>}
                    {profile?.description && <mdui-list-item icon="description" rounded>{profile?.description}<span slot="description">简介</span></mdui-list-item>}
                    {profile?.type == 'private' && <mdui-list-item icon="info" rounded onClick={async () => UserProfileDialog.show(
                        await ChatApi.getAnotherUserFromPrivateChat(ClientManager.client, {
                            access_token: ClientManager.getActiveUserSession().token,
                            target_chat_id: chat_id,
                        })
                    )}>用户信息</mdui-list-item>}
                    <mdui-list-item icon={favourited ? 'favorite_border' : 'favorite'} rounded onClick={async () => {
                        try {
                            await ChatApi.setChatFavourited(ClientManager.client, {
                                access_token: ClientManager.getActiveUserSession().token,
                                chat_id: chat_id,
                                favourited: !favourited,
                            })
                            if (favourited)
                                AppState.favouritedChats.splice(findFavourited(chat_id), 1)
                            else
                                AppState.favouritedChats.push(profile!)
                            setFavourited(!favourited)

                        } catch (e) {
                            console.log(e)
                            tipError(e, (favourited ? '取消' : '') + "收藏对话失败")
                        }
                    }}>{favourited ? '取消收藏' : '收藏对话'}</mdui-list-item>
                    <mdui-list-item icon="chat" rounded onClick={async () => {
                        try {
                            const chat = await ProfileCache.queryChatInfo(profile?.id!)
                            AppState.setActiveChat(chat)
                            ref.current!.open = false
                        } catch (e) {
                            console.log(e)
                            tipError(e, "打开对话失败")
                        }
                    }}>打开对话</mdui-list-item>
                </mdui-list>
            </mdui-dialog>
        )
}

ChatProfileDialog.show = function (chat_id: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ChatProfileDialog chat_id={chat_id} onClose={onClose} />)
}
