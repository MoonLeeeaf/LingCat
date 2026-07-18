import { Code, IChat, IUser, LingCatProto, Methods, Package } from "lingcat-protocol"
import type { ISendPackageFunction } from "./ISendPackageFunction.ts"
import TokenManager from "./TokenManager.ts"
import UserChatLinker from "../data/UserChatLinker.ts"
import sendError from "./sendError.ts"
import MessageDataBase from "../data/MessageDataBase.ts"
import WebSocket from "ws"
import ChatDataBase from "../data/ChatDataBase.ts"
import UserDataBase from "../data/UserDataBase.ts"

async function IChatToProtoChat(c: IChat, user_id?: string) {
    let a: LingCatProto.classes.IChat.$Properties = {
        id: c.id,
        title: c.title,
        chatUnique: c.chat_unique,
        type: c.type,
        avatarFileHash: c.avatar_file_hash,
        settings: c.settings,
        lastMessageId: c.last_message_id,
        lastMessageTime: c.last_message_time,
        description: c.description,
        lastMessageText: c.last_message_text,
    }
    if (c.type == 'private' && user_id) {
        const anotherUser = await UserDataBase.queryUserById((await UserChatLinker.getAnotherUserInPrivateChat(c.id, user_id))!)

        a = {
            ...a,
            avatarFileHash: anotherUser?.avatar_file_hash,
            title: anotherUser?.nickname,
        }
    }
    return a
}

