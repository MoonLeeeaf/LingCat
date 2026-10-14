import React from 'react'
import { IUser } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'
import default_avatar from '../../default_avatar.png'
import { ChatApi } from 'lingcat-client-protocol'
import Avatar from '../Avatar.tsx'
import tipError from '../tipError.ts'
import ProfileCache from '../../ProfileCache.ts'
import AppState from '../AppState.ts'
import CopyableListItem from '../CopyableListItem.tsx'
import getFileUrl from '../../lib/getFileUrl.ts'
import SessionEnv from '../../SessionEnv.ts'

export interface UserProfileContentProps {
    userId: string
    /** 点击头像查看大图 */
    onViewAvatar: (url: string) => void
    /** 点击"编辑资料"（仅 isMe 时显示） */
    onEditProfile: () => void
    /** 点击"打开对话"，参数为对方的 userId */
    onOpenChat: (userId: string) => void
}

export function UserProfileContent({
    userId,
    onViewAvatar,
    onEditProfile,
    onOpenChat,
}: UserProfileContentProps) {
    const [loading, setLoading] = React.useState(true)
    const [profile, setProfile] = React.useState<IUser>()
    const [isMe, setIsMe] = React.useState(false)

    React.useEffect(() => {
        let cancelled = false
            ; (async () => {
                try {
                    const p = await ProfileCache.queryUserInfo(userId)
                    if (cancelled) return
                    setProfile(p)
                    const me = await ClientManager.getMe()
                    if (cancelled) return
                    setIsMe(me.id === p.id)
                } catch (e) {
                    if (!cancelled) tipError(e, '加载失败')
                }
                if (!cancelled) setLoading(false)
            })()
        return () => { cancelled = true }
    }, [userId])

    const avatar = profile?.avatar_file_hash
        ? getFileUrl(profile.avatar_file_hash, SessionEnv.myFileAccessToken)
        : default_avatar

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
                width: '100%',
            }}>
                <mdui-circular-progress />
            </div>
        )
    }

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar onClick={() => onViewAvatar(avatar!)} src={avatar} />
                <div style={{
                    display: 'flex',
                    marginLeft: '15px',
                    marginRight: '15px',
                    flexDirection: 'column',
                    wordBreak: 'break-word',
                }}>
                    <span style={{ fontSize: '1.25rem' }}>{profile?.nickname}</span>
                </div>
            </div>

            <div style={{ marginTop: '10px' }} />

            <mdui-list>
                <CopyableListItem icon="info" value={profile?.id || ''} description="用户 ID" />
                {profile?.username && (
                    <CopyableListItem icon="alternate_email" value={profile.username} description="用户名" />
                )}
                {profile?.description && (
                    <CopyableListItem icon="description" value={profile.description} description="简介" />
                )}
                {isMe && (
                    <mdui-list-item icon="edit" rounded onClick={onEditProfile}>
                        编辑资料
                    </mdui-list-item>
                )}
                <mdui-list-item
                    icon="chat"
                    rounded
                    onClick={() => onOpenChat(profile?.id!)}
                >
                    打开对话
                </mdui-list-item>
            </mdui-list>
        </>
    )
}