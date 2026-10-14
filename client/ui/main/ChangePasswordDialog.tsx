import React from 'react'
import ReactClient from 'react-dom/client'
import { Dialog } from 'mdui'
import ClientManager from '../../ClientManager.ts'
import { UserApi } from 'lingcat-client-protocol'
import showSnackbar from '../showSnackbar.ts'
import tipError from '../tipError.ts'

interface ChangePasswordDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    onClose?: () => void
}

export default function ChangePasswordDialog({ ref, onClose }: ChangePasswordDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const [oldPassword, setOldPassword] = React.useState('')
    const [newPassword, setNewPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [showOldPassword, setShowOldPassword] = React.useState(false)
    const [showNewPassword, setShowNewPassword] = React.useState(false)

    // 等 mdui-dialog 首次更新完成再 open，走"非首次渲染"路径 → 有打开动画
    React.useEffect(() => {
        const dialog = ref.current
        if (!dialog) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== dialog) return    // ★ 忽略子元素的 closed 冒泡
            onClose?.()
        }
        dialog.addEventListener('closed', handleClosed)

        dialog.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (!cancelled) dialog.open = true
            })
        })

        return () => {
            cancelled = true
            dialog.removeEventListener('closed', handleClosed)
        }
    }, [onClose])

    const handleSubmit = async () => {
        if (!oldPassword.trim()) {
            showSnackbar({ message: '请输入当前密码' })
            return
        }
        if (newPassword !== confirmPassword) {
            showSnackbar({ message: '两次输入的密码不一致' })
            return
        }

        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) {
            showSnackbar({ message: '连接已断开' })
            return
        }

        setLoading(true)
        try {
            const changeToken = await UserApi.verifyPasswordIdentity(client, {
                access_token: session.token,
                old_password: oldPassword,
            })

            await UserApi.changePassword(client, {
                access_token: session.token,
                change_token: changeToken,
                new_password: newPassword,
            })

            showSnackbar({ message: '修改密码成功' })
            ref.current!.open = false
        } catch (e) {
            tipError(e, '修改密码失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc headline="修改密码">
            <mdui-text-field
                variant="outlined"
                label="当前密码"
                type={showOldPassword ? 'text' : 'password'}
                value={oldPassword}
                onInput={(e: any) => setOldPassword(e.target.value)}
                style={{ width: '100%', marginBottom: '12px' }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            >
                <mdui-button-icon
                    slot="end-icon"
                    icon={showOldPassword ? 'visibility' : 'visibility_off'}
                    onClick={() => setShowOldPassword(!showOldPassword)}
                />
            </mdui-text-field>

            <mdui-text-field
                variant="outlined"
                label="新密码"
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onInput={(e: any) => setNewPassword(e.target.value)}
                style={{ width: '100%', marginBottom: '12px' }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            >
                <mdui-button-icon
                    slot="end-icon"
                    icon={showNewPassword ? 'visibility' : 'visibility_off'}
                    onClick={() => setShowNewPassword(!showNewPassword)}
                />
            </mdui-text-field>

            <mdui-text-field
                variant="outlined"
                label="确认新密码"
                type="password"
                value={confirmPassword}
                onInput={(e: any) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', marginBottom: '12px' }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit() }}
            />

            <mdui-button slot="action" variant="text" onClick={() => ref.current!.open = false}>取消</mdui-button>
            <mdui-button slot="action" variant="text" onClick={handleSubmit} disabled={loading}>
                {loading ? '修改中...' : '确认修改'}
            </mdui-button>
        </mdui-dialog>
    )
}

ChangePasswordDialog.show = function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ChangePasswordDialog onClose={onClose} />)
}