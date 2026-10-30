import React from 'react'
import {
    ConnectionQuality,
    ConnectionState,
    LocalAudioTrack,
    LocalVideoTrack,
    RoomEvent,
    Track,
} from 'livekit-client'
import { useMeetingStore } from './MeetingManager.ts'

/**
 * 会议标题栏里的 LiveKit 连接状态:
 * - 连接点: 绿=已连接, 黄=连接/重连中, 红=断开/丢失
 * - 文本: 已连接时显示 RTT, 否则显示状态
 * - tooltip: 质量/抖动/更新时间
 * 只做局部轮询, 不写入全局 store, 避免视频区域重渲染。
 */

type RttLevel = 0 | 1 | 2

function qualityLabel(quality: ConnectionQuality): string {
    switch (quality) {
        case ConnectionQuality.Excellent: return '优秀'
        case ConnectionQuality.Good: return '良好'
        case ConnectionQuality.Poor: return '较差'
        case ConnectionQuality.Lost: return '丢失'
        default: return '未知'
    }
}

function qualityRank(quality: ConnectionQuality): number {
    switch (quality) {
        case ConnectionQuality.Excellent: return 3
        case ConnectionQuality.Good: return 2
        case ConnectionQuality.Poor: return 1
        case ConnectionQuality.Lost: return 0
        default: return -1
    }
}

