import React from 'react'
import { canOpenMeetingWindow } from '../../pwa.ts'

export interface MeetingWindowRequest {
    chatId: string
    title?: string
    start?: boolean
    pwa?: boolean
}

export type OpenMeetingWindowResult = 'opened' | 'focused' | 'unsupported' | 'failed'

const CHANNEL_NAME = 'lingcat-meeting-window'

const ALIVE_TIMEOUT_MS = 2000

type MessageType =
    | 'meeting-window-opened'
    | 'meeting-window-closed'
    | 'meeting-window-query'
    | 'meeting-window-focus'
    | 'meeting-window-start'

export function buildMeetingWindowUrl(req: MeetingWindowRequest) {
    const url = new URL(location.href)
    const params = new URLSearchParams()
    params.set('meeting', '1')
    params.set('chat', req.chatId)
    if (req.title) params.set('title', req.title)
    if (req.start) params.set('start', '1')
    if (req.pwa) params.set('pwa', '1')
    url.search = params.toString()
    url.hash = ''
    return url.toString()
}

export function parseMeetingWindowRequest(search?: string): MeetingWindowRequest | undefined {
    let params: URLSearchParams
    try {
        params = new URLSearchParams(search ?? location.search)
    } catch (e) {
        return undefined
    }
    if (params.get('meeting') != '1') return undefined
    const chatId = params.get('chat')
    if (!chatId) return undefined
    return {
        chatId,
        title: params.get('title') || undefined,
        start: params.get('start') == '1',
        pwa: params.get('pwa') == '1',
    }
}

export function isMeetingWindowPage() {
    return parseMeetingWindowRequest() != undefined
}

export function clearMeetingWindowParams() {
    try {
        const url = new URL(location.href)
        url.search = ''
        history.replaceState(null, '', url.pathname + url.hash)
    } catch (e) {
        console.warn('[Meeting] 清理会议窗口参数失败', e)
    }
}

let pendingInAppMeeting: MeetingWindowRequest | undefined

export function setPendingInAppMeeting(req: MeetingWindowRequest) {
    pendingInAppMeeting = req
}

export function takePendingInAppMeeting() {
    const req = pendingInAppMeeting
    pendingInAppMeeting = undefined
    return req
}

function windowName(chatId: string) {
    return 'lingcat-meeting-' + chatId
}

class MeetingWindowManagerImpl {
    private channel?: BroadcastChannel
    private handles = new Map<string, Window | null>()
    private alive = new Set<string>()
    private aliveTimers = new Map<string, ReturnType<typeof setTimeout>>()
    private startHandler?: () => void
    private listeners = new Set<() => void>()

    constructor() {
        try {
            this.channel = new BroadcastChannel(CHANNEL_NAME)
            this.channel.onmessage = (e) => this.onMessage(e.data)
        } catch (e) {
            this.channel = undefined
        }
    }

    subscribe = (listener: () => void) => {
        this.listeners.add(listener)
        return () => { this.listeners.delete(listener) }
    }
    private emit() {
        this.listeners.forEach((l) => l())
    }

    private clearAliveTimer(chatId: string) {
        const timer = this.aliveTimers.get(chatId)
        if (timer) {
            clearTimeout(timer)
            this.aliveTimers.delete(chatId)
        }
    }

    private onMessage(data: any) {
        if (!data || typeof data != 'object') return
        const chatId = typeof data.chatId == 'string' ? data.chatId : undefined
        if (!chatId) return
        switch (data.type as MessageType) {
            case 'meeting-window-opened':
                this.clearAliveTimer(chatId)
                this.alive.add(chatId)
                this.emit()
                break
            case 'meeting-window-closed':
                this.clearAliveTimer(chatId)
                this.alive.delete(chatId)
                this.handles.delete(chatId)
                this.emit()
                break
            case 'meeting-window-query':
                if (isMeetingWindowPage()) this.post('meeting-window-opened', chatId)
                break
            case 'meeting-window-focus':
                if (isMeetingWindowPage()) {
                    this.post('meeting-window-opened', chatId)
                    try { window.focus() } catch (e) { }
                }
                break
            case 'meeting-window-start':
                if (isMeetingWindowPage() && parseMeetingWindowRequest()?.chatId == chatId) {
                    this.post('meeting-window-opened', chatId)
                    this.startHandler?.()
                }
                break
        }
    }

    post(type: MessageType, chatId: string) {
        try {
            this.channel?.postMessage({ type, chatId })
        } catch (e) { }
    }

    isSupported() {
        return canOpenMeetingWindow()
    }

    isOpen(chatId: string) {
        const w = this.handles.get(chatId)
        if (w) return !w.closed
        return this.alive.has(chatId)
    }

    refresh(chatId: string) {
        if (!this.channel) return
        this.clearAliveTimer(chatId)
        this.aliveTimers.set(chatId, setTimeout(() => {
            this.aliveTimers.delete(chatId)
            if (this.alive.delete(chatId)) this.emit()
        }, ALIVE_TIMEOUT_MS))
        this.post('meeting-window-query', chatId)
    }

    onStartRequest(handler: () => void) {
        this.startHandler = handler
    }

    startInWindow(chatId: string) {
        this.post('meeting-window-start', chatId)
        this.refresh(chatId)
    }

    open(req: MeetingWindowRequest): OpenMeetingWindowResult {
        if (!canOpenMeetingWindow()) return 'unsupported'

        const chatId = req.chatId
        const existing = this.handles.get(chatId)
        if (existing && !existing.closed) {
            try { existing.focus() } catch (e) { }
            return 'focused'
        }
        if (existing) this.handles.delete(chatId)
        if (this.alive.has(chatId)) {
            this.post('meeting-window-focus', chatId)
            this.refresh(chatId)
            return 'focused'
        }

        let win: Window | null = null
        try {
            win = window.open(buildMeetingWindowUrl({ ...req, pwa: true }), windowName(chatId))
        } catch (e) {
            console.warn('[Meeting] 打开会议窗口失败', e)
            win = null
        }
        if (!win) return 'failed'

        this.handles.set(chatId, win)
        this.alive.add(chatId)
        this.emit()
        return 'opened'
    }
}

export const MeetingWindowManager = new MeetingWindowManagerImpl()

export function useMeetingWindow() {
    const [, force] = React.useReducer((x: number) => x + 1, 0)
    React.useEffect(() => MeetingWindowManager.subscribe(force), [])
    return MeetingWindowManager
}
