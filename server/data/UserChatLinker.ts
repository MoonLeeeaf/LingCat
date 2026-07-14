import knex from "knex"
import { base_data_path } from "../config.ts"

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: base_data_path + '/db/UserChatLinker.db'
    },
    useNullAsDefault: true,
})

interface IUserChatLink {
    seq: number
    user_id: string
    chat_id: string
}


export type { IUserChatLink as IServerFile }
(!await db.schema.hasTable('UserChatLinker')) && await db.schema.createTable('UserChatLinker', (table) => {
    table.increments('seq').primary()
    table.string('user_id').notNullable()
    table.string('chat_id').notNullable()
    table.index('user_id', 'idx_user_id')
    table.index('chat_id', 'idx_chat_id')
})

export default class UserChatLinker {
    static async queryChatsOfUser(user_id: string) {
        return (await db<IUserChatLink>('UserChatLinker').where('user_id', user_id)).map((v) => v.chat_id)
    }

    static async queryUsersOfChat(chat_id: string) {
        return (await db<IUserChatLink>('UserChatLinker').where('chat_id', chat_id)).map((v) => v.user_id)
    }

    static async isUserChatLinked(user_id: string, chat_id: string) {
        return !!await db<IUserChatLink>('UserChatLinker').where({ chat_id, user_id }).first()
    }

    static async linkUserAndChat(user_id: string, chat_id: string) {
        if (!await this.isUserChatLinked(user_id, chat_id)) {
            await knex('UserChatLinker').insert({
                user_id,
                chat_id
            })
        }
    }

    static async unlinkUserAndChat(user_id: string, chat_id: string) {
        await knex('UserChatLinker')
            .where({ user_id, chat_id })
            .del()
    }
}
