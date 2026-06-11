import { dialog, Dialog } from "mdui"
import ClientManager from "./ClientManager.ts"
import SettingsDialog from "./SettingsDialog.tsx"
import UserMain from "./UserMain.tsx"
import React from 'react'

export default function Main() {
    const mSettingsDialog = React.useRef<Dialog>(undefined)

    React.useEffect(() => {
        if (ClientManager.listServerPublicKeys().length == 0)
            dialog({
                headline: "提示",
                body: "为了与服务端进行安全通信, 请从安全渠道获取对应服务器的公钥, 并添加到客户端中, 随后请刷新此网页继续.",
                closeOnEsc: true,
                closeOnOverlayClick: true,
                actions: [{
                    text: "打开设置",
                    variant: 'tonal',
                    onClick: () => mSettingsDialog.current!.open = true
                }]
            })
    }, [])

    return (
        <mdui-layout>
            <mdui-top-app-bar>
                <mdui-top-app-bar-title>灵猫</mdui-top-app-bar-title>
                <div style={{ flexGrow: 1 }}></div>
                <mdui-button-icon icon="settings" onClick={() => mSettingsDialog.current!.open = true}></mdui-button-icon>
                <mdui-button-icon icon="more_vert"></mdui-button-icon>
            </mdui-top-app-bar>

            <SettingsDialog ref={mSettingsDialog} />
        </mdui-layout>
    )
}
