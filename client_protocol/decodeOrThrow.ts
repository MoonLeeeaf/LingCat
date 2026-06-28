import { LingCatProto } from "lingcat-protocol"


export default function decodeOrThrow<T>(decodable: any, data: Uint8Array) {
    try {
        return decodable.decode(data) as T
    } catch (e) {
        try {
            const err = LingCatProto.methods.Error_Response.decode(data)
            throw {
                request_method: err.requestMethod,
                message: err.message,
                code: err.code,
            }
        } catch (e2) {
            throw [e, e2]
        }
    }
}