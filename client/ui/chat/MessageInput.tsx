import React from 'react'
import { TextField } from 'mdui'
import { MessageParser, ChatApi } from 'lingcat-client-protocol'
import type { IMessage, IMessageEntity } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'
import escapeHtml from '../../lib/escapeHtml.ts'
import { useChatFileUpload } from './useChatFileUpload.ts'
import { useAudioRecorder } from './useAudioRecorder.ts'
import { useE2EStore } from '../../lib/e2e/useE2EStore.ts'
import { UnlockPasswordDialog } from '../e2e/UnlockPasswordDialog.tsx'

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
}

function formatDuration(sec: number) {
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

export const MessageInput = React.forwardRef<MessageInputHandle, MessageInputProps>(
    function MessageInput({ chatId, chatTitle, peerUserId, editingMessage, onEditCancel, onEditDone }, ref) {
        const inputRef = React.useRef<TextField>(null)
        const attachFileInputRef = React.useRef<HTMLInputElement>(null)
        const [isSending, setIsSending] = React.useState(false)
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
                let sendEntities: IMessageEntity[] | undefined = parsed.entities

                // E2E 加密
                if (isEncryptMode && peerUserId) {
                    const rawPayload = JSON.stringify({
                        text: parsed.text,
                        entities: parsed.entities
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
            let text = inputRef.current?.value ?? ''
            if (!text.trim()) return
            if (isRecording) stopRecording()

            // 如果是加密模式，且是私聊
            if (isEncryptMode && peerUserId) {
                // 发送前，强制拉取一次对方的最新公钥
                await fetchPeerKeys([peerUserId])
                const currentPeerKey = useE2EStore.getState().peerKeys[peerUserId]

                // 如果拉完发现对方没公钥（可能刚重置/删除了），降级为明文
                if (!currentPeerKey) {
                    setIsEncryptMode(false)
                    showSnackbar({ message: '对方未开启端到端加密，将以明文发送' })
                    executeSend(text)
                    return
                }

                // 如果处于锁定状态，拦截并弹窗，★ 成功后自动重试发送
                if (e2eStatus !== 'unlocked') {
                    UnlockPasswordDialog.show('unlock', () => {
                        // 解锁成功，直接触发真实发送
                        executeSend(text)
                    })
                    return
                }
            }

            // 如果没开加密，或者已经解锁，直接发
            executeSend(text)
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

                {editingMessage && (
                    <div style={{
                        display: 'flex', alignItems: 'center',
                        padding: '6px 12px',
                        background: 'rgba(var(--mdui-color-primary), 0.08)',
                        borderLeft: '3px solid rgb(var(--mdui-color-primary))',
                        margin: '0 4px', borderRadius: '4px',
                    }}>
                        <span style={{ flex: 1, fontSize: '90%', opacity: 0.8 }}>正在编辑消息</span>
                        <mdui-button-icon icon="close" onClick={cancelEdit} />
                    </div>
                )}

                {isRecording && (
                    <div style={{
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
                    </div>
                )}

                <mdui-text-field
                    ref={inputRef as any}
                    use-patched-textarea
                    variant="outlined"
                    autosize
                    max-rows={10}
                    placeholder="输入..."
                    style={{ padding: '4px' }}
                    onKeyDown={(e) => {
                        if (e.ctrlKey && e.key === 'Enter') send()
                    }}
                    onPaste={handlePaste}
                    onDrop={handleDrop}
                >
                    <mdui-button-icon
                        slot="end-icon"
                        icon={isRecording ? 'stop_circle' : 'mic'}
                        onClick={toggleRecording}
                        style={isRecording ? { color: 'rgb(var(--mdui-color-error))' } : undefined}
                    />
                    <div slot="end-icon" style={{ paddingRight: '20px' }} />
                    <mdui-button-icon
                        slot="end-icon"
                        icon="attachment"
                        onClick={() => attachFileInputRef.current?.click()}
                    />

                    {/* ★ 发送按钮旁边的锁图标 */}
                    {canE2E && (
                        <>
                            <div slot="end-icon" style={{ paddingRight: '20px' }} />
                            <mdui-tooltip  slot="end-icon" content={isEncryptMode ? '端到端加密已开启 (点击关闭)' : '端到端加密已关闭 (点击开启)'}>
                                <mdui-button-icon
                                    icon={isEncryptMode ? 'lock' : 'lock_open'}
                                    onClick={() => setIsEncryptMode(!isEncryptMode)}
                                    style={{
                                        color: isEncryptMode ? 'var(--mdui-color-primary)' : 'var(--mdui-color-outline)'
                                    }}
                                />
                            </mdui-tooltip>
                        </>
                    )}

                    <div slot="end-icon" style={{ paddingRight: '20px' }} />
                    <mdui-button-icon
                        slot="end-icon"
                        icon="send"
                        loading={isSending || undefined}
                        onClick={send}
                    />
                    <div slot="end-icon" style={{ paddingRight: '5px' }} />
                </mdui-text-field>
            </>
        )
    },
)