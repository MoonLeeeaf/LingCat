import ReactClient from "react-dom/client"
import React from 'react'
import { dialog, Dialog, TextField } from "mdui"
import type { IUser } from "lingcat-protocol"
import EffectOnly from "../EffectOnly.tsx"
import CircleProgressDialog from "../CircleProgressDialog.tsx"
import ClientManager from "../../ClientManager.ts"
import default_avatar from '../../default_avatar.png'
import { UserApi, FileApi, OAuthApi } from "lingcat-client-protocol"
import Avatar from "../Avatar.tsx"
import tipError from "../tipError.ts"
import showSnackbar from "../showSnackbar.ts"
import AppState from "../AppState.ts"
import { cropImageToSquare } from "../imageUtils.ts"
import ClientConfigInstance from "../../ClientConfig.ts"

export default function EditMyProfileDialog({ ref, onClose }: { ref?: React.RefObject<any>, onClose?: () => void }) {
    ref = ref || React.useRef<Dialog>(undefined)

    const [loading, setLoading] = React.useState(true)
    const [profile, setProfile] = React.useState<IUser>()
    const [bindings, setBindings] = React.useState<string[]>([])

    React.useEffect(() => {
        (async () => {
            const token = ClientManager.getActiveUserSession().token
            try {
                setProfile(await UserApi.queryMyUserInfo(ClientManager.client, { access_token: token }))
            } catch (e) {
                tipError(e, '加载失败')
            }
            if (ClientConfigInstance.oauthProviders.length > 0) {
                try {
                    setBindings(await OAuthApi.getOAuthBindings(ClientManager.client, { access_token: token }))
                } catch (e) {
                    console.warn('[OAuth] 获取绑定失败', e)
                }
            }
            setLoading(false)
        })()
    }, [])

    React.useEffect(() => {
        if (loading) return
        ref.current!.addEventListener('closed', onClose)
        ref.current!.open = true

        const onChange = async () => {
            const file = chooseAvatarFileRef.current!.files?.[0] as File
            if (file == null) return

            try {
                const token = await FileApi.requestUploadFileToken(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token
                })

                // 头像统一裁剪为 1:1
                const cropped = await cropImageToSquare(file, 512)

                const hash = await FileApi.uploadFile(ClientManager.client, {
                    file_upload_token: token,
                    file_data: cropped,
                    mime: 'image/png',
                    file_name: 'avatar.png',
                })

                await UserApi.updateMyProfile(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    avatar_file_hash: hash,
                })

                showSnackbar({
                    message: "更新头像成功! 请刷新页面"
                })
            } catch (e) {
                console.log(e)
                tipError(e, '更新头像失败')
            }
        }
        chooseAvatarFileRef.current!.addEventListener('change', onChange)

        return () => {
            ref.current?.removeEventListener('closed', onClose)
            chooseAvatarFileRef.current?.removeEventListener('change', onChange)
        }
    }, [loading])

    const chooseAvatarFileRef = React.useRef<HTMLInputElement>(null)

    const editNickNameRef = React.useRef<TextField>(null)
    const editUserNameRef = React.useRef<TextField>(null)
    const editDescriptionRef = React.useRef<TextField>(null)

    return loading ? (<EffectOnly deps={[]} effect={() => {
        return CircleProgressDialog.show('加载中...')
    }} />)
        : (
            <mdui-dialog close-on-overlay-click close-on-esc ref={ref}>
                <div style={{
                    display: "none"
                }}>
                    <input type="file" name="选择头像" ref={chooseAvatarFileRef}
                        accept="image/*" />
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Avatar src={profile?.avatar_file_hash ? ClientManager.client.getFileUrlByHashAndToken(profile?.avatar_file_hash, AppState.fileAccessToken) : default_avatar} onClick={() => {
                        chooseAvatarFileRef.current!.value = ''
                        chooseAvatarFileRef.current!.click()
                    }} style={{
                        width: '50px',
                        height: '50px',
                    }} />
                    <mdui-text-field variant="outlined" placeholder="昵称" ref={editNickNameRef} style={{
                        marginLeft: "15px",
                    }} value={profile?.nickname}></mdui-text-field>
                </div>

                <mdui-text-field style={{ marginTop: "20px", }} variant="outlined" label="用户 ID" value={profile?.id || ''} readonly onClick={(e) => {
                    const input = e.target as HTMLInputElement
                    input.select()
                    input.setSelectionRange(0, 1145141919810)
                }}></mdui-text-field>
                <mdui-text-field style={{ marginTop: "20px", }} variant="outlined" label="用户名" value={profile?.username || ''} ref={editUserNameRef}></mdui-text-field>
                <mdui-text-field style={{ marginTop: "20px", }} variant="outlined" label="简介" value={profile?.description || ''} ref={editDescriptionRef}></mdui-text-field>

                {ClientConfigInstance.oauthProviders.map((p) => {
                    const bound = bindings.includes(p.id)
                    const name = p.display_name || p.id
                    return <mdui-button
                        key={p.id}
                        variant={bound ? 'text' : 'tonal'}
                        icon="key"
                        style={{ marginTop: '16px', width: '100%' }}
                        onClick={async () => {
                            const token = ClientManager.getActiveUserSession().token
                            if (!bound) {
                                location.href = './oauth/' + encodeURIComponent(p.id) + '/login?mode=bind&access_token=' + encodeURIComponent(token)
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
                                                await OAuthApi.unbindOAuth(ClientManager.client, { access_token: token, provider: p.id })
                                                setBindings(await OAuthApi.getOAuthBindings(ClientManager.client, { access_token: token }))
                                                showSnackbar({ message: '已解绑 ' + name })
                                            } catch (e) {
                                                tipError(e, '解绑失败')
                                            }
                                        },
                                    },
                                ],
                            })
                        }}
                    >{bound ? '解绑 ' : '绑定 '}{name}</mdui-button>
                })}

                <mdui-button slot="action" variant="text" onClick={() => ref.current!.open = false}>取消</mdui-button>
                <mdui-button slot="action" variant="text" onClick={async () => {
                    try {
                        await UserApi.updateMyProfile(ClientManager.client, {
                            access_token: ClientManager.getActiveUserSession().token,
                            nickname: editNickNameRef.current?.value,
                            username: editUserNameRef.current?.value,
                            description: editDescriptionRef.current?.value,
                        })
                    } catch (e) {
                        tipError(e, '更新资料失败')
                    }
                    showSnackbar({
                        message: "修改成功, 刷新页面以更新",
                    })
                }}>更新</mdui-button>
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
