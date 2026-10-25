import type { IMessage } from 'lingcat-protocol'
import { create } from 'zustand'

/** Virtuoso 的 firstItemIndex 初值。越大越安全，但要留够向下的空间 */
const INITIAL_FIRST_ITEM_INDEX = 100000
let highlightToken = 0

/** 消息补丁：id 不可改 */
type MessagePatch = Omit<Partial<IMessage>, 'id'>

/**
 * 合并两个已排序的 number 数组（升序），去重。
 * 用于把"新加载的 id 列表"合并进现有 sortedIds。
 */
function mergeSorted(a: number[], b: number[]): number[] {
    const result: number[] = []
    let i = 0
    let j = 0
    while (i < a.length || j < b.length) {
        if (i >= a.length) {
            result.push(b[j++])
        } else if (j >= b.length) {
            result.push(a[i++])
        } else if (a[i] < b[j]) {
            result.push(a[i++])
        } else if (a[i] > b[j]) {
            result.push(b[j++])
        } else {
            result.push(a[i])
            i++
            j++
        }
    }
    return result
}

interface ChatMessageStore {
    highlightRequest: { seq: number, token: number } | null
    highlightMessage: (seq: number) => void
    clearHighlight: (token: number) => void
    /** seq -> IMessage */
    messageMap: Map<number, IMessage>
    /** 升序 seq 列表 */
    sortedIds: number[]
    /** Virtuoso 锚定用 */
    firstItemIndex: number

    /** 完全替换消息列表。返回 targetSeq 在列表中的索引（未找到返回 -1）。 */
    initMessages: (messages: IMessage[], targetSeq?: number) => number
    /** 顶部插入（加载更旧） */
    prependMessages: (messages: IMessage[]) => void
    /** 底部追加（加载更新 / 批量） */
    appendMessages: (messages: IMessage[]) => void
    /** 单条追加（WebSocket 实时） */
    addMessage: (msg: IMessage) => void
    /** 局部更新 */
    updateMessage: (id: number, patch: MessagePatch) => void
    /** 清空 */
    clear: () => void

    /** 跳转请求（由 UI 层消费） */
    scrollToSeqRequest: number | null
    requestScrollToSeq: (seq: number) => void
    clearScrollToSeqRequest: () => void
}

export const useChatMessageStore = create<ChatMessageStore>((set, get) => ({
    highlightRequest: null,
    highlightMessage: (seq) => set({ highlightRequest: { seq, token: ++highlightToken } }),
    clearHighlight: (token) => {
        if (get().highlightRequest?.token === token) set({ highlightRequest: null })
    },
    messageMap: new Map(),
    sortedIds: [],
    firstItemIndex: INITIAL_FIRST_ITEM_INDEX,

    initMessages: (messages, targetSeq) => {
        const newMap = new Map<number, IMessage>()
        const ids: number[] = []
        for (const msg of messages) {
            if (msg.id != null) {
                newMap.set(msg.id, msg)
                ids.push(msg.id)
            }
        }
        ids.sort((a, b) => a - b)

        set({
            messageMap: newMap,
            sortedIds: ids,
            firstItemIndex: INITIAL_FIRST_ITEM_INDEX,
        })

        return targetSeq != null ? ids.indexOf(targetSeq) : -1
    },

    prependMessages: (messages) => {
        const { messageMap, sortedIds, firstItemIndex } = get()

        const newMap = new Map(messageMap)
        const addedIds: number[] = []
        for (const msg of messages) {
            if (msg.id != null && !newMap.has(msg.id)) {
                newMap.set(msg.id, msg)
                addedIds.push(msg.id)
            }
        }
        if (addedIds.length === 0) return

        addedIds.sort((a, b) => a - b)
        const newIds = mergeSorted(addedIds, sortedIds)

        set({
            messageMap: newMap,
            sortedIds: newIds,
            firstItemIndex: firstItemIndex - addedIds.length,
        })
    },

    appendMessages: (messages) => {
        const { messageMap, sortedIds } = get()

        const newMap = new Map(messageMap)
        const addedIds: number[] = []
        for (const msg of messages) {
            if (msg.id != null && !newMap.has(msg.id)) {
                newMap.set(msg.id, msg)
                addedIds.push(msg.id)
            }
        }
        if (addedIds.length === 0) return

        addedIds.sort((a, b) => a - b)
        const newIds = mergeSorted(addedIds, sortedIds)

        set({
            messageMap: newMap,
            sortedIds: newIds,
        })
    },

    addMessage: (msg) => {
        if (msg.id == null) return

        const { messageMap, sortedIds } = get()
        if (messageMap.has(msg.id)) return

        const newMap = new Map(messageMap)
        newMap.set(msg.id, msg)

        // 常见路径：新 id 比现有所有都大 → 直接 push，O(1)
        // 罕见路径：服务器补发历史 → 走排序
        const lastId = sortedIds[sortedIds.length - 1]
        const newIds = (lastId === undefined || msg.id > lastId)
            ? [...sortedIds, msg.id]
            : mergeSorted([msg.id], sortedIds)

        set({
            messageMap: newMap,
            sortedIds: newIds,
        })
    },

    updateMessage: (id, patch) => {
        const { messageMap } = get()
        const existing = messageMap.get(id)
        if (!existing) return

        const newMap = new Map(messageMap)
        newMap.set(id, { ...existing, ...patch })
        set({ messageMap: newMap })
    },

    clear: () => {
        set({
            highlightRequest: null,
            messageMap: new Map(),
            sortedIds: [],
            firstItemIndex: INITIAL_FIRST_ITEM_INDEX,
        })
    },

    scrollToSeqRequest: null,
    requestScrollToSeq: (seq) => set({ scrollToSeqRequest: seq }),
    clearScrollToSeqRequest: () => set({ scrollToSeqRequest: null }),
}))
