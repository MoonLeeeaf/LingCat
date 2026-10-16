import ReactClient from 'react-dom/client'
import React from 'react'
import { Dialog } from 'mdui'
import { AuthMode, LoginOrRegisterForm } from './LoginOrRegisterForm.tsx'
import { useAuthFlow } from './useAuthFlow.tsx'
import showSnackbar from '../showSnackbar.ts'
import ClientConfigInstance from '../../ClientConfig.ts'
import SessionEnv from '../../SessionEnv.ts'

interface LoginOrRegisterDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    onClose?: () => void
    /** 登录/注册成功后的回调（在关闭动画结束后触发） */
    onSuccess?: () => void
    /** 是否允许关闭（ESC / 遮罩）。默认 false */
    allowClose?: boolean
    /** 初始模式，默认 login */
    initialMode?: AuthMode
}

export function LoginOrRegisterDialog({
    ref,
    onClose,
    onSuccess,
    allowClose = false,
    initialMode = 'login',
}: LoginOrRegisterDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const [mode, setMode] = React.useState<AuthMode>(initialMode)
    const { loading, doLogin, doRegister } = useAuthFlow()
    
    const [showServerInput, setShowServerInput] = React.useState(SessionEnv.isOutOfServer)

    // 服务端 label
    const serverLabel = showServerInput
        ? '服务端地址'
        : undefined

    // 标记"是否要调 onSuccess"（区分用户主动关闭 vs 成功后关闭）
    const successRef = React.useRef(false)

    React.useEffect(() => {
        const dialogEl = ref.current
        if (!dialogEl) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== dialogEl) return    // ★ 过滤子元素冒泡
            if (successRef.current) {
                successRef.current = false
                onSuccess?.()
            } else {
                onClose?.()
            }
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
    }, [onClose, onSuccess])

    const closeOnSuccess = () => {
        successRef.current = true
        ref.current!.open = false
    }

    return (
        <mdui-dialog
            ref={ref as any}
            close-on-overlay-click={allowClose || undefined}
            close-on-esc={allowClose || undefined}
        >
            <span slot="headline">{mode === 'login' ? '登录' : '注册'}</span>
            <LoginOrRegisterForm
                serverLabel={serverLabel}
                mode={mode}
                onModeChange={setMode}
                oauthProviders={ClientConfigInstance.oauthProviders}
                loading={loading}
                onLogin={async (v) => {
                    const r = await doLogin(v)
                    if (r.ok) {
                        showSnackbar({ message: '登录成功' })
                        closeOnSuccess()
                    }
                }}
                onRegister={async (v) => {
                    const r = await doRegister(v)
                    if (r.ok) {
                        showSnackbar({ message: '注册成功' })
                        closeOnSuccess()
                    }
                }}
                onOAuthLogin={(id) => {
                    location.href = '/oauth/' + encodeURIComponent(id) + '/login'
                }}
                onSwitchServer={() => setShowServerInput(true)}
            />
        </mdui-dialog>
    )
}

LoginOrRegisterDialog.show = function (options: Omit<LoginOrRegisterDialogProps, 'onClose' | 'ref'> = {}) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const doUnmount = () => {
        root.unmount()
        container.remove()
    }

    root.render(
        <LoginOrRegisterDialog
            {...options}
            onClose={doUnmount}
            onSuccess={() => {
                doUnmount()
                options.onSuccess?.()
            }}
        />,
    )
}