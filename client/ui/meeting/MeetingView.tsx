import React from 'react'
import { dialog } from 'mdui'
import { LocalParticipant, Track, type Participant } from 'livekit-client'
import ParticipantTile from './ParticipantTile.tsx'
import { VideoPublication } from './VideoTrack.tsx'
import { MediaStatsOverlay } from './MediaStats.tsx'
import { useMeetingStore } from './MeetingManager.ts'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'
import SessionEnv from '../../SessionEnv.ts'
import { isPipSupported, togglePip, usePipActive } from '../../lib/pip.ts'

// ============================================================
//                      工具函数
// ============================================================

function hasScreenShare(p: Participant) {
    const s = p.getTrackPublication(Track.Source.ScreenShare)
    return !!s?.track && !s.isMuted
}
function screenPub(p: Participant) {
    return p.getTrackPublication(Track.Source.ScreenShare)
}
function cameraActive(p: Participant) {
    const c = p.getTrackPublication(Track.Source.Camera)
    return !!c?.track && !c.isMuted
}
function cameraPub(p: Participant) {
    return p.getTrackPublication(Track.Source.Camera)
}

type TileSource = 'screen' | 'camera' | 'auto'
interface TileSpec { key: string, participant: Participant, source: TileSource }

// ============================================================
//                      主组件
// ============================================================

export interface MeetingViewProps {
    onClose: () => void
    isMobile?: boolean
    /** 顶栏指针事件（桌面端拖动用） */
    headerPointer?: {
        onPointerDown: (e: React.PointerEvent) => void
        onPointerMove: (e: React.PointerEvent) => void
        onPointerUp: (e: React.PointerEvent) => void
    }
    /** 顶栏右侧额外按钮（放在关闭按钮之前） */
    headerExtra?: React.ReactNode
}

