import React from 'react'
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso'
import { dialog } from 'mdui'
import type { IMessage } from 'lingcat-protocol'
import { useChatMessages } from './useChatMessages.ts'
import { useChatMessageStore } from './useChatMessageStore.ts'
import ChatMessage from './ChatMessage.tsx'
import MessageContainer from './MessageContainer.tsx'
import { motion, AnimatePresence } from 'motion/react'
import MessageHighlight from './MessageHighlight.tsx'
import CopyMessageMenuItem from './CopyMessageMenuItem.tsx'
import UserProfileDialog from '../viewer/UserProfileDialog.tsx'
import ProfileCache from '../../ProfileCache.ts'
import SessionEnv from '../../SessionEnv.ts'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'
import { ChatApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'

/** 判断是否需要在 msg 上方显示时间分隔条 */
// 距底部多少像素内才跟随新消息 (太大导致小幅上滑也被拉回底部)
const BOTTOM_REENABLE_PX = 16

const ListFooter = () => <div style={{ height: '12px', flexShrink: 0 }} />

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
    const followBottomRef = React.useRef(true)
    const scrollIntentRef = React.useRef<'up' | 'down' | null>(null)
    const newMessageIdsRef = React.useRef<Set<number>>(new Set())
    const jumpVersionRef = React.useRef(0)
    const returningToBottomRef = React.useRef(false)
    const [initialScrollDone, setInitialScrollDone] = React.useState(false)
    const [awayFromBottom, setAwayFromBottom] = React.useState(false)
    const [unreadCount, setUnreadCount] = React.useState(0)

    // 切对话时重置
    React.useEffect(() => {
        setInitialScrollDone(false)
        isAtBottomRef.current = true
        followBottomRef.current = true
        scrollIntentRef.current = null
        newMessageIdsRef.current = new Set()
        setAwayFromBottom(false)
        setUnreadCount(0)
        returningToBottomRef.current = false
        return () => { jumpVersionRef.current++ }
    }, [chatId])

    const scrollToBottom = React.useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
        if (!followBottomRef.current) return
        // Virtuoso 的 scrollToIndex('LAST') 偶尔会差一截 (输入框/横幅高度在首帧后才确定),
        // 直接操作 scroller 兜底, 保证真正贴底
        const el = containerRef.current?.querySelector('[data-virtuoso-scroller="true"]') as HTMLElement | null
        if (el) {
            if (behavior === 'smooth') el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
            else el.scrollTop = el.scrollHeight
        }
    }, [])

    // 新消息到达时，记录 id 用于入场动画，并在跟随开关开启时贴底
    const handleNewMessage = React.useCallback(() => {
        const ids = useChatMessageStore.getState().sortedIds
        const seq = ids[ids.length - 1]
        if (seq != null) {
            newMessageIdsRef.current.add(seq)
            window.setTimeout(() => newMessageIdsRef.current.delete(seq), 600)
        }
        if (!followBottomRef.current) {
            setUnreadCount(count => count + 1)
            setAwayFromBottom(true)
            return
        }
        const pin = () => {
            if (!followBottomRef.current) return
            const el = containerRef.current?.querySelector('[data-virtuoso-scroller="true"]') as HTMLElement | null
            if (el) el.scrollTop = el.scrollHeight
        }
        requestAnimationFrame(pin)
        // 消息/图片高度可能在下一帧才稳定, 再补一次
        window.setTimeout(() => {
            if (followBottomRef.current) pin()
        }, 120)
    }, [])

    const { sortedIds, firstItemIndex, loadOlder, loadNewer, loading } = useChatMessages({
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

    // 跟随开关: 只有用户主动上滑 (滚轮/触摸/键盘/拖拽) 才关闭;
    // 程序滚动、Virtuoso 追加消息后的中间调整、内容增高都不会关闭, 避免误判后不贴底
    React.useEffect(() => {
        if (!hasMessages) return
        const container = containerRef.current
        const sc = container?.querySelector('[data-virtuoso-scroller="true"]') as HTMLElement | null
        if (!sc) return

        let pointerDown = false
        let lastTop = sc.scrollTop
        let touchY: number | null = null
        // 以用户的滚动方向为准。虚拟列表测量/补偿高度也会触发 scroll，
        // 不能仅因暂时靠近底部就重新开启跟随，否则上滑会被拉回去。

        const stopFollow = () => {
            returningToBottomRef.current = false
            scrollIntentRef.current = 'up'
            followBottomRef.current = false
        }
        const resumeFollow = () => {
            scrollIntentRef.current = 'down'
            if (sc.scrollHeight - sc.clientHeight - sc.scrollTop <= BOTTOM_REENABLE_PX) {
                followBottomRef.current = true
            }
        }
        const onScroll = () => {
            const distance = sc.scrollHeight - sc.clientHeight - sc.scrollTop
            isAtBottomRef.current = distance < 3
            if (pointerDown) {
                if (sc.scrollTop < lastTop) stopFollow()
                else if (sc.scrollTop > lastTop) scrollIntentRef.current = 'down'
            }
            if (scrollIntentRef.current === 'down' && distance <= BOTTOM_REENABLE_PX) {
                followBottomRef.current = true
            }
            if (distance <= BOTTOM_REENABLE_PX) returningToBottomRef.current = false
            setAwayFromBottom(!returningToBottomRef.current && (distance > BOTTOM_REENABLE_PX || (!followBottomRef.current && distance > 0)))
            if (followBottomRef.current && distance <= BOTTOM_REENABLE_PX) setUnreadCount(0)
            lastTop = sc.scrollTop
        }
        const onWheel = (e: WheelEvent) => {
            if (e.deltaY < 0) stopFollow()
            else if (e.deltaY > 0) resumeFollow()
        }
        const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0]?.clientY ?? null }
        const onTouchMove = (e: TouchEvent) => {
            const y = e.touches[0]?.clientY
            if (touchY != null && y != null) {
                if (y > touchY) stopFollow()
                else if (y < touchY) resumeFollow()
            }
            touchY = y ?? null
        }
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowUp' || e.key === 'PageUp' || e.key === 'Home') stopFollow()
            else if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === 'End') resumeFollow()
        }
        const onPointerDown = (e: PointerEvent) => {
            // 触摸方向由 touchmove 判断，避免高度补偿被误认为手指向下滚动。
            pointerDown = e.pointerType === 'mouse' && e.target === sc
            lastTop = sc.scrollTop
        }
        const onPointerUp = () => { pointerDown = false }

        sc.addEventListener('scroll', onScroll, { passive: true })
        sc.addEventListener('wheel', onWheel, { passive: true })
        sc.addEventListener('touchstart', onTouchStart, { passive: true })
        sc.addEventListener('touchmove', onTouchMove, { passive: true })
        sc.addEventListener('keydown', onKeyDown)
        sc.addEventListener('pointerdown', onPointerDown)
        window.addEventListener('pointerup', onPointerUp)
        window.addEventListener('pointercancel', onPointerUp)
        onScroll()
        return () => {
            sc.removeEventListener('scroll', onScroll)
            sc.removeEventListener('wheel', onWheel)
            sc.removeEventListener('touchstart', onTouchStart)
            sc.removeEventListener('touchmove', onTouchMove)
            sc.removeEventListener('keydown', onKeyDown)
            sc.removeEventListener('pointerdown', onPointerDown)
            window.removeEventListener('pointerup', onPointerUp)
            window.removeEventListener('pointercancel', onPointerUp)
        }
    }, [chatId, hasMessages])

    // 容器/内容高度变化 (输入框 autosize / 横幅 / 新消息 / 图片加载) 时保持贴底
    React.useEffect(() => {
        if (!hasMessages) return
        const container = containerRef.current
        if (!container) return
        let raf = 0
        const pin = () => {
            if (!followBottomRef.current) return
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                if (!followBottomRef.current) return
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
        returningToBottomRef.current = false
        followBottomRef.current = false
        scrollIntentRef.current = null
        const seq = scrollToSeqRequest
        const jumpVersion = ++jumpVersionRef.current
        useChatMessageStore.getState().clearScrollToSeqRequest()

        const { sortedIds: ids } = useChatMessageStore.getState()
        const index = ids.indexOf(seq)

        if (index !== -1) {
            useChatMessageStore.getState().highlightMessage(seq)
            virtuosoRef.current?.scrollToIndex({ index, align: 'center', behavior: 'auto' })
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
                if (jumpVersion !== jumpVersionRef.current) return
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
                    if (jumpVersion !== jumpVersionRef.current) return
                    const { sortedIds: newIds } = useChatMessageStore.getState()
                    const newIndex = newIds.indexOf(seq)
                    if (newIndex >= 0) {
                        useChatMessageStore.getState().highlightMessage(seq)
                        virtuosoRef.current?.scrollToIndex({
                            index: newIndex,
                            align: 'center',
                            behavior: 'auto',
                        })
                    }
                })
            } catch (e) {
                if (jumpVersion !== jumpVersionRef.current) return
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

        const isNew = newMessageIdsRef.current.has(seq)

        return (
            <motion.div
                key={seq}
                initial={isNew ? { opacity: 0, y: 10, scale: 0.99 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                style={{ position: 'relative' }}
            >
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
                        {msg.text && !msg.entities?.some(entity => entity.type === 'e2e') && <CopyMessageMenuItem text={msg.text} />}
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
                <MessageHighlight seq={seq} />
            </motion.div>
        )
    }, [onStartEdit, onInsertText])

    if (!isMember) return null

    return (
        <MessageContainer ref={containerRef} style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            {sortedIds.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loading ? 0 : 1 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    style={{ height: '100%' }}
                >
                <Virtuoso
                    ref={virtuosoRef}
                    key={chatId}
                    style={{ overflowY: 'auto', height: '100%' }}
                    data={sortedIds}
                    firstItemIndex={firstItemIndex}
                    initialTopMostItemIndex={{ index: 'LAST', align: 'end' }}
                    // 统一由 followBottomRef 控制贴底，避免 Virtuoso 延迟的尺寸补偿打断引用跳转。
                    followOutput={false}
                    atTopThreshold={300}
                    atBottomThreshold={0}
                    atTopStateChange={atTopStateChange}
                    atBottomStateChange={atBottomStateChange}
                    computeItemKey={(_, seq) => seq}
                    increaseViewportBy={{ top: 300, bottom: 300 }}
                    components={{ Footer: ListFooter }}
                    itemContent={itemContent}
                />
                </motion.div>
            )}
            <AnimatePresence>
                {(awayFromBottom || unreadCount > 0) && <motion.div key="back-to-bottom"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.16 }} style={{ position: 'absolute', right: '16px', bottom: '16px', zIndex: 3 }}>
                    <button type="button" className="lingcat-back-to-bottom" title="回到底部"
                        aria-label={unreadCount > 0 ? `${unreadCount} 条新消息，回到底部` : '回到底部'}
                        onClick={() => {
                            jumpVersionRef.current++
                            returningToBottomRef.current = true
                            followBottomRef.current = true
                            scrollIntentRef.current = 'down'
                            setUnreadCount(0)
                            setAwayFromBottom(false)
                            virtuosoRef.current?.scrollToIndex({ index: 'LAST', align: 'end', behavior: 'auto' })
                        }}>
                        <mdui-icon name="arrow_downward" aria-hidden="true" />
                    </button>
                </motion.div>}
            </AnimatePresence>
        </MessageContainer>
    )
}
