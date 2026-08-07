import { Virtuoso, VirtuosoHandle } from "react-virtuoso"
import MessageContainer from "../chat-layout/MessageContainer.tsx"
import UserProfileDialog from "../UserProfileDialog.tsx"
import ChatMessage from "./ChatMessage.tsx"
import { useChatMessageStore } from "./useChatMessageStore.ts"
import { IChat, IMessage, LingCatProto, Methods, Package } from "lingcat-protocol"
import React from "react"
import { NavigationDrawer, TextField } from "mdui"
import { ChatApi, FileApi } from "lingcat-client-protocol"
import ClientManager from "../../ClientManager.ts"
import tipError from "../tipError.ts"
import ChatProfileDialog from "../ChatProfileDialog.tsx"
import { ReactRenderer } from "marked-react"
import ReloadableImage from "../ReloadableImage.tsx"
import showSnackbar from "../showSnackbar.ts"
import useEventListener from "../useEventListener.ts"
import ImageViewerDialog from "../ImageViewerDialog.tsx"
import VideoViewerDialog from "../VideoViewerDialog.tsx"
import MduiPatchedTextAreaElement from "../MduiPatchedTextAreaElement.ts"
import escapeHtml from "../escapeHtml.ts"
import ChatSettingsDialog from "../ChatSettingsDialog.tsx"
import ChatMembersAndAdminsDialog from "../ChatMembersAndAdminsDialog.tsx"

function isApproximatelyAtBottom(scroller: HTMLElement, threshold: number = 20): boolean {
    if (!scroller) return false
    const { scrollTop, scrollHeight, clientHeight } = scroller
    return scrollTop + clientHeight >= scrollHeight - threshold
}

function VideoAttachment({ src }: { src: string }) {
    return <video onClick={() => VideoViewerDialog.show(src)} src={src} style={{
        maxWidth: "400px",
        maxHeight: "300px",
        width: "100%",
        height: "100%",
        display: 'block',
    }}></video>
}

function FileAttachment({ src, name }: { src: string, name: string }) {
    return <a style={{
        width: '100%',
        height: '100%',
        textDecoration: 'none',
        color: 'inherit',
    }} href={src} download={src}>
        <mdui-card
            clickable
            style={{
                display: 'flex',
                alignItems: 'center',
                boxShadow: 'inherit',
                borderRadius: 'inherit',
            }}>
            <mdui-icon
                name="insert_drive_file"
                style={{
                    margin: '13px',
                    fontSize: '34px',
                }} />
            <span
                style={{
                    marginRight: '13px',
                    wordWrap: 'break-word',
                    wordBreak: 'break-all',
                    whiteSpace: 'normal',
                    maxWidth: '100%',
                }}>
                {name}
            </span>
        </mdui-card>
    </a>
}

