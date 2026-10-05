import LingCatClient, { OAuthApi, UserApi } from 'lingcat-client-protocol'
import ClientManager from './ClientManager.ts'

const default_server = location.protocol + '//' + location.host + location.pathname
const MSG_KEY = 'lingcat.oauth_msg'

function clearHash() {
    history.replaceState(null, '', location.pathname + location.search)
}

/**
 * 处理 OIDC 回调后的 URL hash:
 *  - #oauth_ticket=...  -> 换 access_token, 建立会话并刷新
 *  - #oauth_bound=1     -> 提示绑定成功
 *  - #oauth_error=...   -> 提示错误
 */
export async function handleOAuthRedirect() {
    const hash = location.hash
    if (!hash.includes('oauth_')) return

    const bound = /oauth_bound=1/.test(hash)
    const err = /[#&]oauth_error=([^&]+)/.exec(hash)
    const tk = /[#&]oauth_ticket=([^&]+)/.exec(hash)

    if (err) {
        clearHash()
        sessionStorage.setItem(MSG_KEY, 'OIDC 失败: ' + decodeURIComponent(err[1]))
        return
    }
    if (bound) {
        clearHash()
        sessionStorage.setItem(MSG_KEY, '已绑定 Pocket ID')
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
        sessionStorage.setItem(MSG_KEY, 'OIDC 登录失败: ' + (e?.message || String(e)))
        location.reload()
    }
}

/** 取出并清空一次性的 OIDC 提示信息 (用于渲染后弹 Snackbar) */
export function takeOAuthMessage() {
    const m = sessionStorage.getItem(MSG_KEY)
    if (m) sessionStorage.removeItem(MSG_KEY)
    return m
}
