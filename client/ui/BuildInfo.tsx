import React from 'react'
import { createPortal } from 'react-dom'
import ClientManager from '../ClientManager.ts'
import type LingCatClient from 'lingcat-client-protocol'

/**
 * 构建/连接诊断:
 * - 左侧会话列表底部显示构建信息、连接状态、更新提示
 * - 点击打开“构建与连接”弹窗, 查看服务端版本/协议/延迟/重连/同步等
 * - 可在左下角客户端设置里关闭
 */

const STORAGE_KEY = 'lingcat_show_build_info'
const listeners = new Set<() => void>()

interface ServerVersionInfo {
    protocol_version?: string
    git_sha?: string
    git_dirty?: boolean
    started_at?: string
}

interface ClientStats {
    rtt: number | null
    lastMessageAt: number | null
    reconnectCount: number
}

function readShowBuildInfo(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) !== '0'
    } catch {
        return true
    }
}

function subscribeShowBuildInfo(callback: () => void) {
    listeners.add(callback)
    const onStorage = (e: StorageEvent) => {
        if (e.key === STORAGE_KEY) callback()
    }
    if (typeof window !== 'undefined') window.addEventListener('storage', onStorage)
    return () => {
        listeners.delete(callback)
        if (typeof window !== 'undefined') window.removeEventListener('storage', onStorage)
    }
}

export function useShowBuildInfo(): boolean {
    return React.useSyncExternalStore(subscribeShowBuildInfo, readShowBuildInfo, () => true)
}

export function setShowBuildInfo(show: boolean) {
    try {
        localStorage.setItem(STORAGE_KEY, show ? '1' : '0')
    } catch { /* ignore */ }
    for (const listener of listeners) listener()
}

