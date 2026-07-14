import { LingCatProto, Methods, Package } from "lingcat-protocol"
import { ISendPackageFunction } from "./ISendPackageFunction.ts"

export default function sendError(sendPackage: ISendPackageFunction, method_id: number, message: string, code?: number) {
    sendPackage(Package.encode({
        method_id: Methods.Error_Response,
        flags: 0,
        data: LingCatProto.methods.Error_Response.encode({
            requestMethod: method_id,
            message: message,
            code,
        }).finish(),
    }))
}