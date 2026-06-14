import { dialog, Dialog, TextField } from "mdui"
import ClientManager from "./ClientManager.ts"
import SettingsDialog from "./SettingsDialog.tsx"
import UserMain from "./UserMain.tsx"
import React from 'react'
import LingCatClient, { UserApi } from 'lingcat-client-protocol'
import showSnackbar from "./showSnackbar.ts"

export default function Main() {
    const mSettingsDialog = React.useRef<Dialog>(undefined)

    const mLoginDialog = React.useRef<Dialog>(undefined)
    const mLoginServer = React.useRef<TextField>(undefined)
    const mLoginAccount = React.useRef<TextField>(undefined)
    const mLoginPassword = React.useRef<TextField>(undefined)

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
            if (ClientManager.listSessionTokens().length == 0) {
                mLoginDialog.current!.open = true
                mLoginServer.current!.value = location.protocol + '//' + location.host
            }
    }, [])

    return (
        <mdui-layout>
            <mdui-top-app-bar>
                <mdui-top-app-bar-title>灵猫</mdui-top-app-bar-title>
                <div style={{ flexGrow: 1 }}></div>
                <mdui-button-icon icon="settings" onClick={() => mSettingsDialog.current!.open = true}></mdui-button-icon>
                <mdui-button-icon icon="more_vert"></mdui-button-icon>
            </mdui-top-app-bar>

            <div style={{
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

            <mdui-dialog ref={mLoginDialog as any}>
                <span slot="headline">登录</span>

                <mdui-text-field label="服务端 HTTP 地址" ref={mLoginServer as any}></mdui-text-field>
                <div style={{ paddingTop: '15px' }}></div>
                <mdui-text-field label="用户名 / 用户 ID" ref={mLoginAccount as any}></mdui-text-field>
                <div style={{ paddingTop: '15px' }}></div>
                <mdui-text-field label="密码" type="password" ref={mLoginPassword as any}></mdui-text-field>


                <mdui-button slot="action" variant="text" onClick={() => mSettingsDialog.current!.open = true}>设置</mdui-button>
                <div slot="action" style={{ flexGrow: 1 }}></div>
                <mdui-button slot="action" variant="text" onClick={() => {
                    const dlg = dialog({
                        headline: "注册",
                        body: `<mdui-text-field label="用户名 (可选)" id="username"></mdui-text-field><div style="padding-top: 15px"></div><mdui-text-field label="昵称" id="nickname"></mdui-text-field><div style="padding-top: 15px"></div><mdui-text-field label="密码" type="password" id="password"></mdui-text-field>`,
                        closeOnEsc: true,
                        closeOnOverlayClick: true,
                        actions: [{
                            text: "取消",
                            onClick: () => true,
                        }, {
                            text: "注册",
                            variant: 'tonal',
                            onClick: async () => {
                                try {
                                    showSnackbar({
                                        message: '注册中...'
                                    })

                                    const client = new LingCatClient({
                                        server_ws: mLoginServer.current!.value,
                                        server_public_key: ClientManager.getServerPublicKey(new URL(mLoginServer.current!.value).host)
                                    })
                                    client.init()

                                    client.onInit = async () => {
                                        // @ts-ignore
                                        const password = dlg.querySelector('#password').value
                                        const userId = await UserApi.register(client, {
                                            password,
                                            // @ts-ignore
                                            nickname: dlg.querySelector('#nickname').value,
                                            // @ts-ignore
                                            username: dlg.querySelector('#username').value,
                                        })

                                        mLoginAccount.current!.value = userId
                                        mLoginPassword.current!.value = password

                                        client.disconnect()
                                    }
                                } catch (e) {
                                    console.log(e)
                                    showSnackbar({
                                        message: '注册失败: ' + e
                                    })
                                }
                            },
                        }]
                    })
                    // @ts-ignore
                    dlg.querySelector('#password').value = mLoginPassword.current!.value
                }}>注册</mdui-button>
                <mdui-button slot="action" variant="tonal" onClick={() => {

                }}>登录</mdui-button>
            </mdui-dialog>

            <SettingsDialog ref={mSettingsDialog} />
        </mdui-layout>
    )
}
