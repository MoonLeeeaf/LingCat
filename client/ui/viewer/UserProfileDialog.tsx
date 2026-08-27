import ReactClient from "react-dom/client"
import React from 'react'
import ReloadableImage from "../ReloadableImage.tsx"
import { Dialog } from "mdui"
import useEventListener from "../useEventListener.ts"
import { IUser } from "lingcat-protocol"
import EffectOnly from "../EffectOnly.tsx"
import CircleProgressDialog from "../CircleProgressDialog.tsx"
import ClientManager from "../../ClientManager.ts"
import default_avatar from '../../default_avatar.png'
import { ChatApi, UserApi } from "lingcat-client-protocol"
import Avatar from "../Avatar.tsx"
import tipError from "../tipError.ts"
import EditMyProfileDialog from "../main/EditMyProfileDialog.tsx"
import ProfileCache from "../../ProfileCache.ts"
import AppState from "../AppState.ts"
import ImageViewerDialog from "./ImageViewerDialog.tsx"

export default function UserProfileDialog({ ref, user_id, onClose }: { ref?: React.RefObject<any>, user_id: string, onClose?: () => void }) {
    ref = ref || React.useRef<Dialog>(undefined)

    const [loading, setLoading] = React.useState(true)
    const [profile, setProfile] = React.useState<IUser>()
    const [isMe, setIsMe] = React.useState(false)

    React.useEffect(() => {
        (async () => {
            try {
                const profile = await ProfileCache.queryUserInfo(user_id)
                setProfile(profile)
                setIsMe((await ClientManager.getMe()).id == profile.id)
            } catch (e) {
                tipError(e, '加载失败')
            }
            setLoading(false)
        })()
    }, [user_id])

    React.useEffect(() => {
        if (loading) return
        const eventName = 'closed'
        ref.current!.addEventListener(eventName, onClose)
        setTimeout(() => ref.current!.open = true, 10)
        return () => ref.current?.removeEventListener(eventName, onClose)
    }, [loading])

    const avatar = profile ? (profile?.avatar_file_hash ? ClientManager.client?.getFileUrlByHashAndToken(profile?.avatar_file_hash, AppState.fileAccessToken) : default_avatar) : default_avatar

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
                        }}>{profile?.nickname}</span>
                    </div>
                </div>
                <div style={{
                    marginTop: "10px",
                }}></div>
                <mdui-list>
                    <mdui-list-item icon="info" rounded>{profile?.id}<span slot="description">用户 ID</span></mdui-list-item>
                    {profile?.username && <mdui-list-item icon="alternate_email" rounded>{profile?.username}<span slot="description">用户名</span></mdui-list-item>}
                    {profile?.description && <mdui-list-item icon="description" rounded>{profile?.description}<span slot="description">简介</span></mdui-list-item>}
                    {isMe && <mdui-list-item icon="edit" rounded onClick={() => EditMyProfileDialog.show()}>编辑资料</mdui-list-item>}
                    <mdui-list-item icon="chat" rounded onClick={async () => {
                        try {
                            const chat_id = await ChatApi.getOrCreatePrivateChat(ClientManager.client, {
                                access_token: ClientManager.getActiveUserSession().token,
                                target_user_id: profile?.id!,
                            })
                            const chat = await ProfileCache.queryChatInfo(chat_id)
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

UserProfileDialog.show = function (user_id: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<UserProfileDialog user_id={user_id} onClose={onClose} />)
}
