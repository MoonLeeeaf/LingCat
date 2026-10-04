import crypto from 'node:crypto'
import { AccessToken, RoomConfiguration, RoomServiceClient } from 'livekit-server-sdk'
import { Code, LingCatProto, Methods, Package, type IChatSettings } from 'lingcat-protocol'
import type { ISendPackageFunction } from './ISendPackageFunction.ts'
import TokenManager from './TokenManager.ts'
import UserChatLinker from '../data/UserChatLinker.ts'
import ChatDataBase from '../data/ChatDataBase.ts'
import ChatAdminLinker from '../data/ChatAdminLinker.ts'
import UserDataBase from '../data/UserDataBase.ts'
import MessageDataBase from '../data/MessageDataBase.ts'
import sendError from './sendError.ts'
import { config, livekitHttpUrl } from '../config.ts'

export interface IMeeting {
    id: string
    chat_id: string
    room: string
    starter_user_id: string
    title?: string
    created_at: number
}

type ClientsEmiter = { [k: string]: { [k: string]: (mPackage: Package) => void } }

const MEETING_IDLE_TIMEOUT_MS = 1000 * 60 * 60 * 6

class MeetingStore {
    private meetings: { [meeting_id: string]: IMeeting } = {}

    create(chat_id: string, starter_user_id: string, title?: string): IMeeting {
        // 清理过期会议
        const now = Date.now()
        for (const id of Object.keys(this.meetings))
            if (now - this.meetings[id].created_at > MEETING_IDLE_TIMEOUT_MS)
                delete this.meetings[id]

        const id = crypto.randomBytes(8).toString('hex')
        const meeting: IMeeting = {
            id,
            chat_id,
            room: 'lingcat_' + id,
            starter_user_id,
            title: title?.trim() || undefined,
            created_at: now,
        }
        this.meetings[id] = meeting
        return meeting
    }

    get(id: string) {
        const m = this.meetings[id]
        if (!m) return undefined
        if (Date.now() - m.created_at > MEETING_IDLE_TIMEOUT_MS) {
            delete this.meetings[id]
            return undefined
        }
        return m
    }

    findByChat(chat_id: string): IMeeting | undefined {
        const now = Date.now()
        for (const id of Object.keys(this.meetings)) {
            const m = this.meetings[id]
            if (now - m.created_at > MEETING_IDLE_TIMEOUT_MS) {
                delete this.meetings[id]
                continue
            }
            if (m.chat_id == chat_id) return m
        }
        return undefined
    }

    remove(id: string) {
        delete this.meetings[id]
    }
}

const store = new MeetingStore()

function broadcastToUserClients(clients_emiter: ClientsEmiter, user_id: string, func: (emit: (mPackage: Package) => void) => void) {
    Object.values(clients_emiter[user_id] || []).forEach(func)
}

async function broadcastToChatMembers(clients_emiter: ClientsEmiter, chat_id: string, build: () => Package) {
    const members = await UserChatLinker.queryUsersOfChat(chat_id)
    members.forEach((user_id) => broadcastToUserClients(clients_emiter, user_id, (emit) => emit(build())))
}

/**
 * 以系统消息的形式向对话成员广播 (持久化到聊天记录, 离线成员回来也能看到)
 */
async function broadcastSystemMessage(clients_emiter: ClientsEmiter, chat_id: string, text: string) {
    const time = Date.now()
    const msg_id = await MessageDataBase.addMessage({
        text,
        chat_id,
        system: true,
        time,
    })

    const members = await UserChatLinker.queryUsersOfChat(chat_id)
    members.forEach((user_id) => broadcastToUserClients(clients_emiter, user_id, (emit) => {
        emit(Package.encode({
            method_id: Methods.Receive_Chat_Message_Event,
            flags: 0,
            data: LingCatProto.methods.Receive_Chat_Message_Event.encode({
                msg: {
                    text,
                    chatId: chat_id,
                    system: true,
                    time,
                    id: msg_id,
                },
            }).finish(),
        }))
        setTimeout(() => emit(Package.encode({
            method_id: Methods.Update_My_Chats_Event,
            flags: 0,
            data: LingCatProto.methods.Update_My_Chats_Event.encode({}).finish(),
        })), 50)
    }))
}

