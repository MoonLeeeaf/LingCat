import { createRouter } from '@tanstack/react-router'
import { RootRoute } from './RootRoute.tsx'
import { LoginOrRegisterRoute } from './LoginOrRegisterRoute'
import { UserIndexRoute } from './UserIndexRoute.tsx'
import { RootLayoutRoute } from './RootLayoutRoute.tsx'

const routeTree = RootRoute.addChildren([
    RootLayoutRoute.addChildren([
        UserIndexRoute,
    ]),
    LoginOrRegisterRoute,
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
