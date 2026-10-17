import React from 'react'
import showSnackbar from './showSnackbar.ts'
import copyToClipboard from '../lib/copyToClipboard.ts'

export default function CopyableListItem({ icon, value, description }: { icon: string, value: string, description: string }) {
    return <mdui-dropdown trigger="click">
        <mdui-list-item slot="trigger" icon={icon} rounded>
            {value}
            <span slot="description">{description}</span>
        </mdui-list-item>
        <mdui-menu>
            <mdui-menu-item
                icon="content_copy"
                onClick={async () => {
                    const ok = await copyToClipboard(value)
                    showSnackbar({ message: ok ? '已复制' : '复制失败' })
                }}
            >复制</mdui-menu-item>
        </mdui-menu>
    </mdui-dropdown>
}
