import React from 'react'
import { Track } from 'livekit-client'
import { useMeetingStore } from './MeetingManager.ts'
import { useMeetingUIStore } from './MeetingUIStore.ts'
import ProfileCache from '../../ProfileCache.ts'
import SessionEnv from '../../SessionEnv.ts'
import getFileUrl from '../../lib/getFileUrl.ts'
import default_avatar from '../../default_avatar.png'

const SIZE = 56
const MARGIN = 24
const RING_INSET = 6
const RING_MAX_SCALE = 1.08        // 外层最大视觉直径约 68*1.08≈73px (< 56*1.35≈76)
const GATE = 0.06                  // 噪声门限
const ATTACK_TAU = 0.10            // 上升时间常数 ~100ms
const RELEASE_TAU = 0.36           // 回落 ~360ms
const FRAME_MS = 33                // 约 30fps
const SPEAKER_HOLD_MS = 240        // 新说话者需持续
const SWITCH_MIN_MS = 400          // 最短切换间隔
const POS_KEY = 'lingcat.meeting.ui.ballPos'

const REDUCED_MOTION = typeof window !== 'undefined'
    && !!window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

let audioCtx: AudioContext | undefined
function getAudioContext(): AudioContext | undefined {
    if (audioCtx == null) {
        const AC = window.AudioContext || (window as any).webkitAudioContext
        if (!AC) return undefined
        audioCtx = new AC()
    }
    if (audioCtx.state === 'suspended') audioCtx.resume().catch(() => { })
    return audioCtx
}

interface SpeakerInfo { identity: string, avatar: string }

function clampPos(x: number, y: number) {
    return {
        x: Math.max(RING_INSET, Math.min(x, window.innerWidth - SIZE - RING_INSET)),
        y: Math.max(RING_INSET, Math.min(y, window.innerHeight - SIZE - RING_INSET)),
    }
}
function loadPos(): { x: number, y: number } {
    try {
        const raw = localStorage.getItem(POS_KEY)
        if (raw) {
            const p = JSON.parse(raw)
            if (Number.isFinite(p?.x) && Number.isFinite(p?.y)) return clampPos(p.x, p.y)
        }
    } catch { }
    return clampPos(window.innerWidth - SIZE - MARGIN, window.innerHeight - SIZE - MARGIN)
}
function savePos(p: { x: number, y: number }) {
    try { localStorage.setItem(POS_KEY, JSON.stringify(p)) } catch { }
}

/**
 * 最小化后的会议悬浮球:
 * - 记忆拖动位置 (localStorage)
 * - 显示当前音量最大的说话者头像 (跨说话者柔和淡入)
 * - 双层柔光环随音量呼吸 (平滑 attack/release, 统一绿色)
 * - 右下角显示当前对话/群组头像 (无头像时用 forum 图标)
 * - 点击 / Enter / Space 恢复会议窗口 (悬浮/分栏/移动端按原模式)
 */
