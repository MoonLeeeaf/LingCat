import WS from 'ws'
;(globalThis as any).WebSocket = (WS as any).WebSocket ?? WS

import fs from 'node:fs'
import LingCatClient, { UserApi, MeetingApi } from 'lingcat-client-protocol'

const publicKey = fs.readFileSync('./lingcat_data/key/public')
function mk() {
    const c = new LingCatClient({ server_ws: 'ws://localhost:3601', server_http: 'http://localhost:3601', server_public_key: publicKey })
    const r = new Promise<void>((res) => { c.onInit = () => res() })
    c.init()
    return { c, r }
}
async function main() {
    const st = JSON.parse(fs.readFileSync('/tmp/meeting_state.json', 'utf8'))
    const acc = 'persistu', pw = 'pw'
    const A = mk(); await A.r
    const tok = await UserApi.login(A.c, { account: acc, password: pw })
    await UserApi.authorize(A.c, { access_token: tok, session_id: 'c' + Date.now() })

    const active = await MeetingApi.getActiveMeeting(A.c, { access_token: tok, chat_id: st.chat_id })
    if (!active.has_meeting || active.meeting_id !== st.meeting_id)
        throw new Error('活跃会议丢失: ' + JSON.stringify(active))
    console.log('[ok] 重启后 getActiveMeeting 仍返回该会议', active.meeting_id)

    const creds = await MeetingApi.getMeetingToken(A.c, { access_token: tok, chat_id: st.chat_id, meeting_id: st.meeting_id })
    if (creds.room !== st.room) throw new Error('room 不匹配: ' + creds.room)
    console.log('[ok] 重启后仍能取到令牌, room', creds.room)
    console.log('OK')
    process.exit(0)
}
main().catch((e) => { console.error('FAIL', e); process.exit(1) })
