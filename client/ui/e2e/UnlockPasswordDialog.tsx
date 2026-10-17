import ReactClient from 'react-dom/client'
import React from 'react'
import { Dialog, TextField } from 'mdui'
import { useE2EStore } from '../../lib/e2e/useE2EStore.ts'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'

interface UnlockPasswordDialogProps {
    mode: 'unlock' | 'setup'
    onSuccess?: () => void
    onClose?: () => void
}

export function UnlockPasswordDialog({ mode, onSuccess, onClose }: UnlockPasswordDialogProps) {
    const ref = React.useRef<Dialog>(undefined)
    const setupNewKey = useE2EStore(s => s.setupNewKey)
    const unlock = useE2EStore(s => s.unlock)

    const pwdRef = React.useRef<TextField>(null)
    const confirmPwdRef = React.useRef<TextField>(null)
    const [loading, setLoading] = React.useState(false)

    React.useEffect(() => {
        const dialogEl = ref.current
        if (!dialogEl) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== dialogEl) return
            onClose?.()
        }
        dialogEl.addEventListener('closed', handleClosed)

        dialogEl.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (!cancelled) dialogEl.open = true
            })
        })

        return () => {
            cancelled = true
            dialogEl.removeEventListener('closed', handleClosed)
        }
    }, [onClose])

    const handleSubmit = async () => {
        const pwd = pwdRef.current?.value ?? ''
        if (pwd.length < 6) {
            tipError(new Error('密码至少需要 6 位'), '验证失败')
            return
        }

        setLoading(true)
        try {
            if (mode === 'setup') {
                const confirmPwd = confirmPwdRef.current?.value ?? ''
                if (pwd !== confirmPwd) {
                    tipError(new Error('两次输入的密码不一致'), '验证失败')
                    return
                }
                await setupNewKey(pwd)
                showSnackbar({ message: '端到端密钥已生成' })
            } else {
                const ok = await unlock(pwd)
                if (!ok) {
                    tipError(new Error('密码错误或数据损坏'), '解锁失败')
                    return
                }
            }
            ref.current!.open = false
            onSuccess?.()
        } catch (e) {
            tipError(e, mode === 'setup' ? '生成密钥失败' : '解锁失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc headline={mode === 'setup' ? '设置安全密码' : '解锁加密消息'}>
            <div style={{ marginBottom: '15px', fontSize: '14px', opacity: 0.8 }}>
                {mode === 'setup'
                    ? '请设置一个安全密码。该密码仅用于保护你的本地私钥，服务器无法知道，请务必牢记。如果忘记密码，历史消息将永久丢失。'
                    : '请输入你的端到端加密安全密码以解密当前对话。'}
            </div>

            <mdui-text-field
                variant="outlined"
                label="安全密码"
                type="password"
                ref={pwdRef as any}
                style={{ width: '100%', marginBottom: '12px' }}
                onKeyDown={(e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' && mode === 'unlock') handleSubmit()
                }}
            />

            {mode === 'setup' && (
                <mdui-text-field
                    variant="outlined"
                    label="确认密码"
                    type="password"
                    ref={confirmPwdRef as any}
                    style={{ width: '100%' }}
                    onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === 'Enter') handleSubmit()
                    }}
                />
            )}

            <mdui-button slot="action" variant="text" onClick={() => ref.current!.open = false}>
                取消
            </mdui-button>
            <mdui-button slot="action" variant="text" disabled={loading || undefined} onClick={handleSubmit}>
                {loading ? '处理中...' : (mode === 'setup' ? '生成' : '解锁')}
            </mdui-button>
        </mdui-dialog>
    )
}

UnlockPasswordDialog.show = function (mode: 'unlock' | 'setup', onSuccess?: () => void) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }

    root.render(
        <UnlockPasswordDialog 
            mode={mode} 
            onSuccess={() => { onClose(); onSuccess?.() }} 
            onClose={onClose} 
        />
    )
}