export function MeetingConnectionStatus() {
    const room = useMeetingStore(s => s.room)
    const phase = useMeetingStore(s => s.phase)

    const [reconnecting, setReconnecting] = React.useState(false)
    const [quality, setQuality] = React.useState(ConnectionQuality.Unknown)
    const [rtt, setRtt] = React.useState<number | null>(null)
    const [jitter, setJitter] = React.useState<number | null>(null)
    const [updatedAt, setUpdatedAt] = React.useState<number | null>(null)
    const [rttLevel, setRttLevel] = React.useState<RttLevel>(0)

    const samplesRef = React.useRef<number[]>([])
    const levelRef = React.useRef<RttLevel>(0)
    const levelHoldRef = React.useRef(0)

    // LiveKit 重连状态: phase 只能区分 connecting, 这里用 room.state/事件补足
    React.useEffect(() => {
        if (!room) {
            setReconnecting(false)
            return
        }
        const syncState = () => {
            setReconnecting(
                room.state === ConnectionState.Reconnecting ||
                room.state === ConnectionState.SignalReconnecting
            )
        }
        const onReconnecting = () => setReconnecting(true)
        const onReconnected = () => setReconnecting(false)
        const onDisconnected = () => setReconnecting(false)

        room.on(RoomEvent.Reconnecting, onReconnecting)
        room.on(RoomEvent.SignalReconnecting, onReconnecting)
        room.on(RoomEvent.Reconnected, onReconnected)
        room.on(RoomEvent.Disconnected, onDisconnected)
        room.on(RoomEvent.ConnectionStateChanged, syncState)
        syncState()

        return () => {
            room.off(RoomEvent.Reconnecting, onReconnecting)
            room.off(RoomEvent.SignalReconnecting, onReconnecting)
            room.off(RoomEvent.Reconnected, onReconnected)
            room.off(RoomEvent.Disconnected, onDisconnected)
            room.off(RoomEvent.ConnectionStateChanged, syncState)
        }
    }, [room])

    // RTT / 质量 / 抖动: 2 秒一次, 只在本组件内更新
    React.useEffect(() => {
        if (!room) {
            setQuality(ConnectionQuality.Unknown)
            setRtt(null)
            setJitter(null)
            setUpdatedAt(null)
            return
        }

        let cancelled = false
        let timer: ReturnType<typeof setInterval> | undefined

        const readStats = async () => {
            const local = room.localParticipant
            if (!local) return

            // 最差质量 (本地 + 所有远端; Lost 最差)
            let worst = ConnectionQuality.Unknown
            let worstRank = 99
            const qualities = [
                local.connectionQuality,
                ...[...room.remoteParticipants.values()].map(p => p.connectionQuality),
            ]
            for (const q of qualities) {
                const rank = qualityRank(q)
                if (rank >= 0 && rank < worstRank) {
                    worstRank = rank
                    worst = q
                }
            }

            let rttMs: number | null = null
            let jitterMs: number | null = null

            try {
                // 优先本地视频 (摄像头/屏幕共享), 没有视频再降级到本地音频
                const videoPubs = [
                    local.getTrackPublication(Track.Source.Camera),
                    local.getTrackPublication(Track.Source.ScreenShare),
                ]
                for (const pub of videoPubs) {
                    const track = pub?.track
                    if (!(track instanceof LocalVideoTrack)) continue
                    const stats = await track.getSenderStats()
                    const st = stats?.find(x => x.roundTripTime != null) ?? stats?.[stats.length - 1]
                    if (st?.roundTripTime != null) {
                        rttMs = st.roundTripTime * 1000
                        jitterMs = st.jitter != null ? st.jitter * 1000 : null
                        break
                    }
                }

                if (rttMs == null) {
                    const audioPubs = [
                        local.getTrackPublication(Track.Source.Microphone),
                        local.getTrackPublication(Track.Source.ScreenShareAudio),
                    ]
                    for (const pub of audioPubs) {
                        const track = pub?.track
                        if (!(track instanceof LocalAudioTrack)) continue
                        const st = await track.getSenderStats()
                        if (st?.roundTripTime != null) {
                            rttMs = st.roundTripTime * 1000
                            jitterMs = st.jitter != null ? st.jitter * 1000 : null
                            break
                        }
                    }
                }
            } catch {
                // 统计偶发失败, 保持连接状态, 延迟显示 --
            }

            if (cancelled) return
            setQuality(worst)
            setJitter(jitterMs)
            setUpdatedAt(Date.now())

            if (rttMs == null) {
                samplesRef.current = []
                levelHoldRef.current = 0
                levelRef.current = 0
                setRttLevel(0)
                setRtt(null)
                return
            }

            const samples = [...samplesRef.current, rttMs].slice(-3)
            samplesRef.current = samples
            const sorted = [...samples].sort((a, b) => a - b)
            const median = sorted[Math.floor(sorted.length / 2)]
            setRtt(median)

            // 连续两次越界才切换颜色, 避免抖动
            const nextLevel: RttLevel = median > 250 ? 2 : median > 100 ? 1 : 0
            if (nextLevel !== levelRef.current) {
                levelHoldRef.current++
                if (levelHoldRef.current >= 2) {
                    levelRef.current = nextLevel
                    levelHoldRef.current = 0
                    setRttLevel(nextLevel)
                }
            } else {
                levelHoldRef.current = 0
            }
        }

        const tick = () => {
            if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
            void readStats()
        }

        tick()
        timer = setInterval(tick, 2000)

        return () => {
            cancelled = true
            if (timer) clearInterval(timer)
        }
    }, [room])

    const connected = phase === 'connected' && !!room
    const connecting = phase === 'connecting'
    const lost = connected && quality === ConnectionQuality.Lost
    const disconnected = phase === 'error' || phase === 'idle'

    let dotColor = '#9e9e9e'
    let text = '未连接'
    if (reconnecting) {
        dotColor = '#e0a800'
        text = '重连中'
    } else if (lost) {
        dotColor = '#d32f2f'
        text = '连接丢失'
    } else if (connected) {
        dotColor = '#2e7d32'
        text = rtt != null ? `${Math.round(rtt)}ms` : '--ms'
    } else if (connecting) {
        dotColor = '#e0a800'
        text = '连接中'
    } else if (disconnected) {
        dotColor = phase === 'error' ? '#d32f2f' : '#9e9e9e'
        text = phase === 'error' ? '已断开' : '未连接'
    }

    const stateText = reconnecting
        ? '重连中'
        : lost
            ? '连接丢失'
            : connected
                ? '已连接'
                : connecting
                    ? '连接中'
                    : phase === 'error' ? '已断开' : '未连接'

    const rttColor = connected && !lost
        ? (rttLevel === 2 ? 'rgb(var(--mdui-color-error))' : rttLevel === 1 ? '#b26a00' : undefined)
        : undefined

    const tipParts = [`LiveKit ${stateText}`]
    if (connected && !lost && rtt != null) tipParts.push(`延迟 ${Math.round(rtt)} ms`)
    if (quality !== ConnectionQuality.Unknown) tipParts.push(`质量 ${qualityLabel(quality)}`)
    if (jitter != null && Number.isFinite(jitter)) tipParts.push(`抖动 ${jitter.toFixed(1)} ms`)
    if (updatedAt != null) tipParts.push(`更新 ${new Date(updatedAt).toLocaleTimeString()}`)
    const tip = tipParts.join(' · ')

    return (
        <mdui-tooltip variant="plain" placement="bottom" content={tip}>
            <div
                role="status"
                tabIndex={0}
                aria-label={tip}
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '5px',
                    minWidth: '42px',
                    flexShrink: 0,
                    fontSize: '11px',
                    lineHeight: 1,
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                    cursor: 'default',
                    outline: 'none',
                }}
            >
                <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    background: dotColor,
                    flexShrink: 0,
                }} />
                <span style={{ opacity: 0.7, color: rttColor }}>{text}</span>
            </div>
        </mdui-tooltip>
    )
}
