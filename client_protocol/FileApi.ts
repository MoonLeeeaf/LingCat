import { LingCatProto, Methods, sha256Hex } from "lingcat-protocol"
import LingCatClient from "./LingCatClient.ts"
import decodeOrThrow from "./decodeOrThrow.ts"

export interface UploadSessionInfo {
    upload_id: string
    offset: number
    chunk_size: number
    upload_token: string
}

export interface UploadStatusInfo {
    offset: number
    total_size: number
    expires_at: number
}

export default class FileApi {
    static async requestUploadFileToken(client: LingCatClient, {
        access_token,
        timeout,
    }: {
        access_token: string
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.Request_File_Upload_Response>(LingCatProto.methods.Request_File_Upload_Response, (await client.invoke({
            method_id: Methods.Request_File_Upload_Request,
            data: LingCatProto.methods.Request_File_Upload_Request.encode({
                accessToken: access_token,
            }).finish(),
            timeout,
        })).data).token
    }
    static async requestAccessUploadFileToken(client: LingCatClient, {
        access_token,
        file_hash,
        timeout,
    }: {
        access_token: string
        file_hash?: string
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.Request_File_Access_Response>(LingCatProto.methods.Request_File_Access_Response, (await client.invoke({
            method_id: Methods.Request_File_Access_Request,
            data: LingCatProto.methods.Request_File_Access_Request.encode({
                accessToken: access_token,
                fileHash: file_hash,
            }).finish(),
            timeout,
        })).data).token
    }
    static async uploadFile(client: LingCatClient, {
        file_upload_token,
        belong_to_chat_id,
        file_data,
        mime,
        file_name,
    }: {
        file_upload_token: string
        belong_to_chat_id?: string | null
        file_data: ArrayBuffer | Blob | Response
        mime?: string
        file_name?: string
    }): Promise<string> {
        let buffer: Uint8Array
        let detectedMime = mime

        if (file_data instanceof ArrayBuffer) {
            buffer = new Uint8Array(file_data)
        } else if (file_data instanceof Blob) {
            buffer = new Uint8Array(await file_data.arrayBuffer())
            detectedMime = detectedMime || file_data.type || undefined
        } else if (file_data instanceof Response) {
            if (!file_data.ok) throw new Error('Response not OK')
            buffer = new Uint8Array(await file_data.arrayBuffer())
            detectedMime = detectedMime || file_data.headers.get('Content-Type') || undefined
        } else {
            throw new Error('Unsupported file_data type')
        }

        const form = new FormData()
        form.append("file", new File([buffer], file_name || "File", { type: detectedMime || 'application/octet-stream' }))
        // form.append('hash', sha256Hex(new TextEncoder().encode('file_upload'), buffer))
        belong_to_chat_id && form.append('belong_to_chat_id', belong_to_chat_id)
        detectedMime && form.append('mime', detectedMime)
        file_name && form.append('file_name', file_name)

        const re = await fetch(client.server_http + (client.server_http.endsWith('/') ? '' : '/') + 'upload_file', {
            method: 'POST',
            headers: {
                Token: file_upload_token
            } as HeadersInit,
            body: form,
            credentials: 'omit',
        })
        const text = await (await re.blob()).text()
        let json: { message: string, file_hash: string } | undefined
        try {
            json = JSON.parse(text)
        } catch (e) {
            throw {
                message: text,
                cause: text,
                code: re.status,
            }
        }
        if (!re.ok) throw {
            message: text,
            code: re.status,
        }
        return json!.file_hash
    }
    // ================= 新增：会话管理 =================

    static async createUploadSession(client: LingCatClient, token: string, params: {
        size: number, file_name: string, mime: string, belong_to_chat_id?: string, hash?: string
    }): Promise<UploadSessionInfo> {
        const url = `${client.server_http.replace(/\/$/, '')}/upload_file/session`
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Token': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(params)
        })
        if (!res.ok) throw new Error(`Create session failed: ${res.status}`)
        return await res.json()
    }

    static async getUploadStatus(client: LingCatClient, token: string, uploadId: string): Promise<UploadStatusInfo> {
        const url = `${client.server_http.replace(/\/$/, '')}/upload_file/session/${uploadId}`
        const res = await fetch(url, {
            method: 'HEAD',
            headers: { 'Token': token }
        })
        if (!res.ok) throw new Error(`Get status failed: ${res.status}`)
        return {
            offset: parseInt(res.headers.get('Upload-Offset') || '0', 10),
            total_size: parseInt(res.headers.get('Upload-Length') || '0', 10),
            expires_at: parseInt(res.headers.get('Upload-Expires') || '0', 10)
        }
    }

