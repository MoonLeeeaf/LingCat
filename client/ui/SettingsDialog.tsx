import { dialog, Dialog, TextField } from "../../mdui_patched/mdui"
import React from 'react'
import fs from '../fs.ts'
import ClientManager from "../ClientManager.ts"
import useEventListener from "./useEventListener.ts"
import showSnackbar from "./showSnackbar.ts"
import LingCatClient, { UserApi } from "lingcat-client-protocol"

function ServerPublicKeysSettingDialog({ ref }: { ref: any }) {
    const [k, setK] = React.useState(Date.now() + '')

    const mAddKeyDialog = React.useRef<Dialog>(undefined)
    const mAddKeyServerHost = React.useRef<TextField>(undefined)
    const mAddKeyPublicKey = React.useRef<TextField>(undefined)

    useEventListener(mAddKeyDialog, 'closed', () => {
        mAddKeyServerHost.current!.value = ''
        mAddKeyPublicKey.current!.value = ''
    })

    return <>
        <mdui-dialog close-on-overlay-click close-on-esc ref={ref}>
            <span slot="headline">服务端公钥管理</span>

            <mdui-list>
                <mdui-list-item rounded icon="add" onClick={() => mAddKeyDialog.current!.open = true}>添加</mdui-list-item>
                <mdui-list-item rounded icon="refresh" onClick={() => setK(Date.now() + '')}>刷新</mdui-list-item>
                <div key={k}>{
                    ClientManager.listServerPublicKeys().map((fileName) => {
                        return <mdui-dropdown trigger="hover">
                            <mdui-list-item slot="trigger" rounded>{fileName}</mdui-list-item>
                            <mdui-menu>
                                <mdui-menu-item icon="edit" onClick={() => {
                                    mAddKeyServerHost.current!.value = fileName
                                    mAddKeyPublicKey.current!.value = ClientManager.getServerPublicKey(fileName).toString('hex')
                                    mAddKeyDialog.current!.open = true
                                }}>修改</mdui-menu-item>
                                <mdui-menu-item icon="delete" onClick={() => {
                                    dialog({
                                        headline: "提示",
                                        body: "确定要删除 " + fileName + ' 的公钥吗?',
                                        closeOnEsc: true,
                                        closeOnOverlayClick: true,
                                        actions: [{
                                            text: "取消",
                                            onClick: () => true
                                        }, {
                                            text: "确定",
                                            variant: 'tonal',
                                            onClick: () => {
                                                ClientManager.removeServerPublicKey(fileName)
                                                setK(Date.now() + '')
                                                return true
                                            }
                                        }]
                                    })
                                }}>删除</mdui-menu-item>
                            </mdui-menu>
                        </mdui-dropdown>
                    })
                }</div>
            </mdui-list>
        </mdui-dialog>

        <mdui-dialog close-on-overlay-click close-on-esc ref={mAddKeyDialog as any}>
            <span slot="headline">添加服务端公钥</span>

            <mdui-text-field label="服务端 Host (如 127.0.0.1:80)" ref={mAddKeyServerHost as any}></mdui-text-field>
            <div style={{ paddingTop: '15px' }}></div>
            <mdui-text-field autosize label="服务端公钥 (Hex)" ref={mAddKeyPublicKey as any}></mdui-text-field>

            <mdui-button slot="action" variant="text" onClick={() => mAddKeyDialog.current!.open = false}>取消</mdui-button>
            <mdui-button slot="action" variant="tonal" onClick={() => {
                ClientManager.setServerPublicKey(mAddKeyServerHost.current!.value, Buffer.from(mAddKeyPublicKey.current!.value.trim(), 'hex'))
                mAddKeyDialog.current!.open = false
                setK(Date.now() + '')
            }}>添加</mdui-button>
        </mdui-dialog>
    </>
}

