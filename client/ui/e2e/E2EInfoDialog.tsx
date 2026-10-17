import ReactClient from 'react-dom/client'
import React from 'react'
import { dialog, Dialog } from 'mdui'
import E2EManager from '../../lib/e2e/E2EManager.ts'
import { useE2EStore } from '../../lib/e2e/useE2EStore.ts'
import { UnlockPasswordDialog } from './UnlockPasswordDialog.tsx'
import HistoryKeysDialog from './HistoryKeysDialog.tsx'
import showSnackbar from '../showSnackbar.ts'
import tipError from '../tipError.ts'
import copyToClipboard from '../../lib/copyToClipboard.ts'

interface E2EInfoDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    chatId: string
    peerUserId?: string
    onClose?: () => void
}

export default function E2EInfoDialog({ ref, chatId, peerUserId, onClose }: E2EInfoDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const e2eStatus = useE2EStore(s => s.status)
    const myPub = useE2EStore(s => s.myPublicKey)
    const myKeyVersion = useE2EStore(s => s.myKeyVersion)
    const peerKeys = useE2EStore(s => s.peerKeys)
    const peerVerifyStatus = useE2EStore(s => s.peerVerifyStatus)
    const setPeerVerified = useE2EStore(s => s.setPeerVerified)
    const fetchPeerKeys = useE2EStore(s => s.fetchPeerKeys)
    const generateNewKey = useE2EStore(s => s.generateNewKey)
    const changePassword = useE2EStore(s => s.changePassword)

    React.useEffect(() => {
        const el = ref.current
        if (!el) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            // @ts-ignore
            if (e.target !== el) return
            onClose?.()
        }
        // @ts-ignore
        el.addEventListener('closed', handleClosed)

        // @ts-ignore
        el.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (!cancelled) el.open = true
            })
        })
        return () => {
            cancelled = true
            // @ts-ignore
            el.removeEventListener('closed', handleClosed)
        }
    }, [onClose])

    // 拉取公钥
    React.useEffect(() => {
        if (peerUserId && !peerKeys[peerUserId]) {
            fetchPeerKeys([peerUserId])
        }
    }, [peerUserId, peerKeys, fetchPeerKeys])

    const peerPub = peerUserId ? peerKeys[peerUserId] : null
    const verifyStatus = peerUserId ? peerVerifyStatus[peerUserId] : 'unverified'

    // ============================================================
    //  操作：生成新密钥
    // ============================================================
    const handleRotateKey = () => {
        dialog({
            headline: '生成新密钥',
            body: '警告：生成新密钥后，对方的安全码将发生变更，需重新验证身份。若你未妥善保管历史密码，可能会导致旧消息永久无法解密。确定继续吗？',
            closeOnEsc: true,
            closeOnOverlayClick: true,
            actions: [
                { text: '取消', onClick: () => true },
                {
                    text: '继续',
                    variant: 'text',
                    onClick: () => {
                        setTimeout(() => {
                            const pwdDlg = dialog({
                                headline: '输入安全密码',
                                body: `
                                    <div style="margin-bottom: 12px; font-size: 14px; opacity: 0.8;">
                                        请输入当前的安全密码以加密新的私钥。
                                    </div>
                                    <mdui-text-field id="rotate-pwd" label="安全密码" type="password" variant="outlined" style="width: 100%"></mdui-text-field>
                                `,
                                closeOnEsc: true,
                                closeOnOverlayClick: true,
                                actions: [
                                    { text: '取消', onClick: () => true },
                                    {
                                        text: '确认重置',
                                        variant: 'tonal',
                                        onClick: () => {
                                            // @ts-ignore
                                            const input = pwdDlg.querySelector('#rotate-pwd') as HTMLInputElement
                                            const pwd = input?.value ?? ''
                                            if (pwd.length < 6) {
                                                showSnackbar({ message: '密码至少需要 6 位' })
                                                return false
                                            }

                                            generateNewKey(pwd, myKeyVersion + 1)
                                                .then(() => {
                                                    showSnackbar({ message: '新密钥已生成' })
                                                    pwdDlg.open = false
                                                })
                                                .catch((e) => {
                                                    tipError(e, '生成新密钥失败')
                                                })
                                            return false
                                        }
                                    }
                                ]
                            })
                        }, 100)
                        return true
                    }
                }
            ]
        })
    }

    // ============================================================
    //  操作：修改主安全密码
    // ============================================================
    const handleChangePassword = () => {
        const dlg = dialog({
            headline: '修改主安全密码',
            body: `
                <div style="margin-bottom: 12px; font-size: 14px; opacity: 0.8;">
                    修改密码不会改变你的密钥对。系统会自动用新密码重新加密你的历史私钥。
                </div>
                <mdui-text-field id="old-pwd" label="当前安全密码" type="password" variant="outlined" style="width: 100%; margin-bottom: 12px"></mdui-text-field>
                <mdui-text-field id="new-pwd" label="新安全密码" type="password" variant="outlined" style="width: 100%; margin-bottom: 12px"></mdui-text-field>
                <mdui-text-field id="confirm-pwd" label="确认新密码" type="password" variant="outlined" style="width: 100%"></mdui-text-field>
            `,
            closeOnEsc: true,
            closeOnOverlayClick: true,
            actions: [
                { text: '取消', onClick: () => true },
                {
                    text: '确认修改',
                    onClick: () => {
                        // @ts-ignore
                        const oldPwd = (dlg.querySelector('#old-pwd') as any)?.value ?? ''
                        // @ts-ignore
                        const newPwd = (dlg.querySelector('#new-pwd') as any)?.value ?? ''
                        // @ts-ignore
                        const confirmPwd = (dlg.querySelector('#confirm-pwd') as any)?.value ?? ''

                        if (!oldPwd || !newPwd) {
                            showSnackbar({ message: '密码不能为空' })
                            return false
                        }
                        if (newPwd !== confirmPwd) {
                            showSnackbar({ message: '两次输入的新密码不一致' })
                            return false
                        }
                        if (newPwd.length < 6) {
                            showSnackbar({ message: '新密码至少需要 6 位' })
                            return false
                        }

                        changePassword(oldPwd, newPwd).then(success => {
                            if (success) {
                                showSnackbar({ message: '安全密码修改成功，请用新密码解锁' })
                                dlg.open = false
                            } else {
                                showSnackbar({ message: '修改失败，请检查旧密码是否正确' })
                            }
                        })
                        return false
                    }
                }
            ]
        })
    }

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc headline="端到端加密">
            {e2eStatus === 'disabled' ? (
                <div style={{ padding: '20px', textAlign: 'center', opacity: 0.8 }}>
                    你尚未开启端到端加密。
                    <br />
                    <mdui-button style={{ marginTop: '12px' }} onClick={() => UnlockPasswordDialog.show('setup')}>
                        开启
                    </mdui-button>
                </div>
            ) : (
                <mdui-list>
                    {peerUserId && (
                        <>
                            {!peerPub ? (
                                <mdui-list-item icon="lock_outline" rounded disabled>
                                    对方未开启端到端加密
                                    <span slot="description">等待对方生成密钥后才可加密聊天</span>
                                </mdui-list-item>
                            ) : (
                                <>
                                    {/* 安全码展示 */}
                                    <mdui-dropdown trigger="click">
                                        <mdui-list-item
                                            slot="trigger"
                                            rounded
                                            icon={verifyStatus === 'mismatch' ? 'gpp_bad' : 'lock'}
                                            style={{ height: 'auto', paddingTop: '12px', paddingBottom: '12px', cursor: 'pointer' }}
                                        >
                                            <span slot="description" style={{ color: verifyStatus === 'mismatch' ? 'var(--mdui-color-error)' : 'rgb(var(--mdui-color-on-surface))' }}>
                                                安全码
                                            </span>
                                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                                <div style={{
                                                    color: verifyStatus === 'mismatch' ? 'var(--mdui-color-error)' : 'rgb(var(--mdui-color-on-surface-variant))'
                                                }}>
                                                    {myPub ? E2EManager.getSafetyNumber(myPub, peerPub) : '计算中...'}
                                                </div>
                                                {verifyStatus === 'mismatch' && (
                                                    <div style={{ color: 'var(--mdui-color-error)', fontSize: '12px', marginTop: '4px' }}>
                                                        对方安全码已变更，请通过其他方式确认对方身份。
                                                    </div>
                                                )}
                                            </div>
                                        </mdui-list-item>

                                        <mdui-menu>
                                            <mdui-menu-item
                                                icon="content_copy"
                                                onClick={async () => {
                                                    const num = myPub && peerPub ? E2EManager.getSafetyNumber(myPub, peerPub) : ''
                                                    if (!num) return
                                                    const ok = await copyToClipboard(num)
                                                    showSnackbar({ message: ok ? '安全码已复制' : '复制失败' })
                                                }}
                                            >
                                                复制安全码
                                            </mdui-menu-item>
                                        </mdui-menu>
                                    </mdui-dropdown>

                                    {/* 验证状态操作 */}
                                    <mdui-list-item
                                        icon={verifyStatus === 'verified' ? 'verified_user' : 'help_outline'}
                                        rounded
                                        onClick={() => {
                                            if (verifyStatus !== 'verified' && peerUserId) {
                                                setPeerVerified(peerUserId)
                                            }
                                        }}
                                    >
                                        {verifyStatus === 'verified' ? (
                                            <span style={{ color: 'var(--mdui-color-primary)' }}>安全码已验证</span>
                                        ) : (
                                            <span>标记为已验证</span>
                                        )}
                                        <span slot="description">
                                            {verifyStatus === 'verified'
                                                ? '你已确认对方身份，安全码未发生变动。'
                                                : '当面或通过其他可信方式对比上方数字，一致后点击这里。'}
                                        </span>
                                    </mdui-list-item>
                                </>
                            )}
                        </>
                    )}

                    {/* 修改主安全密码 */}
                    <mdui-list-item
                        icon="password"
                        rounded
                        onClick={handleChangePassword}
                    >
                        修改主安全密码
                        <span slot="description">
                            将所有可解密的版本统一替换为新密码。
                        </span>
                    </mdui-list-item>

                    {/* 历史密钥管理 */}
                    <mdui-list-item
                        icon="vpn_key"
                        rounded
                        onClick={() => HistoryKeysDialog.show()}
                    >
                        管理历史密钥
                        <span slot="description">
                            查看并单独修改特定版本（v1, v2...）的密码。
                        </span>
                    </mdui-list-item>

                    {/* 生成新密钥 */}
                    <mdui-list-item
                        icon="autorenew"
                        rounded
                        onClick={handleRotateKey}
                    >
                        生成新密钥 (v{myKeyVersion + 1})
                        <span slot="description" style={{ color: 'var(--mdui-color-error)' }}>
                            如果怀疑私钥泄漏，可在此重置。会破坏当前的安全码。
                        </span>
                    </mdui-list-item>
                </mdui-list>
            )}

            <mdui-button slot="action" variant="text" onClick={() => ref.current!.open = false}>关闭</mdui-button>
        </mdui-dialog>
    )
}

E2EInfoDialog.show = function (chatId: string, peerUserId?: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<E2EInfoDialog chatId={chatId} peerUserId={peerUserId} onClose={onClose} />)
}