import React from "react"
import { useIsMobile } from "../../lib/useIsMobile.ts"
import { DesktopRootLayout } from "./DesktopRootLayout.tsx"
import { MobileRootLayout } from "./MobileRootLayout.tsx"
import Avatar from "../Avatar.tsx"
import { useAsyncEffect } from "../../lib/useAsyncEffect.ts"
import { IUser, LingCatProto, Methods, Package } from "lingcat-protocol"
import { FileApi, UserApi } from "lingcat-client-protocol"
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
import { MobileMeetingDialog } from "../meeting/MobileMeetingDialog.tsx"
import { DesktopMeetingWindow } from "../meeting/DesktopMeetingWindow.tsx"
import { useMeetingStore } from "../meeting/MeetingManager.ts"
import { checkServer, acceptServerPublicKey } from '../../lib/trustServer.ts'
import { confirmTrust } from '../../lib/confirmTrust.tsx'
import { bytesToHex } from 'lingcat-shared'
import LingCatClient from 'lingcat-client-protocol'

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

    // ============================================================
    //  会议事件监听（client 就绪后注册）
    // ============================================================
    React.useEffect(() => {
        if (!client) return

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
                }
            } catch (e) {
                console.warn('[Meeting] 处理会议事件失败', e)
            }
        }

        client.addOnReceiveListener(onMeetingEvent)
        return () => client.removeOnReceiveListener(onMeetingEvent)
    }, [client])

    const isMobile = useIsMobile()

    const [navValue, setNavValue] = React.useState<ChatListShow>('recents')

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

    const chatListFragment = <ChatListFragment
        show={navValue}
        activeChatId={activeChatId}
    />
    const mainContent = (
        <>
            {
                isMobile && <div style={{
                    paddingLeft: '10px',
                    paddingRight: '10px',
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
                <MobileRootLayout
                    topBar={
                        <mdui-top-app-bar>
                            <div style={{ width: '3px' }}></div>
                            <mdui-top-app-bar-title>灵猫</mdui-top-app-bar-title>
                            <div style={{ flexGrow: 1 }}></div>
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
            </>

            : <>
                <DesktopRootLayout
                    navTop={avatarIconMenuItem}
                    navBottom={
                        <mdui-button-icon icon="settings" slot="bottom" onClick={() => ClientSettingsDialog.show()}></mdui-button-icon>
                    }
                    navItems={navItems}
                    navValue={navValue}
                    onNavValueChange={(v) => setNavValue(v as any)}
                    list={chatListFragment}
                    main={mainContent} />
                <DesktopMeetingWindow />
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