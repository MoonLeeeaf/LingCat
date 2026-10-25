import React from 'react'
import { ChatApi } from 'lingcat-client-protocol'
import { LingCatProto, Methods, type IMessage, type IMessageEntity, type Package } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'
import tipError from '../tipError.ts'
import { useChatMessageStore } from './useChatMessageStore.ts'

const PAGE_SIZE = 30

export interface UseChatMessagesOptions {
    chatId: string
    /** 非成员不加载 */
    isMember: boolean
    /** 新消息追加到 store 后触发（用于"在底部时自动滚到底"） */
    onNewMessage?: () => void
}

/** 从 ClientManager 拿 client + token。失败抛错。 */
function requireClient() {
    const client = ClientManager.getActiveClient()
    const session = ClientManager.getActiveSession()
    if (!client || !session) throw new Error('no active client/session')
    return { client, token: session.token }
}

export function useChatMessages({
    chatId,
    isMember,
    onNewMessage,
}: UseChatMessagesOptions) {
    const sortedIds = useChatMessageStore(s => s.sortedIds)
    const firstItemIndex = useChatMessageStore(s => s.firstItemIndex)

    const [loading, setLoading] = React.useState(false)
    const loadingOlderRef = React.useRef(false)
    const loadingNewerRef = React.useRef(false)

    // 用 ref 拿最新的 onNewMessage，避免它变化时重订阅 WebSocket
    const onNewMessageRef = React.useRef(onNewMessage)
    React.useEffect(() => { onNewMessageRef.current = onNewMessage })

    // ============================================================
    //  初始化：切换对话时清空 + 拉最新一页
    // ============================================================
    React.useEffect(() => {
        if (!isMember) return
        let cancelled = false

        useChatMessageStore.getState().clear()
        setLoading(true)

        ;(async () => {
            loadingOlderRef.current = true
            try {
                const { client, token } = requireClient()
                const msgs = await ChatApi.getChatMessages(client, {
                    access_token: token,
                    limit: PAGE_SIZE,
                    chat_id: chatId,
                })
                if (cancelled) return
                useChatMessageStore.getState().initMessages(msgs)
            } catch (e) {
                if (!cancelled) tipError(e, '拉取消息失败')
            } finally {
                loadingOlderRef.current = false
                if (!cancelled) setLoading(false)
            }
        })()

        return () => {
            cancelled = true
        }
    }, [chatId, isMember])

    // ============================================================
    //  WebSocket：编辑事件 + 新消息
    // ============================================================
    React.useEffect(() => {
        if (!isMember) return
        const client = ClientManager.getActiveClient()
        if (!client) return

        const callback = (pkg: Package) => {
            const { appendMessages, updateMessage } = useChatMessageStore.getState()

            if (pkg.method_id === Methods.Message_Edited_Event) {
                const raw = LingCatProto.methods.Message_Edited_Event.decode(pkg.data)
                if (chatId !== raw.chatId) return
                updateMessage(raw.id, {
                    text: raw.text,
                    entities: (raw.entities ?? []).map(e => ({
                        type: e.type as IMessageEntity['type'],
                        offset: e.offset ?? 0,
                        length: e.length ?? 0,
                        data: e.data ?? undefined,
                    })),
                    edited_at: Number(raw.editedAt),
                })
                return
            }

            if (pkg.method_id === Methods.Receive_Chat_Message_Event) {
                const raw = LingCatProto.methods.Receive_Chat_Message_Event.decode(pkg.data).msg
                if (!raw || chatId !== raw.chatId) return
                if (useChatMessageStore.getState().messageMap.has(raw.id!)) return

                appendMessages([{
                    id: raw.id!,
                    text: raw.text!,
                    time: Number(raw.time ?? 0),
                    sender_user_id: raw.senderUserId,
                    system: raw.system,
                    chat_id: raw.chatId!,
                    entities: (raw.entities ?? []).map(e => ({
                        type: e.type as IMessageEntity['type'],
                        offset: e.offset ?? 0,
                        length: e.length ?? 0,
                        data: e.data ?? undefined,
                    })),
                }])
                onNewMessageRef.current?.()
            }
        }

        client.addOnReceiveListener(callback)
        return () => client.removeOnReceiveListener(callback)
    }, [chatId, isMember])

    // ============================================================
    //  分页：向上 / 向下
    // ============================================================
    const loadOlder = React.useCallback(async () => {
        if (loadingOlderRef.current || !isMember) return
        loadingOlderRef.current = true
        try {
            const { sortedIds: ids, prependMessages } = useChatMessageStore.getState()
            if (ids.length === 0) return
            const oldestId = ids[0]

            const { client, token } = requireClient()
            const older = await ChatApi.getChatMessages(client, {
                access_token: token,
                chat_id: chatId,
                before: oldestId,
                limit: PAGE_SIZE,
            })
            if (older.length > 0) prependMessages(older)
        } catch (e) {
            console.error('加载更旧消息失败:', e)
            tipError(e, '无法加载旧的消息')
        } finally {
            loadingOlderRef.current = false
        }
    }, [chatId, isMember])

    const loadNewer = React.useCallback(async () => {
        if (loadingNewerRef.current || !isMember) return
        loadingNewerRef.current = true
        try {
            const { sortedIds: ids, appendMessages } = useChatMessageStore.getState()
            if (ids.length === 0) return
            const newestId = ids[ids.length - 1]

            const { client, token } = requireClient()
            const newer = await ChatApi.getChatMessages(client, {
                access_token: token,
                chat_id: chatId,
                after: newestId,
                limit: PAGE_SIZE,
            })
            if (newer.length > 0) appendMessages(newer)
        } catch (e) {
            console.error('加载新消息失败:', e)
            tipError(e, '无法加载新的消息')
        } finally {
            loadingNewerRef.current = false
        }
    }, [chatId, isMember])

    return { sortedIds, firstItemIndex, loadOlder, loadNewer, loading }
}
