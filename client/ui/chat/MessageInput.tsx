import React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TextField } from 'mdui'
import { MessageParser, ChatApi } from 'lingcat-client-protocol'
import type { IMessage, IMessageEntity, IUser } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'
import escapeHtml from '../../lib/escapeHtml.ts'
import { useChatFileUpload } from './useChatFileUpload.ts'
import { useAudioRecorder } from './useAudioRecorder.ts'
import { useChatAudioStore } from './chatAudioStore.ts'
import { useE2EStore } from '../../lib/e2e/useE2EStore.ts'
import { UnlockPasswordDialog } from '../e2e/UnlockPasswordDialog.tsx'
import Avatar from '../Avatar.tsx'
import RemarksCache from '../../RemarksCache.ts'
import SessionEnv from '../../SessionEnv.ts'
import getFileUrl from '../../lib/getFileUrl.ts'
import default_avatar from '../../default_avatar.png'

// ============================================================
//                  contenteditable 光标 / @提及 工具
// ============================================================

function getPatchedInput(inputRef: React.RefObject<TextField | null>) {
    return inputRef.current?.shadowRoot?.querySelector('[part=input]') as any
}

function getCaretOffset(div: HTMLDivElement): number {
    const sel = window.getSelection()
    if (!sel || sel.rangeCount === 0) return (div.textContent || '').length
    const range = sel.getRangeAt(0)
    if (!div.contains(range.endContainer)) return (div.textContent || '').length
    const pre = range.cloneRange()
    pre.selectNodeContents(div)
    pre.setEnd(range.endContainer, range.endOffset)
    return pre.toString().length
}

function setCaretOffset(div: HTMLDivElement, offset: number) {
    div.focus()
    const node = div.firstChild
    const range = document.createRange()
    if (node && node.nodeType === Node.TEXT_NODE) {
        range.setStart(node, Math.max(0, Math.min(offset, (node.textContent || '').length)))
    } else {
        range.selectNodeContents(div)
    }
    range.collapse(true)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
}

/** 发送时把文本里命中的 @用户名/@昵称/@备注 补成 user_mention 实体 */
function buildMentionEntities(text: string, existing: IMessageEntity[], members: IUser[]): IMessageEntity[] {
    const occupied = [...existing]
    const result: IMessageEntity[] = []
    const overlaps = (s: number, e: number) => occupied.some((x) => s < x.offset + x.length && e > x.offset)
    const isBoundary = (ch: string) => !ch || !/\w/.test(ch)

    for (const m of members) {
        const remark = RemarksCache.get(m.id) || ''
        const names = Array.from(new Set([m.username || '', m.nickname || '', remark].filter(Boolean)))
        for (const name of names) {
            const token = '@' + name
            let idx = text.indexOf(token)
            while (idx >= 0) {
                const end = idx + token.length
                const before = idx === 0 ? '' : text[idx - 1]
                const after = end >= text.length ? '' : text[end]
                if (isBoundary(before) && isBoundary(after) && !overlaps(idx, end)) {
                    const e: IMessageEntity = { type: 'user_mention', offset: idx, length: token.length, data: m.id }
                    result.push(e)
                    occupied.push(e)
                }
                idx = text.indexOf(token, idx + 1)
            }
        }
    }
    return [...existing, ...result]
}

export interface MessageInputHandle {
    insertText: (text: string) => void
    focus: () => void
}

export interface MessageInputProps {
    chatId: string
    chatTitle: string
    peerUserId?: string
    editingMessage: IMessage | null
    onEditCancel: () => void
    onEditDone: () => void
    /** 仅群聊开启 @ 成员补全 */
    enableMentions?: boolean
}

