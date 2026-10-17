import React from 'react'
import { MeetingView } from './MeetingView.tsx'
import { useMeetingUIStore } from './MeetingUIStore.ts'
import { FullScreenDialog } from '../FullScreenDialog.tsx'

export function MobileMeetingDialog() {
    const isOpen = useMeetingUIStore(s => s.isOpen)
    const isMinimized = useMeetingUIStore(s => s.isMinimized)
    const setMinimized = useMeetingUIStore(s => s.setMinimized)
    const close = useMeetingUIStore(s => s.close)

    // 最小化时关闭 dialog (children 仍挂载, 音频继续), 由悬浮球恢复
    return (
        <FullScreenDialog open={isOpen && !isMinimized}>
            <MeetingView
                onClose={close}
                isMobile
                headerExtra={
                    <mdui-tooltip content="最小化">
                        <mdui-button-icon icon="minimize" onClick={() => setMinimized(true)} />
                    </mdui-tooltip>
                }
            />
        </FullScreenDialog>
    )
}
