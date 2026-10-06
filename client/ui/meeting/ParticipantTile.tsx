import React from 'react'
import { LocalParticipant, Track, type Participant } from 'livekit-client'
import { AudioPublication, VideoPublication } from './VideoTrack.tsx'
import { AudioLevelBar } from './AudioLevel.tsx'
import ClientManager from '../../ClientManager.ts'
import AppState from '../AppState.ts'
import default_avatar from '../../default_avatar.png'
import { MeetingManager } from './MeetingManager.ts'

export default function ParticipantTile({ participant, compact, onClick, actions, style, prefer = 'auto' }: {
    participant: Participant
    compact?: boolean
    onClick?: () => void
    actions?: React.ReactNode
    style?: React.CSSProperties
    /** 显示哪一路: auto 屏幕优先, 或强制 screen / camera */
    prefer?: 'auto' | 'screen' | 'camera'
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
    const primary = prefer === 'camera'
        ? (cameraActive ? camera : undefined)
        : prefer === 'screen'
            ? (screenActive ? screen : undefined)
            : (screenActive ? screen : (cameraActive ? camera : undefined))
    const showingScreen = !!primary && !!screen && primary === screen
    const name = participant.name || participant.identity
    const micMuted = !mic?.track || mic.isMuted
    const speaking = participant.isSpeaking && !micMuted

    const [hover, setHover] = React.useState(false)
    const locallyMuted = !isLocal && MeetingManager.isLocallyMuted(participant.identity)

    // 头像: 优先取 LiveKit token metadata 里的 avatar_file_hash
    let meta: any = {}
    try { meta = JSON.parse(participant.metadata || '{}') } catch { }
    const avatarHash = meta?.avatar_file_hash as string | null | undefined
    const avatarUrl = avatarHash
        ? ClientManager.client.getFileUrlByHashAndToken(avatarHash, AppState.fileAccessToken)
        : default_avatar

    return <div
        onClick={onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
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
            : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compact ? '4px' : '8px', padding: '8px' }}>
                <img
                    src={avatarUrl}
                    alt=""
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = default_avatar }}
                    style={{
                        width: compact ? '40px' : '64px',
                        height: compact ? '40px' : '64px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        background: 'rgba(255,255,255,0.08)',
                    }}
                />
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: compact ? '11px' : '13px' }}>
                    {micMuted ? '(Muted) ' : ''}{name}
                </div>
            </div>
        }

        {/* 远端音频播放: 麦克风 + 电脑/系统声音 (本地不回放, 防回声; muted 为本地静音) */}
        {!isLocal && <AudioPublication publication={mic} muted={locallyMuted} />}
        {!isLocal && <AudioPublication publication={screenAudio} muted={locallyMuted} />}

        {/* 实时音量条 (本地与其他人): 长度随音量变化, 绿/橙/红 */}
        <AudioLevelBar participant={participant} muted={micMuted} />

        {(!isLocal || actions) && (
            <div
                onClick={(e) => e.stopPropagation()}
                style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '2px', zIndex: 1 }}>
                {/* 本地静音: 悬停显示, 已静音时常驻 */}
                {!isLocal && (hover || locallyMuted) && (
                    <mdui-tooltip content={locallyMuted ? '取消本地静音' : '本地静音(仅自己)'}>
                        <mdui-button-icon
                            icon={locallyMuted ? 'volume_off' : 'volume_up'}
                            onClick={() => MeetingManager.toggleLocalMute(participant.identity)}
                        />
                    </mdui-tooltip>
                )}
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
            {micMuted ? '(Muted) ' : ''}{name}{isLocal ? ' (我)' : ''}{showingScreen ? ' · 共享屏幕' : ''}{screenAudioActive ? ' · 共享声音' : ''}
        </div>
    </div>
}
