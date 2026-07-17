import { IChat, IUser } from "lingcat-protocol"
import ClientManager from "./ClientManager.ts"
import { ChatApi, UserApi } from "lingcat-client-protocol"

export default class ProfileCache {
    static user_info: { [k: string]: IUser } = {}
    static async queryUserInfo(user_id: string) {
        if (this.user_info[user_id] == null)
            this.user_info[user_id] = await UserApi.queryUserInfo(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                user_id,
            })
        return this.user_info[user_id]
    }

    static chat_info: { [k: string]: IChat } = {}
    static async queryChatInfo(chat_id: string) {
        if (this.chat_info[chat_id] == null)
            this.chat_info[chat_id] = await ChatApi.queryChatInfo(ClientManager.client, {
                access_token: ClientManager.getActiveUserSession().token,
                chat_id,
            })
        return this.chat_info[chat_id]
    }
}