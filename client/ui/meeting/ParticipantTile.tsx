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
    const screenAudio = participant.getTrackPublication(Track.Source.ScreenShareAudio)
    const screenAudioActive = !!screenAudio?.track

    const screenActive = !!screen?.track && !screen.isMuted
    // 摄像头静音时视为关闭, 否则会渲染一个纯黑的 <video>
    const cameraActive = !!camera?.track && !camera.isMuted
    const primary = screenActive ? screen : (cameraActive ? camera : undefined)
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
            // key: 源变化 (屏幕<->摄像头) 时强制重建 <video>, 避免复用节点残留黑帧
            ? <VideoPublication key={primary.track.sid} publication={primary} muted={isLocal} />
            : <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', padding: '8px' }}>
                {micMuted ? '(Muted) ' : ''}{name}
            </div>
        }

        {/* 远端音频播放: 麦克风 + 电脑/系统声音 (本地不回放, 防回声) */}
        {!isLocal && <AudioPublication publication={mic} />}
        {!isLocal && <AudioPublication publication={screenAudio} />}

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
            {micMuted ? '(Muted) ' : ''}{name}{isLocal ? ' (我)' : ''}{screenActive ? ' · 共享屏幕' : ''}{screenAudioActive ? ' · 共享声音' : ''}
        </div>
    </div>
}
