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
import RemarksCache from '../../RemarksCache.ts'

export function ChatFragment() {
    const { chatId } = ChatRoute.useParams()
    const isMobile = useIsMobile()
    const { open: drawerOpen, toggle: toggleDrawer } = useDrawer()

    const [chat, setChat] = React.useState<IChat>()
    const [editingMessage, setEditingMessage] = React.useState<IMessage | null>(null)
    const messageInputRef = React.useRef<MessageInputHandle>(null)

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
        <>
            <ChatHeader
                title={title}
                isMobile={isMobile}
                drawerOpen={drawerOpen}
                onToggleDrawer={toggleDrawer}
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
                        <MeetingBanner chatId={chatId} />
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
        </>
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