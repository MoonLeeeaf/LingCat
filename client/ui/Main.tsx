import Message from "./chat-layout/Message"
import MessageContainer from "./chat-layout/MessageContainer"
import UserMain from "./UserMain"

export default function Main() {
    return (
        <mdui-layout>
            <mdui-top-app-bar>
                <mdui-top-app-bar-title>灵猫</mdui-top-app-bar-title>
            </mdui-top-app-bar>

            <UserMain />
        </mdui-layout>
    )
}
