import React from 'react'
import { LocalParticipant, Track, type Participant } from 'livekit-client'
import AppState from '../AppState.ts'
import tipError from '../tipError.ts'
import { MeetingManager, useMeeting } from './MeetingManager.ts'
import ParticipantTile from './ParticipantTile.tsx'
import { VideoPublication } from './VideoTrack.tsx'

type PanelSize = 'normal' | 'expanded' | 'minimized'

const SIZES = {
    normal: { w: 400, h: 320 },
    expanded: { w: 800, h: 580 },
} as const

const PANEL_BG = '#141414'

function hasScreenShare(p: Participant) {
    const s = p.getTrackPublication(Track.Source.ScreenShare)
    return !!s?.track && !s.isMuted
}
function screenPub(p: Participant) {
    return p.getTrackPublication(Track.Source.ScreenShare)
}

export default function MeetingPanel({ mode }: { mode: 'floating' | 'docked' }) {
    const m = useMeeting()

    const [size, setSize] = React.useState<PanelSize>('normal')
    const [pos, setPos] = React.useState<{ x: number, y: number } | undefined>(undefined)

    const dragRef = React.useRef<{ dx: number, dy: number } | null>(null)
    const focusRef = React.useRef<HTMLDivElement>(null)
    const pendingFullscreen = React.useRef(false)

    const active = m.isActive()

    // 初次出现 (悬浮模式) 定位到右下角
    React.useEffect(() => {
        if (mode !== 'floating' || pos != undefined) return
        setPos({
            x: Math.max(12, window.innerWidth - SIZES.normal.w - 20),
            y: Math.max(12, window.innerHeight - SIZES.normal.h - 20),
        })
    }, [mode, pos])

    // 最大化某人的屏幕共享后, 如果需要一并进入全屏
    React.useEffect(() => {
        if (pendingFullscreen.current && focusRef.current) {
            pendingFullscreen.current = false
            focusRef.current.requestFullscreen?.().catch(() => { })
        }
    }, [m.focusedIdentity])

    if (!active) return null

    const participants = m.room
        ? [m.room.localParticipant, ...Array.from(m.room.remoteParticipants.values())]
        : []

    // starter 可结束; 若未知 (异常兜底) 也允许尝试, 由服务端校验权限
    const canEnd = !m.starterUserId || m.starterUserId == AppState.myId
    const focused = participants.find((p) => p.identity === m.focusedIdentity && hasScreenShare(p))
    const dim = size === 'minimized' ? { w: 280, h: 0 } : SIZES[size as Exclude<PanelSize, 'minimized'>]
    const isDocked = mode === 'docked'

    const onPointerDown = (e: React.PointerEvent) => {
        if ((e.target as HTMLElement).closest('mdui-button-icon, mdui-button, button')) return
        const p = pos ?? { x: 0, y: 0 }
        dragRef.current = { dx: e.clientX - p.x, dy: e.clientY - p.y }
        ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
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

    const onEnd = async () => {
        try { await MeetingManager.endMeeting() } catch (e) { tipError(e, '结束会议失败') }
    }
    const maximize = (id: string) => MeetingManager.setFocused(id)
    const maximizeAndFullscreen = (id: string) => {
        pendingFullscreen.current = true
        MeetingManager.setFocused(id)
    }

    // ============ 主体 ============
    const body = (
        <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '8px',
            display: (!isDocked && size === 'minimized') ? 'none' : undefined,
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
                /* 最大化某人的屏幕共享 */
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '6px' }}>
                    <div ref={focusRef} style={{ position: 'relative', flex: 1, minHeight: 0, borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
                        <VideoPublication publication={screenPub(focused)} muted={focused instanceof LocalParticipant} />
                        <div style={{ position: 'absolute', left: '8px', bottom: '8px', padding: '2px 8px', borderRadius: '8px', fontSize: '12px', background: 'rgba(0,0,0,0.5)' }}>
                            {focused.name || focused.identity} · 共享屏幕
                        </div>
                        <div style={{ position: 'absolute', top: '6px', right: '6px', display: 'flex', gap: '2px' }}>
                            <mdui-button-icon icon="fullscreen" title="全屏" onClick={() => focusRef.current?.requestFullscreen?.().catch(() => { })} />
                            <mdui-button-icon icon="close_fullscreen" title="退出最大化" onClick={() => MeetingManager.setFocused(undefined)} />
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', flex: '0 0 auto' }}>
                        {participants.map((p) => (
                            <div key={p.identity} style={{ flex: '0 0 130px' }}>
                                <ParticipantTile
                                    compact
                                    participant={p}
                                    onClick={() => hasScreenShare(p) && p.identity !== focused.identity && maximize(p.identity)}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* 宫格 */
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '6px', alignContent: 'start' }}>
                    {participants.map((p) => <ParticipantTile
                        key={p.identity}
                        participant={p}
                        onClick={() => hasScreenShare(p) && maximize(p.identity)}
                        actions={hasScreenShare(p) ? <>
                            <mdui-button-icon icon="zoom_out_map" title="最大化" onClick={() => maximize(p.identity)} />
                            <mdui-button-icon icon="fullscreen" title="全屏" onClick={() => maximizeAndFullscreen(p.identity)} />
                        </> : undefined}
                    />)}
                </div>
            ))}
        </div>
    )

    const floatingMinimized = !isDocked && size === 'minimized'

    // ============ 标题栏 ============
    const header = (
        <div
            onPointerDown={isDocked ? undefined : onPointerDown}
            onPointerMove={isDocked ? undefined : onPointerMove}
            onPointerUp={isDocked ? undefined : onPointerUp}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 8px 6px 12px',
                borderBottom: (floatingMinimized || isDocked) ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.08)',
                cursor: isDocked ? 'default' : 'move',
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
                <mdui-button-icon
                    icon={m.isMicOn ? 'mic' : 'mic_off'}
                    onClick={() => MeetingManager.toggleMic().catch((e) => tipError(e, '切换麦克风失败'))}
                    title={m.isMicOn ? '关闭麦克风' : '开启麦克风'}
                />
                <mdui-button-icon
                    icon={m.isSharingScreen ? 'stop_screen_share' : 'screen_share'}
                    onClick={() => MeetingManager.toggleScreenShare().catch((e) => tipError(e, '屏幕共享失败'))}
                    title={m.isSharingScreen ? '停止共享' : '共享屏幕'}
                />
            </>}

            {/* 分栏 / 小窗 切换 */}
            <mdui-button-icon
                icon={isDocked ? 'picture_in_picture_alt' : 'view_sidebar'}
                onClick={() => MeetingManager.setDock(!isDocked)}
                title={isDocked ? '切换为悬浮小窗' : '切换为分栏 (左画面 / 右聊天)'}
            />

            {!isDocked && <mdui-button-icon
                icon={floatingMinimized ? 'open_in_full' : 'minimize'}
                onClick={() => setSize(floatingMinimized ? 'normal' : 'minimized')}
                title={floatingMinimized ? '展开' : '最小化 (继续聊天)'}
            />}
            {!isDocked && !floatingMinimized && <mdui-button-icon
                icon={size === 'expanded' ? 'close_fullscreen' : 'open_in_full'}
                onClick={() => setSize(size === 'expanded' ? 'normal' : 'expanded')}
                title={size === 'expanded' ? '缩小' : '放大'}
            />}
            <mdui-button-icon icon="close" onClick={() => MeetingManager.leave()} title="离开会议" />
        </div>
    )

    // ============ 控制栏 ============
    const controls = !floatingMinimized && (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            flexWrap: 'wrap',
        }}>
            {m.audioBlocked && (
                <mdui-button icon="volume_up" variant="tonal" onClick={() => MeetingManager.resumeAudio()}>播放音频</mdui-button>
            )}
            <mdui-button-icon
                icon={m.isMicOn ? 'mic' : 'mic_off'}
                onClick={() => MeetingManager.toggleMic().catch((e) => tipError(e, '切换麦克风失败'))}
                title={m.isMicOn ? '关闭麦克风' : '开启麦克风'}
            />
            <mdui-button-icon
                icon={m.isSharingScreen ? 'stop_screen_share' : 'screen_share'}
                onClick={() => MeetingManager.toggleScreenShare().catch((e) => tipError(e, '屏幕共享失败'))}
                title={m.isSharingScreen ? '停止共享' : '共享屏幕'}
            />
            {canEnd && <mdui-button icon="call_end" variant="tonal" onClick={onEnd}>结束会议</mdui-button>}
        </div>
    )

    if (isDocked) {
        return <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: PANEL_BG, color: '#fff', overflow: 'hidden' }}>
            {header}
            {body}
            {controls}
        </div>
    }

    return <div style={{
        position: 'fixed',
        left: pos?.x ?? 20,
        top: pos?.y ?? 20,
        width: dim.w,
        height: floatingMinimized ? undefined : dim.h,
        zIndex: 2000,
        background: 'rgba(20,20,20,0.96)',
        color: '#fff',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.1)',
        visibility: pos == undefined ? 'hidden' : 'visible',
    }}>
        {header}
        {body}
        {controls}
    </div>
}