function assertLiveKitConfigured(sendPackage: ISendPackageFunction, method_id: number) {
    if (!config.livekit_enabled)
        return sendError(sendPackage, method_id, '会议功能未启用 (config.json: livekit_enabled)', Code.Forbidden)
    if (!config.livekit_url || !config.livekit_api_key || !config.livekit_api_secret)
        return sendError(sendPackage, method_id, '会议配置不完整 (livekit_url / livekit_api_key / livekit_api_secret)', Code.Internal_Server_Error)
    return undefined
}

async function assertMeetingAllowed(sendPackage: ISendPackageFunction, method_id: number, user_id: string, chat_id: string) {
    const chat = await ChatDataBase.queryChatById(chat_id)
    if (!chat)
        return sendError(sendPackage, method_id, '对话不存在', Code.Not_Found)
    if (!await UserChatLinker.isUserChatLinked(user_id, chat_id))
        return sendError(sendPackage, method_id, '用户不属于此对话', Code.Forbidden)

    let settings: IChatSettings | undefined
    try { settings = JSON.parse(chat.settings || '{}') } catch { settings = undefined }
    if (settings && settings.allow_meeting === false)
        return sendError(sendPackage, method_id, '此对话已禁用会议', Code.Forbidden)
    return chat
}

async function countRoomParticipants(room: string): Promise<number | undefined> {
    try {
        const svc = new RoomServiceClient(livekitHttpUrl(), config.livekit_api_key!, config.livekit_api_secret!)
        const participants = await svc.listParticipants(room)
        return participants.length
    } catch (e) {
        console.log('[Meeting] 无法通过 LiveKit 查询房间人数, 跳过兜底:', e)
        return undefined
    }
}

