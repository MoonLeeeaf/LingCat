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
import showSnackbar from "../showSnackbar.ts"
import useEventListener from "../useEventListener.ts"
import ChatSettingsDialog from "./ChatSettingsDialog.tsx"
import ChatMembersAndAdminsDialog from "./ChatMembersAndAdminsDialog.tsx"
import ProfileCache from "../../ProfileCache.ts"
import AppState from "../AppState.ts"
import { MeetingManager, useMeeting } from "../meeting/MeetingManager.ts"
import { MeetingWindowManager, useMeetingWindow } from "../meeting/MeetingWindow.ts"
import ClientConfigInstance from "../../ClientConfig.ts"
import escapeHtml from "../escapeHtml.ts"

function formatDuration(seconds: number) {
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`
}

export default function ChatFragment({ chat: chatObj, drawerRef }: { chat: IChat, drawerRef: React.RefObject<NavigationDrawer | undefined> }) {
    const [chat, setChat] = React.useState(chatObj)
    React.useEffect(() => { setChat(chatObj) }, [chatObj])

    const meeting = useMeeting()
    const meetingWindow = useMeetingWindow()

    React.useEffect(() => { MeetingManager.refreshActiveMeeting(chat.id) }, [chat.id])
    React.useEffect(() => {
        if (!MeetingWindowManager.isSupported()) return
        MeetingWindowManager.refresh(chat.id)
    }, [chat.id])

    const openMeetingWindow = () => {
        const res = MeetingWindowManager.open({ chatId: chat.id, title: chat.title ?? undefined, start: true })
        if (res == 'failed') {
            showSnackbar({ message: '打开会议失败, 已改为在当前页面进行' })
            return false
        }
        if (res == 'focused') MeetingWindowManager.startInWindow(chat.id)
        return res == 'opened' || res == 'focused'
    }

    const onCallClick = () => {
        (async () => {
            if (MeetingManager.isInMeeting(chat.id)) {
                showSnackbar({ message: '你已在此会议中' })
                return
            }
            if (meetingWindow.isSupported() && openMeetingWindow()) return
            try {
                const active = MeetingManager.getActiveMeeting(chat.id)
                if (active) await MeetingManager.joinMeeting(chat.id, active.meetingId, chat.title ?? undefined)
                else await MeetingManager.startMeeting(chat)
            } catch (e) {
                tipError(e, '发起会议失败')
            }
        })()
    }

    const virtuosoRef = React.useRef<VirtuosoHandle>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    // 订阅 store: 拿到 firstItemIndex
    const { sortedIds, firstItemIndex } = useChatMessageStore()

    const loadingOlderRef = React.useRef(false)
    const loadingNewerRef = React.useRef(false)
    const isAtBottomRef = React.useRef(true)

    const [initialScrollDone, setInitialScrollDone] = React.useState(false)

    React.useEffect(() => {
        setInitialScrollDone(false)
    }, [chat.id])

    // 滚到底部: 只在真正需要时调用一次
    const scrollToBottom = React.useCallback((behavior: 'auto' | 'smooth' = 'auto') => {
        virtuosoRef.current?.scrollToIndex({ index: 'LAST', align: 'end', behavior })
    }, [])

    // 初始化
    React.useEffect(() => {
        if (!chat.is_member) return
        let cancelled = false

            ; (async () => {
                loadingOlderRef.current = true
                try {
                    const msgs = await ChatApi.getChatMessages(ClientManager.client, {
                        access_token: ClientManager.getActiveUserSession().token,
                        limit: 30,
                        chat_id: chat.id,
                    })
                    if (cancelled) return
                    useChatMessageStore.getState().initMessages(msgs)
                } catch (e) {
                    if (!cancelled) tipError(e, "拉取消息失败")
                } finally {
                    loadingOlderRef.current = false
                }
            })()

        return () => { cancelled = true }
    }, [chat.id, chat.is_member])

    // WebSocket 事件监听
    React.useEffect(() => {
        if (!chat.is_member) return

        function callback(mPackage: Package) {
            const { appendMessages, updateMessage } = useChatMessageStore.getState()

            if (mPackage.method_id === Methods.Message_Edited_Event) {
                const raw = LingCatProto.methods.Message_Edited_Event.decode(mPackage.data)
                if (chat.id !== raw.chatId) return
                updateMessage(raw.id, {
                    text: raw.text,
                    entities: (raw.entities ?? []).map(e => ({
                        type: e.type as IMessageEntity['type'],
                        offset: e.offset ?? 0,
                        length: e.length ?? 0,
                        data: e.data ?? undefined,
                    })),
                    edited_at: Number(raw.editedAt),
                })
                return
            }

            if (mPackage.method_id === Methods.Receive_Chat_Message_Event) {
                const raw = LingCatProto.methods.Receive_Chat_Message_Event.decode(mPackage.data).msg
                if (chat.id !== raw?.chatId) return

                const wasAtBottom = isAtBottomRef.current
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

                // 只有本来就在底部才自动滚动, 且只调用一次
                if (wasAtBottom) {
                    requestAnimationFrame(() => scrollToBottom('smooth'))
                }
            }
        }
        ClientManager.client.addOnReceiveListener(callback)
        return () => ClientManager.client.removeOnReceiveListener(callback)
    }, [chat.id, chat.is_member, scrollToBottom])

    // 向上加载: prepend 后不需要任何滚动操作, Virtuoso 靠 firstItemIndex 自动锚定
    const atTopStateChange = React.useCallback((atTop: boolean) => {
        if (!atTop || loadingOlderRef.current) return

            ; (async () => {
                if (!chat.is_member) return
                loadingOlderRef.current = true
                try {
                    const { sortedIds, prependMessages } = useChatMessageStore.getState()
                    if (sortedIds.length === 0) return

                    const oldestId = sortedIds[0]
                    const olderMessages: IMessage[] = await ChatApi.getChatMessages(ClientManager.client, {
                        access_token: ClientManager.getActiveUserSession().token,
                        chat_id: chat.id,
                        before: oldestId,
                        limit: 30,
                    })
                    if (olderMessages.length > 0) prependMessages(olderMessages)
                } catch (e) {
                    console.error('加载更旧消息失败:', e)
                    tipError(e, '无法加载旧的消息')
                } finally {
                    loadingOlderRef.current = false
                }
            })()
    }, [chat.id, chat.is_member])

    const atBottomStateChange = React.useCallback((atBottom: boolean) => {
        isAtBottomRef.current = atBottom
        if (atBottom && !initialScrollDone) setInitialScrollDone(true)
        if (!atBottom || loadingNewerRef.current) return

            ; (async () => {
                if (!chat.is_member) return
                loadingNewerRef.current = true
                try {
                    const { sortedIds, appendMessages } = useChatMessageStore.getState()
                    if (sortedIds.length === 0) return

                    const newestId = sortedIds[sortedIds.length - 1]
                    const newerMessages: IMessage[] = await ChatApi.getChatMessages(ClientManager.client, {
                        access_token: ClientManager.getActiveUserSession().token,
                        chat_id: chat.id,
                        after: newestId,
                        limit: 30,
                    })
                    if (newerMessages.length > 0) appendMessages(newerMessages)
                } catch (e) {
                    console.error('加载新消息失败:', e)
                    tipError(e, '无法加载新的消息')
                } finally {
                    loadingNewerRef.current = false
                }
            })()
    }, [chat.id, chat.is_member])

    const scrollToSeqRequest = useChatMessageStore(s => s.scrollToSeqRequest)

    React.useEffect(() => {
        if (scrollToSeqRequest == null) return
        const seq = scrollToSeqRequest
        useChatMessageStore.getState().clearScrollToSeqRequest()
    
        const { sortedIds } = useChatMessageStore.getState()
        const index = sortedIds.indexOf(seq)
    
        if (index !== -1) {
            // 已在窗口内, 直接滚
            virtuosoRef.current?.scrollToIndex({ index, align: 'center', behavior: 'smooth' })
            return
        }
    
        // 不在窗口内, 加载目标周围的消息
        ; (async () => {
            try {
                const token = ClientManager.getActiveUserSession().token
                const [older, newer] = await Promise.all([
                    // before: seq + 1 → 包含 seq 自己
                    ChatApi.getChatMessages(ClientManager.client, {
                        access_token: token, chat_id: chat.id,
                        before: seq + 1, limit: 30,
                    }),
                    // after: seq → 不包含 seq 自己
                    ChatApi.getChatMessages(ClientManager.client, {
                        access_token: token, chat_id: chat.id,
                        after: seq, limit: 30,
                    }),
                ])
    
                // 合并去重
                const merged = [...older, ...newer]
                const seen = new Set<number>()
                const unique = merged.filter(m => {
                    if (seen.has(m.id)) return false
                    seen.add(m.id)
                    return true
                })
    
                if (unique.length === 0 || !unique.some(m => m.id === seq)) {
                    showSnackbar({ message: '消息已不存在' })
                    return
                }
    
                // 完全替换列表
                useChatMessageStore.getState().initMessages(unique, seq)
    
                // 等 Virtuoso 渲染完再滚
                requestAnimationFrame(() => {
                    const { sortedIds: newIds } = useChatMessageStore.getState()
                    const newIndex = newIds.indexOf(seq)
                    if (newIndex >= 0) {
                        virtuosoRef.current?.scrollToIndex({
                            index: newIndex,
                            align: 'center',
                            behavior: 'auto',   // 首次定位用 auto, 更稳
                        })
                    }
                })
            } catch (e) {
                console.error('跳转消息失败:', e)
                tipError(e, '无法加载消息')
            }
        })()
    }, [scrollToSeqRequest])

    const id = 'a' + Date.now()
    const inputRef = React.useRef<TextField>(null)
    const [isMessageSending, setIsMessageSending] = React.useState(false)

    async function sendOrEditMessage() {
        let text = inputRef.current?.value || ''
        if (text.trim() == '') return
        if (isRecording) stopRecording()

        const sendingFilesSnackbar = showSnackbar({ message: `发送消息到 [${chat.title}]...`, autoCloseDelay: 0 })
        let i = 1, i2 = 0
        const sendingFilesSnackbarId = setInterval(() => {
            const len = Object.keys(cachedFiles.current).filter((fileName) => text.indexOf(fileName)).length
            sendingFilesSnackbar.textContent = i2 == len ? `发送消息到 [${chat.title}]... (${i}s)` : `上传第 ${i2}/${len} 文件到 [${chat.title}]... (${i}s)`
            i++
        }, 1000)
        function endSendingSnack() { clearTimeout(sendingFilesSnackbarId); sendingFilesSnackbar.open = false }

        const func = () => { endSendingSnack(); ClientManager.client.client?.removeEventListener('close', func) }
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
    const cachedFileMimes = React.useRef<{ [fileName: string]: string }>({})

    function insertText(text: string) {
        const input = inputRef.current!.shadowRoot!.querySelector('[part=input]') as any
        input.insertHtml(escapeHtml(text))
    }

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

        if (type.startsWith('image/')) insertText(`![图片-${name}](${name})`)
        else if (type.startsWith('video/')) insertText(`![视频-${name}](${name})`)
        else if (type.startsWith('audio/')) insertText(`![音频-${name}](${name})`)
        else insertText(`![文件-${name}](${name})`)
    }

    useEventListener(attachFileInputRef, 'change', () => {
        const files = attachFileInputRef.current!.files as unknown as File[]
        if (files?.length == 0) return
        for (const file of files) addFile(file.type, file.name, file)
        attachFileInputRef.current!.value = ''
    })

    const [editingMessage, setEditingMessage] = React.useState<IMessage | null>(null)
    const editMessageOriginText = React.useRef('')

    function startEdit(msg: IMessage) {
        setEditingMessage(msg)
        editMessageOriginText.current = inputRef.current!.value
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
        if (recorder && recorder.state !== 'inactive') recorder.stop()
        else {
            audioStreamRef.current?.getTracks().forEach(t => t.stop())
            audioStreamRef.current = null
            mediaRecorderRef.current = null
            setIsRecording(false)
            setRecordingSeconds(0)
            if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null }
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

            const mimeCandidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
            const mimeType = mimeCandidates.find(t => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) ?? ''

            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
            audioChunksRef.current = []
            recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data) }
            recorder.onstop = async () => {
                stream.getTracks().forEach(t => t.stop())
                audioStreamRef.current = null
                mediaRecorderRef.current = null

                let actualMime = recorder.mimeType || mimeType || 'audio/webm'
                if (actualMime.includes('webm') && !actualMime.startsWith('audio/')) actualMime = 'audio/webm;codecs=opus'

                const blob = new Blob(audioChunksRef.current, { type: actualMime })
                audioChunksRef.current = []
                setIsRecording(false)
                setRecordingSeconds(0)
                if (recordingTimerRef.current) { clearInterval(recordingTimerRef.current); recordingTimerRef.current = null }
                if (blob.size === 0) return

                const ext = actualMime.includes('webm') ? 'webm' : actualMime.includes('ogg') ? 'ogg' : actualMime.includes('mp4') ? 'm4a' : 'bin'
                const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
                try { await addFile(actualMime, `${ts}.${ext}`, blob) } catch (e) { tipError(e, '添加语音失败') }
            }
            mediaRecorderRef.current = recorder
            recorder.start()
            setIsRecording(true)
            setRecordingSeconds(0)
            recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000)
        } catch (e) {
            tipError(e, '无法访问麦克风')
        }
    }, [])

    function toggleRecording() { if (isRecording) stopRecording(); else startRecording() }

    React.useEffect(() => {
        return () => {
            const recorder = mediaRecorderRef.current
            if (recorder && recorder.state !== 'inactive') { try { recorder.stop() } catch { } }
            audioStreamRef.current?.getTracks().forEach(t => t.stop())
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
        }
    }, [])

    let chatSettings: any = {}
    try { chatSettings = JSON.parse(chat.settings || '{}') } catch { }
    const canJoin = chatSettings.allow_join === true

    // Virtuoso 的 itemContent 应该用稳定引用, 避免每次渲染都创建新函数
    const itemContent = React.useCallback((_index: number, seq: number) => {
        const { messageMap } = useChatMessageStore.getState()
        if (seq == null) return <div style={{ height: '0.5px' }} />
        const msg = messageMap.get(seq)
        if (!msg) return <div style={{ height: '0.5px' }} />
        return <ChatMessage
            key={seq}
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
                <mdui-menu-item icon="reply" onClick={() => {
                    insertText(`[reply:${msg.id}] `)
                    // 回复和编辑互斥
                    if (editingMessage) cancelEdit()
                }}>回复</mdui-menu-item>
                <mdui-menu-item icon="info" onClick={() => dialog({
                    headline: "Info",
                    body: `<span style="word-break: break-word;">${Object.keys(msg).map((k) => `${k} = ${JSON.stringify((msg as any)[k])}`).join('<br><br>')}<span>`,
                    closeOnEsc: true,
                    closeOnOverlayClick: true,
                    actions: [{ text: "关闭", onClick: () => true }]
                })}>Info</mdui-menu-item>
            </>}
        />
    }, [])

    return <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', width: '100%' }}>
        <div style={{ display: 'none' }}>
            <input accept="*/*" type="file" name="添加文件" multiple ref={attachFileInputRef}></input>
        </div>

        <mdui-top-app-bar scroll-target={'#' + id}>
            <mdui-button-icon icon="menu" onClick={() => { drawerRef.current && (drawerRef.current.open = !drawerRef.current.open) }}></mdui-button-icon>
            <mdui-top-app-bar-title style={{ marginLeft: '8px' }}>{chat.title}</mdui-top-app-bar-title>
            <div style={{ flexGrow: 1 }}></div>
            {ClientConfigInstance.meetingEnabled && <mdui-button-icon icon="call" style={{ marginRight: '4px' }} onClick={onCallClick}></mdui-button-icon>}
            <mdui-button-icon icon="group" style={{ marginRight: '4px' }} onClick={() => ChatMembersAndAdminsDialog.show(chat.id)}></mdui-button-icon>
            <mdui-button-icon icon="settings" style={{ marginRight: '4px' }} onClick={() => ChatSettingsDialog.show(chat.id)}></mdui-button-icon>
            <mdui-button-icon icon="info" style={{ marginRight: '4px' }} onClick={() => ChatProfileDialog.show(chat.id)}></mdui-button-icon>
        </mdui-top-app-bar>

        {!!meeting.getActiveMeeting(chat.id) && (
            <div style={{ position: 'absolute', top: '64px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 6, pointerEvents: 'none' }}>
                <div style={{ pointerEvents: 'auto', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 6px 4px 14px', borderRadius: '999px', background: 'rgb(var(--mdui-color-primary-container))', color: 'rgb(var(--mdui-color-on-primary-container))', boxShadow: 'var(--mdui-elevation-level3)', fontSize: '13px' }}>
                    <span>会议进行中</span>
                    {meetingWindow.isSupported()
                        ? <mdui-button variant="text" onClick={() => openMeetingWindow()}>
                            {meetingWindow.isOpen(chat.id) ? '回到会议' : '加入'}
                        </mdui-button>
                        : (meeting.isInMeeting(chat.id)
                            ? <mdui-button variant="text" onClick={() => MeetingManager.leave()}>离开</mdui-button>
                            : <mdui-button variant="text" onClick={() => {
                                const active = meeting.getActiveMeeting(chat.id)!
                                MeetingManager.joinMeeting(chat.id, active.meetingId, chat.title ?? undefined).catch((e) => tipError(e, '加入会议失败'))
                            }}>加入</mdui-button>)}
                </div>
            </div>
        )}

        <div id={id} style={{ display: 'flex', width: '100%', justifyContent: chat.is_member ? undefined : 'center' }}>
            <div style={{ display: chat.is_member ? 'none' : undefined, alignSelf: 'center', maxWidth: '300px', textAlign: 'center' }}>
                {canJoin
                    ? <mdui-button onClick={async () => {
                        try {
                            await ChatApi.joinChat(ClientManager.client, {
                                access_token: ClientManager.getActiveUserSession().token,
                                chat_id: chat.id,
                            })
                        } catch (e) { console.log(e); tipError(e, "加入对话失败"); return }
                        try {
                            setChat(await ChatApi.queryChatInfo(ClientManager.client, {
                                access_token: ClientManager.getActiveUserSession().token,
                                chat_id: chat.id,
                            }))
                            showSnackbar({ message: "已加入对话" })
                        } catch (e) { console.log(e); tipError(e, "重新打开对话失败") }
                    }}>加入对话</mdui-button>
                    : <div>
                        <div>该群未开放加入</div>
                        <div style={{ fontSize: '85%', opacity: 0.7, marginTop: '6px' }}>
                            需管理员在「对话设定 → 入群」中开启「允许加入」
                        </div>
                    </div>}
            </div>

            <MessageContainer ref={containerRef} style={{ display: chat.is_member ? 'flex' : 'none' }}>
                {sortedIds.length > 0 && (
                    <Virtuoso
                        ref={virtuosoRef}
                        key={chat.id}
                        style={{ overflowY: 'auto', height: '100%' }}
                        data={sortedIds}
                        firstItemIndex={firstItemIndex}
                        initialTopMostItemIndex={{ index: 'LAST', align: 'end' }}
                        followOutput={(isAtBottom) => isAtBottom ? 'smooth' : false}
                        atTopThreshold={300}
                        atBottomThreshold={80}
                        atTopStateChange={atTopStateChange}
                        atBottomStateChange={atBottomStateChange}
                        computeItemKey={(_, seq) => seq}
                        increaseViewportBy={{ top: 300, bottom: 300 }}
                        itemContent={itemContent}
                    />
                )}

                <div style={{ flexGrow: 1 }}></div>

                {editingMessage && (
                    <div style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', background: 'rgba(var(--mdui-color-primary), 0.08)', borderLeft: '3px solid rgb(var(--mdui-color-primary))', margin: '0 4px', borderRadius: '4px' }}>
                        <span style={{ flex: 1, fontSize: '90%', opacity: 0.8 }}>正在编辑消息</span>
                        <mdui-button-icon icon="close" onClick={cancelEdit} />
                    </div>
                )}
                {isRecording && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', background: 'rgba(var(--mdui-color-error), 0.08)', borderLeft: '3px solid rgb(var(--mdui-color-error))', margin: '0 4px', borderRadius: '4px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgb(var(--mdui-color-error))', animation: 'lingcat-pulse 1s infinite' }} />
                        <style>{`@keyframes lingcat-pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
                        <span style={{ flex: 1, fontSize: '90%' }}>正在录音... {formatDuration(recordingSeconds)}</span>
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
                    style={{ padding: '4px' }}
                    onKeyDown={(event) => { if (event.ctrlKey && event.key == 'Enter') sendOrEditMessage() }}
                    onPaste={(event) => {
                        for (const item of event.clipboardData.items) {
                            if (item.kind == 'file') {
                                event.preventDefault()
                                addFile(item.type, (item.getAsFile() as File).name, item.getAsFile() as File)
                            }
                        }
                    }}
                    onDrop={(e) => {
                        e.preventDefault()
                        function getFileNameOrRandom(urlString: string) {
                            const url = new URL(urlString)
                            let filename = url.pathname.substring(url.pathname.lastIndexOf('/') + 1).trim()
                            if (filename == '') filename = 'file_' + Date.now()
                            return filename
                        }
                        for (const item of e.dataTransfer.items) {
                            if (item.type == 'text/uri-list') {
                                item.getAsString(async (url) => {
                                    try {
                                        const re = await fetch(url)
                                        const type = re.headers.get("Content-Type")
                                        if (type && re.ok) addFile(type, getFileNameOrRandom(url), re)
                                    } catch (e) {
                                        showSnackbar({ message: '无法解析链接: ' + (e as Error).message })
                                    }
                                })
                            } else if (item.type == 'text/plain') {
                                item.getAsString((text) => insertText(text + ' '))
                            } else if (item.kind == 'file') {
                                const file = item.getAsFile() as File
                                addFile(item.type, file.name, file)
                            }
                        }
                    }}>
                    <mdui-button-icon slot="end-icon" icon={isRecording ? "stop_circle" : "mic"} onClick={toggleRecording} style={isRecording ? { color: 'rgb(var(--mdui-color-error))' } : undefined}></mdui-button-icon>
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