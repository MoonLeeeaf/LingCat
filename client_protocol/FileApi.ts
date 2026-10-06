import { LingCatProto, Methods, sha256Hex } from "lingcat-protocol"
import LingCatClient from "./LingCatClient.ts"
import decodeOrThrow from "./decodeOrThrow.ts"

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
}