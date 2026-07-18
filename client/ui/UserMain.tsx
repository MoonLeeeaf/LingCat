import { Dialog, NavigationDrawer, TextField } from "mdui"
import Message from "./chat-layout/Message.tsx"
import MessageContainer from "./chat-layout/MessageContainer.tsx"
import React from "react"
import default_avatar from '../default_avatar.png'
import { IChat, IMessage, IUser, Methods, Package } from "lingcat-protocol"
import UserProfileDialog from "./UserProfileDialog.tsx"
import ClientManager from "../ClientManager.ts"
import { ChatApi, FileApi, UserApi } from "lingcat-client-protocol"
import { Virtuoso } from "react-virtuoso"
import ChatMessage from "./chat/ChatMessage.tsx"
import ChatFragment from "./chat/ChatFragment.tsx"
import Avatar from "./Avatar.tsx"
import AppState from "./AppState.ts"
import tipError from "./tipError.ts"
import ChatProfileDialog from "./ChatProfileDialog.tsx"
import showSnackbar from "./showSnackbar.ts"

function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) {
    let timer: NodeJS.Timeout
    return (...args: Parameters<T>) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}

function ChatListItem({ chat, setActiveChat }: { chat: IChat, setActiveChat: Function }) {
    return <mdui-dropdown trigger="hover">
        <mdui-list-item
            slot='trigger'
            key={chat.id}
            rounded
            onClick={() => {
                setActiveChat(chat)
                // drawerRef.current && (drawerRef.current.open = false) // 移动端关闭抽屉
            }}
            headline={chat.title || ''}
            description={chat.last_message_text}>
            <Avatar
                slot="icon"
                src={chat.avatar_file_hash ? ClientManager.client.getFileUrlByHash(chat.avatar_file_hash) : default_avatar}
            />
        </mdui-list-item>
        <mdui-menu>
            <mdui-menu-item onClick={() => ChatProfileDialog.show(chat.id)} icon="info">对话信息</mdui-menu-item>
        </mdui-menu>
    </mdui-dropdown>
}