export function MeetingView({
    onClose,
    isMobile = false,
    headerPointer,
    headerExtra,
}: MeetingViewProps) {
    // ============================================================
    //  订阅 store
    // ============================================================
    const rev = useMeetingStore(s => s.rev)
    const phase = useMeetingStore(s => s.phase)
    const error = useMeetingStore(s => s.error)
    const chatTitle = useMeetingStore(s => s.chatTitle)
    const roomName = useMeetingStore(s => s.roomName)
    const isMicOn = useMeetingStore(s => s.isMicOn)
    const isCameraOn = useMeetingStore(s => s.isCameraOn)
    const isSharingScreen = useMeetingStore(s => s.isSharingScreen)
    const isSharingAudio = useMeetingStore(s => s.isSharingAudio)
    const audioBlocked = useMeetingStore(s => s.audioBlocked)
    const noiseSuppression = useMeetingStore(s => s.noiseSuppression)
    const audioInputs = useMeetingStore(s => s.audioInputs)
    const activeAudioInput = useMeetingStore(s => s.activeAudioInput)
    const settings = useMeetingStore(s => s.settings)
    const bubbles = useMeetingStore(s => s.bubbles)
    const focusedIdentity = useMeetingStore(s => s.focusedIdentity)
    const focusedSource = useMeetingStore(s => s.focusedSource)
    const starterUserId = useMeetingStore(s => s.starterUserId)
    const iAmChatAdmin = useMeetingStore(s => s.iAmChatAdmin)
    const myChatAdminRole = useMeetingStore(s => s.myChatAdminRole)
    const myChatAdminPermissions = useMeetingStore(s => s.myChatAdminPermissions)

    // actions
    const toggleMic = useMeetingStore(s => s.toggleMic)
    const toggleCamera = useMeetingStore(s => s.toggleCamera)
    const toggleScreenShare = useMeetingStore(s => s.toggleScreenShare)
    const stopScreenShare = useMeetingStore(s => s.stopScreenShare)
    const resumeAudio = useMeetingStore(s => s.resumeAudio)
    const setNoiseSuppression = useMeetingStore(s => s.setNoiseSuppression)
    const setAudioInput = useMeetingStore(s => s.setAudioInput)
    const setMeetingSetting = useMeetingStore(s => s.setMeetingSetting)
    const setFocused = useMeetingStore(s => s.setFocused)
    const endMeeting = useMeetingStore(s => s.endMeeting)
    const leave = useMeetingStore(s => s.leave)

    // 读 room（不订阅）
    const room = useMeetingStore.getState().room
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const participants = React.useMemo(
        () => room ? [room.localParticipant, ...Array.from(room.remoteParticipants.values())] : [],
        [room, rev],
    )

    // ============================================================
    //  结束会议权限
    // ============================================================
    const canEnd = React.useMemo(() => {
        if (!starterUserId || starterUserId === SessionEnv.myUserId) return true
        if (!iAmChatAdmin) return false
        if (myChatAdminRole === 'owner') return true
        try {
            const p = JSON.parse(myChatAdminPermissions || '{}')
            return p.end_meeting === true
        } catch {
            return false
        }
    }, [starterUserId, iAmChatAdmin, myChatAdminRole, myChatAdminPermissions])

    // ============================================================
    //  焦点
    // ============================================================
    const focusedParticipant = participants.find(p => p.identity === focusedIdentity)
    const focusedPub = focusedParticipant
        ? (focusedSource === 'camera'
            ? (cameraActive(focusedParticipant) ? cameraPub(focusedParticipant) : undefined)
            : (hasScreenShare(focusedParticipant) ? screenPub(focusedParticipant) : undefined))
        : undefined
    const focused = focusedPub ? focusedParticipant : undefined

    const focusRef = React.useRef<HTMLDivElement>(null)
    const focusVideoRef = React.useRef<HTMLVideoElement>(null)
    const focusPip = usePipActive(focusVideoRef, focusedPub?.track?.sid)
    const [isFullscreen, setIsFullscreen] = React.useState(false)

    React.useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', onChange)
        onChange()
        return () => document.removeEventListener('fullscreenchange', onChange)
    }, [])

    // ============================================================
    //  Tiles
    // ============================================================
    const tiles: TileSpec[] = []
    for (const p of participants) {
        const scr = hasScreenShare(p)
        const cam = cameraActive(p)
        if (scr) tiles.push({ key: p.identity + ':screen', participant: p, source: 'screen' })
        if (cam) tiles.push({ key: p.identity + ':camera', participant: p, source: 'camera' })
        if (!scr && !cam) tiles.push({ key: p.identity, participant: p, source: 'auto' })
    }

    // ============================================================
    //  网格列数
    // ============================================================
    const bodyRef = React.useRef<HTMLDivElement>(null)
    const [gridCols, setGridCols] = React.useState<number | undefined>(undefined)

    React.useEffect(() => {
        const el = bodyRef.current
        if (!el) return
        const gap = 6
        const compute = () => {
            const n = tiles.length
            const W = el.clientWidth - 16
            const H = el.clientHeight - 16
            if (!n || W <= 0 || H <= 0) { setGridCols(undefined); return }
            let cols = n
            for (let c = 1; c <= n; c++) {
                const tileW = (W - gap * (c - 1)) / c
                if (tileW <= 0) continue
                const tileH = tileW * 9 / 16
                const rows = Math.ceil(n / c)
                if (rows * tileH + gap * (rows - 1) <= H) { cols = c; break }
            }
            setGridCols(cols)
        }
        compute()
        const ro = new ResizeObserver(compute)
        ro.observe(el)
        return () => ro.disconnect()
    }, [tiles.length, focusedIdentity])

    // ============================================================
    //  控制
    // ============================================================
    const onEnd = async () => {
        try { await endMeeting() } catch (e) { tipError(e, '结束会议失败') }
    }
    const onToggleScreenShare = async () => {
        try {
            if (isSharingScreen) {
                await stopScreenShare()
                return
            }
            await toggleScreenShare()
            const nowSharing = useMeetingStore.getState().isSharingScreen
            const nowSharingAudio = useMeetingStore.getState().isSharingAudio
            if (nowSharing && !nowSharingAudio) {
                showSnackbar({ message: '未能分享系统声音: 当前浏览器/系统不支持, 已仅共享屏幕' })
            }
        } catch (e) {
            tipError(e, '屏幕共享失败')
        }
    }
    const maximize = (id: string, source: 'screen' | 'camera') => setFocused(id, source)
    const maximizeAndFullscreen = (id: string, source: 'screen' | 'camera') => {
        setFocused(id, source)
        // 等 DOM 更新后再全屏
        requestAnimationFrame(() => {
            focusRef.current?.requestFullscreen?.().catch(() => { })
        })
    }

    const wasActiveRef = React.useRef(false)
    React.useEffect(() => {
        const isActive = phase !== 'idle' || !!room
        if (wasActiveRef.current && !isActive) {
            onClose()
        }
        wasActiveRef.current = isActive
    }, [phase, room, onClose])

    // ============================================================
    //  设置对话框
    // ============================================================
    const settingsRef = React.useRef<any>(null)

    // ============================================================
    //  渲染
    // ============================================================
    const body = (
        <div
            ref={bodyRef}
            style={{
                flex: 1,
                overflow: 'auto',
                padding: '8px',
                minHeight: 0,
            }}>
            {phase === 'error' && (
                <div style={{ textAlign: 'center', marginTop: '20%' }}>
                    <div style={{ fontSize: '13px', marginBottom: '8px' }}>会议出错: {error}</div>
                    <mdui-button onClick={() => leave()}>关闭</mdui-button>
                </div>
            )}
            {phase === 'connecting' && !room && (
                <div style={{ textAlign: 'center', marginTop: '20%' }}>
                    <mdui-circular-progress />
                    <div style={{ marginTop: '8px', opacity: 0.7, fontSize: '12px' }}>正在连接会议...</div>
                </div>
            )}
            {!!room && (focused ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '6px' }}>
                    <div ref={focusRef} style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                        <VideoPublication
                            publication={focusedPub}
                            muted={focused instanceof LocalParticipant}
                            videoRef={focusVideoRef}
                        />
                        {settings.showMediaStats && focusedPub && (
                            <MediaStatsOverlay publication={focusedPub} videoRef={focusVideoRef} />
                        )}
                        <div style={{
                            position: 'absolute', left: '8px', bottom: '8px',
                            padding: '2px 8px', borderRadius: '8px', fontSize: '12px',
                            background: 'rgba(0,0,0,0.5)', color: '#fff',
                        }}>
                            {focused.name || focused.identity} · {focusedSource === 'camera' ? '摄像头' : '共享屏幕'}
                        </div>
                        <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '2px', zIndex: 2 }}>
                            {focusedPub?.track && !(focused instanceof LocalParticipant) && isPipSupported() && (
                                <mdui-button-icon
                                    title={focusPip ? '退出悬浮窗' : '悬浮播放'}
                                    icon={focusPip ? 'picture_in_picture' : 'picture_in_picture_alt'}
                                    onClick={() => {
                                        void togglePip(focusVideoRef.current).catch(() => showSnackbar({ message: '悬浮播放失败' }))
                                    }}
                                />
                            )}
                            <mdui-button-icon
                                title={isFullscreen ? '退出全屏' : '全屏'}
                                icon={isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                                onClick={() => {
                                    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => { })
                                    else focusRef.current?.requestFullscreen?.().catch(() => { })
                                }}
                            />
                            <mdui-button-icon
                                title="退出最大化"
                                icon="close_fullscreen"
                                onClick={() => {
                                    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => { })
                                    setFocused(undefined)
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: '0 0 auto' }}>
                        {tiles.map(t => (
                            <div key={t.key} style={{ flex: '0 0 130px' }}>
                                <ParticipantTile
                                    compact
                                    participant={t.participant}
                                    prefer={t.source}
                                    bubble={settings.showBubble ? bubbles[t.participant.identity] : undefined}
                                    onClick={() => {
                                        if (t.source === 'auto') return
                                        if (t.participant === focused && t.source === focusedSource) return
                                        maximize(t.participant.identity, t.source)
                                    }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: gridCols
                        ? `repeat(${gridCols}, 1fr)`
                        : `repeat(auto-fit, minmax(${isMobile ? 130 : 240}px, 1fr))`,
                    gap: '6px',
                    alignContent: 'start',
                }}>
                    {tiles.map(t => {
                        const src = t.source
                        return (
                            <ParticipantTile
                                key={t.key}
                                participant={t.participant}
                                prefer={src}
                                bubble={settings.showBubble ? bubbles[t.participant.identity] : undefined}
                                onClick={() => { if (src !== 'auto') maximize(t.participant.identity, src) }}
                                actions={src !== 'auto' ? <>
                                    <mdui-button-icon
                                        title={src === 'camera' ? '最大化摄像头' : '最大化共享'}
                                        icon="zoom_out_map"
                                        onClick={() => maximize(t.participant.identity, src)}
                                    />
                                    <mdui-button-icon
                                        title="全屏"
                                        icon="fullscreen"
                                        onClick={() => maximizeAndFullscreen(t.participant.identity, src)}
                                    />
                                </> : undefined}
                            />
                        )
                    })}
                </div>
            ))}
        </div>
    )

    const controls = (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            borderTop: '1px solid rgb(var(--mdui-color-outline-variant))',
            gap: '6px',
            flexWrap: 'wrap',
        }}>
            <div style={{ flex: 1 }} />
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                flexWrap: 'wrap',
            }}>
                {audioBlocked && (
                    <mdui-tooltip content='恢复音频'>
                        <mdui-button-icon icon="play_arrow" variant="tonal" onClick={() => resumeAudio()} />
                    </mdui-tooltip>
                )}

                <mdui-dropdown trigger='hover'>
                    <mdui-button-icon
                        slot="trigger"
                        icon={isMicOn ? 'mic' : 'mic_off'}
                        onClick={() => toggleMic().catch(e => tipError(e, '切换麦克风失败'))}
                    />
                    <mdui-menu>
                        <mdui-menu-item
                            icon={noiseSuppression ? 'check' : undefined}
                            onClick={() => setNoiseSuppression(!noiseSuppression).catch(e => tipError(e, '切换降噪失败'))}
                        >
                            麦克风降噪
                        </mdui-menu-item>
                        {audioInputs.length > 0 && <mdui-divider />}
                        {audioInputs.map(d => (
                            <mdui-menu-item
                                key={d.deviceId}
                                icon={d.deviceId === activeAudioInput ? 'check' : undefined}
                                onClick={() => setAudioInput(d.deviceId).catch(e => tipError(e, '切换麦克风失败'))}
                            >
                                {d.label}
                            </mdui-menu-item>
                        ))}
                    </mdui-menu>
                </mdui-dropdown>

                {settings.showCameraButton && (
                    <mdui-tooltip content={isCameraOn ? '关闭摄像头' : '开启摄像头'}>
                        <mdui-button-icon
                            icon={isCameraOn ? 'videocam' : 'videocam_off'}
                            onClick={() => toggleCamera().catch(e => tipError(e, '切换摄像头失败'))}
                        />
                    </mdui-tooltip>
                )}

                <mdui-tooltip content={isSharingScreen ? '停止共享' : '共享屏幕'}>
                    <mdui-button-icon
                        icon={isSharingScreen ? 'screen_share' : 'stop_screen_share'}
                        onClick={onToggleScreenShare}
                    />
                </mdui-tooltip>
                {isSharingScreen && (
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>
                        {isSharingAudio ? '含电脑声音' : '仅屏幕'}
                    </span>
                )}

                {canEnd && (
                    <mdui-button icon="call_end" variant="tonal" onClick={onEnd}>
                        结束会议
                    </mdui-button>
                )}

                <mdui-button
                    icon="call_end"
                    variant="tonal"
                    onClick={() => leave()}
                >
                    挂断
                </mdui-button>
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <mdui-tooltip content="会议设置">
                    <mdui-button-icon
                        icon="settings"
                        onClick={() => { if (settingsRef.current) settingsRef.current.open = true }}
                    />
                </mdui-tooltip>
            </div>
        </div>
    )

    const editMeetingTitle = () => {
        const dlg = dialog({
            headline: '修改会议标题',
            body: '<div style="padding-top: 12px"><mdui-text-field id="meeting-title" label="会议标题" variant="outlined" maxlength="64"></mdui-text-field></div>',
            closeOnEsc: true,
            closeOnOverlayClick: true,
            actions: [
                { text: '取消', onClick: () => true },
                {
                    text: '保存',
                    onClick: async () => {
                        const input = dlg.querySelector('#meeting-title') as any
                        const title = String(input?.value ?? '').trim()
                        dlg.open = false
                        try {
                            await useMeetingStore.getState().updateMeetingTitle(title)
                        } catch (e) {
                            tipError(e, '修改会议标题失败')
                        }
                    },
                },
            ],
        })
        setTimeout(() => {
            const input = dlg.querySelector('#meeting-title') as any
            if (input) {
                input.value = chatTitle ?? ''
                input.focus?.()
            }
        }, 10)
    }

    const settingsDialog = (
        <mdui-dialog ref={settingsRef} close-on-overlay-click close-on-esc headline="会议设置">
            <mdui-list>
                <mdui-list-item icon="edit" rounded onClick={editMeetingTitle}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                        <span style={{ flex: 1 }}>会议标题</span>
                        <span style={{
                            opacity: 0.6,
                            maxWidth: '50%',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>{chatTitle || '未设置'}</span>
                    </div>
                </mdui-list-item>
                {([
                    { key: 'showBubble', label: '消息气泡' },
                    { key: 'showLocalMute', label: '本地静音按钮' },
                    { key: 'showCameraButton', label: '摄像头按钮' },
                    { key: 'autoMuteStreams', label: '直播流加入时自动本地静音' },
                    { key: 'showMediaStats', label: '显示视频统计信息 (调试)' },
                    { key: 'joinSound', label: '其他人入会提示音' },
                ] as const).map(({ key, label }) => (
                    <mdui-list-item
                        key={key}
                        rounded
                        onClick={() => setMeetingSetting(key, !settings[key])}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                            <span style={{ flex: 1 }}>{label}</span>
                            <mdui-switch
                                checked={settings[key]}
                                checked-icon=""
                                onClick={(e: any) => e.stopPropagation()}
                                onChange={(v: any) => setMeetingSetting(key, v.target.checked)}
                            />
                        </div>
                    </mdui-list-item>
                ))}
            </mdui-list>
            <mdui-button
                slot="action"
                variant="text"
                onClick={() => { if (settingsRef.current) settingsRef.current.open = false }}
            >
                关闭
            </mdui-button>
        </mdui-dialog>
    )

    return (
        <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            color: 'rgb(var(--mdui-color-on-surface))',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* 标题栏 —— 简单版，只显示标题 + 关闭按钮。
                桌面端的拖动/最小化由 DesktopMeetingWindow 提供；
                移动端顶栏由 MobileMeetingDialog 提供。 */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 8px 6px 12px',
                    borderBottom: '1px solid rgb(var(--mdui-color-outline-variant))',
                    cursor: headerPointer ? 'move' : 'default',
                    userSelect: headerPointer ? 'none' : undefined,
                    touchAction: headerPointer ? 'none' : undefined,
                }}
                onPointerDown={headerPointer?.onPointerDown}
                onPointerMove={headerPointer?.onPointerMove}
                onPointerUp={headerPointer?.onPointerUp}>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontWeight: 500, fontSize: '13px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                        {chatTitle || '会议'}
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.6 }}>
                        {roomName || ''} · {participants.length} 人{phase === 'connecting' ? ' · 连接中...' : ''}
                    </div>
                </div>
                {headerExtra}
                <mdui-tooltip content="关闭窗口">
                    <mdui-button-icon icon="close" onClick={onClose} />
                </mdui-tooltip>
            </div>

            {body}
            {controls}
            {settingsDialog}

            {audioBlocked && !!room && (
                <div
                    onClick={() => resumeAudio()}
                    style={{
                        position: 'absolute', inset: 0, zIndex: 20,
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center', gap: '10px',
                        background: 'rgba(0,0,0,0.6)', color: '#fff', cursor: 'pointer',
                    }}
                >
                    <mdui-icon name="volume_off" style={{ fontSize: '40px' }} />
                    <div style={{ fontSize: '14px' }}>浏览器拦截了声音, 点击任意位置开启</div>
                </div>
            )}

            {/* 全局动画 */}
            <style>{`
                @keyframes lingcat-bubble {
                    0%   { opacity: 0; transform: translateY(6px) scale(0.9); }
                    8%   { opacity: 1; transform: translateY(0)   scale(1); }
                    85%  { opacity: 1; transform: translateY(0)   scale(1); }
                    100% { opacity: 0; transform: translateY(-4px) scale(0.96); }
                }
            `}</style>
        </div>
    )
}

export default MeetingView