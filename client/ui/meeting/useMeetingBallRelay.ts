import React from 'react'
import { Track } from 'livekit-client'

import SessionEnv from '../../SessionEnv.ts'
import ProfileCache from '../../ProfileCache.ts'
import getFileUrl from '../../lib/getFileUrl.ts'
import default_avatar from '../../default_avatar.png'
import { useMeetingStore } from './MeetingManager.ts'

const GATE = 0.06
const VOICE_LEVEL = 0.04
const IDLE_DELAY_MS = 2000
const ATTACK_TAU = 0.10
const RELEASE_TAU = 0.36
const SPEAKER_HOLD_MS = 240
const SWITCH_MIN_MS = 400
const TICK_MS = 50

interface Meter {
    identity: string
    avatar: string
    analyser: AnalyserNode
    src: MediaStreamAudioSourceNode
    buf: Float32Array
}

/**
 * 会议窗口内的“悬浮球状态中继”：
 * 分析各成员麦克风音量，算出当前说话者头像与平滑音量，通过 IPC 推给独立的
 * 悬浮球窗口，让它看起来和网页内悬浮球一致。
 */
export function useMeetingBallRelay(chatId: string | undefined, enabled: boolean) {
    const room = useMeetingStore(s => s.room)
    const rev = useMeetingStore(s => s.rev)

    React.useEffect(() => {
        const bridge = window.lingcatDesktop
        if (!enabled || !chatId || !bridge) return

        let alive = true
        let chatAvatar: string | undefined
        ProfileCache.queryChatInfo(chatId)
            .then((chat: any) => {
                if (alive && chat?.avatar_file_hash) {
                    chatAvatar = getFileUrl(chat.avatar_file_hash, SessionEnv.myFileAccessToken)
                }
            })
            .catch(() => { })

        const AC = window.AudioContext || (window as any).webkitAudioContext
        if (!AC) return
        const ctx: AudioContext = new AC()

        const meters: Meter[] = []
        const rebuild = () => {
            for (const m of meters) {
                try { m.src.disconnect() } catch { }
                try { m.analyser.disconnect() } catch { }
            }
            meters.length = 0
            if (!room) return
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
                        avatar: (hash ? getFileUrl(hash, SessionEnv.myFileAccessToken) : undefined) || default_avatar,
                        analyser, src, buf: new Float32Array(analyser.fftSize),
                    })
                } catch { /* 单个分析器失败忽略 */ }
            }
        }
        rebuild()

        let smooth = 0
        let idle = false
        let lastVoiceAt = performance.now()
        let cur: { identity: string, avatar: string } | undefined
        let candidateId = ''
        let candidateSince = 0
        let lastSwitch = 0

        const tick = () => {
            if (!alive) return
            const now = performance.now()

            let best: Meter | undefined
            let bestLevel = GATE
            for (const m of meters) {
                m.analyser.getFloatTimeDomainData(m.buf as any)
                let sum = 0
                for (let i = 0; i < m.buf.length; i++) sum += m.buf[i] * m.buf[i]
                const lv = Math.min(1, Math.sqrt(sum / m.buf.length) * 3.2)
                if (lv > bestLevel) { bestLevel = lv; best = m }
            }

            const dt = TICK_MS / 1000
            const target = best ? Math.min(1, (bestLevel - GATE) / (1 - GATE)) : 0
            const tau = target > smooth ? ATTACK_TAU : RELEASE_TAU
            smooth += (target - smooth) * (1 - Math.exp(-dt / tau))
            if (smooth < 0.002) smooth = 0

            if (smooth > VOICE_LEVEL) {
                lastVoiceAt = now
                if (idle) idle = false
            } else if (!idle && now - lastVoiceAt > IDLE_DELAY_MS) {
                idle = true
            }

            if (best) {
                if (!cur) {
                    if (candidateId !== best.identity) { candidateId = best.identity; candidateSince = now }
                    else if (now - candidateSince >= SPEAKER_HOLD_MS) {
                        cur = { identity: best.identity, avatar: best.avatar }
                        lastSwitch = now
                    }
                } else if (best.identity !== cur.identity) {
                    if (candidateId !== best.identity) { candidateId = best.identity; candidateSince = now }
                    else if (now - candidateSince >= SPEAKER_HOLD_MS && now - lastSwitch >= SWITCH_MIN_MS) {
                        cur = { identity: best.identity, avatar: best.avatar }
                        lastSwitch = now
                        candidateId = ''
                    }
                } else {
                    candidateId = ''
                }
            } else {
                candidateId = ''
            }

            bridge.sendBallState({
                level: smooth,
                idle,
                speakerAvatar: cur?.avatar,
                chatAvatar,
            })
        }

        const timer = setInterval(tick, TICK_MS)

        return () => {
            alive = false
            clearInterval(timer)
            for (const m of meters) {
                try { m.src.disconnect() } catch { }
                try { m.analyser.disconnect() } catch { }
            }
            try { void ctx.close() } catch { }
        }
    }, [room, chatId, enabled, rev])
}
