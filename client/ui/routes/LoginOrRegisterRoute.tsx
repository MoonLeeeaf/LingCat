import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { RootRoute } from './RootRoute.tsx'
import { useState } from 'react'
import { AuthMode, LoginOrRegisterForm, LoginValues, RegisterValues } from '../main/LoginOrRegisterForm.tsx'
import { DialogForRouter } from '../DialogForRouter.tsx'
import SessionEnv from '../../SessionEnv.ts'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'
import { acceptServerPublicKey, checkServer } from '../../lib/trustServer.ts'
import ClientManager from '../../ClientManager.ts'
import { getCurrentServerAddr, toHttpUrl, toWsUrl } from '../../lib/serverAddress.ts'
import { TrustServerDialog, TrustServerDialogProps } from '../main/TrustServerDialog.tsx'
import ReactDOM from 'react-dom/client'
import LingCatClient, { UserApi } from 'lingcat-client-protocol'
import { bytesToHex } from 'lingcat-shared'

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

        root.render(
            <TrustServerDialog
                {...opts}
                onAccept={() => { cleanup(); resolve(true) }}
                onReject={() => { cleanup(); resolve(false) }}
            />,
        )
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

/**
 * 确保服务端公钥已信任。
 * @returns 规范化后的地址
 * @throws 用户拒绝时抛 '__cancel__'
 */
async function ensureTrusted(rawServer: string): Promise<{ addr: string, publicKeyHex: string }> {
    const check = await checkServer(rawServer)

    if (check.status === 'new') {
        const ok = await confirmTrust({
            mode: 'new',
            rawAddr: rawServer,
            publicKeyHex: check.publicKeyHex,
        })
        if (!ok) throw new Error('__cancel__')
        acceptServerPublicKey(check.addr, check.publicKeyHex)
    } else if (check.status === 'mismatch') {
        const old = ClientManager.getServerPublicKey(check.addr)
        const ok = await confirmTrust({
            mode: 'mismatch',
            rawAddr: rawServer,
            publicKeyHex: check.publicKeyHex,
            oldPublicKeyHex: old ? bytesToHex(old) : undefined,
        })
        if (!ok) throw new Error('__cancel__')
        acceptServerPublicKey(check.addr, check.publicKeyHex)
    }

    return { addr: check.addr, publicKeyHex: check.publicKeyHex }
}

/**
 * 建立临时连接 → 等握手完成 → 执行 fn → 断开。
 * fn 只会被调用一次（即使重连也不会重复）。
 */
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

// ============================================================
//                      页面
// ============================================================

function LoginPage() {
    const navigate = useNavigate()
    const search = LoginOrRegisterRoute.useSearch()
    const [mode, setMode] = useState<AuthMode>('login')
    const [loading, setLoading] = useState(false)

    /** 解析目标服务端地址（用户输入优先，否则用当前） */
    function resolveServer(raw: string): string {
        const s = raw.trim()
        if (s) return s
        const cur = getCurrentServerAddr()
        if (!cur) throw new Error('请填写服务端地址')
        return cur
    }

    /** 登录成功后的公共收尾 */
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

    async function handleLogin(values: LoginValues) {
        setLoading(true)
        try {
            const rawServer = resolveServer(values.server)

            // 1. 信任检查
            const { addr, publicKeyHex } = await ensureTrusted(rawServer)

            // 2. 临时连接：login → queryMyUserInfo
            const { token, me } = await withEphemeralClient(addr, publicKeyHex, async (client) => {
                const token = await UserApi.login(client, {
                    account: values.account,
                    password: values.password,
                })
                const me = await UserApi.queryMyUserInfo(client, {
                    access_token: token,
                })
                return { token, me }
            })

            // 3. 保存 session
            finishAuth(addr, token, me, values.account)

            // 4. 跳转
            showSnackbar({ message: '登录成功' })
            navigate({ to: search.redirect || '/' })
        } catch (e: any) {
            if (e?.message === '__cancel__') return
            tipError(e, '登录失败')
        } finally {
            setLoading(false)
        }
    }

    async function handleRegister(values: RegisterValues) {
        setLoading(true)
        try {
            const rawServer = resolveServer(values.server)
            const { addr, publicKeyHex } = await ensureTrusted(rawServer)

            const { token, me } = await withEphemeralClient(addr, publicKeyHex, async (client) => {
                // 注册
                await UserApi.register(client, {
                    password: values.password,
                    nickname: values.nickname,
                    username: values.username || undefined,
                })
                // 立刻用刚才的凭证登录
                const account = values.username || values.nickname
                const token = await UserApi.login(client, {
                    account,
                    password: values.password,
                })
                const me = await UserApi.queryMyUserInfo(client, { access_token: token })
                return { token, me }
            })

            finishAuth(addr, token, me, values.username || values.nickname)

            showSnackbar({ message: '注册成功' })
            navigate({ to: search.redirect || '/' })
        } catch (e: any) {
            if (e?.message === '__cancel__') return
            tipError(e, '注册失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <DialogForRouter open onCloseRequest={() => navigate({ to: '..' })}>
            <span slot="headline">{mode === 'login' ? '登录' : '注册'}</span>
            <LoginOrRegisterForm
                serverLabel={SessionEnv.isOutOfServer ? '服务端 HTTP 地址' : undefined}
                mode={mode}
                onModeChange={setMode}
                loading={loading}
                onLogin={handleLogin}
                onRegister={handleRegister}
                onOAuthLogin={(id) => {
                    location.href = '/oauth/' + encodeURIComponent(id) + '/login'
                }}
            />
        </DialogForRouter>
    )
}

export const LoginOrRegisterRoute = createRoute({
    getParentRoute: () => RootRoute,
    path: '/login',
    validateSearch: (s): { redirect?: string } => ({
        redirect: typeof s.redirect === 'string' ? s.redirect : undefined,
    }),
    beforeLoad: ({ search }) => {
        const s = ClientManager.getOrInitActiveSession()
        if (s) {
            throw redirect({ to: search.redirect || '/' })
        }
    },
    component: LoginPage,
})