function formatBuildTime(value: string): string {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatFullTime(value: string | number | null | undefined): string {
    if (value == null || value === '') return '—'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
}

function shortSha(sha: string | undefined): string {
    if (!sha || sha === 'unknown') return 'unknown'
    return sha.slice(0, 7)
}

function currentAssetPath(): string | null {
    const script = document.querySelector<HTMLScriptElement>('script[type="module"][src]')
    if (!script) return null
    try {
        return new URL(script.src, location.href).pathname
    } catch {
        return script.src
    }
}

function extractAssetPath(html: string): string | null {
    const match = html.match(/<script[^>]+src=["']([^"']*assets\/index-[^"']+\.js)["']/)
    if (!match) return null
    try {
        return new URL(match[1], location.href).pathname
    } catch {
        return match[1]
    }
}

async function checkClientUpdate(): Promise<boolean> {
    const current = currentAssetPath()
    if (!current) return false
    const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/')
    const url = new URL(base + 'index.html', location.origin)
    url.searchParams.set('_', String(Date.now()))
    const res = await fetch(url.toString(), { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const next = extractAssetPath(await res.text())
    return !!next && next !== current
}

async function fetchServerVersion(): Promise<ServerVersionInfo> {
    const client = ClientManager.getActiveClient()
    if (!client) throw new Error('未连接')
    const base = client.server_http.replace(/\/+$/, '')
    const res = await fetch(base + '/version', { cache: 'no-store' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) throw new Error('服务端未提供 /version 接口')
    return await res.json() as ServerVersionInfo
}

function refreshPage() {
    const url = new URL(location.href)
    url.searchParams.set('_refresh', String(Date.now()))
    location.replace(url.toString())
}

function readStats(client: LingCatClient | null): ClientStats {
    return {
        rtt: client?.lastPingRtt ?? null,
        lastMessageAt: client?.lastMessageAt ?? null,
        reconnectCount: client?.reconnectCount ?? 0,
    }
}

function connectionLabel(online: boolean, state: string): string {
    if (!online) return '网络离线'
    if (state === 'connected') return '已连接'
    if (state === 'reconnecting') return '重连中'
    if (state === 'connecting') return '连接中'
    if (state === 'disconnected') return '已断开'
    return '未连接'
}

function connectionColor(online: boolean, state: string): string {
    if (!online || state === 'disconnected') return '#d32f2f'
    if (state === 'reconnecting' || state === 'connecting') return '#e0a800'
    if (state === 'connected') return '#2e7d32'
    return '#9e9e9e'
}

function InfoRow({ label, value, mono, warn }: {
    label: string
    value: React.ReactNode
    mono?: boolean
    warn?: boolean
}) {
    return (
        <div style={{
            display: 'flex',
            gap: '12px',
            padding: '6px 0',
            borderBottom: '1px solid rgba(127,127,127,0.12)',
            fontSize: '12px',
        }}>
            <span style={{ width: '84px', flexShrink: 0, opacity: 0.55 }}>{label}</span>
            <span style={{
                flex: 1,
                minWidth: 0,
                wordBreak: 'break-all',
                fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined,
                color: warn ? 'rgb(var(--mdui-color-error))' : undefined,
            }}>{value}</span>
        </div>
    )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div style={{ marginTop: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.55, marginBottom: '2px' }}>{title}</div>
            {children}
        </div>
    )
}

function BuildInfoContent() {
    const client = ClientManager.getActiveClient()
    const subscribe = React.useCallback(
        (notify: () => void) => client?.subscribeConnectionState(notify) ?? (() => {}),
        [client],
    )
    const snapshot = React.useCallback(() => client?.connectionState ?? 'idle', [client])
    const connectionState = React.useSyncExternalStore(subscribe, snapshot)

    const [online, setOnline] = React.useState(() => typeof navigator === 'undefined' ? true : navigator.onLine)
    const [hovered, setHovered] = React.useState(false)
    const [detailsOpen, setDetailsOpen] = React.useState(false)
    const [stats, setStats] = React.useState<ClientStats>(() => readStats(client))
    const [updateAvailable, setUpdateAvailable] = React.useState(false)
    const [checking, setChecking] = React.useState(false)
    const [lastCheckAt, setLastCheckAt] = React.useState<number | null>(null)
    const [checkError, setCheckError] = React.useState<string | null>(null)
    const [serverInfo, setServerInfo] = React.useState<ServerVersionInfo | null>(null)
    const [serverError, setServerError] = React.useState<string | null>(null)
    const checkingRef = React.useRef(false)
    const dialogRef = React.useRef<any>(null)

    React.useEffect(() => {
        const update = () => setOnline(navigator.onLine)
        window.addEventListener('online', update)
        window.addEventListener('offline', update)
        return () => {
            window.removeEventListener('online', update)
            window.removeEventListener('offline', update)
        }
    }, [])

    React.useEffect(() => {
        setStats(readStats(client))
    }, [client, connectionState])

    React.useEffect(() => {
        if (!hovered && !detailsOpen) return
        const timer = window.setInterval(() => setStats(readStats(client)), 1000)
        return () => window.clearInterval(timer)
    }, [client, hovered, detailsOpen])

    const checkNow = React.useCallback(async () => {
        if (checkingRef.current) return
        checkingRef.current = true
        setChecking(true)
        try {
            const [updateResult, serverResult] = await Promise.allSettled([
                checkClientUpdate(),
                fetchServerVersion(),
            ])
            if (updateResult.status === 'fulfilled') {
                setUpdateAvailable(updateResult.value)
                setCheckError(null)
            } else {
                setCheckError(String(updateResult.reason))
            }
            if (serverResult.status === 'fulfilled') {
                setServerInfo(serverResult.value)
                setServerError(null)
            } else {
                setServerInfo(null)
                setServerError(String(serverResult.reason))
            }
        } finally {
            checkingRef.current = false
            setChecking(false)
            setLastCheckAt(Date.now())
        }
    }, [])

    React.useEffect(() => {
        void checkNow()
        const timer = window.setInterval(() => {
            if (document.visibilityState === 'visible') void checkNow()
        }, 5 * 60 * 1000)
        const onFocus = () => { void checkNow() }
        const onVisible = () => {
            if (document.visibilityState === 'visible') void checkNow()
        }
        const onOnline = () => { void checkNow() }
        window.addEventListener('focus', onFocus)
        window.addEventListener('online', onOnline)
        document.addEventListener('visibilitychange', onVisible)
        return () => {
            window.clearInterval(timer)
            window.removeEventListener('focus', onFocus)
            window.removeEventListener('online', onOnline)
            document.removeEventListener('visibilitychange', onVisible)
        }
    }, [checkNow])

    React.useEffect(() => {
        const el = dialogRef.current
        if (!el) return
        const onClosed = () => setDetailsOpen(false)
        el.addEventListener('closed', onClosed)
        return () => el.removeEventListener('closed', onClosed)
    }, [])

    React.useEffect(() => {
        const el = dialogRef.current
        if (!el) return
        if (detailsOpen) el.open = true
        else if (el.open) el.open = false
    }, [detailsOpen])

    const session = ClientManager.getActiveSession()
    const account = session?.nickname
        ? `${session.nickname} (${session.account})`
        : (session?.account || '—')
    const serverAddress = session?.server || '—'
    const stateLabel = connectionLabel(online, connectionState)
    const dotColor = connectionColor(online, connectionState)
    const dirtyMark = __BUILD_DIRTY__ ? '+' : ''
    const sha = shortSha(__BUILD_SHA__)
    const protocolMismatch = !!(
        serverInfo?.protocol_version &&
        serverInfo.protocol_version !== 'unknown' &&
        __PROTOCOL_VERSION__ !== 'unknown' &&
        serverInfo.protocol_version !== __PROTOCOL_VERSION__
    )
    const dotTitle = [
        stateLabel,
        `延迟 ${stats.rtt != null ? `${stats.rtt} ms` : '—'}`,
        `最后同步 ${formatFullTime(stats.lastMessageAt)}`,
        '点击重连',
    ].join(' · ')

    const reconnect = () => {
        const current = ClientManager.getActiveClient()
        if (current) current.reconnect()
    }

    const dialog = createPortal(
        <mdui-dialog ref={dialogRef} close-on-overlay-click close-on-esc>
            <span slot="headline">构建与连接</span>

            <div style={{ width: 'min(480px, 82vw)', paddingRight: '4px' }}>
                {updateAvailable && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(var(--mdui-color-primary), 0.1)',
                        color: 'rgb(var(--mdui-color-primary))',
                        fontSize: '12px',
                    }}>
                        <span style={{ flex: 1 }}>发现新版本可用</span>
                        <mdui-button variant="filled" onClick={refreshPage}>立即刷新</mdui-button>
                    </div>
                )}

                {protocolMismatch && (
                    <div style={{
                        marginTop: updateAvailable ? '8px' : 0,
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: 'rgba(var(--mdui-color-error), 0.1)',
                        color: 'rgb(var(--mdui-color-error))',
                        fontSize: '12px',
                    }}>
                        协议不匹配：客户端 {__PROTOCOL_VERSION__} / 服务端 {serverInfo?.protocol_version}
                    </div>
                )}

                <Section title="客户端">
                    <InfoRow label="版本" value={`${__APP_VERSION__} (${__BUILD_CHANNEL__})`} />
                    <InfoRow label="提交" value={`${sha}${dirtyMark}`} mono />
                    <InfoRow label="分支" value={__BUILD_BRANCH__} mono />
                    <InfoRow label="构建时间" value={formatFullTime(__BUILD_TIME__)} />
                    <InfoRow label="协议" value={__PROTOCOL_VERSION__} mono />
                </Section>

                <Section title="服务端">
                    {serverInfo ? (
                        <>
                            <InfoRow
                                label="提交"
                                value={`${shortSha(serverInfo.git_sha)}${serverInfo.git_dirty ? '+' : ''}`}
                                mono
                            />
                            <InfoRow label="启动时间" value={formatFullTime(serverInfo.started_at)} />
                            <InfoRow
                                label="协议"
                                value={serverInfo.protocol_version || 'unknown'}
                                mono
                                warn={protocolMismatch}
                            />
                        </>
                    ) : (
                        <div style={{ fontSize: '12px', opacity: 0.6, padding: '6px 0' }}>
                            {serverError ? `获取失败：${serverError}` : (checking ? '获取中…' : '未获取')}
                        </div>
                    )}
                </Section>

                <Section title="连接">
                    <InfoRow label="状态" value={stateLabel} />
                    <InfoRow label="延迟" value={stats.rtt != null ? `${stats.rtt} ms` : '—'} />
                    <InfoRow label="重连次数" value={String(stats.reconnectCount)} />
                    <InfoRow label="最后同步" value={formatFullTime(stats.lastMessageAt)} />
                    <InfoRow label="上次检查" value={formatFullTime(lastCheckAt)} />
                    {checkError && <InfoRow label="检查更新" value={`失败：${checkError}`} warn />}
                </Section>

                <Section title="账号 / 服务器">
                    <InfoRow label="账号" value={account} />
                    <InfoRow label="服务器" value={serverAddress} mono />
                </Section>

                <Section title="操作">
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
                        <mdui-button variant="text" onClick={() => void checkNow()} disabled={checking}>
                            {checking ? '检查中…' : '检查更新'}
                        </mdui-button>
                        <mdui-button variant="text" onClick={refreshPage}>刷新页面</mdui-button>
                    </div>
                </Section>
            </div>

            <mdui-button slot="action" variant="text" onClick={() => setDetailsOpen(false)}>关闭</mdui-button>
        </mdui-dialog>,
        document.body,
    )

    return (
        <>
            <div
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => setDetailsOpen(true)}
                title="点击查看构建与连接详情"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: '4px 6px',
                    marginTop: '6px',
                    padding: '10px 8px 12px',
                    color: 'rgb(var(--mdui-color-on-surface))',
                    fontSize: '11px',
                    lineHeight: 1.4,
                    textAlign: 'center',
                    userSelect: 'text',
                    fontVariantNumeric: 'tabular-nums',
                    cursor: 'pointer',
                }}
            >
                <button
                    type="button"
                    title={dotTitle}
                    onClick={(e) => { e.stopPropagation(); reconnect() }}
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        border: 'none',
                        padding: 0,
                        flexShrink: 0,
                        background: dotColor,
                        cursor: 'pointer',
                    }}
                />
                <span style={{ opacity: 0.6, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
                    {sha}{dirtyMark}
                </span>
                <span style={{ opacity: 0.5 }}>·</span>
                <span style={{ opacity: 0.6 }}>构建 {formatBuildTime(__BUILD_TIME__)}</span>
                {protocolMismatch && (
                    <button
                        type="button"
                        title={`协议不匹配：客户端 ${__PROTOCOL_VERSION__} / 服务端 ${serverInfo?.protocol_version}，点击查看`}
                        onClick={(e) => { e.stopPropagation(); setDetailsOpen(true) }}
                        style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#b26a00',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: 0,
                            cursor: 'pointer',
                        }}
                    >!</button>
                )}
                {updateAvailable && (
                    <button
                        type="button"
                        title="发现新版本，点击刷新"
                        onClick={(e) => { e.stopPropagation(); refreshPage() }}
                        style={{
                            border: 'none',
                            borderRadius: '999px',
                            padding: '1px 7px',
                            fontSize: '10px',
                            lineHeight: 1.5,
                            background: 'rgb(var(--mdui-color-primary))',
                            color: 'rgb(var(--mdui-color-on-primary))',
                            cursor: 'pointer',
                        }}
                    >有更新</button>
                )}
            </div>
            {dialog}
        </>
    )
}

export function BuildInfoFooter() {
    const show = useShowBuildInfo()
    return show ? <BuildInfoContent /> : null
}
