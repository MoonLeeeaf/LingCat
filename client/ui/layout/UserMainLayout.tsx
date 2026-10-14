import React from "react"
import { useIsMobile } from "../../lib/useIsMobile.ts"
import { DesktopRootLayout } from "./DesktopRootLayout.tsx"
import { MobileRootLayout } from "./MobileRootLayout.tsx"
import Avatar from "../Avatar.tsx"
import { useAsyncEffect } from "../../useAsyncEffect.ts"
import { IUser } from "lingcat-protocol"
import { FileApi, UserApi } from "lingcat-client-protocol"
import ClientManager from "../../ClientManager.ts"
import tipError from "../tipError.ts"
import default_avatar from '../../default_avatar.png'
import getFileUrl from "../../lib/getFileUrl.ts"
import SessionEnv from "../../SessionEnv.ts"
import { NavigationDrawer } from "mdui"
import { Outlet, useNavigate } from "@tanstack/react-router"

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
] as const

export function UserMainLayout({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate()

    const [loaded, setLoaded] = React.useState(false)
    const [profile, setProfile] = React.useState<IUser>()
    useAsyncEffect(async (signal) => {
        try {
            const session = ClientManager.getOrInitActiveSession()
            if (!session) throw new Error('no active session')

            const client = ClientManager.createClient(session.server)
            if (signal.aborted) return

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
                client.init()
            })

            if (signal.aborted) return

            const REFRESH_INTERVAL = 30 * 60 * 1000

            const refreshFileToken = async () => {
                try {
                    const token = await FileApi.requestAccessUploadFileToken(client, {
                        access_token: session.token,
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

            const me = await UserApi.queryMyUserInfo(client, {
                access_token: session.token,
            })
            if (signal.aborted) return

            setProfile(me)

            SessionEnv.myUserId = me.id

            setLoaded(true)
        } catch (e) {
            if (!signal.aborted) tipError(e, '加载资料失败')
        }
    }, [])

    const isMobile = useIsMobile()

    const [navValue, setNavValue] = React.useState('recents')
    const drawerRef = React.useRef<NavigationDrawer>(undefined)

    const avatarIconMenuItem = loaded ? (
        <mdui-dropdown trigger="click" slot={isMobile ? undefined : 'top'}>
            <Avatar
                slot="trigger"
                src={profile?.avatar_file_hash
                    ? getFileUrl(profile.avatar_file_hash, SessionEnv.myFileAccessToken)
                    : default_avatar}
            />
            <mdui-menu>
                <mdui-menu-item icon="info" onClick={() => navigate({ to: '/user/$userId', params: { userId: profile?.id! } })}>我的资料</mdui-menu-item>
                <mdui-menu-item icon="switch_account" onClick={() => SwitchUserDialog.show()}>切换账号</mdui-menu-item>
                <mdui-menu-item icon="edit" onClick={() => ChangePasswordDialog.show()}>修改密码</mdui-menu-item>
            </mdui-menu>
        </mdui-dropdown>
    ) : null

    return loaded
        ? (isMobile
            ? <MobileRootLayout
                topBar={
                    <mdui-top-app-bar>
                        <div style={{ width: '3px' }}></div>
                        <mdui-top-app-bar-title>灵猫</mdui-top-app-bar-title>
                        <div style={{ flexGrow: 1 }}></div>
                        <mdui-button-icon icon="settings"></mdui-button-icon>

                        {avatarIconMenuItem}
                        <div style={{ width: '3px' }}></div>
                    </mdui-top-app-bar>
                }
                navItems={navItems}
                navValue={navValue}
                onNavValueChange={setNavValue}
                main={<>
                    <Outlet />
                </> /** Chat List */} />

            : <DesktopRootLayout
                drawerRef={drawerRef}
                navTop={avatarIconMenuItem}
                navBottom={
                    <mdui-button-icon icon="settings" slot="bottom"></mdui-button-icon>
                }
                navItems={navItems}
                navValue={navValue}
                onNavValueChange={setNavValue}
                list={undefined /** List */}
                main={<>
                    <Outlet />
                </> /** ChatFragment */} />)
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
