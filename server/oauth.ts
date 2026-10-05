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
import { config, type OAuth2ProviderConfig } from './config.ts'
import OAuthIdentity from './data/OAuthIdentity.ts'
import UserDataBase from './data/UserDataBase.ts'
import TokenManager from './api/TokenManager.ts'

const STATE_TTL_MS = 5 * 60 * 1000
const TICKET_TTL_MS = 2 * 60 * 1000

// provider 列表在模块加载时计算一次 (配置改动需重启服务端, 与 OIDC 发现缓存一致)
const PROVIDERS: OAuth2ProviderConfig[] = (config.oauth2 || []).filter((p) => p.enabled !== false && !!p.id)
{
    const ids = new Set<string>()
    for (const p of PROVIDERS) {
        if (ids.has(p.id)) console.warn('[OAuth] 重复的 provider id:', p.id)
        ids.add(p.id)
    }
}

export function enabledProviders(): OAuth2ProviderConfig[] {
    return PROVIDERS
}

function providerById(id: string): OAuth2ProviderConfig | undefined {
    return PROVIDERS.find((p) => p.id === id)
}

// OIDC 发现文档按 provider 缓存
const oidcConfigs = new Map<string, Promise<Configuration>>()
function getOidcConfig(p: OAuth2ProviderConfig): Promise<Configuration> {
    let c = oidcConfigs.get(p.id)
    if (!c) {
        c = discovery(new URL(p.issuer!), p.client_id!, p.client_secret || undefined)
        oidcConfigs.set(p.id, c)
    }
    return c
}

function baseUrl(req: any): string {
    const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim()
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || '')
    const base = (config.base_path || '').replace(/\/+$/, '')   // 子路径部署, 如 '/lingcat'
    return `${proto}://${host}${base}`
}
function redirectUriFor(p: OAuth2ProviderConfig, req: any): string {
    return p.redirect_uri || `${baseUrl(req)}/oauth/${p.id}/callback`
}

interface StateEntry {
    providerId: string
    nonce?: string
    codeVerifier?: string
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

/** 由 WS 的 Exchange_OAuth_Code 调用 */
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

interface Profile { subject: string, name?: string, email?: string }

async function resolveProfile(
    p: OAuth2ProviderConfig, req: any, redirectUri: string,
    code: string, entry: StateEntry, state: string,
): Promise<Profile> {
    if ((p.type || 'oidc') === 'oidc') {
        const oidc = await getOidcConfig(p)
        const currentUrl = new URL(redirectUri)
        for (const [k, v] of Object.entries(req.query)) currentUrl.searchParams.set(k, String(v))
        const tokenResponse = await authorizationCodeGrant(oidc, currentUrl, {
            expectedState: state,
            expectedNonce: entry.nonce,
            pkceCodeVerifier: entry.codeVerifier,
        })
        const claims: any = tokenResponse.claims()
        if (!claims?.sub) throw new Error('no sub in id_token')
        return {
            subject: String(claims.sub),
            name: claims.name || claims.preferred_username || undefined,
            email: claims.email || undefined,
        }
    }

    // 通用 OAuth2: 授权码换 token, 再取 userinfo
    if (!p.authorization_url || !p.token_url || !p.userinfo_url)
        throw new Error('oauth2 provider 缺少 authorization_url/token_url/userinfo_url')

    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: p.client_id || '',
    })
    const headers: Record<string, string> = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
    }
    if (p.client_secret) {
        if ((p.token_auth || 'post') === 'basic')
            headers['Authorization'] = 'Basic ' + Buffer.from(`${p.client_id}:${p.client_secret}`).toString('base64')
        else
            body.set('client_secret', p.client_secret)
    }
    if (entry.codeVerifier) body.set('code_verifier', entry.codeVerifier)

    const tokenResp = await fetch(p.token_url, { method: 'POST', headers, body })
    const tokenJson: any = await tokenResp.json().catch(() => ({}))
    if (!tokenResp.ok || tokenJson.error)
        throw new Error(tokenJson.error_description || tokenJson.error || 'token exchange failed')

    const uiResp = await fetch(p.userinfo_url, {
        headers: {
            'Authorization': 'Bearer ' + tokenJson.access_token,
            'Accept': 'application/json',
            'User-Agent': 'LingCat',
        },
    })
    const profile: any = await uiResp.json()
    const sub = profile[p.user_id_claim || 'id'] ?? profile.id ?? profile.sub
    if (sub == null) throw new Error('userinfo 缺少用户标识')
    return {
        subject: String(sub),
        name: profile[p.name_claim || 'name'] || profile.name || profile.login || profile.preferred_username || undefined,
        email: p.email_claim ? profile[p.email_claim] : (profile.email || undefined),
    }
}

