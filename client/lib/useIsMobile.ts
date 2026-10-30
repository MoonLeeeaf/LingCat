import React from 'react'
import { breakpoint } from 'mdui'

/**
 * 判断当前设备是否应使用手机端布局。
 *
 * - 看设备屏幕的短边，而不是窗口宽度：横屏手机仍然是移动端
 * - 用 mdui 的 xs/sm 断点（默认 sm=600px）区分手机和平板/电脑
 * - 平板和电脑无论横竖屏、窗口多窄都保持桌面端
 * - 不使用 pointer/hover/maxTouchPoints，避免触屏电脑被误判
 */
const PHONE_FALLBACK_SHORT_SIDE = 600

function isPhoneScreen(): boolean {
    if (typeof window === 'undefined') return false
    const shortSide = Math.min(window.screen.width, window.screen.height)
    const bp = breakpoint(shortSide)
    // mdui 的 CSS 变量尚未注入时 down/up 都会是 false，使用默认 sm 兜底
    if (bp.down('sm')) return true
    if (bp.up('sm')) return false
    return shortSide < PHONE_FALLBACK_SHORT_SIDE
}

export function useIsMobile(): boolean {
    const [isMobile, setIsMobile] = React.useState(isPhoneScreen)

    React.useEffect(() => {
        const update = () => setIsMobile(isPhoneScreen())
        // 立即同步一次（防止首帧时机差）
        update()
        window.addEventListener('resize', update)
        window.addEventListener('orientationchange', update)
        return () => {
            window.removeEventListener('resize', update)
            window.removeEventListener('orientationchange', update)
        }
    }, [])

    return isMobile
}
