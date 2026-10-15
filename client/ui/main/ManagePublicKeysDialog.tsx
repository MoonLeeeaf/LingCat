import ReactClient from 'react-dom/client'
import React from 'react'
import { dialog, Dialog, TextField } from 'mdui'
import ClientManager from '../../ClientManager.ts'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'
import { bytesToHex, hexToBytes } from 'lingcat-shared'

interface ManagePublicKeysDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    onClose?: () => void
}

/** 校验并解析 hex 字符串。返回 null 表示非法。 */
function parseHex(raw: string): Uint8Array | null {
    const s = raw.trim().replace(/^0x/i, '')
    if (!s) return null
    if (s.length % 2 !== 0) return null
    if (!/^[0-9a-fA-F]+$/.test(s)) return null
    try {
        return hexToBytes(s)
    } catch {
        return null
    }
}

export function ManagePublicKeysDialog({ ref, onClose }: ManagePublicKeysDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    // 用于强制刷新列表
    const [k, setK] = React.useState(Date.now().toString())

    const addKeyDialogRef = React.useRef<Dialog | undefined>(undefined)
    const addKeyHostRef = React.useRef<TextField>(null)
    const addKeyHexRef = React.useRef<TextField>(null)

    // 主对话框打开
    React.useEffect(() => {
        const el = ref.current
        if (!el) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== el) return    // ★ 过滤子元素（dropdown / 子 dialog）的 closed 冒泡
            onClose?.()
        }
        el.addEventListener('closed', handleClosed)

        el.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (!cancelled) el.open = true
            })
        })

        return () => {
            cancelled = true
            el.removeEventListener('closed', handleClosed)
        }
    }, [onClose])

    React.useEffect(() => {
        const el = addKeyDialogRef.current
        if (!el) return
    
        const handleClosed = (e: Event) => {
            if (e.target !== el) return
            if (addKeyHostRef.current) addKeyHostRef.current.value = ''
            if (addKeyHexRef.current) addKeyHexRef.current.value = ''
        }
        el.addEventListener('closed', handleClosed)
        return () => el.removeEventListener('closed', handleClosed)
    }, [])

    const openAdd = () => {
        if (addKeyHostRef.current) addKeyHostRef.current.value = ''
        if (addKeyHexRef.current) addKeyHexRef.current.value = ''
        if (addKeyDialogRef.current) addKeyDialogRef.current.open = true
    }

    const openEdit = (host: string) => {
        const key = ClientManager.getServerPublicKey(host)
        if (!key) {
            showSnackbar({ message: '找不到该服务端公钥' })
            return
        }
        if (addKeyHostRef.current) addKeyHostRef.current.value = host
        if (addKeyHexRef.current) addKeyHexRef.current.value = bytesToHex(key)
        if (addKeyDialogRef.current) addKeyDialogRef.current.open = true
    }

    const submitAdd = () => {
        const host = addKeyHostRef.current?.value?.trim() ?? ''
        const rawHex = addKeyHexRef.current?.value ?? ''

        if (!host) {
            showSnackbar({ message: '请填写服务端 Host' })
            return
        }
        const key = parseHex(rawHex)
        if (!key) {
            showSnackbar({ message: '公钥 Hex 无效' })
            return
        }
        try {
            ClientManager.setServerPublicKey(host, key)
        } catch (e) {
            tipError(e, '保存公钥失败')
            return
        }
        if (addKeyDialogRef.current) addKeyDialogRef.current.open = false
        setK(Date.now().toString())
        showSnackbar({ message: '已保存' })
    }

    const confirmRemove = (host: string) => {
        dialog({
            headline: '提示',
            body: `确定要删除 ${host} 的公钥吗? 删除后该服务端将需要重新确认。`,
            closeOnEsc: true,
            closeOnOverlayClick: true,
            actions: [
                { text: '取消', onClick: () => true },
                {
                    text: '确定',
                    variant: 'text',
                    onClick: () => {
                        ClientManager.removeServerPublicKey(host)
                        setK(Date.now().toString())
                        showSnackbar({ message: '已删除' })
                        return true
                    },
                },
            ],
        })
    }

    const hosts = ClientManager.listServerPublicKeys()

    return (
        <>
            <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc>
                <span slot="headline">服务端公钥管理</span>

                <mdui-list>
                    <mdui-list-item
                        rounded
                        icon="add"
                        onClick={openAdd}
                    >
                        添加
                    </mdui-list-item>
                    <mdui-list-item
                        rounded
                        icon="refresh"
                        onClick={() => setK(Date.now().toString())}
                    >
                        刷新
                    </mdui-list-item>

                    <div key={k}>
                        {hosts.length === 0 && (
                            <mdui-list-item rounded disabled>暂无已信任的服务端</mdui-list-item>
                        )}
                        {hosts.map((host) => (
                            <mdui-dropdown trigger="hover" key={host}>
                                <mdui-list-item slot="trigger" rounded>
                                    {host}
                                </mdui-list-item>
                                <mdui-menu>
                                    <mdui-menu-item
                                        icon="edit"
                                        onClick={() => openEdit(host)}
                                    >
                                        修改
                                    </mdui-menu-item>
                                    <mdui-menu-item
                                        icon="delete"
                                        onClick={() => confirmRemove(host)}
                                    >
                                        删除
                                    </mdui-menu-item>
                                </mdui-menu>
                            </mdui-dropdown>
                        ))}
                    </div>
                </mdui-list>
            </mdui-dialog>

            {/* 添加 / 编辑子对话框 */}
            <mdui-dialog ref={addKeyDialogRef as any} close-on-overlay-click close-on-esc>
                <span slot="headline">添加服务端公钥</span>

                <mdui-text-field
                    variant="outlined"
                    label="服务端 Host (如 127.0.0.1:80)"
                    ref={addKeyHostRef as any}
                />
                <div style={{ paddingTop: '15px' }} />
                <mdui-text-field
                    variant="outlined"
                    autosize
                    label="服务端公钥 (Hex)"
                    ref={addKeyHexRef as any}
                />

                <mdui-button
                    slot="action"
                    variant="text"
                    onClick={() => { if (addKeyDialogRef.current) addKeyDialogRef.current.open = false }}
                >
                    取消
                </mdui-button>
                <mdui-button slot="action" variant="text" onClick={submitAdd}>
                    保存
                </mdui-button>
            </mdui-dialog>
        </>
    )
}

ManagePublicKeysDialog.show = function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ManagePublicKeysDialog onClose={onClose} />)
}

export default ManagePublicKeysDialog