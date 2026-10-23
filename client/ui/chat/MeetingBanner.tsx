import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useMeetingStore } from '../meeting/MeetingManager.ts'
import { useMeetingUIStore } from '../meeting/MeetingUIStore.ts'
import { useMeetingParticipants } from '../meeting/useMeetingParticipants.ts'
import { MicLevelBar } from '../meeting/AudioLevel.tsx'
import SessionEnv from '../../SessionEnv.ts'
import default_avatar from '../../default_avatar.png'
import getFileUrl from '../../lib/getFileUrl.ts'
import Avatar from '../Avatar.tsx'
import tipError from '../tipError.ts'

export function MeetingBanner({ chatId, translucent }: { chatId: string, translucent?: boolean }) {
    // 本对话是否有会议
    const activeMeeting = useMeetingStore(s => s.activeMeetings[chatId])
    // 我是否在这个对话的会议里
    const room = useMeetingStore(s => s.room)
    const currentChatId = useMeetingStore(s => s.chatId)
    const isInThisMeeting = !!room && currentChatId === chatId
    // 会议 UI 是否已打开 / 是否最小化
    const uiOpen = useMeetingUIStore(s => s.isOpen)
    const isMinimized = useMeetingUIStore(s => s.isMinimized)
    // 本机麦克风状态 (用于音量条)
    const isMicOn = useMeetingStore(s => s.isMicOn)

    const meetingMembers = useMeetingParticipants(chatId, activeMeeting?.meetingId)

    // 打开对话/回到前台时向服务端同步一次进行中的会议
    // (重构后丢失了这次查询: 只靠 Meeting_Started_Event 广播, 错过广播的人看不到横幅)
    React.useEffect(() => {
        const refresh = () => useMeetingStore.getState().refreshActiveMeeting(chatId)
        refresh()
        const timer = setInterval(refresh, 60_000)
        const onVisible = () => { if (!document.hidden) refresh() }
        document.addEventListener('visibilitychange', onVisible)
        return () => {
            clearInterval(timer)
            document.removeEventListener('visibilitychange', onVisible)
        }
    }, [chatId])

    const joinOrOpen = async () => {
        if (isInThisMeeting) {
            // 已在该会议: 恢复被最小化/关闭的窗口
            useMeetingUIStore.getState().setMinimized(false)
            useMeetingUIStore.getState().open()
            return
        }
        if (!activeMeeting) return
        try {
            await useMeetingStore.getState().joinMeeting(
                chatId,
                activeMeeting.meetingId,
                activeMeeting.title,
            )
            useMeetingUIStore.getState().open()
        } catch (e) {
            tipError(e, '加入会议失败')
        }
    }

    if (!activeMeeting) return null

    const actionLabel = isInThisMeeting ? '会议中' : '加入'

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '6px 8px',
            padding: '6px 6px 6px 14px',
            borderRadius: '999px',
            background: translucent
                ? 'rgba(var(--mdui-color-primary-container), 0.82)'
                : 'rgb(var(--mdui-color-primary-container))',
            color: 'rgb(var(--mdui-color-on-primary-container))',
            boxShadow: 'var(--mdui-shadow-2)',
            fontSize: '13px',
            flexShrink: 0,
        }}>
            <span style={{ opacity: 0.9 }}>会议进行中</span>

            {meetingMembers.length > 0 && (
                <>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {meetingMembers.slice(0, 5).map((p, i) => (
                            <div
                                key={p.identity}
                                style={{
                                    marginLeft: i ? '-9px' : 0,
                                    borderRadius: '50%',
                                    border: '2px solid rgb(var(--mdui-color-primary-container))',
                                    flexShrink: 0,
                                }}
                            >
                                <Avatar
                                    src={p.avatar_file_hash
                                        ? getFileUrl(p.avatar_file_hash, SessionEnv.myFileAccessToken)
                                        : default_avatar}
                                    style={{ width: '24px', height: '24px' }}
                                />
                            </div>
                        ))}
                        {meetingMembers.length > 5 && (
                            <span style={{ marginLeft: '4px', fontSize: '12px', opacity: 0.75 }}>
                                +{meetingMembers.length - 5}
                            </span>
                        )}
                    </div>
                    <span style={{ opacity: 0.75 }}>{meetingMembers.length} 人</span>
                </>
            )}

            {/* 本机麦克风音量条: 仅在自己处于该会议且窗口未打开/已最小化时展示 */}
            {isInThisMeeting && (!uiOpen || isMinimized) && room?.localParticipant && (
                <MicLevelBar participant={room.localParticipant} muted={!isMicOn} />
            )}

            <div style={{ flex: 1 }} />

            <mdui-button
                variant="text"
                onClick={joinOrOpen}
                disabled={isInThisMeeting && uiOpen && !isMinimized || undefined}
            >
                {actionLabel}
            </mdui-button>
        </div>
    )
}