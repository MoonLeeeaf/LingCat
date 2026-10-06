import React from 'react'
import { LocalParticipant, Track, type Participant } from 'livekit-client'
import AppState from '../AppState.ts'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'
import { MeetingManager, useMeeting } from './MeetingManager.ts'
import ParticipantTile from './ParticipantTile.tsx'
import { VideoPublication } from './VideoTrack.tsx'

type PanelSize = 'normal' | 'expanded' | 'minimized'

const SIZES = {
    normal: { w: 400, h: 320 },
    expanded: { w: 800, h: 580 },
} as const

const MIN_W = 295
const MIN_H = 200

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

export default function MeetingPanel({ mode }: { mode: 'floating' | 'docked' | 'window' }) {
    const m = useMeeting()

    const [size, setSize] = React.useState<PanelSize>('normal')
    const [isFullscreen, setIsFullscreen] = React.useState(false)
    const [customSize, setCustomSize] = React.useState<{ w: number, h: number } | undefined>(undefined)
    const [pos, setPos] = React.useState<{ x: number, y: number } | undefined>(undefined)

    const dragRef = React.useRef<{ dx: number, dy: number } | null>(null)
    const resizeRef = React.useRef<{ startX: number, startY: number, startW: number, startH: number } | null>(null)
    const focusRef = React.useRef<HTMLDivElement>(null)
    const settingsRef = React.useRef<any>(null)
    const pendingFullscreen = React.useRef(false)
    const beforeMinimizeRef = React.useRef<{ size: PanelSize, customSize?: { w: number, h: number } } | null>(null)

    const active = m.isActive()

    const isWindow = mode === 'window'

    React.useEffect(() => {
        if (mode !== 'floating' || pos != undefined) return
        setPos({
            x: Math.max(12, window.innerWidth - SIZES.normal.w - 20),
            y: Math.max(12, window.innerHeight - SIZES.normal.h - 20),
        })
    }, [mode, pos])

    // 跟踪浏览器全屏状态, 让按钮能正确切换 (所有模式)
    React.useEffect(() => {
        const onChange = () => setIsFullscreen(!!document.fullscreenElement)
        document.addEventListener('fullscreenchange', onChange)
        onChange()
        return () => document.removeEventListener('fullscreenchange', onChange)
    }, [])

    React.useEffect(() => {
        if (pendingFullscreen.current && focusRef.current) {
            pendingFullscreen.current = false
            focusRef.current.requestFullscreen?.().catch(() => { })
        }
    }, [m.focusedIdentity, m.focusedSource])

    const participants = m.room
        ? [m.room.localParticipant, ...Array.from(m.room.remoteParticipants.values())]
        : []

    const canEnd = !m.starterUserId || m.starterUserId == AppState.myId

    const focusedParticipant = participants.find((p) => p.identity === m.focusedIdentity)
    const focusedSource = m.focusedSource
    const focusedPub = focusedParticipant
        ? (focusedSource === 'camera'
            ? (cameraActive(focusedParticipant) ? cameraPub(focusedParticipant) : undefined)
            : (hasScreenShare(focusedParticipant) ? screenPub(focusedParticipant) : undefined))
        : undefined
    const focused = focusedPub ? focusedParticipant : undefined

    // 每人按可用的源拆成瓦片: 屏幕共享与摄像头各一块 (可同时展示)
    const tiles: TileSpec[] = []
    for (const p of participants) {
        const scr = hasScreenShare(p)
        const cam = cameraActive(p)
        if (scr) tiles.push({ key: p.identity + ':screen', participant: p, source: 'screen' })
        if (cam) tiles.push({ key: p.identity + ':camera', participant: p, source: 'camera' })
        if (!scr && !cam) tiles.push({ key: p.identity, participant: p, source: 'auto' })
    }

    // 按面板尺寸自动选列数: 让 16:9 瓦片在尽量少列(更大)的前提下铺满面板
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
    }, [tiles.length, isWindow, mode, m.focusedIdentity])

    if (!active) return null

    const dim = size === 'minimized'
        ? { w: 295, h: 0 }
        : (customSize ?? SIZES[size as Exclude<PanelSize, 'minimized'>])
    const isDocked = mode === 'docked'
    const floatingMinimized = mode === 'floating' && size === 'minimized'

    const setSizePreset = (s: PanelSize) => {
        setCustomSize(undefined)
        setSize(s)
    }
    const onToggleMinimize = () => {
        if (size === 'minimized') {
            const prev = beforeMinimizeRef.current
            if (prev) {
                setSize(prev.size)
                setCustomSize(prev.customSize)
            } else {
                setSize('normal')
                setCustomSize(undefined)
            }
        } else {
            beforeMinimizeRef.current = { size, customSize }
            setSize('minimized')
        }
    }

    const onPointerDown = (e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest('mdui-button-icon, mdui-button, button')) return
        const p = pos ?? { x: 0, y: 0 }
        dragRef.current = { dx: e.clientX - p.x, dy: e.clientY - p.y }
            ; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e: React.PointerEvent) => {
        if (!dragRef.current) return
        const x = Math.min(Math.max(0, e.clientX - dragRef.current.dx), window.innerWidth - dim.w)
        const y = Math.min(Math.max(0, e.clientY - dragRef.current.dy), window.innerHeight - 40)
        setPos({ x, y })
    }
    const onPointerUp = (e: React.PointerEvent) => {
        dragRef.current = null
        try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { }
    }

    const onResizePointerDown = (e: React.PointerEvent) => {
        e.stopPropagation()
        resizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startW: dim.w,
            startH: dim.h,
        }
            ; (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    }
    const onResizePointerMove = (e: React.PointerEvent) => {
        if (!resizeRef.current) return
        const { startX, startY, startW, startH } = resizeRef.current
        const maxW = window.innerWidth - (pos?.x ?? 0) - 12
        const maxH = window.innerHeight - (pos?.y ?? 0) - 12
        const w = Math.min(Math.max(MIN_W, startW + (e.clientX - startX)), maxW)
        const h = Math.min(Math.max(MIN_H, startH + (e.clientY - startY)), maxH)
        setCustomSize({ w, h })
    }
    const onResizePointerUp = (e: React.PointerEvent) => {
        resizeRef.current = null
        try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch { }
    }

    const onEnd = async () => {
        try { await MeetingManager.endMeeting() } catch (e) { tipError(e, '结束会议失败') }
    }
    const onToggleScreenShare = async () => {
        try {
            if (m.isSharingScreen) {
                await MeetingManager.stopScreenShare()
                return
            }
            const res = await MeetingManager.startScreenShare()
            if (res.audioUnsupported)
                showSnackbar({ message: '未能分享系统声音: 当前浏览器/系统不支持, 已仅共享屏幕' })
        } catch (e) {
            tipError(e, '屏幕共享失败')
        }
    }
    const maximize = (id: string, source: 'screen' | 'camera' = 'screen') => MeetingManager.setFocused(id, source)
    const maximizeAndFullscreen = (id: string, source: 'screen' | 'camera' = 'screen') => {
        pendingFullscreen.current = true
        MeetingManager.setFocused(id, source)
    }

    const body = (
        <div ref={bodyRef} style={{
            flex: 1,
            overflow: 'auto',
            padding: '8px',
            display: floatingMinimized ? 'none' : undefined,
            minHeight: 0,
        }}>
            {m.phase == 'error' && (
                <div style={{ textAlign: 'center', marginTop: '20%' }}>
                    <div style={{ fontSize: '13px', marginBottom: '8px' }}>会议出错: {m.error}</div>
                    <mdui-button onClick={() => MeetingManager.leave()}>关闭</mdui-button>
                </div>
            )}
            {m.phase == 'connecting' && !m.room && (
                <div style={{ textAlign: 'center', marginTop: '20%' }}>
                    <mdui-circular-progress />
                    <div style={{ marginTop: '8px', opacity: 0.7, fontSize: '12px' }}>正在连接会议...</div>
                </div>
            )}
            {!!m.room && (focused ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '6px' }}>
                    <div ref={focusRef} style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                        <VideoPublication publication={focusedPub} muted={focused instanceof LocalParticipant} />
                        <div style={{ position: 'absolute', left: '8px', bottom: '8px', padding: '2px 8px', borderRadius: '8px', fontSize: '12px', background: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                            {focused.name || focused.identity} · {focusedSource === 'camera' ? '摄像头' : '共享屏幕'}
                        </div>
                        <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '2px', zIndex: 2 }}>
                            <mdui-tooltip content={isFullscreen ? '退出全屏' : '全屏'}>
                                <mdui-button-icon
                                    icon={isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                                    onClick={() => {
                                        if (document.fullscreenElement) document.exitFullscreen?.().catch(() => { })
                                        else focusRef.current?.requestFullscreen?.().catch(() => { })
                                    }}
                                />
                            </mdui-tooltip>
                            <mdui-tooltip content="退出最大化">
                                <mdui-button-icon
                                    icon="close_fullscreen"
                                    onClick={() => {
                                        if (document.fullscreenElement) document.exitFullscreen?.().catch(() => { })
                                        MeetingManager.setFocused(undefined)
                                    }}
                                />
                            </mdui-tooltip>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: '0 0 auto' }}>
                        {tiles.map((t) => (
                            <div key={t.key} style={{ flex: '0 0 130px' }}>
                                <ParticipantTile
                                    compact
                                    participant={t.participant}
                                    prefer={t.source}
                                    bubble={m.settings.showBubble ? m.bubbles[t.participant.identity] : undefined}
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
                <div style={{ display: 'grid', gridTemplateColumns: gridCols ? `repeat(${gridCols}, 1fr)` : `repeat(auto-fit, minmax(${isWindow ? 280 : 130}px, 1fr))`, gap: '6px', alignContent: 'start' }}>
                    {tiles.map((t) => {
                        const src = t.source
                        return <ParticipantTile
                            key={t.key}
                            participant={t.participant}
                            prefer={src}
                            bubble={m.settings.showBubble ? m.bubbles[t.participant.identity] : undefined}
                            onClick={() => { if (src !== 'auto') maximize(t.participant.identity, src) }}
                            actions={src !== 'auto' ? <>
                                <mdui-tooltip content={src === 'camera' ? '最大化摄像头' : '最大化共享'}>
                                    <mdui-button-icon icon="zoom_out_map" onClick={() => maximize(t.participant.identity, src)} />
                                </mdui-tooltip>
                                <mdui-tooltip content="全屏">
                                    <mdui-button-icon icon="fullscreen" onClick={() => maximizeAndFullscreen(t.participant.identity, src)} />
                                </mdui-tooltip>
                            </> : undefined}
                        />
                    })}
                </div>
            ))}
        </div>
    )

    const toggleFullscreen = () => {
        if (document.fullscreenElement) document.exitFullscreen?.().catch(() => { })
        else document.documentElement.requestFullscreen?.().catch(() => { })
    }

    const draggable = !isDocked && !isWindow

    const header = (
        <div
            onPointerDown={draggable ? onPointerDown : undefined}
            onPointerMove={draggable ? onPointerMove : undefined}
            onPointerUp={draggable ? onPointerUp : undefined}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px 6px 12px',
                borderBottom: '1px solid rgb(var(--mdui-color-outline-variant))',
                cursor: draggable ? 'move' : 'default',
                userSelect: 'none',
                touchAction: 'none',
            }}>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.chatTitle || '会议'}
                </div>
                {!floatingMinimized && (
                    <div style={{ fontSize: '11px', opacity: 0.6 }}>
                        {m.room?.name || m.roomName || ''} · {participants.length} 人{m.phase == 'connecting' ? ' · 连接中...' : ''}
                    </div>
                )}
            </div>

            {floatingMinimized && <>
                <mdui-tooltip content={m.isMicOn ? '关闭麦克风' : '开启麦克风'}>
                    <mdui-button-icon
                        icon={m.isMicOn ? 'mic' : 'mic_off'}
                        onClick={() => MeetingManager.toggleMic().catch((e) => tipError(e, '切换麦克风失败'))}
                    />
                </mdui-tooltip>
                {m.settings.showCameraButton && <mdui-tooltip content={m.isCameraOn ? '关闭摄像头' : '开启摄像头'}>
                    <mdui-button-icon
                        icon={m.isCameraOn ? 'videocam' : 'videocam_off'}
                        onClick={() => MeetingManager.toggleCamera().catch((e) => tipError(e, '切换摄像头失败'))}
                    />
                </mdui-tooltip>}
                <mdui-tooltip content={m.isSharingScreen ? '停止共享' : '共享屏幕'}>
                    <mdui-button-icon
                        icon={m.isSharingScreen ? 'screen_share' : 'stop_screen_share'}
                        onClick={() => onToggleScreenShare()}
                    />
                </mdui-tooltip>
            </>}

            {!isWindow && <mdui-tooltip content={isDocked ? '切换为悬浮小窗' : '切换为分栏 (左画面 / 右聊天)'}>
                <mdui-button-icon
                    icon={isDocked ? 'picture_in_picture_alt' : 'view_sidebar'}
                    onClick={() => MeetingManager.setDock(!isDocked)}
                />
            </mdui-tooltip>}

            {isWindow && <mdui-tooltip content={isFullscreen ? '退出全屏' : '全屏'}>
                <mdui-button-icon
                    icon={isFullscreen ? 'fullscreen_exit' : 'fullscreen'}
                    onClick={toggleFullscreen}
                />
            </mdui-tooltip>}

            {!isDocked && !isWindow && <mdui-tooltip content={floatingMinimized ? '展开' : '最小化'}>
                <mdui-button-icon
                    icon={floatingMinimized ? 'open_in_full' : 'minimize'}
                    onClick={onToggleMinimize}
                />
            </mdui-tooltip>}
            {!isDocked && !isWindow && !floatingMinimized && <mdui-tooltip content={size === 'expanded' ? '缩小' : '放大'}>
                <mdui-button-icon
                    icon={size === 'expanded' ? 'close_fullscreen' : 'open_in_full'}
                    onClick={() => setSizePreset(size === 'expanded' ? 'normal' : 'expanded')}
                />
            </mdui-tooltip>}
            <mdui-tooltip content="离开会议">
                <mdui-button-icon icon="close" onClick={() => MeetingManager.leave()} />
            </mdui-tooltip>
        </div>
    )

    const controls = !floatingMinimized && (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px',
            borderTop: '1px solid rgb(var(--mdui-color-outline-variant))',
            gap: '6px',
        }}>
            <div style={{ flex: 1 }} />
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                flexWrap: 'wrap',
            }}>
                {m.audioBlocked && (
                    <mdui-tooltip content='恢复音频'>
                        <mdui-button-icon icon="play_arrow" variant="tonal" onClick={() => MeetingManager.resumeAudio()}></mdui-button-icon>
                    </mdui-tooltip>
                )}

                <mdui-dropdown trigger='hover'>
                    <mdui-button-icon slot="trigger"
                        icon={m.isMicOn ? 'mic' : 'mic_off'}
                        onClick={() => MeetingManager.toggleMic().catch((e) => tipError(e, '切换麦克风失败'))}
                    />

                    <mdui-menu>
                        <mdui-menu-item
                            icon={m.noiseSuppression ? 'check' : undefined}
                            onClick={() => MeetingManager.setNoiseSuppression(!m.noiseSuppression).catch((e) => tipError(e, '切换降噪失败'))}
                        >麦克风降噪</mdui-menu-item>
                        {m.audioInputs.length > 0 && <mdui-divider></mdui-divider>}
                        {m.audioInputs.map((d) => (
                            <mdui-menu-item
                                key={d.deviceId}
                                icon={d.deviceId === m.activeAudioInput ? 'check' : undefined}
                                onClick={() => MeetingManager.setAudioInput(d.deviceId).catch((e) => tipError(e, '切换麦克风失败'))}
                            >{d.label}</mdui-menu-item>
                        ))}
                    </mdui-menu>
                </mdui-dropdown>
                {m.settings.showCameraButton && <mdui-tooltip content={m.isCameraOn ? '关闭摄像头' : '开启摄像头'}>
                    <mdui-button-icon
                        icon={m.isCameraOn ? 'videocam' : 'videocam_off'}
                        onClick={() => MeetingManager.toggleCamera().catch((e) => tipError(e, '切换摄像头失败'))}
                    />
                </mdui-tooltip>}
                <mdui-tooltip content={m.isSharingScreen ? '停止共享' : '共享屏幕'}>
                    <mdui-button-icon
                        icon={m.isSharingScreen ? 'screen_share' : 'stop_screen_share'}
                        onClick={() => onToggleScreenShare()}
                    />
                </mdui-tooltip>
                {m.isSharingScreen && (
                    <span style={{ fontSize: '12px', opacity: 0.7 }}>{m.isSharingAudio ? '含电脑声音' : '仅屏幕'}</span>
                )}
                {canEnd && <mdui-button icon="call_end" variant="tonal" onClick={onEnd}>结束会议</mdui-button>}
            </div>
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                <mdui-tooltip content="会议设置">
                    <mdui-button-icon icon="settings" onClick={() => { if (settingsRef.current) settingsRef.current.open = true }} />
                </mdui-tooltip>
            </div>
        </div>
    )

    const settingsDialog = (
        <mdui-dialog ref={settingsRef} close-on-overlay-click close-on-esc headline="会议设置">
            <mdui-list>
                <mdui-list-item rounded onClick={() => MeetingManager.setMeetingSetting('showBubble', !m.settings.showBubble)}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                        <span style={{ flex: 1 }}>消息气泡</span>
                        <mdui-switch checked={m.settings.showBubble} checked-icon="" />
                    </div>
                </mdui-list-item>
                <mdui-list-item rounded onClick={() => MeetingManager.setMeetingSetting('showLocalMute', !m.settings.showLocalMute)}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                        <span style={{ flex: 1 }}>本地静音按钮</span>
                        <mdui-switch checked={m.settings.showLocalMute} checked-icon="" />
                    </div>
                </mdui-list-item>
                <mdui-list-item rounded onClick={() => MeetingManager.setMeetingSetting('showCameraButton', !m.settings.showCameraButton)}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                        <span style={{ flex: 1 }}>摄像头按钮</span>
                        <mdui-switch checked={m.settings.showCameraButton} checked-icon="" />
                    </div>
                </mdui-list-item>
                <mdui-list-item rounded onClick={() => MeetingManager.setMeetingSetting('autoMuteStreams', !m.settings.autoMuteStreams)}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                        <span style={{ flex: 1 }}>直播流加入时自动本地静音</span>
                        <mdui-switch checked={m.settings.autoMuteStreams} checked-icon="" />
                    </div>
                </mdui-list-item>
                <mdui-list-item rounded onClick={() => MeetingManager.setMeetingSetting('showMediaStats', !m.settings.showMediaStats)}>
                    <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                        <span style={{ flex: 1 }}>显示视频统计信息 (调试)</span>
                        <mdui-switch checked={m.settings.showMediaStats} checked-icon="" />
                    </div>
                </mdui-list-item>
            </mdui-list>
            <mdui-button slot="action" variant="text" onClick={() => { if (settingsRef.current) settingsRef.current.open = false }}>关闭</mdui-button>
        </mdui-dialog>
    )

    const resizeHandle = !isDocked && !isWindow && !floatingMinimized && (
        <div
            onPointerDown={onResizePointerDown}
            onPointerMove={onResizePointerMove}
            onPointerUp={onResizePointerUp}
            style={{
                position: 'absolute',
                right: 0,
                bottom: 0,
                width: '18px',
                height: '18px',
                cursor: 'nwse-resize',
                touchAction: 'none',
                zIndex: 10,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'flex-end',
                padding: '2px',
                color: 'rgb(var(--mdui-color-outline))',
            }}
        >
            <svg width="12" height="12" viewBox="0 0 12 12" style={{ display: 'block' }}>
                <path d="M11 1 L11 11 L1 11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
                <path d="M11 5 L11 11 L5 11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
            </svg>
        </div>
    )

    if (isWindow) {
        return <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgb(var(--mdui-color-surface-container-low))',
            color: 'rgb(var(--mdui-color-on-surface))',
            overflow: 'hidden',
        }}>
            {header}
            {body}
            {controls}
            {settingsDialog}
            {m.audioBlocked && !!m.room && (
                <div
                    onClick={() => MeetingManager.resumeAudio()}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        zIndex: 20,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        background: 'rgba(0,0,0,0.6)',
                        color: '#fff',
                        cursor: 'pointer',
                    }}>
                    <mdui-icon name="volume_off" style={{ fontSize: '40px' }} />
                    <div style={{ fontSize: '14px' }}>浏览器拦截了声音, 点击任意位置开启</div>
                </div>
            )}
        </div>
    }

    if (isDocked) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'rgb(var(--mdui-color-surface-container-low))', color: 'rgb(var(--mdui-color-on-surface))', overflow: 'hidden' }}>
            {header}
            {body}
            {controls}
            {settingsDialog}
        </div>
    }

    return <div style={{
        position: 'fixed',
        left: pos?.x ?? 20,
        top: pos?.y ?? 20,
        width: dim.w,
        height: floatingMinimized ? undefined : dim.h,
        zIndex: 2000,
        background: 'rgb(var(--mdui-color-surface-container-low))',
        color: 'rgb(var(--mdui-color-on-surface))',
        borderRadius: 'var(--mdui-shape-corner-large,1rem)',
        boxShadow: 'var(--mdui-elevation-level3)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgb(var(--mdui-color-outline-variant))',
        visibility: pos == undefined ? 'hidden' : 'visible',
    }}>
        {header}
        {body}
        {controls}
        {resizeHandle}
        {settingsDialog}
    </div>
}