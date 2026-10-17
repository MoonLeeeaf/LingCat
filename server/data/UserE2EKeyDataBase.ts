import { db } from './db.ts'
import type { IUserE2EKey } from 'lingcat-protocol'

export interface IServerUserE2EKey extends IUserE2EKey {
    user_id: string
    created_at: number
}

const tableName = 'UserE2EKeys'
;(!await db.schema.hasTable(tableName)) && await db.schema.createTable(tableName, (table) => {
    table.string('user_id').notNullable()
    table.integer('key_version').notNullable()
    table.string('public_key').notNullable()
    table.text('encrypted_private_key').notNullable()
    table.string('kdf_salt').notNullable()
    table.string('kdf_params').notNullable()
    table.string('priv_nonce').notNullable()
    table.bigInteger('created_at').notNullable()
    
    table.primary(['user_id', 'key_version'])
})

export default class UserE2EKeyDataBase {
    static async save(record: Omit<IServerUserE2EKey, 'created_at'>) {
        await db(tableName)
            .insert({ ...record, created_at: Date.now() })
            .onConflict(['user_id', 'key_version'])
            .merge()
    }

    /** 获取指定版本的密钥 */
    static async getSpecificVersion(user_id: string, key_version: number): Promise<IServerUserE2EKey | undefined> {
        return await db(tableName).where({ user_id, key_version }).first()
    }

    /** 获取该用户的所有历史密钥（倒序） */
    static async getAll(user_id: string): Promise<IServerUserE2EKey[]> {
        return await db(tableName).where({ user_id }).orderBy('key_version', 'desc')
    }

    /** 获取某人最新版本的密钥信息（可以是自己的，用于解锁；也可以是别人的） */
    static async getLatest(user_id: string): Promise<IServerUserE2EKey | undefined> {
        return await db(tableName).where({ user_id }).orderBy('key_version', 'desc').first()
    }

    /** 批量获取某些人的最新公钥（用于 ECDH） */
    static async getLatestPublicKeys(user_ids: string[]): Promise<{ user_id: string, public_key: string }[]> {
        if (user_ids.length === 0) return []
        
        // 获取每个人最大的 key_version
        const subquery = db(tableName)
            .select('user_id')
            .max('key_version as max_version')
            .whereIn('user_id', user_ids)
            .groupBy('user_id')

        // 联表查出对应的公钥
        const rows = await db(tableName)
            .join(subquery.as('sub'), function() {
                this.on('UserE2EKeys.user_id', '=', 'sub.user_id')
                    .andOn('UserE2EKeys.key_version', '=', 'sub.max_version')
            })
            .select('UserE2EKeys.user_id', 'UserE2EKeys.public_key')

        return rows
    }
}