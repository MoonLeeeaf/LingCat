import SessionEnv from '../SessionEnv.ts'
import IndexedDBStore from './IndexedDBStore.ts'

/**
 * 本地对话背景存储
 * - 不上传服务器, 仅保存在当前浏览器
 * - key = `${userId}::${chatId}`, 不同账号互不影响
 */

const store = new IndexedDBStore<Blob>('lingcat-local', 'chat_backgrounds')

function keyFor(chatId: string): string {
    return `${SessionEnv.myUserId}::${chatId}`
}

export async function getChatBackground(chatId: string): Promise<Blob | null> {
    const value = await store.get(keyFor(chatId))
    return value instanceof Blob ? value : null
}

export async function setChatBackground(chatId: string, blob: Blob): Promise<void> {
    await store.set(keyFor(chatId), blob)
}

export async function deleteChatBackground(chatId: string): Promise<void> {
    await store.delete(keyFor(chatId))
}

// ============================================================
//                     变更通知 (同一标签页内)
// ============================================================

type Listener = () => void
const listeners = new Map<string, Set<Listener>>()

export function subscribeChatBackground(chatId: string, cb: Listener): () => void {
    let set = listeners.get(chatId)
    if (!set) {
        set = new Set()
        listeners.set(chatId, set)
    }
    set.add(cb)
    return () => {
        set!.delete(cb)
        if (set!.size === 0) listeners.delete(chatId)
    }
}

export function emitChatBackgroundChange(chatId: string) {
    const set = listeners.get(chatId)
    if (!set) return
    for (const cb of set) {
        try { cb() } catch { /* ignore */ }
    }
}
