import { LingCatProto, Methods } from "lingcat-protocol"
import { IUser } from "../protocol/classes-interfaces.ts"
import LingCatClient from "./main.ts"

export default class User implements IUser {
    id: string
    username?: string | null
    nickname: string

    client: LingCatClient
    constructor(client: LingCatClient) {
        this.client = client
    }

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

    static async getById(client: LingCatClient, id: string) {

    }
}
