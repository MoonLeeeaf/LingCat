import { createRoute, Outlet } from '@tanstack/react-router'
import { AuthRoute } from './AuthRoute.tsx'
import { UserMainLayout } from '../main_layout/UserMainLayout.tsx'

export const MainLayoutRoute = createRoute({
    getParentRoute: () => AuthRoute,
    id: '_main', 
    component: () => <UserMainLayout><Outlet /></UserMainLayout>,
})