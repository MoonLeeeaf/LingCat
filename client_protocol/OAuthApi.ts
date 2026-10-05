import { LingCatProto, Methods } from 'lingcat-protocol'
import LingCatClient from './LingCatClient.ts'
import decodeOrThrow from './decodeOrThrow.ts'

export default class OAuthApi {
    /** 用 OIDC 一次性票据换取本地 access_token */
    static async exchangeOAuthCode(client: LingCatClient, {
        ticket,
        timeout,
    }: {
        ticket: string
        timeout?: number
    }) {
        const res = decodeOrThrow<LingCatProto.methods.Exchange_OAuth_Code_Response>(
            LingCatProto.methods.Exchange_OAuth_Code_Response,
            (await client.invoke({
                method_id: Methods.Exchange_OAuth_Code_Request,
                data: LingCatProto.methods.Exchange_OAuth_Code_Request.encode({
                    ticket,
                }).finish(),
                timeout,
            })).data
        )
        return res.accessToken
    }
}
