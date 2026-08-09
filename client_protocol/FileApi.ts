import { LingCatProto, Methods, sha256Hex } from "lingcat-protocol"
import LingCatClient from "./LingCatClient.ts"
import decodeOrThrow from "./decodeOrThrow.ts"

export default class UserApi {
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
        timeout,
    }: {
        access_token: string
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.Request_File_Access_Response>(LingCatProto.methods.Request_File_Access_Response, (await client.invoke({
            method_id: Methods.Request_File_Access_Request,
            data: LingCatProto.methods.Request_File_Access_Request.encode({
                accessToken: access_token,
            }).finish(),
            timeout,
        })).data).token
    }
    static async uploadFile(client: LingCatClient, {
        file_upload_token,
        belong_to_chat_id,
        file_data,
    }: {
        file_upload_token: string
        belong_to_chat_id?: string | null
        file_data: ArrayBuffer | Blob | Response
    }): Promise<string> {
        let buffer: Uint8Array
        if (file_data instanceof ArrayBuffer) {
            buffer = new Uint8Array(file_data)
        } else if (file_data instanceof Blob) {
            buffer = new Uint8Array(await file_data.arrayBuffer())
        } else if (file_data instanceof Response) {
            if (!file_data.ok) throw new Error('Response not OK')
            buffer = new Uint8Array(await file_data.arrayBuffer())
        } else {
            throw new Error('Unsupported file_data type')
        }

        const form = new FormData()
        form.append("file", new File([buffer], "File", { type: 'application/octet-stream' }))
        // form.append('hash', sha256Hex(new TextEncoder().encode('file_upload'), buffer))
        belong_to_chat_id && form.append('belong_to_chat_id', belong_to_chat_id)

        const re = await fetch(client.server_http + '/upload_file', {
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