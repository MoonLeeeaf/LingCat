import { LingCatProto, Methods, Package } from "lingcat-protocol"
import type { ISendPackageFunction } from "./ISendPackageFunction.ts"
import TokenManager from "./TokenManager.ts"

export default class FileApi {
    static async onCall(sendPackage: ISendPackageFunction, mPackage: Package) {
        switch (mPackage.method_id) {
            /**
             * ===============================
             *         请求文件上传令牌
             * ===============================
             */
            case Methods.Request_File_Upload_Request: {
                const user_id = (await TokenManager.verifyAccessToken(
                    LingCatProto.methods.Request_File_Upload_Request.decode(mPackage.data).accessToken
                )).user_id

                sendPackage(Package.encode({
                    method_id: Methods.Request_File_Upload_Response,
                    flags: 0,
                    data: LingCatProto.methods.Request_File_Upload_Response.encode({
                        token: TokenManager.signFileUploadTokenForUser(user_id)
                    }).finish()
                }))
                break
            }
            /**
             * ===============================
             *         请求文件访问令牌
             * ===============================
             */
            case Methods.Request_File_Access_Request: {
                const user_id = (await TokenManager.verifyAccessToken(
                    LingCatProto.methods.Request_File_Access_Request.decode(mPackage.data).accessToken
                )).user_id

                sendPackage(Package.encode({
                    method_id: Methods.Request_File_Access_Response,
                    flags: 0,
                    data: LingCatProto.methods.Request_File_Access_Response.encode({
                        token: TokenManager.signFileAccessTokenForUser(user_id)
                    }).finish()
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