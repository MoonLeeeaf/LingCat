import { dialog, Dialog, NavigationDrawer, TextField } from "mdui"
import ClientManager from "../ClientManager.ts"
import ClientSettingsDialog from "./ClientSettingsDialog.tsx"
import UserMain from "./UserMain.tsx"
import React from 'react'

export default function Main() {
    const mSettingsDialog = React.useRef<Dialog>(undefined)
    const mLoginDialog = React.useRef<Dialog>(undefined)

    const drawerRef = React.useRef<NavigationDrawer>(undefined)

    React.useEffect(() => {
        if (ClientManager.listServerPublicKeys().length == 0)
            dialog({
                headline: "提示",
                body: "为了与服务端进行安全通信, 请从安全渠道获取对应服务器的公钥, 并添加到客户端中, 随后请刷新此网页继续.",
                actions: [{
                    text: "打开设置",
                    variant: 'tonal',
                    onClick: () => mSettingsDialog.current!.open = true
                }]
            })
        else
            if (ClientManager.listUserSessions().length == 0) {
                mLoginDialog.current!.open = true
            }
    }, [])

    return (
        <mdui-layout>
            <mdui-top-app-bar>
                <mdui-button-icon icon="menu" onClick={() => {
                    drawerRef.current && (drawerRef.current.open = !drawerRef.current.open)
                }}></mdui-button-icon>
                <mdui-top-app-bar-title style={{ marginLeft: '8px' }}>灵猫</mdui-top-app-bar-title>
                <div style={{ flexGrow: 1 }}></div>
                <mdui-button-icon icon="settings" onClick={() => mSettingsDialog.current!.open = true}></mdui-button-icon>
                <mdui-button-icon icon="more_vert" style={{ marginRight: '4px' }}></mdui-button-icon>
            </mdui-top-app-bar>

            {
                (ClientManager.listUserSessions().length == 0 || ClientManager.listServerPublicKeys().length == 0 || ClientManager.getActiveUserSessionName() == null)
                    ? <div style={{
                        display: 'flex',
                        flex: 1,
                        justifyContent: 'center',
                    }}>
                        <span style={{
                            alignSelf: 'center',
                        }}>
                            如果还未配置服务端公钥, 请打开右上角设置进行配置<br /><br />
                            您还没有登录, 仅可进行设置, 如需登录, 请在配置完服务端公钥后刷新本页面
                        </span>
                    </div>
                    : <UserMain access_token={ClientManager.getActiveUserSessionName()!} drawerRef={drawerRef} />
            }

            <ClientSettingsDialog
                mLoginDialog={mLoginDialog}
                mSettingsDialog={mSettingsDialog} />
        </mdui-layout>
    )
}