    static async completeUpload(client: LingCatClient, token: string, uploadId: string): Promise<string> {
        const url = `${client.server_http.replace(/\/$/, '')}/upload_file/session/${uploadId}/complete`
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Token': token, 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        })
        if (!res.ok) throw new Error(`Complete upload failed: ${res.status}`)
        const data = await res.json()
        return data.file_hash
    }

    static async abortUpload(client: LingCatClient, token: string, uploadId: string): Promise<void> {
        const url = `${client.server_http.replace(/\/$/, '')}/upload_file/session/${uploadId}`
        await fetch(url, {
            method: 'DELETE',
            headers: { 'Token': token }
        })
    }

    // ================= 新增：断点续传 =================

    static async uploadFileResumable(
        client: LingCatClient,
        fileUploadToken: string,
        file: File | Blob, // 直接传 File 对象，千万别转 ArrayBuffer 了！
        fileName: string,
        mime: string,
        belongToChatId?: string,
        onProgress?: (percent: number) => void,
        signal?: AbortSignal
    ): Promise<string> {

        const totalSize = file.size
        // 1. 创建会话
        const session = await this.createUploadSession(client, fileUploadToken, {
            size: totalSize,
            file_name: fileName,
            mime: mime,
            belong_to_chat_id: belongToChatId
        })

        let currentOffset = session.offset
        let maxRetries = 5
        let retries = 0

        // 2. 循环上传分块
        while (currentOffset < totalSize) {
            if (signal?.aborted) {
                await this.abortUpload(client, session.upload_token, session.upload_id).catch(() => { })
                throw new Error('Upload aborted')
            }

            const chunkLength = Math.min(totalSize - currentOffset, session.chunk_size)
            const chunk = file.slice(currentOffset, currentOffset + chunkLength)

            try {
                await this.uploadChunk(client, session.upload_token, session.upload_id, chunk, currentOffset, totalSize, (chunkPercent) => {
                    if (onProgress) {
                        // 计算全局进度
                        const overallPercent = Math.floor(((currentOffset + chunkLength * (chunkPercent / 100)) / totalSize) * 100)
                        onProgress(overallPercent)
                    }
                }, signal)

                currentOffset += chunkLength
                retries = 0 // 重置重试次数
            } catch (err: any) {
                // 处理 409 冲突 (服务端 offset 不一致)
                if (err.status === 409) {
                    const status = await this.getUploadStatus(client, session.upload_token, session.upload_id)
                    currentOffset = status.offset
                    continue
                }

                // 网络错误，进行重试
                retries++
                if (retries > maxRetries) {
                    throw new Error(`Max retries reached: ${err.message}`)
                }

                // 指数退避等待
                await new Promise(r => setTimeout(r, 1000 * retries))

                // 重新拉取 offset，防止其实已经传成功了
                try {
                    const status = await this.getUploadStatus(client, session.upload_token, session.upload_id)
                    currentOffset = status.offset
                } catch (e) {
                    // 如果查状态也失败，可能彻底断网了，继续循环重试
                }
            }
        }

        // 3. 完成上传
        if (onProgress) onProgress(100)
        return await this.completeUpload(client, session.upload_token, session.upload_id)
    }

    /**
     * 内部方法：通过 XMLHttpRequest 上传单个分块（为了获取上传进度）
     */
    private static uploadChunk(
        client: LingCatClient,
        token: string,
        uploadId: string,
        chunk: Blob,
        startOffset: number,
        totalSize: number,
        onProgress: (chunkPercent: number) => void,
        signal?: AbortSignal
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            const url = `${client.server_http.replace(/\/$/, '')}/upload_file/session/${uploadId}`

            xhr.open('PATCH', url)
            xhr.setRequestHeader('Token', token)
            xhr.setRequestHeader('Content-Type', 'application/offset+octet-stream')
            // 必须带上 Content-Range，否则服务端不知道这块数据从哪开始
            xhr.setRequestHeader('Content-Range', `bytes ${startOffset}-${startOffset + chunk.size - 1}/${totalSize}`)

            if (signal) {
                signal.addEventListener('abort', () => {
                    xhr.abort()
                    reject(new Error('Aborted'))
                })
            }

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percent = Math.floor((event.loaded / event.total) * 100)
                    onProgress(percent)
                }
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve()
                } else {
                    const error: any = new Error(`Chunk upload failed: ${xhr.status}`)
                    error.status = xhr.status
                    error.response = xhr.responseText
                    reject(error)
                }
            }

            xhr.onerror = () => reject(new Error('Network error during chunk upload'))
            xhr.send(chunk)
        })
    }
}