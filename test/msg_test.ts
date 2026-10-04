import WS from 'ws'
;(globalThis as any).WebSocket = (WS as any).WebSocket ?? WS

import fs from 'node:fs'
import LingCatClient, { UserApi, ChatApi } from 'lingcat-client-protocol'

const publicKey = fs.readFileSync('./lingcat_data/key/public')

function mk() {
    const c = new LingCatClient({ server_ws: 'ws://localhost:3601', server_http: 'http://localhost:3601', server_public_key: publicKey })
    const r = new Promise<void>((res) => { c.onInit = () => res() })
    c.init()
    return { c, r }
}

async function main() {
    const ts = Date.now()
    const acc = 'msg' + ts
    const A = mk(); await A.r
    await UserApi.register(A.c, { password: 'pw', nickname: 'Msg' + ts, username: acc })
    const tok = await UserApi.login(A.c, { account: acc, password: 'pw' })
    await UserApi.authorize(A.c, { access_token: tok, session_id: 's1' + ts })
    const chat = await ChatApi.createGroup(A.c, { access_token: tok, title: 'MsgTest' + ts })

    for (let i = 1; i <= 3; i++)
        await ChatApi.sendChatMessage(A.c, { access_token: tok, chat_id: chat, text: 'hello ' + i, entities: [] })

    const msgs = await ChatApi.getChatMessages(A.c, { access_token: tok, chat_id: chat, limit: 20 })
    console.log('same-session:', msgs.length, JSON.stringify(msgs.map((m) => m.text)))

    // 模拟刷新: 新连接 + 重新登录
    const B = mk(); await B.r
    const tok2 = await UserApi.login(B.c, { account: acc, password: 'pw' })
    await UserApi.authorize(B.c, { access_token: tok2, session_id: 's2' + ts })
    const msgs2 = await ChatApi.getChatMessages(B.c, { access_token: tok2, chat_id: chat, limit: 20 })
    console.log('after-refresh:', msgs2.length, JSON.stringify(msgs2.map((m) => m.text)))

    if (msgs2.length !== msgs.length || msgs2.length < 3) throw new Error('刷新后消息丢失')
    console.log('OK')
    process.exit(0)
}
main().catch((e) => { console.error('FAIL', e); process.exit(1) })
