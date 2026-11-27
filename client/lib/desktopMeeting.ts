import { MeetingApi } from 'lingcat-client-protocol'
import { bytesToHex } from 'lingcat-shared'
import ClientManager from '../ClientManager.ts'
import { useMeetingStore } from '../ui/meeting/MeetingManager.ts'

/** 当前是否运行在自带原生会议窗口的桌面端（Electron + preload 桥接）。 */
export function isNativeMeetingDesktop(): boolean {
    return !!window.lingcatDesktop?.isDesktop
}

function buildHandoff(chatId: string, meetingId?: string, title?: string): LingcatDesktopHandoff {
    const session = ClientManager.getActiveSession()
    if (!session) throw new Error('尚未登录')
    const publicKey = ClientManager.getServerPublicKey(session.server)
    if (!publicKey) throw new Error('缺少服务端公钥')

    return {
        chatId,
        meetingId,
        title,
        session: {
            server: session.server,
            userId: session.userId,
            account: session.account,
            nickname: session.nickname,
            token: session.token,
        },
        publicKeyHex: bytesToHex(publicKey),
    }
}

/** 打开（或聚焦）独立原生会议窗口。 */
export async function openNativeMeeting(chatId: string, meetingId?: string, title?: string): Promise<void> {
    const bridge = window.lingcatDesktop
    if (!bridge) throw new Error('桌面端桥接不可用')
    await bridge.openMeeting(buildHandoff(chatId, meetingId, title))
}

/** 在服务端发起会议，然后打开独立会议窗口（本窗口不加入 LiveKit）。 */
export async function startNativeMeeting(
    chat: { id: string, title?: string | null },
    title?: string,
): Promise<void> {
    const client = ClientManager.getActiveClient()
    if (!client) throw new Error('尚未连接服务器')
    const session = ClientManager.getActiveSession()
    if (!session) throw new Error('尚未登录')

    const meetingTitle = title?.trim() || chat.title?.trim() || undefined
    const res = await MeetingApi.startMeeting(client, {
        access_token: session.token,
        chat_id: chat.id,
        title: meetingTitle,
    })

    useMeetingStore.getState().onMeetingStarted({
        chatId: chat.id,
        meetingId: res.meeting_id,
        room: res.room,
        starterUserId: res.starter_user_id,
        title: meetingTitle ?? null,
    })

    await openNativeMeeting(chat.id, res.meeting_id, meetingTitle)
}
