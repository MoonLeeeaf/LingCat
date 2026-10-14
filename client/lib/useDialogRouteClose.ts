import { useNavigate, useRouter } from '@tanstack/react-router'
import { useCallback } from 'react'

export function useDialogRouteClose() {
    const navigate = useNavigate()
    const router = useRouter()
    return useCallback(() => {
        // TanStack Router 维护的 idx 反映当前在应用内的导航深度
        const canGoBack = router.history.canGoBack?.() ?? (window.history.length > 1)
        if (canGoBack) {
            window.history.back()
        } else {
            navigate({ to: '/', replace: true })
        }
    }, [navigate, router])
}