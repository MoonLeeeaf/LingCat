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

    const content = (
        <>
            <ChatHeader
                title={chat?.title ?? '加载中...'}
                isMobile={isMobile}
                drawerOpen={drawerOpen}
                onToggleDrawer={toggleDrawer}
                onOpenMembers={() => ChatMembersAndAdminsDialog.show(chatId)}
                onOpenSettings={() => ChatSettingsDialog.show(chatId)}
                onOpenInfo={() => ChatProfileDialog.show(chatId)}
            />

            {chat ? (
                chat.is_member ? (
                    <div style={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
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