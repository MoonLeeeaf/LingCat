import { LingCatProto, Methods, Package } from "lingcat-protocol"
import type { ISendPackageFunction } from "./ISendPackageFunction.ts"

export default class ServerApi {
    static async onCall(sendPackage: ISendPackageFunction, mPackage: Package) {
        switch (mPackage.method_id) {
            /**
             * ===============================
             *             Ping 请求
             * ===============================
             */
            case Methods.Ping_Request: {
                const t: any = LingCatProto.methods.Ping_Request.decode(mPackage.data).time
                // uint64 在 protobufjs 里可能是 Long 对象, 需转成 number 再运算
                const sentAt = typeof t === 'number'
                    ? t
                    : (t && typeof t.toNumber === 'function' ? t.toNumber() : (Number(t) || 0))
                sendPackage(Package.encode({
                    method_id: Methods.Ping_Response,
                    flags: 0,
                    data: LingCatProto.methods.Ping_Response.encode({
                        usage: Date.now() - sentAt
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