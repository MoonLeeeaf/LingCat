import React from 'react'
import { motion, AnimatePresence } from 'motion/react'

export interface ChatHeaderProps {
    /** 聊天标题 */
    title: string
    /** 移动端：显示返回按钮；桌面端：显示抽屉开关 */
    isMobile: boolean
    /** 桌面端：抽屉是否打开（用于切换 menu / menu_open 图标） */
    drawerOpen?: boolean
    /** 桌面端：点击抽屉开关 */
    onToggleDrawer?: () => void

    /** 是否开启了端到端加密 */
    isE2E?: boolean
    /** E2E 验证状态 (可选，用于改变锁的颜色) */
    e2eStatus?: 'unverified' | 'verified' | 'mismatch'

    /** 点击"成员列表" */
    onOpenMembers?: () => void
    /** 点击"对话设置" */
    onOpenSettings?: () => void
    /** 点击"对话信息" */
    onOpenInfo?: () => void
    /** 点击"发起会议"（暂不实现，传 undefined 时不显示） */
    onCall?: () => void
}

export function ChatHeader({
    title,
    isMobile,
    onToggleDrawer,
    isE2E,
    e2eStatus = 'unverified',
    onOpenMembers,
    onOpenSettings,
    onOpenInfo,
    onCall,
}: ChatHeaderProps) {
    // 根据状态决定锁的颜色
    const lockColor = e2eStatus === 'verified' 
        ? 'var(--mdui-color-primary)' 
        : e2eStatus === 'mismatch' 
            ? 'var(--mdui-color-error)' 
            : 'var(--mdui-color-outline)'

    return (
        <mdui-top-app-bar scroll-target='#thishumandoesnotexists' style={{ position: 'relative', backgroundColor: 'inherit' }}>
            {isMobile ? (
                <mdui-button-icon
                    icon="arrow_back"
                    onClick={() => window.history.back()}
                />
            ) : (
                <mdui-button-icon
                    icon='menu'
                    onClick={() => onToggleDrawer?.()}
                />
            )}

            <mdui-top-app-bar-title style={{ marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                        key={title}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.16, ease: 'easeOut' }}
                        style={{
                            display: 'inline-block',
                            maxWidth: '100%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {title}
                    </motion.span>
                </AnimatePresence>
                {isE2E && (
                    <mdui-tooltip content={
                        e2eStatus === 'verified' ? '端到端加密 (已验证)' :
                        e2eStatus === 'mismatch' ? '端到端加密 (安全码已变更)' :
                        '端到端加密'
                    }>
                        <mdui-icon 
                            name="lock" 
                            style={{ 
                                fontSize: '16px', 
                                color: lockColor,
                                flexShrink: 0 
                            }}
                        />
                    </mdui-tooltip>
                )}
            </mdui-top-app-bar-title>

            <div style={{ flexGrow: 1 }} />

            {onCall && (
                <mdui-button-icon
                    icon="call"
                    style={{ marginRight: '4px' }}
                    onClick={onCall}
                />
            )}
            {onOpenMembers && (
                <mdui-button-icon
                    icon="group"
                    style={{ marginRight: '4px' }}
                    onClick={onOpenMembers}
                />
            )}
            {onOpenSettings && (
                <mdui-button-icon
                    icon="settings"
                    style={{ marginRight: '4px' }}
                    onClick={onOpenSettings}
                />
            )}
            {onOpenInfo && (
                <mdui-button-icon
                    icon="info"
                    style={{ marginRight: '4px' }}
                    onClick={onOpenInfo}
                />
            )}
        </mdui-top-app-bar>
    )
}