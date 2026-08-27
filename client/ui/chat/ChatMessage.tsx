import { UserApi } from "lingcat-client-protocol"
import { IMessage, IUser } from "lingcat-protocol"
import ClientManager from "../../ClientManager.ts"
import tipError from "../tipError.ts"
import Message from "../chat-layout/Message.tsx"
import default_avatar from '../../default_avatar.png'
import React from "react"
import ProfileCache from "../../ProfileCache.ts"
import { ReactRenderer } from "marked-react"
import AppState from "../AppState.ts"

type Render = Partial<ReactRenderer>

export default function ChatMessage({
    msg,
    hideSender,
    onAvatarClick,
    messageMenus,
    avatarMenus,
    render,
}: {
    msg: IMessage
    hideSender?: boolean
    onAvatarClick?: () => void
    messageMenus?: React.ReactNode
    avatarMenus?: React.ReactNode
    render?: Render
}) {
    const [isMe, setIsMe] = React.useState(false)
    const [profile, setProfile] = React.useState<IUser>()

    React.useEffect(() => {
        (async () => {
            try {
                if (msg.sender_user_id && !msg.system) {
                    const profile = await ProfileCache.queryUserInfo(msg.sender_user_id)
                    setProfile(profile)
                    setIsMe((await ClientManager.getMe()).id == profile.id)
                }
            } catch (e) {
                tipError(e, '加载消息 ' + msg.id + ' 失败')
            }
        })()
    }, [msg.sender_user_id])

    return <Message time={msg.time} avatarMenus={avatarMenus} render={render} onAvatarClick={onAvatarClick} messageMenus={messageMenus} isSystem={msg.system || false} message={msg.text} senderName={profile?.nickname || ''} avatar={profile?.avatar_file_hash ? ClientManager.client.getFileUrlByHashAndToken(profile?.avatar_file_hash, AppState.fileAccessToken) : default_avatar} isAtRight={isMe} hideSender={hideSender} />
}