import { db } from './db.ts'

export interface IMeetingRecord {
    id: string
    chat_id: string
    room: string
    starter_user_id: string
    title?: string | null
    created_at: number
    last_active_at?: number | null
}

const tableName = 'Meetings';
(!await db.schema.hasTable(tableName)) && await db.schema.createTable(tableName, (table) => {
    table.string('id').primary()
    table.string('chat_id').notNullable().index('idx_meetings_chat')
    table.string('room').notNullable()
    table.string('starter_user_id').notNullable()
    table.string('title')
    table.integer('created_at').notNullable()
    table.integer('last_active_at')
})
if (!(await db.schema.hasColumn(tableName, 'last_active_at'))) {
    await db.schema.alterTable(tableName, (table) => {
        table.integer('last_active_at')
    })
}

export default class MeetingDataBase {
    static async create(m: IMeetingRecord) {
        await db<IMeetingRecord>(tableName).insert(m)
    }

    static async get(id: string) {
        return await db<IMeetingRecord>(tableName).where({ id }).first()
    }

    static async getAllActive(minCreatedAt: number): Promise<IMeetingRecord[]> {
        return await db<IMeetingRecord>(tableName)
            .where('created_at', '>=', minCreatedAt)
            .orderBy('created_at', 'asc')
            .select('*')
    }

    static async findByChat(chat_id: string) {
        return await db<IMeetingRecord>(tableName).where({ chat_id }).orderBy('created_at', 'desc').first()
    }

    static async updateTitle(id: string, title: string) {
        await db<IMeetingRecord>(tableName).where({ id }).update({ title })
    }

    static async touch(id: string, at = Date.now()) {
        await db<IMeetingRecord>(tableName).where({ id }).update({ last_active_at: at })
    }

    static async getAll(): Promise<IMeetingRecord[]> {
        return await db<IMeetingRecord>(tableName).select('*')
    }

    static async remove(id: string) {
        await db<IMeetingRecord>(tableName).where({ id }).del()
    }

    static async removeExpired(before: number) {
        await db<IMeetingRecord>(tableName)
            .whereRaw('COALESCE(last_active_at, created_at) < ?', [before])
            .del()
    }
}
