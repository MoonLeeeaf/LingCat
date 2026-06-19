import { LingCatProto, Methods } from "lingcat-protocol"
import LingCatClient from "./LingCatClient.ts"

export default class UserApi {
    static async register(client: LingCatClient, {
        password,
        nickname,
        username,
        timeout,
    }: {
        username?: string | null
        password: string
        nickname: string
        timeout?: number
    }) {
        return LingCatProto.methods.User_Registration_Response.decode((await client.invoke({
            method_id: Methods.User_Registration_Request,
            data: LingCatProto.methods.User_Registration_Request.encode({
                password,
                nickname,
                username,
            }).finish(),
            timeout,
        })).data).id
    }
    static async login(client: LingCatClient, {
        password,
        account,
        timeout,
    }: {
        password: string
        account: string
        timeout?: number
    }) {
        return LingCatProto.methods.User_Login_Response.decode((await client.invoke({
            method_id: Methods.User_Registration_Request,
            data: LingCatProto.methods.User_Login_Request.encode({
                password,
                account,
            }).finish(),
            timeout,
        })).data).accessToken
    }
}
