import ReactClient from 'react-dom/client'
import React from 'react'
import { dialog, Dialog, TextField } from 'mdui'
import type { IUser } from 'lingcat-protocol'
import EffectOnly from '../EffectOnly.tsx'
import CircleProgressDialog from '../CircleProgressDialog.tsx'
import ClientManager from '../../ClientManager.ts'
import default_avatar from '../../default_avatar.png'
import { UserApi, FileApi, OAuthApi } from 'lingcat-client-protocol'
import Avatar from '../Avatar.tsx'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'
import SessionEnv from '../../SessionEnv.ts'
import ClientConfigInstance from '../../ClientConfig.ts'
import getFileUrl from '../../lib/getFileUrl.ts'
import { cropImageToSquare } from '../../lib/imageUtils.ts'

interface EditMyProfileDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    onClose?: () => void
}

export default function EditMyProfileDialog({ ref, onClose }: EditMyProfileDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const [loading, setLoading] = React.useState(true)
    const [profile, setProfile] = React.useState<IUser>()
    const [bindings, setBindings] = React.useState<string[]>([])

    // ★ 把 ref 声明提前（原代码在 useEffect 之后声明，运行时没事但可读性差）
    const chooseAvatarFileRef = React.useRef<HTMLInputElement>(null)
    const editNickNameRef = React.useRef<TextField>(null)
    const editUserNameRef = React.useRef<TextField>(null)
    const editDescriptionRef = React.useRef<TextField>(null)

    // ============================================================
    //  加载资料 + OAuth 绑定
    // ============================================================
    React.useEffect(() => {
        let cancelled = false
        ;(async () => {
            const client = ClientManager.getActiveClient()
            const session = ClientManager.getActiveSession()
            if (!client || !session) {
                if (!cancelled) {
                    tipError(new Error('连接已断开'), '加载失败')
                    setLoading(false)
                }
                return
            }
            try {
                const me = await UserApi.queryMyUserInfo(client, { access_token: session.token })
                if (!cancelled) setProfile(me)
            } catch (e) {
                if (!cancelled) tipError(e, '加载失败')
            }
            if (ClientConfigInstance.oauthProviders.length > 0) {
                try {
                    const b = await OAuthApi.getOAuthBindings(client, { access_token: session.token })
                    if (!cancelled) setBindings(b)
                } catch (e) {
                    console.warn('[OAuth] 获取绑定失败', e)
                }
            }
            if (!cancelled) setLoading(false)
        })()
        return () => { cancelled = true }
    }, [])

    // ============================================================
    //  loading 结束 → 等 mdui-dialog 首次更新完成 → open（有打开动画）
    //  同时绑定头像选择 / closed 事件
    // ============================================================
    React.useEffect(() => {
        if (loading) return
        const dialogEl = ref.current
        if (!dialogEl) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== dialogEl) return    // ★ 过滤子元素 closed 冒泡
            onClose?.()
        }
        dialogEl.addEventListener('closed', handleClosed)

        dialogEl.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (!cancelled) dialogEl.open = true
            })
        })

        const onChange = async () => {
            const file = chooseAvatarFileRef.current?.files?.[0]
            if (!file) return

            const client = ClientManager.getActiveClient()
            const session = ClientManager.getActiveSession()
            if (!client || !session) return

            try {
                const uploadToken = await FileApi.requestUploadFileToken(client, {
                    access_token: session.token,
                })

                // 头像统一裁剪为 1:1
                const cropped = await cropImageToSquare(file, 512)

                const hash = await FileApi.uploadFile(client, {
                    file_upload_token: uploadToken,
                    file_data: cropped,
                    mime: 'image/png',
                    file_name: 'avatar.png',
                })

                await UserApi.updateMyProfile(client, {
                    access_token: session.token,
                    avatar_file_hash: hash,
                })

                showSnackbar({ message: '更新头像成功! 请刷新页面' })
            } catch (e) {
                console.log(e)
                tipError(e, '更新头像失败')
            }
        }

        const input = chooseAvatarFileRef.current
        input?.addEventListener('change', onChange)

        return () => {
            cancelled = true
            dialogEl.removeEventListener('closed', handleClosed)
            input?.removeEventListener('change', onChange)
        }
    }, [loading, onClose])

    const avatar = profile?.avatar_file_hash
        ? getFileUrl(profile.avatar_file_hash, SessionEnv.myFileAccessToken)
        : default_avatar

    if (loading) {
        return <EffectOnly deps={[]} effect={() => CircleProgressDialog.show('加载中...')} />
    }

    return (
        <mdui-dialog close-on-overlay-click close-on-esc ref={ref as any}>
            <div style={{ display: 'none' }}>
                <input type="file" name="选择头像" ref={chooseAvatarFileRef} accept="image/*" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar
                    src={avatar}
                    onClick={() => {
                        chooseAvatarFileRef.current!.value = ''
                        chooseAvatarFileRef.current!.click()
                    }}
                    style={{ width: '50px', height: '50px' }}
                />
                <mdui-text-field
                    variant="outlined"
                    placeholder="昵称"
                    ref={editNickNameRef}
                    style={{ marginLeft: '15px' }}
                    value={profile?.nickname}
                />
            </div>

            <mdui-text-field
                style={{ marginTop: '20px' }}
                variant="outlined"
                label="用户 ID"
                value={profile?.id || ''}
                readonly
                onClick={(e) => {
                    const input = e.target as HTMLInputElement
                    input.select()
                    input.setSelectionRange(0, 1145141919810)
                }}
            />
            <mdui-text-field
                style={{ marginTop: '20px' }}
                variant="outlined"
                label="用户名"
                value={profile?.username || ''}
                ref={editUserNameRef}
            />
            <mdui-text-field
                style={{ marginTop: '20px' }}
                variant="outlined"
                label="简介"
                value={profile?.description || ''}
                ref={editDescriptionRef}
            />

            {ClientConfigInstance.oauthProviders.map((p) => {
                const bound = bindings.includes(p.id)
                const name = p.display_name || p.id
                return (
                    <mdui-button
                        key={p.id}
                        variant={bound ? 'text' : 'tonal'}
                        icon="key"
                        style={{ marginTop: '16px', width: '100%' }}
                        onClick={async () => {
                            const client = ClientManager.getActiveClient()
                            const session = ClientManager.getActiveSession()
                            if (!client || !session) return

                            if (!bound) {
                                location.href = './oauth/' + encodeURIComponent(p.id)
                                    + '/login?mode=bind&access_token='
                                    + encodeURIComponent(session.token)
                                return
                            }
                            dialog({
                                headline: '解绑 ' + name,
                                body: '解绑后将无法用 ' + name + ' 登录。如果未设置密码, 解绑后将无法再进入此账号。确定继续?',
                                closeOnEsc: true,
                                closeOnOverlayClick: true,
                                actions: [
                                    { text: '取消', onClick: () => true },
                                    {
                                        text: '解绑',
                                        variant: 'text',
                                        onClick: async () => {
                                            try {
                                                await OAuthApi.unbindOAuth(client, {
                                                    access_token: session.token,
                                                    provider: p.id,
                                                })
                                                setBindings(await OAuthApi.getOAuthBindings(client, {
                                                    access_token: session.token,
                                                }))
                                                showSnackbar({ message: '已解绑 ' + name })
                                            } catch (e) {
                                                tipError(e, '解绑失败')
                                            }
                                        },
                                    },
                                ],
                            })
                        }}
                    >
                        {bound ? '解绑 ' : '绑定 '}{name}
                    </mdui-button>
                )
            })}

            <mdui-button slot="action" variant="text" onClick={() => ref.current!.open = false}>
                取消
            </mdui-button>
            <mdui-button
                slot="action"
                variant="text"
                onClick={async () => {
                    const client = ClientManager.getActiveClient()
                    const session = ClientManager.getActiveSession()
                    if (!client || !session) return
                    try {
                        await UserApi.updateMyProfile(client, {
                            access_token: session.token,
                            nickname: editNickNameRef.current?.value,
                            username: editUserNameRef.current?.value,
                            description: editDescriptionRef.current?.value,
                        })
                    } catch (e) {
                        tipError(e, '更新资料失败')
                    }
                    showSnackbar({ message: '修改成功, 刷新页面以更新' })
                }}
            >
                更新
            </mdui-button>
        </mdui-dialog>
    )
}

EditMyProfileDialog.show = function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }

    root.render(<EditMyProfileDialog onClose={onClose} />)
}