export default function UserMain({ profile, setProfile, drawerRef, mSettingsDialog, mLoginDialog }: { profile: IUser | undefined, setProfile: (a: IUser) => void, drawerRef: React.RefObject<NavigationDrawer | undefined>, mSettingsDialog: React.RefObject<Dialog | undefined>, mLoginDialog: React.RefObject<Dialog | undefined> }) {
    React.useEffect(() => {
        ; (async () => {
            ClientManager.initClient(ClientManager.getActiveUserSessionName()!)
            ClientManager.client.onInit = async () => {
                try {
                    await UserApi.authorize(ClientManager.client, {
                        access_token: ClientManager.getActiveUserSession().token,
                        session_id: 'client-' + Date.now() + '-' + navigator.userAgent
                    })

                    const updateFileAccessToken = async () => {
                        document.cookie = "file_access_token=" + await FileApi.requestAccessUploadFileToken(ClientManager.client, {
                            access_token: ClientManager.getActiveUserSession().token
                        }) + ';'
                    }
                    const id = setInterval(updateFileAccessToken, 1000 * 60 * 60 * 0.5)
                    await updateFileAccessToken()
                    ClientManager.client.client?.addEventListener('close', () => clearInterval(id))

                    setProfile(await ClientManager.getMe())
                } catch (e) {
                    tipError(e, "验证用户失败, 请重新登录")
                    mLoginDialog.current!.open = true
                }
            }
        })()
    }, [setProfile])

    const [activeChat, setActiveChat] = React.useState<IChat>()
    AppState.setActiveChat = setActiveChat

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
    // const [refreshTime, setRefreshTime] = React.useState(Date.now())

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

    const addFavouriteChatDialogRef = React.useRef<Dialog>(null)
    const addFavouriteChatInputRef = React.useRef<TextField>(null)

    return <>
        <mdui-dialog ref={addFavouriteChatDialogRef} close-on-overlay-click headline="添加收藏对话">
            <mdui-text-field
                placeholder="输入对话标识符 / ID 或用户名 / ID"
                variant="outlined"
                ref={addFavouriteChatInputRef}
                style={{ width: '100%' }}
                clearable>
                <mdui-button-icon slot="end-icon" icon="add" onClick={async () => {
                    try {
                        const chat_id = await ChatApi.resolveChatIdentifier(ClientManager.client, {
                            access_token: ClientManager.getActiveUserSession().token,
                            identifier: addFavouriteChatInputRef.current!.value,
                        })
                        await ChatApi.setChatFavourited(ClientManager.client, {
                            access_token: ClientManager.getActiveUserSession().token,
                            chat_id,
                            favourited: true,
                        })

                        addFavouriteChatDialogRef.current!.open = false
                        showSnackbar({
                            message: "成功"
                        })
                    } catch (e) {
                        tipError(e, '添加收藏对话失败')
                    }
                }}></mdui-button-icon>
            </mdui-text-field>
            <mdui-button variant="text" onClick={() => addFavouriteChatDialogRef.current!.open = false} slot="action">取消</mdui-button>
        </mdui-dialog>
        <mdui-dialog ref={searchChatsDialogRef} close-on-overlay-click headline="搜索对话">
            <mdui-text-field
                placeholder="输入对话名称或对话 ID"
                variant="outlined"
                value={searchKeyword}
                onInput={(e: any) => {
                    const val = e.target.value
                    setSearchKeyword(val)
                    debouncedSearch(val)
                }}
                style={{ width: '100%', marginBottom: '16px' }}
                clearable
            >
                <mdui-icon slot="icon" name="search"></mdui-icon>
            </mdui-text-field>

            {searching && <mdui-circular-progress style={{ margin: '20px auto', display: 'block' }} />}

            {!searching && searchKeyword.trim() !== '' && searchResults.length === 0 && (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--mdui-color-secondary)' }}>
                    没有找到匹配的对话
                </div>
            )}

            <mdui-list style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {searchResults.map(chat => (
                    <mdui-list-item
                        key={chat.id}
                        rounded
                        onClick={() => {
                            ChatProfileDialog.show(chat.id)
                            searchChatsDialogRef.current!.open = false
                        }}
                        headline={chat.title || '私聊'}>
                        <Avatar
                            slot="icon"
                            src={chat.avatar_file_hash ? ClientManager.client.getFileUrlByHash(chat.avatar_file_hash) : default_avatar}
                        />
                    </mdui-list-item>
                ))}
            </mdui-list>
            <mdui-button variant="text" onClick={() => searchChatsDialogRef.current!.open = false} slot="action">取消</mdui-button>
        </mdui-dialog>
        <mdui-navigation-drawer open ref={drawerRef as any} close-on-overlay-click>
            <mdui-list style={{ marginLeft: '10px' }}>
                <mdui-list-item rounded onClick={() => UserProfileDialog.show(profile?.id!)} headline={profile?.nickname}>
                    <Avatar slot="icon" src={profile?.avatar_file_hash ? ClientManager.client.getFileUrlByHash(profile.avatar_file_hash) : default_avatar} />
                </mdui-list-item>
                <mdui-list-item rounded icon="settings" onClick={() => mSettingsDialog.current!.open = true}>
                    客户端设置
                </mdui-list-item>
                <mdui-list-item rounded icon="search" onClick={() => {
                    searchChatsDialogRef.current!.open = true
                }}>
                    搜索对话
                </mdui-list-item>
                {/* <mdui-list-item rounded icon="refresh" onClick={async () => {
                    setRefreshTime(Date.now())
                }}>
                    刷新列表
                </mdui-list-item> */}
                <mdui-list-item rounded icon="add" onClick={() => {
                    addFavouriteChatDialogRef.current!.open = true
                }}>
                    添加收藏
                </mdui-list-item>
                <mdui-collapse value="recents">
                    <mdui-collapse-item value="recents">
                        <mdui-list-item rounded slot="header" icon="access_time">最近对话
                        </mdui-list-item>
                        <div style={{ marginLeft: '2.5rem' }}>
                            {loadingRecent && <mdui-circular-progress style={{ margin: '10px auto', display: 'block' }} />}
                            {!loadingRecent && recentChats.length === 0 && (
                                <mdui-list-item rounded>暂无对话</mdui-list-item>
                            )}
                            {recentChats.map(chat => <ChatListItem chat={chat} setActiveChat={setActiveChat} />)}
                        </div>
                    </mdui-collapse-item>
                    <mdui-collapse-item value="favourites">
                        <mdui-list-item rounded slot="header" icon="favorite">收藏对话</mdui-list-item>
                        <div style={{ marginLeft: '2.5rem' }}>
                            {loadingFavourited && <mdui-circular-progress style={{ margin: '10px auto', display: 'block' }} />}
                            {!loadingFavourited && favouritedChats.length === 0 && (
                                <mdui-list-item rounded>暂无对话</mdui-list-item>
                            )}
                            {favouritedChats.map(chat => <ChatListItem chat={chat} setActiveChat={setActiveChat} />)}
                        </div>
                    </mdui-collapse-item>
                    <mdui-collapse-item value="all">
                        <mdui-list-item rounded slot="header" icon="chat">全部对话</mdui-list-item>
                        <div style={{ marginLeft: '2.5rem' }}>
                            {loadingAll && <mdui-circular-progress style={{ margin: '10px auto', display: 'block' }} />}
                            {!loadingAll && allChats.length === 0 && (
                                <mdui-list-item rounded>暂无对话</mdui-list-item>
                            )}
                            {allChats.map(chat => <ChatListItem chat={chat} setActiveChat={setActiveChat} />)}
                        </div>
                    </mdui-collapse-item>
                </mdui-collapse>
            </mdui-list>
        </mdui-navigation-drawer>
        <mdui-layout-main style={{
            flexGrow: 1,
            display: 'flex'
        }}>
            {
                activeChat
                    ? <ChatFragment chat={activeChat} drawerRef={drawerRef} />
                    : <div style={{
                        display: 'flex',
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
