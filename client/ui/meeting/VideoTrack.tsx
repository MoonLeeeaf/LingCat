import React from 'react'
import type { TrackPublication } from 'livekit-client'

export function VideoPublication({ publication, muted, style, videoRef }: {
    publication?: TrackPublication
    muted?: boolean
    style?: React.CSSProperties
    videoRef?: React.RefObject<HTMLVideoElement | null>
}) {
    const innerRef = React.useRef<HTMLVideoElement>(null)
    const ref = videoRef ?? innerRef

    React.useEffect(() => {
        const el = ref.current
        const track = publication?.track
        if (!el || !track) return
        track.attach(el)
        el.muted = !!muted
        return () => { track.detach(el) }
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
        el.muted = !!muted
        return () => { track.detach(el) }
    }, [publication?.track, publication?.isMuted])

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