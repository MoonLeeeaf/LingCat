import { LingCatProto, Methods } from 'lingcat-protocol'
import LingCatClient from './LingCatClient.ts'
import decodeOrThrow from './decodeOrThrow.ts'

export interface IMeetingCredentials {
    url: string
    room: string
    token: string
    max_participants: number
}

export default class MeetingApi {
    /**
     * 发起会议, 服务端会向对话成员广播 Meeting_Started_Event
     */
    static async startMeeting(client: LingCatClient, {
        access_token,
        chat_id,
        title,
        timeout,
    }: {
        access_token: string
        chat_id: string
        title?: string
        timeout?: number
    }) {
        const res = decodeOrThrow<LingCatProto.methods.Start_Meeting_Response>(
            LingCatProto.methods.Start_Meeting_Response,
            (await client.invoke({
                method_id: Methods.Start_Meeting_Request,
                data: LingCatProto.methods.Start_Meeting_Request.encode({
                    accessToken: access_token,
                    chatId: chat_id,
                    title,
                }).finish(),
                timeout,
            })).data
        )
        return {
            meeting_id: res.meetingId,
            room: res.room,
            starter_user_id: res.starterUserId,
        }
    }

    /**
     * 获取加入指定会议所需的 LiveKit 令牌
     */
    static async getMeetingToken(client: LingCatClient, {
        access_token,
        chat_id,
        meeting_id,
        timeout,
    }: {
        access_token: string
        chat_id: string
        meeting_id: string
        timeout?: number
    }): Promise<IMeetingCredentials> {
        const res = decodeOrThrow<LingCatProto.methods.Get_Meeting_Token_Response>(
            LingCatProto.methods.Get_Meeting_Token_Response,
            (await client.invoke({
                method_id: Methods.Get_Meeting_Token_Request,
                data: LingCatProto.methods.Get_Meeting_Token_Request.encode({
                    accessToken: access_token,
                    chatId: chat_id,
                    meetingId: meeting_id,
                }).finish(),
                timeout,
            })).data
        )
        return {
            url: res.url,
            room: res.room,
            token: res.token,
            max_participants: res.maxParticipants,
        }
    }

    /**
     * 查询对话中正在进行的会议
     */
    static async getActiveMeeting(client: LingCatClient, {
        access_token,
        chat_id,
        timeout,
    }: {
        access_token: string
        chat_id: string
        timeout?: number
    }) {
        const res = decodeOrThrow<LingCatProto.methods.Get_Active_Meeting_Response>(
            LingCatProto.methods.Get_Active_Meeting_Response,
            (await client.invoke({
                method_id: Methods.Get_Active_Meeting_Request,
                data: LingCatProto.methods.Get_Active_Meeting_Request.encode({
                    accessToken: access_token,
                    chatId: chat_id,
                }).finish(),
                timeout,
            })).data
        )
        return {
            has_meeting: res.hasMeeting,
            meeting_id: res.meetingId,
            room: res.room,
            starter_user_id: res.starterUserId,
            title: res.title ?? undefined,
        }
    }

    /**
     * 结束会议 (发起人 / 群主 / 管理员)
     */
    static async endMeeting(client: LingCatClient, {
        access_token,
        chat_id,
        meeting_id,
        timeout,
    }: {
        access_token: string
        chat_id: string
        meeting_id: string
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.End_Meeting_Response>(
            LingCatProto.methods.End_Meeting_Response,
            (await client.invoke({
                method_id: Methods.End_Meeting_Request,
                data: LingCatProto.methods.End_Meeting_Request.encode({
                    accessToken: access_token,
                    chatId: chat_id,
                    meetingId: meeting_id,
                }).finish(),
                timeout,
            })).data
        )
    }
}
