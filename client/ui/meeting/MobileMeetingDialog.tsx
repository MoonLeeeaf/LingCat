import React from 'react'
import { MeetingView } from './MeetingView.tsx'
import { useMeetingUIStore } from './MeetingUIStore.ts'
import { FullScreenDialog } from '../FullScreenDialog.tsx'

export function MobileMeetingDialog() {
    const isOpen = useMeetingUIStore(s => s.isOpen)
    const close = useMeetingUIStore(s => s.close)

    return (
        <FullScreenDialog open={isOpen}>
            <MeetingView onClose={close} isMobile />
        </FullScreenDialog>
    )
}