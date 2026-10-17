import React from 'react'
import ReactClient from 'react-dom/client'
import { dialog, Dialog } from 'mdui' // ★ 引入 dialog
import type { IChat } from 'lingcat-protocol'
import { ChatApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import ProfileCache from '../../ProfileCache.ts'
import SessionEnv from '../../SessionEnv.ts'
import default_avatar from '../../default_avatar.png'
import getFileUrl from '../../lib/getFileUrl.ts'
import Avatar from '../Avatar.tsx'
import CopyableListItem from '../CopyableListItem.tsx'
import CircleProgressDialog from '../CircleProgressDialog.tsx'
import EffectOnly from '../EffectOnly.tsx'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts' // ★ 引入 showSnackbar
import UserProfileDialog from './UserProfileDialog.tsx'
import ImageViewerDialog from './ImageViewerDialog.tsx'
import { Router } from '../routes/Router.ts'
import RemarksCache from '../../RemarksCache.ts'
import E2EManager from '../../lib/e2e/E2EManager.ts'
import { UnlockPasswordDialog } from '../e2e/UnlockPasswordDialog.tsx'
import { useE2EStore } from '../../lib/e2e/useE2EStore.ts'
import copyToClipboard from '../../lib/copyToClipboard.ts'

function findFavourited(chatId: string) {
    return SessionEnv.favouritedChats?.findIndex(chat => chat.id === chatId)
}

interface ChatProfileDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    chatId: string
    onClose?: () => void
}

