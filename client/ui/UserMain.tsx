import { Dialog, NavigationBar, NavigationDrawer, NavigationRail, TextField } from "mdui"
import Message from "./chat-layout/Message.tsx"
import MessageContainer from "./chat-layout/MessageContainer.tsx"
import React from "react"
import default_avatar from '../default_avatar.png'
import { IChat, IMessage, IUser, LingCatProto, Methods, Package } from "lingcat-protocol"
import UserProfileDialog from "./viewer/UserProfileDialog.tsx"
import ClientManager from "../ClientManager.ts"
import { ChatApi, FileApi, UserApi } from "lingcat-client-protocol"
import { Virtuoso } from "react-virtuoso"
import ChatMessage from "./chat/ChatMessage.tsx"
import ChatFragment from "./chat/ChatFragment.tsx"
import Avatar from "./Avatar.tsx"
import AppState from "./AppState.ts"
import tipError from "./tipError.ts"
import ChatProfileDialog from "./viewer/ChatProfileDialog.tsx"
import showSnackbar from "./showSnackbar.ts"
import useEventListener from "./useEventListener.ts"
import CircleProgressDialog from "./CircleProgressDialog.tsx"
import ChangePasswordDialog from "./main/ChangePasswordDialog.tsx"
import Markdown, { ReactRenderer } from "marked-react"
import ProfileCache from "../ProfileCache.ts"
import ClientSettingsDialog, { LoginDialog, SwitchUserDialog } from "./ClientSettingsDialog.tsx"
import MeetingPanel from "./meeting/MeetingPanel.tsx"
import { MeetingManager, useMeeting } from "./meeting/MeetingManager.ts"
import { takePendingInAppMeeting } from "./meeting/MeetingWindow.ts"
import { isAppForeground, isMentioned, notificationBody, notificationSupported, onNotificationClick, showMessageNotification } from "./notify.ts"
import ClientConfigInstance from "../ClientConfig.ts"

function protoMsgToIMessage(p: LingCatProto.classes.IMessage.$Properties): IMessage {
    return {
        id: p.id!,
        chat_id: p.chatId!,
        sender_user_id: p.senderUserId,
        system: p.system,
        text: p.text!,
        time: p.time,
        entities: (p.entities ?? []).map((e: any) => ({
            type: e.type,
            offset: e.offset ?? 0,
            length: e.length ?? 0,
            data: e.data,
        })),
        edited_at: p.editedAt,
    }
}

/**
 * 检查一条消息是否"回复了我"。
 * 只通过网络查询——拉取被回复的那条消息，看 sender 是不是我。
 */
async function hasReplyToMe(chatId: string, raw: IMessage, myId: string): Promise<boolean> {
    const entities = raw?.entities || []
    for (const e of entities) {
        if (e.type !== 'reply') continue
        if (!e.data) continue
        const seq = Number(e.data)
        if (!Number.isFinite(seq)) continue
        try {
            const msgs = await ChatApi.getChatMessages(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                chat_id: chatId,
                before: seq + 1,
                limit: 1,
            })
            if (msgs && msgs.length > 0
                && msgs[0].id === seq
                && msgs[0].sender_user_id === myId) {
                return true
            }
        } catch (err) {
            console.warn('[Notify] fetch reply target failed', err)
        }
    }
    return false
}

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timer: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}
function ChatListItem({ chat, setActiveChat, activeChat }: { chat: IChat, activeChat?: IChat, setActiveChat: Function }) {
    return <mdui-dropdown trigger="hover">
        <mdui-list-item
            active={activeChat?.id == chat.id}
            slot='trigger'
            key={chat.id}
            rounded
            onClick={() => {
                setActiveChat(chat)
                // drawerRef.current && (drawerRef.current.open = false) // 移动端关闭抽屉
            }}
            headline={chat.title || ''}
            description-line={2}>
            <Avatar
                slot="icon"
                src={chat.avatar_file_hash ? ClientManager.client.getFileUrlByHashAndToken(chat.avatar_file_hash, AppState.fileAccessToken) : default_avatar}
            />
            <span slot="description">
                {chat.last_message_text}
            </span>
        </mdui-list-item>
        <mdui-menu>
            <mdui-menu-item onClick={() => ChatProfileDialog.show(chat.id)} icon="info">对话信息</mdui-menu-item>
        </mdui-menu>
    </mdui-dropdown>
}

