import React from 'react'
import { LocalParticipant, Track, type Participant } from 'livekit-client'
import { AudioPublication, VideoPublication } from './VideoTrack.tsx'

export default function ParticipantTile({ participant, compact, onClick, actions, style }: {
    participant: Participant
    compact?: boolean
    onClick?: () => void
    actions?: React.ReactNode
    style?: React.CSSProperties
}) {
    const isLocal = participant instanceof LocalParticipant
    const screen = participant.getTrackPublication(Track.Source.ScreenShare)
    const camera = participant.getTrackPublication(Track.Source.Camera)
    const mic = participant.getTrackPublication(Track.Source.Microphone)

    const screenActive = !!screen?.track && !screen.isMuted
    const primary = screenActive ? screen : camera
    const name = participant.name || participant.identity
    const micMuted = !mic?.track || mic.isMuted
    const speaking = participant.isSpeaking && !micMuted

    return <div onClick={onClick} style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '10px',
        background: '#202020',
        border: speaking ? '2px solid rgb(var(--mdui-color-primary))' : '1px solid rgba(255,255,255,0.08)',
        minHeight: compact ? '84px' : '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : undefined,
        ...style,
    }}>
        {primary?.track
            ? <VideoPublication publication={primary} muted={isLocal} />
            : <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', padding: '8px' }}>
                {micMuted ? '(Muted) ' : ''}{name}
            </div>
        }

        {/* 远端音频播放 */}
        {!isLocal && <AudioPublication publication={mic} />}

        {actions && (
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '2px' }}>
                {actions}
            </div>
        )}

        <div style={{
            position: 'absolute',
            left: '6px',
            bottom: '6px',
            padding: '2px 8px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#fff',
            background: 'rgba(0,0,0,0.5)',
            maxWidth: '90%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        }}>
            {micMuted ? '(Muted) ' : ''}{name}{isLocal ? ' (我)' : ''}{screenActive ? ' · 共享屏幕' : ''}
        </div>
    </div>
}
