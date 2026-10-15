import { createRoute } from '@tanstack/react-router'
import { AuthRoute } from './AuthRoute.tsx'
import { UserMainLayout } from '../main_layout/UserMainLayout.tsx'
import { MainLayoutRoute } from './MainLayoutRoute.tsx'
import { useIsMobile } from '../../lib/useIsMobile.ts'

export const UserIndexRoute = createRoute({
    getParentRoute: () => MainLayoutRoute,
    path: '/',
    component: () => {
        const isMobile = useIsMobile()
        if (isMobile) return null
        return <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
        }}>
            选择一个对话以开始
        </div>
    },
})