function SwitchUserDialog({ ref, mLoginDialog }: { ref: any, mLoginDialog: any }) {
    const [k, setK] = React.useState(Date.now() + '')

    return <mdui-dialog close-on-overlay-click close-on-esc ref={ref}>
        <span slot="headline">切换用户</span>

        <mdui-list>
            <mdui-list-item rounded icon="add" onClick={() => mLoginDialog.current!.open = true}>添加</mdui-list-item>
            <mdui-list-item rounded icon="refresh" onClick={() => setK(Date.now() + '')}>刷新</mdui-list-item>
            <div key={k}>{
                ClientManager.listUserSessions().map((fileName) => {
                    return <mdui-dropdown trigger="hover">
                        <mdui-list-item slot="trigger" rounded onClick={() => {
                            ClientManager.setActiveUserSessionName(fileName)
                            location.reload()
                        }}>{fileName}</mdui-list-item>
                        <mdui-menu>
                            <mdui-menu-item icon="delete" onClick={() => {
                                dialog({
                                    headline: "提示",
                                    body: "确定要删除 " + fileName + ' 吗?',
                                    closeOnEsc: true,
                                    closeOnOverlayClick: true,
                                    actions: [{
                                        text: "取消",
                                        onClick: () => true
                                    }, {
                                        text: "确定",
                                        variant: 'tonal',
                                        onClick: () => {
                                            ClientManager.removeUserSession(fileName)
                                            setK(Date.now() + '')
                                            return true
                                        }
                                    }]
                                })
                            }}>删除</mdui-menu-item>
                        </mdui-menu>
                    </mdui-dropdown>
                })
            }</div>
        </mdui-list>
    </mdui-dialog>
}

function LoginDialog({ mSettingsDialog, mLoginDialog, allowClose }: { mSettingsDialog: any, mLoginDialog: any, allowClose: boolean }) {
    const mLoginServer = React.useRef<TextField>(undefined)
    const mLoginAccount = React.useRef<TextField>(undefined)
    const mLoginPassword = React.useRef<TextField>(undefined)

    React.useEffect(() => {
        mLoginServer.current!.value = location.protocol + '//' + location.host
    }, [])

    const child = <>
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
                                server_http: mLoginServer.current!.value,
                                server_public_key: ClientManager.getServerPublicKey(new URL(mLoginServer.current!.value).host)
                            })
                            client.init()

                            client.onInit = async () => {
                                // @ts-ignore
                                const password = dlg.querySelector('#password').value
                                try {
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
                                } catch (e) {
                                    console.log(e)
                                    showSnackbar({
                                        message: '注册失败: ' + e
                                    })
                                }
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
            try {
                showSnackbar({
                    message: '登录中...'
                })

                const client = new LingCatClient({
                    server_ws: mLoginServer.current!.value,
                    server_http: mLoginServer.current!.value,
                    server_public_key: ClientManager.getServerPublicKey(new URL(mLoginServer.current!.value).host)
                })
                client.init()

                client.onInit = async () => {
                    try {
                        const token = await UserApi.login(client, {
                            password: mLoginPassword.current!.value,
                            account: mLoginAccount.current!.value,
                        })
                    } catch (e) {
                        console.log(e)
                        showSnackbar({
                            message: '登录失败: ' + e
                        })
                    }

                    ClientManager.setUserSession(mLoginAccount.current!.value, token, client.server_ws)

                    location.reload()

                    client.disconnect()
                }
            } catch (e) {
                console.log(e)
                showSnackbar({
                    message: '登录失败: ' + e
                })
            }
        }}>登录</mdui-button>
    </>

    return allowClose ? <mdui-dialog ref={mLoginDialog as any} close-on-esc close-on-overlay-click>
        {child}
    </mdui-dialog> : <mdui-dialog ref={mLoginDialog as any}>
        {child}
    </mdui-dialog>
}

export default function SettingsDialog({ mSettingsDialog, mLoginDialog }: { mSettingsDialog: any, mLoginDialog: any }) {
    const mServerPublicKeysSettingDialog = React.useRef<Dialog>(undefined)
    const mSwitchUserDialog = React.useRef<Dialog>(undefined)
    const mSwitchUserLoginDialog = React.useRef<Dialog>(undefined)

    return <>
        <LoginDialog
            mSettingsDialog={mSettingsDialog}
            mLoginDialog={mLoginDialog}
            allowClose={false} />
        <mdui-dialog close-on-overlay-click close-on-esc ref={mSettingsDialog}>
            <span slot="headline">设置</span>

            <mdui-list>
                <mdui-list-subheader>客户端</mdui-list-subheader>
                <mdui-list-item icon="switch_account" rounded onClick={() => mSwitchUserDialog.current!.open = true}>切换用户</mdui-list-item>
                <mdui-list-item icon="key" rounded onClick={() => mServerPublicKeysSettingDialog.current!.open = true}>服务端公钥管理</mdui-list-item>
            </mdui-list>
        </mdui-dialog>
        <SwitchUserDialog ref={mSwitchUserDialog} mLoginDialog={mSwitchUserLoginDialog} />
        <LoginDialog
            mSettingsDialog={mSettingsDialog}
            mLoginDialog={mSwitchUserLoginDialog}
            allowClose={true} />
        <ServerPublicKeysSettingDialog ref={mServerPublicKeysSettingDialog} />
    </>
}