export default class MeetingApi {
    static async onCall(sendPackage: ISendPackageFunction, mPackage: Package, clients_emiter: ClientsEmiter = {}) {
        switch (mPackage.method_id) {
            /**
             * ===============================
             *           发起会议
             * ===============================
             */
            case Methods.Start_Meeting_Request: {
                const data = LingCatProto.methods.Start_Meeting_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                const err = assertLiveKitConfigured(sendPackage, mPackage.method_id)
                if (err) return err
                if (!await assertMeetingAllowed(sendPackage, mPackage.method_id, user_id, data.chatId)) return

                // 幂等: 该对话已有进行中的会议则复用, 不再新建房间
                const existing = store.findByChat(data.chatId)
                const meeting = existing ?? store.create(data.chatId, user_id, data.title)

                // 仅"新会议"时写入系统消息, 避免重复点击刷屏
                if (!existing) {
                    const starter = await UserDataBase.queryUserById(user_id)
                    await broadcastSystemMessage(clients_emiter, data.chatId, `${starter?.nickname || '有人'} 发起了会议 · 点击右上角视频图标加入`)
                }

                await broadcastToChatMembers(clients_emiter, data.chatId, () => Package.encode({
                    method_id: Methods.Meeting_Started_Event,
                    flags: 0,
                    data: LingCatProto.methods.Meeting_Started_Event.encode({
                        chatId: data.chatId,
                        meetingId: meeting.id,
                        room: meeting.room,
                        starterUserId: user_id,
                        title: meeting.title,
                    }).finish(),
                }))

                sendPackage(Package.encode({
                    method_id: Methods.Start_Meeting_Response,
                    flags: 0,
                    data: LingCatProto.methods.Start_Meeting_Response.encode({
                        meetingId: meeting.id,
                        room: meeting.room,
                        starterUserId: meeting.starter_user_id,
                    }).finish(),
                }))
                break
            }
            /**
             * ===============================
             *        获取会议令牌
             * ===============================
             */
            case Methods.Get_Meeting_Token_Request: {
                const data = LingCatProto.methods.Get_Meeting_Token_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                const err = assertLiveKitConfigured(sendPackage, mPackage.method_id)
                if (err) return err
                if (!await assertMeetingAllowed(sendPackage, mPackage.method_id, user_id, data.chatId)) return

                const meeting = store.get(data.meetingId)
                if (!meeting || meeting.chat_id != data.chatId)
                    return sendError(sendPackage, mPackage.method_id, '会议不存在或已结束', Code.Not_Found)

                const max_participants = config.max_meeting_participants || 6

                // 服务端人数兜底 (LiveKit roomConfig 为主, 此处为友好错误)
                const count = await countRoomParticipants(meeting.room)
                if (count != undefined && count >= max_participants)
                    return sendError(sendPackage, mPackage.method_id, '会议人数已达上限 (' + max_participants + ')', Code.Forbidden)

                const user = await UserDataBase.queryUserById(user_id)
                if (!user) return sendError(sendPackage, mPackage.method_id, '用户不存在', Code.Not_Found)

                const at = new AccessToken(config.livekit_api_key!, config.livekit_api_secret!, {
                    identity: user_id,
                    name: user.nickname,
                    ttl: config.meeting_token_ttl_seconds || 7200,
                    metadata: JSON.stringify({
                        user_id,
                        nickname: user.nickname,
                        avatar_file_hash: user.avatar_file_hash ?? null,
                    }),
                })
                at.addGrant({
                    roomJoin: true,
                    room: meeting.room,
                    canPublish: true,
                    canSubscribe: true,
                    canPublishData: true,
                })
                at.roomConfig = new RoomConfiguration({
                    maxParticipants: max_participants,
                    emptyTimeout: 60 * 5,
                    departureTimeout: 20,
                })

                const token = await at.toJwt()

                // livekit_url 为 "same-origin" 时, 由客户端根据当前页面地址推导 (适用于 nginx/frp 同源反代 /rtc)
                const url = config.livekit_url === 'same-origin' ? 'same-origin' : config.livekit_url!

                sendPackage(Package.encode({
                    method_id: Methods.Get_Meeting_Token_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_Meeting_Token_Response.encode({
                        url,
                        room: meeting.room,
                        token,
                        maxParticipants: max_participants,
                    }).finish(),
                }))
                break
            }
            /**
             * ===============================
             *           结束会议
             * ===============================
             */
            case Methods.End_Meeting_Request: {
                const data = LingCatProto.methods.End_Meeting_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                const err = assertLiveKitConfigured(sendPackage, mPackage.method_id)
                if (err) return err
                if (!await assertMeetingAllowed(sendPackage, mPackage.method_id, user_id, data.chatId)) return

                const meeting = store.get(data.meetingId)
                if (!meeting || meeting.chat_id != data.chatId)
                    return sendError(sendPackage, mPackage.method_id, '会议不存在或已结束', Code.Not_Found)

                const isStarter = meeting.starter_user_id == user_id
                const isOwner = await ChatAdminLinker.isOwner(data.chatId, user_id)
                const isAdmin = await ChatAdminLinker.isAdmin(data.chatId, user_id)
                if (!isStarter && !isOwner && !isAdmin)
                    return sendError(sendPackage, mPackage.method_id, '无权结束会议', Code.Forbidden)

                store.remove(meeting.id)

                await broadcastSystemMessage(clients_emiter, data.chatId, '会议已结束')

                // 尝试直接解散 LiveKit 房间 (失败不影响协议响应)
                try {
                    const svc = new RoomServiceClient(livekitHttpUrl(), config.livekit_api_key!, config.livekit_api_secret!)
                    await svc.deleteRoom(meeting.room)
                } catch (e) {
                    console.log('[Meeting] 解散 LiveKit 房间失败 (可能已自行关闭):', e)
                }

                await broadcastToChatMembers(clients_emiter, data.chatId, () => Package.encode({
                    method_id: Methods.Meeting_Ended_Event,
                    flags: 0,
                    data: LingCatProto.methods.Meeting_Ended_Event.encode({
                        chatId: data.chatId,
                        meetingId: meeting.id,
                    }).finish(),
                }))

                sendPackage(Package.encode({
                    method_id: Methods.End_Meeting_Response,
                    flags: 0,
                    data: LingCatProto.methods.End_Meeting_Response.encode({}).finish(),
                }))
                break
            }
            /**
             * ===============================
             *        查询进行中的会议
             * ===============================
             */
            case Methods.Get_Active_Meeting_Request: {
                const data = LingCatProto.methods.Get_Active_Meeting_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                if (!await ChatDataBase.queryChatById(data.chatId))
                    return sendError(sendPackage, mPackage.method_id, '对话不存在', Code.Not_Found)
                if (!await UserChatLinker.isUserChatLinked(user_id, data.chatId))
                    return sendError(sendPackage, mPackage.method_id, '用户不属于此对话', Code.Forbidden)

                const meeting = store.findByChat(data.chatId)

                sendPackage(Package.encode({
                    method_id: Methods.Get_Active_Meeting_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_Active_Meeting_Response.encode({
                        hasMeeting: !!meeting,
                        meetingId: meeting?.id ?? '',
                        room: meeting?.room ?? '',
                        starterUserId: meeting?.starter_user_id ?? '',
                        title: meeting?.title,
                    }).finish(),
                }))
                break
            }
            default: {
                return false
            }
        }
        return true
    }
}
