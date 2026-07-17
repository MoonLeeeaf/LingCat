import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import MessageContainer from "../chat-layout/MessageContainer.tsx"
import UserProfileDialog from "../UserProfileDialog.tsx"
import ChatMessage from "./ChatMessage.tsx"
import { useChatMessageStore } from "./useChatMessageStore.ts"
import { IChat, IMessage, LingCatProto, Methods, Package } from "lingcat-protocol"
import React from "react"
import { NavigationDrawer, TextField } from "mdui"
import { ChatApi } from "lingcat-client-protocol"
import ClientManager from "../../ClientManager.ts"
import tipError from "../tipError.ts"
import ChatProfileDialog from "../ChatProfileDialog.tsx"

export default function ChatFragment({ chat, drawerRef }: { chat: IChat, drawerRef: React.RefObject<NavigationDrawer | undefined> }) {
    const virtuosoRef = React.useRef<VirtuosoHandle>(null)

    const messageStore = useChatMessageStore()

    React.useEffect(() => {
        (async () => {
            loadingRef.current = true
            try {
                const msgs = await ChatApi.getChatMessages(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    limit: 20,
                    chat_id: chat.id,
                })
                // console.log(msgs)
                messageStore.initMessages(msgs)

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        virtuosoRef.current!.scrollToIndex(msgs[msgs.length - 1].id)
                        setTimeout(() => {
                            virtuosoRef.current!.scrollTo({
                                top: 10000000000,
                                behavior: "smooth",
                            })
                        }, 100)
                        loadingRef.current = false
                    }, 100)
                })

            } catch (e) {
                tipError(e, "拉取消息失败")
                loadingRef.current = false
            }
        })()

        function callback(mPackage: Package) {
            const { appendMessages } = useChatMessageStore.getState()
            // TODO: 向 lingcat-client-protocol 添加全局的监听方法
            if (mPackage.method_id == Methods.Receive_Chat_Message_Event) {
                const raw = LingCatProto.methods.Receive_Chat_Message_Event.decode(mPackage.data).msg
                appendMessages([{
                    id: raw?.id!,
                    text: raw?.text!,
                    time: raw?.time!,
                    sender_user_id: raw?.senderUserId,
                    system: raw?.system,
                    chat_id: raw?.chatId!,
                }])

                if (isAtBottomRef.current) {
                    setTimeout(() => {
                        virtuosoRef.current!.scrollTo({
                            top: 10000000000,
                            behavior: "smooth",
                        })
                    }, 200)
                }
            }
        }
        ClientManager.client.addOnReceiveListener(callback)
        return () => ClientManager.client.removeOnReceiveListener(callback)
    }, [chat])

    const loadingRef = React.useRef(false)
    const isAtBottomRef = React.useRef(false)
    const atTopStateChange = React.useCallback((atTop: boolean) => {
        console.log('top', atTop, loadingRef.current)
        if (!atTop || loadingRef.current) return

        (async () => {
            loadingRef.current = true

            try {
                const { sortedIds, prependMessages } = useChatMessageStore.getState()
                // 没有消息
                if (sortedIds.length == 0) return

                const oldestId = sortedIds[0]
                // before: oldestId, limit: 20
                const olderMessages: IMessage[] = await ChatApi.getChatMessages(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    chat_id: chat.id,
                    before: oldestId,
                    limit: 20,
                })
                console.log(olderMessages)

                if (olderMessages.length > 0) {
                    prependMessages(olderMessages)
                    virtuosoRef.current!.scrollToIndex(oldestId - 1)
                }
            } catch (e) {
                console.error('加载更旧消息失败:', e)
                tipError(e, '无法加载旧的消息')
            } finally {
                loadingRef.current = false
            }
        })()
    }, [])
    const atBottomStateChange = React.useCallback((atBottom: boolean) => {
        console.log('bottom', atBottom, loadingRef.current)
        if (!atBottom || loadingRef.current) {
            isAtBottomRef.current = atBottom
            return
        }

        (async () => {
            loadingRef.current = true
            isAtBottomRef.current = true

            try {
                const { sortedIds, appendMessages } = useChatMessageStore.getState()
                // after: sortedIds[sortedIds.length - 1], limit: 20
                const newerMessages: IMessage[] = await ChatApi.getChatMessages(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    chat_id: chat.id,
                    limit: 20,
                    after: sortedIds[sortedIds.length - 1],
                })

                if (newerMessages.length == 0) {
                    isAtBottomRef.current = true
                } else {
                    appendMessages(newerMessages)
                    isAtBottomRef.current = true
                }
            } catch (e) {
                isAtBottomRef.current = false
                console.error('加载新消息失败:', e)
                tipError(e, '无法加载新的消息')
            } finally {
                loadingRef.current = false
            }
        })()
    }, [])

    const id = 'a' + Date.now()

    const inputRef = React.useRef<TextField>(null)

    const { sortedIds } = useChatMessageStore()

    async function sendMessage() {
        const text = inputRef.current?.value || ''
        if (text.trim() == '') return
        try {
            await ChatApi.sendChatMessage(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                chat_id: chat.id,
                text,
            })
            inputRef.current!.value = ''
        } catch (e) {
            tipError(e, '发送失败')
        }
    }

    return <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', width: '100%' }}>
        <mdui-top-app-bar scroll-target={'#' + id}>
            <mdui-button-icon icon="menu" onClick={() => {
                drawerRef.current && (drawerRef.current.open = !drawerRef.current.open)
            }}></mdui-button-icon>
            <mdui-top-app-bar-title style={{ marginLeft: '8px' }}>{chat.title}</mdui-top-app-bar-title>
            <div style={{ flexGrow: 1 }}></div>
            <mdui-button-icon icon="info" style={{ marginRight: '4px' }} onClick={() => ChatProfileDialog.show(chat.id)}></mdui-button-icon>
        </mdui-top-app-bar>

        <div id={id} style={{ display: 'flex', width: '100%' }}>
            <MessageContainer>
                <Virtuoso
                    ref={virtuosoRef}
                    style={{ overflowY: 'auto' }}
                    totalCount={sortedIds.length}
                    atTopStateChange={atTopStateChange}
                    atBottomStateChange={atBottomStateChange}
                    itemContent={(index) => {
                        const { sortedIds, messageMap } = useChatMessageStore.getState()
                        const id = sortedIds[index]
                        if (id == null) return <div style={{ height: '0.5px' }}></div>
                        const msg = messageMap.get(id);
                        if (!msg) return <div style={{ height: '0.5px' }}></div>
                        return <ChatMessage msg={msg} messageMenus={<>
                            <mdui-menu-item icon="info">Info</mdui-menu-item>
                        </>} />
                    }} />

                <div style={{
                    flexGrow: 1,
                }}></div>
                <mdui-text-field ref={inputRef} use-patched-textarea variant="outlined" autosize max-rows={10} placeholder="输入..." style={{
                    padding: '4px',
                }} onKeyDown={(event) => {
                    if (event.ctrlKey && event.key == 'Enter')
                        sendMessage()
                }}>
                    <mdui-button-icon slot="end-icon" icon="keyboard_arrow_left"></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '20px' }}></div>
                    <mdui-button-icon slot="end-icon" icon="keyboard_arrow_right"></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '20px' }}></div>

                    <mdui-button-icon slot="end-icon" icon="attachment"></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '20px' }}></div>
                    <mdui-button-icon slot="end-icon" icon="send" onClick={() => sendMessage()}></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '5px' }}></div>
                </mdui-text-field>
            </MessageContainer>
        </div>
    </div>
}