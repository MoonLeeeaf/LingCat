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

    /** 查询我已绑定的 OAuth 提供方 id 列表 */
    static async getOAuthBindings(client: LingCatClient, {
        access_token,
        timeout,
    }: {
        access_token: string
        timeout?: number
    }) {
        const res = decodeOrThrow<LingCatProto.methods.Get_OAuth_Bindings_Response>(
            LingCatProto.methods.Get_OAuth_Bindings_Response,
            (await client.invoke({
                method_id: Methods.Get_OAuth_Bindings_Request,
                data: LingCatProto.methods.Get_OAuth_Bindings_Request.encode({
                    accessToken: access_token,
                }).finish(),
                timeout,
            })).data
        )
        return res.providers ?? []
    }

    /** 解绑指定 OAuth 提供方 */
    static async unbindOAuth(client: LingCatClient, {
        access_token,
        provider,
        timeout,
    }: {
        access_token: string
        provider: string
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.Unbind_OAuth_Response>(
            LingCatProto.methods.Unbind_OAuth_Response,
            (await client.invoke({
                method_id: Methods.Unbind_OAuth_Request,
                data: LingCatProto.methods.Unbind_OAuth_Request.encode({
                    accessToken: access_token,
                    provider,
                }).finish(),
                timeout,
            })).data
        )
    }
}
