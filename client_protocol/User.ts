import { LingCatProto, Methods } from "lingcat-protocol"
import { IUser } from "../protocol/classes-interfaces.ts"
import LingCatClient from "./LingCatClient.ts"

export default class User implements IUser {
    id: string
    username?: string | null
    nickname: string

    client: LingCatClient
    constructor(client: LingCatClient) {
        this.client = client
    }

    static async getById(client: LingCatClient, id: string) {

    }
}
