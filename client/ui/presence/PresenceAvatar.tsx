import React from 'react'

/** 头像右下角的在线绿点 */
export function PresenceDot({ online, size = 10, borderColor }: {
    online?: boolean
    size?: number
    borderColor?: string
}) {
    if (!online) return null
    return <span
        aria-label="在线"
        style={{
            position: 'absolute',
            right: -1,
            bottom: -1,
            width: size,
            height: size,
            borderRadius: '50%',
            background: '#22c55e',
            border: `2px solid ${borderColor || 'rgb(var(--mdui-color-surface-container-low))'}`,
            boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            pointerEvents: 'none',
            zIndex: 1,
        }}
    />
}

/** 包裹头像并叠加右下角在线绿点 (可传 slot 用于 mdui-list-item 的 icon 槽) */
export function PresenceAvatar({ online, slot, size = 10, children, style }: {
    online?: boolean
    slot?: string
    size?: number
    children: React.ReactNode
    style?: React.CSSProperties
}) {
    return <span slot={slot} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0, ...style }}>
        {children}
        <PresenceDot online={online} size={size} />
    </span>
}
