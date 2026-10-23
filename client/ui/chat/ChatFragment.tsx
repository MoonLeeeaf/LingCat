import React from 'react'
import { ChatRoute } from '../routes/ChatRoute.tsx'
import { DialogForRouter } from '../DialogForRouter.tsx'
import { useIsMobile } from '../../lib/useIsMobile.ts'
import { useDrawer } from '../main_layout/DrawerContext.ts'
import { useAsyncEffect } from '../../lib/useAsyncEffect.ts'
import { ChatApi } from 'lingcat-client-protocol'
import type { IChat, IMessage } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'
import tipError from '../tipError.ts'
import ChatProfileDialog from '../viewer/ChatProfileDialog.tsx'
import { ChatHeader } from './ChatHeader.tsx'
import { JoinChatPrompt } from './JoinChatPrompt.tsx'
import { MessageList } from './MessageList.tsx'
import { MessageInput, type MessageInputHandle } from './MessageInput.tsx'
import ChatMembersAndAdminsDialog from './ChatMembersAndAdminsDialog.tsx'
import ChatSettingsDialog from './ChatSettingsDialog.tsx'
import { useMeetingStore } from '../meeting/MeetingManager.ts'
import { useMeetingUIStore } from '../meeting/MeetingUIStore.ts'
import showSnackbar from '../showSnackbar.ts'
import { MeetingBanner } from './MeetingBanner.tsx'
import { useChatBackground } from './useChatBackground.ts'
import ChatBackground from './ChatBackground.tsx'
import RemarksCache from '../../RemarksCache.ts'
import { useE2EStore } from '../../lib/e2e/useE2EStore.ts'

export function ChatFragment() {
    const { chatId } = ChatRoute.useParams()
    const isMobile = useIsMobile()
    const { open: drawerOpen, toggle: toggleDrawer } = useDrawer()

    const [chat, setChat] = React.useState<IChat>()
    const [editingMessage, setEditingMessage] = React.useState<IMessage | null>(null)
    const messageInputRef = React.useRef<MessageInputHandle>(null)
    const chatBackgroundUrl = useChatBackground(chatId)

    const reloadChat = React.useCallback(async () => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return
        try {
            setChat(await ChatApi.queryChatInfo(client, {
                access_token: session.token,
                chat_id: chatId,
            }))
        } catch (e) {
            tipError(e, '查询对话失败')
        }
    }, [chatId])

    const loadE2E = useE2EStore(s => s.loadKeyState)
    const fetchPeerKeys = useE2EStore(s => s.fetchPeerKeys)

    React.useEffect(() => {
        // 1. 拉取自己的加密状态
        loadE2E()
    }, [])

    const e2eStatus = useE2EStore(s => s.status)
    const peerKeys = useE2EStore(s => s.peerKeys)
    const peerVerifyStatus = useE2EStore(s => s.peerVerifyStatus)

    // 判断是否开启了 E2E (私聊 + 双方都有公钥 + 本地未禁用)
    const peerUserId = chat?.type === 'private' ? chat.peer_user_id : undefined
    const peerPub = peerUserId ? peerKeys[peerUserId] : null
    const isE2EActive = !!peerUserId && !!peerPub && e2eStatus !== 'disabled'
    const verifyStatus = peerUserId ? peerVerifyStatus[peerUserId] : 'unverified'

    // 确保拉取了对方公钥 (如果没有这段，加上)
    React.useEffect(() => {
        if (peerUserId && !peerPub) {
            fetchPeerKeys([peerUserId])
        }
    }, [peerUserId, peerPub, fetchPeerKeys])

    useAsyncEffect(async () => {
        await reloadChat()
    }, [chatId])

    // 切对话时清空编辑状态
    React.useEffect(() => {
        setEditingMessage(null)
    }, [chatId])

    const insertIntoInput = (text: string) => {
        messageInputRef.current?.insertText(text)
        messageInputRef.current?.focus()
    }

    // 我是否在该 chat 会议中（用于通话按钮的图标/状态）
    const room = useMeetingStore(s => s.room)
    const currentMeetingChatId = useMeetingStore(s => s.chatId)
    const isInThisMeeting = !!room && currentMeetingChatId === chatId

    // 该 chat 是否有活跃会议（用于决定按钮行为：加入 vs 发起）
    const hasActiveMeeting = useMeetingStore(s => !!s.activeMeetings[chatId])

    const onCall = async () => {
        if (!chat) return

        // 我已在会议中
        if (isInThisMeeting) {
            const uiState = useMeetingUIStore.getState()
            if (!uiState.isOpen) {
                uiState.open()
            } else {
                showSnackbar({ message: '你已在此会议中' })
            }
            return
        }

        // 我在别的会议里 → 提示
        if (room) {
            showSnackbar({ message: '请先挂断当前会议' })
            return
        }

        try {
            if (hasActiveMeeting) {
                const active = useMeetingStore.getState().activeMeetings[chatId]
                await useMeetingStore.getState().joinMeeting(chatId, active.meetingId, chat.title ?? undefined)
            } else {
                await useMeetingStore.getState().startMeeting(chat)
            }
            useMeetingUIStore.getState().open()
        } catch (e) {
            tipError(e, '发起会议失败')
        }
    }

    const userRemark = chat?.peer_user_id && RemarksCache.get(chat.peer_user_id)

    const title = userRemark || chat?.title || '加载中...'

    const content = (
        <div style={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {chatBackgroundUrl && <ChatBackground url={chatBackgroundUrl} />}

            <div style={{
                position: 'relative',
                zIndex: 1,
                flex: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
            }}>
                <ChatHeader
                    title={chat?.title ?? '加载中...'}
                    isMobile={isMobile}
                    drawerOpen={drawerOpen}
                    onToggleDrawer={toggleDrawer}
                    isE2E={isE2EActive}
                    e2eStatus={verifyStatus}
                    onOpenMembers={() => ChatMembersAndAdminsDialog.show(chatId)}
                    onOpenSettings={() => ChatSettingsDialog.show(chatId)}
                    onOpenInfo={() => ChatProfileDialog.show(chatId)}
                    onCall={chat?.is_member ? onCall : undefined}
                />

                {chat ? (
                    chat.is_member ? (
                        <div style={{
                            flex: 1,
                            minHeight: 0,
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <MeetingBanner chatId={chatId} translucent={!!chatBackgroundUrl} />
                            <MessageList
                                chatId={chatId}
                                isMember={true}
                                onStartEdit={setEditingMessage}
                                onInsertText={insertIntoInput}
                            />
                            <MessageInput
                                ref={messageInputRef}
                                chatId={chatId}
                                chatTitle={chat.title ?? ''}
                                peerUserId={chat.type === 'private' ? chat.peer_user_id : undefined}
                                enableMentions={chat.type === 'group'}
                                editingMessage={editingMessage}
                                onEditCancel={() => setEditingMessage(null)}
                                onEditDone={() => setEditingMessage(null)}
                            />
                        </div>
                    ) : (
                        <JoinChatPrompt
                            chat={chat}
                            onJoined={() => reloadChat()}
                        />
                    )
                ) : (
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <mdui-circular-progress />
                    </div>
                )}
            </div>
        </div>
    )

    if (isMobile) {
        return (
            <DialogForRouter
                open
                fullscreen
                fullBleed
                closeOnEsc={false}
                closeOnOverlayClick={false}
                onCloseRequest={() => window.history.back()}
            >
                {content}
            </DialogForRouter>
        )
    }

    return (
        <div
            id="ChatFragment"
            style={{
                flex: 1,
                minWidth: 0,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {content}
        </div>
    )
}