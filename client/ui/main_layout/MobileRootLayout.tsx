import { NavigationBar } from 'mdui'
import React from 'react'
import { motion } from 'motion/react'
import { NavItem, AppLayoutSharedProps } from './DesktopRootLayout.tsx'

export interface MobileLayoutProps extends AppLayoutSharedProps {
    /** 顶部栏。桌面端用不到 */
    topBar?: React.ReactNode
    /** 会话列表内容 */
    list?: React.ReactNode
    /** 主区内容（会话详情 / 聊天） */
    main?: React.ReactNode
}

export function MobileRootLayout({
    navItems,
    navValue,
    onNavValueChange,
    main,
    topBar,
}: MobileLayoutProps) {
    const navRef = React.useRef<NavigationBar>(null)

    React.useEffect(() => {
        const el = navRef.current
        if (!el) return
        const handler = (e: Event) => {
            const v = (e.target as NavigationBar).value
            if (v) onNavValueChange?.(v)
        }
        el.addEventListener('change', handler)
        return () => el.removeEventListener('change', handler)
    }, [onNavValueChange])

    const content = main

    return (
        <>
            {topBar}
            <div style={{ minHeight: '100%', width: '100%' }}>
                {content}
            </div>
            <mdui-navigation-bar ref={navRef as any} value={navValue}>
                {navItems?.map(item => {
                    const active = navValue === item.value
                    return (
                        <mdui-navigation-bar-item key={item.value} value={item.value}>
                            <motion.div
                                slot="icon"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.92 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <mdui-icon name={item.icon} />
                            </motion.div>
                            <motion.div
                                slot="active-icon"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.92 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 24 }}
                                style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <mdui-icon name={item.activeIcon} />
                                {active && (
                                    <motion.span
                                        layoutId="nav-active-dot-mobile"
                                        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                                        style={{
                                            position: 'absolute',
                                            bottom: '-5px',
                                            width: '4px',
                                            height: '4px',
                                            borderRadius: '50%',
                                            background: 'rgb(var(--mdui-color-primary))',
                                        }}
                                    />
                                )}
                            </motion.div>
                            {item.label ?? ''}
                        </mdui-navigation-bar-item>
                    )
                })}
            </mdui-navigation-bar>
        </>
    )
}