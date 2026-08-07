import knex from 'knex'
import { base_data_path } from '../config.ts'
import { Code, type IChat, type ChatType, AvailableChatSettings, AvailableChatAdminPermissions, type AvailableChatAdminPermission, type AdminRole, IChatAdmin } from 'lingcat-protocol'
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
        const rows = await db(tableName + ' as cal')
            .join('Users as u', 'cal.user_id', 'u.id')
            .where('cal.chat_id', chat_id)
            .select(
                'u.*',
                'cal.role',
                'cal.permissions'
            ) as IChatAdmin[]
        const ownerPermissions = {}
        AvailableChatAdminPermissions.forEach((v) => ownerPermissions[v] = true)
        const ownerIndex = rows.findIndex((v) => v.role == 'owner')
        ownerIndex != -1 && (rows[ownerIndex].permissions = JSON.stringify(ownerPermissions))
        return rows
    }
    static async updateAdminPermissions(chat_id: string, user_id: string, permissions: string) {
        let permsObj: Record<string, boolean>
        try {
            permsObj = JSON.parse(permissions)
        } catch (e) {
            throw {
                message: '权限数据不是有效的 JSON 格式',
                cause: e,
                code: Code.Bad_Request,
            }
        }

        // 2. 校验权限名称是否在白名单内
        const validKeys = new Set(AvailableChatAdminPermissions)
        const invalidKeys = Object.keys(permsObj).filter(key => !validKeys.has(key))
        if (invalidKeys.length > 0) {
            throw {
                message: `非法权限名称: ${invalidKeys.join(', ')}`,
                code: Code.Bad_Request,
            }
        }

        // 3. 确保权限值为布尔类型
        for (const [key, value] of Object.entries(permsObj)) {
            if (typeof value !== 'boolean') {
                throw {
                    message: `权限 "${key}" 的值必须是布尔类型`,
                    code: Code.Bad_Request,
                }
            }
        }

        await db<IChatAdminLink>(tableName)
            .update({ permissions: JSON.stringify(permsObj) })
            .where({ user_id, chat_id })
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
        if (await this.isOwner(chat_id, user_id)) return
        await db(tableName)
            .where({ user_id, chat_id })
            .del()
    }
}
