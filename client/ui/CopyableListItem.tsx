import React from 'react'
import AnimatedIcon from './AnimatedIcon.tsx'
import { useCopyFeedback } from './useCopyFeedback.ts'

export default function CopyableListItem({ icon, value, description }: { icon: string, value: string, description: string }) {
    const { copied, copy } = useCopyFeedback()
    return <mdui-dropdown trigger="click">
        <mdui-list-item slot="trigger" rounded>
            <AnimatedIcon slot="icon" name={copied ? 'check' : icon} />
            {value}
            <span slot="description">{description}</span>
        </mdui-list-item>
        <mdui-menu>
            <mdui-menu-item
                onClick={() => void copy(value)}
            ><AnimatedIcon slot="icon" name={copied ? 'check' : 'content_copy'} />{copied ? '已复制' : '复制'}</mdui-menu-item>
        </mdui-menu>
    </mdui-dropdown>
}
