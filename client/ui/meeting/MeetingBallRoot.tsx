import React from 'react'
import ReactDOM from 'react-dom/client'
import default_avatar from '../../default_avatar.png'

const SIZE = 56
const RING_INSET = 6
const RING_MAX_SCALE = 1.10
const OUTER_OPACITY = 0.625
const GLOW_SPREAD = 12.5
const GLOW_ALPHA = 0.44
const INNER_LIFT = 0.88
const IDLE_FADE_MS = 320
const PREV_FADE_MS = 220

const REDUCED_MOTION = typeof window !== 'undefined'
    && !!window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface BallState {
    level: number
    idle: boolean
    speakerAvatar?: string
    chatAvatar?: string
}

export function mountMeetingBall(el: HTMLElement, chatId: string) {
    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'
    document.body.style.margin = '0'
    document.body.style.overflow = 'hidden'
    el.style.background = 'transparent'
    el.style.display = 'flex'
    el.style.alignItems = 'center'
    el.style.justifyContent = 'center'

    ReactDOM.createRoot(el).render(React.createElement(MeetingBallRoot, { chatId }))
}

function MeetingBallRoot({ chatId }: { chatId: string }) {
    const bridge = window.lingcatDesktop
    const [title, setTitle] = React.useState('会议')
    const [cur, setCur] = React.useState<string | undefined>(undefined)
    const [prev, setPrev] = React.useState<string | undefined>(undefined)
    const [idle, setIdle] = React.useState(true)
    const [chatAvatar, setChatAvatar] = React.useState<string | undefined>(undefined)

    const outerRingRef = React.useRef<HTMLDivElement>(null)
    const innerRingRef = React.useRef<HTMLDivElement>(null)
    const curRef = React.useRef<string | undefined>(undefined)
    const prevTimer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
    const drag = React.useRef<{ sx: number, sy: number, moved: boolean } | null>(null)

    React.useEffect(() => {
        bridge?.getBallHandoff()
            .then((h) => { if (h?.title) setTitle(h.title) })
            .catch(() => { })
    }, [bridge, chatId])

    React.useEffect(() => {
        bridge?.onBallState((raw) => {
            const s = raw as BallState
            const level = Math.max(0, Math.min(1, Number(s?.level) || 0))

            if (s?.chatAvatar) {
                setChatAvatar((last) => (last === s.chatAvatar ? last : s.chatAvatar))
            }

            const av = s?.speakerAvatar
            if (av && av !== curRef.current) {
                const old = curRef.current
                curRef.current = av
                setCur(av)
                if (old) {
                    setPrev(old)
                    if (prevTimer.current) clearTimeout(prevTimer.current)
                    prevTimer.current = setTimeout(() => setPrev(undefined), PREV_FADE_MS)
                }
            }

            setIdle(!!s?.idle && level <= 0.01)

            const inner = innerRingRef.current
            const outer = outerRingRef.current
            if (inner) inner.style.opacity = String(Math.min(1, 0.12 + level * INNER_LIFT))
            if (outer) {
                outer.style.transform = `scale(${REDUCED_MOTION ? 1 : 1 + level * (RING_MAX_SCALE - 1)})`
                outer.style.opacity = String(level * OUTER_OPACITY)
                outer.style.boxShadow = `0 0 ${8 + level * GLOW_SPREAD}px rgba(74,222,128,${(level * GLOW_ALPHA).toFixed(3)})`
            }
        })
        return () => {
            if (prevTimer.current) clearTimeout(prevTimer.current)
        }
    }, [bridge])

    const onPointerDown = (e: React.PointerEvent) => {
        if (e.button != null && e.button !== 0) return
        if (!bridge) return
        drag.current = { sx: e.screenX, sy: e.screenY, moved: false }
        try { (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId) } catch { /* ignore */ }
        bridge.ballDragStart()
    }

    const onPointerMove = (e: React.PointerEvent) => {
        const d = drag.current
        if (!d) return
        if (Math.abs(e.screenX - d.sx) + Math.abs(e.screenY - d.sy) > 3) d.moved = true
    }

    const endPointer = (e: React.PointerEvent, cancelled: boolean) => {
        const d = drag.current
        drag.current = null
        try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { /* ignore */ }
        bridge?.ballDragEnd()
        if (!cancelled && d && !d.moved) bridge?.restoreMeeting()
    }

    return <>
        <style>{`
            @keyframes lcBallFadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes lcWave { 0%,100% { transform: scaleY(.35) } 50% { transform: scaleY(1) } }
            .lc-ball { position: relative; width: ${SIZE}px; height: ${SIZE}px; cursor: grab; touch-action: none; user-select: none; -webkit-user-select: none; outline: none; }
            .lc-ball:active { cursor: grabbing; }
            .lc-ball__outer {
                position: absolute; inset: -${RING_INSET}px; border-radius: 50%;
                border: 1.5px solid rgba(74,222,128,0.55); opacity: 0; pointer-events: none;
                transition: opacity 90ms linear; will-change: transform, opacity, box-shadow;
            }
            .lc-ball__inner {
                position: absolute; inset: -1px; border-radius: 50%;
                border: 2px solid #4ade80; opacity: 0.12; pointer-events: none;
                transition: opacity 90ms linear;
            }
            .lc-ball__avatar {
                position: absolute; inset: 0; border-radius: 50%; overflow: hidden;
                border: 1px solid rgba(255,255,255,0.14); background: #202020;
                box-shadow: 0 4px 16px rgba(0,0,0,0.35);
            }
            .lc-ball__speaker { position: absolute; inset: 0; pointer-events: none; }
            .lc-ball__speaker img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
            .lc-ball__idle {
                position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                gap: 3px; pointer-events: none;
                background: linear-gradient(180deg, #1b242a 0%, #151c21 100%);
            }
            .lc-ball__idle span {
                display: block; width: 3px; height: 24px; border-radius: 2px;
                background: #2dd4bf; opacity: 0.9; transform-origin: center; transform: scaleY(0.35);
                will-change: transform;
            }
            .lc-ball__chat {
                position: absolute; right: -2px; bottom: -2px; width: 22px; height: 22px; border-radius: 50%;
                overflow: hidden; background: #22c55e; border: 2px solid #22c55e;
                box-shadow: 0 2px 6px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center;
                pointer-events: none;
            }
            .lc-ball__chat img { width: 100%; height: 100%; object-fit: cover; }
            .lc-ball__chat mdui-icon { font-size: 13px; color: #fff; }
        `}</style>

        <div
            className="lc-ball"
            title={title}
            role="button"
            aria-label="回到会议"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => endPointer(e, false)}
            onPointerCancel={(e) => endPointer(e, true)}
        >
            <div className="lc-ball__outer" ref={outerRingRef} />
            <div className="lc-ball__inner" ref={innerRingRef} />

            <div className="lc-ball__avatar">
                <div className="lc-ball__speaker" style={{ opacity: idle ? 0 : 1, transition: `opacity ${IDLE_FADE_MS}ms ease` }}>
                    {prev && <img src={prev} alt="" draggable={false} />}
                    <img
                        key={cur || 'default'}
                        src={cur || default_avatar}
                        alt=""
                        draggable={false}
                        onError={(e) => {
                            const el = e.currentTarget
                            if (el.dataset.fallback) return
                            el.dataset.fallback = '1'
                            el.src = default_avatar
                        }}
                        style={{ animation: REDUCED_MOTION ? undefined : 'lcBallFadeIn 180ms ease' }}
                    />
                </div>

                <div className="lc-ball__idle" style={{ opacity: idle ? 1 : 0, transition: `opacity ${IDLE_FADE_MS}ms ease` }}>
                    {[
                        { d: '2.2s', delay: '-0.2s' },
                        { d: '2.7s', delay: '-1.1s' },
                        { d: '2.0s', delay: '-0.6s' },
                        { d: '2.5s', delay: '-1.6s' },
                        { d: '2.3s', delay: '-0.9s' },
                    ].map((b, i) => (
                        <span key={i} style={{
                            animation: (idle && !REDUCED_MOTION) ? `lcWave ${b.d} ease-in-out ${b.delay} infinite` : undefined,
                        }} />
                    ))}
                </div>
            </div>

            <div className="lc-ball__chat">
                {chatAvatar
                    ? <img
                        src={chatAvatar}
                        alt=""
                        draggable={false}
                        onError={(e) => { const el = e.currentTarget; if (!el.dataset.fallback) { el.dataset.fallback = '1'; el.style.display = 'none' } }}
                    />
                    : <mdui-icon name="forum" />}
            </div>
        </div>
    </>
}