export default class ChatApi {
    static async onCall(sendPackage: ISendPackageFunction, mPackage: Package, clients_emiter: { [k: string]: { [k: string]: (mPackage: Package) => void } } = {}) {
        switch (mPackage.method_id) {
            /**
             * ===============================
             *             发送消息
             * ===============================
             */
            case Methods.Send_Chat_Message_Request: {
                const data = LingCatProto.methods.Send_Chat_Message_Request.decode(mPackage.data)

                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                if (!await UserChatLinker.isUserChatLinked(user_id, data.chatId))
                    return sendError(sendPackage, mPackage.method_id, "用户不属于此对话", Code.Forbidden)

                if (ChatDataBase.queryChatById(data.chatId) == null)
                    return sendError(sendPackage, mPackage.method_id, "对话不存在", Code.Not_Found)

                const time = Date.now()
                const msg_id = await MessageDataBase.addMessage({
                    text: data.text,
                    chat_id: data.chatId,
                    sender_user_id: user_id,
                    time,
                })

                    ; (await UserChatLinker.queryUsersOfChat(data.chatId)).forEach((v) => [
                        Object.values(clients_emiter[v] || []).forEach((func) => {
                            func(Package.encode({
                                method_id: Methods.Receive_Chat_Message_Event,
                                flags: 0,
                                data: LingCatProto.methods.Receive_Chat_Message_Event.encode({
                                    msg: {
                                        text: data.text,
                                        chatId: data.chatId,
                                        senderUserId: user_id,
                                        time: Date.now(),
                                        id: msg_id,
                                    }
                                }).finish()
                            }))
                            setTimeout(() => func(Package.encode({
                                method_id: Methods.Update_My_Chats_Event,
                                flags: 0,
                                data: LingCatProto.methods.Update_My_Chats_Event.encode({}).finish()
                            })), 50)
                        })
                    ])

                sendPackage(Package.encode({
                    method_id: Methods.Send_Chat_Message_Response,
                    flags: 0,
                    data: LingCatProto.methods.Send_Chat_Message_Response.encode({
                        id: msg_id,
                    }).finish()
                }))
                break
            }
            /**
             * ===============================
             *          请求对话信息
             * ===============================
             */
            case Methods.Query_Chat_Info_Request: {
                const data = LingCatProto.methods.Query_Chat_Info_Request.decode(mPackage.data)

                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                const chat = await ChatDataBase.queryChatById(data.chatId)

                if (chat == null)
                    return sendError(sendPackage, mPackage.method_id, 'Chat doesn\'t exists', Code.Not_Found)

                const hideForNonMember = {
                    settings: '{}'
                }
                if (await UserChatLinker.isUserChatLinked(user_id, data.chatId))
                    hideForNonMember.settings = chat.settings

                sendPackage(Package.encode({
                    method_id: Methods.Query_Chat_Info_Response,
                    flags: 0,
                    data: LingCatProto.methods.Query_Chat_Info_Response.encode({
                        info: await IChatToProtoChat(chat, user_id),
                    }).finish()
                }))
                break
            }
            /**
             * ===============================
             *          获取/创建私聊
             * ===============================
             */
            case Methods.Get_Or_Create_Private_Chat_Request: {
                const data = LingCatProto.methods.Get_Or_Create_Private_Chat_Request.decode(mPackage.data)

                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                const user = await UserDataBase.queryUserById(data.targetUserId)

                if (user == null)
                    return sendError(sendPackage, mPackage.method_id, 'User doesn\'t exists', Code.Not_Found)

                const chat_id = await ChatDataBase.createOrGetPrivate({
                    a: user_id,
                    b: user.id,
                })

                await UserChatLinker.linkUserAndChat(user_id, chat_id)
                await UserChatLinker.linkUserAndChat(user.id, chat_id)

                sendPackage(Package.encode({
                    method_id: Methods.Get_Or_Create_Private_Chat_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_Or_Create_Private_Chat_Response.encode({
                        chatId: chat_id,
                    }).finish()
                }))
                break
            }
            /**
             * ===============================
             *        从私聊获取用户 ID
             * ===============================
             */
            case Methods.Get_Another_User_From_Private_Chat_Request: {
                const data = LingCatProto.methods.Get_Another_User_From_Private_Chat_Request.decode(mPackage.data)

                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                const chat = await ChatDataBase.queryChatById(data.targetChatId)

                if (chat == null)
                    return sendError(sendPackage, mPackage.method_id, 'Chat doesn\'t exists', Code.Not_Found)

                if (chat.type != 'private')
                    return sendError(sendPackage, mPackage.method_id, 'Not a private chat', Code.Not_Found)

                sendPackage(Package.encode({
                    method_id: Methods.Get_Another_User_From_Private_Chat_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_Another_User_From_Private_Chat_Response.encode({
                        userId: await UserChatLinker.getAnotherUserInPrivateChat(chat.id, user_id)
                    }).finish()
                }))
                break
            }
            /**
             * ===============================
             *            获取消息
             * ===============================
             */
            case Methods.Get_Chat_Messages_Request: {
                const data = LingCatProto.methods.Get_Chat_Messages_Request.decode(mPackage.data)

                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                if (!await UserChatLinker.isUserChatLinked(user_id, data.chatId))
                    return sendError(sendPackage, mPackage.method_id, "用户不属于此对话", Code.Forbidden)

                const msgs = await MessageDataBase.getMessages(data.chatId, {
                    after: data.after!,
                    before: data.before!,
                    limit: data.limit || undefined,
                })
                // console.log(data, msgs)

                sendPackage(Package.encode({
                    method_id: Methods.Get_Chat_Messages_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_Chat_Messages_Response.encode({
                        messages: msgs.map((v) => ({
                            id: v.id,
                            chatId: v.chat_id,
                            senderUserId: v.sender_user_id,
                            text: v.text,
                            time: v.time,
                            system: v.system,
                        }))
                    }).finish()
                }))
                break
            }
            // 获取我的所有对话
            case Methods.Get_My_Chats_Request: {
                const data = LingCatProto.methods.Get_My_Chats_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const chats = await Promise.all((await UserChatLinker.queryChatsOfUser(user_id, {
                    limit: data.limit || 1000,
                    offset: data.offset || 0,
                })).map((c) => IChatToProtoChat(c, user_id)))
                sendPackage(Package.encode({
                    method_id: Methods.Get_My_Chats_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_My_Chats_Response.encode({
                        chats,
                    }).finish()
                }))
                break
            }
            // 获取我的收藏对话
            case Methods.Get_My_Favourite_Chats_Request: {
                const data = LingCatProto.methods.Get_My_Favourite_Chats_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const chats = await UserChatLinker.queryFavouriteChatsOfUser(user_id, {
                    limit: data.limit || 1000,
                    offset: data.offset || 0,
                })
                sendPackage(Package.encode({
                    method_id: Methods.Get_My_Favourite_Chats_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_My_Favourite_Chats_Response.encode({
                        chats: await Promise.all(chats.map((c) => IChatToProtoChat(c, user_id))),
                    }).finish()
                }))
                break
            }
            case Methods.Set_Chat_Favourited_Request: {
                const data = LingCatProto.methods.Set_Chat_Favourited_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                if (!await ChatDataBase.queryChatById(data.chatId)) {
                    return sendError(sendPackage, mPackage.method_id, 'Chat not found', Code.Not_Found);
                }

                await UserChatLinker.setUserChatFavourited(user_id, data.chatId, data.favourited)

                sendPackage(Package.encode({
                    method_id: Methods.Set_Chat_Favourited_Response,
                    flags: 0,
                    data: LingCatProto.methods.Set_Chat_Favourited_Response.encode({}).finish()
                }))
                break
            }
            // 搜索我的对话
            case Methods.Search_My_Chats_Request: {
                const data = LingCatProto.methods.Search_My_Chats_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const chats = await UserChatLinker.searchChatsOfUser(user_id, data.keyword)
                // 如果指定了 limit，截断返回
                const limited = data.limit ? chats.slice(0, data.limit) : chats
                sendPackage(Package.encode({
                    method_id: Methods.Search_My_Chats_Response,
                    flags: 0,
                    data: LingCatProto.methods.Search_My_Chats_Response.encode({
                        chats: await Promise.all(limited.map((c) => IChatToProtoChat(c, user_id))),
                    }).finish()
                }))
                break
            }
            case Methods.Resolve_Chat_Identifier_Request: {
                const data = LingCatProto.methods.Resolve_Chat_Identifier_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const identifier = data.identifier.trim()
                if (!identifier) return sendError(sendPackage, mPackage.method_id, 'Identifier cannot be empty', Code.Bad_Request)

                let chat_id: string | null = null

                // 1. 尝试作为 chat_id 查找
                let chat = await ChatDataBase.queryChatById(identifier)
                if (chat) {
                    chat_id = chat.id
                }

                // 2. 如果没找到，尝试作为 chat_unique（群号）查找
                if (!chat_id) {
                    chat = await ChatDataBase.queryChatByUnique(identifier);
                    if (chat) {
                        chat_id = chat.id;
                    }
                }

                // 3. 如果仍没找到，尝试作为 username 或 user_id 处理（生成私聊）
                if (!chat_id) {
                    let targetUser = await UserDataBase.queryUserByUserName(identifier);
                    if (!targetUser) {
                        // 尝试作为 user_id 查找
                        targetUser = await UserDataBase.queryUserById(identifier);
                    }
                    if (targetUser) {
                        if (targetUser.id == user_id) {
                            chat_id = await ChatDataBase.createOrGetPrivate({ a: user_id, b: user_id })
                        } else {
                            chat_id = await ChatDataBase.createOrGetPrivate({ a: user_id, b: targetUser.id })
                        }
                        // 确保双方都在 UserChatLinker 中
                        await UserChatLinker.linkUserAndChat(user_id, chat_id)
                        await UserChatLinker.linkUserAndChat(targetUser.id, chat_id)
                    }
                }

                if (!chat_id) {
                    return sendError(sendPackage, mPackage.method_id, 'Cannot resolve identifier to any chat', Code.Not_Found);
                }

                if (!await UserChatLinker.isUserChatLinked(user_id, chat_id)) {
                    return sendError(sendPackage, mPackage.method_id, 'You are not a member of this chat', Code.Forbidden);
                }

                sendPackage(Package.encode({
                    method_id: Methods.Resolve_Chat_Identifier_Response,
                    flags: 0,
                    data: LingCatProto.methods.Resolve_Chat_Identifier_Response.encode({
                        chatId: chat_id,
                    }).finish()
                }))
                break
            }
            /**
             * ===============================
             *           创建群组
             * ===============================
             */
            case Methods.Create_Group_Request: {
                const data = LingCatProto.methods.Create_Group_Request.decode(mPackage.data);
                const creator_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id;

                if (!data.title || data.title.trim() === '') {
                    return sendError(sendPackage, mPackage.method_id, 'Group title cannot be empty', Code.Bad_Request);
                }

                const chat_id = await ChatDataBase.createGroup({
                    title: data.title.trim(),
                    unique: data.unique || undefined,
                });

                await UserChatLinker.linkUserAndChat(creator_id, chat_id);

                sendPackage(Package.encode({
                    method_id: Methods.Create_Group_Response,
                    flags: 0,
                    data: LingCatProto.methods.Create_Group_Response.encode({
                        chatId: chat_id,
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