import React from "react"
import { AnimatePresence } from "motion/react"
import ConnectionStatusBar from '../ConnectionStatusBar.tsx'
import { useIsMobile } from "../../lib/useIsMobile.ts"
import { DesktopRootLayout } from "./DesktopRootLayout.tsx"
import { MobileRootLayout } from "./MobileRootLayout.tsx"
import Avatar from "../Avatar.tsx"
import { useAsyncEffect } from "../../lib/useAsyncEffect.ts"
import { IUser, LingCatProto, Methods, Package } from "lingcat-protocol"
import { ChatApi, FileApi, UserApi } from "lingcat-client-protocol"
import ClientManager from "../../ClientManager.ts"
import tipError from "../tipError.ts"
import default_avatar from '../../default_avatar.png'
import getFileUrl from "../../lib/getFileUrl.ts"
import SessionEnv from "../../SessionEnv.ts"
import { Outlet, useMatchRoute, useNavigate } from "@tanstack/react-router"
import ChangePasswordDialog from "../main/ChangePasswordDialog.tsx"
import UserProfileDialog from "../viewer/UserProfileDialog.tsx"
import { ChatListFragment, ChatListShow } from "../main/ChatListFragment.tsx"
import SwitchUserDialog from "../main/SwitchUserDialog.tsx"
import ClientSettingsDialog from "../main/ClientSettingsDialog.tsx"
import { BuildInfoFooter } from "../BuildInfo.tsx"
import { MobileMeetingDialog } from "../meeting/MobileMeetingDialog.tsx"
import { DesktopMeetingWindow } from "../meeting/DesktopMeetingWindow.tsx"
import { MeetingView } from "../meeting/MeetingView.tsx"
import { MeetingBall } from "../meeting/MeetingBall.tsx"
import { useMeetingUIStore } from "../meeting/MeetingUIStore.ts"
import { useMeetingStore } from "../meeting/MeetingManager.ts"
import { checkServer, acceptServerPublicKey } from '../../lib/trustServer.ts'
import { confirmTrust } from '../../lib/confirmTrust.tsx'
import { bytesToHex } from 'lingcat-shared'
import LingCatClient from 'lingcat-client-protocol'
import ProfileCache from "../../ProfileCache.ts"
import ClientConfig from "../../ClientConfig.ts"
import RemarksCache from "../../RemarksCache.ts"
import OpenChatDialog from "../main/OpenChatDialog.tsx"
import CreateGroupDialog from "../main/CreateGroupDialog.tsx"
import { useChatMessageStore } from "../chat/useChatMessageStore.ts"

const navItems = [
    {
        value: "recents",
        icon: "watch_later--outlined",
        activeIcon: 'watch_later',
        label: '最近',
    },
    {
        value: "favourites",
        icon: "favorite_border",
        activeIcon: 'favorite',
        label: '收藏',
    },
    {
        value: "chats",
        icon: "chat--outlined",
        activeIcon: 'chat',
        label: '全部',
    },
    {
        value: "search",
        icon: "search",
        activeIcon: 'search',
        label: '搜索',
    },
]

/**
 * 判断错误是否是"token 失效"。
 * 服务端返回的形式可能是:
 *   - 字符串 "[401] 令牌错误! (JsonWebTokenError: invalid signature)"
 *   - Error 对象带 message
 *   - 带 code 字段
 */
function isTokenError(e: any): boolean {
    if (!e) return false
    // const msg = String(e?.message ?? e)
    return (
        /*msg.includes('401') ||
        msg.includes('令牌错误') ||
        msg.includes('JsonWebTokenError') ||
        msg.includes('invalid signature') ||
        msg.includes('Token is invalid') ||
        msg.includes('Unauthorized') ||*/
        e?.code === 401
    )
}

