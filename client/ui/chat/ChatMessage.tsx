import React from 'react'
import type { IMessage, IUser } from 'lingcat-protocol'
import ProfileCache from '../../ProfileCache.ts'
import ClientManager from '../../ClientManager.ts'
import SessionEnv from '../../SessionEnv.ts'
import default_avatar from '../../default_avatar.png'
import getFileUrl from '../../lib/getFileUrl.ts'
import tipError from '../tipError.ts'
import Message from './Message.tsx'
import RichText from './RichText.tsx'
import RemarksCache from '../../RemarksCache.ts'

export interface ChatMessageProps {
    msg: IMessage
    hideSender?: boolean
    onAvatarClick?: () => void
    messageMenus?: React.ReactNode
    avatarMenus?: React.ReactNode
}

export default function ChatMessage({
    msg,
    hideSender,
    onAvatarClick,
    messageMenus,
    avatarMenus,
}: ChatMessageProps) {
    const [isMe, setIsMe] = React.useState(false)
    const [profile, setProfile] = React.useState<IUser>()

    React.useEffect(() => {
        let cancelled = false
        ;(async () => {
            if (!msg.sender_user_id || msg.system) return
            try {
                const p = await ProfileCache.queryUserInfo(msg.sender_user_id)
                if (cancelled) return
                setProfile(p)
                const me = await ClientManager.getMe()
                if (cancelled) return
                setIsMe(me.id === p.id)
            } catch (e) {
                if (!cancelled) tipError(e, '加载消息 ' + msg.id + ' 失败')
            }
        })()
        return () => { cancelled = true }
    }, [msg.sender_user_id, msg.system])

    return (
        <Message
            time={msg.time}
            edited_time={msg.edited_at}
            avatarMenus={avatarMenus}
            onAvatarClick={onAvatarClick}
            messageMenus={messageMenus}
            isSystem={msg.system || false}
            senderName={RemarksCache.get(msg.sender_user_id!) || profile?.nickname || ''}
            avatar={profile?.avatar_file_hash
                ? getFileUrl(profile.avatar_file_hash, SessionEnv.myFileAccessToken)!
                : default_avatar}
            isAtRight={isMe}
            hideSender={hideSender}
        >
            <RichText
                text={msg.text}
                entities={msg.entities || []}
                isSystem={msg.system!}
            />
        </Message>
    )
}