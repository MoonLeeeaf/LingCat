import { createRouter } from '@tanstack/react-router'
import { RootRoute } from './RootRoute.tsx'
import { LoginRoute } from './LoginRoute.tsx'
import { UserIndexRoute } from './UserIndexRoute.tsx'
import { AuthRoute } from './AuthRoute.tsx'
import { ChatProfileRoute } from './ChatProfileRoute.tsx'
import { ChatRoute } from './ChatRoute.tsx'
import { ImageViewerRoute } from './ImageViewerRoute.tsx'
import { UserViewerRoute } from './UserViewerRoute.tsx'
import { MainLayoutRoute } from './MainLayoutRoute.tsx'

const routeTree = RootRoute.addChildren([
    AuthRoute.addChildren([
        MainLayoutRoute.addChildren([
            UserIndexRoute,
            ChatRoute.addChildren([
                ChatProfileRoute,
            ]),
            UserViewerRoute,
            ImageViewerRoute,
        ]),
    ]),
    LoginRoute,
])

export const Router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPendingMs: 200, 
    defaultPendingMinMs: 300, 
    // defaultPendingComponent: () => <FullScreenLoading />,  // 可选
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof Router
    }
}
