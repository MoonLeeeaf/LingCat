import React from 'react'
import showSnackbar from './showSnackbar.ts'

export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text)
            return true
        }
    } catch { }
    // file:// 或非安全上下文下的兜底
    try {
        const ta = document.createElement('textarea')
        ta.value = text
        ta.style.position = 'fixed'
        ta.style.left = '-9999px'
        ta.style.opacity = '0'
        document.body.appendChild(ta)
        ta.select()
        const ok = document.execCommand('copy')
        ta.remove()
        return ok
    } catch {
        return false
    }
}

export default function CopyableListItem({ icon, value, description }: { icon: string, value: string, description: string }) {
    return <mdui-dropdown trigger="hover">
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