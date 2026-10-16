import React from 'react'
import ReactClient from 'react-dom/client'
import { Dialog } from 'mdui'
import type { IChat } from 'lingcat-protocol'
import { ChatApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import ProfileCache from '../../ProfileCache.ts'
import SessionEnv from '../../SessionEnv.ts'
import default_avatar from '../../default_avatar.png'
import getFileUrl from '../../lib/getFileUrl.ts'
import Avatar from '../Avatar.tsx'
import CopyableListItem from '../CopyableListItem.tsx'
import CircleProgressDialog from '../CircleProgressDialog.tsx'
import EffectOnly from '../EffectOnly.tsx'
import tipError from '../tipError.ts'
import UserProfileDialog from './UserProfileDialog.tsx'
import ImageViewerDialog from './ImageViewerDialog.tsx'
import { Router } from '../routes/Router.ts'   // ★ 用于在 RouterProvider 外导航
import RemarksCache from '../../RemarksCache.ts'

function findFavourited(chatId: string) {
    return SessionEnv.favouritedChats?.findIndex(chat => chat.id === chatId)
}

interface ChatProfileDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    chatId: string
    onClose?: () => void
}

export default function ChatProfileDialog({ ref, chatId, onClose }: ChatProfileDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const [loading, setLoading] = React.useState(true)
    const [profile, setProfile] = React.useState<IChat>()
    const [favourited, setFavourited] = React.useState(findFavourited(chatId) !== -1)

    React.useEffect(() => {
        let cancelled = false
            ; (async () => {
                try {
                    const chat = await ProfileCache.queryChatInfo(chatId)
                    if (cancelled) return
                    setProfile(chat ?? undefined)
                    setFavourited(findFavourited(chatId) !== -1)
                } catch (e) {
                    if (!cancelled) tipError(e, '加载失败')
                }
                if (!cancelled) setLoading(false)
            })()
        return () => { cancelled = true }
    }, [chatId])

    // loading 结束 → 等 mdui-dialog 首次更新完成再 open，走"非首次渲染"路径（有动画）
    React.useEffect(() => {
        if (loading) return
        const dialog = ref.current
        if (!dialog) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== dialog) return    // ★ 忽略 dropdown 等子元素的 closed 冒泡
            onClose?.()
        }
        dialog.addEventListener('closed', handleClosed)

        dialog.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (!cancelled) dialog.open = true
            })
        })

        return () => {
            cancelled = true
            dialog.removeEventListener('closed', handleClosed)
        }
    }, [loading, onClose])

    const avatar = profile?.avatar_file_hash
        ? getFileUrl(profile.avatar_file_hash, SessionEnv.myFileAccessToken)
        : default_avatar

    const userRemark = profile?.peer_user_id
        ? RemarksCache.get(profile.peer_user_id)
        : undefined

    if (loading) {
        return (
            <EffectOnly deps={[]} effect={() => CircleProgressDialog.show('加载中...')} />
        )
    }

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar onClick={() => ImageViewerDialog.show(avatar!)} src={avatar} />
                <div style={{
                    display: 'flex',
                    marginLeft: '15px',
                    marginRight: '15px',
                    flexDirection: 'column',
                    wordBreak: 'break-word',
                }}>
                    <span style={{ fontSize: '1.25rem' }}>
                        {userRemark || profile?.title}
                    </span>
                    {userRemark && profile?.title && (
                        <span style={{
                            fontSize: '0.8rem',
                            opacity: 0.55,
                            marginTop: '2px',
                        }}>
                            {profile.title}
                        </span>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '10px' }} />

            <mdui-list>
                <CopyableListItem icon="info" value={profile?.id || ''} description="对话 ID" />

                <mdui-list-item
                    icon={({ group: 'group', private: 'person' } as const)[profile?.type as 'group' | 'private']}
                    rounded
                >
                    {({ group: '群组', private: '私聊' } as const)[profile?.type as 'group' | 'private']}
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
                            const client = ClientManager.getActiveClient()
                            const session = ClientManager.getActiveSession()
                            if (!client || !session) return
                            try {
                                const userId = await ChatApi.getAnotherUserFromPrivateChat(client, {
                                    access_token: session.token,
                                    target_chat_id: chatId,
                                })
                                UserProfileDialog.show(userId)
                            } catch (e) {
                                tipError(e, '加载用户信息失败')
                            }
                        }}
                    >
                        用户信息
                    </mdui-list-item>
                )}

                <mdui-list-item
                    icon={favourited ? 'favorite_border' : 'favorite'}
                    rounded
                    onClick={async () => {
                        const client = ClientManager.getActiveClient()
                        const session = ClientManager.getActiveSession()
                        if (!client || !session) return
                        try {
                            await ChatApi.setChatFavourited(client, {
                                access_token: session.token,
                                chat_id: chatId,
                                favourited: !favourited,
                            })
                            const list = SessionEnv.favouritedChats ?? []
                            if (favourited) {
                                const idx = findFavourited(chatId)
                                if (idx >= 0) list.splice(idx, 1)
                            } else if (profile) {
                                list.push(profile)
                            }
                            SessionEnv.favouritedChats = list
                            setFavourited(!favourited)
                        } catch (e) {
                            console.log(e)
                            tipError(e, (favourited ? '取消' : '') + '收藏对话失败')
                        }
                    }}
                >
                    {favourited ? '取消收藏' : '收藏对话'}
                </mdui-list-item>

                <mdui-list-item
                    icon="chat"
                    rounded
                    onClick={() => {
                        const id = profile?.id
                        if (!id) return
                        ref.current!.open = false
                        // ★ 通过 Router 实例导航（组件在 RouterProvider 之外，不能用 useNavigate）
                        Router.navigate({
                            to: '/chat/$chatId',
                            params: { chatId: id },
                            replace: true,   // 桌面端同级切换，避免历史栈膨胀
                        })
                    }}
                >
                    打开对话
                </mdui-list-item>
            </mdui-list>
        </mdui-dialog>
    )
}

ChatProfileDialog.show = function (chatId: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ChatProfileDialog chatId={chatId} onClose={onClose} />)
}