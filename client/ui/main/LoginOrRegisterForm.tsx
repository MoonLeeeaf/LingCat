import React from 'react'
import { TextField } from 'mdui'

export type AuthMode = 'login' | 'register'

export interface OAuthProvider {
    id: string
    display_name?: string
}

export interface LoginValues {
    server: string
    account: string
    password: string
}

export interface RegisterValues {
    server: string
    username: string
    nickname: string
    password: string
}

export interface LoginOrRegisterFormProps {
    /** 当前是登录还是注册 */
    mode: AuthMode
    onModeChange: (mode: AuthMode) => void

    /** OAuth 提供方列表，空则不显示 OAuth 按钮 */
    oauthProviders?: OAuthProvider[]

    /** 服务端地址输入框的 label。不传则隐藏该字段 */
    serverLabel?: string

    /** 提交中：禁用提交按钮 */
    loading?: boolean

    /** 点击"登录" */
    onLogin?: (values: LoginValues) => void
    /** 点击"注册" */
    onRegister?: (values: RegisterValues) => void
    /** 点击 OAuth 按钮 */
    onOAuthLogin?: (providerId: string) => void
    /** 点击"设置" */
    onOpenSettings?: () => void
}

export function LoginOrRegisterForm({
    mode,
    onModeChange,
    oauthProviders = [],
    serverLabel,
    loading = false,
    onLogin,
    onRegister,
    onOAuthLogin,
    onOpenSettings,
}: LoginOrRegisterFormProps) {
    // 登录字段
    const serverRef = React.useRef<TextField>(null)
    const accountRef = React.useRef<TextField>(null)
    const passwordRef = React.useRef<TextField>(null)

    // 注册字段
    const regUsernameRef = React.useRef<TextField>(null)
    const regNicknameRef = React.useRef<TextField>(null)
    const regPasswordRef = React.useRef<TextField>(null)

    const serverValue = () => serverRef.current?.value?.trim() ?? ''

    const handleLogin = () => {
        onLogin?.({
            server: serverValue(),
            account: accountRef.current?.value ?? '',
            password: passwordRef.current?.value ?? '',
        })
    }

    const handleRegister = () => {
        onRegister?.({
            server: serverValue(),
            username: regUsernameRef.current?.value ?? '',
            nickname: regNicknameRef.current?.value ?? '',
            password: regPasswordRef.current?.value ?? '',
        })
    }

    return (
        <div>
            {serverLabel !== undefined && (
                <>
                    <mdui-text-field
                        variant="outlined"
                        label={serverLabel}
                        ref={serverRef as any}
                    />
                    <div style={{ paddingTop: '15px' }} />
                </>
            )}

            {mode === 'login' ? (
                <>
                    <mdui-text-field
                        variant="outlined"
                        label="用户名 / 用户 ID"
                        ref={accountRef as any}
                    />
                    <div style={{ paddingTop: '15px' }} />
                    <mdui-text-field
                        variant="outlined"
                        label="密码"
                        type="password"
                        ref={passwordRef as any}
                    />
                </>
            ) : (
                <>
                    <mdui-text-field
                        variant="outlined"
                        label="用户名 (可选)"
                        ref={regUsernameRef as any}
                    />
                    <div style={{ paddingTop: '15px' }} />
                    <mdui-text-field
                        variant="outlined"
                        label="昵称"
                        ref={regNicknameRef as any}
                    />
                    <div style={{ paddingTop: '15px' }} />
                    <mdui-text-field
                        variant="outlined"
                        label="密码"
                        type="password"
                        ref={regPasswordRef as any}
                    />
                </>
            )}

            {oauthProviders.map((p) => (
                <mdui-button
                    key={p.id}
                    variant="tonal"
                    icon="key"
                    style={{ marginTop: '16px', width: '100%' }}
                    onClick={() => onOAuthLogin?.(p.id)}
                >
                    用 {p.display_name || p.id} 登录
                </mdui-button>
            ))}

            {/* 操作栏：模拟 mdui-dialog action 区域的视觉 */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingTop: '1.5rem',
                    gap: '0.5rem',
                }}
            >
                <mdui-button variant="text" onClick={() => onOpenSettings?.()}>
                    设置
                </mdui-button>

                <div style={{ flexGrow: 1 }} />

                {mode === 'login' ? (
                    <>
                        <mdui-button
                            variant="text"
                            onClick={() => onModeChange('register')}
                        >
                            注册
                        </mdui-button>
                        <mdui-button
                            variant="text"
                            disabled={loading || undefined}
                            onClick={handleLogin}
                        >
                            登录
                        </mdui-button>
                    </>
                ) : (
                    <>
                        <mdui-button
                            variant="text"
                            onClick={() => onModeChange('login')}
                        >
                            返回登录
                        </mdui-button>
                        <mdui-button
                            variant="text"
                            disabled={loading || undefined}
                            onClick={handleRegister}
                        >
                            注册
                        </mdui-button>
                    </>
                )}
            </div>
        </div>
    )
}