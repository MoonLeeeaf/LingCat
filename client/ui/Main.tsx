import Message from "./chat-layout/Message";
import MessageContainer from "./chat-layout/MessageContainer";

export default function Main() {
    return (
        <mdui-layout>
            <mdui-top-app-bar>
                <mdui-top-app-bar-title>灵猫</mdui-top-app-bar-title>
            </mdui-top-app-bar>

            <mdui-navigation-drawer open>
                <mdui-list>
                    <mdui-list-item>Navigation drawer</mdui-list-item>
                </mdui-list>
            </mdui-navigation-drawer>

            <mdui-layout-main style={{
                flexGrow: 1,
                display: 'flex'
            }}>
                <MessageContainer>
                    <Message message={"**喵**\n喵喵喵![image](icon.png)\n喵"} senderName={"月月"} />
                </MessageContainer>
            </mdui-layout-main>
        </mdui-layout>
    )
}
