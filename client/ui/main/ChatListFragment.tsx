import React from 'react'
import { motion } from 'motion/react'
import { TextField } from 'mdui'
import { useNavigate } from '@tanstack/react-router'
import type { IChat } from 'lingcat-protocol'
import type LingCatClient from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import default_avatar from '../../default_avatar.png'
import getFileUrl from '../../lib/getFileUrl.ts'
import SessionEnv from '../../SessionEnv.ts'
import Avatar from '../Avatar.tsx'
import { useIsOnline } from '../presence/PresenceStore.ts'
import { PresenceAvatar } from '../presence/PresenceAvatar.tsx'
import ChatProfileDialog from '../viewer/ChatProfileDialog.tsx'
import tipError from '../tipError.ts'
import useEventListener from '../../lib/useEventListener.ts'
import { ChatApi } from 'lingcat-client-protocol'
import { useIsMobile } from '../../lib/useIsMobile.ts'
import { Methods, Package } from 'lingcat-protocol'
import RemarksCache from '../../RemarksCache.ts'
import SearchFeedback from './SearchFeedback.tsx'
import { BuildInfoFooter } from '../BuildInfo.tsx'

export type ChatListShow = 'all' | 'favourites'

export interface ChatListFragmentProps {
    /** 显示哪个列表 */
    show: ChatListShow
    /** 当前选中的 chatId（用于高亮），从路由取也行 */
    activeChatId?: string
    /** 移动端由列表自己渲染底部构建信息；桌面端固定在左侧栏底部 */
    showBuildInfoFooter?: boolean
    /** 当前已授权的 client；由 UserMainLayout 传入，避免子组件在就绪前读到 null */
    client?: LingCatClient | null
}

// ============================================================
//                      列表项
// ============================================================

function ChatListItem({ chat, active, index, enableLayout }: { chat: IChat; active: boolean; index: number; enableLayout: boolean }) {
    const navigate = useNavigate()
    const isMobile = useIsMobile()

    const userRemark = chat.peer_user_id && RemarksCache.get(chat.peer_user_id)
    const title = userRemark || chat.title || ''
    // 仅私聊显示对方在线绿点
    const online = useIsOnline(chat.peer_user_id)

    return (
        <motion.div
            layout={enableLayout ? 'position' : undefined}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
                duration: 0.22,
                delay: Math.min(index * 0.02, 0.18),
                ease: 'easeOut',
                layout: { type: 'spring', stiffness: 260, damping: 30 },
            }}
        >
            <mdui-dropdown trigger="hover">
                <mdui-list-item
                    active={active}
                    slot="trigger"
                    rounded
                    onClick={() => {
                        navigate({
                            to: '/chat/$chatId',
                            params: { chatId: chat.id },
                            replace: !isMobile,   // 桌面端 replace，移动端 push
                        })
                    }}
                    headline={title}
                    description-line={2}
                >
                    <PresenceAvatar slot="icon" online={online}>
                        <Avatar
                            src={chat.avatar_file_hash
                                ? getFileUrl(chat.avatar_file_hash, SessionEnv.myFileAccessToken)
                                : default_avatar}
                        />
                    </PresenceAvatar>
                    <span slot="description">{chat.last_message_text}</span>
                </mdui-list-item>

                <mdui-menu>
                    <mdui-menu-item
                        icon="info"
                        onClick={() => ChatProfileDialog.show(chat.id)}
                    >
                        对话信息
                    </mdui-menu-item>
                </mdui-menu>
            </mdui-dropdown>
        </motion.div>
    )
}

function ChatFilterField({ onFilterChange }: { onFilterChange: (text: string) => void }) {
    const ref = React.useRef<TextField>(null)
    useEventListener(ref, 'input', (e) => {
        onFilterChange((e.target as TextField).value)
    })
    return (
        <mdui-text-field
            variant="outlined"
            ref={ref as any}
            placeholder="从中查找..."
            style={{ width: '100%', paddingBottom: '10px' }}
        />
    )
}

// ============================================================
//                      主组件
// ============================================================

