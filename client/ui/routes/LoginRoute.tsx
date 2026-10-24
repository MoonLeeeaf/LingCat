import { createRoute, redirect, useNavigate } from '@tanstack/react-router'
import { RootRoute } from './RootRoute.tsx'
import { useState } from 'react'
import { AuthMode, LoginOrRegisterForm } from '../auth/LoginOrRegisterForm.tsx'
import { DialogForRouter } from '../DialogForRouter.tsx'
import SessionEnv from '../../SessionEnv.ts'
import showSnackbar from '../showSnackbar.ts'
import ClientManager from '../../ClientManager.ts'
import ClientConfigInstance from '../../ClientConfig.ts'
import { useAuthFlow } from '../auth/useAuthFlow.tsx'
import ClientSettingsDialog from '../main/ClientSettingsDialog.tsx'

function LoginPage() {
    const navigate = useNavigate()
    const search = LoginRoute.useSearch()
    const [mode, setMode] = useState<AuthMode>('login')
    const { loading, doLogin, doRegister } = useAuthFlow()

    // ★ 输入框是否显示
    const [showServerInput, setShowServerInput] = useState(SessionEnv.isOutOfServer)

    // 服务端 label
    const serverLabel = showServerInput
        ? '服务端地址'
        : undefined

    return (
        <DialogForRouter open closeOnOverlayClick={false} onCloseRequest={() => navigate({ to: '..' })}>
            <span slot="headline">{mode === 'login' ? '登录' : '注册'}</span>
            <LoginOrRegisterForm
                serverLabel={serverLabel}
                mode={mode}
                onModeChange={setMode}
                oauthProviders={ClientConfigInstance.oauthProviders}
                loading={loading}
                onOpenSettings={() => ClientSettingsDialog.show()}
                onLogin={async (v) => {
                    const r = await doLogin(v)
                    if (r.ok) {
                        showSnackbar({ message: '登录成功' })
                        navigate({ to: search.redirect || '/' })
                    }
                }}
                onRegister={async (v) => {
                    const r = await doRegister(v)
                    if (r.ok) {
                        showSnackbar({ message: '注册成功' })
                        navigate({ to: search.redirect || '/' })
                    }
                }}
                onOAuthLogin={(id) => { location.href = '/oauth/' + encodeURIComponent(id) + '/login' }}
                // ★ 提供外部入口
                onSwitchServer={() => setShowServerInput(true)}
            />
        </DialogForRouter>
    )
}

export const LoginRoute = createRoute({
    getParentRoute: () => RootRoute,
    path: '/login',
    validateSearch: (s): { redirect?: string } => ({
        redirect: typeof s.redirect === 'string' ? s.redirect : undefined,
    }),
    beforeLoad: ({ search }) => {
        const s = ClientManager.getOrInitActiveSession()
        if (s) throw redirect({ to: search.redirect || '/' })
    },
    component: LoginPage,
})