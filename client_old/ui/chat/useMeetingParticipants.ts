import React from 'react'
import { MeetingApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'

const POLL_MS = 15_000

export interface MeetingParticipantInfo {
    identity: string
    user_id: string | null
    nickname: string | null
    remark: string | null
    avatar_file_hash: string | null
}

/**
 * 轮询会议在场成员 (供横幅显示人数/头像堆叠)。
 * 页面不可见时暂停轮询; 协议方法在 client_protocol 里已做加密与 decodeOrThrow。
 */
export function useMeetingParticipants(chatId: string, meetingId?: string): MeetingParticipantInfo[] {
    const [members, setMembers] = React.useState<MeetingParticipantInfo[]>([])

    React.useEffect(() => {
        setMembers([])
        if (!meetingId) return

        let alive = true
        let timer: ReturnType<typeof setInterval> | null = null

        const load = async () => {
            try {
                const r = await MeetingApi.getMeetingParticipants(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    chat_id: chatId,
                    meeting_id: meetingId,
                })
                if (alive) setMembers(r.participants || [])
            } catch { /* 静默 */ }
        }

        const start = () => { load(); timer = setInterval(load, POLL_MS) }
        const stop = () => { if (timer) { clearInterval(timer); timer = null } }
        const onVisibility = () => document.hidden ? stop() : start()

        start()
        document.addEventListener('visibilitychange', onVisibility)
        return () => {
            alive = false
            stop()
            document.removeEventListener('visibilitychange', onVisibility)
        }
    }, [chatId, meetingId])

    return members
}