export function ChatListFragment({ show, activeChatId, showBuildInfoFooter = true, client }: ChatListFragmentProps) {
    // filter field
    const [filterText, setFilterText] = React.useState('')

    // client / session / 连接状态：都作为依赖，避免首次挂载时提前 return 后不再拉取
    const subscribeClient = React.useCallback((notify: () => void) => ClientManager.subscribe(notify), [])
    const sessionKey = React.useSyncExternalStore(
        subscribeClient,
        () => ClientManager.getActiveSession()?.key ?? null,
        () => null,
    )
    const subscribeConnection = React.useCallback(
        (notify: () => void) => client?.subscribeConnectionState(notify) ?? (() => {}),
        [client],
    )
    const connectionState = React.useSyncExternalStore(
        subscribeConnection,
        () => client?.connectionState ?? 'idle',
        () => 'idle',
    )

    const chatFilter = (chat: IChat) => {
        const filter = filterText.trim().toLowerCase()
        if (!filter) return true
        return [
            chat.chat_unique,
            chat.description,
            chat.id,
            chat.last_message_text,
            chat.title,
        ].some(field => field?.toLowerCase().includes(filter))
    }

    // 一次拉取全部对话，收藏列表由 favourited 字段在本地筛选。
    const [allChats, setAllChats] = React.useState<IChat[]>([])
    const [loading, setLoading] = React.useState(false)
    const favouritedChats = React.useMemo(
        () => allChats.filter(chat => chat.favourited),
        [allChats],
    )

    // 首次加载/切换列表时先只做淡入，稳定后再启用 layout 重排动画，避免首屏生硬
    const [layoutReady, setLayoutReady] = React.useState(false)
    React.useEffect(() => {
        if (loading) {
            setLayoutReady(false)
            return
        }
        const timer = window.setTimeout(() => setLayoutReady(true), 500)
        return () => window.clearTimeout(timer)
    }, [show, loading])

    // 拉取 chats + 监听 Update_My_Chats_Event
    React.useEffect(() => {
        if (!client || !sessionKey || connectionState !== 'connected') return
        const session = ClientManager.getActiveSession()
        if (!session || session.key !== sessionKey) return

        let cancelled = false

        const refresh = async () => {
            setLoading(true)
            try {
                const all = await ChatApi.getMyChats(client, {
                    access_token: session.token,
                    limit: 1000,
                })
                if (cancelled) return
                setAllChats(all)
                // 对话信息弹窗仍从这里读取收藏状态。
                SessionEnv.favouritedChats = all.filter(chat => chat.favourited)
            } catch (e) {
                if (!cancelled) {
                    console.error('[ChatList] refresh failed', e)
                    tipError(e, '刷新对话列表失败')
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        const onUpdate = (pkg: Package) => {
            if (pkg.method_id === Methods.Update_My_Chats_Event) refresh()
        }

        client.addOnReceiveListener(onUpdate)
        refresh()

        return () => {
            cancelled = true
            client.removeOnReceiveListener(onUpdate)
        }
    }, [client, sessionKey, connectionState])

    // ============================================================
    //                      渲染
    // ============================================================

    const dataSource = show === 'favourites' ? favouritedChats : allChats
    const filteredChats = dataSource.filter(chatFilter)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flexShrink: 0 }}>
                <ChatFilterField onFilterChange={setFilterText} />
            </div>

            {/* 聊天列表区域，允许内部滚动 */}
            <div style={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
                <SearchFeedback
                    busy={loading}
                    count={filteredChats.length}
                    hasQuery={!!filterText.trim()}
                    emptyText={show === 'favourites' ? '暂无收藏对话' : '暂无对话'}
                />
                {filteredChats.map((chat, index) => (
                    <ChatListItem
                        key={chat.id}
                        chat={chat}
                        active={activeChatId === chat.id}
                        index={index}
                        enableLayout={layoutReady}
                    />
                ))}
            </div>

            {showBuildInfoFooter && <BuildInfoFooter />}
        </div>
    )
}
