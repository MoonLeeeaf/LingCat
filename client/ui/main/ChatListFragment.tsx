import React from 'react'
import { TextField } from 'mdui'
import { useNavigate, useParams } from '@tanstack/react-router'
import type { IChat } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'
import ProfileCache from '../../ProfileCache.ts'
import default_avatar from '../../default_avatar.png'
import getFileUrl from '../../lib/getFileUrl.ts'
import SessionEnv from '../../SessionEnv.ts'
import Avatar from '../Avatar.tsx'
import ChatProfileDialog from '../viewer/ChatProfileDialog.tsx'
import tipError from '../tipError.ts'
import useEventListener from '../../lib/useEventListener.ts'
import { ChatApi } from 'lingcat-client-protocol'
import { useIsMobile } from '../../lib/useIsMobile.ts'
import { Methods, Package } from 'lingcat-protocol'

export type ChatListShow = 'recents' | 'search' | 'favourites' | 'all'

export interface ChatListFragmentProps {
    /** 显示哪个列表 */
    show: ChatListShow
    /** 当前选中的 chatId（用于高亮），从路由取也行 */
    activeChatId?: string
}

// ============================================================
//                      工具函数
// ============================================================

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timer: ReturnType<typeof setTimeout>
    return (...args: Parameters<T>) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}

// ============================================================
//                      列表项
// ============================================================

function ChatListItem({ chat, active }: { chat: IChat; active: boolean }) {
    const navigate = useNavigate()
    const isMobile = useIsMobile()

    return (
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
                headline={chat.title || ''}
                description-line={2}
            >
                <Avatar
                    slot="icon"
                    src={chat.avatar_file_hash
                        ? getFileUrl(chat.avatar_file_hash, SessionEnv.myFileAccessToken)
                        : default_avatar}
                />
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

export function ChatListFragment({ show, activeChatId }: ChatListFragmentProps) {
    // filter field
    const [filterText, setFilterText] = React.useState('')

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

    // search
    const [searchKeyword, setSearchKeyword] = React.useState('')
    const [searchResults, setSearchResults] = React.useState<IChat[]>([])
    const [searching, setSearching] = React.useState(false)

    const debouncedSearch = React.useCallback(
        debounce(async (keyword: string) => {
            if (!keyword.trim()) {
                setSearchResults([])
                setSearching(false)
                return
            }
            const client = ClientManager.getActiveClient()
            const session = ClientManager.getActiveSession()
            if (!client || !session) return

            setSearching(true)
            try {
                const chats = await ChatApi.searchMyChats(client, {
                    access_token: session.token,
                    keyword: keyword.trim(),
                })
                setSearchResults(chats)
            } catch (e) {
                tipError(e, '搜索失败')
                setSearchResults([])
            } finally {
                setSearching(false)
            }
        }, 300),
        [],
    )

    // 拉取 chats + 监听 Update_My_Chats_Event
    React.useEffect(() => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

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
    }, [])

    // ============================================================
    //                      渲染
    // ============================================================

    if (show === 'search') {
        return (
            <>
                <mdui-text-field
                    variant="outlined"
                    placeholder="查找我的对话..."
                    value={searchKeyword}
                    onInput={(e: any) => {
                        const val = e.target.value
                        setSearchKeyword(val)
                        debouncedSearch(val)
                    }}
                    style={{ width: '100%', paddingBottom: '10px' }}
                    clearable
                />
                {searching && <mdui-circular-progress style={{ margin: '20px auto', display: 'block' }} />}
                {!searching && searchKeyword.trim() !== '' && searchResults.length === 0 && (
                    <div style={{
                        padding: '20px',
                        textAlign: 'center',
                        color: 'var(--mdui-color-secondary)',
                    }}>
                        没有找到匹配的对话
                    </div>
                )}
                {searchResults.map(chat => (
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
            </>
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

    return (
        <>
            <ChatFilterField onFilterChange={setFilterText} />
            {isLoading && (
                <mdui-circular-progress style={{ margin: '10px auto', display: 'block' }} />
            )}
            {!isLoading && dataSource.length === 0 && (
                <mdui-list-item rounded>暂无对话</mdui-list-item>
            )}
            {dataSource.filter(chatFilter).map(chat => (
                <ChatListItem
                    key={chat.id}
                    chat={chat}
                    active={activeChatId === chat.id}
                />
            ))}
        </>
    )
}