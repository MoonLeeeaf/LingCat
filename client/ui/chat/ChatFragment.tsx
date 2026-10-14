import { Link, Outlet, useNavigate } from '@tanstack/react-router'
import { ChatRoute } from '../routes/ChatRoute.tsx'
import { DialogForRouter } from '../DialogForRouter.tsx'
import { useIsMobile } from '../../lib/useIsMobile.ts'

export function ChatFragment() {
    const { chatId } = ChatRoute.useParams()
    const isMobile = useIsMobile()

    const content = (
        <>
            ChatId = {chatId}
            <Link to='/chat/$chatId' params={{ chatId: '634ac0b2-e0bf-4cda-a7ee-1fa4210c013b' }}>Test Link</Link>
        </>
    )

    if (isMobile) {
        return (
            <DialogForRouter
                open
                fullscreen
                fullBleed
                closeOnEsc={false}
                closeOnOverlayClick={false}
                onCloseRequest={() => window.history.back()}
            >
                {content}
            </DialogForRouter>
        )
    }

    return (
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            {content}
        </div>
    )
}