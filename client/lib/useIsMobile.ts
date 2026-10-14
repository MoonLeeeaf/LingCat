import React from 'react'

/** 移动端断点（< 这个宽度认为是移动端） */
const MOBILE_BREAKPOINT = 768

/**
 * 判断当前视口是否是"移动端"宽度。
 *
 * - 用 matchMedia，和 CSS 媒体查询走同一套标准，行为一致
 * - 只用于"功能分支"（决定渲染 DesktopLayout 还是 MobileLayout）
 * - 布局细节用 CSS 媒体查询，别用它
 */
export function useIsMobile(breakpoint: number = MOBILE_BREAKPOINT): boolean {
    const query = `(max-width: ${breakpoint - 1}px)`

    const [isMobile, setIsMobile] = React.useState(() => {
        if (typeof window === 'undefined') return false
        return window.matchMedia(query).matches
    })

    React.useEffect(() => {
        const mq = window.matchMedia(query)
        const update = (e: MediaQueryListEvent | MediaQueryList) => {
            setIsMobile(e.matches)
        }
        // 立即同步一次（防止 SSR / 首次渲染时机差）
        update(mq)
        mq.addEventListener('change', update)
        return () => mq.removeEventListener('change', update)
    }, [query])

    return isMobile
}