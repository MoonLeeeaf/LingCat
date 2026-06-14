import { LingCatProto, Methods, Package } from "lingcat-protocol"
import type { ISendPackageFunction } from "./ISendPackageFunction.ts"

export default class ServerApi {
    static async onCall(sendPackage: ISendPackageFunction, mPackage: Package) {
        switch (mPackage.method_id) {
            // Ping 请求
            case Methods.Ping_Request: {
                sendPackage(Package.encode({
                    method_id: Methods.Ping_Response,
                    flags: 0,
                    data: LingCatProto.methods.Ping_Response.encode({
                        usage: Date.now() - LingCatProto.methods.Ping_Request.decode(mPackage.data).time
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