export function registerOAuthRoutes(app: Express) {
    // 发起登录 / 绑定
    app.get('/oauth/:id/login', async (req, res) => {
        try {
            const p = providerById(req.params.id)
            if (!p) return res.status(404).send('unknown oauth provider')

            const mode: 'login' | 'bind' = req.query.mode === 'bind' ? 'bind' : 'login'
            let userId: string | undefined
            if (mode === 'bind') {
                const at = String(req.query.access_token || '')
                if (!at) return res.status(400).send('missing access_token')
                userId = (await TokenManager.verifyAccessToken(at)).user_id
            }

            const redirect_uri = redirectUriFor(p, req)
            const state = randomState()
            const entry: StateEntry = { providerId: p.id, mode, userId, expiresAt: Date.now() + STATE_TTL_MS }

            let authorizeUrl: URL
            if ((p.type || 'oidc') === 'oidc') {
                const oidc = await getOidcConfig(p)
                const nonce = randomNonce()
                entry.nonce = nonce
                let codeChallenge: string | undefined
                if (p.use_pkce !== false) {
                    entry.codeVerifier = randomPKCECodeVerifier()
                    codeChallenge = await calculatePKCECodeChallenge(entry.codeVerifier)
                }
                gc(); states.set(state, entry)
                authorizeUrl = buildAuthorizationUrl(oidc, {
                    redirect_uri,
                    scope: p.scopes || 'openid profile email',
                    response_type: 'code',
                    state,
                    nonce,
                    ...(codeChallenge ? { code_challenge: codeChallenge, code_challenge_method: 'S256' } : {}),
                })
            } else {
                if (!p.authorization_url) return res.status(500).send('provider missing authorization_url')
                let codeChallenge: string | undefined
                if (p.use_pkce) {
                    entry.codeVerifier = randomPKCECodeVerifier()
                    codeChallenge = await calculatePKCECodeChallenge(entry.codeVerifier)
                }
                gc(); states.set(state, entry)
                authorizeUrl = new URL(p.authorization_url)
                authorizeUrl.searchParams.set('client_id', p.client_id || '')
                authorizeUrl.searchParams.set('redirect_uri', redirect_uri)
                authorizeUrl.searchParams.set('response_type', 'code')
                authorizeUrl.searchParams.set('scope', p.scopes || '')
                authorizeUrl.searchParams.set('state', state)
                if (codeChallenge) {
                    authorizeUrl.searchParams.set('code_challenge', codeChallenge)
                    authorizeUrl.searchParams.set('code_challenge_method', 'S256')
                }
            }
            res.redirect(authorizeUrl.href)
        } catch (e) {
            console.error('[OAuth] /oauth/:id/login error', e)
            redirectError(res, 'login_failed')
        }
    })

    // 回调
    app.get('/oauth/:id/callback', async (req, res) => {
        try {
            const p = providerById(req.params.id)
            if (!p) return res.status(404).send('unknown oauth provider')
            if (req.query.error) return redirectError(res, String(req.query.error))

            const state = String(req.query.state || '')
            const entry = states.get(state)
            states.delete(state)
            if (!entry || entry.expiresAt < Date.now() || entry.providerId !== p.id)
                return redirectError(res, 'state_invalid')

            const profile = await resolveProfile(p, req, redirectUriFor(p, req), String(req.query.code || ''), entry, state)

            // 绑定
            if (entry.mode === 'bind') {
                if (!entry.userId) return redirectError(res, 'bind_no_user')
                const r = await OAuthIdentity.link(p.id, profile.subject, entry.userId)
                if (!r.ok) return redirectError(res, 'already_bound')
                return res.redirect('/#oauth_bound=' + encodeURIComponent(p.id))
            }

            // 登录
            let userId = await OAuthIdentity.getUserIdBySubject(p.id, profile.subject)
            if (!userId && p.auto_create_user) {
                const nickname = profile.name || ('user_' + profile.subject.slice(0, 8))
                userId = await UserDataBase.createUser({
                    nickname,
                    password: crypto.randomBytes(24).toString('hex'),
                })
                await OAuthIdentity.link(p.id, profile.subject, userId)
            }
            if (!userId) return redirectError(res, 'not_bound')

            const ticket = crypto.randomBytes(24).toString('hex')
            gc()
            tickets.set(ticket, { userId, expiresAt: Date.now() + TICKET_TTL_MS })
            return res.redirect('/#oauth_ticket=' + ticket)
        } catch (e) {
            console.error('[OAuth] /oauth/:id/callback error', e)
            redirectError(res, 'callback_failed')
        }
    })
}
