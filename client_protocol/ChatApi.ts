import { IChat, IMessage, IUser, LingCatProto, Methods } from "lingcat-protocol"
import LingCatClient from "./LingCatClient.ts"
import decodeOrThrow from "./decodeOrThrow.ts"

function protoChatToIChat(chat: LingCatProto.classes.IChat.$Properties) {
    return {
        id: chat.id,
        title: chat.title,
        chat_unique: chat.chatUnique,
        type: chat.type,
        avatar_file_hash: chat.avatarFileHash,
        settings: chat.settings,
        last_message_id: chat.lastMessageId,
        last_message_time: chat.lastMessageTime,
        description: chat.description,
    } as IChat
}

export default class ChatApi {
    /**
     * 更新对话头像
     * @returns 
     */
    static async updateChatAvvatar(client: LingCatClient, {
        access_token,
        chat_id,
        file_hash,
        timeout,
    }: {
        access_token: string
        chat_id: string
        file_hash: string
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.Update_Chat_Avatar_Response>(LingCatProto.methods.Update_Chat_Avatar_Response, (await client.invoke({
            method_id: Methods.Update_Chat_Avatar_Request,
            data: LingCatProto.methods.Update_Chat_Avatar_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
                fileHash: file_hash,
            }).finish(),
            timeout,
        })).data)
    }
    /**
     * 创建/获取私聊对话的 ID
     * @returns 
     */
    static async getOrCreatePrivateChat(client: LingCatClient, {
        access_token,
        target_user_id,
        timeout,
    }: {
        access_token: string
        target_user_id: string
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.Get_Or_Create_Private_Chat_Response>(LingCatProto.methods.Get_Or_Create_Private_Chat_Response, (await client.invoke({
            method_id: Methods.Get_Or_Create_Private_Chat_Request,
            data: LingCatProto.methods.Get_Or_Create_Private_Chat_Request.encode({
                accessToken: access_token,
                targetUserId: target_user_id,
            }).finish(),
            timeout,
        })).data).chatId
    }
    /**
     * 从私聊中获取另一个用户的 ID
     * 如果该私聊只有当前用户自己（如“已保存消息”），则返回自己的 ID
     */
    static async getAnotherUserFromPrivateChat(client: LingCatClient, {
        access_token,
        target_chat_id,
        timeout,
    }: {
        access_token: string;
        target_chat_id: string;
        timeout?: number;
    }) {
        return decodeOrThrow<LingCatProto.methods.Get_Another_User_From_Private_Chat_Response>(
            LingCatProto.methods.Get_Another_User_From_Private_Chat_Response,
            (await client.invoke({
                method_id: Methods.Get_Another_User_From_Private_Chat_Request,
                data: LingCatProto.methods.Get_Another_User_From_Private_Chat_Request.encode({
                    accessToken: access_token,
                    targetChatId: target_chat_id,
                }).finish(),
                timeout,
            })).data
        ).userId
    }
    /**
     * 获取对话信息
     * @returns 
     */
    static async queryChatInfo(client: LingCatClient, {
        access_token,
        chat_id,
        timeout,
    }: {
        access_token: string
        chat_id: string
        timeout?: number
    }) {
        const info = decodeOrThrow<LingCatProto.methods.Query_Chat_Info_Response>(LingCatProto.methods.Query_Chat_Info_Response, (await client.invoke({
            method_id: Methods.Query_Chat_Info_Request,
            data: LingCatProto.methods.Query_Chat_Info_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
            }).finish(),
            timeout,
        })).data).info
        return protoChatToIChat(info!)
    }
    /**
     * 获取对话的消息
     * @returns 
     */
    static async getChatMessages(client: LingCatClient, {
        access_token,
        chat_id,
        before,
        after,
        limit,
        timeout,
    }: {
        access_token: string
        chat_id: string
        // id < before
        before?: number,
        // id > after
        after?: number,
        limit?: number
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.Get_Chat_Messages_Response>(LingCatProto.methods.Get_Chat_Messages_Response, (await client.invoke({
            method_id: Methods.Get_Chat_Messages_Request,
            data: LingCatProto.methods.Get_Chat_Messages_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
                before,
                after,
                limit,
            }).finish(),
            timeout,
        })).data).messages.map((v) => ({
            id: v.id,
            chat_id: v.chatId,
            sender_user_id: v.senderUserId,
            system: v.system,
            text: v.text,
            time: v.time,
        })) as IMessage[]
    }
    /**
     * 发送消息
     * @returns 该消息的 ID
     */
    static async sendChatMessage(client: LingCatClient, {
        access_token,
        chat_id,
        text,
        timeout,
    }: {
        access_token: string
        chat_id: string
        text: string
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.Send_Chat_Message_Response>(LingCatProto.methods.Send_Chat_Message_Response, (await client.invoke({
            method_id: Methods.Send_Chat_Message_Request,
            data: LingCatProto.methods.Send_Chat_Message_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
                text,
            }).finish(),
            timeout,
        })).data).id
    }
    // 获取我的所有对话
    static async getMyChats(client: LingCatClient, {
        access_token,
        limit,
        offset,
        timeout,
    }: {
        access_token: string
        limit?: number
        offset?: number
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.Get_My_Chats_Response>(LingCatProto.methods.Get_My_Chats_Response, (await client.invoke({
            method_id: Methods.Get_My_Chats_Request,
            data: LingCatProto.methods.Get_My_Chats_Request.encode({
                accessToken: access_token,
                limit,
                offset,
            }).finish(),
            timeout,
        })).data).chats.map((v) => protoChatToIChat(v))
    }
    /**
     * 设置对话的收藏状态
     * @returns
     */
    static async setChatFavourited(client: LingCatClient, {
        access_token,
        chat_id,
        favourited,
        timeout,
    }: {
        access_token: string
        chat_id: string
        favourited: boolean
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.Set_Chat_Favourited_Response>(LingCatProto.methods.Set_Chat_Favourited_Response, (await client.invoke({
            method_id: Methods.Set_Chat_Favourited_Request,
            data: LingCatProto.methods.Set_Chat_Favourited_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
                favourited,
            }).finish(),
            timeout,
        })).data
        )
    }
    // 获取我的收藏对话
    static async getMyFavouriteChats(client: LingCatClient, {
        access_token,
        limit,
        offset,
        timeout,
    }: {
        access_token: string
        limit?: number
        offset?: number
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.Get_My_Favourite_Chats_Response>(LingCatProto.methods.Get_My_Favourite_Chats_Response, (await client.invoke({
            method_id: Methods.Get_My_Favourite_Chats_Request,
            data: LingCatProto.methods.Get_My_Favourite_Chats_Request.encode({
                accessToken: access_token,
                limit,
                offset,
            }).finish(),
            timeout,
        })).data).chats.map((v) => protoChatToIChat(v))
    }

    // 搜索我的对话
    static async searchMyChats(client: LingCatClient, {
        access_token,
        keyword,
        limit,
        timeout,
    }: {
        access_token: string
        keyword: string
        limit?: number
        timeout?: number
    }) {
        return decodeOrThrow<LingCatProto.methods.Search_My_Chats_Response>(LingCatProto.methods.Search_My_Chats_Response, (await client.invoke({
            method_id: Methods.Search_My_Chats_Request,
            data: LingCatProto.methods.Search_My_Chats_Request.encode({
                accessToken: access_token,
                keyword,
                limit,
            }).finish(),
            timeout,
        })).data).chats.map((v) => protoChatToIChat(v))
    }
}
