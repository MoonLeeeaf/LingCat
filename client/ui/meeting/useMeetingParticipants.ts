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

export function useMeetingParticipants(chatId: string, meetingId?: string): MeetingParticipantInfo[] {
    const [members, setMembers] = React.useState<MeetingParticipantInfo[]>([])

    React.useEffect(() => {
        setMembers([])
        if (!meetingId) return

        let alive = true
        let timer: ReturnType<typeof setInterval> | null = null

        const load = async () => {
            try {
                const client = ClientManager.getActiveClient()
                const session = ClientManager.getActiveSession()
                if (!client || !session) return
                const r = await MeetingApi.getMeetingParticipants(client, {
                    access_token: session.token,
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