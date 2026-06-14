import { LingCatProto, Methods, Package } from "lingcat-protocol"
import type { ISendPackageFunction } from "./ISendPackageFunction.ts"
import TokenManager from "./TokenManager.ts"

export default class FileApi {
    static async onCall(sendPackage: ISendPackageFunction, mPackage: Package) {
        switch (mPackage.method_id) {
            // 请求文件上传密钥
            case Methods.Request_File_Upload_Request: {
                const user_id = TokenManager.verifyTokenAndGetUserId(
                    LingCatProto.methods.Request_File_Upload_Request.decode(mPackage.data).accessToken,
                    'access'
                )

                sendPackage(Package.encode({
                    method_id: Methods.Request_File_Upload_Response,
                    flags: 0,
                    data: LingCatProto.methods.Request_File_Upload_Response.encode({
                        token: TokenManager.signFileUploadTokenForUser(user_id)
                    }).finish()
                }))
                break
            }
            case Methods.File_Upload_Request: {
                const user_id = TokenManager.verifyTokenAndGetUserId(
                    LingCatProto.methods.Request_File_Upload_Request.decode(mPackage.data).accessToken,
                    'access'
                )

                sendPackage(Package.encode({
                    method_id: Methods.Request_File_Upload_Response,
                    flags: 0,
                    data: LingCatProto.methods.Request_File_Upload_Response.encode({
                        
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