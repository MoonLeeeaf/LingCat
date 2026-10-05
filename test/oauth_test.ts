import WS from 'ws'
;(globalThis as any).WebSocket = (WS as any).WebSocket ?? WS

import fs from 'node:fs'
import LingCatClient, { UserApi, OAuthApi } from 'lingcat-client-protocol'

const publicKey = fs.readFileSync('./lingcat_data/key/public')
function mk() {
    const c = new LingCatClient({ server_ws: 'ws://localhost:3601', server_http: 'http://localhost:3601', server_public_key: publicKey })
    const r = new Promise<void>((res) => { c.onInit = () => res() })
    c.init()
    return { c, r }
}
async function main() {
    const ts = Date.now()
    const acc = 'oauth' + ts
    const A = mk(); await A.r
    await UserApi.register(A.c, { password: 'pw', nickname: 'O' + ts, username: acc })
    const tok = await UserApi.login(A.c, { account: acc, password: 'pw' })
    await UserApi.authorize(A.c, { access_token: tok, session_id: 's' + ts })

    const b = await OAuthApi.getOAuthBindings(A.c, { access_token: tok })
    console.log('[ok] getOAuthBindings ->', JSON.stringify(b))
    await OAuthApi.unbindOAuth(A.c, { access_token: tok, provider: 'pocket-id' })
    console.log('[ok] unbindOAuth 成功')
    console.log('OK')
    process.exit(0)
}
main().catch((e) => { console.error('FAIL', e); process.exit(1) })
