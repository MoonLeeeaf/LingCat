import React from 'react'
import { motion } from 'motion/react'
import { TextField } from 'mdui'
import { useNavigate, useParams } from '@tanstack/react-router'
import type { IChat } from 'lingcat-protocol'
import type LingCatClient from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import ProfileCache from '../../ProfileCache.ts'
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

export type ChatListShow = 'recents' | 'search' | 'favourites' | 'all'

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
//                      工具函数
// ============================================================

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

    // chats 数据
    const [recentChats, setRecentChats] = React.useState<IChat[]>([])
    const [favouritedChats, setFavouritedChats] = React.useState<IChat[]>([])
    const [allChats, setAllChats] = React.useState<IChat[]>([])
    const [loading, setLoading] = React.useState({ recent: false, fav: false, all: false })

    // 首次加载/切换列表时先只做淡入，稳定后再启用 layout 重排动画，避免首屏生硬
    const [layoutReady, setLayoutReady] = React.useState(false)
    React.useEffect(() => {
        const currentLoading = show === 'recents'
            ? loading.recent
            : show === 'favourites'
                ? loading.fav
                : loading.all
        if (currentLoading) {
            setLayoutReady(false)
            return
        }
        const timer = window.setTimeout(() => setLayoutReady(true), 500)
        return () => window.clearTimeout(timer)
    }, [show, loading.recent, loading.fav, loading.all])

    // search
    const [searchKeyword, setSearchKeyword] = React.useState('')
    const [searchResults, setSearchResults] = React.useState<IChat[]>([])
    const [searching, setSearching] = React.useState(false)

    React.useEffect(() => {
        if (show !== 'search') return
        const keyword = searchKeyword.trim()
        if (!keyword) { setSearchResults([]); setSearching(false); return }
        let cancelled = false
        setSearching(true)
        const timer = window.setTimeout(async () => {
            try {
                const client = ClientManager.getActiveClient()
                const session = ClientManager.getActiveSession()
                if (!client || !session) return
                const chats = await ChatApi.searchMyChats(client, {
                    access_token: session.token, keyword,
                })
                if (!cancelled) setSearchResults(chats)
            } catch (e) {
                if (!cancelled) { tipError(e, '搜索失败'); setSearchResults([]) }
            } finally {
                if (!cancelled) setSearching(false)
            }
        }, 300)
        return () => { cancelled = true; window.clearTimeout(timer) }
    }, [searchKeyword, show])

    // 拉取 chats + 监听 Update_My_Chats_Event
    React.useEffect(() => {
        if (!client || !sessionKey || connectionState !== 'connected') return
        const session = ClientManager.getActiveSession()
        if (!session || session.key !== sessionKey) return

        let cancelled = false

        const refresh = async () => {
            setLoading({ recent: true, fav: true, all: true })
            try {
                const all = await ChatApi.getMyChats(client, {
                    access_token: session.token,
                    limit: 1000,
                })
                if (cancelled) return
                setAllChats(all)
                setRecentChats(all.slice(0, 50))

                const fav = await ChatApi.getMyFavouriteChats(client, {
                    access_token: session.token,
                })
                if (cancelled) return
                setFavouritedChats(fav)
                SessionEnv.favouritedChats = fav
            } catch (e) {
                if (!cancelled) {
                    console.error('[ChatList] refresh failed', e)
                    tipError(e, '刷新对话列表失败')
                }
            } finally {
                if (!cancelled) setLoading({ recent: false, fav: false, all: false })
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

    if (show === 'search') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <mdui-text-field
                    variant="outlined"
                    placeholder="查找我的对话..."
                    value={searchKeyword}
                    onInput={(e: any) => {
                        const val = e.target.value
                        setSearchKeyword(val)
                    }}
                    style={{ width: '100%', paddingBottom: '10px', flexShrink: 0 }}
                    clearable
                />

                {/* 搜索列表区域，允许内部滚动 */}
                <div style={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
                    <SearchFeedback busy={searching} count={searchResults.length} hasQuery={!!searchKeyword.trim()}
                        emptyText="输入关键词查找对话" />
                    {!searching && searchKeyword.trim() && searchResults.map(chat => (
                        <mdui-list-item
                            key={chat.id}
                            active={activeChatId === chat.id}
                            rounded
                            onClick={() => ChatProfileDialog.show(chat.id)}
                            headline={chat.title || '私聊'}
                        >
                            <Avatar
                                slot="icon"
                                src={chat.avatar_file_hash
                                    ? getFileUrl(chat.avatar_file_hash, SessionEnv.myFileAccessToken)
                                    : default_avatar}
                            />
                        </mdui-list-item>
                    ))}
                </div>

                {showBuildInfoFooter && <BuildInfoFooter />}
            </div>
        )
    }

    // 其余三种：recents / favourites / all —— 共用 filter field
    const dataSource: IChat[] =
        show === 'recents' ? recentChats :
            show === 'favourites' ? favouritedChats :
                allChats

    const isLoading =
        show === 'recents' ? loading.recent :
            show === 'favourites' ? loading.fav :
                loading.all

    const filteredChats = dataSource.filter(chatFilter)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ flexShrink: 0 }}>
                <ChatFilterField onFilterChange={setFilterText} />
            </div>

            {/* 聊天列表区域，允许内部滚动 */}
            <div style={{ flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
                <SearchFeedback busy={isLoading} count={filteredChats.length} hasQuery={!!filterText.trim()} />
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