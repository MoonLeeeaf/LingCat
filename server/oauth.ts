import crypto from 'node:crypto'
import type { Express } from 'express'
import {
    discovery,
    buildAuthorizationUrl,
    authorizationCodeGrant,
    randomState,
    randomNonce,
    randomPKCECodeVerifier,
    calculatePKCECodeChallenge,
    type Configuration,
} from 'openid-client'
import { config } from './config.ts'
import OAuthIdentity from './data/OAuthIdentity.ts'
import UserDataBase from './data/UserDataBase.ts'
import TokenManager from './api/TokenManager.ts'

const PROVIDER = 'pocket-id'
const STATE_TTL_MS = 5 * 60 * 1000
const TICKET_TTL_MS = 2 * 60 * 1000

let oidcConfig: Configuration | undefined
let oidcConfigPromise: Promise<Configuration> | undefined

/** 懒加载 OIDC 发现文档并缓存 */
async function getOidcConfig(): Promise<Configuration> {
    if (oidcConfig) return oidcConfig
    if (!oidcConfigPromise) {
        oidcConfigPromise = discovery(
            new URL(config.oauth_issuer!),
            config.oauth_client_id!,
            config.oauth_client_secret!,
        ).then((c) => { oidcConfig = c; return c })
    }
    return oidcConfigPromise
}

interface StateEntry {
    nonce: string
    codeVerifier: string
    mode: 'login' | 'bind'
    userId?: string
    expiresAt: number
}
interface TicketEntry { userId: string, expiresAt: number }

const states = new Map<string, StateEntry>()
const tickets = new Map<string, TicketEntry>()

function gc() {
    const now = Date.now()
    for (const [k, v] of states) if (v.expiresAt < now) states.delete(k)
    for (const [k, v] of tickets) if (v.expiresAt < now) tickets.delete(k)
}

/** 由 WS 的 Exchange_OAuth_Code 调用: 消费一次性票据, 返回 user_id */
export function consumeOAuthTicket(ticket: string): string | undefined {
    gc()
    const entry = tickets.get(ticket)
    if (!entry) return undefined
    tickets.delete(ticket)
    if (entry.expiresAt < Date.now()) return undefined
    return entry.userId
}

function redirectError(res: any, code: string) {
    res.redirect('/#oauth_error=' + encodeURIComponent(code))
}

export function registerOAuthRoutes(app: Express) {
    // 发起登录 / 绑定
    app.get('/oauth/login', async (req, res) => {
        try {
            if (!config.oauth_enabled)
                return res.status(404).send('OAuth is disabled')

            const mode: 'login' | 'bind' = req.query.mode === 'bind' ? 'bind' : 'login'
            let userId: string | undefined
            if (mode === 'bind') {
                const at = String(req.query.access_token || '')
                if (!at) return res.status(400).send('missing access_token')
                userId = (await TokenManager.verifyAccessToken(at)).user_id
            }

            const oidc = await getOidcConfig()
            const state = randomState()
            const nonce = randomNonce()
            const codeVerifier = randomPKCECodeVerifier()
            const codeChallenge = await calculatePKCECodeChallenge(codeVerifier)

            gc()
            states.set(state, { nonce, codeVerifier, mode, userId, expiresAt: Date.now() + STATE_TTL_MS })

            const url = buildAuthorizationUrl(oidc, {
                redirect_uri: config.oauth_redirect_uri!,
                scope: 'openid profile email',
                response_type: 'code',
                state,
                nonce,
                code_challenge: codeChallenge,
                code_challenge_method: 'S256',
            })
            res.redirect(url.href)
        } catch (e) {
            console.error('[OAuth] /oauth/login error', e)
            redirectError(res, 'login_failed')
        }
    })

    // OIDC 回调
    app.get('/oauth/callback', async (req, res) => {
        try {
            if (!config.oauth_enabled)
                return res.status(404).send('OAuth is disabled')

            if (req.query.error)
                return redirectError(res, String(req.query.error))

            const state = String(req.query.state || '')
            const entry = states.get(state)
            states.delete(state)
            if (!entry || entry.expiresAt < Date.now())
                return redirectError(res, 'state_invalid')

            const oidc = await getOidcConfig()
            const currentUrl = new URL(config.oauth_redirect_uri!)
            for (const [k, v] of Object.entries(req.query))
                currentUrl.searchParams.set(k, String(v))

            const tokenResponse = await authorizationCodeGrant(oidc, currentUrl, {
                expectedState: state,
                expectedNonce: entry.nonce,
                pkceCodeVerifier: entry.codeVerifier,
            })
            const claims: any = tokenResponse.claims()
            const sub: string | undefined = claims?.sub
            if (!sub) return redirectError(res, 'no_subject')

            // 绑定
            if (entry.mode === 'bind') {
                if (!entry.userId) return redirectError(res, 'bind_no_user')
                await OAuthIdentity.link(PROVIDER, sub, entry.userId)
                return res.redirect('/#oauth_bound=1')
            }

            // 登录
            let userId = await OAuthIdentity.getUserIdBySubject(PROVIDER, sub)
            if (!userId && config.oauth_auto_create_user) {
                const nickname = claims?.name || claims?.preferred_username || ('user_' + sub.slice(0, 8))
                userId = await UserDataBase.createUser({
                    nickname,
                    password: crypto.randomBytes(24).toString('hex'),
                })
                await OAuthIdentity.link(PROVIDER, sub, userId)
            }
            if (!userId) return redirectError(res, 'not_bound')

            const ticket = crypto.randomBytes(24).toString('hex')
            gc()
            tickets.set(ticket, { userId, expiresAt: Date.now() + TICKET_TTL_MS })
            return res.redirect('/#oauth_ticket=' + ticket)
        } catch (e) {
            console.error('[OAuth] /oauth/callback error', e)
            redirectError(res, 'callback_failed')
        }
    })
}
