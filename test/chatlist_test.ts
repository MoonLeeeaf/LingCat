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
    const acc = 'list' + ts
    const A = mk(); await A.r
    await UserApi.register(A.c, { password: 'pw', nickname: 'List' + ts, username: acc })
    const tok = await UserApi.login(A.c, { account: acc, password: 'pw' })
    await UserApi.authorize(A.c, { access_token: tok, session_id: 's' + ts })

    // 造一个非空列表: 建群 + 发几条消息
    const chat = await ChatApi.createGroup(A.c, { access_token: tok, title: 'ListGroup' + ts })
    for (let i = 1; i <= 3; i++)
        await ChatApi.sendChatMessage(A.c, { access_token: tok, chat_id: chat, text: 'list hello ' + i, entities: [] })

    console.log('-> getMyChats ...')
    const t1 = Date.now()
    const chats = await ChatApi.getMyChats(A.c, { access_token: tok, limit: 1000, timeout: 15000 })
    console.log('getMyChats returned', chats.length, 'in', Date.now() - t1, 'ms')

    console.log('-> getMyFavouriteChats ...')
    const t2 = Date.now()
    const fav = await ChatApi.getMyFavouriteChats(A.c, { access_token: tok, timeout: 15000 })
    console.log('getMyFavouriteChats returned', fav.length, 'in', Date.now() - t2, 'ms')

    // 二次调用 (可能出现状态残留)
    console.log('-> getMyChats #2 ...')
    const chats2 = await ChatApi.getMyChats(A.c, { access_token: tok, limit: 1000, timeout: 15000 })
    console.log('getMyChats #2 returned', chats2.length)

    console.log('OK')
    process.exit(0)
}
main().catch((e) => { console.error('FAIL', e); process.exit(1) })
