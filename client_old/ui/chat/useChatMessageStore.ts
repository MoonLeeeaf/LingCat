import { IMessage } from 'lingcat-protocol'
import { create } from 'zustand'

interface ChatMessageStore {
    // 核心数据：seq -> IMessage
    messageMap: Map<number, IMessage>
    // 有序序列号列表（升序，即从旧到新）
    sortedIds: number[]
    // 用于 Virtuoso 的 firstItemIndex（防止顶部插入时滚动跳动）
    firstItemIndex: number

    // 初始化/跳转：完全替换消息列表（用于跳转到某个消息的上下文）
    initMessages: (messages: IMessage[], targetSeq?: number) => number | undefined

    // 顶部插入（加载更旧的消息）
    prependMessages: (messages: IMessage[]) => void

    // 底部追加（加载更新的消息）
    appendMessages: (messages: IMessage[]) => void

    // 单条消息追加（WebSocket 实时推送）
    addMessage: (msg: IMessage) => void

    updateMessage: (id: number, patch: Partial<IMessage>) => void

    // 清理
    clear: () => void

    scrollToSeqRequest: number | null
    requestScrollToSeq: (seq: number) => void
    clearScrollToSeqRequest: () => void
}

export const useChatMessageStore = create<ChatMessageStore>((set, get) => ({
    messageMap: new Map<number, IMessage>(),
    sortedIds: [],
    firstItemIndex: 0,

    initMessages: (messages, targetSeq) => {
        const newMap = new Map<number, IMessage>()
        const ids: number[] = []
        messages.forEach(msg => {
            if (msg.id !== undefined) {
                newMap.set(msg.id, msg)
                ids.push(msg.id)
            }
        })
        ids.sort((a, b) => a - b)

        set({
            messageMap: newMap,
            sortedIds: ids,
            firstItemIndex: 100000,
        })

        // 如果指定了 targetSeq，返回它在排序列表中的索引
        if (targetSeq != null) {
            return ids.indexOf(targetSeq)
        }
        return undefined
    },

    prependMessages: (messages) => {
        const { messageMap, sortedIds, firstItemIndex } = get()
        const newMap = new Map(messageMap)
        const newIds = [...sortedIds]
        let addedCount = 0

        messages.forEach(msg => {
            if (msg.id != null && !newMap.has(msg.id)) {
                newMap.set(msg.id, msg)
                newIds.push(msg.id)
                addedCount++
            }
        })

        if (addedCount == 0) return

        newIds.sort((a, b) => a - b)
        set({
            messageMap: newMap,
            sortedIds: newIds,
            // 顶部插入了 addedCount 条消息，firstItemIndex 减小
            firstItemIndex: firstItemIndex - addedCount,
        })
    },

    appendMessages: (messages) => {
        const { messageMap, sortedIds } = get()
        const newMap = new Map(messageMap)
        const newIds = [...sortedIds]
        let addedCount = 0

        messages.forEach(msg => {
            if (msg.id != null && !newMap.has(msg.id)) {
                newMap.set(msg.id, msg)
                newIds.push(msg.id)
                addedCount++
            }
        })

        if (addedCount === 0) return

        newIds.sort((a, b) => a - b)
        // 底部追加不影响 firstItemIndex
        set({
            messageMap: newMap,
            sortedIds: newIds,
        })
    },

    addMessage: (msg) => {
        if (msg.id == null) return
        const { messageMap, sortedIds } = get()
        if (messageMap.has(msg.id)) return

        const newMap = new Map(messageMap).set(msg.id, msg)
        const newIds = [...sortedIds, msg.id].sort((a, b) => a - b)
        set({
            messageMap: newMap,
            sortedIds: newIds,
        })
    },

    updateMessage: (id: number, patch: Partial<IMessage>) => {
        const { messageMap } = get()
        const existing = messageMap.get(id)
        if (!existing) return
        const newMap = new Map(messageMap)
        newMap.set(id, { ...existing, ...patch })
        set({ messageMap: newMap })
    },

    clear: () => {
        set({
            messageMap: new Map(),
            sortedIds: [],
            firstItemIndex: 0,
        })
    },

    scrollToSeqRequest: null,

    requestScrollToSeq: (seq) => set({ scrollToSeqRequest: seq }),
    clearScrollToSeqRequest: () => set({ scrollToSeqRequest: null }),
}))