export function MeetingBall() {
    const room = useMeetingStore(s => s.room)
    const chatId = useMeetingStore(s => s.chatId)
    // 订阅 rev: 参与者/音轨/静音变化时重建分析器
    useMeetingStore(s => s.rev)
    const setMinimized = useMeetingUIStore(s => s.setMinimized)

    const [pos, setPos] = React.useState(loadPos)
    const [cur, setCur] = React.useState<SpeakerInfo | undefined>(undefined)
    const [prev, setPrev] = React.useState<SpeakerInfo | undefined>(undefined)
    const [chatAvatar, setChatAvatar] = React.useState<string | undefined>(undefined)
    const [dragging, setDragging] = React.useState(false)

    const curRef = React.useRef<SpeakerInfo | undefined>(undefined)
    const prevTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const innerRingRef = React.useRef<HTMLDivElement>(null)
    const outerRingRef = React.useRef<HTMLDivElement>(null)
    const dragRef = React.useRef<{ dx: number, dy: number, startX: number, startY: number, moved: boolean } | null>(null)

    // 当前对话/群组头像
    React.useEffect(() => {
        setChatAvatar(undefined)
        if (!chatId) return
        let alive = true
        ProfileCache.queryChatInfo(chatId)
            .then((chat) => {
                if (alive && chat?.avatar_file_hash)
                    setChatAvatar(getFileUrl(chat.avatar_file_hash, SessionEnv.myFileAccessToken))
            })
            .catch(() => { })
        return () => { alive = false }
    }, [chatId])

    // 视口变化时夹回屏内
    React.useEffect(() => {
        const onResize = () => setPos(p => clampPos(p.x, p.y))
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    // 音轨签名: 参与者 / 麦克风轨 / 静音 / metadata 变化时才重建分析器
    const sig = room
        ? [room.localParticipant, ...Array.from(room.remoteParticipants.values())].map((p) => {
            const mic = p.getTrackPublication(Track.Source.Microphone)
            return p.identity + ':' + (mic?.track?.sid || '') + ':' + (mic?.isMuted ? 1 : 0) + ':' + (p.metadata || '')
        }).join('|')
        : ''

    // 音量分析 + 说话者识别 + 光环动画
    React.useEffect(() => {
        if (!room) return
        const ctx = getAudioContext()
        if (!ctx) return

        type Meter = { identity: string, avatar: string, analyser: AnalyserNode, src: MediaStreamAudioSourceNode, buf: Float32Array }
        const meters: Meter[] = []
        for (const p of [room.localParticipant, ...Array.from(room.remoteParticipants.values())]) {
            const mic = p.getTrackPublication(Track.Source.Microphone)
            const track = mic?.track
            if (!track?.mediaStreamTrack || mic?.isMuted) continue
            try {
                const src = ctx.createMediaStreamSource(new MediaStream([track.mediaStreamTrack]))
                const analyser = ctx.createAnalyser()
                analyser.fftSize = 512
                analyser.smoothingTimeConstant = 0.6
                src.connect(analyser)   // 只连分析器, 不接 destination (不额外出声)
                let meta: any = {}
                try { meta = JSON.parse(p.metadata || '{}') } catch { }
                const hash = meta.avatar_file_hash as string | undefined
                meters.push({
                    identity: p.identity,
                    avatar: hash ? getFileUrl(hash, SessionEnv.myFileAccessToken) : default_avatar,
                    analyser, src, buf: new Float32Array(analyser.fftSize),
                })
            } catch { /* 忽略单个分析器失败 */ }
        }

        let raf = 0
        let lastDraw = performance.now()
        let smooth = 0
        let candidateId = ''
        let candidateSince = 0
        let lastSwitch = 0

        const rms = (m: Meter) => {
            m.analyser.getFloatTimeDomainData(m.buf as any)
            let sum = 0
            for (let i = 0; i < m.buf.length; i++) sum += m.buf[i] * m.buf[i]
            return Math.min(1, Math.sqrt(sum / m.buf.length) * 3.2)
        }

        const tick = (now: number) => {
            raf = requestAnimationFrame(tick)
            if (document.hidden) return
            if (now - lastDraw < FRAME_MS) return
            const dt = Math.min(0.15, (now - lastDraw) / 1000)
            lastDraw = now

            // 每路音量
            let best: Meter | undefined
            let bestLevel = GATE
            let levels: Map<string, number> | undefined
            if (meters.length > 1) levels = new Map()
            for (const m of meters) {
                const lv = rms(m)
                if (levels) levels.set(m.identity, lv)
                if (lv > bestLevel) { bestLevel = lv; best = m }
            }

            // 平滑音量 (按时间差, 与刷新率无关)
            const target = best ? Math.min(1, (bestLevel - GATE) / (1 - GATE)) : 0
            const tau = target > smooth ? ATTACK_TAU : RELEASE_TAU
            smooth += (target - smooth) * (1 - Math.exp(-dt / tau))
            if (smooth < 0.002) smooth = 0

            // 说话者切换 (防抖 + 迟滞 + 最短间隔)
            if (best) {
                const active = curRef.current
                if (!active) {
                    // 还没有任何说话者: 达到持续阈值即可
                    if (candidateId !== best.identity) { candidateId = best.identity; candidateSince = now }
                    else if (now - candidateSince >= SPEAKER_HOLD_MS) {
                        curRef.current = { identity: best.identity, avatar: best.avatar }
                        setCur(curRef.current)
                        lastSwitch = now
                    }
                } else if (best.identity !== active.identity) {
                    if (candidateId !== best.identity) { candidateId = best.identity; candidateSince = now }
                    else if (now - candidateSince >= SPEAKER_HOLD_MS && now - lastSwitch >= SWITCH_MIN_MS) {
                        const activeLevel = levels ? (levels.get(active.identity) ?? 0) : 0
                        // 当前说话者已安静, 或新者明显更强, 才切换
                        if (activeLevel < GATE || bestLevel > (levels ? activeLevel : 0) * 1.15) {
                            const old = curRef.current
                            curRef.current = { identity: best.identity, avatar: best.avatar }
                            setPrev(old)
                            setCur(curRef.current)
                            lastSwitch = now
                            candidateId = ''
                            if (prevTimer.current) clearTimeout(prevTimer.current)
                            prevTimer.current = setTimeout(() => setPrev(undefined), 220)
                        }
                    }
                } else {
                    // 当前说话者仍在说话
                    candidateId = ''
                }
            } else {
                candidateId = ''
            }

            // 应用光环动画 (ref, 不触发 React 重渲染)
            const inner = innerRingRef.current
            const outer = outerRingRef.current
            if (inner) {
                inner.style.opacity = String(0.12 + smooth * 0.78)
            }
            if (outer) {
                const scale = REDUCED_MOTION ? 1 : (1 + smooth * (RING_MAX_SCALE - 1))
                outer.style.transform = `scale(${scale})`
                outer.style.opacity = String(smooth * 0.5)
                outer.style.boxShadow = `0 0 ${8 + smooth * 10}px rgba(74,222,128,${(smooth * 0.35).toFixed(3)})`
            }
        }

        raf = requestAnimationFrame(tick)
        return () => {
            cancelAnimationFrame(raf)
            if (prevTimer.current) { clearTimeout(prevTimer.current); prevTimer.current = undefined }
            for (const m of meters) {
                try { m.src.disconnect() } catch { }
                try { m.analyser.disconnect() } catch { }
            }
        }
    }, [room, sig])

    // ---- 拖动 / 点击 ----
    const onPointerDown = (e: React.PointerEvent) => {
        if (e.button != null && e.button !== 0) return
        dragRef.current = {
            dx: e.clientX - pos.x,
            dy: e.clientY - pos.y,
            startX: e.clientX,
            startY: e.clientY,
            moved: false,
        }
        setDragging(true)
        try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { }
    }
    const onPointerMove = (e: React.PointerEvent) => {
        const d = dragRef.current
        if (!d) return
        if (!d.moved && Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) > 5) d.moved = true
        if (!d.moved) return
        setPos(clampPos(e.clientX - d.dx, e.clientY - d.dy))
    }
    const endPointer = (e: React.PointerEvent, cancelled: boolean) => {
        const d = dragRef.current
        dragRef.current = null
        setDragging(false)
        try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { }
        if (!d) return
        if (!cancelled && !d.moved) setMinimized(false)   // 点击恢复
        else if (d.moved) savePos(pos)
    }

    return (
        <div
            role="button"
            tabIndex={0}
            aria-label="回到会议"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => endPointer(e, false)}
            onPointerCancel={(e) => endPointer(e, true)}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMinimized(false) }
            }}
            style={{
                position: 'fixed',
                left: pos.x,
                top: pos.y,
                width: SIZE,
                height: SIZE,
                zIndex: 2000,
                cursor: dragging ? 'grabbing' : 'grab',
                touchAction: 'none',
                userSelect: 'none',
                outline: 'none',
                overflow: 'visible',
            }}
        >
            <style>{`@keyframes lcBallFadeIn{from{opacity:0}to{opacity:1}}`}</style>

            {/* 外层柔光环 */}
            <div ref={outerRingRef} style={{
                position: 'absolute',
                inset: -RING_INSET,
                borderRadius: '50%',
                border: '1.5px solid rgba(74,222,128,0.55)',
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 90ms linear',
                willChange: 'transform, opacity, box-shadow',
            }} />
            {/* 内层光环 (紧贴头像) */}
            <div ref={innerRingRef} style={{
                position: 'absolute',
                inset: -1,
                borderRadius: '50%',
                border: '2px solid #4ade80',
                opacity: 0.12,
                pointerEvents: 'none',
                transition: 'opacity 90ms linear',
            }} />

            {/* 头像主体 (尺寸固定, 不随音量缩放) */}
            <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.14)',
                background: '#202020',
                boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            }}>
                {prev && (
                    <img
                        src={prev.avatar}
                        alt=""
                        draggable={false}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                )}
                <img
                    key={cur?.identity || 'default'}
                    src={cur?.avatar || default_avatar}
                    alt=""
                    draggable={false}
                    onError={(e) => {
                        const el = e.currentTarget
                        if (el.dataset.fallback) return
                        el.dataset.fallback = '1'
                        el.src = default_avatar
                    }}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        animation: REDUCED_MOTION ? undefined : 'lcBallFadeIn 180ms ease',
                    }}
                />
            </div>

            {/* 右下角: 当前对话/群组头像或 forum 图标 */}
            <div style={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                overflow: 'hidden',
                background: '#22c55e',
                border: '2px solid #22c55e',
                boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
            }}>
                {chatAvatar
                    ? <img
                        src={chatAvatar}
                        alt=""
                        draggable={false}
                        onError={(e) => { const el = e.currentTarget; if (!el.dataset.fallback) { el.dataset.fallback = '1'; el.style.display = 'none' } }}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    : <mdui-icon name="forum" style={{ fontSize: '13px', color: '#fff' }} />}
            </div>
        </div>
    )
}
