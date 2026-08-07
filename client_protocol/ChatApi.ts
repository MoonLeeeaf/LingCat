import { IChat, IChatAdmin, IMessage, IUser, LingCatProto, Methods } from "lingcat-protocol"
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
        last_message_text: chat.lastMessageText,
        description: chat.description,
    } as IChat
}

function protoUserToIUser(proto: LingCatProto.classes.IUser.$Properties) {
    return {
        id: proto.id,
        username: proto.username,
        nickname: proto.nickname,
        description: proto.description,
        avatar_file_hash: proto.avatarFileHash,
    } as IUser
}

function protoChatAdminToIChatAdmin(proto: LingCatProto.classes.IChatAdmin.$Properties) {
    return {
        ...protoUserToIUser(proto),
        role: proto.role,
        permissions: proto.permissions,
    } as IChatAdmin
}

export default class ChatApi {
    /**
     * 添加管理员（仅群主可操作）
     */
    static async addChatAdmin(client: LingCatClient, {
        access_token,
        chat_id,
        target_user_id,
        permissions,
        timeout,
    }: {
        access_token: string
        chat_id: string
        target_user_id: string
        permissions?: Record<string, boolean>
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.Add_Chat_Admin_Response>(LingCatProto.methods.Add_Chat_Admin_Response, (await client.invoke({
            method_id: Methods.Add_Chat_Admin_Request,
            data: LingCatProto.methods.Add_Chat_Admin_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
                targetUserId: target_user_id,
                permissions: permissions ? JSON.stringify(permissions) : undefined,
            }).finish(),
            timeout,
        })).data)
    }

    /**
     * 修改管理员权限（仅群主或拥有 manage_admins 权限的管理员可操作）
     */
    static async editChatAdminPermissions(client: LingCatClient, {
        access_token,
        chat_id,
        target_user_id,
        permissions,
        timeout,
    }: {
        access_token: string
        chat_id: string
        target_user_id: string
        permissions: Record<string, boolean>
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.Edit_Chat_Admin_Permissions_Response>(LingCatProto.methods.Edit_Chat_Admin_Permissions_Response, (await client.invoke({
            method_id: Methods.Edit_Chat_Admin_Permissions_Request,
            data: LingCatProto.methods.Edit_Chat_Admin_Permissions_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
                targetUserId: target_user_id,
                permissions: JSON.stringify(permissions),
            }).finish(),
            timeout,
        })).data)
    }

    /**
     * 删除管理员（仅群主或拥有 manage_admins 权限的管理员可操作）
     */
    static async removeChatAdmin(client: LingCatClient, {
        access_token,
        chat_id,
        target_user_id,
        timeout,
    }: {
        access_token: string
        chat_id: string
        target_user_id: string
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.Remove_Chat_Admin_Response>(LingCatProto.methods.Remove_Chat_Admin_Response, (await client.invoke({
            method_id: Methods.Remove_Chat_Admin_Request,
            data: LingCatProto.methods.Remove_Chat_Admin_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
                targetUserId: target_user_id,
            }).finish(),
            timeout,
        })).data)
    }
    /**
     * 加入群组
     * @param client
     * @param params
     */
    static async joinGroup(client: LingCatClient, {
        access_token,
        chat_id,
        answer,
        timeout,
    }: {
        access_token: string
        chat_id: string
        answer?: string
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.Join_Group_Response>(LingCatProto.methods.Join_Group_Response, (await client.invoke({
            method_id: Methods.Join_Group_Request,
            data: LingCatProto.methods.Join_Group_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
                answer,
            }).finish(),
            timeout,
        })).data)
    }
    /**
     * 移除群成员
     * @param client
     * @param params
     */
    static async removeChatMember(client: LingCatClient, {
        access_token,
        chat_id,
        target_user_id,
        timeout,
    }: {
        access_token: string
        chat_id: string
        target_user_id: string
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.Remove_Chat_Member_Response>(LingCatProto.methods.Remove_Chat_Member_Response, (await client.invoke({
            method_id: Methods.Remove_Chat_Member_Request,
            data: LingCatProto.methods.Remove_Chat_Member_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
                targetUserId: target_user_id,
            }).finish(),
            timeout,
        })).data)
    }
    /**
     * 更新群设置（JSON 格式）
     * @param client
     * @param params
     */
    static async updateChatSettings(client: LingCatClient, {
        access_token,
        chat_id,
        settings,
        timeout,
    }: {
        access_token: string
        chat_id: string
        // 例如 { allow_join: true }
        settings: Record<string, any>
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.Update_Chat_Settings_Response>(LingCatProto.methods.Update_Chat_Settings_Response, (await client.invoke({
            method_id: Methods.Update_Chat_Settings_Request,
            data: LingCatProto.methods.Update_Chat_Settings_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
                settings: JSON.stringify(settings),
            }).finish(),
            timeout,
        })).data)
    }
    /**
     * 更新群资料（头像、标题、描述）
     * @param client
     * @param params
     */
    static async updateChatProfile(client: LingCatClient, {
        access_token,
        chat_id,
        avatar_file_hash,
        title,
        description,
        unique,
        timeout,
    }: {
        access_token: string
        chat_id: string
        avatar_file_hash?: string
        title?: string
        description?: string
        unique?: string
        timeout?: number
    }) {
        decodeOrThrow<LingCatProto.methods.Update_Chat_Profile_Response>(LingCatProto.methods.Update_Chat_Profile_Response, (await client.invoke({
            method_id: Methods.Update_Chat_Profile_Request,
            data: LingCatProto.methods.Update_Chat_Profile_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
                avatarFileHash: avatar_file_hash,
                title,
                unique,
                description,
            }).finish(),
            timeout,
        })).data)
    }
    /**
     * 获取群管理员列表
     * @param client
     * @param params
     */
    static async getChatAdmins(client: LingCatClient, {
        access_token,
        chat_id,
        timeout,
    }: {
        access_token: string
        chat_id: string
        timeout?: number
    }) {
        const response = await client.invoke({
            method_id: Methods.Get_Chat_Admins_Request,
            data: LingCatProto.methods.Get_Chat_Admins_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
            }).finish(),
            timeout,
        })
        const decoded = decodeOrThrow<LingCatProto.methods.Get_Chat_Admins_Response>(
            LingCatProto.methods.Get_Chat_Admins_Response,
            response.data
        )
        return decoded.admins.map((admin) => protoChatAdminToIChatAdmin(admin))
    }
    /**
     * 获取群成员列表
     * @param client
     * @param params
     */
    static async getChatMembers(client: LingCatClient, {
        access_token,
        chat_id,
        timeout,
    }: {
        access_token: string
        chat_id: string
        timeout?: number
    }) {
        const response = await client.invoke({
            method_id: Methods.Get_Chat_Members_Request,
            data: LingCatProto.methods.Get_Chat_Members_Request.encode({
                accessToken: access_token,
                chatId: chat_id,
            }).finish(),
            timeout,
        })
        const decoded = decodeOrThrow<LingCatProto.methods.Get_Chat_Members_Response>(
            LingCatProto.methods.Get_Chat_Members_Response,
            response.data
        )
        return (decoded.members || []).map((v) => protoUserToIUser(v))
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
        })).data)
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
    static async resolveChatIdentifier(client: LingCatClient, {
        access_token,
        identifier,
        timeout,
    }: {
        access_token: string
        identifier: string
        timeout?: number
    }) {
        const response = await client.invoke({
            method_id: Methods.Resolve_Chat_Identifier_Request,
            data: LingCatProto.methods.Resolve_Chat_Identifier_Request.encode({
                accessToken: access_token,
                identifier,
            }).finish(),
            timeout,
        });
        return decodeOrThrow<LingCatProto.methods.Resolve_Chat_Identifier_Response>(
            LingCatProto.methods.Resolve_Chat_Identifier_Response,
            response.data
        ).chatId
    }
    /**
     * 创建群组
     * @returns chat_id
     */
    static async createGroup(client: LingCatClient, {
        access_token,
        title,
        unique,
        timeout,
    }: {
        access_token: string
        title: string
        unique?: string
        timeout?: number
    }) {
        const response = await client.invoke({
            method_id: Methods.Create_Group_Request,
            data: LingCatProto.methods.Create_Group_Request.encode({
                accessToken: access_token,
                title,
                unique,
            }).finish(),
            timeout,
        })
        return decodeOrThrow<LingCatProto.methods.Create_Group_Response>(
            LingCatProto.methods.Create_Group_Response,
            response.data
        ).chatId
    }
}
