import React from 'react'
import { Track } from 'livekit-client'
import { useMeetingStore } from './MeetingManager.ts'
import { useMeetingUIStore } from './MeetingUIStore.ts'
import SessionEnv from '../../SessionEnv.ts'
import getFileUrl from '../../lib/getFileUrl.ts'
import default_avatar from '../../default_avatar.png'

const SIZE = 56
const MARGIN = 24
const SHOW_THRESHOLD = 0.08

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
function levelColor(level: number) {
    if (level < 0.4) return '#4ade80'
    if (level < 0.7) return '#fbbf24'
    return '#ef4444'
}

interface SpeakerInfo { identity: string, avatar: string }

/**
 * 最小化后的悬浮球:
 * - 可拖动 (不记忆位置, 默认右下角)
 * - 显示当前会议里音量最大的说话者头像
 * - 外圈脉冲/缩放随音量变化
 * - 右下角 call 徽标; 点击恢复窗口(悬浮/分栏按原模式)
 */
export function MeetingBall() {
    const room = useMeetingStore(s => s.room)
    // 订阅 rev 以便音轨/静音变化时重建音频分析器
    useMeetingStore(s => s.rev)
    const setMinimized = useMeetingUIStore(s => s.setMinimized)

    const [speaker, setSpeaker] = React.useState<SpeakerInfo | undefined>(undefined)
    const [pos, setPos] = React.useState(() => ({
        x: Math.max(0, window.innerWidth - SIZE - MARGIN),
        y: Math.max(0, window.innerHeight - SIZE - MARGIN),
    }))

    const ballRef = React.useRef<HTMLDivElement>(null)
    const ringRef = React.useRef<HTMLDivElement>(null)
    const dragRef = React.useRef<{ dx: number, dy: number, startX: number, startY: number, moved: boolean } | null>(null)

    // 视口变化时把球夹回屏幕内
    React.useEffect(() => {
        const onResize = () => setPos(p => ({
            x: Math.max(0, Math.min(p.x, window.innerWidth - SIZE)),
            y: Math.max(0, Math.min(p.y, window.innerHeight - SIZE)),
        }))
        window.addEventListener('resize', onResize)
        return () => window.removeEventListener('resize', onResize)
    }, [])

    // 音轨签名: 参与者 / 麦克风轨 / 静音 变化时才重建分析器
    const participants = room
        ? [room.localParticipant, ...Array.from(room.remoteParticipants.values())]
        : []
    const sig = participants.map((p) => {
        const mic = p.getTrackPublication(Track.Source.Microphone)
        return p.identity + ':' + (mic?.track?.sid || '') + ':' + (mic?.isMuted ? 1 : 0)
    }).join('|')

    // 音量分析: 找出最大音量说话者, 并用 ref 直接做动画
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
                src.connect(analyser)
                let meta: any = {}
                try { meta = JSON.parse(p.metadata || '{}') } catch { }
                const hash = meta.avatar_file_hash as string | undefined
                meters.push({
                    identity: p.identity,
                    avatar: hash ? getFileUrl(hash, SessionEnv.myFileAccessToken) : default_avatar,
                    analyser, src, buf: new Float32Array(analyser.fftSize),
                })
            } catch { /* 忽略单个失败 */ }
        }

        let raf = 0
        let currentId = ''
        const tick = () => {
            let best: Meter | undefined
            let bestLevel = SHOW_THRESHOLD
            for (const m of meters) {
                m.analyser.getFloatTimeDomainData(m.buf as any)
                let sum = 0
                for (let i = 0; i < m.buf.length; i++) sum += m.buf[i] * m.buf[i]
                const level = Math.min(1, Math.sqrt(sum / m.buf.length) * 3.2)
                if (level > bestLevel) { bestLevel = level; best = m }
            }

            const level = best ? bestLevel : 0
            const ring = ringRef.current
            const ball = ballRef.current
            if (ring) {
                ring.style.transform = `scale(${1 + level * 1.2})`
                ring.style.opacity = level > 0 ? String(Math.min(0.6, level * 0.9)) : '0'
                ring.style.borderColor = levelColor(level)
            }
            if (ball) ball.style.transform = `scale(${1 + level * 0.06})`

            // 只在"当前说话者"变化时更新头像, 避免每帧 setState
            if (best && best.identity !== currentId) {
                currentId = best.identity
                setSpeaker({ identity: best.identity, avatar: best.avatar })
            }

            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)

        return () => {
            cancelAnimationFrame(raf)
            for (const m of meters) {
                try { m.src.disconnect() } catch { }
                try { m.analyser.disconnect() } catch { }
            }
        }
    }, [room, sig])

    const onPointerDown = (e: React.PointerEvent) => {
        dragRef.current = {
            dx: e.clientX - pos.x,
            dy: e.clientY - pos.y,
            startX: e.clientX,
            startY: e.clientY,
            moved: false,
        }
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e: React.PointerEvent) => {
        const d = dragRef.current
        if (!d) return
        if (Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) > 5) d.moved = true
        if (!d.moved) return
        setPos({
            x: Math.max(0, Math.min(window.innerWidth - SIZE, e.clientX - d.dx)),
            y: Math.max(0, Math.min(window.innerHeight - SIZE, e.clientY - d.dy)),
        })
    }
    const onPointerUp = (e: React.PointerEvent) => {
        const d = dragRef.current
        dragRef.current = null
        try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { }
        // 拖动阈值内视为点击 -> 恢复窗口
        if (d && !d.moved) setMinimized(false)
    }

    return (
        <div
            ref={ballRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            style={{
                position: 'fixed',
                left: pos.x,
                top: pos.y,
                width: SIZE,
                height: SIZE,
                zIndex: 2000,
                cursor: 'grab',
                touchAction: 'none',
                userSelect: 'none',
            }}
        >
            {/* 音量脉冲环 */}
            <div
                ref={ringRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    border: '2px solid #4ade80',
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 80ms linear',
                    willChange: 'transform, opacity',
                }}
            />
            {/* 头像主体 */}
            <div style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                overflow: 'hidden',
                border: '2px solid rgb(var(--mdui-color-primary))',
                background: '#202020',
                boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
            }}>
                <img
                    src={speaker?.avatar || default_avatar}
                    alt=""
                    draggable={false}
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = default_avatar }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </div>
            {/* 右下角通话徽标 */}
            <div style={{
                position: 'absolute',
                right: -2,
                bottom: -2,
                width: '22px',
                height: '22px',
                borderRadius: '50%',
                background: '#22c55e',
                border: '2px solid rgb(var(--mdui-color-surface-container-low))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.35)',
                pointerEvents: 'none',
            }}>
                <mdui-icon name="call" style={{ fontSize: '14px', color: '#fff' }} />
            </div>
        </div>
    )
}
