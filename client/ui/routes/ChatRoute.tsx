// routes/ChatRoute.tsx
import { createRoute } from '@tanstack/react-router'
import { AuthRoute } from './AuthRoute.tsx'
import { ChatFragment } from '../chat/ChatFragment.tsx'
import { MainLayoutRoute } from './MainLayoutRoute.tsx'

export const ChatRoute = createRoute({
    getParentRoute: () => MainLayoutRoute,
    path: '/chat/$chatId',
    component: ChatFragment,   // TODO: 你的聊天页
})
