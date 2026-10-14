import { createRoute, useNavigate, useParams } from '@tanstack/react-router'
import { ChatRoute } from './ChatRoute.tsx'
import { DialogForRouter } from '../DialogForRouter.tsx'
import { ChatProfileContent } from '../viewer/ChatProfileContent.tsx'
import { useDialogRouteClose } from '../../lib/useDialogRouteClose.ts'

function ChatProfilePage() {
    const { chatId } = ChatProfileRoute.useParams()
    const navigate = useNavigate()

    const close = useDialogRouteClose()

    return (
        <DialogForRouter
            open
            onCloseRequest={close}
        >
            <ChatProfileContent
                chatId={chatId}
                onOpenUser={(userId) => navigate({
                    to: '/user/$userId',
                    params: { userId },
                })}
                onOpenChat={(id) => navigate({ to: '/chat/$chatId', params: { chatId: id } })}
            />
        </DialogForRouter>
    )
}

export const ChatProfileRoute = createRoute({
    getParentRoute: () => ChatRoute,
    path: 'profile',
    component: ChatProfilePage,
})