export default function ChatProfileDialog({ ref, chatId, onClose }: ChatProfileDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const [loading, setLoading] = React.useState(true)
    const [profile, setProfile] = React.useState<IChat>()
    const [favourited, setFavourited] = React.useState(findFavourited(chatId) !== -1)

    // E2E 状态
    const e2eStatus = useE2EStore(s => s.status)
    const myPub = useE2EStore(s => s.myPublicKey)
    const myKeyVersion = useE2EStore(s => s.myKeyVersion)
    const generateNewKey = useE2EStore(s => s.generateNewKey)

    const peerKeys = useE2EStore(s => s.peerKeys)
    const peerVerifyStatus = useE2EStore(s => s.peerVerifyStatus)
    const setPeerVerified = useE2EStore(s => s.setPeerVerified)
    const fetchPeerKeys = useE2EStore(s => s.fetchPeerKeys)

    React.useEffect(() => {
        let cancelled = false
            ; (async () => {
                try {
                    const chat = await ProfileCache.queryChatInfo(chatId)
                    if (cancelled) return
                    setProfile(chat ?? undefined)
                    setFavourited(findFavourited(chatId) !== -1)
                } catch (e) {
                    if (!cancelled) tipError(e, '加载失败')
                }
                if (!cancelled) setLoading(false)
            })()
        return () => { cancelled = true }
    }, [chatId])

    // 静默拉取对方公钥
    React.useEffect(() => {
        if (profile?.type === 'private' && profile.peer_user_id && !peerKeys[profile.peer_user_id]) {
            fetchPeerKeys([profile.peer_user_id])
        }
    }, [profile, peerKeys, fetchPeerKeys])

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

    const userRemark = profile?.peer_user_id
        ? RemarksCache.get(profile.peer_user_id)
        : undefined

    if (loading) {
        return (
            <EffectOnly deps={[]} effect={() => CircleProgressDialog.show('加载中...')} />
        )
    }

    const peerPub = profile?.peer_user_id ? peerKeys[profile.peer_user_id] : null
    const verifyStatus = profile?.peer_user_id ? peerVerifyStatus[profile.peer_user_id] : 'unverified'

    // ============================================================
    //  E2E 操作：生成新密钥（重置）
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
                                        onClick: () => { // ★ 去掉 async
                                            const input = pwdDlg.querySelector('#rotate-pwd') as HTMLInputElement
                                            const pwd = input?.value ?? ''

                                            if (pwd.length < 6) {
                                                showSnackbar({ message: '密码至少需要 6 位' })
                                                return false // ★ 同步返回 false，阻止弹窗关闭
                                            }

                                            // 1. 发起异步请求
                                            generateNewKey(pwd, myKeyVersion + 1)
                                                .then(() => {
                                                    showSnackbar({ message: '新密钥已生成' })
                                                    pwdDlg.open = false // ★ 成功后，手动关闭弹窗
                                                })
                                                .catch((e) => {
                                                    tipError(e, '生成新密钥失败')
                                                    // 失败时不调用 pwdDlg.open = false，弹窗保持打开，用户可重试
                                                })

                                            return false // ★ 同步立即返回 false，拦住 MDUI 的自动关闭
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
    //  渲染端到端加密区块
    // ============================================================
    const renderE2ESection = () => {
        if (profile?.type !== 'private') return null

        if (e2eStatus === 'disabled') {
            return (
                <mdui-list-item icon="lock_outline" rounded onClick={() => UnlockPasswordDialog.show('setup')}>
                    开启端到端加密
                    <span slot="description">点击生成密钥并设置安全密码</span>
                </mdui-list-item>
            )
        }

        if (!peerPub) {
            return (
                <mdui-list-item icon="lock_outline" rounded disabled>
                    对方未开启端到端加密
                    <span slot="description">等待对方生成密钥后才可加密聊天</span>
                </mdui-list-item>
            )
        }

        const safetyNumber = myPub ? E2EManager.getSafetyNumber(myPub, peerPub) : '计算中...'

        return (
            <>
                {/* 1. 安全码展示（纯展示） */}
                <mdui-dropdown trigger="click">
                    <mdui-list-item
                        slot="trigger"
                        rounded
                        icon={verifyStatus === 'mismatch' ? 'gpp_bad' : 'lock'}
                        style={{ height: 'auto', paddingTop: '12px', paddingBottom: '12px' }}
                    >
                        <div slot="description" style={{ color: verifyStatus === 'mismatch' ? 'var(--mdui-color-error)' : 'rgb(var(--mdui-color-on-surface))' }}>
                            端到端加密安全码
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <div style={{
                                fontFamily: 'monospace',
                                fontSize: '15px',
                                letterSpacing: '1.5px',
                                lineHeight: '1.6',
                                wordSpacing: '4px',
                                color: verifyStatus === 'mismatch' ? 'var(--mdui-color-error)' : 'rgb(var(--mdui-color-on-surface-variant))'
                            }}>
                                {safetyNumber}
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
                                const ok = await copyToClipboard(safetyNumber)
                                showSnackbar({ message: ok ? '安全码已复制' : '复制失败' })
                            }}
                        >
                            复制安全码
                        </mdui-menu-item>
                    </mdui-menu>
                </mdui-dropdown>

                {/* 2. 验证状态操作（独立项） */}
                <mdui-list-item
                    icon={verifyStatus === 'verified' ? 'verified_user' : 'help_outline'}
                    rounded
                    onClick={() => {
                        if (verifyStatus !== 'verified' && profile.peer_user_id) {
                            setPeerVerified(profile.peer_user_id)
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

                {/* 3. 高级操作（重置密钥） */}
                <mdui-list-item
                    icon="vpn_key"
                    rounded
                    onClick={handleRotateKey}
                >
                    生成新密钥 (v{myKeyVersion + 1})
                    <span slot="description" style={{ color: 'var(--mdui-color-error)' }}>
                        如果怀疑私钥泄漏，可在此重置。会破坏当前的安全码。
                    </span>
                </mdui-list-item>
            </>
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
                    <span style={{ fontSize: '1.25rem' }}>
                        {userRemark || profile?.title}
                    </span>
                    {userRemark && profile?.title && (
                        <span style={{
                            fontSize: '0.8rem',
                            opacity: 0.55,
                            marginTop: '2px',
                        }}>
                            {profile.title}
                        </span>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '10px' }} />

            <mdui-list>
                <CopyableListItem icon="info" value={profile?.id || ''} description="对话 ID" />

                <mdui-list-item
                    icon={({ group: 'group', private: 'person' } as const)[profile?.type as 'group' | 'private']}
                    rounded
                >
                    {({ group: '群组', private: '私聊' } as const)[profile?.type as 'group' | 'private']}
                    <span slot="description">对话类型</span>
                </mdui-list-item>

                {profile?.chat_unique && (
                    <CopyableListItem icon="alternate_email" value={profile.chat_unique} description="对话标识符" />
                )}
                {profile?.description && (
                    <CopyableListItem icon="description" value={profile.description} description="简介" />
                )}

                {profile?.type === 'private' && (
                    <mdui-list-item
                        icon="info"
                        rounded
                        onClick={async () => {
                            const client = ClientManager.getActiveClient()
                            const session = ClientManager.getActiveSession()
                            if (!client || !session) return
                            try {
                                const userId = await ChatApi.getAnotherUserFromPrivateChat(client, {
                                    access_token: session.token,
                                    target_chat_id: chatId,
                                })
                                UserProfileDialog.show(userId)
                            } catch (e) {
                                tipError(e, '加载用户信息失败')
                            }
                        }}
                    >
                        用户信息
                    </mdui-list-item>
                )}

                {renderE2ESection()}

                <mdui-list-item
                    icon={favourited ? 'favorite_border' : 'favorite'}
                    rounded
                    onClick={async () => {
                        const client = ClientManager.getActiveClient()
                        const session = ClientManager.getActiveSession()
                        if (!client || !session) return
                        try {
                            await ChatApi.setChatFavourited(client, {
                                access_token: session.token,
                                chat_id: chatId,
                                favourited: !favourited,
                            })
                            const list = SessionEnv.favouritedChats ?? []
                            if (favourited) {
                                const idx = findFavourited(chatId)
                                if (idx >= 0) list.splice(idx, 1)
                            } else if (profile) {
                                list.push(profile)
                            }
                            SessionEnv.favouritedChats = list
                            setFavourited(!favourited)
                        } catch (e) {
                            console.log(e)
                            tipError(e, (favourited ? '取消' : '') + '收藏对话失败')
                        }
                    }}
                >
                    {favourited ? '取消收藏' : '收藏对话'}
                </mdui-list-item>

                <mdui-list-item
                    icon="chat"
                    rounded
                    onClick={() => {
                        const id = profile?.id
                        if (!id) return
                        ref.current!.open = false
                        // ★ 通过 Router 实例导航（组件在 RouterProvider 之外，不能用 useNavigate）
                        Router.navigate({
                            to: '/chat/$chatId',
                            params: { chatId: id },
                            replace: true,   // 桌面端同级切换，避免历史栈膨胀
                        })
                    }}
                >
                    打开对话
                </mdui-list-item>
            </mdui-list>
        </mdui-dialog>
    )
}

ChatProfileDialog.show = function (chatId: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ChatProfileDialog chatId={chatId} onClose={onClose} />)
}