import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import MessageContainer from "../chat-layout/MessageContainer.tsx"
import UserProfileDialog from "../viewer/UserProfileDialog.tsx"
import ChatMessage from "./ChatMessage.tsx"
import { useChatMessageStore } from "./useChatMessageStore.ts"
import { IChat, IMessage, IMessageEntity, LingCatProto, Methods, Package } from "lingcat-protocol"
import React from "react"
import { dialog, NavigationDrawer, TextField } from "mdui"
import { ChatApi, FileApi, MessageParser } from "lingcat-client-protocol"
import ClientManager from "../../ClientManager.ts"
import tipError from "../tipError.ts"
import ChatProfileDialog from "../viewer/ChatProfileDialog.tsx"
import { ReactRenderer } from "marked-react"
import ReloadableImage from "../ReloadableImage.tsx"
import showSnackbar from "../showSnackbar.ts"
import useEventListener from "../useEventListener.ts"
import ImageViewerDialog from "../viewer/ImageViewerDialog.tsx"
import VideoViewerDialog from "../viewer/VideoViewerDialog.tsx"
import MduiPatchedTextAreaElement from "../MduiPatchedTextAreaElement.ts"
import escapeHtml from "../escapeHtml.ts"
import ChatSettingsDialog from "./ChatSettingsDialog.tsx"
import ChatMembersAndAdminsDialog from "./ChatMembersAndAdminsDialog.tsx"
import ProfileCache from "../../ProfileCache.ts"
import AppState from "../AppState.ts"
import { MeetingManager, useMeeting } from "../meeting/MeetingManager.ts"

function isApproximatelyAtBottom(scroller: HTMLElement, threshold: number = 20): boolean {
    if (!scroller) return false
    const { scrollTop, scrollHeight, clientHeight } = scroller
    return scrollTop + clientHeight >= scrollHeight - threshold
}

function formatDuration(seconds: number) {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}

