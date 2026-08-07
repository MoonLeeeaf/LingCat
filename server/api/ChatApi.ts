import { AvailableChatSettings, Code, IChat, IChatAdmin, IChatSettings, IUser, LingCatProto, Methods, Package } from "lingcat-protocol"
import type { ISendPackageFunction } from "./ISendPackageFunction.ts"
import TokenManager from "./TokenManager.ts"
import UserChatLinker from "../data/UserChatLinker.ts"
import sendError from "./sendError.ts"
import MessageDataBase from "../data/MessageDataBase.ts"
import WebSocket from "ws"
import ChatDataBase from "../data/ChatDataBase.ts"
import UserDataBase from "../data/UserDataBase.ts"
import ChatAdminLinker from "../data/ChatAdminLinker.ts"
import { db } from "../data/db.ts"
import FileManager from "../data/FileManager.ts"

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
        const anotherUserId = await UserChatLinker.getAnotherUserInPrivateChat(c.id, user_id)
        if (anotherUserId) {
            const anotherUser = await UserDataBase.queryUserById(anotherUserId)
            if (anotherUser) {
                a.avatarFileHash = anotherUser.avatar_file_hash
                a.title = anotherUser.nickname
            }
        }
    }
    return a
}

function IUserToProtoUser(user: IUser) {
    return {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        description: user.description,
        avatarFileHash: user.avatar_file_hash,
    } as LingCatProto.classes.IUser.$Properties
}

function IChatAdminToProtoAdmin(user: IChatAdmin) {
    return {
        ...IUserToProtoUser(user),
        role: user.role,
        permissions: user.permissions,
        belongToChatId: user.belong_to_chat_id,
    } as LingCatProto.classes.IChatAdmin.$Properties
}

