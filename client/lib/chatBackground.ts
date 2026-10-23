import SessionEnv from '../SessionEnv.ts'

/**
 * 本地对话背景存储 (IndexedDB)
 * - 不上传服务器, 仅保存在当前浏览器
 * - key = `${userId}::${chatId}`, 不同账号互不影响
 */

const DB_NAME = 'lingcat-local'
const DB_VERSION = 1
const STORE = 'chat_backgrounds'

let dbPromise: Promise<IDBDatabase> | null = null

function openDb(): Promise<IDBDatabase> {
    if (dbPromise) return dbPromise
    dbPromise = new Promise((resolve, reject) => {
        if (typeof indexedDB === 'undefined') {
            reject(new Error('IndexedDB 不可用'))
            return
        }
        const req = indexedDB.open(DB_NAME, DB_VERSION)
        req.onupgradeneeded = () => {
            const db = req.result
            if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE)
        }
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
    return dbPromise
}

function keyFor(chatId: string): string {
    return `${SessionEnv.myUserId}::${chatId}`
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result)
        req.onerror = () => reject(req.error)
    })
}

export async function getChatBackground(chatId: string): Promise<Blob | null> {
    const db = await openDb()
    const tx = db.transaction(STORE, 'readonly')
    const result = await requestToPromise(tx.objectStore(STORE).get(keyFor(chatId)) as IDBRequest<unknown>)
    return result instanceof Blob ? result : null
}

export async function setChatBackground(chatId: string, blob: Blob): Promise<void> {
    const db = await openDb()
    const tx = db.transaction(STORE, 'readwrite')
    await requestToPromise(tx.objectStore(STORE).put(blob, keyFor(chatId)) as IDBRequest<unknown>)
}

export async function deleteChatBackground(chatId: string): Promise<void> {
    const db = await openDb()
    const tx = db.transaction(STORE, 'readwrite')
    await requestToPromise(tx.objectStore(STORE).delete(keyFor(chatId)) as IDBRequest<unknown>)
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
