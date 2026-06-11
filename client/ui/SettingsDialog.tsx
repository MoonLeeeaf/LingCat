import { dialog, Dialog, TextField } from "mdui"
import React from 'react'
import fs from '../fs.ts'
import ClientManager from "./ClientManager.ts"

function ServerPublicKeysSettingDialog({ ref }: { ref: any }) {
    const [k, setK] = React.useState(Date.now() + '')

    const mAddKeyDialog = React.useRef<Dialog>(undefined)
    const mAddKeyServerHost = React.useRef<TextField>(undefined)
    const mAddKeyPublicKey = React.useRef<TextField>(undefined)

    return <>
        <mdui-dialog close-on-overlay-click close-on-esc ref={ref}>
            <span slot="headline">服务端公钥管理</span>

            <mdui-list>
                <mdui-list-item rounded icon="add" onClick={() => mAddKeyDialog.current!.open = true}>添加</mdui-list-item>
                <mdui-list-item rounded icon="refresh" onClick={() => setK(Date.now() + '')}>刷新</mdui-list-item>
                <div key={k}>{
                    fs.readdirSync('/public_keys').map((fileName) => {
                        return <mdui-dropdown trigger="hover">
                            <mdui-list-item slot="trigger" rounded>{fileName}</mdui-list-item>
                            <mdui-menu>
                                <mdui-menu-item onClick={() => {
                                    mAddKeyServerHost.current!.value = fileName
                                    mAddKeyPublicKey.current!.value = ClientManager.getServerPublicKey(fileName)
                                    mAddKeyDialog.current!.open = true
                                }}>修改</mdui-menu-item>
                                <mdui-menu-item onClick={() => {
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
                                                fs.unlinkSync('/public_keys/' + fileName)
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
            <mdui-text-field autosize label="服务端公钥 (PEM)" ref={mAddKeyPublicKey as any}></mdui-text-field>

            <mdui-button slot="action" variant="text" onClick={() => mAddKeyDialog.current!.open = false}>取消</mdui-button>
            <mdui-button slot="action" variant="tonal" onClick={() => {
                fs.writeFileSync('/public_keys/' + mAddKeyServerHost.current!.value, mAddKeyPublicKey.current!.value.trim() + '\n')
                mAddKeyDialog.current!.open = false
                mAddKeyServerHost.current!.value = ''
                mAddKeyPublicKey.current!.value = ''
                setK(Date.now() + '')
            }}>添加</mdui-button>
        </mdui-dialog>
    </>
}

export default function SettingsDialog({ ref }: { ref: any }) {
    const mServerPublicKeysSettingDialog = React.useRef<Dialog>(undefined)

    return <>
        <mdui-dialog close-on-overlay-click close-on-esc ref={ref}>
            <span slot="headline">设置</span>

            <mdui-list>
                <mdui-list-subheader>客户端</mdui-list-subheader>
                <mdui-list-item icon="key" rounded onClick={() => mServerPublicKeysSettingDialog.current!.open = true}>服务端公钥管理</mdui-list-item>
            </mdui-list>
        </mdui-dialog>

        <ServerPublicKeysSettingDialog ref={mServerPublicKeysSettingDialog} />
    </>
}