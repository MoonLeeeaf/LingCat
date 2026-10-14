import LingCatClient, { UserApi } from 'lingcat-client-protocol'
import {
    normalizeServerAddress, toHttpUrl, toWsUrl,
} from './lib/serverAddress.ts'
import {
    loadStore, saveStore, subscribeStore,
    getActiveSessionKey, setActiveSessionKey,
    upsertSession, removeSession, listSessions, getSession,
    upsertPublicKey, removePublicKey,
    StoreData,
    LocalSession,
} from './lib/ClientStorage.ts'
import { IClientConfig } from './ClientConfig.ts'
import { bytesToHex, hexToBytes } from 'lingcat-shared'
import { IUser } from '../protocol/classes-interfaces.ts'


export type ServerTrustStatus = 'trusted' | 'new' | 'mismatch'

const PLATFORM = 'web' as const

function randomHex(bytes: number): string {
    const arr = new Uint8Array(bytes)
    crypto.getRandomValues(arr)
    return Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('')
}

class ClientManagerImpl {
    private meCache: IUser | null = null
    private mePromise: Promise<IUser> | null = null

    async getMe(){
        if (this.meCache) return this.meCache
        if (this.mePromise) return this.mePromise

        const client = this.getActiveClient()
        const session = this.getActiveSession()
        if (!client || !session) throw new Error('no active client/session')

        this.mePromise = UserApi.queryMyUserInfo(client, { access_token: session.token })
            .then((me) => {
                this.meCache = me
                this.mePromise = null
                return me
            })
            .catch((e) => {
                this.mePromise = null
                throw e
            })

        return this.mePromise
    }

    clearMe(): void {
        this.meCache = null
        this.mePromise = null
    }
    private data: StoreData = loadStore()
    private changeListeners = new Set<() => void>()

    /** 当前活跃连接（运行时，不持久化） */
    private activeClient: LingCatClient | null = null
    /** 当前连接的 connectionSessionId（每次 createClient 生成一次） */
    private connectionSessionId: string | null = null

    constructor() {
        subscribeStore((next: any) => {
            this.data = next
            this.emitChange()
        })
    }

    // ============================================================
    //                      内部工具
    // ============================================================

    private commit(next: StoreData) {
        this.data = next
        saveStore(next)
        this.emitChange()
    }

    private emitChange() {
        for (const cb of this.changeListeners) {
            try { cb() } catch { /* ignore */ }
        }
    }

    subscribe(cb: () => void): () => void {
        this.changeListeners.add(cb)
        return () => { this.changeListeners.delete(cb) }
    }

    /**
     * 从服务端 /config.json 拉取配置。
     * @param addr 规范化后的 host:port[/path]，如 "example.com:443/lingcat"
     */
    async fetchServerConfig(addr: string): Promise<IClientConfig> {
        const url = toHttpUrl(addr).replace(/\/$/, '') + '/config.json'
        const r = await fetch(url, { method: 'GET' })   // GET，因为要读 body
        if (!r.ok) throw new Error(`config.json 返回 ${r.status}`)
        return await r.json()
    }

    /**
     * 判断本地是否已信任该服务端的公钥。
     * - 不修改本地状态，只做判定
     */
    checkServerTrust(addr: string, serverKeyHex: string): ServerTrustStatus {
        const local = this.data.serverPublicKeys[addr]
        if (!local) return 'new'
        return local.toLowerCase() === serverKeyHex.toLowerCase() ? 'trusted' : 'mismatch'
    }

    /**
     * 用户确认后，信任并保存公钥。
     * 会覆盖已有的（mismatch 场景下用户选择"接受新公钥"时也用它）。
     */
    trustServer(addr: string, publicKeyHex: string): void {
        this.commit(upsertPublicKey(this.data, addr, publicKeyHex.toLowerCase()))
    }

    // ============================================================
    //                      会话（账号）
    // ============================================================

