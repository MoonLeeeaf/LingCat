import { LingCatProto } from "lingcat-protocol"


export default function decodeOrThrow<T>(decodable: any, data: Uint8Array) {
    if (!(data instanceof Uint8Array)) {
        throw new Error(`decodeOrThrow: expected Uint8Array, got ${typeof data} (${(data as Object)?.constructor?.name})`)
    }
    const err = LingCatProto.methods.Error_Response.decode(data)
    if (err.requestMethod && err.message)
        throw {
            request_method: err.requestMethod,
            message: err.message,
            code: err.code || -2,
        }
    return decodable.decode(data) as T
}