import { Code, LingCatProto, Methods, Package } from 'lingcat-protocol'
import type { ISendPackageFunction } from './ISendPackageFunction.ts'
import TokenManager from './TokenManager.ts'
import sendError from './sendError.ts'
import { consumeOAuthTicket } from '../oauth.ts'

export default class OAuthApi {
    static async onCall(sendPackage: ISendPackageFunction, mPackage: Package) {
        switch (mPackage.method_id) {
            /**
             * 用 OIDC 一次性票据换取本地 access_token
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
            default: {
                return false
            }
        }
        return true
    }
}
