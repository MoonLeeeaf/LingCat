import { UserApi } from "lingcat-client-protocol"
import { IMessage, IUser } from "lingcat-protocol"
import ClientManager from "../../ClientManager.ts"
import tipError from "../tipError.ts"
import Message from "../chat-layout/Message.tsx"
import RichText from "../chat-layout/RichText.tsx"
import Markdown, { ReactRenderer } from "marked-react"
import default_avatar from '../../default_avatar.png'
import React from "react"
import ProfileCache from "../../ProfileCache.ts"
import AppState from "../AppState.ts"

export default function ChatMessage({
    msg,
    hideSender,
    onAvatarClick,
    messageMenus,
    avatarMenus,
}: {
    msg: IMessage
    hideSender?: boolean
    onAvatarClick?: () => void
    messageMenus?: React.ReactNode
    avatarMenus?: React.ReactNode
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

    return <Message
        time={msg.time}
        avatarMenus={avatarMenus}
        onAvatarClick={onAvatarClick}
        messageMenus={messageMenus}
        isSystem={msg.system || false}
        senderName={profile?.nickname || ''}
        avatar={profile?.avatar_file_hash
            ? ClientManager.client.getFileUrlByHashAndToken(profile.avatar_file_hash, AppState.fileAccessToken)
            : default_avatar}
        isAtRight={isMe}
        hideSender={hideSender}
    >
        <RichText text={msg.text} entities={msg.entities || []} isSystem={msg.system!} />
    </Message>
}