    /**
     * 获取当前 tab 应使用的 session：
     * 1. sessionStorage 有 key 且对应 session 存在 → 用它
     * 2. 否则从所有 session 里挑最近使用的 → 写入 sessionStorage 并返回
     * 3. 一个都没有 → null
     */
    getOrInitActiveSession(): LocalSession | null {
        const key = getActiveSessionKey()
        if (key) {
            const s = getSession(this.data, key)
            if (s) return s
        }
        const all = listSessions(this.data)
        if (all.length === 0) return null
        const latest = all[0]
        setActiveSessionKey(latest.key)
        return latest
    }

    listUserSessions(): LocalSession[] {
        return listSessions(this.data)
    }

    getSessionByKey(key: string): LocalSession | null {
        return getSession(this.data, key)
    }

    getActiveSession(): LocalSession | null {
        const key = getActiveSessionKey()
        if (!key) return null
        return getSession(this.data, key)
    }

    getActiveUserSessionName(): string {
        return getActiveSessionKey() ?? ''
    }

    setUserSession(params: {
        server: string
        userId: string
        account: string
        nickname: string
        token: string
    }): LocalSession {
        const server = normalizeServerAddress(params.server)
        const session: LocalSession = {
            key: `${server}::${params.userId}`,
            server,
            userId: params.userId,
            account: params.account,
            nickname: params.nickname,
            token: params.token,
            lastUsedAt: Date.now(),
        }
        this.commit(upsertSession(this.data, session))
        return session
    }

    setActiveUserSessionKey(key: string | null): void {
        setActiveSessionKey(key)
        if (key) {
            const s = getSession(this.data, key)
            if (s) this.commit(upsertSession(this.data, { ...s, lastUsedAt: Date.now() }))
        } else {
            this.emitChange()
        }
        this.clearMe()
    }

    removeUserSession(key: string): void {
        this.commit(removeSession(this.data, key))
        if (getActiveSessionKey() === key) setActiveSessionKey(null)
    }

    updateSessionDisplayInfo(key: string, account: string, nickname: string): void {
        const s = getSession(this.data, key)
        if (!s) return
        this.commit(upsertSession(this.data, { ...s, account, nickname }))
    }

    // ============================================================
    //                      服务端公钥
    // ============================================================

    listServerPublicKeys(): string[] {
        return Object.keys(this.data.serverPublicKeys)
    }

    getServerPublicKey(hostOrRaw: string): Uint8Array | null {
        let addr: string
        try { addr = normalizeServerAddress(hostOrRaw) }
        catch { return null }

        const hex = this.data.serverPublicKeys[addr]
        if (!hex) return null
        return hexToBytes(hex)
    }

    setServerPublicKey(hostOrRaw: string, key: Uint8Array): void {
        const addr = normalizeServerAddress(hostOrRaw)
        this.commit(upsertPublicKey(this.data, addr, bytesToHex(key)))
    }

    removeServerPublicKey(hostOrRaw: string): void {
        let addr: string
        try { addr = normalizeServerAddress(hostOrRaw) }
        catch { return }
        this.commit(removePublicKey(this.data, addr))
    }

    // ============================================================
    //                      当前连接
    // ============================================================

    getActiveClient(): LingCatClient | null {
        return this.activeClient
    }

    /**
     * 获取当前连接的 connectionSessionId。
     * 调用方在 authorize 时需要把此值传给服务端。
     */
    getConnectionSessionId(): string | null {
        return this.connectionSessionId
    }

    /**
     * 创建未连接的 LingCatClient 实例。
     * 若未设置过该服务的公钥会抛错——调用方应先做 TOFU 确认。
     */
    createClient(server: string): LingCatClient {
        const addr = normalizeServerAddress(server)
        const publicKey = this.getServerPublicKey(addr)
        if (!publicKey) throw new Error(`Server public key not set for ${addr}`)

        // ★ 每次创建新连接都生成新 sessionId
        this.connectionSessionId = `${PLATFORM}-${randomHex(4)}`

        const client = new LingCatClient({
            server_ws: toWsUrl(addr),
            server_http: toHttpUrl(addr),
            server_public_key: publicKey,
        })
        this.activeClient = client
        return client
    }

    disconnect(): void {
        try { this.activeClient?.disconnect() } catch { /* ignore */ }
        this.clearMe()
        this.activeClient = null
        this.connectionSessionId = null
        this.emitChange()
    }
}

export const ClientManager = new ClientManagerImpl()
export default ClientManager