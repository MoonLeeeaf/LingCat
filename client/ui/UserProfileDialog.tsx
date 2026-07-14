import ReactClient from "react-dom/client"
import React from 'react'
import ReloadableImage from "./ReloadableImage.tsx"
import { Dialog } from "mdui"
import useEventListener from "./useEventListener.ts"
import { IUser } from "lingcat-protocol"
import EffectOnly from "./EffectOnly.tsx"
import CircleProgressDialog from "./CircleProgressDialog.tsx"
import ClientManager from "../ClientManager.ts"
import default_avatar from '../default_avatar.png'
import { UserApi } from "lingcat-client-protocol"
import Avatar from "./Avatar.tsx"

export default function UserProfileDialog({ ref, user_id, onClose }: { ref?: React.RefObject<any>, user_id: string, onClose?: () => void }) {
    ref = ref || React.useRef<Dialog>(undefined)

    const [loading, setLoading] = React.useState(true)
    const [profile, setProfile] = React.useState<IUser>()

    React.useEffect(() => {
        (async () => {
            setProfile(await UserApi.queryUserInfo(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                user_id,
            }))
            setLoading(false)
        })()
    }, [user_id])

    React.useEffect(() => {
        if (loading) return
        const eventName = 'closed'
        ref.current!.addEventListener(eventName, onClose)
        ref.current!.open = true
        return () => ref.current?.removeEventListener(eventName, onClose)
    }, [loading])

    return loading ? (<EffectOnly deps={[]} effect={() => {
        CircleProgressDialog.show('加载中...')
    }} />)
        : (
            <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Avatar src={profile ? (profile?.avatar_file_hash ? ClientManager.client?.getFileUrlByHash(profile?.avatar_file_hash) : default_avatar) : default_avatar} />
                    <div style={{
                        display: 'flex',
                        marginLeft: '15px',
                        marginRight: '15px',
                        fontSize: '16.5px',
                        flexDirection: 'column',
                        wordBreak: 'break-word',
                    }}>
                        <span style={{
                            fontSize: '16.5px'
                        }}>{profile?.nickname}</span>
                        <span style={{
                            fontSize: '10.5px',
                            marginTop: '3px',
                            color: 'rgb(var(--mdui-color-secondary))',
                        }}>{profile?.username ? `@${profile.username} ` : ''}ID: {profile?.id}</span>
                    </div>
                </div>
                <mdui-divider style={{
                    marginTop: "10px",
                }}></mdui-divider>

            </mdui-dialog>
        )
}

UserProfileDialog.show = function (user_id: string) {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<UserProfileDialog user_id={user_id} onClose={onClose} />)
}
