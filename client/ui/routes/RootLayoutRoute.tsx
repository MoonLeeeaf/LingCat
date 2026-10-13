import { createRoute, redirect, Outlet } from '@tanstack/react-router'
import { RootRoute } from './RootRoute.tsx'
import ClientManager from '../../ClientManager.ts'

export const RootLayoutRoute = createRoute({
    getParentRoute: () => RootRoute,
    id: '_app',
    beforeLoad: ({ location }) => {
        if (!ClientManager.getOrInitActiveSession()) {
            throw redirect({
                to: '/login',
                search: { redirect: location.href },
            })
        }
    },
    component: () => <Outlet />, 
})