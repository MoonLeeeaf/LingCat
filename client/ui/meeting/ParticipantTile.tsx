import React from 'react'
import { LocalParticipant, Track, type Participant } from 'livekit-client'
import { AudioPublication, VideoPublication } from './VideoTrack.tsx'
import { AudioLevelBar } from './AudioLevel.tsx'
import { MediaStatsOverlay } from './MediaStats.tsx'
import SessionEnv from '../../SessionEnv.ts'
import getFileUrl from '../../lib/getFileUrl.ts'
import default_avatar from '../../default_avatar.png'
import { useMeetingStore } from './MeetingManager.ts'

export interface ParticipantTileProps {
    participant: Participant
    compact?: boolean
    onClick?: () => void
    actions?: React.ReactNode
    style?: React.CSSProperties
    /** 显示哪一路: auto 屏幕优先, 或强制 screen / camera */
    prefer?: 'auto' | 'screen' | 'camera'
    /** 群消息气泡 (文本 + 时间戳, 短暂显示) */
    bubble?: { text: string, at: number }
}

export default function ParticipantTile({
    participant,
    compact,
    onClick,
    actions,
    style,
    prefer = 'auto',
    bubble,
}: ParticipantTileProps) {
    const isLocal = participant instanceof LocalParticipant

    // ★ 订阅式读取
    const showLocalMute = useMeetingStore(s => s.settings.showLocalMute)
    const showMediaStats = useMeetingStore(s => s.settings.showMediaStats)
    const toggleLocalMute = useMeetingStore(s => s.toggleLocalMute)
    const locallyMuted = useMeetingStore(s => !isLocal && !!s.locallyMuted[participant.identity])

    const screen = participant.getTrackPublication(Track.Source.ScreenShare)
    const camera = participant.getTrackPublication(Track.Source.Camera)
    const mic = participant.getTrackPublication(Track.Source.Microphone)
    const screenAudio = participant.getTrackPublication(Track.Source.ScreenShareAudio)
    const screenAudioActive = !!screenAudio?.track

    const screenActive = !!screen?.track && !screen.isMuted
    const cameraActive = !!camera?.track && !camera.isMuted
    const primary = prefer === 'camera'
        ? (cameraActive ? camera : undefined)
        : prefer === 'screen'
            ? (screenActive ? screen : undefined)
            : (screenActive ? screen : (cameraActive ? camera : undefined))
    const showingScreen = !!primary && !!screen && primary === screen

    let meta: any = {}
    try { meta = JSON.parse(participant.metadata || '{}') } catch { }

    const name = (meta?.remark as string) || participant.name || participant.identity
    const micMuted = !mic?.track || mic.isMuted
    const speaking = participant.isSpeaking && !micMuted

    const [hover, setHover] = React.useState(false)
    const videoRef = React.useRef<HTMLVideoElement>(null)

    const avatarHash = meta?.avatar_file_hash as string | null | undefined
    const avatarUrl = avatarHash
        ? getFileUrl(avatarHash, SessionEnv.myFileAccessToken)
        : default_avatar

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '10px',
                background: '#202020',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: speaking ? 'inset 0 0 0 2px rgb(var(--mdui-color-primary))' : undefined,
                aspectRatio: primary?.track ? '16 / 9' : undefined,
                minHeight: primary?.track ? undefined : (compact ? '84px' : '160px'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: onClick ? 'pointer' : undefined,
                ...style,
            }}
        >
            {primary?.track
                ? <VideoPublication key={primary.track.sid} publication={primary} muted={isLocal} videoRef={videoRef} />
                : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: compact ? '4px' : '8px', padding: '8px' }}>
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
                )
            }

            {!isLocal && <AudioPublication publication={mic} muted={locallyMuted} />}
            {!isLocal && <AudioPublication publication={screenAudio} muted={locallyMuted} />}

            <AudioLevelBar participant={participant} muted={micMuted} />

            {bubble && (
                <div key={bubble.at} style={{
                    position: 'absolute',
                    left: '6px',
                    bottom: compact ? '26px' : '30px',
                    width: 'fit-content',
                    maxWidth: 'calc(100% - 12px)',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    background: 'rgba(28,28,30,0.9)',
                    color: '#fff',
                    fontSize: compact ? '11px' : '13px',
                    lineHeight: 1.3,
                    boxShadow: '0 2px 10px rgba(0,0,0,.45)',
                    wordBreak: 'break-word',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    zIndex: 2,
                    pointerEvents: 'none',
                    animation: 'lingcat-bubble 6s ease-out both',
                }}>
                    {bubble.text}
                </div>
            )}

            {(!isLocal || actions) && (
                <div
                    onClick={(e) => e.stopPropagation()}
                    style={{ position: 'absolute', top: '5px', right: '5px', display: 'flex', gap: '2px', zIndex: 1 }}
                >
                    {showLocalMute && !isLocal && (hover || locallyMuted) && (
                        <mdui-tooltip content={locallyMuted ? '取消本地静音' : '本地静音(仅自己)'}>
                            <mdui-button-icon
                                icon={locallyMuted ? 'volume_off' : 'volume_up'}
                                onClick={() => toggleLocalMute(participant.identity)}
                            />
                        </mdui-tooltip>
                    )}
                    {actions}
                </div>
            )}

            {showMediaStats && !!primary?.track && (
                <MediaStatsOverlay publication={primary} videoRef={videoRef} compact={compact} />
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
    )
}