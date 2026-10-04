import ReactClient from "react-dom/client"
import React from 'react'
import ReloadableImage from "../ReloadableImage.tsx"
import { $, dialog, Dialog, Tabs } from "mdui"
import useEventListener from "../useEventListener.ts"
import { IChat, IChatSettings, IUser } from "lingcat-protocol"
import EffectOnly from "../EffectOnly.tsx"
import CircleProgressDialog from "../CircleProgressDialog.tsx"
import ClientManager from "../../ClientManager.ts"
import default_avatar from '../default_avatar.png'
import { ChatApi, FileApi, UserApi } from "lingcat-client-protocol"
import Avatar from "../Avatar.tsx"
import tipError from "../tipError.ts"
import ProfileCache from "../../ProfileCache.ts"
import AppState from "../AppState.ts"
import UserProfileDialog from "../viewer/UserProfileDialog.tsx"
import ImageViewerDialog from "../viewer/ImageViewerDialog.tsx"
import showSnackbar from "../showSnackbar.ts"

export default function ChatSettingsDialog({ ref, chat_id, onClose }: { ref?: React.RefObject<any>, chat_id: string, onClose?: () => void }) {
    ref = ref || React.useRef<Dialog>(undefined)

    const [loading, setLoading] = React.useState(true)
    const [profile, setProfile] = React.useState<IChat>()

    React.useEffect(() => {
        (async () => {
            try {
                const chat = await ProfileCache.queryChatInfo(chat_id)
                setProfile(chat!)
            } catch (e) {
                tipError(e, '加载失败')
            }
            setLoading(false)
        })()
    }, [chat_id])

    React.useEffect(() => {
        if (loading) return
        const eventName = 'closed'
        ref.current!.addEventListener(eventName, onClose)

        const onAvatarChange = async () => {
            const file = uploadChatAvatarRef.current!.files?.[0] as File
            if (file == null) return

            try {
                const token = await FileApi.requestUploadFileToken(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token
                })

                const hash = await FileApi.uploadFile(ClientManager.client, {
                    file_upload_token: token,
                    file_data: file,
                })

                await ChatApi.updateChatProfile(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    chat_id,
                    avatar_file_hash: hash,
                })

                showSnackbar({
                    message: "更新头像成功! 请刷新页面"
                })
                delete ProfileCache.chat_info[chat_id]
            } catch (e) {
                console.log(e)
                tipError(e, '更新头像失败')
            }
        }

        setTimeout(() => {
            ref.current!.open = true
            uploadChatAvatarRef.current!.addEventListener('change', onAvatarChange)

            $(tabsRef.current?.shadowRoot).append(`
                <style>
                    .container {
                        background-color: inherit !important
                    }
                </style>
            `)
        }, 10)

        return () => {
            ref.current?.removeEventListener(eventName, onClose)
            uploadChatAvatarRef.current?.removeEventListener('change', onAvatarChange)
        }
    }, [loading])

    const uploadChatAvatarRef = React.useRef<HTMLInputElement>(null)
    const tabsRef = React.useRef<Tabs>(null)

    const [localSettings, setLocalSettings] = React.useState<IChatSettings>({} as any)

    React.useEffect(() => {
        if (profile?.settings) {
            try {
                const parsed = JSON.parse(profile.settings)
                setLocalSettings(parsed)
            } catch { }
        }
    }, [profile])

    const [isSaving, setIsSaving] = React.useState(false)

    // 更新设置的函数
    const updateSetting = async (key: keyof IChatSettings, value: boolean) => {
        if (isSaving) return // 防止并发
        setIsSaving(true)

        // 1. 乐观更新 UI
        const newSettings = { ...localSettings, [key]: value }
        setLocalSettings(newSettings)

        try {
            // 2. 发送请求
            await ChatApi.updateChatSettings(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                chat_id,
                settings: newSettings,
            })
            // 3. 更新缓存
            if (profile) {
                profile.settings = JSON.stringify(newSettings)
                // 如果 ProfileCache 有缓存，手动更新
                if (ProfileCache.chat_info) {
                    ProfileCache.chat_info[chat_id] = profile
                }
            }
        } catch (e) {
            // 4. 失败回滚
            tipError(e, '更新设置失败')
            if (profile?.settings) {
                try {
                    const parsed = JSON.parse(profile.settings)
                    setLocalSettings(parsed)
                } catch { }
            } else {
                setLocalSettings({} as any)
            }
        } finally {
            setIsSaving(false)
        }
    }

    return loading ? (<EffectOnly deps={[]} effect={() => {
        return CircleProgressDialog.show('加载中...')
    }} />)
        : (
            <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc headline="对话设定">
                <input accept="image/*" type="file" name="上传对话头像" ref={uploadChatAvatarRef} style={{ display: 'none' }}></input>
                {
                    ({
                        group: (
                            <mdui-tabs value="资料" ref={tabsRef}>
                                <mdui-tab value="资料">资料</mdui-tab>
                                <mdui-tab value="入群">入群</mdui-tab>

                                <mdui-tab-panel slot="panel" value="资料">
                                    <mdui-list>
                                        <mdui-list-item icon="photo" rounded onClick={() => uploadChatAvatarRef.current?.click()}>更改群组头像</mdui-list-item>
                                        <mdui-list-item icon="title" rounded onClick={() => {
                                            const dlg = dialog({
                                                headline: "更改标题",
                                                body: `<mdui-text-field label="标题" id="title"></mdui-text-field>`,
                                                closeOnEsc: true,
                                                closeOnOverlayClick: true,
                                                actions: [{
                                                    text: "取消",
                                                    onClick: () => true,
                                                }, {
                                                    text: "更改",
                                                    variant: 'tonal',
                                                    onClick: async () => {
                                                        // @ts-ignore
                                                        const title = dlg.querySelector('#title').value
                                                        try {
                                                            await ChatApi.updateChatProfile(ClientManager.client, {
                                                                access_token: ClientManager.getActiveUserSession().token,
                                                                chat_id,
                                                                title,
                                                            })
                                                            delete ProfileCache.chat_info[chat_id]
                                                        } catch (e) {
                                                            console.log(e)
                                                            tipError(e, '更改标题失败')
                                                        }
                                                    },
                                                }]
                                            })
                                            // @ts-ignore
                                            dlg.querySelector('#title').value = profile?.title
                                        }}>更改标题</mdui-list-item>
                                        <mdui-list-item icon="description" rounded onClick={() => {
                                            const dlg = dialog({
                                                headline: "更改简介",
                                                body: `<mdui-text-field label="简介" id="description"></mdui-text-field>`,
                                                closeOnEsc: true,
                                                closeOnOverlayClick: true,
                                                actions: [{
                                                    text: "取消",
                                                    onClick: () => true,
                                                }, {
                                                    text: "更改",
                                                    variant: 'tonal',
                                                    onClick: async () => {
                                                        // @ts-ignore
                                                        const description = dlg.querySelector('#description').value
                                                        try {
                                                            await ChatApi.updateChatProfile(ClientManager.client, {
                                                                access_token: ClientManager.getActiveUserSession().token,
                                                                chat_id,
                                                                description,
                                                            })
                                                            delete ProfileCache.chat_info[chat_id]
                                                        } catch (e) {
                                                            console.log(e)
                                                            tipError(e, '更改简介失败')
                                                        }
                                                    },
                                                }]
                                            })
                                            // @ts-ignore
                                            dlg.querySelector('#description').value = profile?.description
                                        }}>更改简介</mdui-list-item>
                                        <mdui-list-item icon="info" rounded onClick={() => {
                                            const dlg = dialog({
                                                headline: "更改标识符",
                                                body: `<mdui-text-field label="标识符" id="unique"></mdui-text-field>`,
                                                closeOnEsc: true,
                                                closeOnOverlayClick: true,
                                                actions: [{
                                                    text: "取消",
                                                    onClick: () => true,
                                                }, {
                                                    text: "更改",
                                                    variant: 'tonal',
                                                    onClick: async () => {
                                                        // @ts-ignore
                                                        const unique = dlg.querySelector('#unique').value
                                                        try {
                                                            await ChatApi.updateChatProfile(ClientManager.client, {
                                                                access_token: ClientManager.getActiveUserSession().token,
                                                                chat_id,
                                                                unique,
                                                            })
                                                            delete ProfileCache.chat_info[chat_id]
                                                        } catch (e) {
                                                            console.log(e)
                                                            tipError(e, '更改标识符失败')
                                                        }
                                                    },
                                                }]
                                            })
                                            // @ts-ignore
                                            dlg.querySelector('#unique').value = profile?.chat_unique
                                        }}>更改标识符</mdui-list-item>
                                    </mdui-list>
                                </mdui-tab-panel>
                                <mdui-tab-panel slot="panel" value="入群">
                                    <mdui-list>
                                        <mdui-list-item rounded onClick={() => {
                                            updateSetting('allow_join', !localSettings.allow_join)
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <span style={{ flex: 1 }}>允许加入</span>
                                                <mdui-switch
                                                    checked={localSettings.allow_join || false}
                                                    disabled={isSaving}
                                                    checked-icon=""
                                                />
                                            </div>
                                        </mdui-list-item>
                                        <mdui-list-item rounded onClick={() => {
                                            updateSetting('allow_meeting', !localSettings.allow_meeting)
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                                <span style={{ flex: 1 }}>允许会议 / 屏幕共享</span>
                                                <mdui-switch
                                                    checked={localSettings.allow_meeting !== false}
                                                    disabled={isSaving}
                                                    checked-icon=""
                                                />
                                            </div>
                                        </mdui-list-item>
                                    </mdui-list>
                                </mdui-tab-panel>
                            </mdui-tabs>
                        ),
                        private: <span slot="description">暂无可以设定的内容</span>,
                    })[profile?.type!]
                }
            </mdui-dialog>
        )
}

ChatSettingsDialog.show = function (chat_id: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ChatSettingsDialog chat_id={chat_id} onClose={onClose} />)
}
