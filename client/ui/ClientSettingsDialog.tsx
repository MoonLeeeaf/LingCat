import { dialog, Dialog, TextField } from "mdui"
import React from 'react'
import ReactClient from 'react-dom/client'
import ClientManager from "../ClientManager.ts"
import useEventListener from "./useEventListener.ts"
import showSnackbar from "./showSnackbar.ts"
import LingCatClient, { UserApi } from "lingcat-client-protocol"
import tipError from "./tipError.ts"

const default_server = location.protocol + '//' + location.host + location.pathname

function ServerPublicKeysSettingDialog({ onClose }: { onClose: (e: Event) => void }) {
    const ref = React.useRef<Dialog>(null)
    const [k, setK] = React.useState(Date.now() + '')

    const mAddKeyDialog = React.useRef<Dialog>(null)
    const mAddKeyServerHost = React.useRef<TextField>(null)
    const mAddKeyPublicKey = React.useRef<TextField>(null)

    React.useEffect(() => {
        const dialog = ref.current
        if (!dialog) return
        dialog.addEventListener('closed', onClose)
        setTimeout(() => dialog.open = true, 10)
        return () => dialog.removeEventListener('closed', onClose)
    }, [onClose])

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
                        return <mdui-dropdown trigger="hover" key={fileName}>
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
                                            variant: 'text',
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

        <mdui-dialog close-on-overlay-click close-on-esc ref={mAddKeyDialog}>
            <span slot="headline">添加服务端公钥</span>

            <mdui-text-field variant="outlined" label="服务端 Host (如 127.0.0.1:80)" ref={mAddKeyServerHost}></mdui-text-field>
            <div style={{ paddingTop: '15px' }}></div>
            <mdui-text-field variant="outlined" autosize label="服务端公钥 (Hex)" ref={mAddKeyPublicKey}></mdui-text-field>

            <mdui-button slot="action" variant="text" onClick={() => mAddKeyDialog.current!.open = false}>取消</mdui-button>
            <mdui-button slot="action" variant="text" onClick={() => {
                ClientManager.setServerPublicKey(mAddKeyServerHost.current!.value, Buffer.from(mAddKeyPublicKey.current!.value.trim(), 'hex'))
                mAddKeyDialog.current!.open = false
                setK(Date.now() + '')
            }}>添加</mdui-button>
        </mdui-dialog>
    </>
}

ServerPublicKeysSettingDialog.show = function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    /**
     * 长点记性!!!!!!!!!!
     * Dropdown 放在 Dialog 里面
     * 会导致 Dropdown 关闭时
     * 反而触发 Dialog 的 onClose!!!!!
     */
    const onClose = (e: Event) => {
        if ((e.target as HTMLElement).tagName.toLowerCase() == 'mdui-dialog') {
            root.unmount()
            container.remove()
        }
    }
    root.render(<ServerPublicKeysSettingDialog onClose={onClose} />)
}

