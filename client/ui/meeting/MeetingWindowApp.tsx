import React from 'react'
import { FileApi, UserApi } from 'lingcat-client-protocol'
import { LingCatProto, Methods, Package } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'
import ClientConfigInstance from '../../ClientConfig.ts'
import AppState from '../AppState.ts'
import PwaTitleBar from '../PwaTitleBar.tsx'
import { MeetingManager, useMeeting } from './MeetingManager.ts'
import MeetingPanel from './MeetingDialog.tsx'
import { MeetingWindowManager, type MeetingWindowRequest } from './MeetingWindow.ts'

async function bootstrapSession() {
    const sessionName = ClientManager.getActiveUserSessionName()
    if (!sessionName || ClientManager.listUserSessions().length == 0)
        throw new Error('尚未登录, 请先回到灵猫主窗口登录')

    ClientManager.initClient(sessionName)

    ClientManager.client.addOnReceiveListener((mPackage: Package) => {
        try {
            if (mPackage.method_id == Methods.Meeting_Ended_Event) {
                MeetingManager.onMeetingEnded(LingCatProto.methods.Meeting_Ended_Event.decode(mPackage.data))
            }
        } catch (e) {
            console.warn('[Meeting] 处理会议结束事件失败', e)
        }
    })

    await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('连接服务器超时, 请检查网络后重试')), 30000)
        ClientManager.client.onInit = async () => {
            try {
                await UserApi.authorize(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    session_id: 'meeting-' + Date.now() + '-' + Math.random().toString(36).slice(2),
                })
                clearTimeout(timer)
                AppState.myId = (await ClientManager.getMe()).id
                resolve()
            } catch (e) {
                clearTimeout(timer)
                reject(e)
            }
        }
    })

    const updateFileAccessToken = async () => {
        AppState.fileAccessToken = await FileApi.requestAccessUploadFileToken(ClientManager.client, {
            access_token: ClientManager.getActiveUserSession().token,
        })
    }
    try { await updateFileAccessToken() } catch (e) { console.warn('[Meeting] 获取文件访问 token 失败', e) }
    setInterval(() => { updateFileAccessToken().catch(() => { }) }, 1000 * 60 * 30)
}

const centeredStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '24px',
    textAlign: 'center',
    background: 'rgb(var(--mdui-color-surface))',
    color: 'rgb(var(--mdui-color-on-surface))',
}

export default function MeetingWindowApp({ req }: { req: MeetingWindowRequest }) {
    const meeting = useMeeting()

    const [stage, setStage] = React.useState<'boot' | 'live' | 'error'>('boot')
    const [error, setError] = React.useState<string>()
    const [closed, setClosed] = React.useState(false)
    const startedRef = React.useRef(false)

    const meetingTitle = req.title ? req.title + ' · 会议' : '会议'

    React.useEffect(() => {
        document.title = (req.title ? req.title + ' · ' : '') + '会议 | ' + ClientConfigInstance.title
    }, [req.title])

    React.useEffect(() => {
        MeetingWindowManager.post('meeting-window-opened', req.chatId)
        const onUnload = () => MeetingWindowManager.post('meeting-window-closed', req.chatId)
        window.addEventListener('pagehide', onUnload)
        window.addEventListener('beforeunload', onUnload)
        return () => {
            window.removeEventListener('pagehide', onUnload)
            window.removeEventListener('beforeunload', onUnload)
            onUnload()
        }
    }, [req.chatId])

    React.useEffect(() => {
        if (startedRef.current) return
        startedRef.current = true
        ; (async () => {
            try {
                await bootstrapSession()
                await MeetingManager.startMeeting({ id: req.chatId, title: req.title })
                setStage('live')
            } catch (e: any) {
                console.error('[Meeting] 独立窗口入会失败', e)
                setError(e?.message || String(e))
                setStage('error')
            }
        })()
    }, [])

    React.useEffect(() => {
        if (stage != 'live') return
        if (meeting.isActive()) return
        setClosed(true)
        const timer = setTimeout(() => {
            try { window.close() } catch (e) { }
        }, 2500)
        return () => clearTimeout(timer)
    }, [stage, meeting.phase, meeting.room, meeting.error])

    const closeWindow = () => {
        try { window.close() } catch (e) { }
    }

    if (stage == 'error') {
        return <>
            <PwaTitleBar title="会议" />
            <div style={centeredStyle}>
                <div style={{ fontSize: '15px' }}>无法进入会议</div>
                <div style={{ fontSize: '13px', opacity: 0.7, maxWidth: '420px' }}>{error}</div>
                <mdui-button onClick={closeWindow}>关闭</mdui-button>
            </div>
        </>
    }

    if (closed) {
        return <>
            <PwaTitleBar title="会议" />
            <div style={centeredStyle}>
                <div style={{ fontSize: '15px' }}>已退出会议</div>
                <div style={{ fontSize: '13px', opacity: 0.7 }}>即将自动关闭</div>
                <mdui-button onClick={closeWindow}>立即关闭</mdui-button>
            </div>
        </>
    }

    if (stage == 'boot') {
        return <>
            <PwaTitleBar title={meetingTitle} />
            <div style={centeredStyle}>
                <mdui-circular-progress />
                <div style={{ fontSize: '13px', opacity: 0.7 }}>正在进入会议...</div>
            </div>
        </>
    }

    return <>
        <PwaTitleBar title={meetingTitle} />
        <MeetingPanel mode="window" />
    </>
}