export default function ChatFragment({ chat: chatObj, drawerRef }: { chat: IChat, drawerRef: React.RefObject<NavigationDrawer | undefined> }) {
    const [chat, setChat] = React.useState(chatObj)

    React.useEffect(() => {
        setChat(chatObj)
    }, [chatObj])

    const meeting = useMeeting()

    React.useEffect(() => {
        MeetingManager.refreshActiveMeeting(chat.id)
    }, [chat.id])

    const virtuosoRef = React.useRef<VirtuosoHandle>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const messageStore = useChatMessageStore()

    React.useEffect(() => {
        (async () => {
            if (!chat.is_member) return
            loadingRef.current = true
            try {
                const msgs = await ChatApi.getChatMessages(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    limit: 20,
                    chat_id: chat.id,
                })
                // console.log(msgs)
                messageStore.initMessages(msgs)

                requestAnimationFrame(() => {
                    setTimeout(() => {
                        virtuosoRef.current?.scrollToIndex(msgs[msgs.length - 1]?.id)
                        setTimeout(() => {
                            virtuosoRef.current?.scrollTo({
                                top: 10000000000,
                                behavior: "smooth",
                            })
                        }, 100)
                        loadingRef.current = false
                    }, 100)
                })

            } catch (e) {
                tipError(e, "拉取消息失败")
                loadingRef.current = false
            }
        })()

        function callback(mPackage: Package) {
            if (!chat.is_member) return
            const { appendMessages } = useChatMessageStore.getState()
            // TODO: 向 lingcat-client-protocol 添加全局的监听方法
            if (mPackage.method_id === Methods.Message_Edited_Event) {
                const raw = LingCatProto.methods.Message_Edited_Event.decode(mPackage.data)
                if (chat.id !== raw.chatId) return
                useChatMessageStore.getState().updateMessage(raw.id, {
                    text: raw.text,
                    entities: (raw.entities ?? []).map(e => ({
                        type: e.type as IMessageEntity['type'],
                        offset: e.offset ?? 0,
                        length: e.length ?? 0,
                        data: e.data ?? undefined,
                    })),
                    edited_at: Number(raw.editedAt),
                })
            }
            if (mPackage.method_id == Methods.Receive_Chat_Message_Event) {
                const raw = LingCatProto.methods.Receive_Chat_Message_Event.decode(mPackage.data).msg
                if (chat.id != raw?.chatId) return

                appendMessages([{
                    id: raw?.id!,
                    text: raw?.text!,
                    time: Number(raw?.time ?? 0),
                    sender_user_id: raw?.senderUserId,
                    system: raw?.system,
                    chat_id: raw?.chatId!,
                    entities: (raw?.entities ?? []).map((e) => ({
                        type: e.type as IMessageEntity['type'],
                        offset: e.offset ?? 0,
                        length: e.length ?? 0,
                        data: e.data ?? undefined,
                    })),
                }])

                if (isAtBottomRef.current || isApproximatelyAtBottom(containerRef.current!, 160)) {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            virtuosoRef.current!.scrollTo({
                                top: 10000000000,
                                behavior: "smooth",
                            })
                        }, 200)
                        setTimeout(() => {
                            virtuosoRef.current!.scrollTo({
                                top: 10000000000,
                                behavior: "smooth",
                            })
                        }, 300)
                        setTimeout(() => {
                            virtuosoRef.current!.scrollTo({
                                top: 10000000000,
                                behavior: "smooth",
                            })
                        }, 400)
                    })
                }
            }
        }
        ClientManager.client.addOnReceiveListener(callback)
        return () => ClientManager.client.removeOnReceiveListener(callback)
    }, [chat])

    const loadingRef = React.useRef(false)
    const isAtBottomRef = React.useRef(false)
    const atTopStateChange = React.useCallback((atTop: boolean) => {
        if (!atTop || loadingRef.current) return

        (async () => {
            if (!chat.is_member) return
            loadingRef.current = true

            try {
                const { sortedIds, prependMessages } = useChatMessageStore.getState()
                // 没有消息
                if (sortedIds.length == 0) return

                const oldestId = sortedIds[0]
                // before: oldestId, limit: 20
                const olderMessages: IMessage[] = await ChatApi.getChatMessages(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    chat_id: chat.id,
                    before: oldestId,
                    limit: 20,
                })
                console.log(olderMessages)

                if (olderMessages.length > 0) {
                    prependMessages(olderMessages)
                    virtuosoRef.current!.scrollToIndex(oldestId - 1)
                }
            } catch (e) {
                console.error('加载更旧消息失败:', e)
                tipError(e, '无法加载旧的消息')
            } finally {
                loadingRef.current = false
            }
        })()
    }, [chat])
    const atBottomStateChange = React.useCallback((atBottom: boolean) => {
        if (!atBottom || loadingRef.current) {
            isAtBottomRef.current = atBottom
            return
        }

        (async () => {
            if (!chat.is_member) return
            loadingRef.current = true
            isAtBottomRef.current = true

            try {
                const { sortedIds, appendMessages } = useChatMessageStore.getState()
                // after: sortedIds[sortedIds.length - 1], limit: 20
                const newerMessages: IMessage[] = await ChatApi.getChatMessages(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    chat_id: chat.id,
                    limit: 20,
                    after: sortedIds[sortedIds.length - 1],
                })

                if (newerMessages.length == 0) {
                    isAtBottomRef.current = true
                } else {
                    appendMessages(newerMessages)
                    isAtBottomRef.current = true
                }
            } catch (e) {
                isAtBottomRef.current = false
                console.error('加载新消息失败:', e)
                tipError(e, '无法加载新的消息')
            } finally {
                loadingRef.current = false
            }
        })()
    }, [chat])

    const id = 'a' + Date.now()

    const inputRef = React.useRef<TextField>(null)

    const { sortedIds } = useChatMessageStore()

    const [isMessageSending, setIsMessageSending] = React.useState(false)
    async function sendOrEditMessage() {
        let text = inputRef.current?.value || ''
        if (text.trim() == '') return

        if (isRecording) stopRecording()

        const sendingFilesSnackbar = showSnackbar({
            message: `发送消息到 [${chat.title}]...`,
            autoCloseDelay: 0,
        })
        let i = 1
        let i2 = 0
        const sendingFilesSnackbarId = setInterval(() => {
            const len = Object.keys(cachedFiles.current).filter((fileName) => text.indexOf(fileName)).length
            sendingFilesSnackbar.textContent = i2 == len ? `发送消息到 [${chat.title}]... (${i}s)` : `上传第 ${i2}/${len} 文件到 [${chat.title}]... (${i}s)`
            i++
        }, 1000)
        function endSendingSnack() {
            clearTimeout(sendingFilesSnackbarId)
            sendingFilesSnackbar.open = false
        }

        const func = () => {
            endSendingSnack()
            ClientManager.client.client?.removeEventListener('close', func)
        }
        ClientManager.client.client?.addEventListener('close', func)

        try {
            setIsMessageSending(true)
            const token = await FileApi.requestUploadFileToken(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token
            })
            for (const fileName of Object.keys(cachedFiles.current)) {
                if (text.indexOf(fileName) != -1) {
                    const hash = await FileApi.uploadFile(ClientManager.client, {
                        file_upload_token: token,
                        file_data: cachedFiles.current[fileName],
                        mime: cachedFileMimes.current[fileName],
                        file_name: fileName, 
                    })
                    text = text.replaceAll('(' + fileName + ')', '(lingcat://file?hash=' + hash + ')')
                }
            }

            const { text: parsedText, entities } = MessageParser.parseMessage(text)

            if (editingMessage) {
                await ChatApi.editChatMessage(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    chat_id: chat.id,
                    message_id: editingMessage.id,
                    text: parsedText,
                    entities,
                })
                setEditingMessage(null)
            } else {
                await ChatApi.sendChatMessage(ClientManager.client, {
                    access_token: ClientManager.getActiveUserSession().token,
                    chat_id: chat.id,
                    text: parsedText,
                    entities,
                })
            }

            Object.keys(cachedFiles.current).forEach((k) => delete cachedFiles.current[k])
            Object.keys(cachedFileUrls.current).forEach((k) => {
                URL.revokeObjectURL(cachedFileUrls.current[k])
                delete cachedFiles.current[k]
            })
            inputRef.current!.value = ''
        } catch (e) {
            tipError(e, '发送失败')
        }
        setIsMessageSending(false)
        endSendingSnack()
    }

    const attachFileInputRef = React.useRef<HTMLInputElement>(null)
    const cachedFiles = React.useRef<{ [fileName: string]: ArrayBuffer }>({})
    const cachedFileUrls = React.useRef<{ [fileName: string]: string }>({})
    const cachedFileNamesCount = React.useRef<{ [fileName: string]: number }>({})

    function insertText(text: string) {
        const input = inputRef.current!.shadowRoot!.querySelector('[part=input]') as MduiPatchedTextAreaElement
        input.insertHtml(escapeHtml(text))
    }
    const cachedFileMimes = React.useRef<{ [fileName: string]: string }>({})

    async function addFile(type: string, name_: string, data: Blob | Response) {
        let name = name_
        while (cachedFiles.current[name] != null) {
            name = name_ + '_' + cachedFileNamesCount.current[name]
            cachedFileNamesCount.current[name]++
        }
        const blob = data instanceof Blob ? data : await (data as Response).blob()
        cachedFiles.current[name] = await blob.arrayBuffer()
        cachedFileUrls.current[name] = URL.createObjectURL(blob)
        cachedFileMimes.current[name] = blob.type || type || 'application/octet-stream'
        cachedFileNamesCount.current[name] = 1

        if (type.startsWith('image/'))
            insertText(`![图片-${name}](${name})`)
        else if (type.startsWith('video/'))
            insertText(`![视频-${name}](${name})`)
        else if (type.startsWith('audio/'))
            insertText(`![音频-${name}](${name})`)
        else
            insertText(`![文件-${name}](${name})`)
    }

    useEventListener(attachFileInputRef, 'change', (_e) => {
        const files = attachFileInputRef.current!.files as unknown as File[]
        if (files?.length == 0) return

        for (const file of files) {
            addFile(file.type, file.name, file)
        }
        attachFileInputRef.current!.value = ''
    })

    const [editingMessage, setEditingMessage] = React.useState<IMessage | null>(null)
    const editMessageOriginText = React.useRef('')

    function startEdit(msg: IMessage) {
        setEditingMessage(msg)
        editMessageOriginText.current = inputRef.current!.value
        // 把原始语法还原到输入框
        inputRef.current!.value = MessageParser.entitiesToRawRichText(msg.text, msg.entities ?? [])
        inputRef.current!.focus()
    }

    function cancelEdit() {
        setEditingMessage(null)
        inputRef.current!.value = editMessageOriginText.current
    }

    const [isRecording, setIsRecording] = React.useState(false)
    const [recordingSeconds, setRecordingSeconds] = React.useState(0)
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null)
    const audioStreamRef = React.useRef<MediaStream | null>(null)
    const audioChunksRef = React.useRef<Blob[]>([])
    const recordingTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null)

    const stopRecording = React.useCallback(() => {
        const recorder = mediaRecorderRef.current
        if (recorder && recorder.state !== 'inactive') {
            recorder.stop()
        } else {
            audioStreamRef.current?.getTracks().forEach(t => t.stop())
            audioStreamRef.current = null
            mediaRecorderRef.current = null
            setIsRecording(false)
            setRecordingSeconds(0)
            if (recordingTimerRef.current) {
                clearInterval(recordingTimerRef.current)
                recordingTimerRef.current = null
            }
        }
    }, [])

    const startRecording = React.useCallback(async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            tipError(new Error('当前环境不支持录音，请使用 HTTPS 访问'), '无法录音')
            return
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            audioStreamRef.current = stream

            const mimeCandidates = [
                'audio/webm;codecs=opus',
                'audio/webm',
                'audio/ogg;codecs=opus',
                'audio/mp4',
            ]
            const mimeType = mimeCandidates.find(t => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) ?? ''

            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
            audioChunksRef.current = []
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }
            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop())
                audioStreamRef.current = null
                mediaRecorderRef.current = null

                let actualMime = recorder.mimeType || mimeType || 'audio/webm'
                // 有时会返回 video/webm, 但我们录的是纯音频
                if (actualMime.includes('webm') && !actualMime.startsWith('audio/')) {
                    actualMime = 'audio/webm;codecs=opus'
                }

                const blob = new Blob(audioChunksRef.current, { type: actualMime })
                audioChunksRef.current = []

                setIsRecording(false)
                setRecordingSeconds(0)
                if (recordingTimerRef.current) {
                    clearInterval(recordingTimerRef.current)
                    recordingTimerRef.current = null
                }

                if (blob.size === 0) return

                const ext = actualMime.includes('webm') ? 'webm'
                    : actualMime.includes('ogg') ? 'ogg'
                        : actualMime.includes('mp4') ? 'm4a'
                            : 'bin'
                const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
                const name = `${ts}.${ext}`
                try {
                    await addFile(actualMime, name, blob)
                } catch (e) {
                    tipError(e, '添加语音失败')
                }
            }

            mediaRecorderRef.current = recorder
            recorder.start()
            setIsRecording(true)
            setRecordingSeconds(0)
            recordingTimerRef.current = setInterval(() => {
                setRecordingSeconds(s => s + 1)
            }, 1000)
        } catch (e) {
            tipError(e, '无法访问麦克风')
        }
    }, [])

    function toggleRecording() {
        if (isRecording) stopRecording()
        else startRecording()
    }

    React.useEffect(() => {
        return () => {
            const recorder = mediaRecorderRef.current
            if (recorder && recorder.state !== 'inactive') {
                try { recorder.stop() } catch { }
            }
            audioStreamRef.current?.getTracks().forEach(t => t.stop())
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
        }
    }, [])

    let chatSettings: any = {}
    try { chatSettings = JSON.parse(chat.settings || '{}') } catch { }
    const canJoin = chatSettings.allow_join === true

    return <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', width: '100%' }}>
        <div style={{
            display: 'none'
        }}>
            <input accept="*/*" type="file" name="添加文件" multiple ref={attachFileInputRef}></input>
        </div>

        <mdui-top-app-bar scroll-target={'#' + id}>
            <mdui-button-icon icon="menu" onClick={() => {
                drawerRef.current && (drawerRef.current.open = !drawerRef.current.open)
            }}></mdui-button-icon>
            <mdui-top-app-bar-title style={{ marginLeft: '8px' }}>{chat.title}</mdui-top-app-bar-title>
            <div style={{ flexGrow: 1 }}></div>
            <mdui-button-icon icon="call" style={{ marginRight: '4px' }} onClick={() => {
                (async () => {
                    if (MeetingManager.isInMeeting(chat.id)) {
                        showSnackbar({ message: '你已在此会议中' })
                        return
                    }
                    try {
                        const active = MeetingManager.getActiveMeeting(chat.id)
                        if (active)
                            await MeetingManager.joinMeeting(chat.id, active.meetingId, chat.title ?? undefined)
                        else
                            await MeetingManager.startMeeting(chat)
                    } catch (e) {
                        tipError(e, '发起会议失败')
                    }
                })()
            }}></mdui-button-icon>
            <mdui-button-icon icon="group" style={{ marginRight: '4px' }} onClick={() => ChatMembersAndAdminsDialog.show(chat.id)}></mdui-button-icon>
            <mdui-button-icon icon="settings" style={{ marginRight: '4px' }} onClick={() => ChatSettingsDialog.show(chat.id)}></mdui-button-icon>
            <mdui-button-icon icon="info" style={{ marginRight: '4px' }} onClick={() => ChatProfileDialog.show(chat.id)}></mdui-button-icon>
        </mdui-top-app-bar>

        {!!meeting.getActiveMeeting(chat.id) && (
            <div style={{
                position: 'absolute',
                top: '64px',
                left: 0,
                right: 0,
                display: 'flex',
                justifyContent: 'center',
                zIndex: 6,
                pointerEvents: 'none',
            }}>
                <div style={{
                    pointerEvents: 'auto',
                    marginTop: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 6px 4px 14px',
                    borderRadius: '999px',
                    background: 'rgb(var(--mdui-color-primary-container))',
                    color: 'rgb(var(--mdui-color-on-primary-container))',
                    boxShadow: 'var(--mdui-elevation-level3)',
                    fontSize: '13px',
                }}>
                    <span>会议进行中</span>
                    {meeting.isInMeeting(chat.id)
                        ? <mdui-button variant="text" onClick={() => MeetingManager.leave()}>离开</mdui-button>
                        : <mdui-button variant="text" onClick={() => {
                            const active = meeting.getActiveMeeting(chat.id)!
                            MeetingManager.joinMeeting(chat.id, active.meetingId, chat.title ?? undefined)
                                .catch((e) => tipError(e, '加入会议失败'))
                        }}>加入</mdui-button>}
                </div>
            </div>
        )}

        <div id={id} style={{
            display: 'flex',
            width: '100%',
            justifyContent: chat.is_member ? undefined : 'center',
        }}>
            <div style={{
                display: chat.is_member ? 'none' : undefined,
                alignSelf: 'center',
                maxWidth: '300px',
                textAlign: 'center',
            }}>
                {canJoin
                    ? <mdui-button onClick={async () => {
                        try {
                            await ChatApi.joinChat(ClientManager.client, {
                                access_token: ClientManager.getActiveUserSession().token,
                                chat_id: chat.id,
                            })
                        } catch (e) {
                            console.log(e)
                            tipError(e, "加入对话失败")
                            return
                        }
                        try {
                            setChat(await ChatApi.queryChatInfo(ClientManager.client, {
                                access_token: ClientManager.getActiveUserSession().token,
                                chat_id: chat.id,
                            }))
                            showSnackbar({
                                message: "已加入对话"
                            })
                        } catch (e) {
                            console.log(e)
                            tipError(e, "重新打开对话失败")
                        }
                    }}>加入对话</mdui-button>
                    : <div>
                        <div>该群未开放加入</div>
                        <div style={{ fontSize: '85%', opacity: 0.7, marginTop: '6px' }}>
                            需管理员在「对话设定 → 入群」中开启「允许加入」
                        </div>
                    </div>}
            </div>
            <MessageContainer ref={containerRef} style={{
                display: chat.is_member ? 'flex' : 'none'
            }}>
                <Virtuoso
                    ref={virtuosoRef}
                    style={{ overflowY: 'auto' }}
                    totalCount={sortedIds.length}
                    atTopStateChange={atTopStateChange}
                    atBottomStateChange={atBottomStateChange}
                    itemContent={(index) => {
                        const { sortedIds, messageMap } = useChatMessageStore.getState()
                        const id = sortedIds[index]
                        if (id == null) return <div style={{ height: '0.5px' }}></div>
                        const msg = messageMap.get(id);
                        if (!msg) return <div style={{ height: '0.5px' }}></div>
                        return <ChatMessage
                            onAvatarClick={() => msg.sender_user_id && UserProfileDialog.show(msg.sender_user_id)}
                            msg={msg}
                            avatarMenus={<>
                                <mdui-menu-item icon="info" onClick={() => msg.sender_user_id && UserProfileDialog.show(msg.sender_user_id)}>用户资料</mdui-menu-item>
                                <mdui-menu-item icon="alternate_email" onClick={async () => insertText(`![UserMention=@${((await ProfileCache.queryUserInfo(msg.sender_user_id!)).nickname)}](lingcat://user?id=${msg.sender_user_id}) `)}>提及用户</mdui-menu-item>
                            </>}
                            messageMenus={<>
                                {msg.sender_user_id === AppState.myId && !msg.system && (
                                    <mdui-menu-item icon="edit" onClick={() => startEdit(msg)}>编辑</mdui-menu-item>
                                )}
                                <mdui-menu-item icon="info" onClick={() => dialog({
                                    headline: "Info",
                                    body: `<span style="word-break: break-word;">${Object.keys(msg)
                                        // @ts-ignore 懒
                                        .map((k) => `${k} = ${msg[k]}`)
                                        .join('<br><br>')}<span>`,
                                    closeOnEsc: true,
                                    closeOnOverlayClick: true,
                                    actions: [
                                        {
                                            text: "关闭",
                                            onClick: () => {
                                                return true
                                            },
                                        }
                                    ]
                                })}>Info</mdui-menu-item>
                            </>} />
                    }} />

                <div style={{
                    flexGrow: 1,
                }}></div>
                {editingMessage && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        background: 'rgba(var(--mdui-color-primary), 0.08)',
                        borderLeft: '3px solid rgb(var(--mdui-color-primary))',
                        margin: '0 4px',
                        borderRadius: '4px',
                    }}>
                        <span style={{ flex: 1, fontSize: '90%', opacity: 0.8 }}>
                            正在编辑消息
                        </span>
                        <mdui-button-icon icon="close" onClick={cancelEdit} />
                    </div>
                )}
                {isRecording && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        background: 'rgba(var(--mdui-color-error), 0.08)',
                        borderLeft: '3px solid rgb(var(--mdui-color-error))',
                        margin: '0 4px',
                        borderRadius: '4px',
                    }}>
                        <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: 'rgb(var(--mdui-color-error))',
                            animation: 'lingcat-pulse 1s infinite',
                        }} />
                        <style>{`@keyframes lingcat-pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
                        <span style={{ flex: 1, fontSize: '90%' }}>
                            正在录音... {formatDuration(recordingSeconds)}
                        </span>
                        <mdui-button-icon icon="close" onClick={stopRecording} />
                    </div>
                )}
                <mdui-text-field
                    ref={inputRef}
                    use-patched-textarea
                    variant="outlined"
                    autosize
                    max-rows={10}
                    placeholder="输入..."
                    style={{
                        padding: '4px',
                    }}
                    onKeyDown={(event) => {
                        if (event.ctrlKey && event.key == 'Enter')
                            sendOrEditMessage()
                    }}
                    onPaste={(event) => {
                        for (const item of event.clipboardData.items) {
                            if (item.kind == 'file') {
                                event.preventDefault()
                                const file = item.getAsFile() as File
                                addFile(item.type, file.name, file)
                            }
                        }
                    }}
                    onDrop={(e) => {
                        e.preventDefault()
                        function getFileNameOrRandom(urlString: string) {
                            const url = new URL(urlString)
                            let filename = url.pathname.substring(url.pathname.lastIndexOf('/') + 1).trim()
                            if (filename == '')
                                filename = 'file_' + Date.now()
                            return filename
                        }
                        if (e.dataTransfer.items.length > 0) {
                            // 基于当前的实现, 浏览器不会读取文件的字节流来确定其媒体类型, 其根据文件扩展名进行假设
                            // https://developer.mozilla.org/zh-CN/docs/Web/API/Blob/type
                            for (const item of e.dataTransfer.items) {
                                if (item.type == 'text/uri-list') {
                                    item.getAsString(async (url) => {
                                        try {
                                            // 即便是 no-cors 還是殘廢, 因此暫時沒有什麽想法
                                            const re = await fetch(url)
                                            const type = re.headers.get("Content-Type")
                                            if (type && re.ok) {
                                                addFile(type as string, getFileNameOrRandom(url), re)
                                            }
                                        } catch (e) {
                                            showSnackbar({
                                                message: '无法解析链接: ' + (e as Error).message,
                                            })
                                        }
                                    })
                                } else if (item.type == 'text/plain') {
                                    item.getAsString((text) => {
                                        insertText(text + ' ')
                                    })
                                } else if (item.kind == 'file') {
                                    const file = item.getAsFile() as File
                                    addFile(item.type, file.name, file)
                                }
                            }
                        }
                    }}>

                    <mdui-button-icon
                        slot="end-icon"
                        icon={isRecording ? "stop_circle" : "mic"}
                        onClick={toggleRecording}
                        style={isRecording ? { color: 'rgb(var(--mdui-color-error))' } : undefined}
                    ></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '20px' }}></div>
                    <mdui-button-icon slot="end-icon" icon="attachment" onClick={() => attachFileInputRef.current!.click()}></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '20px' }}></div>
                    <mdui-button-icon slot="end-icon" icon="send" onClick={() => sendOrEditMessage()}></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '5px' }}></div>
                </mdui-text-field>
            </MessageContainer>
        </div>
    </div >
}