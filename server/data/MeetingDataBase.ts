import { db } from './db.ts'

export interface IMeetingRecord {
    id: string
    chat_id: string
    room: string
    starter_user_id: string
    title?: string | null
    created_at: number
}

const tableName = 'Meetings';
(!await db.schema.hasTable(tableName)) && await db.schema.createTable(tableName, (table) => {
    table.string('id').primary()
    table.string('chat_id').notNullable().index('idx_meetings_chat')
    table.string('room').notNullable()
    table.string('starter_user_id').notNullable()
    table.string('title')
    table.integer('created_at').notNullable()
})

export default class MeetingDataBase {
    static async create(m: IMeetingRecord) {
        await db<IMeetingRecord>(tableName).insert(m).onConflict('id').merge()
    }

    static async get(id: string) {
        return await db<IMeetingRecord>(tableName).where({ id }).first()
    }

    static async findByChat(chat_id: string) {
        return await db<IMeetingRecord>(tableName).where({ chat_id }).orderBy('created_at', 'desc').first()
    }

    static async remove(id: string) {
        await db<IMeetingRecord>(tableName).where({ id }).del()
    }

    static async removeExpired(before: number) {
        await db<IMeetingRecord>(tableName).where('created_at', '<', before).del()
    }
}
