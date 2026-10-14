import React from 'react'
import LingCatClient, { UserApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import { acceptServerPublicKey, checkServer } from '../../lib/trustServer.ts'
import { getCurrentServerAddr, toHttpUrl, toWsUrl } from '../../lib/serverAddress.ts'
import tipError from '../tipError.ts'
import { bytesToHex } from 'lingcat-shared'
import type { TrustServerDialogProps } from './TrustServerDialog.tsx'
import { TrustServerDialog } from './TrustServerDialog.tsx'
import ReactDOM from 'react-dom/client'
import type { LoginValues, RegisterValues } from './LoginOrRegisterForm.tsx'

// ============================================================
//                      工具函数
// ============================================================

function confirmTrust(
    opts: Omit<TrustServerDialogProps, 'onAccept' | 'onReject'>,
): Promise<boolean> {
    return new Promise((resolve) => {
        const container = document.createElement('div')
        document.body.appendChild(container)
        const root = ReactDOM.createRoot(container)
        const cleanup = () => { root.unmount(); container.remove() }
        root.render(<TrustServerDialog
            {...opts}
            onAccept={() => { cleanup(); resolve(true) }}
            onReject={() => { cleanup(); resolve(false) }}
        />)
    })
}

function hexToBytes(hex: string): Uint8Array {
    const clean = hex.startsWith('0x') ? hex.slice(2) : hex
    const out = new Uint8Array(clean.length / 2)
    for (let i = 0; i < out.length; i++) {
        out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16)
    }
    return out
}

async function ensureTrusted(rawServer: string): Promise<{ addr: string, publicKeyHex: string }> {
    const check = await checkServer(rawServer)
    if (check.status === 'new') {
        const ok = await confirmTrust({
            mode: 'new', rawAddr: rawServer, publicKeyHex: check.publicKeyHex,
        })
        if (!ok) throw new Error('__cancel__')
        acceptServerPublicKey(check.addr, check.publicKeyHex)
    } else if (check.status === 'mismatch') {
        const old = ClientManager.getServerPublicKey(check.addr)
        const ok = await confirmTrust({
            mode: 'mismatch', rawAddr: rawServer, publicKeyHex: check.publicKeyHex,
            oldPublicKeyHex: old ? bytesToHex(old) : undefined,
        })
        if (!ok) throw new Error('__cancel__')
        acceptServerPublicKey(check.addr, check.publicKeyHex)
    }
    return { addr: check.addr, publicKeyHex: check.publicKeyHex }
}

async function withEphemeralClient<T>(
    addr: string,
    publicKeyHex: string,
    fn: (client: LingCatClient) => Promise<T>,
): Promise<T> {
    const client = new LingCatClient({
        server_ws: toWsUrl(addr),
        server_http: toHttpUrl(addr),
        server_public_key: hexToBytes(publicKeyHex),
    })
    return await new Promise<T>((resolve, reject) => {
        let done = false
        client.onInit = async () => {
            if (done) return
            done = true
            try {
                const result = await fn(client)
                try { client.disconnect() } catch { /* ignore */ }
                resolve(result)
            } catch (e) {
                try { client.disconnect() } catch { /* ignore */ }
                reject(e)
            }
        }
        client.init()
    })
}

function resolveServer(raw: string): string {
    const s = raw.trim()
    if (s) return s
    const cur = getCurrentServerAddr()
    if (!cur) throw new Error('请填写服务端地址')
    return cur
}

function finishAuth(
    addr: string,
    token: string,
    me: { id: string, username?: string | null, nickname?: string | null },
    fallbackAccount: string,
) {
    const session = ClientManager.setUserSession({
        server: addr,
        userId: me.id,
        account: me.username || fallbackAccount,
        nickname: me.nickname || fallbackAccount,
        token,
    })
    ClientManager.setActiveUserSessionKey(session.key)
}

// ============================================================
//                      Hook
// ============================================================

export interface AuthFlowResult {
    ok: boolean
    cancelled?: boolean
}

export function useAuthFlow() {
    const [loading, setLoading] = React.useState(false)

    const doLogin = React.useCallback(async (values: LoginValues): Promise<AuthFlowResult> => {
        setLoading(true)
        try {
            const rawServer = resolveServer(values.server)
            const { addr, publicKeyHex } = await ensureTrusted(rawServer)

            const { token, me } = await withEphemeralClient(addr, publicKeyHex, async (client) => {
                const token = await UserApi.login(client, {
                    account: values.account,
                    password: values.password,
                })
                const me = await UserApi.queryMyUserInfo(client, { access_token: token })
                return { token, me }
            })

            finishAuth(addr, token, me, values.account)
            return { ok: true }
        } catch (e: any) {
            if (e?.message === '__cancel__') return { ok: false, cancelled: true }
            tipError(e, '登录失败')
            return { ok: false }
        } finally {
            setLoading(false)
        }
    }, [])

    const doRegister = React.useCallback(async (values: RegisterValues): Promise<AuthFlowResult> => {
        setLoading(true)
        try {
            const rawServer = resolveServer(values.server)
            const { addr, publicKeyHex } = await ensureTrusted(rawServer)

            const { token, me } = await withEphemeralClient(addr, publicKeyHex, async (client) => {
                await UserApi.register(client, {
                    password: values.password,
                    nickname: values.nickname,
                    username: values.username || undefined,
                })
                const account = values.username || values.nickname
                const token = await UserApi.login(client, { account, password: values.password })
                const me = await UserApi.queryMyUserInfo(client, { access_token: token })
                return { token, me }
            })

            finishAuth(addr, token, me, values.username || values.nickname)
            return { ok: true }
        } catch (e: any) {
            if (e?.message === '__cancel__') return { ok: false, cancelled: true }
            tipError(e, '注册失败')
            return { ok: false }
        } finally {
            setLoading(false)
        }
    }, [])

    return { loading, doLogin, doRegister }
}