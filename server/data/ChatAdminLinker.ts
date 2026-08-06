import knex from 'knex'
import { base_data_path } from '../config.ts'
import { Code, type IChat, type ChatType, AvailableChatSettings, AvailableChatAdminPermissions, type AvailableChatAdminPermission, type AdminRole } from 'lingcat-protocol'
import crypto from 'node:crypto'
import { db } from "./db.ts"

interface IChatAdminLink {
    key_id: number
    chat_id: string
    user_id: string
    role: AdminRole
    permissions: string
}

export type { IChatAdminLink }

const tableName = 'ChatAdminLinker';
(!await db.schema.hasTable(tableName)) && await db.schema.createTable(tableName, (table) => {
    table.increments('key_id').primary()
    // 联合删除
    table.string('chat_id').notNullable().references('id').inTable('Chats').onDelete('CASCADE')
    table.string('user_id').notNullable().references('id').inTable('Users').onDelete('CASCADE')
    table.string('role').defaultTo('admin')
    // 权能
    table.json('permissions').defaultTo('{}')

    table.unique(['chat_id', 'user_id'], 'idx_unique_chat_admin')
    table.index('chat_id', 'idx_chat_admins_chat')
})

export default class ChatAdminLinker {
    static async isAdmin(chat_id: string, user_id: string) {
        const record = await db<IChatAdminLink>(tableName)
            .where({ chat_id, user_id })
            .first()
        return !!record
    }
    static async isOwner(chat_id: string, user_id: string) {
        const record = await db<IChatAdminLink>(tableName)
            .where({ chat_id, user_id, role: 'owner' })
            .first()
        return !!record
    }
    static async getUserPermissions(chat_id: string, user_id: string): Promise<Record<AvailableChatAdminPermission, boolean>> {
        const record = await db<IChatAdminLink>(tableName)
        .where({ chat_id, user_id })
        .select('permissions', 'role')
        .first()
        if (!record) return {}
        if (record.role === 'owner') {
            const perm = {}
            AvailableChatAdminPermissions.forEach((v) => perm[v] = true)
            return perm
        }
        return JSON.parse(record.permissions || '{}')
    }
    static async checkAdminPermission(chat_id: string, user_id: string, permission: string) {
        const record = await db<IChatAdminLink>(tableName)
            .where({ chat_id, user_id })
            .select('permissions', 'role')
            .first()
        if (!record) return false

        if (record.role == 'owner') return true

        const perms = JSON.parse(record.permissions || '{}')
        return perms[permission] == true
    }
    static async queryAdminsOfChat(chat_id: string) {
        return await db<IChatAdminLink>(tableName)
            .where('chat_id', chat_id)
            .select('user_id', 'role', 'permissions') as { user_id: string, role: AdminRole, permissions: string }[]
    }
    static async updateAdminPermissions(chat_id: string, user_id: string, permissions: string) {
        await db<IChatAdminLink>(tableName).update({ permissions }).where({ user_id, chat_id })
    }
    static async addAdmin(chat_id: string, user_id: string, role?: AdminRole) {
        await db<IChatAdminLink>(tableName)
            .insert({
                user_id,
                chat_id,
                role,
            })
            .onConflict(['user_id', 'chat_id'])
            .ignore()
    }
    static async removeAdmin(chat_id: string, user_id: string) {
        await db(tableName)
            .where({ user_id, chat_id })
            .del()
    }
}
