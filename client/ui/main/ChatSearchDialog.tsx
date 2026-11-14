import ReactClient from 'react-dom/client'
import React from 'react'
import { Dialog, TextField } from 'mdui'
import type { IChat } from 'lingcat-protocol'
import { ChatApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import default_avatar from '../../default_avatar.png'
import getFileUrl from '../../lib/getFileUrl.ts'
import SessionEnv from '../../SessionEnv.ts'
import Avatar from '../Avatar.tsx'
import ChatProfileDialog from '../viewer/ChatProfileDialog.tsx'
import tipError from '../tipError.ts'
import RemarksCache from '../../RemarksCache.ts'
import SearchFeedback from './SearchFeedback.tsx'

interface ChatSearchDialogProps {
    ref?: React.RefObject<Dialog | undefined>
    onClose?: () => void
}

export default function ChatSearchDialog({ ref, onClose }: ChatSearchDialogProps) {
    ref = ref || React.useRef<Dialog | undefined>(undefined)

    const inputRef = React.useRef<TextField>(null)
    const [keyword, setKeyword] = React.useState('')
    const [results, setResults] = React.useState<IChat[]>([])
    const [searching, setSearching] = React.useState(false)

    // 打开弹窗并聚焦输入框
    React.useEffect(() => {
        const el = ref.current
        if (!el) return
        let cancelled = false

        const handleClosed = (e: Event) => {
            if (e.target !== el) return
            onClose?.()
        }
        el.addEventListener('closed', handleClosed)

        el.updateComplete.then(() => {
            if (cancelled) return
            requestAnimationFrame(() => {
                if (cancelled) return
                el.open = true
                inputRef.current?.focus()
            })
        })

        return () => {
            cancelled = true
            el.removeEventListener('closed', handleClosed)
        }
    }, [onClose])

    // 关键词变化后防抖搜索
    React.useEffect(() => {
        const kw = keyword.trim()
        if (!kw) {
            setResults([])
            setSearching(false)
            return
        }

        let cancelled = false
        setSearching(true)
        const timer = window.setTimeout(async () => {
            try {
                const client = ClientManager.getActiveClient()
                const session = ClientManager.getActiveSession()
                if (!client || !session) return
                const chats = await ChatApi.searchMyChats(client, {
                    access_token: session.token,
                    keyword: kw,
                })
                if (!cancelled) setResults(chats)
            } catch (e) {
                if (!cancelled) {
                    tipError(e, '搜索失败')
                    setResults([])
                }
            } finally {
                if (!cancelled) setSearching(false)
            }
        }, 300)

        return () => {
            cancelled = true
            window.clearTimeout(timer)
        }
    }, [keyword])

    const openProfile = (chatId: string) => {
        ref.current!.open = false
        // 等搜索弹窗关闭、卸载后再打开对话信息。
        window.setTimeout(() => ChatProfileDialog.show(chatId), 0)
    }

    return (
        <mdui-dialog ref={ref as any} close-on-overlay-click close-on-esc headline="搜索对话">
            <mdui-text-field
                variant="outlined"
                placeholder="搜索对话标题、标识符或用户..."
                ref={inputRef as any}
                value={keyword}
                onInput={(e: React.FormEvent) => {
                    setKeyword((e.target as TextField).value)
                }}
                style={{ width: '100%' }}
                clearable
            />

            <div style={{ marginTop: '10px', maxHeight: '50vh', overflowY: 'auto', minHeight: '80px' }}>
                <SearchFeedback
                    busy={searching}
                    count={results.length}
                    hasQuery={!!keyword.trim()}
                    emptyText="输入关键词查找对话"
                />
                {!searching && keyword.trim() && results.map(chat => {
                    const remark = chat.peer_user_id ? RemarksCache.get(chat.peer_user_id) : undefined
                    return (
                        <mdui-list-item
                            key={chat.id}
                            rounded
                            onClick={() => openProfile(chat.id)}
                            headline={remark || chat.title || '私聊'}
                        >
                            <Avatar
                                slot="icon"
                                src={chat.avatar_file_hash
                                    ? getFileUrl(chat.avatar_file_hash, SessionEnv.myFileAccessToken)
                                    : default_avatar}
                            />
                            <span slot="description">{chat.last_message_text}</span>
                        </mdui-list-item>
                    )
                })}
            </div>
        </mdui-dialog>
    )
}

ChatSearchDialog.show = function () {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = ReactClient.createRoot(container)

    const onClose = () => {
        root.unmount()
        container.remove()
    }
    root.render(<ChatSearchDialog onClose={onClose} />)
}
