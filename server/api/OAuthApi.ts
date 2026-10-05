import { Code, LingCatProto, Methods, Package } from 'lingcat-protocol'
import type { ISendPackageFunction } from './ISendPackageFunction.ts'
import TokenManager from './TokenManager.ts'
import sendError from './sendError.ts'
import OAuthIdentity from '../data/OAuthIdentity.ts'
import { consumeOAuthTicket } from '../oauth.ts'

export default class OAuthApi {
    static async onCall(sendPackage: ISendPackageFunction, mPackage: Package) {
        switch (mPackage.method_id) {
            /**
             * 用 OIDC/OAuth2 一次性票据换取本地 access_token
             */
            case Methods.Exchange_OAuth_Code_Request: {
                const data = LingCatProto.methods.Exchange_OAuth_Code_Request.decode(mPackage.data)
                const userId = consumeOAuthTicket(data.ticket)
                if (!userId)
                    return sendError(sendPackage, mPackage.method_id, 'OAuth 票据无效或已过期', Code.Forbidden)

                sendPackage(Package.encode({
                    method_id: Methods.Exchange_OAuth_Code_Response,
                    flags: 0,
                    data: LingCatProto.methods.Exchange_OAuth_Code_Response.encode({
                        accessToken: TokenManager.signAccessTokenForUser(userId),
                    }).finish(),
                }))
                break
            }
            /**
             * 查询我已绑定的 OAuth 提供方
             */
            case Methods.Get_OAuth_Bindings_Request: {
                const data = LingCatProto.methods.Get_OAuth_Bindings_Request.decode(mPackage.data)
                const userId = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const bindings = await OAuthIdentity.getByUser(userId)

                sendPackage(Package.encode({
                    method_id: Methods.Get_OAuth_Bindings_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_OAuth_Bindings_Response.encode({
                        providers: bindings.map((b) => b.provider),
                    }).finish(),
                }))
                break
            }
            /**
             * 解绑指定 OAuth 提供方
             */
            case Methods.Unbind_OAuth_Request: {
                const data = LingCatProto.methods.Unbind_OAuth_Request.decode(mPackage.data)
                const userId = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                await OAuthIdentity.unlink(data.provider, userId)

                sendPackage(Package.encode({
                    method_id: Methods.Unbind_OAuth_Response,
                    flags: 0,
                    data: LingCatProto.methods.Unbind_OAuth_Response.encode({}).finish(),
                }))
                break
            }
            default: {
                return false
            }
        }
        return true
    }
}
