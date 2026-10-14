import React from 'react'
import { IChat } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'
import default_avatar from '../../default_avatar.png'
import { ChatApi } from 'lingcat-client-protocol'
import Avatar from '../Avatar.tsx'
import tipError from '../tipError.ts'
import getFileUrl from '../../lib/getFileUrl.ts'
import SessionEnv from '../../SessionEnv.ts'
import ProfileCache from '../../ProfileCache.ts'
import CopyableListItem from '../CopyableListItem.tsx'
import { useNavigate } from '@tanstack/react-router'

export interface ChatProfileContentProps {
    chatId: string
    /** 点击"打开对话"时的行为（由路由层决定怎么导航） */
    onOpenChat: (chatId: string) => void
    onOpenUser: (userId: string) => void
}

function findFavourited(chatId: string) {
    return SessionEnv.favouritedChats?.findIndex(chat => chat.id === chatId)
}

export function ChatProfileContent({ chatId, onOpenChat, onOpenUser }: ChatProfileContentProps) {
    const [loading, setLoading] = React.useState(true)
    const [profile, setProfile] = React.useState<IChat>()
    const [favourited, setFavourited] = React.useState(findFavourited(chatId) !== -1)

    const navigate = useNavigate()

    React.useEffect(() => {
        let cancelled = false
            ; (async () => {
                try {
                    const chat = await ProfileCache.queryChatInfo(chatId)
                    if (!cancelled) setProfile(chat!)
                } catch (e) {
                    if (!cancelled) tipError(e, '加载失败')
                }
                if (!cancelled) setLoading(false)
            })()
        return () => { cancelled = true }
    }, [chatId])

    const avatar = profile?.avatar_file_hash
        ? getFileUrl(profile.avatar_file_hash, SessionEnv.myFileAccessToken)
        : default_avatar

    if (loading) return null

    return (
        <>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                    onClick={() => navigate({
                        to: '/viewer/image',
                        search: { url: avatar! },
                    })}
                    src={avatar}
                />
                <div style={{
                    display: 'flex',
                    marginLeft: '15px',
                    marginRight: '15px',
                    flexDirection: 'column',
                    wordBreak: 'break-word',
                }}>
                    <span style={{ fontSize: '1.25rem' }}>{profile?.title}</span>
                </div>
            </div>

            <div style={{ marginTop: '10px' }} />

            <mdui-list>
                <CopyableListItem icon="info" value={profile?.id || ''} description="对话 ID" />
                <mdui-list-item
                    icon={({ group: 'group', private: 'person' })[profile?.type!]}
                    rounded
                >
                    {({ group: '群组', private: '私聊' })[profile?.type!]}
                    <span slot="description">对话类型</span>
                </mdui-list-item>
                {profile?.chat_unique && (
                    <CopyableListItem icon="alternate_email" value={profile.chat_unique} description="对话标识符" />
                )}
                {profile?.description && (
                    <CopyableListItem icon="description" value={profile.description} description="简介" />
                )}
                {profile?.type === 'private' && (
                    <mdui-list-item
                        icon="info"
                        rounded
                        onClick={async () => {
                            const userId = await ChatApi.getAnotherUserFromPrivateChat(ClientManager.getActiveClient()!, {
                                access_token: ClientManager.getActiveSession()?.token!,
                                target_chat_id: chatId,
                            })
                            // onOpenUser 由父组件（Route）传入
                            onOpenUser?.(userId)
                        }}
                    >
                        用户信息
                    </mdui-list-item>
                )}
                <mdui-list-item
                    icon={favourited ? 'favorite_border' : 'favorite'}
                    rounded
                    onClick={async () => {
                        try {
                            await ChatApi.setChatFavourited(ClientManager.getActiveClient()!, {
                                access_token: ClientManager.getActiveSession()?.token!,
                                chat_id: chatId,
                                favourited: !favourited,
                            })
                            if (favourited) {
                                SessionEnv.favouritedChats.splice(findFavourited(chatId), 1)
                            } else {
                                SessionEnv.favouritedChats.push(profile!)
                            }
                            setFavourited(!favourited)
                        } catch (e) {
                            console.log(e)
                            tipError(e, (favourited ? '取消' : '') + '收藏对话失败')
                        }
                    }}
                >
                    {favourited ? '取消收藏' : '收藏对话'}
                </mdui-list-item>
                <mdui-list-item icon="chat" rounded onClick={() => onOpenChat(chatId)}>
                    打开对话
                </mdui-list-item>
            </mdui-list>
        </>
    )
}