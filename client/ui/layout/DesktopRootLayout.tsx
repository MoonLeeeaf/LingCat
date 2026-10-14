import { NavigationDrawer, NavigationRail } from 'mdui'
import React from 'react'

export interface NavItem {
    value: string
    icon: string
    activeIcon?: string
    /** 文本标签。桌面 rail 用不上，移动端底部栏需要 */
    label?: string
}

/** 两端布局共享的字段 */
export interface AppLayoutSharedProps {
    navItems: NavItem[]
    navValue: string
    onNavValueChange?: (value: string) => void
}

/** 桌面布局专有字段 */
export interface DesktopLayoutProps extends AppLayoutSharedProps {
    /** 会话列表内容 */
    list: React.ReactNode
    /** 主区内容（会话详情 / 聊天） */
    main: React.ReactNode
    drawerRef: React.RefObject<NavigationDrawer | undefined>
    navTop?: React.ReactNode
    navBottom?: React.ReactNode
    dockedPanel?: React.ReactNode
    dockPercent?: number
    onDockPercentChange?: (percent: number) => void
}

export function DesktopRootLayout({
    drawerRef,
    navItems,
    navValue,
    onNavValueChange,
    navTop,
    navBottom,
    list,
    main,
    dockedPanel,
    dockPercent = 50,
    onDockPercentChange,
}: DesktopLayoutProps) {
    const railRef = React.useRef<NavigationRail>(null)
    const dockRowRef = React.useRef<HTMLDivElement>(null)

    // rail 选中项变化
    React.useEffect(() => {
        const el = railRef.current
        if (!el) return
        const handler = (e: Event) => {
            const v = (e.target as NavigationRail).value
            if (v) onNavValueChange?.(v)
        }
        el.addEventListener('change', handler)
        return () => el.removeEventListener('change', handler)
    }, [onNavValueChange])

    return (
        <>
            <mdui-navigation-drawer open ref={drawerRef as any}>
                <mdui-navigation-rail
                    ref={railRef as any}
                    contained
                    alignment="center"
                    value={navValue}
                >
                    {navTop}
                    {navItems?.map((item) => (
                        <mdui-navigation-rail-item
                            key={item.value}
                            icon={item.icon}
                            active-icon={item.activeIcon}
                            value={item.value}
                        />
                    ))}
                    {navBottom}
                </mdui-navigation-rail>

                <mdui-list style={{ marginLeft: 'calc(5px + 5rem)', marginRight: '5px' }}>
                    {list}
                </mdui-list>
            </mdui-navigation-drawer>

            <mdui-layout-main style={{ flexGrow: 1, display: 'flex', minWidth: 0 }}>
                <div ref={dockRowRef} style={{ display: 'flex', width: '100%', height: '100%', minWidth: 0 }}>
                    {dockedPanel}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
                        {main}
                    </div>
                </div>
            </mdui-layout-main>
        </>
    )
}