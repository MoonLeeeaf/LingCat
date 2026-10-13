import { createRoute } from '@tanstack/react-router'
import { RootLayoutRoute } from './RootLayoutRoute.tsx'

export const UserIndexRoute = createRoute({
    getParentRoute: () => RootLayoutRoute,
    path: '/',
    component: () => <></>,
})
