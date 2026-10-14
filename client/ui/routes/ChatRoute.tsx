import { createRoute } from '@tanstack/react-router'
import { ChatFragment } from '../chat/ChatFragment.tsx'
import { MainLayoutRoute } from './MainLayoutRoute.tsx'

function ChatRouteComponent() {
    const { chatId } = ChatRoute.useParams()
    return <ChatFragment key={chatId} />
}

export const ChatRoute = createRoute({
    getParentRoute: () => MainLayoutRoute,
    path: '/chat/$chatId',
    component: ChatRouteComponent,
})