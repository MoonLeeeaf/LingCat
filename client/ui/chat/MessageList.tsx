import React from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { dialog } from 'mdui'
import type { IMessage } from 'lingcat-protocol'
import { useChatMessages } from './useChatMessages.ts'
import { useChatMessageStore } from './useChatMessageStore.ts'
import ChatMessage from './ChatMessage.tsx'
import MessageContainer from './MessageContainer.tsx'
import UserProfileDialog from '../viewer/UserProfileDialog.tsx'
import ProfileCache from '../../ProfileCache.ts'
import SessionEnv from '../../SessionEnv.ts'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'
import { ChatApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'

/** 判断是否需要在 msg 上方显示时间分隔条 */
function shouldShowTime(msg: IMessage, prevMsg?: IMessage): boolean {
    if (msg.system || !msg.sender_user_id) return false   // 系统消息不显示
    if (!prevMsg) return true                             // 第一条一定显示
    const d = new Date(Number(msg.time))
    const ld = new Date(Number(prevMsg.time))
    return (
        d.getFullYear() !== ld.getFullYear() ||
        d.getMonth() !== ld.getMonth() ||
        d.getDate() !== ld.getDate() ||
        d.getHours() !== ld.getHours() ||
        d.getMinutes() !== ld.getMinutes()
    )
}

/** 格式化分隔条文本："今天 14:30" / "3月5日 14:30" / "2024年3月5日 14:30" */
function formatTimeDivider(time: number): { short: string, full: string } {
    const d = new Date(Number(time))
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`
    const full = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`

    let short: string
    if (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
    ) {
        short = hm
    } else if (d.getFullYear() === now.getFullYear()) {
        short = `${d.getMonth() + 1}月${d.getDate()}日 ${hm}`
    } else {
        short = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${hm}`
    }
    return { short, full }
}

export interface MessageListProps {
    chatId: string
    isMember: boolean
    /** 点"编辑"时通知父组件（父组件把 editingMessage 传给 MessageInput） */
    onStartEdit?: (msg: IMessage) => void
    /** 点"回复"时把 [reply:xxx] 插进输入框 */
    onInsertText?: (text: string) => void
}

export function MessageList({
    chatId,
    isMember,
    onStartEdit,
    onInsertText,
}: MessageListProps) {
    const virtuosoRef = React.useRef<VirtuosoHandle>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const isAtBottomRef = React.useRef(true)
    const isNearBottomRef = React.useRef(true)
    const [initialScrollDone, setInitialScrollDone] = React.useState(false)

    // 切对话时重置
    React.useEffect(() => {
        setInitialScrollDone(false)
        isAtBottomRef.current = true
        isNearBottomRef.current = true
    }, [chatId])

    const scrollToBottom = React.useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
        // Virtuoso 的 scrollToIndex('LAST') 偶尔会差一截 (输入框/横幅高度在首帧后才确定),
        // 直接操作 scroller 兜底, 保证真正贴底
        const el = containerRef.current?.querySelector('[data-virtuoso-scroller="true"]') as HTMLElement | null
        if (el) {
            if (behavior === 'smooth') el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
            else el.scrollTop = el.scrollHeight
        }
        virtuosoRef.current?.scrollToIndex({ index: 'LAST', align: 'end', behavior })
    }, [])

    // 新消息到达时，若变化前在底部附近 → 贴底
    const handleNewMessage = React.useCallback(() => {
        if (!isNearBottomRef.current) return
        const pin = () => {
            const el = containerRef.current?.querySelector('[data-virtuoso-scroller="true"]') as HTMLElement | null
            if (el) el.scrollTop = el.scrollHeight
        }
        requestAnimationFrame(pin)
        // 消息/图片高度可能在下一帧才稳定, 再补一次
        window.setTimeout(() => {
            if (isNearBottomRef.current) pin()
        }, 120)
    }, [])

    const { sortedIds, firstItemIndex, loadOlder, loadNewer } = useChatMessages({
        chatId,
        isMember,
        onNewMessage: handleNewMessage,
    })

    // 首屏/切会话: 输入框、会议横幅高度在首帧后才确定, 再贴一次底
    const hasMessages = sortedIds.length > 0
    React.useEffect(() => {
        if (!hasMessages) return
        const timers = [
            window.setTimeout(() => scrollToBottom('auto'), 50),
            window.setTimeout(() => scrollToBottom('auto'), 300),
        ]
        return () => timers.forEach((t) => window.clearTimeout(t))
    }, [chatId, hasMessages, scrollToBottom])

    // 记录用户是否在底部附近 (以变化前的位置为准, 避免大消息/图片撑高后误判)
    React.useEffect(() => {
        if (!hasMessages) return
        const container = containerRef.current
        const sc = container?.querySelector('[data-virtuoso-scroller="true"]') as HTMLElement | null
        if (!sc) return
        const onScroll = () => {
            const distance = sc.scrollHeight - sc.clientHeight - sc.scrollTop
            isNearBottomRef.current = distance < 160
            isAtBottomRef.current = distance < 3
        }
        sc.addEventListener('scroll', onScroll, { passive: true })
        onScroll()
        return () => sc.removeEventListener('scroll', onScroll)
    }, [chatId, hasMessages])

    // 容器/内容高度变化 (输入框 autosize / 横幅 / 新消息 / 图片加载) 时保持贴底
    React.useEffect(() => {
        if (!hasMessages) return
        const container = containerRef.current
        if (!container) return
        let raf = 0
        const pin = () => {
            if (!isNearBottomRef.current) return
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                const el = container.querySelector('[data-virtuoso-scroller="true"]') as HTMLElement | null
                if (el) el.scrollTop = el.scrollHeight
            })
        }
        const ro = new ResizeObserver(pin)
        ro.observe(container)
        const list = container.querySelector('[data-testid="virtuoso-item-list"]')
        if (list) ro.observe(list)
        return () => {
            ro.disconnect()
            cancelAnimationFrame(raf)
        }
    }, [chatId, hasMessages])

    // ============================================================
    //  跳转定位（响应 store 的 scrollToSeqRequest）
    // ============================================================
    const scrollToSeqRequest = useChatMessageStore(s => s.scrollToSeqRequest)

    React.useEffect(() => {
        if (scrollToSeqRequest == null) return
        const seq = scrollToSeqRequest
        useChatMessageStore.getState().clearScrollToSeqRequest()

        const { sortedIds: ids } = useChatMessageStore.getState()
        const index = ids.indexOf(seq)

        if (index !== -1) {
            virtuosoRef.current?.scrollToIndex({ index, align: 'center', behavior: 'smooth' })
            return
        }

        // 不在窗口内 → 重新加载目标附近的消息并替换列表
        ; (async () => {
            try {
                const client = ClientManager.getActiveClient()
                const session = ClientManager.getActiveSession()
                if (!client || !session) return

                const [older, newer] = await Promise.all([
                    ChatApi.getChatMessages(client, {
                        access_token: session.token, chat_id: chatId,
                        before: seq + 1, limit: 30,
                    }),
                    ChatApi.getChatMessages(client, {
                        access_token: session.token, chat_id: chatId,
                        after: seq, limit: 30,
                    }),
                ])

                const merged = [...older, ...newer]
                const seen = new Set<number>()
                const unique = merged.filter(m => {
                    if (seen.has(m.id)) return false
                    seen.add(m.id)
                    return true
                })

                if (!unique.some(m => m.id === seq)) {
                    showSnackbar({ message: '消息已不存在' })
                    return
                }

                setInitialScrollDone(false)
                useChatMessageStore.getState().initMessages(unique, seq)

                requestAnimationFrame(() => {
                    const { sortedIds: newIds } = useChatMessageStore.getState()
                    const newIndex = newIds.indexOf(seq)
                    if (newIndex >= 0) {
                        virtuosoRef.current?.scrollToIndex({
                            index: newIndex,
                            align: 'center',
                            behavior: 'auto',
                        })
                    }
                })
            } catch (e) {
                console.error('跳转消息失败:', e)
                tipError(e, '无法加载消息')
            }
        })()
    }, [scrollToSeqRequest, chatId])

    // ============================================================
    //  Virtuoso 回调
    // ============================================================
    const atTopStateChange = React.useCallback((atTop: boolean) => {
        if (atTop) loadOlder()
    }, [loadOlder])

    const atBottomStateChange = React.useCallback((atBottom: boolean) => {
        isAtBottomRef.current = atBottom
        if (atBottom && !initialScrollDone) setInitialScrollDone(true)
        if (atBottom) loadNewer()   // 滚到底时顺便拉一次"更新"
    }, [initialScrollDone, loadNewer])

    // ============================================================
    //  itemContent（稳定引用，避免 Virtuoso 反复重建）
    // ============================================================
    const itemContent = React.useCallback((virtuosoIndex: number, seq: number) => {
        const { messageMap, sortedIds, firstItemIndex } = useChatMessageStore.getState()
        if (seq == null) return <div style={{ height: '0.5px' }} />
        const msg = messageMap.get(seq)
        if (!msg) return <div style={{ height: '0.5px' }} />

        // ★ 前一条消息（用于时间分组）
        const dataIndex = virtuosoIndex - firstItemIndex
        const prevSeq = dataIndex > 0 ? sortedIds[dataIndex - 1] : undefined
        const prevMsg = prevSeq != null ? messageMap.get(prevSeq) : undefined

        const showTime = shouldShowTime(msg, prevMsg)
        const timeInfo = showTime ? formatTimeDivider(Number(msg.time)) : null

        const hideSender = !showTime
            && !msg.system
            && prevMsg != null
            && !prevMsg.system
            && prevMsg.sender_user_id === msg.sender_user_id

        return (
            <React.Fragment key={seq}>
                {timeInfo && (
                    <div
                        title={timeInfo.full}
                        style={{
                            fontSize: '87%',
                            marginTop: '13px',
                            marginBottom: '10px',
                            textAlign: 'center',
                            opacity: 0.6,
                        }}
                    >
                        {timeInfo.short}
                    </div>
                )}
                <ChatMessage
                    key={seq}
                    msg={msg}
                    hideSender={hideSender}
                    onAvatarClick={() => {
                        if (msg.sender_user_id) UserProfileDialog.show(msg.sender_user_id)
                    }}
                    avatarMenus={<>
                        <mdui-menu-item
                            icon="info"
                            onClick={() => msg.sender_user_id && UserProfileDialog.show(msg.sender_user_id)}
                        >
                            用户资料
                        </mdui-menu-item>
                        <mdui-menu-item
                            icon="alternate_email"
                            onClick={async () => {
                                if (!msg.sender_user_id) return
                                const u = await ProfileCache.queryUserInfo(msg.sender_user_id)
                                onInsertText?.(`[@${u.nickname}](user:${msg.sender_user_id}) `)
                            }}
                        >
                            提及用户
                        </mdui-menu-item>
                    </>}
                    messageMenus={<>
                        {msg.sender_user_id === SessionEnv.myUserId && !msg.system && onStartEdit && (
                            <mdui-menu-item icon="edit" onClick={() => onStartEdit(msg)}>
                                编辑
                            </mdui-menu-item>
                        )}
                        <mdui-menu-item
                            icon="reply"
                            onClick={() => onInsertText?.(`[reply:${msg.id}]`)}
                        >
                            回复
                        </mdui-menu-item>
                        <mdui-menu-item
                            icon="info"
                            onClick={() => dialog({
                                headline: 'Info',
                                body: `<span style="word-break: break-word;">${Object.keys(msg).map(k =>
                                    `${k} = ${JSON.stringify((msg as any)[k])}`
                                ).join('<br><br>')
                                    }</span>`,
                                closeOnEsc: true,
                                closeOnOverlayClick: true,
                                actions: [{ text: '关闭', onClick: () => true }],
                            })}
                        >
                            Info
                        </mdui-menu-item>
                    </>}
                />
            </React.Fragment>
        )
    }, [onStartEdit, onInsertText])

    if (!isMember) return null

    return (
        <MessageContainer ref={containerRef} style={{ flex: 1, minHeight: 0 }}>
            {sortedIds.length > 0 && (
                <Virtuoso
                    ref={virtuosoRef}
                    key={chatId}
                    style={{ overflowY: 'auto', height: '100%' }}
                    data={sortedIds}
                    firstItemIndex={firstItemIndex}
                    initialTopMostItemIndex={{ index: 'LAST', align: 'end' }}
                    followOutput={() => (isNearBottomRef.current ? 'auto' : false)}
                    atTopThreshold={300}
                    atBottomThreshold={40}
                    atTopStateChange={atTopStateChange}
                    atBottomStateChange={atBottomStateChange}
                    computeItemKey={(_, seq) => seq}
                    increaseViewportBy={{ top: 300, bottom: 300 }}
                    itemContent={itemContent}
                />
            )}
        </MessageContainer>
    )
}