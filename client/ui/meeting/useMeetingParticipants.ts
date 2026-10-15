import React from 'react'
import { MeetingApi } from 'lingcat-client-protocol'
import { LingCatProto, Methods, type Package } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'

export interface MeetingParticipantInfo {
    identity: string
    user_id: string | null
    nickname: string | null
    remark: string | null
    avatar_file_hash: string | null
}

function mapParticipant(p: any): MeetingParticipantInfo {
    return {
        identity: p.identity,
        user_id: p.userId ?? null,
        nickname: p.nickname ?? null,
        remark: p.remark ?? null,
        avatar_file_hash: p.avatarFileHash ?? null,
    }
}

/**
 * 会议在场成员 (供横幅显示人数/头像堆叠)。
 * 首次主动拉取一次, 后续由服务端的 Meeting_Participants_Changed_Event 推送。
 */
export function useMeetingParticipants(
    chatId: string,
    meetingId?: string,
): MeetingParticipantInfo[] {
    const [members, setMembers] = React.useState<MeetingParticipantInfo[]>([])

    // 首次拉取 (仅当 meetingId 变化时)
    React.useEffect(() => {
        setMembers([])
        if (!meetingId) return

        let alive = true
        ;(async () => {
            try {
                const client = ClientManager.getActiveClient()
                const session = ClientManager.getActiveSession()
                if (!client || !session) return
                const r = await MeetingApi.getMeetingParticipants(client, {
                    access_token: session.token,
                    chat_id: chatId,
                    meeting_id: meetingId,
                })
                if (alive) setMembers((r.participants ?? []))
            } catch { /* 静默 */ }
        })()

        return () => { alive = false }
    }, [chatId, meetingId])

    // 订阅事件
    React.useEffect(() => {
        const client = ClientManager.getActiveClient()
        if (!client) return

        const listener = (pkg: Package) => {
            if (pkg.method_id !== Methods.Meeting_Participants_Changed_Event) return
            let ev: any
            try {
                ev = LingCatProto.methods.Meeting_Participants_Changed_Event.decode(pkg.data)
            } catch { return }
            if (ev.chatId !== chatId) return
            if (meetingId && ev.meetingId !== meetingId) return
            setMembers((ev.participants ?? []).map(mapParticipant))
        }

        client.addOnReceiveListener(listener)
        return () => client.removeOnReceiveListener(listener)
    }, [chatId, meetingId])

    return members
}