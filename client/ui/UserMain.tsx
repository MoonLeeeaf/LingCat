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
        let hidden = false
        const onVisibilityChange = () => {
            if (document.hidden) {
                hidden = true
            } else {
                hidden = false
            }
        }
        document.addEventListener('visibilitychange', onVisibilityChange)

        async function callback(mPackage: Package) {
            if (!("Notification" in window) || Notification.permission == "denied") return
            // TODO: 向 lingcat-client-protocol 添加全局的监听方法
            if (mPackage.method_id == Methods.Receive_Chat_Message_Event) {
                const raw = LingCatProto.methods.Receive_Chat_Message_Event.decode(mPackage.data).msg

                const myId = (await ClientManager.getMe()).id
                if (raw?.senderUserId == myId) return
                if (activeChat?.id == raw?.chatId && !hidden) return

                const chat = await ProfileCache.queryChatInfo(raw?.chatId!)
                const sender = raw?.senderUserId ? await ProfileCache.queryUserInfo(raw?.senderUserId) : undefined

                console.log(new RegExp(`\!\[UserMention=.*?\](lingcat://user\?id=${myId})`).test(raw?.text || ''))
                if (chat.type == 'private')
                    new Notification(chat.title + " | 灵猫", {
                        body: (raw?.system ? '' : (sender?.nickname + ': ')) + raw?.text || '',
                        icon: chat.avatar_file_hash ? ClientManager.client.getFileUrlByHashAndToken(chat.avatar_file_hash, AppState.fileAccessToken) : default_avatar,
                    }).onclick = async () => {
                        setActiveChat(await ProfileCache.queryChatInfo(raw?.chatId!))
                    }
                else if (new RegExp(`!\\[UserMention=?.*?\\]\\(lingcat://user\\?id=${myId}\\)`).test(raw?.text || ''))
                    new Notification(chat.title + " | 灵猫", {
                        body: (raw?.system ? '' : (sender?.nickname + ': ')) + raw?.text || '',
                        icon: raw?.senderUserId
                            ? (sender?.avatar_file_hash ? ClientManager.client.getFileUrlByHashAndToken(sender.avatar_file_hash, AppState.fileAccessToken) : default_avatar)
                            : (chat.avatar_file_hash ? ClientManager.client.getFileUrlByHashAndToken(chat.avatar_file_hash, AppState.fileAccessToken) : default_avatar),
                    }).onclick = async () => {
                        setActiveChat(await ProfileCache.queryChatInfo(raw?.chatId!))
                    }
            }
        }

        ClientManager.client.addOnReceiveListener(callback)
        return () => {
            ClientManager.client.removeOnReceiveListener(callback)
            document.removeEventListener('visibilitychange', onVisibilityChange)
        }
    }, [])

    const [activeChat, setActiveChat] = React.useState<IChat>()
    AppState.setActiveChat = setActiveChat

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
            setLoadingAll(true)
            setLoadingRecent(true)
            setLoadingFavourited(true)
            try {
                const token = ClientManager.getActiveUserSession().token;
                const all = await ChatApi.getMyChats(ClientManager.client, {
                    access_token: token,
                    limit: 1000,
                })
                setAllChats(all)
                setRecentChats(all.slice(0, 50))
                const fav = await ChatApi.getMyFavouriteChats(ClientManager.client, {
                    access_token: token,
                    // limit: 50,
                })
                setFavouritedChats(fav)
                AppState.favouritedChats = fav
            } catch (e) {
                tipError(e, '刷新对话列表失败')
            } finally {
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
        }}>
            {
                activeChat
                    ? <ChatFragment chat={activeChat} drawerRef={drawerRef} />
                    : <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                    }}>
                        <mdui-top-app-bar style={{ position: 'relative' }}>
                            <mdui-button-icon icon="menu" onClick={() => {
                                drawerRef.current && (drawerRef.current.open = !drawerRef.current.open)
                            }}></mdui-button-icon>
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
        </mdui-layout-main>
    </>
}
