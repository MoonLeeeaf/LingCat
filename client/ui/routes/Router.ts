import { createRouter } from '@tanstack/react-router'
import { RootRoute } from './RootRoute.tsx'
import { LoginRoute } from './LoginRoute.tsx'
import { UserIndexRoute } from './UserIndexRoute.tsx'
import { AuthRoute } from './AuthRoute.tsx'
import { ChatRoute } from './ChatRoute.tsx'
import { MainLayoutRoute } from './MainLayoutRoute.tsx'

const routeTree = RootRoute.addChildren([
    AuthRoute.addChildren([
        MainLayoutRoute.addChildren([
            UserIndexRoute,
            ChatRoute,
        ]),
    ]),
    LoginRoute,
])

export const Router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPendingMs: 200,
    defaultPendingMinMs: 300,
    basepath: import.meta.env.BASE_URL.replace(/\/$/, ''),
})

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof Router
    }
}
