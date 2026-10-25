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
import MeetingDataBase from '../data/MeetingDataBase.ts'
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

// 无活跃参与者后的空闲超时 (活跃房间由 poller 每 5s 续期)
const MEETING_IDLE_TIMEOUT_MS = 1000 * 60 * 30

// 会议在场成员缓存: 同一 room 5 秒内共享一次 LiveKit 查询 (只存原始数据, 发送时再 encode)
const participantsCache = new Map<string, {
    at: number
    data: Array<{ identity: string, userId?: string, nickname?: string, remark?: string, avatarFileHash?: string }>
}>()

// 会议持久化到数据库, 保证服务端重启/重新部署后仍可继续(加入/查询)同一场会议
class MeetingStore {
    async create(chat_id: string, starter_user_id: string, title?: string): Promise<IMeeting> {
        await MeetingDataBase.removeExpired(Date.now() - MEETING_IDLE_TIMEOUT_MS)
        const id = crypto.randomBytes(8).toString('hex')
        const meeting: IMeeting = {
            id,
            chat_id,
            room: 'lingcat_' + id,
            starter_user_id,
            title: title?.trim() || undefined,
            created_at: Date.now(),
            last_active_at: Date.now(),
        }
        await MeetingDataBase.create(meeting)
        return meeting
    }

    async get(id: string): Promise<IMeeting | undefined> {
        await MeetingDataBase.removeExpired(Date.now() - MEETING_IDLE_TIMEOUT_MS)
        const m = await MeetingDataBase.get(id)
        if (!m) return undefined
        const lastActive = m.last_active_at ?? m.created_at
        if (Date.now() - lastActive > MEETING_IDLE_TIMEOUT_MS) {
            await MeetingDataBase.remove(id)
            return undefined
        }
        return { ...m, title: m.title ?? undefined }
    }

    async findByChat(chat_id: string): Promise<IMeeting | undefined> {
        await MeetingDataBase.removeExpired(Date.now() - MEETING_IDLE_TIMEOUT_MS)
        const m = await MeetingDataBase.findByChat(chat_id)
        if (!m) return undefined
        return { ...m, title: m.title ?? undefined }
    }

    async updateTitle(id: string, title: string) {
        await MeetingDataBase.updateTitle(id, title)
    }

    async touch(id: string) {
        await MeetingDataBase.touch(id)
    }