export default function ChatFragment({ chat, drawerRef }: { chat: IChat, drawerRef: React.RefObject<NavigationDrawer | undefined> }) {
    const virtuosoRef = React.useRef<VirtuosoHandle>(null)
    const containerRef = React.useRef<HTMLDivElement>(null)

    const messageStore = useChatMessageStore()

    React.useEffect(() => {
        (async () => {
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
                        virtuosoRef.current?.scrollToIndex(msgs[msgs.length - 1].id)
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
            const { appendMessages } = useChatMessageStore.getState()
            // TODO: 向 lingcat-client-protocol 添加全局的监听方法
            if (mPackage.method_id == Methods.Receive_Chat_Message_Event) {
                const raw = LingCatProto.methods.Receive_Chat_Message_Event.decode(mPackage.data).msg
                appendMessages([{
                    id: raw?.id!,
                    text: raw?.text!,
                    time: raw?.time!,
                    sender_user_id: raw?.senderUserId,
                    system: raw?.system,
                    chat_id: raw?.chatId!,
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
        console.log('top', atTop, loadingRef.current)
        if (!atTop || loadingRef.current) return

        (async () => {
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
        console.log('bottom', atBottom, loadingRef.current)
        if (!atBottom || loadingRef.current) {
            isAtBottomRef.current = atBottom
            return
        }

        (async () => {
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
    async function sendMessage() {
        let text = inputRef.current?.value || ''
        if (text.trim() == '') return

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
                        file_data: cachedFiles.current[fileName]
                    })
                    text = text.replaceAll('(' + fileName + ')', '(lingcat://file?hash=' + hash + ')')
                }
            }
            await ChatApi.sendChatMessage(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                chat_id: chat.id,
                text,
            })
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

    const render: Partial<ReactRenderer> = {
        image(src, alt, _title) {
            console.log('image', src)
            const type = /^(Video|File)=.*/.exec(alt)?.[1]
            const fileType = /^(Video|File)=.*/.exec(alt)?.[1] || 'Image'
            if (fileType != null && /lingcat:\/\/file\?hash=[A-Za-z0-9]+$/.test(src)) {
                const url = ClientManager.client.getFileUrlByHash(/^lingcat:\/\/file\?hash=(.*)/.exec(src)?.[1]!)
                // 注意返回的元素必须是函数式组件
                // 否则无法识别为独立的元素
                // 使用 React.createElement(() => <component />) 会导致不必要的开销
                // 且移动端会导致严重问题
                return ({
                    Image: <ReloadableImage src={url} alt={alt} onClick={() => ImageViewerDialog.show(url)} style={{
                        width: '100%',
                        maxHeight: "300px",
                        objectFit: 'cover',
                        display: 'block',
                    }} />,
                    Video: <VideoAttachment src={url} />,
                    File: <FileAttachment src={url} name={/^Video|File=(.*)/.exec(alt)?.[1] || 'Unnamed file'} />,
                })?.[fileType] || <em>{'<'}无法解析的消息元素{'>'}</em>
            }
            return <ReloadableImage src={src} alt={alt} />
        },
    }

    const attachFileInputRef = React.useRef<HTMLInputElement>(null)
    const cachedFiles = React.useRef<{ [fileName: string]: ArrayBuffer }>({})
    const cachedFileUrls = React.useRef<{ [fileName: string]: string }>({})
    const cachedFileNamesCount = React.useRef<{ [fileName: string]: number }>({})

    /* function insertAttachment(text: string, type: 'image' | 'video' | 'file', src: string, alt?: string) {
        const input = inputRef.current!.shadowRoot!.querySelector('[part=input]') as MduiPatchedTextAreaElement
        input.focus()
        type == 'image' && input.insertHtml(`
            <span contenteditable="false" style="display:inline-block;"><mdui-card style="max-width: 10%; max-height: 10%"><img src="${src}" style="display: block; width: 100%; height: 100%" /><span style="display:none;">${text}</span></mdui-card>\u200B</span>
        `.trim())
        type == 'video' && input.insertHtml(`
            <span contenteditable="false" style="display:inline-block;"><mdui-card style="max-width: 10%; max-height: 10%"><video src="${src}" style="display: block; width: 100%; height: 100%" /><span style="display:none;">${text}</span></mdui-card>\u200B</span>
        `.trim())
        type == 'file' && input.insertHtml(`
            <span contenteditable="false" style="display:inline-block;"><mdui-card><span style="padding: 10px">${alt}</span></mdui-card>\u200B</span>
        `.trim())
    } */
    function insertText(text: string) {
        const input = inputRef.current!.shadowRoot!.querySelector('[part=input]') as MduiPatchedTextAreaElement
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
        const src = URL.createObjectURL(blob)
        cachedFileUrls.current[name] = src
        cachedFileNamesCount.current[name] = 1
        if (type.startsWith('image/'))
            insertText(`![图片](${name})`)
        else if (type.startsWith('video/'))
            insertText(`![Video=${name}](${name})`)
        else
            insertText(`![File=${name}](${name})`)
        /* if (type.startsWith('image/'))
            insertAttachment(`![图片](${name})`, 'image', src)
        else if (type.startsWith('video/'))
            insertAttachment(`![Video=${name}](${name})`, 'video', src)
        else
            insertAttachment(`![File=${name}](${name})`, 'file', src, name) */
    }

    useEventListener(attachFileInputRef, 'change', (_e) => {
        const files = attachFileInputRef.current!.files as unknown as File[]
        if (files?.length == 0) return

        for (const file of files) {
            addFile(file.type, file.name, file)
        }
        attachFileInputRef.current!.value = ''
    })

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
            <mdui-button-icon icon="group" style={{ marginRight: '4px' }} onClick={() => ChatMembersAndAdminsDialog.show(chat.id)}></mdui-button-icon>
            <mdui-button-icon icon="settings" style={{ marginRight: '4px' }} onClick={() => ChatSettingsDialog.show(chat.id)}></mdui-button-icon>
            <mdui-button-icon icon="info" style={{ marginRight: '4px' }} onClick={() => ChatProfileDialog.show(chat.id)}></mdui-button-icon>
        </mdui-top-app-bar>

        <div id={id} style={{ display: 'flex', width: '100%' }}>
            <MessageContainer ref={containerRef}>
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
                        return <ChatMessage onAvatarClick={() => msg.sender_user_id && UserProfileDialog.show(msg.sender_user_id)} render={render} msg={msg} messageMenus={<>
                            <mdui-menu-item icon="info">Info</mdui-menu-item>
                        </>} />
                    }} />

                <div style={{
                    flexGrow: 1,
                }}></div>
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
                            sendMessage()
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
                    <mdui-button-icon slot="end-icon" icon="attachment" onClick={() => attachFileInputRef.current!.click()}></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '20px' }}></div>
                    <mdui-button-icon slot="end-icon" icon="send" onClick={() => sendMessage()}></mdui-button-icon>
                    <div slot="end-icon" style={{ paddingRight: '5px' }}></div>
                </mdui-text-field>
            </MessageContainer>
        </div>
    </div >
}