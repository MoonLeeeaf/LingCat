import React from 'react'
import { FileApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import tipError from '../tipError.ts'

export interface UseChatFileUploadOptions {
    /** 附件被加入时，让输入框插入对应的引用文本 */
    onInsertText: (text: string) => void
}

export function useChatFileUpload({ onInsertText }: UseChatFileUploadOptions) {
    const cachedFiles = React.useRef<{ [name: string]: ArrayBuffer }>({})
    const cachedFileUrls = React.useRef<{ [name: string]: string }>({})
    const cachedFileMimes = React.useRef<{ [name: string]: string }>({})
    const cachedFileNamesCount = React.useRef<{ [name: string]: number }>({})

    const onInsertTextRef = React.useRef(onInsertText)
    React.useEffect(() => { onInsertTextRef.current = onInsertText })

    /**
     * 添加一个文件到缓存，并把引用文本插入输入框。
     * `data` 可以是 File / Blob / Response。
     */
    const addFile = React.useCallback(async (
        type: string,
        name_: string,
        data: Blob | Response,
    ) => {
        let name = name_
        while (cachedFiles.current[name] != null) {
            name = name_ + '_' + (cachedFileNamesCount.current[name] ?? 0)
            cachedFileNamesCount.current[name] = (cachedFileNamesCount.current[name] ?? 0) + 1
        }

        let blob: Blob
        try {
            blob = data instanceof Blob ? data : await (data as Response).blob()
        } catch (e) {
            tipError(e, '读取文件失败')
            return
        }

        const mime = blob.type || type || 'application/octet-stream'

        cachedFiles.current[name] = await blob.arrayBuffer()
        cachedFileUrls.current[name] = URL.createObjectURL(blob)
        cachedFileMimes.current[name] = mime
        cachedFileNamesCount.current[name] = 1

        const text = (() => {
            if (mime.startsWith('image/')) return `![图片-${name}](${name})`
            if (mime.startsWith('video/')) return `![视频-${name}](${name})`
            if (mime.startsWith('audio/')) return `![音频-${name}](${name})`
            return `![文件-${name}](${name})`
        })()
        onInsertTextRef.current(text)
    }, [])

    /**
     * 遍历 text 里引用的附件，逐个上传，把 `(name)` 替换成 `(file:xxx)`。
     * 返回处理后的文本。
     */
    const uploadAll = React.useCallback(async (text: string): Promise<string> => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) throw new Error('no active client/session')

        const namesInText = Object.keys(cachedFiles.current)
            .filter(name => text.includes('(' + name + ')'))
        if (namesInText.length === 0) return text

        const token = await FileApi.requestUploadFileToken(client, {
            access_token: session.token,
        })

        let result = text
        for (const name of namesInText) {
            const hash = await FileApi.uploadFile(client, {
                file_upload_token: token,
                file_data: cachedFiles.current[name],
                mime: cachedFileMimes.current[name],
                file_name: name,
            })
            result = result.replaceAll('(' + name + ')', '(file:' + hash + ')')
        }
        return result
    }, [])

    /** 统计文本中引用的附件数量 */
    const countInText = React.useCallback((text: string): number => {
        return Object.keys(cachedFiles.current)
            .filter(name => text.includes('(' + name + ')'))
            .length
    }, [])

    const clear = React.useCallback(() => {
        cachedFiles.current = {}
        for (const url of Object.values(cachedFileUrls.current)) {
            try { URL.revokeObjectURL(url) } catch { /* ignore */ }
        }
        cachedFileUrls.current = {}
        cachedFileMimes.current = {}
        cachedFileNamesCount.current = {}
    }, [])

    return { addFile, uploadAll, countInText, clear }
}