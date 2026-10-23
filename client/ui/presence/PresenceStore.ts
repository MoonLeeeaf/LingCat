import React from 'react'
import { create } from 'zustand'
import { UserApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'

/** 在线状态缓存有效期 */
const TTL = 30_000
/** 后台轮询间隔 */
const POLL = 30_000
/** 单次批量查询上限 (与服务端一致) */
const MAX_BATCH = 500

interface PresenceState {
    online: Record<string, boolean>
    ts: Record<string, number>
}

export const usePresenceStore = create<PresenceState>(() => ({ online: {}, ts: {} }))

/** 每个 user_id 的订阅引用计数, 卸载后不再轮询 */
const refs: Record<string, number> = {}
/** 待刷新集合 (去重) */
const queued = new Set<string>()
let pollTimer: ReturnType<typeof setInterval> | undefined
let flushTimer: ReturnType<typeof setTimeout> | undefined
let inFlight = false
let visibilityBound = false

function activeIds(): string[] {
    return Object.keys(refs).filter((id) => refs[id] > 0)
}

async function flush() {
    if (inFlight) return
    const now = Date.now()
    const { ts } = usePresenceStore.getState()
    const ids = Array.from(queued).filter((id) => !(id in ts) || now - ts[id] > TTL)
    queued.clear()
    if (!ids.length) return

    const client = ClientManager.getActiveClient()
    const session = ClientManager.getActiveSession()
    if (!client || !session) return

    inFlight = true
    try {
        for (let i = 0; i < ids.length; i += MAX_BATCH) {
            const chunk = ids.slice(i, i + MAX_BATCH)
            let result: Record<string, boolean>
            try {
                result = await UserApi.getOnlineStatus(client, {
                    access_token: session.token,
                    user_ids: chunk,
                })
            } catch {
                // 失败不写 ts, 下个周期重试
                continue
            }
            const at = Date.now()
            usePresenceStore.setState((s) => {
                const online = { ...s.online }
                const ts2 = { ...s.ts }
                for (const id of chunk) {
                    online[id] = !!result[id]
                    ts2[id] = at
                }
                return { online, ts: ts2 }
            })
        }
    } finally {
        inFlight = false
    }
}

function scheduleFlush() {
    if (flushTimer) return
    flushTimer = setTimeout(() => {
        flushTimer = undefined
        void flush()
    }, 150)
}

function ensureRunning() {
    if (!pollTimer) {
        pollTimer = setInterval(() => {
            for (const id of activeIds()) queued.add(id)
            scheduleFlush()
        }, POLL)
    }
    if (!visibilityBound && typeof document !== 'undefined') {
        visibilityBound = true
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) return
            for (const id of activeIds()) queued.add(id)
            scheduleFlush()
        })
    }
}

function watchPresence(ids: string[]) {
    for (const id of ids) {
        if (!id) continue
        refs[id] = (refs[id] || 0) + 1
        queued.add(id)
    }
    ensureRunning()
    scheduleFlush()
}

function unwatchPresence(ids: string[]) {
    for (const id of ids) {
        if (!id) continue
        if (refs[id]) refs[id] -= 1
    }
}

/** 订阅单个用户的在线状态; 只在自身状态变化时触发重渲染 */
export function useIsOnline(id?: string | null): boolean {
    const online = usePresenceStore((s) => (id ? !!s.online[id] : false))
    React.useEffect(() => {
        if (!id) return
        watchPresence([id])
        return () => unwatchPresence([id])
    }, [id])
    return online
}

/** 订阅一组用户的在线状态 (返回 userId -> online) */
export function useOnlineStatus(ids: string[]): Record<string, boolean> {
    const online = usePresenceStore((s) => s.online)
    const key = Array.from(new Set(ids.filter(Boolean))).sort().join(',')
    React.useEffect(() => {
        const list = key ? key.split(',') : []
        if (!list.length) return
        watchPresence(list)
        return () => unwatchPresence(list)
    }, [key])
    return online
}
