import ReactClient from 'react-dom/client'
import React from 'react'
import { $, dialog, Dialog, Tabs } from 'mdui'
import type { IChat, IChatSettings } from 'lingcat-protocol'
import EffectOnly from '../EffectOnly.tsx'
import CircleProgressDialog from '../CircleProgressDialog.tsx'
import ClientManager from '../../ClientManager.ts'
import { ChatApi, FileApi } from 'lingcat-client-protocol'
import tipError from '../tipError.ts'
import ProfileCache from '../../ProfileCache.ts'
import showSnackbar from '../showSnackbar.ts'
import { cropImageToSquare } from '../../lib/imageUtils.ts'

interface ChatSettingsDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    chatId: string
    onClose?: () => void
}

export default function ChatSettingsDialog({ ref, chatId, onClose }: ChatSettingsDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const uploadChatAvatarRef = React.useRef<HTMLInputElement>(null)
    const tabsRef = React.useRef<Tabs>(null)

    const [loading, setLoading] = React.useState(true)
    const [profile, setProfile] = React.useState<IChat>()
    const [localSettings, setLocalSettings] = React.useState<IChatSettings>({} as any)
    const [isSaving, setIsSaving] = React.useState(false)

    React.useEffect(() => {
        let cancelled = false
        ;(async () => {
            try {
                const chat = await ProfileCache.queryChatInfo(chatId)
                if (!cancelled) setProfile(chat ?? undefined)
            } catch (e) {
                if (!cancelled) tipError(e, '加载失败')
            }
            if (!cancelled) setLoading(false)
        })()
        return () => { cancelled = true }
    }, [chatId])

    // profile 加载完后初始化 settings
    React.useEffect(() => {
        if (!profile?.settings) return
        try {
            setLocalSettings(JSON.parse(profile.settings))
        } catch { /* ignore */ }
    }, [profile])

    // 打开 + 关闭监听 + 头像上传 change
    React.useEffect(() => {
        if (loading) return
        const el = ref.current
        const avatarInput = uploadChatAvatarRef.current
        if (!el) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== el) return
            onClose?.()
        }
        el.addEventListener('closed', handleClosed)

        const onAvatarChange = async () => {
            const file = avatarInput?.files?.[0]
            if (!file) return

            const client = ClientManager.getActiveClient()
            const session = ClientManager.getActiveSession()
            if (!client || !session) return

            try {
                const token = await FileApi.requestUploadFileToken(client, {
                    access_token: session.token,
                })
                const cropped = await cropImageToSquare(file, 512)
                const hash = await FileApi.uploadFile(client, {
                    file_upload_token: token,
                    file_data: cropped,
                    mime: 'image/png',
                    file_name: 'avatar.png',
                })
                await ChatApi.updateChatProfile(client, {
                    access_token: session.token,
                    chat_id: chatId,
                    avatar_file_hash: hash,
                })
                showSnackbar({ message: '更新头像成功! 请刷新页面' })
                delete (ProfileCache as any).chat_info[chatId]
            } catch (e) {
                console.log(e)
                tipError(e, '更新头像失败')
            }
        }
        avatarInput?.addEventListener('change', onAvatarChange)

        el.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (cancelled) return
                el.open = true
                const tabs = tabsRef.current
                if (tabs?.shadowRoot) {
                    $(tabs.shadowRoot).append(`
                        <style>
                            .container { background-color: inherit !important; }
                        </style>
                    `)
                }
            })
        })

        return () => {
            cancelled = true
            el.removeEventListener('closed', handleClosed)
            avatarInput?.removeEventListener('change', onAvatarChange)
        }
    }, [loading, onClose, chatId])

    // 设置更新（乐观 + 回滚）
    const updateSetting = async (key: keyof IChatSettings, value: boolean) => {
        if (isSaving) return
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        setIsSaving(true)
        const prev = localSettings
        const next = { ...localSettings, [key]: value }
        setLocalSettings(next)

        try {
            await ChatApi.updateChatSettings(client, {
                access_token: session.token,
                chat_id: chatId,
                settings: next,
            })
            if (profile) {
                profile.settings = JSON.stringify(next)
                if ((ProfileCache as any).chat_info) {
                    ;(ProfileCache as any).chat_info[chatId] = profile
                }
            }
        } catch (e) {
            tipError(e, '更新设置失败')
            setLocalSettings(prev)
        } finally {
            setIsSaving(false)
        }
    }

    // 快速改 profile 字段的 dialog（标题 / 简介 / 标识符）
    const quickEditProfileField = (
        headline: string,
        fieldLabel: string,
        field: 'title' | 'description' | 'unique',
        initialValue: string | undefined,
    ) => {
        const dlg = dialog({
            headline,
            body: `<mdui-text-field label="${fieldLabel}" id="field" variant="outlined"></mdui-text-field>`,
            closeOnEsc: true,
            closeOnOverlayClick: true,
            actions: [
                { text: '取消', onClick: () => true },
                {
                    text: '更改',
                    onClick: async () => {
                        const value = (dlg.querySelector('#field') as HTMLInputElement | null)?.value
                        if (value == null) return
                        const client = ClientManager.getActiveClient()
                        const session = ClientManager.getActiveSession()
                        if (!client || !session) return
                        try {
                            await ChatApi.updateChatProfile(client, {
                                access_token: session.token,
                                chat_id: chatId,
                                [field]: value,
                            })
                            delete (ProfileCache as any).chat_info[chatId]
                        } catch (e) {
                            console.log(e)
                            tipError(e, `${headline}失败`)
                        }
                    },
                },
            ],
        })
        setTimeout(() => {
            const input = dlg.querySelector('#field') as HTMLInputElement | null
            if (input) input.value = initialValue ?? ''
        }, 10)
    }

    if (loading) {
        return <EffectOnly deps={[]} effect={() => CircleProgressDialog.show('加载中...')} />
    }

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc headline="对话设定">
            <input
                accept="image/*"
                type="file"
                ref={uploadChatAvatarRef}
                style={{ display: 'none' }}
            />

            {profile?.type === 'group' ? (
                <mdui-tabs value="资料" ref={tabsRef}>
                    <mdui-tab value="资料">资料</mdui-tab>
                    <mdui-tab value="入群">入群</mdui-tab>

                    <mdui-tab-panel slot="panel" value="资料">
                        <mdui-list>
                            <mdui-list-item
                                icon="photo"
                                rounded
                                onClick={() => uploadChatAvatarRef.current?.click()}
                            >
                                更改群组头像
                            </mdui-list-item>
                            <mdui-list-item
                                icon="title"
                                rounded
                                onClick={() => quickEditProfileField('更改标题', '标题', 'title', profile?.title!)}
                            >
                                更改标题
                            </mdui-list-item>
                            <mdui-list-item
                                icon="description"
                                rounded
                                onClick={() => quickEditProfileField('更改简介', '简介', 'description', profile?.description!)}
                            >
                                更改简介
                            </mdui-list-item>
                            <mdui-list-item
                                icon="info"
                                rounded
                                onClick={() => quickEditProfileField('更改标识符', '标识符', 'unique', profile?.chat_unique!)}
                            >
                                更改标识符
                            </mdui-list-item>
                        </mdui-list>
                    </mdui-tab-panel>

                    <mdui-tab-panel slot="panel" value="入群">
                        <mdui-list>
                            <mdui-list-item
                                rounded
                                onClick={() => updateSetting('allow_join', !localSettings.allow_join)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <span style={{ flex: 1 }}>允许加入</span>
                                    <mdui-switch
                                        checked={localSettings.allow_join || false}
                                        disabled={isSaving}
                                        checked-icon=""
                                        onClick={(e: any) => e.stopPropagation()}
                                        onChange={(v: any) => updateSetting('allow_join', v.target.checked)}
                                    />
                                </div>
                            </mdui-list-item>
                            <mdui-list-item
                                rounded
                                onClick={() => updateSetting('allow_meeting', !localSettings.allow_meeting)}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <span style={{ flex: 1 }}>允许会议</span>
                                    <mdui-switch
                                        checked={localSettings.allow_meeting !== false}
                                        disabled={isSaving}
                                        checked-icon=""
                                        onClick={(e: any) => e.stopPropagation()}
                                        onChange={(v: any) => updateSetting('allow_meeting', v.target.checked)}
                                    />
                                </div>
                            </mdui-list-item>
                        </mdui-list>
                    </mdui-tab-panel>
                </mdui-tabs>
            ) : (
                <span slot="description">暂无可以设定的内容</span>
            )}
        </mdui-dialog>
    )
}

ChatSettingsDialog.show = function (chatId: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ChatSettingsDialog chatId={chatId} onClose={onClose} />)
}