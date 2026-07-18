import knex from "knex"
import { base_data_path } from "../config.ts"
import { db } from "./db.ts"
import { IChat } from "lingcat-protocol"
import ChatDataBase from "./ChatDataBase.ts"
import UserDataBase from "./UserDataBase.ts"
import MessageDataBase from "./MessageDataBase.ts"

interface IUserChatLink {
    seq: number
    user_id: string
    chat_id: string
    favorited_by_user: boolean
}

export type { IUserChatLink }

const tableName = 'UserChatLinker';
(!await db.schema.hasTable(tableName)) && await db.schema.createTable(tableName, (table) => {
    table.increments('seq').primary()
    table.string('user_id').notNullable()
    table.string('chat_id').notNullable()
    table.boolean('favorited_by_user').notNullable().defaultTo(false)

    table.index('user_id', 'idx_user_id')
    table.index('chat_id', 'idx_chat_id')
    table.unique(['user_id', 'chat_id'], 'idx_unique_user_chat')
})

export default class UserChatLinker {
    static async queryChatsOfUser(user_id: string, options: {
        limit?: number
        offset?: number
    }) {
        const { limit = 20, offset = 0 } = options
        const query = await db(tableName + ' as ucl')
            .join('Chats as c', 'ucl.chat_id', 'c.id')
            .leftJoin('Messages as m', function () {
                this.on('c.last_message_id', '=', 'm.id')
                    .andOn('c.id', '=', 'm.chat_id');
            })
            .where('ucl.user_id', user_id)
            // 按时间从新到旧排列
            .orderBy('c.last_message_time', 'desc')
            .select('c.*', 'm.text as last_message_text')
            .limit(limit)
            .offset(offset)
        console.log(query)
        return (query as IChat[])
    }
    static async queryFavouriteChatsOfUser(user_id: string, options: {
        limit?: number
        offset?: number
    }) {
        const { limit = 20, offset = 0 } = options
        const query = db(tableName + ' as ucl')
            .join('Chats as c', 'ucl.chat_id', 'c.id')
            .leftJoin('Messages as m', function () {
                this.on('c.last_message_id', '=', 'm.id')
                    .andOn('c.id', '=', 'm.chat_id');
            })
            .where('ucl.user_id', user_id)
            .andWhere('ucl.favorited_by_user', true)
            // 按时间从新到旧排列
            .orderBy('c.last_message_time', 'desc')
            .select('c.*', 'm.text as last_message_text')
            .limit(limit)
            .offset(offset)
        return (await query as IChat[])
    }
    // DeepSeek
    static async searchChatsOfUser(user_id: string, keyword: string) {
        const kw = `%${keyword.trim().toLowerCase()}%`
        if (keyword.trim() == '') return []

        // 1. 搜索群聊（匹配 title 或 chat_unique）
        const groupChats = await db('Chats as c')
            .join('UserChatLinker as ucl', 'c.id', 'ucl.chat_id')
            .leftJoin('Messages as m', function () {
                this.on('c.last_message_id', '=', 'm.id')
                    .andOn('c.id', '=', 'm.chat_id');
            })
            .where('ucl.user_id', user_id)
            .andWhere('c.type', 'group')
            .andWhere(function () {
                this.where('c.title', 'like', kw)
                    .orWhere('c.chat_unique', 'like', kw)
                    .orWhere('c.id', 'like', kw)
            })
            .select('c.*', 'm.text as last_message_text')

        // 2. 搜索私聊（通过 UserChatLinker 找到对方，再匹配对方昵称/用户名）
        const privateChats = await db('Chats as c')
            // 我
            .join('UserChatLinker as ucl1', 'c.id', 'ucl1.chat_id')
            // 对方
            .join('UserChatLinker as ucl2', 'c.id', 'ucl2.chat_id')
            // 对方用户信息
            .join('Users as u', 'u.id', 'ucl2.user_id')
            .leftJoin('Messages as m', function () {
                this.on('c.last_message_id', '=', 'm.id')
                    .andOn('c.id', '=', 'm.chat_id');
            })
            .where('ucl1.user_id', user_id)
            // 排除自己
            .andWhere('ucl2.user_id', '!=', user_id)
            .andWhere('c.type', 'private')
            .andWhere(function () {
                this.where('u.nickname', 'like', kw)
                    .orWhere('u.username', 'like', kw)
                    .orWhere('u.id', 'like', kw)
            })
            .select('c.*', 'm.text as last_message_text')

        const currentUser = await UserDataBase.queryUserById(user_id)!
        let selfChat: IChat | undefined
        if (currentUser) {
            const lowerKeyword = keyword.toLowerCase()
            const matchSelf = (currentUser.nickname?.toLowerCase().includes(lowerKeyword) || false) ||
                (currentUser.username?.toLowerCase().includes(lowerKeyword) || false)

            if (matchSelf) {
                // 1. 确保 "自己的私聊" 在 Chats 表中存在（ID 为 user_id_user_id）
                const selfChatId = await ChatDataBase.createOrGetPrivate({ a: user_id, b: user_id })
                // 2. 确保 UserChatLinker 中有自己的关联（防止未关联）
                await UserChatLinker.linkUserAndChat(user_id, selfChatId)
                // 3. 获取完整的聊天对象
                selfChat = (await ChatDataBase.queryChatById(selfChatId))
                selfChat!.avatar_file_hash = currentUser?.avatar_file_hash
                selfChat!.title = currentUser?.nickname
                selfChat!.last_message_text = (await MessageDataBase.getMessages(selfChatId, { limit: 1 }))[0].text
            }
        }

        // 3. 合并结果，按最新消息时间降序
        const all = [...groupChats, ...privateChats] as IChat[]
        selfChat && all.push(selfChat)
        all.sort((a, b) => (b.last_message_time || 0) - (a.last_message_time || 0))
        return all
    }

    static async queryUsersOfChat(chat_id: string) {
        return (await db<IUserChatLink>(tableName).where('chat_id', chat_id)).map((v) => v.user_id)
    }

    static async isUserChatLinked(user_id: string, chat_id: string) {
        return !!await db<IUserChatLink>(tableName).where({ chat_id, user_id }).first()
    }

    static async getAnotherUserInPrivateChat(chat_id: string, my_user_id: string) {
        // 如果是自己的私聊, 返回自己
        // 反之, 返回对方
        const users = await this.queryUsersOfChat(chat_id)
        if (users.length == 1)
            return my_user_id
        return users.find((id) => id != my_user_id)
    }

    static async linkUserAndChat(user_id: string, chat_id: string) {
        await db<IUserChatLink>(tableName)
            .insert({
                user_id,
                chat_id
            })
            .onConflict(['user_id', 'chat_id'])
            .ignore()
    }

    static async setUserChatFavourited(user_id: string, chat_id: string, favorite: boolean) {
        await db(tableName)
            .update({ favorited_by_user: favorite })
            .where({ user_id, chat_id })
    }

    static async unlinkUserAndChat(user_id: string, chat_id: string) {
        await db(tableName)
            .where({ user_id, chat_id })
            .del()
    }
}
