import { createRoute } from '@tanstack/react-router'
import { AuthRoute } from './AuthRoute.tsx'
import { UserMainLayout } from '../layout/UserMainLayout.tsx'
import { MainLayoutRoute } from './MainLayoutRoute.tsx'

export const UserIndexRoute = createRoute({
    getParentRoute: () => MainLayoutRoute,
    path: '/',
    component: () =><div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
    }}>
        选择一个对话以开始
    </div>,
})
