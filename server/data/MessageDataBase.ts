import knex from 'knex'
import { base_data_path } from '../config.ts'
import { Code, type IMessage } from 'lingcat-protocol'
import ChatDataBase from './ChatDataBase.ts'
import { db } from "./db.ts"

const tableName = 'Messages';
(!await db.schema.hasTable(tableName)) && await db.schema.createTable(tableName, (table) => {
    table.increments('key_id').primary()
    table.integer('id').notNullable()
    table.string('chat_id').notNullable().index()
    table.string('sender_user_id')
    table.boolean('system')
    table.string('text').notNullable()
    table.integer('time').notNullable()
    table.unique(['chat_id', 'id'], 'idx_chat_id')
})

export default class MessageDataBase {
    static async addMessage(msg: {
        sender_user_id?: string | null
        system?: boolean | null
        chat_id: string
        text: string
        time: number
    }) {
        if (!msg.chat_id) throw { message: "chat_id must be provided", code: Code.Bad_Request }

        // 使用事务保证原子性
        const id = await db.transaction(async (trx) => {
            const lastRow = await trx(tableName)
                .where('chat_id', msg.chat_id)
                .orderBy('id', 'desc')
                .select('id')
                .first()
            const nextId = lastRow ? lastRow.id + 1 : 1

            await trx(tableName).insert({
                ...msg,
                id: nextId,
            })

            return nextId
        })
        // 注意: 处理完事务再处理更新
        await ChatDataBase.updateLastMessage(msg.chat_id, id, msg.time)
        return id
    }

    /**
     * 获取从某个位置 往前或往后 的消息, 按从旧到新排序
     * @param chat_id 
     * @param options 
     * @returns 
     */
    static async getMessages(
        chat_id: string,
        options: {
            // id < before
            before?: number,
            // id > after
            after?: number,
            limit?: number
        }
    ) {
        const query = db<IMessage>(tableName)
            .select('*')
            .where('chat_id', chat_id)

        if (options.before != null)
            // 1. 顺序获取 从旧到新
            // 2. 倒序, 从新到旧
            // 3. 取前 n 个
            // 4. 再次反转, 从旧到新
            return (await query
                .andWhere('id', '<', options.before)
                .orderBy('id', 'desc')
                .limit(options.limit || 20)).reverse()
        else if (options.after != null)
            // 1. 顺序获取 从旧到新
            // 2. 取后 n 个
            return await query
                .andWhere('id', '>', options.after)
                .orderBy('id', 'asc')
                .limit(options.limit || 20)
        else
            // 拉取最新消息 从旧到新
            return (await query.orderBy('id', 'desc').limit(options.limit || 20)).reverse()
    }
    static async editText(chat_id: string, id: number, text: string) {
        await db<IMessage>(tableName).update({ text }).where('id', id).andWhere('chat_id', chat_id)
    }
}