function broadcastToUserClients(clients_emiter: { [k: string]: { [k: string]: (mPackage: Package) => void } }, user_id: string, func: (func: (mPackage: Package) => void) => void) {
    Object.values(clients_emiter[user_id] || []).forEach(func)
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

                if (await ChatDataBase.queryChatById(data.chatId) == null)
                    return sendError(sendPackage, mPackage.method_id, "对话不存在", Code.Not_Found)

                const time = Date.now()
                const msg_id = await MessageDataBase.addMessage({
                    text: data.text,
                    chat_id: data.chatId,
                    sender_user_id: user_id,
                    time,
                })

                    ; (await UserChatLinker.queryUsersOfChat(data.chatId)).forEach((v) => broadcastToUserClients(clients_emiter, v, (func) => {
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
                    }))

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

                const settings = JSON.parse(chat.settings)
                if (!await UserChatLinker.isUserChatLinked(user_id, data.chatId)) {
                    /**
                     * 仅入群方式对非对话成员可见
                     */
                    chat.settings = JSON.stringify({
                        allow_join: settings.allow_join
                    })
                    chat.last_message_id = 0
                    chat.last_message_text = undefined
                    chat.last_message_time = 0
                }

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
                    limit: data.limit != undefined ? data.limit : 1000,
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

                if (!await UserChatLinker.isUserChatLinked(user_id, data.chatId)) {
                    return sendError(sendPackage, mPackage.method_id, 'You are not a member of this chat', Code.Forbidden);
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
                    chat = await ChatDataBase.queryChatByUnique(identifier)
                    if (chat) {
                        chat_id = chat.id;
                    }
                }

                // 3. 如果仍没找到，尝试作为 username 或 user_id 处理（生成私聊）
                if (!chat_id) {
                    let targetUser = await UserDataBase.queryUserByUserName(identifier)
                    if (!targetUser) {
                        // 尝试作为 user_id 查找
                        targetUser = await UserDataBase.queryUserById(identifier)
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

                /* if (!await UserChatLinker.isUserChatLinked(user_id, chat_id)) {
                    return sendError(sendPackage, mPackage.method_id, 'You are not a member of this chat', Code.Forbidden);
                } */

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
                const data = LingCatProto.methods.Create_Group_Request.decode(mPackage.data)
                const creator_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id

                if (!data.title || data.title.trim() === '') {
                    return sendError(sendPackage, mPackage.method_id, 'Group title cannot be empty', Code.Bad_Request)
                }

                const chat_id = await ChatDataBase.createGroup({
                    title: data.title.trim(),
                    unique: data.unique || undefined,
                })

                await UserChatLinker.linkUserAndChat(creator_id, chat_id)
                await ChatAdminLinker.addAdmin(chat_id, creator_id, 'owner')

                const time = Date.now()
                const msg_id = await MessageDataBase.addMessage({
                    text: '群组已被创建',
                    chat_id: chat_id,
                    system: true,
                    time,
                })

                broadcastToUserClients(clients_emiter, creator_id, (func) => func(Package.encode({
                    method_id: Methods.Update_My_Chats_Event,
                    flags: 0,
                    data: LingCatProto.methods.Update_My_Chats_Event.encode({}).finish()
                })))

                sendPackage(Package.encode({
                    method_id: Methods.Create_Group_Response,
                    flags: 0,
                    data: LingCatProto.methods.Create_Group_Response.encode({
                        chatId: chat_id,
                    }).finish()
                }))
                break
            }
            case Methods.Join_Group_Request: {
                const data = LingCatProto.methods.Join_Group_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const chat = await ChatDataBase.queryChatById(data.chatId)
                if (!chat) return sendError(sendPackage, mPackage.method_id, 'Chat not found', Code.Not_Found)

                if (await UserChatLinker.isUserChatLinked(user_id, chat.id)) {
                    sendPackage(Package.encode({
                        method_id: Methods.Join_Group_Response,
                        flags: 0,
                        data: LingCatProto.methods.Join_Group_Response.encode({}).finish()
                    }))
                    break
                }

                const settings = JSON.parse(chat.settings || '{}') as IChatSettings

                // 判断入群方式
                if (!settings.allow_join) {
                    return sendError(sendPackage, mPackage.method_id, 'Cannot join this group', Code.Forbidden);
                }

                // 加入群组
                await UserChatLinker.linkUserAndChat(user_id, chat.id)

                /* ; (await UserChatLinker.queryUsersOfChat(data.chatId)).forEach((v) => broadcastToUserClients(clients_emiter, v, (func) => {
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
                    })) */

                sendPackage(Package.encode({
                    method_id: Methods.Join_Group_Response,
                    flags: 0,
                    data: LingCatProto.methods.Join_Group_Response.encode({}).finish()
                }))
                break
            }
            case Methods.Remove_Chat_Member_Request: {
                const data = LingCatProto.methods.Remove_Chat_Member_Request.decode(mPackage.data)
                const operator_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const chat = await ChatDataBase.queryChatById(data.chatId)
                if (!chat) return sendError(sendPackage, mPackage.method_id, 'Chat not found', Code.Not_Found)

                if (!await ChatAdminLinker.checkAdminPermission(chat.id, operator_id, 'kick')) {
                    return sendError(sendPackage, mPackage.method_id, 'Permission denied', Code.Forbidden)
                }

                if (await ChatAdminLinker.isOwner(chat.id, data.targetUserId)) {
                    return sendError(sendPackage, mPackage.method_id, 'Cannot remove the group owner', Code.Forbidden)
                }

                if (!await ChatAdminLinker.isOwner(chat.id, operator_id) && await ChatAdminLinker.isAdmin(chat.id, data.targetUserId)) {
                    return sendError(sendPackage, mPackage.method_id, 'Cannot remove the group admin', Code.Forbidden)
                }

                if (data.targetUserId == operator_id) {
                    return sendError(sendPackage, mPackage.method_id, 'Cannot remove yourself', Code.Forbidden)
                }

                if (!await UserChatLinker.isUserChatLinked(data.targetUserId, chat.id)) {
                    return sendError(sendPackage, mPackage.method_id, 'User is not in the chat', Code.Not_Found)
                }

                await UserChatLinker.unlinkUserAndChat(data.targetUserId, chat.id)
                await ChatAdminLinker.removeAdmin(chat.id, data.targetUserId)

                sendPackage(Package.encode({
                    method_id: Methods.Remove_Chat_Member_Response,
                    flags: 0,
                    data: LingCatProto.methods.Remove_Chat_Member_Response.encode({}).finish()
                }))
                break
            }
            case Methods.Update_Chat_Settings_Request: {
                const data = LingCatProto.methods.Update_Chat_Settings_Request.decode(mPackage.data)
                const operator_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const chat = await ChatDataBase.queryChatById(data.chatId)
                if (!chat) return sendError(sendPackage, mPackage.method_id, 'Chat not found', Code.Not_Found)

                if (!await ChatAdminLinker.checkAdminPermission(chat.id, operator_id, 'edit_settings')) {
                    return sendError(sendPackage, mPackage.method_id, 'Permission denied', Code.Forbidden)
                }

                const settings = JSON.parse(chat.settings || '{}')

                const applySettings = JSON.parse(data.settings)
                Object.keys(applySettings).forEach((k) => {
                    if (AvailableChatSettings[k])
                        settings[k] = applySettings[k]
                })

                await ChatDataBase.updateSettings(chat.id, settings)

                sendPackage(Package.encode({
                    method_id: Methods.Update_Chat_Settings_Response,
                    flags: 0,
                    data: LingCatProto.methods.Update_Chat_Settings_Response.encode({}).finish()
                }))
                break
            }
            case Methods.Update_Chat_Profile_Request: {
                const data = LingCatProto.methods.Update_Chat_Profile_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const chat = await ChatDataBase.queryChatById(data.chatId)
                if (!chat) {
                    return sendError(sendPackage, mPackage.method_id, 'Chat not found', Code.Not_Found)
                }

                if (chat.type == 'private') {
                    return sendError(sendPackage, mPackage.method_id, 'Private chats cannot update profile', Code.Forbidden)
                }

                if (!await ChatAdminLinker.checkAdminPermission(chat.id, user_id, 'edit_info')) {
                    return sendError(sendPackage, mPackage.method_id, 'Permission denied', Code.Forbidden)
                }

                if (data.avatarFileHash != '' && data.avatarFileHash) {
                    if (await FileManager.queryFileByHash(data.avatarFileHash) == null) {
                        return sendError(sendPackage, mPackage.method_id, 'File does not exist', Code.Not_Found)
                    }
                    await ChatDataBase.updateAvatarFileHash(chat.id, data.avatarFileHash)
                }

                if (data.title) {
                    await ChatDataBase.updateTitle(chat.id, data.title.trim())
                }
                if (data.unique) {
                    await ChatDataBase.updateUnique(chat.id, data.unique.trim())
                }
                if (data.description) {
                    await ChatDataBase.updateDescription(chat.id, data.description)
                }

                sendPackage(Package.encode({
                    method_id: Methods.Update_Chat_Profile_Response,
                    flags: 0,
                    data: LingCatProto.methods.Update_Chat_Profile_Response.encode({}).finish()
                }))
                break
            }
            /**
             * ===============================
             *        获取群管理员列表
             * ===============================
             */
            case Methods.Get_Chat_Admins_Request: {
                const data = LingCatProto.methods.Get_Chat_Admins_Request.decode(mPackage.data);
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id;
                const chat = await ChatDataBase.queryChatById(data.chatId);
                if (!chat) {
                    return sendError(sendPackage, mPackage.method_id, 'Chat not found', Code.Not_Found);
                }

                if (!await UserChatLinker.isUserChatLinked(user_id, chat.id)) {
                    return sendError(sendPackage, mPackage.method_id, 'You are not a member of this chat', Code.Forbidden);
                }

                const admins = await ChatAdminLinker.queryAdminsOfChat(chat.id)
                const adminInfos = admins.map(admin => IChatAdminToProtoAdmin(admin))

                sendPackage(Package.encode({
                    method_id: Methods.Get_Chat_Admins_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_Chat_Admins_Response.encode({
                        admins: adminInfos,
                    }).finish()
                }));
                break;
            }

            /**
             * ===============================
             *        获取群成员列表
             * ===============================
             */
            case Methods.Get_Chat_Members_Request: {
                const data = LingCatProto.methods.Get_Chat_Members_Request.decode(mPackage.data)
                const user_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const chat = await ChatDataBase.queryChatById(data.chatId)
                if (!chat) {
                    return sendError(sendPackage, mPackage.method_id, 'Chat not found', Code.Not_Found)
                }

                if (!await UserChatLinker.isUserChatLinked(user_id, chat.id)) {
                    return sendError(sendPackage, mPackage.method_id, 'You are not a member of this chat', Code.Forbidden)
                }

                const memberIds = await UserChatLinker.queryUsersOfChat(chat.id)

                sendPackage(Package.encode({
                    method_id: Methods.Get_Chat_Members_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_Chat_Members_Response.encode({
                        members: (await UserDataBase.queryUsersByIds(memberIds)).map((v) => IUserToProtoUser(v)),
                    }).finish()
                }))
                break
            }
            /**
             * 添加管理员
             */
            case Methods.Add_Chat_Admin_Request: {
                const data = LingCatProto.methods.Add_Chat_Admin_Request.decode(mPackage.data)
                const operator_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const chat = await ChatDataBase.queryChatById(data.chatId)
                if (!chat) return sendError(sendPackage, mPackage.method_id, 'Chat not found', Code.Not_Found)

                if (!await ChatAdminLinker.isOwner(chat.id, operator_id)) {
                    return sendError(sendPackage, mPackage.method_id, 'Only the group owner can add admins', Code.Forbidden)
                }

                if (data.targetUserId === operator_id) {
                    return sendError(sendPackage, mPackage.method_id, 'Cannot add yourself as admin', Code.Forbidden)
                }

                if (!await UserChatLinker.isUserChatLinked(data.targetUserId, chat.id)) {
                    return sendError(sendPackage, mPackage.method_id, 'User is not a member of this chat', Code.Not_Found)
                }

                if (await ChatAdminLinker.isAdmin(chat.id, data.targetUserId)) {
                    return sendPackage(Package.encode({
                        method_id: Methods.Add_Chat_Admin_Response,
                        flags: 0,
                        data: LingCatProto.methods.Add_Chat_Admin_Response.encode({}).finish()
                    }))
                }

                let permissions = '{}'
                if (data.permissions) {
                    try {
                        JSON.parse(data.permissions)
                        permissions = data.permissions
                    } catch {
                        return sendError(sendPackage, mPackage.method_id, 'Invalid permissions JSON', Code.Bad_Request)
                    }
                }

                await ChatAdminLinker.addAdmin(chat.id, data.targetUserId, 'admin')
                await ChatAdminLinker.updateAdminPermissions(chat.id, data.targetUserId, permissions)

                sendPackage(Package.encode({
                    method_id: Methods.Add_Chat_Admin_Response,
                    flags: 0,
                    data: LingCatProto.methods.Add_Chat_Admin_Response.encode({}).finish()
                }))
                break
            }
            /**
             * 修改管理员权限
             */
            case Methods.Edit_Chat_Admin_Permissions_Request: {
                const data = LingCatProto.methods.Edit_Chat_Admin_Permissions_Request.decode(mPackage.data)
                const operator_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const chat = await ChatDataBase.queryChatById(data.chatId)
                if (!chat) return sendError(sendPackage, mPackage.method_id, 'Chat not found', Code.Not_Found)

                // 只有群主或拥有 manage_admins 权限的管理员可以编辑
                if (!await ChatAdminLinker.isOwner(chat.id, operator_id) /* &&
                    !await ChatAdminLinker.checkAdminPermission(chat.id, operator_id, 'manage_admins') */) {
                    return sendError(sendPackage, mPackage.method_id, 'Permission denied', Code.Forbidden)
                }

                // 不能修改群主自己的权限
                if (await ChatAdminLinker.isOwner(chat.id, data.targetUserId)) {
                    return sendError(sendPackage, mPackage.method_id, 'Cannot edit the group owner\'s permissions', Code.Forbidden)
                }

                // 检查目标是否是管理员
                if (!await ChatAdminLinker.isAdmin(chat.id, data.targetUserId)) {
                    return sendError(sendPackage, mPackage.method_id, 'User is not an admin', Code.Not_Found)
                }

                // 验证权限 JSON
                try {
                    JSON.parse(data.permissions)
                } catch {
                    return sendError(sendPackage, mPackage.method_id, 'Invalid permissions JSON', Code.Bad_Request);
                }

                await ChatAdminLinker.updateAdminPermissions(chat.id, data.targetUserId, data.permissions)

                sendPackage(Package.encode({
                    method_id: Methods.Edit_Chat_Admin_Permissions_Response,
                    flags: 0,
                    data: LingCatProto.methods.Edit_Chat_Admin_Permissions_Response.encode({}).finish()
                }))
            }
            /**
             * 删除管理员
             */
            case Methods.Remove_Chat_Admin_Request: {
                const data = LingCatProto.methods.Remove_Chat_Admin_Request.decode(mPackage.data)
                const operator_id = (await TokenManager.verifyAccessToken(data.accessToken)).user_id
                const chat = await ChatDataBase.queryChatById(data.chatId)
                if (!chat) return sendError(sendPackage, mPackage.method_id, 'Chat not found', Code.Not_Found)

                // 只有群主或拥有 manage_admins 权限的管理员可以移除管理员
                if (!await ChatAdminLinker.isOwner(chat.id, operator_id)/*  &&
                    !await ChatAdminLinker.checkAdminPermission(chat.id, operator_id, 'manage_admins') */) {
                    return sendError(sendPackage, mPackage.method_id, 'Permission denied', Code.Forbidden)
                }

                // 不能移除群主
                if (await ChatAdminLinker.isOwner(chat.id, data.targetUserId)) {
                    return sendError(sendPackage, mPackage.method_id, 'Cannot remove the group owner', Code.Forbidden)
                }

                // 不能移除自己（除非是群主移除自己，但群主已经是 owner，上面拦住了）
                if (data.targetUserId === operator_id) {
                    return sendError(sendPackage, mPackage.method_id, 'Cannot remove yourself as admin', Code.Forbidden)
                }

                // 检查目标是否是管理员
                if (!await ChatAdminLinker.isAdmin(chat.id, data.targetUserId)) {
                    return sendError(sendPackage, mPackage.method_id, 'User is not an admin', Code.Not_Found)
                }

                await ChatAdminLinker.removeAdmin(chat.id, data.targetUserId)

                sendPackage(Package.encode({
                    method_id: Methods.Remove_Chat_Admin_Response,
                    flags: 0,
                    data: LingCatProto.methods.Remove_Chat_Admin_Response.encode({}).finish()
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