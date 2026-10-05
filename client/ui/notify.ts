import showSnackbar from './showSnackbar.ts'

export const OPEN_CHAT_MESSAGE = 'lingcat-open-chat'

let clickHandlerRegistered = false
let openChatHandler: ((chatId: string) => void) | undefined
let deniedHintShown = false

export function notificationSupported() {
    return typeof Notification != 'undefined'
}

export function notificationPermission() {
    if (!notificationSupported()) return 'unsupported' as const
    return Notification.permission
}

export function requestNotificationPermission() {
    if (!notificationSupported() || Notification.permission != 'default') return
    try {
        const result = Notification.requestPermission()
        if (result && typeof (result as Promise<NotificationPermission>).catch == 'function')
            (result as Promise<NotificationPermission>).catch(() => { })
    } catch (e) {
        console.warn('[Notify] 请求通知权限失败', e)
    }
}

export function installNotificationPermissionPrompt() {
    if (!notificationSupported() || Notification.permission != 'default') return
    const onGesture = () => requestNotificationPermission()
    document.addEventListener('pointerdown', onGesture, { once: true, capture: true })
    document.addEventListener('keydown', onGesture, { once: true, capture: true })
}

export function isAppForeground() {
    if (typeof document == 'undefined') return true
    return document.visibilityState == 'visible' && document.hasFocus()
}

export function isMentioned(entities: readonly any[] | null | undefined, myId: string) {
    if (!myId) return false
    return (entities || []).some((e) => e?.type == 'user_mention' && e?.data == myId)
}

export function notificationBody(text: string) {
    const oneLine = (text || '').replace(/\s+/g, ' ').trim()
    return oneLine.length > 180 ? oneLine.slice(0, 180) + '…' : oneLine
}

export function onNotificationClick(handler: (chatId: string) => void) {
    openChatHandler = handler
    if (clickHandlerRegistered) return
    clickHandlerRegistered = true
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (e: MessageEvent) => {
            const data = e.data
            if (data && data.type == OPEN_CHAT_MESSAGE && typeof data.chatId == 'string')
                openChatHandler?.(data.chatId)
        })
    }
}

function activeRegistration() {
    if (!('serviceWorker' in navigator)) return Promise.resolve<ServiceWorkerRegistration | undefined>(undefined)
    return new Promise<ServiceWorkerRegistration | undefined>((resolve) => {
        const timer = setTimeout(() => resolve(undefined), 1500)
        navigator.serviceWorker.ready
            .then((reg) => { clearTimeout(timer); resolve(reg) })
            .catch(() => { clearTimeout(timer); resolve(undefined) })
    })
}

export async function showMessageNotification(option: { chatId: string, title: string, body: string, icon?: string }) {
    if (!notificationSupported()) return
    if (Notification.permission != 'granted') {
        if (Notification.permission == 'denied' && !deniedHintShown) {
            deniedHintShown = true
            showSnackbar({ message: '新消息通知被浏览器拒绝, 请在浏览器设置中允许本站通知', autoCloseDelay: 6000 })
        }
        return
    }

    const options: NotificationOptions = {
        body: option.body,
        icon: option.icon,
        badge: option.icon,
        tag: 'lingcat-chat-' + option.chatId,
        data: { type: OPEN_CHAT_MESSAGE, chatId: option.chatId },
    }

    const reg = await activeRegistration()
    if (reg) {
        try {
            await reg.showNotification(option.title, options)
            return
        } catch (e) {
            console.warn('[Notify] Service Worker 通知失败, 改用 Notification', e)
        }
    }

    try {
        const notification = new Notification(option.title, options)
        notification.onclick = () => {
            try { window.focus() } catch (e) { }
            openChatHandler?.(option.chatId)
        }
    } catch (e) {
        console.warn('[Notify] 发送通知失败', e)
    }
}
