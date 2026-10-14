import { Outlet } from '@tanstack/react-router'
import { ChatRoute } from '../routes/ChatRoute.tsx'

export function ChatFragment() {
    const { chatId } = ChatRoute.useParams()
    return (
        <>
            <div>聊天页: {chatId}</div>
            {/* 子路由（/chat/$chatId/profile 等）在这里渲染 */}
            <Outlet />
        </>
    )
}