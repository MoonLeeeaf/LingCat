import React from 'react'

export interface DrawerContextValue {
    /** 抽屉当前是否打开 */
    open: boolean
    /** 切换开关 */
    toggle: () => void
    /** 明确设置 */
    setOpen: (v: boolean) => void
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null)

/**
 * 读取抽屉状态。
 * - 桌面端：返回真实状态
 * - 移动端 / 无 Provider：返回 no-op（移动端聊天页用返回按钮，不用抽屉开关）
 */
export function useDrawer(): DrawerContextValue {
    const ctx = React.useContext(DrawerContext)
    if (ctx) return ctx
    return {
        open: true,
        toggle: () => {},
        setOpen: () => {},
    }
}

export { DrawerContext }