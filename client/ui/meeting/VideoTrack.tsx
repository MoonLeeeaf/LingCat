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
        return () => {
            track.detach(el)
        }
    }, [publication?.track, publication?.isMuted])

    if (!publication?.track) return null
    return <video
        ref={ref}
        autoPlay
        playsInline
        muted={muted}
        style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000', ...style }}
    />
}

export function AudioPublication({ publication }: { publication?: TrackPublication }) {
    const ref = React.useRef<HTMLAudioElement>(null)

    React.useEffect(() => {
        const el = ref.current
        const track = publication?.track
        if (!el || !track) return
        track.attach(el)
        return () => {
            track.detach(el)
        }
    }, [publication?.track, publication?.isMuted])

    return <audio
        ref={ref}
        autoPlay
        playsInline
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
