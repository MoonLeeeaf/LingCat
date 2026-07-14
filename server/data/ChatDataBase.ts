import knex from 'knex'
import { base_data_path } from '../config.ts'
import { Code, type IChat, type ChatType } from 'lingcat-protocol'
import crypto from 'node:crypto'

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: base_data_path + '/db/Users.db'
    },
    useNullAsDefault: true,
})

interface IServerChat extends IChat {
    created_at: number
}

; (!await db.schema.hasTable('Chats')) && await db.schema.createTable('Chats', (table) => {
    table.increments('key_id').primary()
    table.string('id').unique().notNullable()
    table.string('unique').unique()
    table.string('title')
    table.string('avatar_file_hash')
    table.string('type').notNullable()
    table.string('settings').notNullable()
    table.integer('created_at').notNullable()
})

export default class ChatDataBase {
    static async createGroup({
        unique,
        title,
    }: {
        unique?: string | null
        title: string
    }) {
        return await this.createChat({
            unique,
            type: 'group',
            title,
        })
    }
    static async createOrGetPrivate({
        a,
        b,
    }: {
        a: string
        b: string
    }) {
        const id = [a, b].sort().join('_')
        const chat = await this.queryChatById(id)
        if (chat != null) return chat
        return await this.createChat({
            type: 'private',
            id,
        })
    }
    static async createChat({
        type,
        unique,
        title,
        id,
    }: {
        type: ChatType
        unique?: string | null
        title?: string | null
        id?: string | null
    }) {
        try {
            id = id || crypto.randomUUID()
            await db<IServerChat>('Chats').insert({
                type,
                created_at: Date.now(),
                unique,
                settings: '{}',
                id,
                title,
            })
            return id
        } catch (e) {
            const s = e + ''
            if (s.indexOf('UNIQUE') != -1 && s.indexOf('unique') != -1)
                throw { message: '标识符重复!', cause: e, code: Code.Bad_Request }
            else
                throw { message: s, cause: e, code: Code.Internal_Server_Error }
        }
    }

    static async queryChatById(id: string) {
        return await db<IServerChat>('Chats').where('id', id).first()
    }
    static async queryChatByUnique(unique: string) {
        return await db<IServerChat>('Chats').where('unique', unique).first()
    }
    static async queryUserByIdOrUnique(id_or_unique: string) {
        return await this.queryChatById(id_or_unique) || await this.queryChatByUnique(id_or_unique)
    }

    static async updateTitle(id: string, title: string) {
        await db<IServerChat>('Chats').update({ title }).where('id', id)
    }
    static async updateUnique(id: string, unique: string) {
        try {
            await db<IServerChat>('Chats').update({ unique }).where('id', id)
        } catch (e) {
            const s = e + ''
            if (s.indexOf('UNIQUE') != -1 && s.indexOf('unique') != -1)
                throw { message: '标识符重复!', cause: e, code: Code.Bad_Request }
            else
                throw { message: s, cause: e, code: Code.Internal_Server_Error }
        }
    }

    static async updateSettings(id: string, settings: object) {
        await db<IServerChat>('Chats').update({ settings: JSON.stringify(settings) }).where('id', id)
    }
    static async updateSetting(id: string, key: string, value: string | boolean | number | Array<any>) {
        if (this.settings[key] == null)
            throw { message: '设置项不存在!', code: Code.Bad_Request }
        if (this.settings[key] != typeof value)
            if (this.settings[key] == 'list') {
                if (!(value instanceof Array))
                    throw { message: '设置项值类型错误!', code: Code.Bad_Request }
            } else {
                throw { message: '设置项值类型错误!', code: Code.Bad_Request }
            }
        const chat = await this.queryChatById(id)
        if (!chat)
            throw { message: '对话不存在!', code: Code.Not_Found }
        const settings = JSON.parse(chat.settings)
        settings[key] = value
        this.updateSettings(id, settings)
    }

    static settings = {
        allow_join: 'boolean'
    }
}