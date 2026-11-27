/// <reference types="mdui/jsx.zh-cn.d.ts" />
/// <reference types="vite/client" />

declare const __BUILD_SHA__: string
declare const __BUILD_TIME__: string
declare const __BUILD_DIRTY__: boolean
declare const __BUILD_BRANCH__: string
declare const __BUILD_CHANNEL__: string
declare const __APP_VERSION__: string
declare const __PROTOCOL_VERSION__: string

interface LingcatDesktopHandoff {
    chatId: string
    meetingId?: string
    title?: string
    session: {
        server: string
        userId: string
        account: string
        nickname: string
        token: string
    }
    publicKeyHex: string
}

interface LingcatDesktopBridge {
    isDesktop: boolean
    getMeetingHandoff(): Promise<LingcatDesktopHandoff | null>
    getBallHandoff(): Promise<{ chatId: string, title: string } | null>
    openMeeting(handoff: LingcatDesktopHandoff): Promise<boolean>
    minimizeMeeting(): Promise<void>
    closeMeeting(): Promise<void>
    onCloseRequested(cb: () => void): void
    restoreMeeting(): Promise<void>
    ballDragStart(): void
    ballDragEnd(): void
    getBallPosition(): Promise<[number, number]>
    setBallPosition(x: number, y: number): Promise<void>
    sendBallState(state: unknown): void
    onBallState(cb: (state: unknown) => void): void
}

interface Window {
    lingcatDesktop?: LingcatDesktopBridge
}
