import React from 'react'
import type { IMessage, IUser, IMessageEntity } from 'lingcat-protocol'
import ProfileCache from '../../ProfileCache.ts'
import ClientManager from '../../ClientManager.ts'
import SessionEnv from '../../SessionEnv.ts'
import default_avatar from '../../default_avatar.png'
import getFileUrl from '../../lib/getFileUrl.ts'
import tipError from '../tipError.ts'
import Message from './Message.tsx'
import RichText from './RichText.tsx'
import RemarksCache from '../../RemarksCache.ts'
import { UnlockPasswordDialog } from '../e2e/UnlockPasswordDialog.tsx'
import { useE2EStore } from '../../lib/e2e/useE2EStore.ts'
import showSnackbar from '../showSnackbar.ts'
import { dialog } from 'mdui'

export interface ChatMessageProps {
    msg: IMessage
    hideSender?: boolean
    onAvatarClick?: () => void
    messageMenus?: React.ReactNode
    avatarMenus?: React.ReactNode
}

export default function ChatMessage({
    msg,
    hideSender,
    onAvatarClick,
    messageMenus,
    avatarMenus,
}: ChatMessageProps) {
    const [isMe, setIsMe] = React.useState(false)
    const [profile, setProfile] = React.useState<IUser>()

    // E2E 解密状态
    const e2eStatus = useE2EStore(s => s.status)
    const decryptFromPeer = useE2EStore(s => s.decryptFromPeer)

    const [decryptedPayload, setDecryptedPayload] = React.useState<{ text: string, entities?: IMessageEntity[] } | null>(null)
    const [decryptError, setDecryptError] = React.useState(false)
    const [needOldVersion, setNeedOldVersion] = React.useState<number | null>(null)

    React.useEffect(() => {
        let cancelled = false
            ; (async () => {
                if (!msg.sender_user_id || msg.system) return
                try {
                    const p = await ProfileCache.queryUserInfo(msg.sender_user_id)
                    if (cancelled) return
                    setProfile(p)
                    const me = await ClientManager.getMe()
                    if (cancelled) return
                    setIsMe(me.id === p.id)
                } catch (e) {
                    if (!cancelled) tipError(e, '加载消息 ' + msg.id + ' 失败')
                }
            })()
        return () => { cancelled = true }
    }, [msg.sender_user_id, msg.system])

    const myPrivateKeys = useE2EStore(s => s.myPrivateKeys) 
    React.useEffect(() => {
        const e2eEntity = msg.entities?.find(e => e.type === 'e2e')

        if (!e2eEntity || !e2eEntity.data) {
            setDecryptedPayload({ text: msg.text, entities: msg.entities })
            setDecryptError(false)
            return
        }

        if (e2eStatus !== 'unlocked') {
            setDecryptedPayload({ text: '🔒 [需要解锁加密消息]' })
            setDecryptError(true) // 标记为错误状态，以便渲染点击事件
            return
        }

        let cancelled = false
            ; (async () => {
                const plainJson = await decryptFromPeer(e2eEntity.data!, msg.sender_user_id!)
                if (cancelled) return
                if (plainJson) {
                    try {
                        const parsed = JSON.parse(plainJson)
                        if (parsed.needVersion) {
                            setDecryptedPayload({ text: parsed.text })
                            setDecryptError(true)
                            setNeedOldVersion(parsed.needVersion)
                            return
                        }

                        setDecryptedPayload({
                            text: parsed.text,
                            entities: parsed.entities
                        })
                        setDecryptError(false)
                        setNeedOldVersion(null)
                    } catch {
                        setDecryptedPayload({ text: plainJson })
                        setDecryptError(false)
                    }
                } else {
                    setDecryptedPayload({ text: '🔒 [无法解密的消息]' })
                    setDecryptError(true)
                }
            })()

        return () => { cancelled = true }
    }, [msg.id, msg.text, msg.entities, e2eStatus, decryptFromPeer, myPrivateKeys])

    const unlockSpecificVersion = useE2EStore(s => s.unlockSpecificVersion)
    const changeVersionPassword = useE2EStore(s => s.changeVersionPassword)

    const handleUnlockClick = () => {
        if (needOldVersion) {
            const dlg = dialog({
                headline: `解锁历史消息 (v${needOldVersion})`,
                body: `
                    <div style="margin-bottom: 12px; font-size: 14px; opacity: 0.8;">
                        该消息使用了旧版本的密码加密。
                    </div>
                    <mdui-text-field id="old-pwd" label="旧密码" type="password" variant="outlined" style="width: 100%; margin-bottom: 12px"></mdui-text-field>
                    <mdui-text-field id="new-pwd" label="新密码 (选填)" type="password" variant="outlined" style="width: 100%" helper="填写后会将 v${needOldVersion} 的密码统一更新为新密码"></mdui-text-field>
                `,
                closeOnEsc: true,
                closeOnOverlayClick: true,
                actions: [
                    { text: '取消', onClick: () => true },
                    {
                        text: '解锁',
                        onClick: () => {
                            // @ts-ignore
                            const oldPwd = (dlg.querySelector('#old-pwd') as any)?.value ?? ''
                            // @ts-ignore
                            const newPwd = (dlg.querySelector('#new-pwd') as any)?.value ?? ''

                            if (!oldPwd) {
                                showSnackbar({ message: '请输入旧密码' })
                                return false
                            }

                            const doTask = async () => {
                                if (newPwd) {
                                    if (newPwd.length < 6) return '新密码至少需要 6 位'
                                    const ok = await changeVersionPassword(needOldVersion, oldPwd, newPwd)
                                    return ok ? null : '密码错误或修改失败'
                                } else {
                                    const ok = await unlockSpecificVersion(needOldVersion, oldPwd)
                                    return ok ? null : '密码错误'
                                }
                            }

                            doTask().then(errMsg => {
                                if (!errMsg) {
                                    showSnackbar({ message: newPwd ? '密码已更新并解锁' : '旧密钥解锁成功' })
                                    dlg.open = false
                                } else {
                                    showSnackbar({ message: errMsg })
                                }
                            })

                            return false // 阻止 MDUI 自动关闭
                        }
                    }
                ]
            })
            return
        }

        if (e2eStatus === 'locked') {
            UnlockPasswordDialog.show('unlock')
        } else if (e2eStatus === 'disabled') {
            showSnackbar({ message: '你尚未开启端到端加密' })
        } else if (e2eStatus === 'error_fetch') {
            showSnackbar({ message: '网络异常，获取密钥失败' })
        } else if (e2eStatus === 'error_server') {
            showSnackbar({ message: '服务端数据异常，无法获取密钥' })
        } else {
            showSnackbar({ message: '密钥状态未知，请刷新重试' })
        }
    }

    const isLockedPlaceholder = decryptedPayload?.text.startsWith('🔒')
    const isE2EMessage = !!msg.entities?.find(e => e.type === 'e2e')

    let renderText = msg.text
    let renderEntities = msg.entities || []

    if (isE2EMessage && decryptedPayload && !isLockedPlaceholder && !decryptError) {
        renderText = decryptedPayload.text
        renderEntities = decryptedPayload.entities || []
    }

    const senderName = RemarksCache.get(msg.sender_user_id!) || profile?.nickname || ''

    return (
        <Message
            time={msg.time}
            edited_time={msg.edited_at}
            avatarMenus={avatarMenus}
            onAvatarClick={onAvatarClick}
            messageMenus={messageMenus}
            isSystem={msg.system || false}
            senderName={senderName}
            avatar={profile?.avatar_file_hash
                ? getFileUrl(profile.avatar_file_hash, SessionEnv.myFileAccessToken)!
                : default_avatar}
            isAtRight={isMe}
            hideSender={hideSender}
            senderUserId={msg.sender_user_id ?? undefined}
        >
                        {isLockedPlaceholder || decryptError ? (
                <div
                    onClick={handleUnlockClick}
                    style={{
                        color: 'var(--mdui-color-error)',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '13px',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}
                >
                    {decryptedPayload?.text}
                    {(e2eStatus === 'locked' || needOldVersion) && (
                        <span style={{ marginLeft: '4px',}}>
                            (点击解锁)
                        </span>
                    )}
                </div>
            ) : (
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    <RichText
                        text={renderText}
                        entities={renderEntities}
                        isSystem={msg.system!}
                        messageId={msg.id}
                        chatId={msg.chat_id}
                        senderName={senderName}
                    />
                    {isE2EMessage && (
                        <mdui-icon
                            name="lock"
                            style={{
                                position: 'absolute',
                                bottom: '6px',  // 距底部 6px
                                [isMe ? 'left' : 'right']: '6px',   // 距右侧 6px
                                fontSize: '12px',
                                opacity: 0.2,   // 非常淡，作为背景水印
                                pointerEvents: 'none', // 让鼠标点击穿透，不影响长按菜单
                            }}
                        />
                    )}
                </div>
            )}
        </Message>
    )
}