import React from 'react'
import { Track, type Participant } from 'livekit-client'

/**
 * 基于 Web Audio AnalyserNode 的实时音量条 (类似 MiroTalk):
 * 仅在说话 (音量超过阈值) 时显示, 长度随音量增长, 颜色 绿 -> 橙 -> 红
 */

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
    if (level < 0.4) return '#4ade80'   // 绿
    if (level < 0.7) return '#fbbf24'   // 橙
    return '#ef4444'                    // 红
}

function rmsLevel(analyser: AnalyserNode, buf: Float32Array) {
    analyser.getFloatTimeDomainData(buf as any)
    let sum = 0
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
    const rms = Math.sqrt(sum / buf.length)
    return Math.max(0, Math.min(1, rms * 3.2))
}

// 低于此音量视为"没在说话", 隐藏音量条
const SHOW_THRESHOLD = 0.08

export function AudioLevelBar({ participant, muted }: { participant: Participant, muted: boolean }) {
    const boxRef = React.useRef<HTMLDivElement>(null)
    const fillRef = React.useRef<HTMLDivElement>(null)
    const mic = participant.getTrackPublication(Track.Source.Microphone)
    const track = mic?.track
    const sid = track?.sid

    React.useEffect(() => {
        const box = boxRef.current
        const fill = fillRef.current
        if (!box || !fill) return

        const hide = () => {
            box.style.opacity = '0'
            fill.style.width = '0%'
        }

        // 静音 / 无轨道: 直接隐藏
        if (muted || !track?.mediaStreamTrack) {
            hide()
            return
        }

        const ctx = getAudioContext()
        if (!ctx) { hide(); return }

        let src: MediaStreamAudioSourceNode | undefined
        let analyser: AnalyserNode | undefined
        try {
            src = ctx.createMediaStreamSource(new MediaStream([track.mediaStreamTrack]))
            analyser = ctx.createAnalyser()
            analyser.fftSize = 512
            analyser.smoothingTimeConstant = 0.6
            src.connect(analyser)
        } catch (e) {
            console.warn('[Meeting] 音量分析失败', e)
            hide()
            return
        }

        const buf = new Float32Array(analyser.fftSize)
        let raf = 0
        let visible = false
        const tick = () => {
            const level = rmsLevel(analyser!, buf)
            const show = level > SHOW_THRESHOLD
            if (show) {
                fill.style.width = (level * 100).toFixed(1) + '%'
                fill.style.background = levelColor(level)
            }
            if (show !== visible) {
                visible = show
                box.style.opacity = show ? '1' : '0'
                if (!show) fill.style.width = '0%'
            }
            raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)

        return () => {
            cancelAnimationFrame(raf)
            try { src?.disconnect() } catch { }
            try { analyser?.disconnect() } catch { }
        }
    }, [sid, muted, track])

    return <div ref={boxRef} style={{
        position: 'absolute', top: '6px', left: '6px',
        width: '46px', height: '6px', borderRadius: '3px',
        background: 'rgba(0,0,0,0.45)', overflow: 'hidden',
        opacity: 0, transition: 'opacity 150ms linear', pointerEvents: 'none',
    }}>
        <div ref={fillRef} style={{
            height: '100%', width: '0%',
            background: '#4ade80', borderRadius: '3px',
            transition: 'width 60ms linear, background-color 120ms linear',
        }} />
    </div>
}
