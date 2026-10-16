import ReactClient from 'react-dom/client'
import React from 'react'
import { dialog, Dialog } from 'mdui'
import type { IUser } from 'lingcat-protocol'
import EffectOnly from '../EffectOnly.tsx'
import CircleProgressDialog from '../CircleProgressDialog.tsx'
import ClientManager from '../../ClientManager.ts'
import default_avatar from '../../default_avatar.png'
import { ChatApi, UserApi } from 'lingcat-client-protocol'
import Avatar from '../Avatar.tsx'
import tipError from '../tipError.ts'
import EditMyProfileDialog from '../main/EditMyProfileDialog.tsx'
import ProfileCache from '../../ProfileCache.ts'
import SessionEnv from '../../SessionEnv.ts'
import ImageViewerDialog from './ImageViewerDialog.tsx'
import CopyableListItem from '../CopyableListItem.tsx'
import getFileUrl from '../../lib/getFileUrl.ts'
import { Router } from '../routes/Router.ts'
import RemarksCache from '../../RemarksCache.ts'
import showSnackbar from '../showSnackbar.ts'

interface UserProfileDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    userId: string
    onClose?: () => void
}

export default function UserProfileDialog({ ref, userId, onClose }: UserProfileDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const [loading, setLoading] = React.useState(true)
    const [profile, setProfile] = React.useState<IUser>()
    const [isMe, setIsMe] = React.useState(false)

    React.useEffect(() => {
        let cancelled = false
            ; (async () => {
                try {
                    const p = await ProfileCache.queryUserInfo(userId)
                    if (cancelled) return
                    setProfile(p)
                    const me = await ClientManager.getMe()
                    if (cancelled) return
                    setIsMe(me.id === p.id)
                } catch (e) {
                    if (!cancelled) tipError(e, '加载失败')
                }
                if (!cancelled) setLoading(false)
            })()
        return () => { cancelled = true }
    }, [userId])

    // loading 结束 → 等 mdui-dialog 首次更新完成再 open（走"非首次渲染"路径 → 有动画）
    React.useEffect(() => {
        if (loading) return
        const dialog = ref.current
        if (!dialog) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== dialog) return    // ★ 忽略 dropdown 等子元素的 closed 冒泡
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
    }, [loading, onClose])

    const avatar = profile?.avatar_file_hash
        ? getFileUrl(profile.avatar_file_hash, SessionEnv.myFileAccessToken)
        : default_avatar

    const [, forceUpdate] = React.useReducer((x) => x + 1, 0)
    const userRemark = RemarksCache.get(userId)
    const nickname = userRemark ? (userRemark + '(' + profile?.nickname + ')') : profile?.nickname

    const setRemark = React.useCallback(async () => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        // 当前备注（用作默认值）
        const current = RemarksCache.get(userId) ?? ''

        const dlg = dialog({
            headline: '设置备注名',
            body: `
                <mdui-text-field
                    id="remark-input"
                    label="备注名"
                    variant="outlined"
                    style="width: 100%"
                    clearable
                ></mdui-text-field>
                <div style="margin-top: 10px; font-size: 12px; opacity: 0.6">
                    仅自己可见，留空则清除备注
                </div>
            `,
            closeOnEsc: true,
            closeOnOverlayClick: true,
            actions: [
                { text: '取消', onClick: () => true },
                {
                    text: '保存',
                    onClick: async () => {
                        const input = dlg.querySelector('#remark-input') as HTMLInputElement & { value: string }
                        const newRemark = (input?.value ?? '').trim()

                        try {
                            await UserApi.setUserRemark(client, {
                                access_token: session.token,
                                target_user_id: userId,
                                remark: newRemark,
                            })
                            // 本地更新 + 触发重渲染
                            RemarksCache.set(userId, newRemark)
                            forceUpdate()
                            showSnackbar({ message: newRemark ? '备注已保存' : '备注已清除' })
                        } catch (e) {
                            tipError(e, '保存备注失败')
                        }
                    },
                },
            ],
        })

        // 对话框打开后回填当前值
        setTimeout(() => {
            const input = dlg.querySelector('#remark-input') as HTMLInputElement | null
            if (input) input.value = current
        }, 10)
    }, [userId])

    if (loading) {
        return (
            <EffectOnly deps={[]} effect={() => CircleProgressDialog.show('加载中...')} />
        )
    }

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar onClick={() => ImageViewerDialog.show(avatar!)} src={avatar} />
                <div style={{
                    display: 'flex',
                    marginLeft: '15px',
                    marginRight: '15px',
                    flexDirection: 'column',
                    wordBreak: 'break-word',
                }}>
                    <span style={{ fontSize: '1.25rem' }}>{nickname}</span>
                </div>
            </div>

            <div style={{ marginTop: '10px' }} />

            <mdui-list>
                <CopyableListItem icon="info" value={profile?.id || ''} description="用户 ID" />
                {profile?.username && (
                    <CopyableListItem icon="alternate_email" value={profile.username} description="用户名" />
                )}
                {profile?.description && (
                    <CopyableListItem icon="description" value={profile.description} description="简介" />
                )}

                {!isMe && (
                    <mdui-list-item
                        icon="edit"
                        rounded
                        onClick={setRemark}
                    >
                        设置备注名
                    </mdui-list-item>
                )}

                {isMe && (
                    <mdui-list-item icon="edit" rounded onClick={() => EditMyProfileDialog.show()}>
                        编辑资料
                    </mdui-list-item>
                )}

                <mdui-list-item
                    icon="chat"
                    rounded
                    onClick={async () => {
                        const client = ClientManager.getActiveClient()
                        const session = ClientManager.getActiveSession()
                        if (!client || !session || !profile) return
                        try {
                            const chatId = await ChatApi.getOrCreatePrivateChat(client, {
                                access_token: session.token,
                                target_user_id: profile.id,
                            })
                            ref.current!.open = false
                            // ★ 通过 Router 实例导航（组件在 RouterProvider 之外）
                            Router.navigate({
                                to: '/chat/$chatId',
                                params: { chatId },
                                replace: true,   // 桌面端同级切换，避免历史栈膨胀
                            })
                        } catch (e) {
                            console.log(e)
                            tipError(e, '打开对话失败')
                        }
                    }}
                >
                    打开对话
                </mdui-list-item>
            </mdui-list>
        </mdui-dialog>
    )
}

UserProfileDialog.show = function (userId: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<UserProfileDialog userId={userId} onClose={onClose} />)
}