export function UserMainLayout({ children }: { children: React.ReactNode }) {
    const matchRoute = useMatchRoute()
    const chatMatch = matchRoute({ to: '/chat/$chatId' })
    const activeChatId = chatMatch ? chatMatch.chatId : undefined

    const navigate = useNavigate()

    const [loaded, setLoaded] = React.useState(false)
    const [profile, setProfile] = React.useState<IUser>()
    const [client, setClient] = React.useState<LingCatClient | null>(null)
    const [reloadKey, setReloadKey] = React.useState(0)

    // ============================================================
    //  初始化（可重跑：reloadKey 变化时）
    // ============================================================
    useAsyncEffect(async (signal) => {
        setLoaded(false)
        setClient(null)

        let session: ReturnType<typeof ClientManager.getOrInitActiveSession>
        try {
            session = ClientManager.getOrInitActiveSession()
            if (!session) throw new Error('no active session')

            const c = ClientManager.createClient(session.server)
            if (signal.aborted) return

            await new Promise<void>((resolve, reject) => {
                c.onInit = async () => {
                    try {
                        await UserApi.authorize(c, {
                            access_token: session!.token,
                            session_id: ClientManager.getConnectionSessionId()!,
                        })
                        resolve()
                    } catch (e) { reject(e) }
                }
                // 监听握手失败（字段赋值，需与 LingCatClient 内的字段定义一致）
                c.onHandshakeFailed = (reason: string) => reject(new Error(reason))
                c.init()
            })

            if (signal.aborted) return

            const REFRESH_INTERVAL = 30 * 60 * 1000
            const refreshFileToken = async () => {
                try {
                    const token = await FileApi.requestAccessUploadFileToken(c, {
                        access_token: session!.token,
                    })
                    if (signal.aborted) return
                    SessionEnv.myFileAccessToken = token
                } catch (e) {
                    console.warn('[UserMainLayout] refresh file token failed', e)
                }
            }

            await refreshFileToken()
            if (signal.aborted) return

            const timer = setInterval(refreshFileToken, REFRESH_INTERVAL)
            signal.addEventListener('abort', () => clearInterval(timer), { once: true })

            const me = await UserApi.queryMyUserInfo(c, {
                access_token: session.token,
            })
            if (signal.aborted) return

            setProfile(me)
            SessionEnv.myUserId = me.id
            setClient(c)
            setLoaded(true)
        } catch (e: any) {
            if (signal.aborted) return

            // ★ 公钥不匹配 → 弹 TOFU 对话框 → 用户接受后重试
            if (e?.message === 'server_public_key_mismatch' && session!) {
                await handleTofuMismatch(session.server)
                return
            }

            // ★ token 失效 → 清掉失效账号 + 跳登录
            if (isTokenError(e) && session!) {
                ClientManager.removeUserSession(session.key)
                tipError(e, '登录已失效，请重新登录')
                navigate({
                    to: '/login',
                    search: {
                        redirect: location.pathname + location.search,
                    },
                })
                return
            }

            tipError(e, '加载资料失败')
        }
    }, [reloadKey])

    // ============================================================
    //  TOFU mismatch 处理
    // ============================================================
    const handleTofuMismatch = React.useCallback(async (rawServer: string) => {
        try {
            const check = await checkServer(rawServer)
            const oldKey = ClientManager.getServerPublicKey(check.addr)

            const ok = await confirmTrust({
                mode: 'mismatch',
                rawAddr: rawServer,
                publicKeyHex: check.publicKeyHex,
                oldPublicKeyHex: oldKey ? bytesToHex(oldKey) : undefined,
            })

            if (!ok) {
                tipError(new Error('已拒绝新公钥，无法连接'), '连接失败')
                return
            }

            acceptServerPublicKey(check.addr, check.publicKeyHex)
            // 触发重试
            setReloadKey(k => k + 1)
        } catch (e) {
            tipError(e, '检查服务端公钥失败')
        }
    }, [])

    React.useEffect(() => {
        if (!client) return

        // ============================================================
        //  会议事件
        // ============================================================
        const onMeetingEvent = (pkg: Package) => {
            try {
                if (pkg.method_id === Methods.Meeting_Started_Event) {
                    const ev = LingCatProto.methods.Meeting_Started_Event.decode(pkg.data)
                    useMeetingStore.getState().onMeetingStarted({
                        chatId: ev.chatId,
                        meetingId: ev.meetingId,
                        room: ev.room,
                        starterUserId: ev.starterUserId,
                        title: ev.title ?? undefined,
                    })
                } else if (pkg.method_id === Methods.Meeting_Ended_Event) {
                    const ev = LingCatProto.methods.Meeting_Ended_Event.decode(pkg.data)
                    useMeetingStore.getState().onMeetingEnded({
                        chatId: ev.chatId,
                        meetingId: ev.meetingId,
                    })
                } else if (pkg.method_id === Methods.Meeting_Title_Changed_Event) {
                    const ev = LingCatProto.methods.Meeting_Title_Changed_Event.decode(pkg.data)
                    useMeetingStore.getState().onMeetingTitleChanged({
                        chatId: ev.chatId,
                        meetingId: ev.meetingId,
                        title: ev.title,
                    })
                }
            } catch (e) {
                console.warn('[Meeting] 处理会议事件失败', e)
            }
        }

        // ============================================================
        //  备注变更事件（多设备同步）
        // ============================================================
        const onRemarksEvent = (pkg: Package) => {
            if (pkg.method_id === Methods.User_Remarks_Changed_Event) {
                RemarksCache.refresh().catch(() => { })
            }
        }

        client.addOnReceiveListener(onMeetingEvent)
        client.addOnReceiveListener(onRemarksEvent)

        // 首屏加载备注
        RemarksCache.loadAll().catch(() => { })

        return () => {
            client.removeOnReceiveListener(onMeetingEvent)
            client.removeOnReceiveListener(onRemarksEvent)
        }
    }, [client])

    useAsyncEffect(async (signal) => {
        if (!activeChatId) return void (document.title = ClientConfig.site_title)
        const chat = await ProfileCache.queryChatInfo(activeChatId)
        document.title = ClientConfig.site_title + ' | ' + (chat.peer_user_id ? (RemarksCache.get(chat.peer_user_id) || chat.title) : chat?.title)
    }, [activeChatId])

    React.useEffect(() => {
        const activeClient = ClientManager.getActiveClient()
        if (!activeClient) return

        async function onPackage(mPackage: Package) {
            if (mPackage.method_id !== Methods.Receive_Chat_Message_Event) return

            const data = LingCatProto.methods.Receive_Chat_Message_Event.decode(mPackage.data)
            const msg = data.msg
            if (!msg || !msg.chatId) return

            // 1. 自己发的消息不提醒
            if (msg.senderUserId === profile?.id) return
            // 2. 正在该聊天窗口不提醒
            if (msg.chatId === activeChatId) return

            // 3. 群聊且既没有 @ 我，也没有回复我，不提醒
            const chat = await ProfileCache.queryChatInfo(msg.chatId)
            if (chat.type === 'group') {
                // 判断是否 @ 了我
                const isMentioned = msg.entities?.some((v) => v.type === 'user_mention' && v.data === profile?.id)

                // 判断是否回复了我（带本地+远程兜底）
                let isReplied = false
                const replyEntity = msg.entities?.find((v) => v.type === 'reply')

                if (replyEntity?.data) {
                    const targetSeq = Number(replyEntity.data)
                    // 1. 先查本地 Zustand 缓存
                    let targetMsg = useChatMessageStore.getState().messageMap.get(targetSeq)

                    // 2. 本地没找到 → 异步请求服务端兜底（防止消息没加载到本地）
                    if (!targetMsg && activeClient) {
                        const session = ClientManager.getActiveSession()
                        if (session) {
                            try {
                                // 利用 before 游标查单条：拉取 seq <= targetSeq 的最新 1 条
                                const fetched = await ChatApi.getChatMessages(activeClient, {
                                    access_token: session.token,
                                    chat_id: msg.chatId,
                                    before: targetSeq + 1,
                                    limit: 1,
                                })
                                targetMsg = fetched.find(m => m.id === targetSeq)
                            } catch (e) {
                                // 兜底请求失败，静默忽略
                            }
                        }
                    }

                    isReplied = targetMsg?.sender_user_id === profile?.id
                }

                // 既没艾特我，也没回复我，直接退出，不弹通知
                if (!isMentioned && !isReplied) return
            }

            // ============================================================
            //  4. 浏览器系统通知 (Notification)
            // ============================================================
            if (Notification.permission === 'granted'/*  && document.visibilityState === 'hidden' */) {
                const senderId = msg.senderUserId
                const sender = senderId ? await ProfileCache.queryUserInfo(senderId) : null
                const senderName = senderId ? (RemarksCache.get(senderId) || sender?.nickname || sender?.username || senderId) : '未知'

                const chatTitle = (chat.peer_user_id && RemarksCache.get(chat.peer_user_id)) || chat.title || '对话'

                // 解析消息摘要 (处理加密和附件)
                let bodyText = msg.text || ''
                if (msg.entities?.some(e => e.type === 'e2e')) {
                    bodyText = '🔒 [加密消息]'
                } else if (msg.entities?.some(e => ['file', 'image', 'audio', 'video'].includes(e.type!))) {
                    const e = msg.entities.find(e => ['file', 'image', 'audio', 'video'].includes(e.type!))
                    if (e) bodyText = `[${e.type === 'image' ? '图片' : e.type === 'video' ? '视频' : e.type === 'audio' ? '语音' : '文件'}] ${bodyText}`.trim()
                }

                // 发送者头像
                const iconUrl = sender?.avatar_file_hash
                    ? getFileUrl(sender.avatar_file_hash, SessionEnv.myFileAccessToken)
                    : default_avatar

                const notification = new Notification(`${ClientConfig.site_title} | ${chatTitle}`, {
                    body: `${senderName}: ${bodyText}`,
                    icon: iconUrl,
                    tag: msg.chatId, // 同一个聊天的通知会合并/覆盖，而不是刷屏
                })

                notification.onclick = () => {
                    window.focus()
                    navigate({
                        to: '/chat/$chatId',
                        params: { chatId: msg.chatId! },
                    })
                    notification.close()
                }
            }
        }

        activeClient.addOnReceiveListener(onPackage)
        return () => activeClient.removeOnReceiveListener(onPackage)
    }, [activeChatId, navigate, profile?.id])

    React.useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            // 延迟几秒请求，避免影响页面初始加载体验
            const timer = setTimeout(() => {
                Notification.requestPermission()
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [])

    const isMobile = useIsMobile()

    const [navValue, setNavValue] = React.useState<ChatListShow>('recents')

    // ============================================================
    //  会议分栏 (桌面端: 会议在左, 聊天在右)
    // ============================================================
    const meetingUIOpen = useMeetingUIStore(s => s.isOpen)
    const meetingMinimized = useMeetingUIStore(s => s.isMinimized)
    const meetingSplit = useMeetingUIStore(s => s.split)
    const meetingSplitWidth = useMeetingUIStore(s => s.splitWidthPercent)
    const setMeetingSplitWidth = useMeetingUIStore(s => s.setSplitWidthPercent)
    const closeMeetingUI = useMeetingUIStore(s => s.close)
    const meetingActive = useMeetingStore(s => s.phase !== 'idle' || !!s.room)
    const showSplit = !isMobile && meetingSplit && meetingUIOpen && meetingActive

    const splitPanel = showSplit ? (
        <MeetingView
            onClose={closeMeetingUI}
            headerExtra={
                <>
                    <mdui-tooltip content="最小化">
                        <mdui-button-icon
                            icon="minimize"
                            onClick={() => useMeetingUIStore.getState().setMinimized(true)}
                        />
                    </mdui-tooltip>
                    <mdui-tooltip content="切换为悬浮窗">
                        <mdui-button-icon
                            icon="picture_in_picture_alt"
                            onClick={() => useMeetingUIStore.getState().setSplit(false)}
                        />
                    </mdui-tooltip>
                </>
            }
        />
    ) : undefined

    const avatarIconMenuItem = loaded ? (
        <mdui-dropdown trigger="click" slot={isMobile ? undefined : 'top'}>
            <Avatar
                slot="trigger"
                src={profile?.avatar_file_hash
                    ? getFileUrl(profile.avatar_file_hash, SessionEnv.myFileAccessToken)
                    : default_avatar}
            />
            <mdui-menu>
                <mdui-menu-item icon="info" onClick={() => UserProfileDialog.show(profile?.id!)}>我的资料</mdui-menu-item>
                <mdui-menu-item icon="switch_account" onClick={() => SwitchUserDialog.show()}>切换账号</mdui-menu-item>
                <mdui-menu-item icon="edit" onClick={() => ChangePasswordDialog.show()}>修改密码</mdui-menu-item>
            </mdui-menu>
        </mdui-dropdown>
    ) : null

    const addMenu = loaded ? (
        <mdui-dropdown trigger="click" slot={isMobile ? undefined : 'top'}>
            <mdui-button-icon icon="add" slot="trigger" />
            <mdui-menu>
                <mdui-menu-item
                    icon="open_in_new"
                    onClick={() => OpenChatDialog.show()}
                >
                    打开对话
                </mdui-menu-item>
                <mdui-menu-item
                    icon="group_add"
                    onClick={() => CreateGroupDialog.show()}
                >
                    创建群组
                </mdui-menu-item>
            </mdui-menu>
        </mdui-dropdown>
    ) : null

    const chatListFragment = <ChatListFragment
        show={navValue}
        activeChatId={activeChatId}
        showBuildInfoFooter={isMobile}
        client={client}
    />
    const mainContent = (
        <>
            {
                isMobile && <div style={{
                    paddingLeft: '10px',
                    paddingRight: '10px',
                    height: '100%',
                }}>
                    {chatListFragment}
                </div>
            }
            <Outlet />
        </>
    )

    return loaded
        ? (isMobile
            ? <>
                <ConnectionStatusBar client={client} />
                <MobileRootLayout
                    topBar={
                        <mdui-top-app-bar>
                            <div style={{ width: '3px' }}></div>
                            <mdui-top-app-bar-title>灵猫</mdui-top-app-bar-title>
                            <div style={{ flexGrow: 1 }}></div>
                            {addMenu}
                            <mdui-button-icon icon="settings" onClick={() => ClientSettingsDialog.show()}></mdui-button-icon>
                            {avatarIconMenuItem}
                            <div style={{ width: '3px' }}></div>
                        </mdui-top-app-bar>
                    }
                    navItems={navItems}
                    navValue={navValue}
                    onNavValueChange={(v) => setNavValue(v as any)}
                    main={mainContent} />
                <MobileMeetingDialog />
                <AnimatePresence>{meetingUIOpen && meetingActive && meetingMinimized && <MeetingBall key="meeting-ball" />}</AnimatePresence>
            </>

            : <>
                <ConnectionStatusBar client={client} />
                <DesktopRootLayout
                    navTop={[
                        avatarIconMenuItem,
                        addMenu,
                    ]}
                    navBottom={
                        <mdui-button-icon icon="settings" slot="bottom" onClick={() => ClientSettingsDialog.show()}></mdui-button-icon>
                    }
                    navItems={navItems}
                    navValue={navValue}
                    onNavValueChange={(v) => setNavValue(v as any)}
                    list={chatListFragment}
                    listFooter={<BuildInfoFooter />}
                    main={mainContent}
                    dockedPanel={splitPanel}
                    dockedPanelHidden={meetingMinimized}
                    dockPercent={meetingSplitWidth}
                    onDockPercentChange={setMeetingSplitWidth} />
                <DesktopMeetingWindow />
                <AnimatePresence>{meetingUIOpen && meetingActive && meetingMinimized && <MeetingBall key="meeting-ball" />}</AnimatePresence>
            </>
        )
        : <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
        }}>
            <mdui-circular-progress></mdui-circular-progress>
        </div>
}
