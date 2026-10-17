import ReactClient from 'react-dom/client'
import React from 'react'
import { Dialog, dialog } from 'mdui'
import { E2EApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import { useE2EStore } from '../../lib/e2e/useE2EStore.ts'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'

interface HistoryKeysDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    onClose?: () => void
}

export default function HistoryKeysDialog({ ref, onClose }: HistoryKeysDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const [loading, setLoading] = React.useState(true)
    const [versions, setVersions] = React.useState<number[]>([])
    const myKeyVersion = useE2EStore(s => s.myKeyVersion)
    const changeVersionPassword = useE2EStore(s => s.changeVersionPassword)

    React.useEffect(() => {
        const el = ref.current as any
        if (!el) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== el) return
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

    // 拉取所有历史版本
    React.useEffect(() => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        E2EApi.getAllMyKeys(client, { access_token: session.token })
            .then(keys => {
                // 提取所有版本号并降序排列
                const v = keys.map(k => k.key_version).sort((a, b) => b - a)
                setVersions(v)
            })
            .catch(e => tipError(e, '加载历史密钥失败'))
            .finally(() => setLoading(false))
    }, [])

    // 处理修改某一个版本的密码
    const handleEdit = (version: number) => {
        const dlg = dialog({
            headline: `修改 v${version} 的密码`,
            body: `
                <div style="margin-bottom: 12px; font-size: 14px; opacity: 0.8;">
                    如果不再记得该版本的密码，将无法修改或恢复该版本的历史消息。
                </div>
                <mdui-text-field id="old-pwd" label="旧密码" type="password" variant="outlined" style="width: 100%; margin-bottom: 12px"></mdui-text-field>
                <mdui-text-field id="new-pwd" label="新密码" type="password" variant="outlined" style="width: 100%"></mdui-text-field>
            `,
            closeOnEsc: true,
            closeOnOverlayClick: true,
            actions: [
                { text: '取消', onClick: () => true },
                {
                    text: '保存',
                    onClick: () => {
                        // @ts-ignore
                        const oldPwd = (dlg.querySelector('#old-pwd') as any)?.value ?? ''
                        // @ts-ignore
                        const newPwd = (dlg.querySelector('#new-pwd') as any)?.value ?? ''

                        if (!oldPwd || !newPwd) {
                            showSnackbar({ message: '密码不能为空' })
                            return false
                        }
                        if (newPwd.length < 6) {
                            showSnackbar({ message: '新密码至少需要 6 位' })
                            return false
                        }

                        changeVersionPassword(version, oldPwd, newPwd).then(ok => {
                            if (ok) {
                                showSnackbar({ message: `v${version} 密码已更新` })
                                dlg.open = false
                            } else {
                                showSnackbar({ message: '旧密码错误或修改失败' })
                            }
                        })
                        return false
                    }
                }
            ]
        })
    }

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc headline="历史密钥管理">
            {loading ? (
                <div style={{ padding: '20px', textAlign: 'center' }}><mdui-circular-progress /></div>
            ) : (
                <mdui-list>
                    {versions.length === 0 && <mdui-list-item>暂无历史密钥</mdui-list-item>}
                    {versions.map(v => (
                        <mdui-list-item
                            key={v}
                            rounded
                            icon="key"
                            onClick={() => handleEdit(v)}
                        >
                            密钥版本 v{v}
                            <span slot="description">
                                {v === myKeyVersion ? '当前最新版本 (建议与主密码一致)' : '历史版本 (用于解密旧消息)'}
                            </span>
                            <mdui-icon slot="end-icon" name="edit" />
                        </mdui-list-item>
                    ))}
                </mdui-list>
            )}
            <mdui-button slot="action" variant="text" onClick={() => ref.current!.open = false}>关闭</mdui-button>
        </mdui-dialog>
    )
}

HistoryKeysDialog.show = function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<HistoryKeysDialog onClose={onClose} />)
}