import { NavigationDrawer, NavigationRail } from 'mdui'
import React from 'react'
import { DrawerContext, DrawerContextValue } from './DrawerContext.ts'

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
    navTop?: React.ReactNode
    navBottom?: React.ReactNode
    dockedPanel?: React.ReactNode
    dockPercent?: number
    onDockPercentChange?: (percent: number) => void
}

export function DesktopRootLayout({
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
    const drawerRef = React.useRef<NavigationDrawer>(null) 
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

    const [drawerOpen, setDrawerOpen] = React.useState(true)
    React.useEffect(() => {
        const d = drawerRef.current
        if (!d) return
        setDrawerOpen(d.open)

        const onOpened = () => setDrawerOpen(true)
        const onClosed = () => setDrawerOpen(false)
        d.addEventListener('opened', onOpened as EventListener)
        d.addEventListener('closed', onClosed as EventListener)
        return () => {
            d.removeEventListener('opened', onOpened as EventListener)
            d.removeEventListener('closed', onClosed as EventListener)
        }
    }, []) 
    // 分栏分隔条拖动
    const onDividerDown = (e: React.PointerEvent) => {
        const rect = dockRowRef.current?.getBoundingClientRect()
        if (!rect || !onDockPercentChange) return
        e.preventDefault()
        const onMove = (ev: PointerEvent) => {
            onDockPercentChange(((ev.clientX - rect.left) / rect.width) * 100)
        }
        const onUp = () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
    }

    const drawerCtx = React.useMemo<DrawerContextValue>(() => ({
        open: drawerOpen,
        toggle: () => {
            const d = drawerRef.current
            if (d) d.open = !d.open
        },
        setOpen: (v) => {
            const d = drawerRef.current
            if (d) d.open = v
        },
    }), [drawerOpen])

    return (
        <DrawerContext.Provider value={drawerCtx}>
            <mdui-navigation-drawer open ref={drawerRef as any} close-on-overlay-click>
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
                    {dockedPanel && (<>
                        <div style={{
                            width: dockPercent + '%',
                            height: '100%',
                            minWidth: 0,
                            flexShrink: 0,
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            {dockedPanel}
                        </div>
                        <div
                            onPointerDown={onDividerDown}
                            title="拖动调整大小"
                            style={{
                                width: '6px',
                                flexShrink: 0,
                                cursor: 'col-resize',
                                background: 'rgb(var(--mdui-color-outline-variant))',
                                touchAction: 'none',
                                userSelect: 'none',
                            }}
                        />
                    </>)}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
                        {main}
                    </div>
                </div>
            </mdui-layout-main>
        </DrawerContext.Provider>
    )
}