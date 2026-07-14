import { NavigationDrawer } from "mdui"
import Message from "./chat-layout/Message.tsx"
import MessageContainer from "./chat-layout/MessageContainer.tsx"
import React from "react"
import default_avatar from '../default_avatar.png'
import { IChat, IUser } from "lingcat-protocol"
import UserProfileDialog from "./UserProfileDialog.tsx"
import ClientManager from "../ClientManager.ts"
import { FileApi, UserApi } from "lingcat-client-protocol"

let setActiveChatFunc
export default function UserMain({ access_token, drawerRef }: { access_token: string, drawerRef: React.RefObject<NavigationDrawer | undefined> }) {
    const [profile, setProfile] = React.useState<IUser>()
    React.useEffect(() => {
        ; (async () => {
            ClientManager.initClient(ClientManager.getActiveUserSessionName()!)
            ClientManager.client.onInit = async () => {
                setProfile(await ClientManager.getMe())
                document.cookie = "file_access_token=" + await FileApi.requestAccessUploadFileToken(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token
                }) + ';'
            }
        })()
    }, [access_token])

    const [activeChat, setActiveChat] = React.useState<IChat>()
    setActiveChatFunc = setActiveChat

    return <>
        <mdui-navigation-drawer ref={drawerRef as any} close-on-overlay-click>
            <mdui-list>
                <mdui-list-item>Navigation drawer</mdui-list-item>
            </mdui-list>
        </mdui-navigation-drawer>

        <mdui-layout-main style={{
            flexGrow: 1,
            display: 'flex'
        }}>
            <MessageContainer>
                <div style={{
                    overflowY: 'auto',
                }}>
                    <Message message={"**喵**\n我是开头![image](icon.png)\n喵"} senderName={"月月"} avatar={default_avatar} />
                    <Message message={"**喵**\n喵喵喵![image](icon.png)\n喵"} senderName={"月月"} avatar={default_avatar} />
                    <Message message={"**喵**\n我是末尾![image](icon.png)\n喵"} senderName={"月月"} avatar={default_avatar} />
                </div>
                <div style={{
                    flexGrow: 1,
                }}></div>
                <mdui-text-field use-patched-textarea variant="outlined" autosize max-rows={10} placeholder="输入..." style={{
                    padding: '4px',
                }}>
                    <mdui-button-icon slot="end-icon" icon="attachment"></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '20px' }}></div>
                    <mdui-button-icon slot="end-icon" icon="send" onClick={() => UserProfileDialog.show(profile?.id!)}></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '5px' }}></div>
                </mdui-text-field>
            </MessageContainer>
        </mdui-layout-main>
    </>
}