function formatDuration(sec: number) {
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

export const MessageInput = React.forwardRef<MessageInputHandle, MessageInputProps>(
    function MessageInput({ chatId, chatTitle, peerUserId, editingMessage, onEditCancel, onEditDone, enableMentions }, ref) {
        const inputRef = React.useRef<TextField>(null)
        const attachFileInputRef = React.useRef<HTMLInputElement>(null)
        const [isSending, setIsSending] = React.useState(false)
        const [hasContent, setHasContent] = React.useState(false)
        const [sendVersion, setSendVersion] = React.useState(0)
        const sendPendingRef = React.useRef(false)

        // 同时覆盖键盘输入、粘贴、文件/引用插入和编辑回填。
        React.useEffect(() => {
            let observer: MutationObserver | undefined
            let raf = 0
            const syncContent = () => setHasContent(!!inputRef.current?.value?.trim())
            const bind = () => {
                const div = getPatchedInput(inputRef)?.inputDiv as HTMLDivElement | undefined
                if (!div) {
                    raf = requestAnimationFrame(bind)
                    return
                }
                syncContent()
                observer = new MutationObserver(syncContent)
                observer.observe(div, { childList: true, characterData: true, subtree: true })
            }
            bind()
            return () => {
                cancelAnimationFrame(raf)
                observer?.disconnect()
            }
        }, [])
        const preEditValueRef = React.useRef('')

        // E2E 状态
        const e2eStatus = useE2EStore(s => s.status)
        const peerKeys = useE2EStore(s => s.peerKeys)
        const encryptForPeer = useE2EStore(s => s.encryptForPeer)
        const fetchPeerKeys = useE2EStore(s => s.fetchPeerKeys)
        const decryptFromPeer = useE2EStore(s => s.decryptFromPeer)

        // ★ 加密开关：默认为 true（只要有 peerUserId 且对方有公钥）
        const [isEncryptMode, setIsEncryptMode] = React.useState(true)

        // ★ 核心修复：判断是否具备 E2E 的条件
        // 必须满足：是私聊 + 对方有公钥 + 我的状态是已解锁或已获取密钥包
        const hasPeerKey = peerUserId ? !!peerKeys[peerUserId] : false
        const canE2E = hasPeerKey && (e2eStatus === 'locked' || e2eStatus === 'unlocked')

        // ============================================================
        //  insertText（供外部通过 ref 调用）
        // ============================================================
        const insertText = React.useCallback((text: string) => {
            const input = inputRef.current?.shadowRoot?.querySelector('[part=input]') as any
            if (!input) return
            if (typeof input.insertHtml === 'function') {
                input.insertHtml(escapeHtml(text))
            } else {
                inputRef.current!.value = (inputRef.current!.value ?? '') + text
            }
        }, [])

        React.useImperativeHandle(ref, () => ({
            insertText,
            focus: () => inputRef.current?.focus(),
        }), [insertText])

        // ============================================================
        //  群聊 @ 成员补全
        // ============================================================
        const [mentionQuery, setMentionQuery] = React.useState<{ at: number; query: string } | null>(null)
        const [mentionIndex, setMentionIndex] = React.useState(0)
        const [members, setMembers] = React.useState<IUser[]>([])
        const membersRef = React.useRef<IUser[]>([])
        const membersLoadedRef = React.useRef(false)
        const loadingMembersRef = React.useRef(false)
        /** 当前 @ 片段的签名, 用于避免方向键移动光标时重置选中项 */
        const mentionSignatureRef = React.useRef('')

        const closeMentions = React.useCallback(() => {
            mentionSignatureRef.current = ''
            setMentionQuery(null)
            setMentionIndex(0)
        }, [])

        // 切换会话时重置成员缓存
        React.useEffect(() => {
            membersRef.current = []
            membersLoadedRef.current = false
            setMembers([])
            closeMentions()
        }, [chatId, closeMentions])

        const ensureMembers = React.useCallback(async () => {
            if (!enableMentions || membersLoadedRef.current || loadingMembersRef.current) return
            const client = ClientManager.getActiveClient()
            const session = ClientManager.getActiveSession()
            if (!client || !session) return
            loadingMembersRef.current = true
            try {
                const list = await ChatApi.getChatMembers(client, {
                    access_token: session.token,
                    chat_id: chatId,
                })
                membersRef.current = list
                setMembers(list)
                membersLoadedRef.current = true
            } catch {
                // 拉取失败保持静默, 下次再试
            } finally {
                loadingMembersRef.current = false
            }
        }, [enableMentions, chatId])

        const updateMentions = React.useCallback(() => {
            if (!enableMentions) {
                closeMentions()
                return
            }
            const patched = getPatchedInput(inputRef)
            const div = patched?.inputDiv as HTMLDivElement | undefined
            if (!div) return
            const value = inputRef.current?.value ?? ''
            const caret = getCaretOffset(div)
            const before = value.slice(0, caret)
            // 前面是非单词字符(空格/标点/中文等)或行首, 且 @ 后没有空格
            const m = before.match(/(^|[^\w])@([^\s@]{0,32})$/)
            if (!m) {
                closeMentions()
                return
            }
            const query = m[2]
            const at = caret - query.length - 1
            const sig = `${at}:${query}`
            if (mentionSignatureRef.current !== sig) {
                mentionSignatureRef.current = sig
                setMentionIndex(0)
            }
            setMentionQuery({ at, query })
            void ensureMembers()
        }, [enableMentions, closeMentions, ensureMembers])

        // 监听 contenteditable 的输入/光标移动
        React.useEffect(() => {
            if (!enableMentions) return
            let div: HTMLDivElement | undefined
            let disposed = false
            let timer: ReturnType<typeof setInterval> | undefined

            const bind = () => {
                const patched = getPatchedInput(inputRef)
                div = patched?.inputDiv as HTMLDivElement | undefined
                if (!div || disposed) return false
                div.addEventListener('input', updateMentions)
                div.addEventListener('keyup', updateMentions)
                div.addEventListener('mouseup', updateMentions)
                div.addEventListener('blur', closeMentions)
                return true
            }

            if (!bind()) {
                timer = setInterval(() => {
                    if (bind()) clearInterval(timer)
                }, 100)
            }

            return () => {
                disposed = true
                if (timer) clearInterval(timer)
                if (div) {
                    div.removeEventListener('input', updateMentions)
                    div.removeEventListener('keyup', updateMentions)
                    div.removeEventListener('mouseup', updateMentions)
                    div.removeEventListener('blur', closeMentions)
                }
            }
        }, [enableMentions, updateMentions, closeMentions])

        const mentionCandidates = React.useMemo(() => {
            if (!mentionQuery) return []
            const q = mentionQuery.query.toLowerCase()
            return members
                .map((m) => {
                    const remark = RemarksCache.get(m.id) || ''
                    const username = m.username || ''
                    const nickname = m.nickname || ''
                    const display = remark || nickname || username || m.id
                    const hay = [username, nickname, remark].map((s) => s.toLowerCase()).filter(Boolean)
                    let score = 0
                    for (const h of hay) {
                        if (!q) score = Math.max(score, 1)
                        else if (h.startsWith(q)) score = Math.max(score, 3)
                        else if (h.includes(q)) score = Math.max(score, 2)
                    }
                    return { m, display, username, nickname, score }
                })
                .filter((x) => x.score > 0)
                .sort((a, b) => b.score - a.score || a.display.localeCompare(b.display, 'zh-CN'))
                .slice(0, 8)
        }, [mentionQuery, members])

        const insertMention = React.useCallback((m: IUser) => {
            if (!mentionQuery) return
            const field = inputRef.current
            if (!field) return
            const name = (m.username || RemarksCache.get(m.id) || m.nickname || '').trim()
            if (!name) return
            const token = '@' + name + ' '
            const value = field.value ?? ''
            const from = mentionQuery.at
            const to = Math.min(value.length, mentionQuery.at + 1 + mentionQuery.query.length)
            field.value = value.slice(0, from) + token + value.slice(to)
            closeMentions()
            const caret = from + token.length
            requestAnimationFrame(() => {
                const patched = getPatchedInput(inputRef)
                const div = patched?.inputDiv as HTMLDivElement | undefined
                if (div) setCaretOffset(div, caret)
            })
        }, [mentionQuery, closeMentions])

        const activeMentionIndex = mentionCandidates.length > 0
            ? Math.min(mentionIndex, mentionCandidates.length - 1)
            : 0

        // ============================================================
        //  附件上传 & 录音
        // ============================================================
        const { addFile, uploadAll, countInText, clear: clearFiles } = useChatFileUpload({ onInsertText: insertText })

        const { isRecording, seconds, toggle: toggleRecording, stop: stopRecording } = useAudioRecorder({
            onRecorded: async (blob, mime, name) => {
                try {
                    await addFile(mime, name, blob)
                } catch (e) {
                    tipError(e, '添加语音失败')
                }
            },
        })

        const handleToggleRecording = () => {
            if (!isRecording) useChatAudioStore.getState().pause()
            toggleRecording()
        }

        // ============================================================
        //  初始化：拉取对方公钥，决定默认开关状态
        // ============================================================
        React.useEffect(() => {
            if (peerUserId) {
                fetchPeerKeys([peerUserId])
            }
        }, [peerUserId, fetchPeerKeys])

        // 当 canE2E 变为可用时，默认打开加密（如果用户没手动关过）
        React.useEffect(() => {
            if (canE2E) {
                setIsEncryptMode(true)
            } else {
                setIsEncryptMode(false)
            }
        }, [canE2E])

        // ============================================================
        //  编辑模式：解密并同步到输入框
        // ============================================================
        React.useEffect(() => {
            if (editingMessage) {
                preEditValueRef.current = inputRef.current?.value ?? ''

                const isE2E = editingMessage.entities?.some(e => e.type === 'e2e')
                const e2eEntity = editingMessage.entities?.find(e => e.type === 'e2e')

                if (isE2E && e2eEntity?.data) {
                    setIsEncryptMode(true)
                    // 异步解密
                    decryptFromPeer(e2eEntity.data, editingMessage.sender_user_id!).then(plainJson => {
                        if (plainJson) {
                            try {
                                const parsed = JSON.parse(plainJson)
                                inputRef.current!.value = MessageParser.entitiesToRawRichText(
                                    parsed.text,
                                    parsed.entities ?? [],
                                )
                            } catch {
                                inputRef.current!.value = plainJson
                            }
                        }
                    })
                } else {
                    setIsEncryptMode(false) // 原文是明文，默认切到明文
                    inputRef.current!.value = MessageParser.entitiesToRawRichText(
                        editingMessage.text,
                        editingMessage.entities ?? [],
                    )
                }
                inputRef.current?.focus()
            }
        }, [editingMessage?.id, decryptFromPeer])

        const cancelEdit = () => {
            inputRef.current!.value = preEditValueRef.current
            onEditCancel()
        }

        // ============================================================
        //  核心发送逻辑：实际执行发送
        // ============================================================
        const executeSend = async (textToSend: string) => {
            const client = ClientManager.getActiveClient()
            const session = ClientManager.getActiveSession()
            if (!client || !session) return

            const fileCount = countInText(textToSend)
            const snack = showSnackbar({ message: `发送到 [${chatTitle}]...`, autoCloseDelay: 0 })
            let tick = 1
            let uploaded = 0
            const timer = setInterval(() => {
                if (uploaded < fileCount) snack.textContent = `上传第 ${uploaded}/${fileCount} 个文件... (${tick}s)`
                else snack.textContent = `发送到 [${chatTitle}]... (${tick}s)`
                tick++
            }, 1000)

            const onClose = () => { clearInterval(timer); snack.open = false }
            client.client?.addEventListener('close', onClose)

            try {
                setIsSending(true)

                let finalText = textToSend
                if (fileCount > 0) {
                    finalText = await uploadAll(finalText)
                    uploaded = fileCount
                }

                const parsed = MessageParser.parseMessage(finalText)
                let sendText = parsed.text
                let sendEntities: IMessageEntity[] = parsed.entities ?? []

                // 群聊: 把文本里命中的 @用户名/@昵称/@备注 补成 user_mention 实体
                if (enableMentions) {
                    if (!membersLoadedRef.current && parsed.text.includes('@')) {
                        await ensureMembers()
                    }
                    if (membersRef.current.length > 0) {
                        sendEntities = buildMentionEntities(parsed.text, sendEntities, membersRef.current)
                    }
                }

                // E2E 加密
                if (isEncryptMode && peerUserId) {
                    const rawPayload = JSON.stringify({
                        text: parsed.text,
                        entities: sendEntities
                    })
                    const entityJson = await encryptForPeer(rawPayload, peerUserId)
                    if (!entityJson) throw new Error('加密失败')

                    sendText = '🔒'
                    sendEntities = [{ type: 'e2e', offset: 0, length: 1, data: entityJson }]
                }

                // 发送或编辑
                if (editingMessage) {
                    await ChatApi.editChatMessage(client, {
                        access_token: session.token,
                        chat_id: chatId,
                        message_id: editingMessage.id,
                        text: sendText,
                        entities: sendEntities,
                    })
                    onEditDone()
                } else {
                    await ChatApi.sendChatMessage(client, {
                        access_token: session.token,
                        chat_id: chatId,
                        text: sendText,
                        entities: sendEntities,
                    })
                }

                clearFiles()
                inputRef.current!.value = ''
            } catch (e) {
                tipError(e, editingMessage ? '编辑失败' : '发送失败')
            } finally {
                setIsSending(false)
                onClose()
                client.client?.removeEventListener('close', onClose)
            }
        }

        // ============================================================
        //  发送入口：检查状态并处理未解锁的情况
        // ============================================================
        const send = async () => {
            if (sendPendingRef.current || isSending) return
            const text = inputRef.current?.value ?? ''
            if (!text.trim()) return
            sendPendingRef.current = true
            setSendVersion(version => version + 1)
            setIsSending(true)
            if (isRecording) stopRecording()

            try {
                if (isEncryptMode && peerUserId) {
                    await fetchPeerKeys([peerUserId])
                    const currentPeerKey = useE2EStore.getState().peerKeys[peerUserId]

                    if (!currentPeerKey) {
                        setIsEncryptMode(false)
                        showSnackbar({ message: '对方未开启端到端加密，将以明文发送' })
                        await executeSend(text)
                        return
                    }
                    if (e2eStatus !== 'unlocked') {
                        UnlockPasswordDialog.show('unlock', () => { void executeSend(text) })
                        return
                    }
                }
                await executeSend(text)
            } finally {
                sendPendingRef.current = false
                setIsSending(false)
            }
        }

        // ============================================================
        //  文件选择 / 粘贴 / 拖拽
        // ============================================================
        const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files
            if (!files || files.length === 0) return
            for (const file of Array.from(files)) {
                addFile(file.type, file.name, file)
            }
            e.target.value = ''
        }

        const handlePaste = (e: React.ClipboardEvent) => {
            for (const item of e.clipboardData.items) {
                if (item.kind === 'file') {
                    const file = item.getAsFile()
                    if (file) {
                        e.preventDefault()
                        addFile(file.type, file.name, file)
                    }
                }
            }
        }

        const handleDrop = (e: React.DragEvent) => {
            e.preventDefault()
            for (const item of e.dataTransfer.items) {
                if (item.kind === 'file') {
                    const file = item.getAsFile()
                    if (file) addFile(item.type, file.name, file)
                }
            }
        }

        return (
            <>
                <input
                    type="file"
                    ref={attachFileInputRef}
                    accept="*/*"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleFilePick}
                />

                <AnimatePresence initial={false}>
                    {editingMessage && (
                        <motion.div
                            key="editing"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                            style={{
                                display: 'flex', alignItems: 'center',
                                padding: '6px 12px',
                                background: 'rgba(var(--mdui-color-primary), 0.08)',
                                borderLeft: '3px solid rgb(var(--mdui-color-primary))',
                                margin: '0 4px', borderRadius: '4px',
                            }}>
                            <span style={{ flex: 1, fontSize: '90%', opacity: 0.8 }}>正在编辑消息</span>
                            <mdui-button-icon icon="close" onClick={cancelEdit} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence initial={false}>
                    {isRecording && (
                        <motion.div
                            key="recording"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.16, ease: 'easeOut' }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '6px 12px',
                                background: 'rgba(var(--mdui-color-error), 0.08)',
                                borderLeft: '3px solid rgb(var(--mdui-color-error))',
                                margin: '0 4px', borderRadius: '4px',
                            }}>
                            <style>{`@keyframes lingcat-pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
                            <span style={{
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: 'rgb(var(--mdui-color-error))',
                                animation: 'lingcat-pulse 1s infinite',
                            }} />
                            <span style={{ flex: 1, fontSize: '90%' }}>
                                正在录音... {formatDuration(seconds)}
                            </span>
                            <mdui-button-icon icon="close" onClick={stopRecording} />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="lingcat-composer-row">
                    <AnimatePresence>
                        {mentionQuery && mentionCandidates.length > 0 && (
                            <motion.div
                                key="mentions"
                                initial={{ opacity: 0, y: 4, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                style={{
                                    position: 'absolute',
                                    bottom: 'calc(100% + 4px)',
                                    left: 0,
                                    // 按列表中最长的昵称/@用户名自动收窄, 最长 340px
                                    width: 'max-content',
                                    maxWidth: 'min(340px, 100%)',
                                    zIndex: 40,
                                    background: 'rgb(var(--mdui-color-surface-container))',
                                    borderRadius: '8px',
                                    // boxShadow: '0 4px 16px rgba(0,0,0,.25)',
                                    overflow: 'hidden',
                                    transformOrigin: 'bottom left',
                                }}>
                                <div style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                                    {mentionCandidates.map((c, i) => (
                                        <div
                                            key={c.m.id}
                                            onMouseDown={(e) => {
                                                e.preventDefault()
                                                insertMention(c.m)
                                            }}
                                            onMouseEnter={() => setMentionIndex(i)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                padding: '6px 10px',
                                                cursor: 'pointer',
                                                background: i === activeMentionIndex
                                                    ? 'rgba(var(--mdui-color-primary), 0.12)'
                                                    : undefined,
                                            }}
                                        >
                                            <Avatar
                                                src={c.m.avatar_file_hash
                                                    ? getFileUrl(c.m.avatar_file_hash, SessionEnv.myFileAccessToken)
                                                    : default_avatar}
                                                style={{ width: '28px', height: '28px', flexShrink: 0 }}
                                            />
                                            <div style={{ minWidth: 0, flex: '0 1 auto' }}>
                                                <div style={{
                                                    fontSize: '14px',
                                                    whiteSpace: 'nowrap',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                }}>{c.display}</div>
                                                {c.username && c.username !== c.display && (
                                                    <div style={{
                                                        fontSize: '11px',
                                                        opacity: 0.55,
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}>@{c.username}</div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <mdui-text-field
                        ref={inputRef as any}
                        use-patched-textarea
                        variant="outlined"
                        autosize
                        max-rows={10}
                        placeholder="输入..."
                        className="lingcat-composer-field"
                        onInput={() => setHasContent(!!inputRef.current?.value?.trim())}
                        onKeyDown={(e) => {
                            if (mentionQuery && mentionCandidates.length > 0) {
                                if (e.key === 'ArrowDown') {
                                    e.preventDefault()
                                    setMentionIndex((i) => (i + 1) % mentionCandidates.length)
                                    return
                                }
                                if (e.key === 'ArrowUp') {
                                    e.preventDefault()
                                    setMentionIndex((i) => (i - 1 + mentionCandidates.length) % mentionCandidates.length)
                                    return
                                }
                                if (e.key === 'Enter' || e.key === 'Tab') {
                                    e.preventDefault()
                                    insertMention(mentionCandidates[activeMentionIndex].m)
                                    return
                                }
                                if (e.key === 'Escape') {
                                    e.preventDefault()
                                    closeMentions()
                                    return
                                }
                            }
                            if (e.ctrlKey && e.key === 'Enter') send()
                        }}
                        onPaste={handlePaste}
                        onDrop={handleDrop}
                    >
                        <motion.div slot="icon" whileTap={{ scale: 0.9 }} style={{ display: 'inline-flex' }}>
                            <mdui-button-icon
                                icon={isRecording ? 'stop_circle' : 'mic'}
                                title={isRecording ? '停止录音' : '录制语音'}
                                onClick={handleToggleRecording}
                                style={isRecording ? { color: 'rgb(var(--mdui-color-error))' } : undefined}
                            />
                        </motion.div>

                        <motion.div slot="end-icon" style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <mdui-button-icon
                                icon="attachment"
                                title="添加附件"
                                onClick={() => attachFileInputRef.current?.click()}
                            />
                        </motion.div>

                        {/* ★ 发送按钮旁边的锁图标 */}
                        {canE2E && (
                            <>
                                <mdui-tooltip slot="end-icon" content={isEncryptMode ? '端到端加密已开启 (点击关闭)' : '端到端加密已关闭 (点击开启)'}>
                                    <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.9 }} transition={{ type: 'spring', stiffness: 400, damping: 22 }} style={{ display: 'inline-flex' }}>
                                        <mdui-button-icon
                                            icon={isEncryptMode ? 'lock' : 'lock_open'}
                                            onClick={() => setIsEncryptMode(!isEncryptMode)}
                                            style={{
                                                color: isEncryptMode ? 'rgb(var(--mdui-color-primary))' : 'rgb(var(--mdui-color-outline))'
                                            }}
                                        />
                                    </motion.div>
                                </mdui-tooltip>
                            </>
                        )}

                        <div slot="end-icon" style={{ display: 'inline-flex' }}>
                            <mdui-button-icon
                                slot="end-icon"
                                icon={editingMessage ? 'check' : 'send'}
                                loading={isSending || undefined}
                                disabled={(!hasContent || isSending) || undefined}
                                onClick={send}
                            />
                        </div>
                    </mdui-text-field>
                </div>
            </>
        )
    },
)