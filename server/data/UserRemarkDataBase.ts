import { db } from './db.ts'

export interface IServerUserRemark {
    user_id: string
    target_user_id: string
    remark: string
}

const tableName = 'UserRemarks'
;(!await db.schema.hasTable(tableName)) && await db.schema.createTable(tableName, (table) => {
    table.string('user_id').notNullable()
    table.string('target_user_id').notNullable()
    table.string('remark').notNullable()
    table.primary(['user_id', 'target_user_id'])
    table.index('idx_user_remarks_user_id', 'user_id')
})

export default class UserRemarkDataBase {
    /** 设置备注（空字符串 = 删除） */
    static async set(user_id: string, target_user_id: string, remark: string) {
        if (remark.length === 0) {
            await db(tableName).where({ user_id, target_user_id }).del()
        } else {
            await db(tableName)
                .insert({ user_id, target_user_id, remark })
                .onConflict(['user_id', 'target_user_id'])
                .merge()
        }
    }

    /** 拉取某用户设置的全部备注 */
    static async getAllByUser(user_id: string) {
        return await db<IServerUserRemark>(tableName).where({ user_id })
    }

    /** 清空某用户的所有备注（登出 / 删号用） */
    static async removeAllByUser(user_id: string) {
        await db(tableName).where({ user_id }).del()
    }
}