export default function UserMain({ profile, setProfile, drawerRef }: { profile: IUser | undefined, setProfile: (a: IUser) => void, drawerRef: React.RefObject<NavigationDrawer | undefined> }) {
    const [loadingProfile, setLoadingProfile] = React.useState(true)
    const meeting = useMeeting()
    const activeChatIdRef = React.useRef<string | undefined>(undefined)
    const [drawerOpen, setDrawerOpen] = React.useState(true)
    const toggleDrawer = React.useCallback(() => {
        const d = drawerRef.current
        if (d) d.open = !d.open
    }, [drawerRef])
    React.useEffect(() => {
        const d = drawerRef.current
        if (!d) return
        setDrawerOpen(d.open)
        const onOpened = () => setDrawerOpen(true)
        const onClosed = () => setDrawerOpen(false)
        d.addEventListener('opened', onOpened as EventListener)
        d.addEventListener('closed', onClosed as EventListener)
        return () => {
            d.removeEventListener('opened', onOpened as EventListener)
            d.removeEventListener('closed', onClosed as EventListener)
        }
    }, [drawerRef])

    // 分栏模式下拖动分隔条调整会议面板宽度
    const dockRowRef = React.useRef<HTMLDivElement>(null)
    const onDockDividerDown = (e: React.PointerEvent) => {
        e.preventDefault()
        const onMove = (ev: PointerEvent) => {
            const rect = dockRowRef.current?.getBoundingClientRect()
            if (!rect || rect.width <= 0) return
            MeetingManager.setDockWidthPercent(((ev.clientX - rect.left) / rect.width) * 100)
        }
        const onUp = () => {
            window.removeEventListener('pointermove', onMove)
            window.removeEventListener('pointerup', onUp)
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
    }

    React.useEffect(() => {
        ; (async () => {
            try {
                ClientManager.initClient(ClientManager.getActiveUserSessionName()!)
            } catch (e) {
                console.log(e)
                LoginDialog.show({ allowClose: false })
                setLoadingProfile(false)
            }
            ClientManager.client.onInit = async () => {
                try {
                    await UserApi.authorize(ClientManager.client, {
                        access_token: ClientManager.getActiveUserSession().token,
                        session_id: 'client-' + Date.now() + '-' + navigator.userAgent
                    })

                    AppState.myId = (await ClientManager.getMe()).id

                    const updateFileAccessToken = async () => {
                        /* document.cookie = "file_access_token=" + await FileApi.requestAccessUploadFileToken(ClientManager.client, {
                            access_token: ClientManager.getActiveUserSession().token
                        }) + ';' */
                        AppState.fileAccessToken = await FileApi.requestAccessUploadFileToken(ClientManager.client, {
                            access_token: ClientManager.getActiveUserSession().token
                        })
                    }
                    const id = setInterval(updateFileAccessToken, 1000 * 60 * 60 * 0.5)
                    await updateFileAccessToken()
                    ClientManager.client.client?.addEventListener('close', () => clearInterval(id))

                    setProfile(await ClientManager.getMe())
                } catch (e) {
                    tipError(e, "验证用户失败, 请重新登录")
                    LoginDialog.show({ allowClose: false })
                }
                setLoadingProfile(false)
            }
        })()
    }, [setProfile])

    React.useEffect(() => {
        onNotificationClick((chatId) => {
            (async () => {
                try {
                    setActiveChat(await ChatApi.queryChatInfo(ClientManager.client, {
                        access_token: ClientManager.getActiveUserSession().token,
                        chat_id: chatId,
                    }))
                } catch (e) {
                    tipError(e, '打开对话失败')
                }
            })()
        })
    }, [])

    // TODO: fix it
    React.useEffect(() => {
        async function callback(mPackage: Package) {
            if (mPackage.method_id != Methods.Receive_Chat_Message_Event) return
            if (!notificationSupported()) return
            try {
                const raw = LingCatProto.methods.Receive_Chat_Message_Event.decode(mPackage.data).msg
                if (!raw?.chatId) return
        
                const myId = AppState.myId || (await ClientManager.getMe()).id
                if (raw.senderUserId == myId) return
                if (activeChatIdRef.current == raw.chatId && isAppForeground()) return
        
                const chat = await ProfileCache.queryChatInfo(raw.chatId)
                const isPrivate = chat.type === 'private'
                const mentioned = isMentioned(raw.entities, myId)
                // 群聊时：未被 @ 才去查是否被回复（省网络请求）
                const replied = (!isPrivate && !mentioned)
                    ? await hasReplyToMe(raw.chatId, protoMsgToIMessage(raw), myId)
                    : false
                if (!isPrivate && !mentioned && !replied) return
        
                const sender = raw.senderUserId ? await ProfileCache.queryUserInfo(raw.senderUserId) : undefined
                const avatar = chat.type == 'private' ? chat.avatar_file_hash : (sender?.avatar_file_hash || chat.avatar_file_hash)
        
                const prefix = replied ? '[回复] ' : (mentioned ? '[提及] ' : '')
        
                await showMessageNotification({
                    chatId: raw.chatId,
                    title: (chat.title || '灵猫') + ' | 灵猫',
                    body: prefix + (raw.system ? '' : ((sender?.nickname || '新消息') + ': ')) + notificationBody(raw.text || ''),
                    icon: avatar ? ClientManager.client.getFileUrlByHashAndToken(avatar, AppState.fileAccessToken) : default_avatar,
                })
            } catch (e) {
                console.warn('[Notify] 处理新消息通知失败', e)
            }
        }

        ClientManager.client.addOnReceiveListener(callback)
        return () => {
            ClientManager.client.removeOnReceiveListener(callback)
        }
    }, [])

    React.useEffect(() => {
        async function onMeeting(p: Package) {
            if (p.method_id === Methods.Meeting_Started_Event) {
                const ev = LingCatProto.methods.Meeting_Started_Event.decode(p.data)
                MeetingManager.onMeetingStarted(ev)
            } else if (p.method_id === Methods.Meeting_Ended_Event) {
                const ev = LingCatProto.methods.Meeting_Ended_Event.decode(p.data)
                MeetingManager.onMeetingEnded(ev)
            }
        }
        ClientManager.client.addOnReceiveListener(onMeeting)
        return () => ClientManager.client.removeOnReceiveListener(onMeeting)
    }, [])

    const [activeChat, setActiveChat] = React.useState<IChat>()
    AppState.setActiveChat = setActiveChat

    React.useEffect(() => {
        activeChatIdRef.current = activeChat?.id
    }, [activeChat?.id])

    React.useEffect(() => {
        document.title = ClientConfigInstance.title + (activeChat?.title ? (' | ' + activeChat?.title) : '')
    }, [activeChat])

    // 记住当前打开的对话, 刷新后自动恢复
    const activeChatStorageKey = profile?.id ? 'lingcat.active_chat.' + profile.id : undefined
    React.useEffect(() => {
        if (!activeChatStorageKey || !activeChat?.id) return
        try { localStorage.setItem(activeChatStorageKey, activeChat.id) } catch { }
    }, [activeChatStorageKey, activeChat?.id])

    const restoredActiveChatRef = React.useRef(false)
    React.useEffect(() => {
        if (restoredActiveChatRef.current || !activeChatStorageKey) return
        restoredActiveChatRef.current = true
        let saved: string | null = null
        try { saved = localStorage.getItem(activeChatStorageKey) } catch { }
        if (!saved) return
            ; (async () => {
                try {
                    setActiveChat(await ChatApi.queryChatInfo(ClientManager.client, {
                        access_token: ClientManager.getActiveUserSession().token,
                        chat_id: saved!,
                    }))
                } catch (e) {
                    console.log('[UserMain] 恢复上次对话失败', e)
                }
            })()
    }, [activeChatStorageKey])

    const pendingMeetingTakenRef = React.useRef(false)
    React.useEffect(() => {
        if (!profile?.id || pendingMeetingTakenRef.current) return
        const req = takePendingInAppMeeting()
        if (!req) return
        pendingMeetingTakenRef.current = true
            ; (async () => {
                try {
                    const chat = await ChatApi.queryChatInfo(ClientManager.client, {
                        access_token: ClientManager.getActiveUserSession().token,
                        chat_id: req.chatId,
                    })
                    setActiveChat(chat)
                    await MeetingManager.startMeeting(chat)
                } catch (e) {
                    tipError(e, '加入会议失败')
                }
            })()
    }, [profile?.id])

    const navigationRef = React.useRef<NavigationRail | NavigationBar>(null)
    const [navigationSelected, setNavigationSelected] = React.useState('recent')
    useEventListener(navigationRef, 'change', (e) => {
        setNavigationSelected((e.target as NavigationRail | NavigationBar).value || '')
    })

    const filterInputRef = React.useRef<TextField>(null)
    const [filterText, setFilterText] = React.useState('')
    useEventListener(filterInputRef, 'input', (e) => {
        setFilterText((e.target as TextField).value)
    })
    const chatFilter = (chat: IChat) => {
        const filter = filterText.trim().toLowerCase()
        if (filter === '') return true
        const searchFields = [
            chat.chat_unique,
            chat.description,
            chat.id,
            chat.last_message_text,
            chat.title
        ]
        return searchFields.some(field => field?.toLowerCase().includes(filter))
    }

    const searchChatsDialogRef = React.useRef<Dialog>(null)
    const [searchKeyword, setSearchKeyword] = React.useState('')
    const [searchResults, setSearchResults] = React.useState<IChat[]>([])
    const [searching, setSearching] = React.useState(false)

    // 防抖搜索
    const debouncedSearch = React.useCallback(
        debounce(async (keyword: string) => {
            if (keyword.trim() == '') {
                setSearchResults([])
                setSearching(false)
                return
            }
            setSearching(true)
            try {
                const token = ClientManager.getActiveUserSession().token
                const chats = await ChatApi.searchMyChats(ClientManager.client, {
                    access_token: token,
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
        []
    )
    const [recentChats, setRecentChats] = React.useState<IChat[]>([])
    const [loadingRecent, setLoadingRecent] = React.useState(false)
    const [favouritedChats, setFavouritedChats] = React.useState<IChat[]>([])
    const [loadingFavourited, setLoadingFavourited] = React.useState(false)
    const [allChats, setAllChats] = React.useState<IChat[]>([])
    const [loadingAll, setLoadingAll] = React.useState(false)

    React.useEffect(() => {
        if (!profile?.id) return
        const refresh = async () => {
            console.log('[chats] refresh start')
            setLoadingAll(true)
            setLoadingRecent(true)
            setLoadingFavourited(true)
            try {
                const token = ClientManager.getActiveUserSession().token;
                const all = await ChatApi.getMyChats(ClientManager.client, {
                    access_token: token,
                    limit: 1000,
                })
                console.log('[chats] getMyChats ->', all.length)
                setAllChats(all)
                setRecentChats(all.slice(0, 50))
                const fav = await ChatApi.getMyFavouriteChats(ClientManager.client, {
                    access_token: token,
                    // limit: 50,
                })
                console.log('[chats] getMyFavouriteChats ->', fav.length)
                setFavouritedChats(fav)
                AppState.favouritedChats = fav
            } catch (e) {
                console.error('[chats] refresh failed', e)
                tipError(e, '刷新对话列表失败')
            } finally {
                console.log('[chats] refresh done')
                setLoadingAll(false)
                setLoadingRecent(false)
                setLoadingFavourited(false)
            }
        }
        const onUpdate = async (mPackage: Package) => {
            if (mPackage.method_id === Methods.Update_My_Chats_Event) {
                await refresh()
            }
        }
        ClientManager.client.addOnReceiveListener(onUpdate)
        refresh()
        return () => ClientManager.client.removeOnReceiveListener(onUpdate)
    }, [profile?.id])
    // profile 加载完成后触发

    const openChatDialogRef = React.useRef<Dialog>(null)
    const openChatInputRef = React.useRef<TextField>(null)
    const onOpenChatEnter = async () => {
        try {
            const chat_id = await ChatApi.resolveChatIdentifier(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                identifier: openChatInputRef.current!.value,
            })
            setActiveChat(await ChatApi.queryChatInfo(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                chat_id,
            }))

            openChatDialogRef.current!.open = false
        } catch (e) {
            tipError(e, '打开对话失败')
        }
    }

    const createGroupDialogRef = React.useRef<Dialog>(null)
    const groupNameInputRef = React.useRef<TextField>(null)
    const groupUniqueInputRef = React.useRef<TextField>(null)
    const createGroupFunc = async () => {
        const title = groupNameInputRef.current?.value?.trim()
        if (!title) {
            showSnackbar({ message: '请输入群组名称' })
            return
        }
        const unique = groupUniqueInputRef.current?.value?.trim() || undefined

        try {
            const chat_id = await ChatApi.createGroup(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                title,
                unique,
            })
            createGroupDialogRef.current!.open = false
            showSnackbar({ message: `创建成功` })
            const chatInfo = await ChatApi.queryChatInfo(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                chat_id: chat_id,
            })
            setActiveChat(chatInfo)

            groupNameInputRef.current!.value = ''
            groupUniqueInputRef.current!.value = ''
        } catch (e) {
            tipError(e, '创建群组失败')
        }
    }

    React.useEffect(() => {
        if (!loadingProfile)
            return
        const snackbar = showSnackbar({
            message: '正在加载资料...',
            autoCloseDelay: 0,
        })
        return () => {
            snackbar.open = false
        }
    }, [loadingProfile])

    return <>
        <mdui-dialog ref={createGroupDialogRef} close-on-overlay-click headline="创建群组">
            <mdui-text-field
                ref={groupNameInputRef}
                placeholder="群组名称 (必填)"
                variant="outlined"
                style={{ width: '100%', marginBottom: '12px' }}
                required
                onKeyDown={(e) => {
                    e.key == "Enter" && groupUniqueInputRef.current!.focus()
                }}
            />
            <mdui-text-field
                ref={groupUniqueInputRef}
                placeholder="群标识符 (可选)"
                variant="outlined"
                style={{ width: '100%', marginBottom: '12px' }}
                onKeyDown={(e) => {
                    e.key == "Enter" && createGroupFunc()
                }}
            />

            <mdui-button slot="action" variant="text" onClick={() => createGroupDialogRef.current!.open = false}>
                取消
            </mdui-button>
            <mdui-button slot="action" variant="text" onClick={() => createGroupFunc()}>创建</mdui-button>
        </mdui-dialog>
        <mdui-dialog ref={openChatDialogRef} close-on-overlay-click headline="打开对话">
            <mdui-text-field
                label="对话标识符 / 用户名 / ID"
                variant="outlined"
                ref={openChatInputRef}
                style={{ width: '100%' }}
                onKeyDown={(e) => {
                    e.key == 'Enter' && onOpenChatEnter()
                }}
                clearable>
            </mdui-text-field>
            <mdui-button variant="text" onClick={() => openChatDialogRef.current!.open = false} slot="action">取消</mdui-button>
            <mdui-button variant="text" onClick={() => onOpenChatEnter()} slot="action">打开</mdui-button>
        </mdui-dialog>
        <mdui-navigation-drawer open ref={drawerRef as any} close-on-overlay-click>
            <mdui-navigation-rail ref={navigationRef} contained alignment="center" value="recent">
                <mdui-dropdown trigger="hover" slot="top">
                    <Avatar slot="trigger" src={profile?.avatar_file_hash ? ClientManager.client.getFileUrlByHashAndToken(profile.avatar_file_hash, AppState.fileAccessToken) : default_avatar} />
                    <mdui-menu>
                        <mdui-menu-item icon="info" onClick={() => UserProfileDialog.show(profile?.id!)}>我的资料</mdui-menu-item>
                        <mdui-menu-item icon="switch_account" onClick={() => SwitchUserDialog.show()}>切换账号</mdui-menu-item>
                        <mdui-menu-item icon="edit" onClick={() => ChangePasswordDialog.show()}>修改密码</mdui-menu-item>
                    </mdui-menu>
                </mdui-dropdown>

                <mdui-dropdown trigger="hover" slot="top">
                    <mdui-button-icon icon="add" slot="trigger"></mdui-button-icon>
                    <mdui-menu>
                        <mdui-menu-item icon="open_in_new" onClick={() => {
                            openChatDialogRef.current!.open = true
                        }}>打开对话</mdui-menu-item>
                        <mdui-menu-item icon="group_add" onClick={() => {
                            createGroupDialogRef.current!.open = true
                        }}>创建群组</mdui-menu-item>
                    </mdui-menu>
                </mdui-dropdown>

                <mdui-navigation-rail-item icon="watch_later--outlined" active-icon="watch_later" value="recent"></mdui-navigation-rail-item>
                <mdui-navigation-rail-item icon="favorite_border" active-icon="favorite" value="favourited"></mdui-navigation-rail-item>
                <mdui-navigation-rail-item icon="chat--outlined" active-icon="chat" value="all"></mdui-navigation-rail-item>
                <mdui-navigation-rail-item icon="search" value="search"></mdui-navigation-rail-item>

                <mdui-button-icon icon="settings" slot="bottom" onClick={() => ClientSettingsDialog.show()}></mdui-button-icon>
            </mdui-navigation-rail>
            <mdui-list style={{ marginLeft: 'calc(5px + 5rem)', marginRight: '5px' }}>
                <mdui-text-field variant="outlined" ref={filterInputRef} placeholder="从中查找..." style={{ width: '100%', display: navigationSelected != 'search' ? undefined : 'none', paddingBottom: '10px' }}></mdui-text-field>
                {
                    ({
                        recent: <>
                            {loadingRecent && <mdui-circular-progress style={{ margin: '10px auto', display: 'block' }} />}
                            {!loadingRecent && recentChats.length === 0 && (
                                <mdui-list-item rounded>暂无对话</mdui-list-item>
                            )}
                            {recentChats.filter(chatFilter).map(chat => <ChatListItem activeChat={activeChat} chat={chat} setActiveChat={setActiveChat} />)}
                        </>,
                        favourited: <>
                            {loadingFavourited && <mdui-circular-progress style={{ margin: '10px auto', display: 'block' }} />}
                            {!loadingFavourited && favouritedChats.length === 0 && (
                                <mdui-list-item rounded>暂无对话</mdui-list-item>
                            )}
                            {favouritedChats.filter(chatFilter).map(chat => <ChatListItem activeChat={activeChat} chat={chat} setActiveChat={setActiveChat} />)}
                        </>,
                        all: <>
                            {loadingAll && <mdui-circular-progress style={{ margin: '10px auto', display: 'block' }} />}
                            {!loadingAll && allChats.length === 0 && (
                                <mdui-list-item rounded>暂无对话</mdui-list-item>
                            )}
                            {allChats.filter(chatFilter).map(chat => <ChatListItem activeChat={activeChat} chat={chat} setActiveChat={setActiveChat} />)}
                        </>,
                        search: <>
                            <mdui-text-field variant="outlined"
                                placeholder="查找我的对话..."
                                value={searchKeyword}
                                onInput={(e: any) => {
                                    const val = e.target.value
                                    setSearchKeyword(val)
                                    debouncedSearch(val)
                                }}
                                style={{ width: '100%', paddingBottom: '10px' }}
                                clearable></mdui-text-field>
                            {searching && <mdui-circular-progress style={{ margin: '20px auto', display: 'block' }} />}
                            {!searching && searchKeyword.trim() !== '' && searchResults.length == 0 && (
                                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--mdui-color-secondary)' }}>
                                    没有找到匹配的对话
                                </div>
                            )}
                            <mdui-list style={{ overflowY: 'auto' }}>
                                {searchResults.map(chat => (
                                    <mdui-list-item
                                        active={activeChat?.id == chat.id}
                                        key={chat.id}
                                        rounded
                                        onClick={() => {
                                            ChatProfileDialog.show(chat.id)
                                            searchChatsDialogRef.current!.open = false
                                        }}
                                        headline={chat.title || '私聊'}>
                                        <Avatar
                                            slot="icon"
                                            src={chat.avatar_file_hash ? ClientManager.client.getFileUrlByHashAndToken(chat.avatar_file_hash, AppState.fileAccessToken) : default_avatar}
                                        />
                                    </mdui-list-item>
                                ))}
                            </mdui-list>
                        </>
                    })[navigationSelected]
                }
            </mdui-list>
        </mdui-navigation-drawer>
        <mdui-layout-main style={{
            flexGrow: 1,
            display: 'flex',
            minWidth: 0,
        }}>
            <div ref={dockRowRef} style={{ display: 'flex', width: '100%', height: '100%', minWidth: 0 }}>
                {meeting.isActive() && meeting.dock && (<>
                    <div style={{ width: meeting.dockWidthPercent + '%', height: '100%', minWidth: 0, flexShrink: 0, display: 'flex' }}>
                        <MeetingPanel mode="docked" />
                    </div>
                    {/* 可拖动分隔条: 调整会议面板与聊天的宽度 */}
                    <div
                        onPointerDown={onDockDividerDown}
                        title="拖动调整大小"
                        style={{
                            width: '6px', flexShrink: 0, cursor: 'col-resize',
                            background: 'rgb(var(--mdui-color-outline-variant))',
                            touchAction: 'none', userSelect: 'none',
                        }}
                    />
                </>)}
                <div style={{ flex: 1, minWidth: 0, display: 'flex' }}>
                    {
                        activeChat
                            ? <ChatFragment chat={activeChat} drawerOpen={drawerOpen} onToggleDrawer={toggleDrawer} />
                            : <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                width: '100%',
                            }}>
                                <mdui-top-app-bar style={{ position: 'relative' }}>
                                    <mdui-button-icon icon={drawerOpen ? 'menu_open' : 'menu'} onClick={toggleDrawer}></mdui-button-icon>
                                    <mdui-top-app-bar-title style={{ marginLeft: '8px' }}>灵猫</mdui-top-app-bar-title>
                                </mdui-top-app-bar>
                                <div style={{
                                    display: 'flex',
                                    flex: 1,
                                    justifyContent: 'center',
                                }}>
                                    <div style={{
                                        alignSelf: 'center',
                                    }}>
                                        打开侧边栏, 选择一个对话以开始聊天喵~
                                    </div>
                                </div>
                            </div>
                    }
                </div>
            </div>
        </mdui-layout-main>
        {meeting.isActive() && !meeting.dock && <MeetingPanel mode="floating" />}
    </>
}
