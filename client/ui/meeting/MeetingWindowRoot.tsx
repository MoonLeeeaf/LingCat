import React from 'react'
import ReactDOM from 'react-dom/client'
import { FileApi, UserApi } from 'lingcat-client-protocol'
import { LingCatProto, Methods } from 'lingcat-protocol'
import { hexToBytes } from 'lingcat-shared'

import ClientManager from '../../ClientManager.ts'
import ClientConfigInstance from '../../ClientConfig.ts'
import SessionEnv from '../../SessionEnv.ts'
import { toHttpUrl } from '../../lib/serverAddress.ts'
import { MeetingView } from './MeetingView.tsx'
import { useMeetingStore } from './MeetingManager.ts'
import { useMeetingBallRelay } from './useMeetingBallRelay.ts'

export function mountMeetingWindow(el: HTMLElement) {
    document.documentElement.style.height = '100%'
    document.body.style.height = '100%'
    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'
    document.body.style.background = '#06070f'

    ReactDOM.createRoot(el).render(React.createElement(MeetingWindowRoot))
}

type BootState = 'boot' | 'ready' | 'error'

function MeetingWindowRoot() {
    const bridge = window.lingcatDesktop
    const [state, setState] = React.useState<BootState>('boot')
    const [error, setError] = React.useState('')

    // 向独立悬浮球窗口推送说话者/音量（让它和网页内悬浮球一致）
    const relayChatId = useMeetingStore(s => s.chatId)
    useMeetingBallRelay(relayChatId, state === 'ready')

    const close = React.useCallback(() => {
        try { useMeetingStore.getState().leave() } catch { /* ignore */ }
        bridge?.closeMeeting()
    }, [bridge])

    React.useEffect(() => {
        let cancelled = false
        bridge?.onCloseRequested(() => close())

        ;(async () => {
            try {
                if (!bridge) throw new Error('缺少桌面端桥接')
                const handoff = await bridge.getMeetingHandoff()
                if (!handoff) throw new Error('缺少会议参数')
                if (cancelled) return

                SessionEnv.isOutOfServer = true

                // 用主窗口交接过来的会话在本窗口重建上下文（不依赖跨窗口 sessionStorage）
                ClientManager.setServerPublicKey(handoff.session.server, hexToBytes(handoff.publicKeyHex))
                const session = ClientManager.setUserSession(handoff.session)
                ClientManager.setActiveUserSessionKey(session.key)

                await ClientConfigInstance.initConfig(
                    toHttpUrl(session.server).replace(/\/$/, '') + '/config.json',
                ).catch(() => { })
                if (cancelled) return

                const client = ClientManager.createClient(session.server)
                await new Promise<void>((resolve, reject) => {
                    client.onInit = async () => {
                        try {
                            await UserApi.authorize(client, {
                                access_token: session.token,
                                session_id: ClientManager.getConnectionSessionId()!,
                            })
                            resolve()
                        } catch (e) { reject(e) }
                    }
                    client.onHandshakeFailed = (reason: string) => reject(new Error(reason))
                    client.init()
                })
                if (cancelled) return

                SessionEnv.myUserId = session.userId
                try {
                    SessionEnv.myFileAccessToken = await FileApi.requestAccessUploadFileToken(client, {
                        access_token: session.token,
                    })
                } catch { /* 头像等非关键功能 */ }

                client.addOnReceiveListener((pkg) => {
                    try {
                        if (pkg.method_id === Methods.Meeting_Ended_Event) {
                            const ev = LingCatProto.methods.Meeting_Ended_Event.decode(pkg.data)
                            useMeetingStore.getState().onMeetingEnded({ chatId: ev.chatId, meetingId: ev.meetingId })
                        }
                    } catch { /* ignore */ }
                })

                await useMeetingStore.getState().refreshActiveMeeting(handoff.chatId)
                if (cancelled) return

                const active = useMeetingStore.getState().activeMeetings[handoff.chatId]
                const meetingId = handoff.meetingId || active?.meetingId
                if (!meetingId) throw new Error('缺少会议 ID（会议可能已结束）')

                await useMeetingStore.getState().joinMeeting(
                    handoff.chatId,
                    meetingId,
                    handoff.title || active?.title,
                )
                if (!cancelled) setState('ready')
            } catch (e: any) {
                if (!cancelled) {
                    setError(String(e?.message ?? e))
                    setState('error')
                }
            }
        })()

        return () => { cancelled = true }
    }, [bridge, close])

    if (state === 'boot') {
        return <Center>
            <mdui-circular-progress />
            <div style={{ fontSize: 13, opacity: 0.7 }}>正在进入会议…</div>
        </Center>
    }

    if (state === 'error') {
        return <Center>
            <div style={{ fontSize: 15 }}>无法进入会议</div>
            <div style={{ fontSize: 13, opacity: 0.7, maxWidth: 460, textAlign: 'center' }}>{error}</div>
            <mdui-button variant="tonal" onClick={close}>关闭</mdui-button>
        </Center>
    }

    return <MeetingView
        onClose={close}
        headerExtra={
            <mdui-tooltip content="最小化到悬浮球">
                <mdui-button-icon icon="minimize" onClick={() => bridge?.minimizeMeeting()} />
            </mdui-tooltip>
        }
    />
}

function Center({ children }: { children: React.ReactNode }) {
    return <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        color: 'rgb(var(--mdui-color-on-surface))',
        background: 'rgb(var(--mdui-color-surface))',
    }}>{children}</div>
}
