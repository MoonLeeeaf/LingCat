import WS from 'ws'
;(globalThis as any).WebSocket = (WS as any).WebSocket ?? WS

import fs from 'node:fs'
import LingCatClient, { UserApi, ChatApi, MeetingApi } from 'lingcat-client-protocol'
import { Methods } from 'lingcat-protocol'
import { TokenVerifier } from 'livekit-server-sdk'

const publicKey = fs.readFileSync('./lingcat_data/key/public')

function makeClient() {
    const client = new LingCatClient({
        server_ws: 'ws://localhost:3601',
        server_http: 'http://localhost:3601',
        server_public_key: publicKey,
    })
    const ready = new Promise<void>((resolve) => { client.onInit = () => resolve() })
    client.init()
    return { client, ready }
}

async function main() {
    const ts = Date.now()
    const A = makeClient()
    const B = makeClient()
    await Promise.all([A.ready, B.ready])
    console.log('[ok] 双客户端握手完成')

    const idA = await UserApi.register(A.client, { password: 'pw', nickname: 'Alice' + ts, username: 'alice' + ts })
    const tokA = await UserApi.login(A.client, { account: 'alice' + ts, password: 'pw' })
    await UserApi.authorize(A.client, { access_token: tokA, session_id: 'A-' + ts })
    console.log('[ok] A 注册/登录/授权', idA)

    const idB = await UserApi.register(B.client, { password: 'pw', nickname: 'Bob' + ts, username: 'bob' + ts })
    const tokB = await UserApi.login(B.client, { account: 'bob' + ts, password: 'pw' })
    await UserApi.authorize(B.client, { access_token: tokB, session_id: 'B-' + ts })
    console.log('[ok] B 注册/登录/授权', idB)

    const chatId = await ChatApi.createGroup(A.client, { access_token: tokA, title: 'MeetingTest' + ts })
    await ChatApi.updateChatSettings(A.client, { access_token: tokA, chat_id: chatId, settings: { allow_join: true, allow_meeting: true } })
    await ChatApi.joinChat(B.client, { access_token: tokB, chat_id: chatId })
    console.log('[ok] 建群 + B 入群', chatId)

    const received: number[] = []
    B.client.addOnReceiveListener((p) => received.push(p.method_id))

    const meeting = await MeetingApi.startMeeting(A.client, { access_token: tokA, chat_id: chatId, title: 'Demo' })
    console.log('[ok] A 发起会议', meeting)

    await new Promise((r) => setTimeout(r, 300))
    console.log('[??] B 收到事件 method_ids:', received.map((m) => Methods.getMethodName(m)))
    if (!received.includes(Methods.Meeting_Started_Event)) throw new Error('B 未收到 Meeting_Started_Event')
    console.log('[ok] B 收到 Meeting_Started_Event')

    // 幂等: 再次发起应复用同一房间
    const meeting2 = await MeetingApi.startMeeting(A.client, { access_token: tokA, chat_id: chatId, title: 'Demo2' })
    if (meeting2.meeting_id !== meeting.meeting_id) throw new Error('Start_Meeting 非幂等: ' + meeting2.meeting_id + ' != ' + meeting.meeting_id)
    console.log('[ok] Start_Meeting 幂等, 复用 room', meeting2.room)

    const active = await MeetingApi.getActiveMeeting(B.client, { access_token: tokB, chat_id: chatId })
    if (!active.has_meeting || active.meeting_id !== meeting.meeting_id) throw new Error('Get_Active_Meeting 结果不正确')
    console.log('[ok] Get_Active_Meeting 返回进行中会议', active.room)
    if (!received.includes(Methods.Receive_Chat_Message_Event)) throw new Error('未收到会议系统消息广播')
    console.log('[ok] B 收到会议系统消息')

    const creds = await MeetingApi.getMeetingToken(B.client, { access_token: tokB, chat_id: chatId, meeting_id: meeting.meeting_id })
    console.log('[ok] B 取得会议令牌, url =', creds.url, 'room =', creds.room, 'max =', creds.max_participants)

    const verifier = new TokenVerifier(process.env.LK_KEY || 'devkey', process.env.LK_SECRET || 'secret')
    const claims = await verifier.verify(creds.token)
    console.log('[ok] LiveKit 校验令牌通过:', JSON.stringify((claims as any).video))
    if ((claims as any).video?.room !== creds.room) throw new Error('room 不匹配')
    if (!(claims as any).video?.canPublish) throw new Error('缺少 canPublish')

    await MeetingApi.endMeeting(A.client, { access_token: tokA, chat_id: chatId, meeting_id: meeting.meeting_id })
    await new Promise((r) => setTimeout(r, 300))
    if (!received.includes(Methods.Meeting_Ended_Event)) throw new Error('B 未收到 Meeting_Ended_Event')
    console.log('[ok] B 收到 Meeting_Ended_Event')

    const activeAfter = await MeetingApi.getActiveMeeting(B.client, { access_token: tokB, chat_id: chatId })
    if (activeAfter.has_meeting) throw new Error('会议已结束但 Get_Active_Meeting 仍返回进行中')
    console.log('[ok] 结束后 Get_Active_Meeting 返回无会议')

    try {
        await MeetingApi.getMeetingToken(B.client, { access_token: tokB, chat_id: chatId, meeting_id: meeting.meeting_id })
        throw new Error('已结束会议仍能取令牌 (不应发生)')
    } catch (e: any) {
        console.log('[ok] 已结束会议拒绝取令牌:', e.message)
    }

    console.log('\n=== 全部通过 ===')
    process.exit(0)
}

main().catch((e) => { console.error('测试失败:', e); process.exit(1) })
