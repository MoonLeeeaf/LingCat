import React from 'react'
import ReactClient from 'react-dom/client'
import { Dialog } from 'mdui'
import ClientManager from '../../ClientManager.ts'
import { UserApi } from 'lingcat-client-protocol'
import showSnackbar from '../showSnackbar.ts'
import tipError from '../tipError.ts'

export default function ChangePasswordDialog({ ref, onClose }: { ref?: React.RefObject<any>, onClose?: () => void }) {
    ref = ref || React.useRef<Dialog>(undefined)
    const [oldPassword, setOldPassword] = React.useState('')
    const [newPassword, setNewPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [showOldPassword, setShowOldPassword] = React.useState(false)
    const [showNewPassword, setShowNewPassword] = React.useState(false)

    React.useEffect(() => {
        const eventName = 'closed'
        ref.current!.addEventListener(eventName, onClose)
        setTimeout(() => ref.current!.open = true, 10)
        return () => ref.current?.removeEventListener(eventName, onClose)
    }, [])

    const handleSubmit = async () => {
        // 1. 基本校验
        if (!oldPassword.trim()) {
            showSnackbar({ message: '请输入当前密码' })
            return
        }
        if (newPassword !== confirmPassword) {
            showSnackbar({ message: '两次输入的密码不一致' })
            return
        }

        setLoading(true)
        try {
            // 2. 获取 change_token
            const changeToken = await UserApi.verifyPasswordIdentity(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                old_password: oldPassword,
            })

            // 3. 修改密码
            await UserApi.changePassword(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
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