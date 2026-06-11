import UserMain from "./UserMain.tsx"

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
