import LingCatClient, { OAuthApi, UserApi } from 'lingcat-client-protocol'
import ClientManager from './ClientManager.ts'
import ClientConfigInstance from './ClientConfig.ts'

const default_server = location.protocol + '//' + location.host + location.pathname
const MSG_KEY = 'lingcat.oauth_msg'

const ERROR_MESSAGES: Record<string, string> = {
    state_invalid: '登录状态已失效，请重试',
    login_failed: '发起登录失败',
    callback_failed: '登录回调失败',
    no_subject: '未获取到用户标识',
    not_bound: '该账号尚未绑定，请先用密码登录并在「我的资料」里绑定',
    already_bound: '该 OAuth 账号已绑定到其他用户',
    bind_no_user: '绑定失败：登录状态丢失',
}

function clearHash() {
    history.replaceState(null, '', location.pathname + location.search)
}

function providerName(id: string) {
    return ClientConfigInstance.oauthProviders.find((p) => p.id === id)?.display_name || id
}

/**
 * 处理 OAuth2/OIDC 回调后的 URL hash:
 *  - #oauth_ticket=...     -> 换 access_token, 建立会话并刷新
 *  - #oauth_bound=<id>     -> 提示绑定成功
 *  - #oauth_error=<code>   -> 提示错误
 */
export async function handleOAuthRedirect() {
    const hash = location.hash
    if (!hash.includes('oauth_')) return

    const bound = /[#&]oauth_bound=([^&]+)/.exec(hash)
    const err = /[#&]oauth_error=([^&]+)/.exec(hash)
    const tk = /[#&]oauth_ticket=([^&]+)/.exec(hash)

    if (err) {
        clearHash()
        const code = decodeURIComponent(err[1])
        sessionStorage.setItem(MSG_KEY, 'OAuth 登录失败：' + (ERROR_MESSAGES[code] || code))
        return
    }
    if (bound) {
        clearHash()
        sessionStorage.setItem(MSG_KEY, '已绑定 ' + providerName(decodeURIComponent(bound[1])))
        return
    }
    if (!tk) return

    const ticket = decodeURIComponent(tk[1])
    clearHash()

    const client = new LingCatClient({
        server_ws: default_server,
        server_http: default_server,
        server_public_key: ClientManager.getServerPublicKey('内置'),
    })

    try {
        await new Promise<void>((resolve, reject) => {
            client.onInit = () => resolve()
            client.init()
            setTimeout(() => reject(new Error('连接服务端超时')), 15000)
        })
        const access_token = await OAuthApi.exchangeOAuthCode(client, { ticket })
        const me = await UserApi.queryMyUserInfo(client, { access_token })
        const name = me.username || me.id
        ClientManager.setUserSession(name, access_token, '')
        ClientManager.setActiveUserSessionName(name)
        client.disconnect()
        location.reload()
    } catch (e: any) {
        client.disconnect()
        sessionStorage.setItem(MSG_KEY, 'OAuth 登录失败：' + (e?.message || String(e)))
        location.reload()
    }
}

/** 取出并清空一次性的 OAuth 提示信息 (用于渲染后弹 Snackbar) */
export function takeOAuthMessage() {
    const m = sessionStorage.getItem(MSG_KEY)
    if (m) sessionStorage.removeItem(MSG_KEY)
    return m
}