function SwitchUserDialog({ onClose }: { onClose: (e: Event) => void }) {
    const ref = React.useRef<Dialog>(null)
    const [k, setK] = React.useState(Date.now() + '')

    React.useEffect(() => {
        const dialog = ref.current
        if (!dialog) return
        dialog.addEventListener('closed', onClose)
        setTimeout(() => dialog.open = true, 10)
        return () => dialog.removeEventListener('closed', onClose)
    }, [onClose])

    return <mdui-dialog close-on-overlay-click close-on-esc ref={ref}>
        <span slot="headline">切换用户</span>

        <mdui-list>
            <mdui-list-item rounded icon="add" onClick={() => LoginDialog.show({ allowClose: true })}>添加</mdui-list-item>
            <mdui-list-item rounded icon="refresh" onClick={() => setK(Date.now() + '')}>刷新</mdui-list-item>
            <div key={k}>{
                ClientManager.listUserSessions().map((fileName) => {
                    return <mdui-dropdown trigger="hover" key={fileName}>
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
                                        variant: 'text',
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

SwitchUserDialog.show = function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    /**
     * 长点记性!!!!!!!!!!
     * Dropdown 放在 Dialog 里面
     * 会导致 Dropdown 关闭时
     * 反而触发 Dialog 的 onClose!!!!!
     */
    const onClose = (e: Event) => {
        if ((e.target as HTMLElement).tagName.toLowerCase() == 'mdui-dialog') {
            root.unmount()
            container.remove()
        }
    }
    root.render(<SwitchUserDialog onClose={onClose} />)
}

function LoginDialog({ onClose, allowClose, onLoginSuccess }: {
    onClose?: () => void,
    allowClose: boolean,
    onLoginSuccess?: () => void
}) {
    const ref = React.useRef<Dialog>(null)
    const mLoginServer = React.useRef<TextField>(null)
    const mLoginAccount = React.useRef<TextField>(null)
    const mLoginPassword = React.useRef<TextField>(null)

    React.useEffect(() => {
        const dialog = ref.current
        if (!dialog) return
        if (onClose) {
            dialog.addEventListener('closed', onClose)
        }
        setTimeout(() => dialog.open = true, 10)
        return () => {
            if (onClose) dialog.removeEventListener('closed', onClose)
        }
    }, [onClose])

    const handleLogin = async () => {
        try {
            showSnackbar({ message: '登录中...' })

            const isEmpty = mLoginServer.current!.value.trim() == ''
            const host = isEmpty ? default_server : mLoginServer.current!.value
            const client = new LingCatClient({
                server_ws: host,
                server_http: host,
                server_public_key: ClientManager.getServerPublicKey(isEmpty ? '内置' : new URL(host).host)
            })

            client.onInit = async () => {
                client.onInit = () => void (0)
                try {
                    const token = await UserApi.login(client, {
                        password: mLoginPassword.current!.value,
                        account: mLoginAccount.current!.value,
                    })

                    ClientManager.setUserSession(mLoginAccount.current!.value, token, isEmpty ? '' : client.server_ws)
                    ClientManager.setActiveUserSessionName(mLoginAccount.current!.value)

                    client.disconnect()

                    if (onLoginSuccess) {
                        onLoginSuccess()
                    } else {
                        setTimeout(() => document.location.reload(), 500)
                    }
                } catch (e) {
                    console.log(e)
                    tipError(e, '登录失败')
                }
            }

            client.init()
        } catch (e) {
            console.log(e)
            tipError(e, '登录失败')
        }
    }

    const handleRegister = () => {
        const dlg = dialog({
            headline: "注册",
            body: `<mdui-text-field variant="outlined" label="用户名 (可选)" id="username"></mdui-text-field><div style="padding-top: 15px"></div><mdui-text-field variant="outlined" label="昵称" id="nickname"></mdui-text-field><div style="padding-top: 15px"></div><mdui-text-field variant="outlined" label="密码" type="password" id="password"></mdui-text-field>`,
            closeOnEsc: true,
            closeOnOverlayClick: true,
            actions: [{
                text: "取消",
                onClick: () => true,
            }, {
                text: "注册",
                variant: 'text',
                onClick: async () => {
                    try {
                        showSnackbar({ message: '注册中...' })

                        const isEmpty = mLoginServer.current!.value.trim() == ''
                        const host = isEmpty ? default_server : mLoginServer.current!.value
                        const client = new LingCatClient({
                            server_ws: host,
                            server_http: host,
                            server_public_key: ClientManager.getServerPublicKey(isEmpty ? '内置' : new URL(host).host)
                        })

                        client.onInit = async () => {
                            client.onInit = () => void (0)
                            // @ts-ignore
                            const password = dlg.querySelector('#password').value
                            // @ts-ignore
                            const nickname = dlg.querySelector('#nickname').value
                            try {
                                const userId = await UserApi.register(client, {
                                    password,
                                    nickname,
                                    // @ts-ignore
                                    username: dlg.querySelector('#username').value,
                                })

                                mLoginAccount.current!.value = nickname != '' ? nickname : userId
                                mLoginPassword.current!.value = password

                                client.disconnect()
                            } catch (e) {
                                console.log(e)
                                tipError(e, '注册失败')
                            }
                        }

                        client.init()
                    } catch (e) {
                        console.log(e)
                        tipError(e, '注册失败')
                    }
                },
            }]
        })
        // @ts-ignore
        dlg.querySelector('#password').value = mLoginPassword.current!.value
    }

    const child = <>
        <span slot="headline">登录</span>

        <mdui-text-field variant="outlined" label="服务端 HTTP 地址 (留空为当前页)" ref={mLoginServer}></mdui-text-field>
        <div style={{ paddingTop: '15px' }}></div>
        <mdui-text-field variant="outlined" label="用户名 / 用户 ID" ref={mLoginAccount}></mdui-text-field>
        <div style={{ paddingTop: '15px' }}></div>
        <mdui-text-field variant="outlined" label="密码" type="password" ref={mLoginPassword}></mdui-text-field>

        <mdui-button slot="action" variant="text" onClick={() => ClientSettingsDialog.show()}>设置</mdui-button>
        <div slot="action" style={{ flexGrow: 1 }}></div>
        <mdui-button slot="action" variant="text" onClick={handleRegister}>注册</mdui-button>
        <mdui-button slot="action" variant="text" onClick={handleLogin}>登录</mdui-button>
    </>

    return allowClose
        ? <mdui-dialog ref={ref} close-on-esc close-on-overlay-click>{child}</mdui-dialog>
        : <mdui-dialog ref={ref}>{child}</mdui-dialog>
}

LoginDialog.show = function (options: { allowClose?: boolean, onLoginSuccess?: () => void } = {}) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<LoginDialog
        onClose={onClose}
        allowClose={options.allowClose ?? false}
        onLoginSuccess={options.onLoginSuccess}
    />)
}

function ClientSettingsDialog({ onClose }: { onClose: () => void }) {
    const ref = React.useRef<Dialog>(null)

    React.useEffect(() => {
        const dialog = ref.current
        if (!dialog) return
        const onClosed = () => onClose()
        dialog.addEventListener('closed', onClosed)
        setTimeout(() => dialog.open = true, 10)
        return () => dialog.removeEventListener('closed', onClosed)
    }, [onClose])

    return <mdui-dialog close-on-overlay-click close-on-esc ref={ref}>
        <span slot="headline">客户端设置</span>

        <mdui-list>
            <mdui-list-item icon="switch_account" rounded onClick={() => SwitchUserDialog.show()}>切换用户</mdui-list-item>
            <mdui-list-item icon="key" rounded onClick={() => ServerPublicKeysSettingDialog.show()}>服务端公钥管理</mdui-list-item>
        </mdui-list>
    </mdui-dialog>
}

ClientSettingsDialog.show = function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ClientSettingsDialog onClose={onClose} />)
}

// ===================== 默认导出 =====================
export { ClientSettingsDialog, LoginDialog, SwitchUserDialog, ServerPublicKeysSettingDialog }
export default ClientSettingsDialog
