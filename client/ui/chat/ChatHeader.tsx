export interface ChatHeaderProps {
    /** 聊天标题 */
    title: string
    /** 移动端：显示返回按钮；桌面端：显示抽屉开关 */
    isMobile: boolean
    /** 桌面端：抽屉是否打开（用于切换 menu / menu_open 图标） */
    drawerOpen?: boolean
    /** 桌面端：点击抽屉开关 */
    onToggleDrawer?: () => void

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
    onOpenMembers,
    onOpenSettings,
    onOpenInfo,
    onCall,
}: ChatHeaderProps) {
    return (
        <mdui-top-app-bar scroll-target='#thishumandoesnotexists' style={{ position: 'relative' }}>
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

            <mdui-top-app-bar-title style={{ marginLeft: '8px' }}>
                {title}
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