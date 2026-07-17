import { dialog, Dialog, NavigationDrawer, TextField } from "mdui"
import ClientManager from "../ClientManager.ts"
import ClientSettingsDialog from "./ClientSettingsDialog.tsx"
import UserMain from "./UserMain.tsx"
import React from 'react'
import { IUser } from "lingcat-protocol"

export default function Main() {
    const mSettingsDialog = React.useRef<Dialog>(undefined)
    const mLoginDialog = React.useRef<Dialog>(undefined)

    const [profile, setProfile] = React.useState<IUser>()

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
            {
                (ClientManager.listUserSessions().length == 0 || ClientManager.listServerPublicKeys().length == 0 || ClientManager.getActiveUserSessionName() == null)
                    ? <div style={{
                        display: 'flex',
                        flex: 1,
                        justifyContent: 'center',
                    }}>
                        <div style={{
                            alignSelf: 'center',
                        }}>
                            <mdui-button onClick={() => mSettingsDialog.current!.open = true}>打开设置</mdui-button>
                            <div style={{ height: '10px' }}></div>
                            <mdui-button onClick={() => document.location.reload()}>刷新页面</mdui-button>
                        </div>
                    </div>
                    : <UserMain mLoginDialog={mLoginDialog} mSettingsDialog={mSettingsDialog} profile={profile} setProfile={setProfile} drawerRef={drawerRef} />
            }

            <ClientSettingsDialog
                mLoginDialog={mLoginDialog}
                mSettingsDialog={mSettingsDialog} />
        </mdui-layout>
    )
}
