import { NavigationDrawer, NavigationRail } from 'mdui'
import React from 'react'

export interface RailItem {
    value: string
    icon: string
    activeIcon?: string
}

export interface RootLayoutProps {
    /** 抽屉 ref（外部持有，用于控制开关） */
    drawerRef: React.RefObject<NavigationDrawer | undefined>

    /** 导航项数据 */
    railItems: RailItem[]
    /** 当前选中项（受控） */
    railValue: string
    onRailValueChange?: (value: string) => void

    /** rail 顶部插槽（头像、新建菜单等） */
    railTop?: React.ReactNode
    /** rail 底部插槽（设置按钮等） */
    railBottom?: React.ReactNode

    /** 侧边栏（rail 右侧的列表区） */
    sidebar: React.ReactNode

    /** 主区内容 */
    main: React.ReactNode

    /** 左侧 dock 面板（会议等）。不传则不渲染 dock 区，也不显示分隔条 */
    dockedPanel?: React.ReactNode
    /** dock 宽度百分比 0-100，默认 50 */
    dockPercent?: number
    onDockPercentChange?: (percent: number) => void
}

export function RootLayout({
    drawerRef,
    railItems,
    railValue,
    onRailValueChange,
    railTop,
    railBottom,
    sidebar,
    main,
    dockedPanel,
    dockPercent = 50,
    onDockPercentChange,
}: RootLayoutProps) {
    const railRef = React.useRef<NavigationRail>(null)
    const dockRowRef = React.useRef<HTMLDivElement>(null)

    // rail 选中项变化
    React.useEffect(() => {
        const el = railRef.current
        if (!el) return
        const handler = (e: Event) => {
            const v = (e.target as NavigationRail).value
            if (v) onRailValueChange?.(v)
        }
        el.addEventListener('change', handler)
        return () => el.removeEventListener('change', handler)
    }, [onRailValueChange])

    // dock 分隔条拖拽
    const onDockDividerDown = (e: React.PointerEvent) => {
        e.preventDefault()
        const onMove = (ev: PointerEvent) => {
            const rect = dockRowRef.current?.getBoundingClientRect()
            if (!rect || rect.width <= 0) return
            onDockPercentChange?.(((ev.clientX - rect.left) / rect.width) * 100)
        }
        const onUp = () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
    }

    return (
        <>
            <mdui-navigation-drawer open ref={drawerRef as any} close-on-overlay-click>
                <mdui-navigation-rail
                    ref={railRef as any}
                    contained
                    alignment="center"
                    value={railValue}
                >
                    {railTop}
                    {railItems.map((item) => (
                        <mdui-navigation-rail-item
                            key={item.value}
                            icon={item.icon}
                            active-icon={item.activeIcon}
                            value={item.value}
                        />
                    ))}
                    {railBottom}
                </mdui-navigation-rail>

                <mdui-list style={{ marginLeft: 'calc(5px + 5rem)', marginRight: '5px' }}>
                    {sidebar}
                </mdui-list>
            </mdui-navigation-drawer>

            <mdui-layout-main style={{ flexGrow: 1, display: 'flex', minWidth: 0 }}>
                <div ref={dockRowRef} style={{ display: 'flex', width: '100%', height: '100%', minWidth: 0 }}>
                    {dockedPanel && (
                        <>
                            <div style={{
                                width: dockPercent + '%',
                                height: '100%',
                                minWidth: 0,
                                flexShrink: 0,
                                display: 'flex',
                            }}>
                                {dockedPanel}
                            </div>
                            <div
                                onPointerDown={onDockDividerDown}
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
                        </>
                    )}
                    <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
                        {main}
                    </div>
                </div>
            </mdui-layout-main>
        </>
    )
}