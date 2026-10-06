import React from 'react'
import type { TrackPublication } from 'livekit-client'

export function VideoPublication({ publication, muted, style }: {
    publication?: TrackPublication
    muted?: boolean
    style?: React.CSSProperties
}) {
    const ref = React.useRef<HTMLVideoElement>(null)

    React.useEffect(() => {
        const el = ref.current
        const track = publication?.track
        if (!el || !track) return
        track.attach(el)
        // 覆盖 livekit attach 对 muted 的重置
        el.muted = !!muted
        return () => {
            track.detach(el)
        }
    }, [publication?.track, publication?.isMuted])

    React.useEffect(() => {
        if (ref.current) ref.current.muted = !!muted
    }, [muted])

    if (!publication?.track) return null
    return <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', ...style }}
    />
}

export function AudioPublication({ publication, muted }: { publication?: TrackPublication, muted?: boolean }) {
    const ref = React.useRef<HTMLAudioElement>(null)

    React.useEffect(() => {
        const el = ref.current
        const track = publication?.track
        if (!el || !track) return
        track.attach(el)
        // livekit 的 attach 会把 el.muted 置为 false (有音轨时), 导致本地静音失效;
        // 这里在 attach 之后按当前静音状态覆盖回来
        el.muted = !!muted
        return () => {
            track.detach(el)
        }
    }, [publication?.track, publication?.isMuted])

    // 静音状态变化时立即同步 (元素被复用/重建时同样生效)
    React.useEffect(() => {
        if (ref.current) ref.current.muted = !!muted
    }, [muted])

    return <audio
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        style={{
            position: 'absolute',
            width: 1,
            height: 1,
            opacity: 0,
            pointerEvents: 'none',
            left: -9999,
        }}
    />
}