    async remove(id: string) {
        await MeetingDataBase.remove(id)
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
                const existing = await store.findByChat(data.chatId)
                const meeting = existing ?? await store.create(data.chatId, user_id, data.title!)

                // 仅"新会议"时写入系统消息, 避免重复点击刷屏
                if (!existing) {
                    const starter = await UserDataBase.queryUserById(user_id)
                    await broadcastSystemMessage(clients_emiter, data.chatId, `${starter?.nickname || '有人'} 发起了会议`)
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

                const meeting = await store.get(data.meetingId)
                if (!meeting || meeting.chat_id != data.chatId)
                    return sendError(sendPackage, mPackage.method_id, '会议不存在或已结束', Code.Not_Found)
                await store.touch(meeting.id)

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
                    // 允许参与者修改自己的名称/元数据 (例: 机器人改成主播备注)
                    canUpdateOwnMetadata: true,
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

                const meeting = await store.get(data.meetingId)
                if (!meeting || meeting.chat_id != data.chatId)
                    return sendError(sendPackage, mPackage.method_id, '会议不存在或已结束', Code.Not_Found)

                const isStarter = meeting.starter_user_id == user_id
                const isOwner = await ChatAdminLinker.isOwner(data.chatId, user_id)
                const isAdmin = await ChatAdminLinker.isAdmin(data.chatId, user_id)
                if (!isStarter && !isOwner && !isAdmin)
                    return sendError(sendPackage, mPackage.method_id, '无权结束会议', Code.Forbidden)

                await store.remove(meeting.id)

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
             *        修改会议标题
             * ===============================
             */
            case Methods.Update_Meeting_Title_Request: {
                const data = LingCatProto.methods.Update_Meeting_Title_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                if (!await assertMeetingAllowed(sendPackage, mPackage.method_id, user_id, data.chatId)) return

                const meeting = await store.get(data.meetingId)
                if (!meeting || meeting.chat_id != data.chatId)
                    return sendError(sendPackage, mPackage.method_id, '会议不存在或已结束', Code.Not_Found)

                const title = String(data.title ?? '').trim().slice(0, 64)
                await store.updateTitle(meeting.id, title)
                await store.touch(meeting.id)

                await broadcastToChatMembers(clients_emiter, data.chatId, () => Package.encode({
                    method_id: Methods.Meeting_Title_Changed_Event,
                    flags: 0,
                    data: LingCatProto.methods.Meeting_Title_Changed_Event.encode({
                        chatId: data.chatId,
                        meetingId: meeting.id,
                        title,
                    }).finish(),
                }))

                sendPackage(Package.encode({
                    method_id: Methods.Update_Meeting_Title_Response,
                    flags: 0,
                    data: LingCatProto.methods.Update_Meeting_Title_Response.encode({ title }).finish(),
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

                const meeting = await store.findByChat(data.chatId)

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
            /**
             * ===============================
             *        查询会议在场成员
             * ===============================
             */
            case Methods.Get_Meeting_Participants_Request: {
                const data = LingCatProto.methods.Get_Meeting_Participants_Request.decode(mPackage.data)

                let user_id: string
                try {
                    user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                } catch {
                    return sendError(sendPackage, mPackage.method_id, 'Token is invalid', Code.UnAuthorized)
                }

                if (!data.chatId)
                    return sendError(sendPackage, mPackage.method_id, 'chat_id required', Code.Bad_Request)
                if (!(await UserChatLinker.isUserChatLinked(user_id, data.chatId)))
                    return sendError(sendPackage, mPackage.method_id, 'You are not a member of this chat', Code.Forbidden)

                const sendEmpty = (meetingId = '', room = '') => {
                    sendPackage(Package.encode({
                        method_id: Methods.Get_Meeting_Participants_Response,
                        flags: 0,
                        data: LingCatProto.methods.Get_Meeting_Participants_Response.encode({
                            meetingId, room, count: 0, participants: [],
                        }).finish(),
                    }))
                }

                // 无 LiveKit → 空
                if (!config.livekit_enabled) { sendEmpty(); break }

                // meeting_id 与 chat_id 二次校验, 防跨会议查询
                const meeting = data.meetingId
                    ? await MeetingDataBase.get(data.meetingId)
                    : await MeetingDataBase.findByChat(data.chatId)
                if (!meeting || meeting.chat_id !== data.chatId) { sendEmpty(); break }

                const now = Date.now()
                let entry = participantsCache.get(meeting.room)
                if (!entry || now - entry.at > 5000) {
                    try {
                        const svc = new RoomServiceClient(livekitHttpUrl(), config.livekit_api_key!, config.livekit_api_secret!)
                        const ps = await svc.listParticipants(meeting.room)
                        entry = {
                            at: now,
                            data: ps.map((p) => {
                                let meta: any = {}
                                try { meta = JSON.parse(p.metadata || '{}') } catch { }
                                return {
                                    identity: p.identity,
                                    userId: meta.user_id ?? undefined,
                                    nickname: meta.nickname ?? p.name ?? undefined,
                                    remark: meta.remark ?? undefined,
                                    avatarFileHash: meta.avatar_file_hash ?? undefined,
                                }
                            }),
                        }
                        participantsCache.set(meeting.room, entry)
                    } catch (e: any) {
                        const msg = String(e?.message || e)
                        // 会议刚结束 / LiveKit 侧 room 已销毁 → 返回空而不是 500
                        if (msg.includes('not found') || e?.code === 404) { sendEmpty(meeting.id, meeting.room); break }
                        console.log('[Meeting] 查询在场成员失败:', e)
                        return sendError(sendPackage, mPackage.method_id, 'Failed to query participants', Code.Internal_Server_Error)
                    }
                }

                if (!entry) { sendEmpty(meeting.id, meeting.room); break }
                const list = entry.data
                sendPackage(Package.encode({
                    method_id: Methods.Get_Meeting_Participants_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_Meeting_Participants_Response.encode({
                        meetingId: meeting.id,
                        room: meeting.room,
                        count: list.length,
                        participants: list,
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

// ============================================================
//              会议成员轮询器
//   定时 diff LiveKit 房间成员, 变化时广播事件
//   —— 避免每个客户端各自轮询
// ============================================================

const POLL_INTERVAL_MS = 5000
const SNAPSHOT_TTL_MS = 30_000   // 30 秒没更新的快照丢弃

class MeetingParticipantPoller {
    private snapshots = new Map<string, {
        meetingId: string
        chatId: string
        identities: Set<string>
        at: number
    }>()

    private timer?: ReturnType<typeof setInterval>

    start(clients_emiter: ClientsEmiter) {
        if (this.timer) return
        this.timer = setInterval(() => {
            this.tick(clients_emiter).catch(e => console.warn('[Poller] tick failed', e))
        }, POLL_INTERVAL_MS)
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer)
            this.timer = undefined
        }
    }

    private async tick(clients_emiter: ClientsEmiter) {
        if (!config.livekit_enabled) return
        const meetings = await MeetingDataBase.getAll()
        if (meetings.length === 0) {
            // 没有会议, 清空快照
            this.snapshots.clear()
            return
        }

        const now = Date.now()
        const activeRooms = new Set<string>()

        for (const meeting of meetings) {
            activeRooms.add(meeting.room)
            try {
                const svc = new RoomServiceClient(
                    livekitHttpUrl(),
                    config.livekit_api_key!,
                    config.livekit_api_secret!,
                )
                const ps = await svc.listParticipants(meeting.room)
                const data = ps.map(p => {
                    let meta: any = {}
                    try { meta = JSON.parse(p.metadata || '{}') } catch { }
                    return {
                        identity: p.identity,
                        userId: meta.user_id ?? undefined,
                        nickname: meta.nickname ?? p.name ?? undefined,
                        remark: meta.remark ?? undefined,
                        avatarFileHash: meta.avatar_file_hash ?? undefined,
                    }
                })
                const identities = new Set(data.map(d => d.identity))
                // 有活跃参与者 → 续期, 长会议不会被 created_at 超时误删
                if (identities.size > 0) await MeetingDataBase.touch(meeting.id, now)

                const prev = this.snapshots.get(meeting.room)

                // 首次快照: 不广播 (客户端会主动 query 一次)
                if (!prev) {
                    this.snapshots.set(meeting.room, {
                        meetingId: meeting.id,
                        chatId: meeting.chat_id,
                        identities,
                        at: now,
                    })
                    continue
                }

                // diff
                let changed = prev.identities.size !== identities.size
                if (!changed) {
                    for (const id of identities) {
                        if (!prev.identities.has(id)) { changed = true; break }
                    }
                }

                if (changed) {
                    this.snapshots.set(meeting.room, {
                        meetingId: meeting.id,
                        chatId: meeting.chat_id,
                        identities,
                        at: now,
                    })
                    await this.broadcast(clients_emiter, meeting, data)
                } else {
                    prev.at = now  // 刷新时间戳
                }
            } catch (e: any) {
                const msg = String(e?.message || e)
                if (msg.includes('not found') || e?.code === 404) {
                    // 房间已不存在 (可能刚结束)
                    this.snapshots.delete(meeting.room)
                } else {
                    console.warn('[Poller] listParticipants failed', e)
                }
            }
        }

        // 清理过期快照
        for (const [room, snap] of this.snapshots) {
            if (!activeRooms.has(room) || now - snap.at > SNAPSHOT_TTL_MS) {
                this.snapshots.delete(room)
            }
        }

        // 清理长时间无活跃参与者的会议记录
        await MeetingDataBase.removeExpired(now - MEETING_IDLE_TIMEOUT_MS)
    }

    private async broadcast(
        clients_emiter: ClientsEmiter,
        meeting: { id: string, chat_id: string, room: string },
        participants: Array<{ identity: string, userId?: string, nickname?: string, remark?: string, avatarFileHash?: string }>,
    ) {
        await broadcastToChatMembers(clients_emiter, meeting.chat_id, () => Package.encode({
            method_id: Methods.Meeting_Participants_Changed_Event,
            flags: 0,
            data: LingCatProto.methods.Meeting_Participants_Changed_Event.encode({
                chatId: meeting.chat_id,
                meetingId: meeting.id,
                room: meeting.room,
                count: participants.length,
                participants,
            }).finish(),
        }))
    }
}

export const meetingParticipantPoller = new MeetingParticipantPoller()
