export interface LocalSession {
    /** 唯一 key：`${server}::${userId}` */
    key: string
    /** 规范化的 host:port */
    server: string
    /** 服务端返回的用户 ID（永不变） */
    userId: string
    /** 用户名（可改，仅显示） */
    account: string
    /** 昵称（可改，仅显示） */
    nickname: string
    /** access_token */
    token: string
    /** 上次使用时间戳，用于排序 */
    lastUsedAt: number
}

export interface StoreData {
    version: 1
    sessions: Record<string, LocalSession>
    /** host:port → hex 字符串 */
    serverPublicKeys: Record<string, string>
}

export const EMPTY_STORE: StoreData = {
    version: 1,
    sessions: {},
    serverPublicKeys: {},
}

const STORE_KEY = 'lingcat.store'
const ACTIVE_KEY = 'lingcat.activeSessionKey'
const CURRENT_VERSION = 1

// ============================================================
//                       读 / 写 / 迁移
// ============================================================

function migrate(raw: any): StoreData {
    const v: number = raw?.version ?? 0

    // v0 是历史版本，格式未知 → 直接初始化
    // 未来加新版本时，在这里逐级升级
    if (v === 0) {
        return { ...EMPTY_STORE }
    }

    return {
        version: CURRENT_VERSION,
        sessions: raw.sessions ?? {},
        serverPublicKeys: raw.serverPublicKeys ?? {},
    }
}

export function loadStore(): StoreData {
    try {
        const raw = localStorage.getItem(STORE_KEY)
        if (!raw) return { ...EMPTY_STORE }
        return migrate(JSON.parse(raw))
    } catch (e) {
        console.warn('[clientStore] load failed, resetting', e)
        return { ...EMPTY_STORE }
    }
}

export function saveStore(data: StoreData): void {
    try {
        localStorage.setItem(STORE_KEY, JSON.stringify(data))
    } catch (e) {
        console.error('[clientStore] save failed', e)
    }
}

/**
 * 监听其他 tab 对 store 的修改。
 * 注意：本 tab 自己的修改不会触发（浏览器设计如此）。
 */
export function subscribeStore(cb: (data: StoreData) => void): () => void {
    const handler = (e: StorageEvent) => {
        if (e.key !== STORE_KEY) return
        if (e.newValue == null) {
            cb({ ...EMPTY_STORE })
            return
        }
        try {
            cb(migrate(JSON.parse(e.newValue)))
        } catch { /* ignore */ }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
}

// ============================================================
//                       active session (sessionStorage)
//                       —— 每个 tab 独立
// ============================================================

export function getActiveSessionKey(): string | null {
    try {
        return sessionStorage.getItem(ACTIVE_KEY)
    } catch {
        return null
    }
}

export function setActiveSessionKey(key: string | null): void {
    try {
        if (key == null) sessionStorage.removeItem(ACTIVE_KEY)
        else sessionStorage.setItem(ACTIVE_KEY, key)
    } catch { /* ignore */ }
}

// ============================================================
//                       会话操作（纯函数）
// ============================================================

export function upsertSession(data: StoreData, session: LocalSession): StoreData {
    return {
        ...data,
        sessions: { ...data.sessions, [session.key]: session },
    }
}

export function removeSession(data: StoreData, key: string): StoreData {
    if (!data.sessions[key]) return data
    const next = { ...data.sessions }
    delete next[key]
    return { ...data, sessions: next }
}

export function listSessions(data: StoreData): LocalSession[] {
    return Object.values(data.sessions).sort((a, b) => b.lastUsedAt - a.lastUsedAt)
}

export function getSession(data: StoreData, key: string): LocalSession | null {
    return data.sessions[key] ?? null
}

// ============================================================
//                       公钥操作（纯函数）
// ============================================================

export function upsertPublicKey(data: StoreData, host: string, hex: string): StoreData {
    return {
        ...data,
        serverPublicKeys: { ...data.serverPublicKeys, [host]: hex },
    }
}

export function removePublicKey(data: StoreData, host: string): StoreData {
    if (!data.serverPublicKeys[host]) return data
    const next = { ...data.serverPublicKeys }
    delete next[host]
    return { ...data, serverPublicKeys: next }
}