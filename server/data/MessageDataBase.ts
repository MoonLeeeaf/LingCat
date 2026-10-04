import { Code, type IMessage, type IMessageEntity } from 'lingcat-protocol'
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
    table.text('entities').notNullable().defaultTo('[]')
    table.integer('time').notNullable()
    table.unique(['chat_id', 'id'], 'idx_chat_id')
})

export default class MessageDataBase {
    static async addMessage(msg: {
        sender_user_id?: string | null
        system?: boolean | null
        chat_id: string
        text: string
        entities?: IMessageEntity[]
        time: number
    }) {
        if (!msg.chat_id) throw { message: "chat_id must be provided", code: Code.Bad_Request }

        // 原子分配群内自增 id:
        // INSERT ... SELECT COALESCE(MAX(id),0)+1 ... 单条语句执行, SQLite 写锁保证并发下不会出现
        // "先查 MAX 再插入" 的竞态 (旧实现会导致唯一键冲突或丢号)。
        const rows: any = await db.raw(
            `INSERT INTO ${tableName} (chat_id, id, sender_user_id, system, text, entities, time)
             SELECT ?, COALESCE(MAX(id), 0) + 1, ?, ?, ?, ?, ?
             FROM ${tableName} WHERE chat_id = ?
             RETURNING id`,
            [
                msg.chat_id,
                msg.sender_user_id ?? null,
                msg.system ? 1 : 0,
                msg.text,
                JSON.stringify(msg.entities ?? []),
                msg.time,
                msg.chat_id,
            ]
        )

        const rawId = Array.isArray(rows) ? rows[0]?.id : rows?.id
        const id = typeof rawId === 'string' ? Number(rawId) : (rawId as number)

        // 注意: 处理完插入再处理更新
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

        let rows: any[]
        if (options.before != null)
            // 1. 顺序获取 从旧到新
            // 2. 倒序, 从新到旧
            // 3. 取前 n 个
            // 4. 再次反转, 从旧到新
            rows = (await query
                .andWhere('id', '<', options.before)
                .orderBy('id', 'desc')
                .limit(options.limit || 20)).reverse()
        else if (options.after != null)
            // 1. 顺序获取 从旧到新
            // 2. 取后 n 个
            rows = await query
                .andWhere('id', '>', options.after)
                .orderBy('id', 'asc')
                .limit(options.limit || 20)
        else
            // 拉取最新消息 从旧到新
            rows = (await query.orderBy('id', 'desc').limit(options.limit || 20)).reverse()

        // 反序列化 entities
        return rows.map((r) => ({
            ...r,
            entities: JSON.parse(r.entities || '[]') as IMessageEntity[],
        })) as IMessage[]
    }

    static async editText(chat_id: string, id: number, text: string, entities?: IMessageEntity[]) {
        const updates: Record<string, any> = { text }
        if (entities !== undefined) {
            updates.entities = JSON.stringify(entities)
        }
        await db<IMessage>(tableName).update(updates).where('id', id).andWhere('chat_id', chat_id)
    }
}