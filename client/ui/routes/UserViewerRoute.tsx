import { createRoute, useNavigate } from '@tanstack/react-router'
import { AuthRoute } from './AuthRoute.tsx'
import { DialogForRouter } from '../DialogForRouter.tsx'
import { UserProfileContent } from '../viewer/UserProfileContent.tsx'
import { ChatApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import tipError from '../tipError.ts'
import { useDialogRouteClose } from '../../lib/useDialogRouteClose.ts'
import { MainLayoutRoute } from './MainLayoutRoute.tsx'

function UserViewerPage() {
    const { userId } = UserViewerRoute.useParams()
    const navigate = useNavigate()

    const close = useDialogRouteClose()

    return (
        <DialogForRouter
            open
            closeOnEsc
            closeOnOverlayClick
            onCloseRequest={close}
        >
            <UserProfileContent
                userId={userId}
                onViewAvatar={(url) => navigate({
                    to: '/viewer/image',
                    search: { url },
                })}
                onEditProfile={() => EditMyProfileDialog.show()}
                onOpenChat={async (targetUserId) => {
                    try {
                        const chatId = await ChatApi.getOrCreatePrivateChat(
                            ClientManager.getActiveClient()!,
                            {
                                access_token: ClientManager.getActiveSession()?.token!,
                                target_user_id: targetUserId,
                            },
                        )
                        navigate({ to: '/chat/$chatId', params: { chatId } })
                    } catch (e) {
                        tipError(e, '打开对话失败')
                    }
                }}
            />
        </DialogForRouter>
    )
}

export const UserViewerRoute = createRoute({
    getParentRoute: () => MainLayoutRoute,
    path: '/user/$userId',
    component: UserViewerPage,
})