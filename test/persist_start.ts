import WS from 'ws'
;(globalThis as any).WebSocket = (WS as any).WebSocket ?? WS

import fs from 'node:fs'
import LingCatClient, { UserApi, ChatApi, MeetingApi } from 'lingcat-client-protocol'

const publicKey = fs.readFileSync('./lingcat_data/key/public')
function mk() {
    const c = new LingCatClient({ server_ws: 'ws://localhost:3601', server_http: 'http://localhost:3601', server_public_key: publicKey })
    const r = new Promise<void>((res) => { c.onInit = () => res() })
    c.init()
    return { c, r }
}
async function login(c: any, acc: string, pw: string) {
    try { return await UserApi.login(c, { account: acc, password: pw }) }
    catch { await UserApi.register(c, { username: acc, password: pw, nickname: acc }); return await UserApi.login(c, { account: acc, password: pw }) }
}
async function main() {
    const acc = 'persistu', pw = 'pw'
    const A = mk(); await A.r
    const tok = await login(A.c, acc, pw)
    await UserApi.authorize(A.c, { access_token: tok, session_id: 's' + Date.now() })
    const chats = await ChatApi.getMyChats(A.c, { access_token: tok })
    let chat = chats.find((c) => c.type === 'group')
    if (!chat) {
        const id = await ChatApi.createGroup(A.c, { access_token: tok, title: 'persist' })
        chat = await ChatApi.queryChatInfo(A.c, { access_token: tok, chat_id: id })
    }
    const m = await MeetingApi.startMeeting(A.c, { access_token: tok, chat_id: chat.id, title: 'persist' })
    fs.writeFileSync('/tmp/meeting_state.json', JSON.stringify({ chat_id: chat.id, meeting_id: m.meeting_id, room: m.room }))
    console.log('[ok] started', JSON.stringify(m), 'chat', chat.id)
    process.exit(0)
}
main().catch((e) => { console.error('FAIL', e); process.exit(1) })
