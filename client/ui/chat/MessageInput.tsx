import React from 'react'
import { TextField } from 'mdui'
import { MessageParser } from 'lingcat-client-protocol'
import { ChatApi } from 'lingcat-client-protocol'
import type { IMessage } from 'lingcat-protocol'
import ClientManager from '../../ClientManager.ts'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'
import escapeHtml from '../../lib/escapeHtml.ts'
import { useChatFileUpload } from './useChatFileUpload.ts'
import { useAudioRecorder } from './useAudioRecorder.ts'

export interface MessageInputHandle {
    /** 把纯文本插入当前光标位置（供回复/提及使用） */
    insertText: (text: string) => void
    /** 让输入框获得焦点 */
    focus: () => void
}

export interface MessageInputProps {
    chatId: string
    chatTitle: string
    /** 正在编辑的消息；null = 正常发送 */
    editingMessage: IMessage | null
    onEditCancel: () => void
    onEditDone: () => void
}

function formatDuration(sec: number) {
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`
}

export const MessageInput = React.forwardRef<MessageInputHandle, MessageInputProps>(
    function MessageInput({ chatId, chatTitle, editingMessage, onEditCancel, onEditDone }, ref) {
        const inputRef = React.useRef<TextField>(null)
        const attachFileInputRef = React.useRef<HTMLInputElement>(null)
        const [isSending, setIsSending] = React.useState(false)

        // 保存编辑前的原始输入
        const preEditValueRef = React.useRef('')

        // ============================================================
        //  insertText（供外部通过 ref 调用）
        // ============================================================
        const insertText = React.useCallback((text: string) => {
            const input = inputRef.current?.shadowRoot?.querySelector('[part=input]') as any
            if (!input) return
            if (typeof input.insertHtml === 'function') {
                input.insertHtml(escapeHtml(text))
            } else {
                // 降级：直接拼在末尾
                inputRef.current!.value = (inputRef.current!.value ?? '') + text
            }
        }, [])

        React.useImperativeHandle(ref, () => ({
            insertText,
            focus: () => inputRef.current?.focus(),
        }), [insertText])

        // ============================================================
        //  附件上传
        // ============================================================
        const { addFile, uploadAll, countInText, clear: clearFiles } = useChatFileUpload({
            onInsertText: insertText,
        })

        // ============================================================
        //  录音
        // ============================================================
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
        //  编辑模式：切换时同步输入框
        // ============================================================
        React.useEffect(() => {
            if (editingMessage) {
                preEditValueRef.current = inputRef.current?.value ?? ''
                inputRef.current!.value = MessageParser.entitiesToRawRichText(
                    editingMessage.text,
                    editingMessage.entities ?? [],
                )
                inputRef.current?.focus()
            }
        }, [editingMessage?.id])

        const cancelEdit = () => {
            inputRef.current!.value = preEditValueRef.current
            onEditCancel()
        }

        // ============================================================
        //  发送 / 保存编辑
        // ============================================================
        const send = async () => {
            let text = inputRef.current?.value ?? ''
            if (!text.trim()) return
            if (isRecording) stopRecording()

            const client = ClientManager.getActiveClient()
            const session = ClientManager.getActiveSession()
            if (!client || !session) return

            const fileCount = countInText(text)
            const snack = showSnackbar({
                message: `发送到 [${chatTitle}]...`,
                autoCloseDelay: 0,
            })
            let tick = 1
            let uploaded = 0
            const timer = setInterval(() => {
                if (uploaded < fileCount) {
                    snack.textContent = `上传第 ${uploaded}/${fileCount} 个文件... (${tick}s)`
                } else {
                    snack.textContent = `发送到 [${chatTitle}]... (${tick}s)`
                }
                tick++
            }, 1000)

            const onClose = () => { clearInterval(timer); snack.open = false }
            client.client?.addEventListener('close', onClose)

            try {
                setIsSending(true)

                if (fileCount > 0) {
                    text = await uploadAll(text)
                    uploaded = fileCount
                }

                const parsed = MessageParser.parseMessage(text)

                if (editingMessage) {
                    await ChatApi.editChatMessage(client, {
                        access_token: session.token,
                        chat_id: chatId,
                        message_id: editingMessage.id,
                        text: parsed.text,
                        entities: parsed.entities,
                    })
                    onEditDone()
                } else {
                    await ChatApi.sendChatMessage(client, {
                        access_token: session.token,
                        chat_id: chatId,
                        text: parsed.text,
                        entities: parsed.entities,
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
        //  拖拽 / 粘贴 / 选择文件
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