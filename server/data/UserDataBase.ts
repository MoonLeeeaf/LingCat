import knex from 'knex'
import { base_data_path } from '../config.ts'
import type { IUser } from 'lingcat-protocol'
import crypto from 'node:crypto'

const db = knex({
    client: 'sqlite3',
    connection: {
        filename: base_data_path + '/db/Users.db'
    },
    useNullAsDefault: true,
})

interface IServerUser extends IUser {
    created_at: number
}

(!await db.schema.hasTable('Users')) && await db.schema.createTable('Users', (table) => {
    table.increments('key_id').primary()
    table.string('id').unique().notNullable()
    table.string('username').unique()
    table.string('nickname').notNullable()
    table.integer('created_at').notNullable()
})

export default class UserDataBase {
    static async createUser({
        username,
        nickname,
    }: {
        username?: string,
        nickname: string,
    }) {
        try {
            return await db<IServerUser>('Users').insert({
                username,
                nickname,
                created_at: Date.now(),
                id: crypto.randomUUID(),
            })
        } catch (e) {
            const s = e + ''
            if (s.indexOf('UNIQUE') != -1 && s.indexOf('username') != -1)
                throw { msg: '用户名重复!', cause: e }
            else if (s.indexOf('NOT NULL') != -1 && s.indexOf('nickname') != -1)
                throw { msg: '缺失昵称!', cause: e }
            else
                throw { msg: s, cause: e }
        }
    }
    static async queryUserById(id: string) {
        return await db<IServerUser>('Users').where('id', id).first()
    }
    static async queryUserByUserName(username: string) {
        return await db<IServerUser>('Users').where('username', username).first()
    }

    static async updateUserName(id: string, username: string) {
        return await db<IServerUser>('Users').update({ username }).where('id', id)
    }
    static async updateNickName(id: string, username: string) {
        return await db<IServerUser>('Users').update({ username }).where('id', id)
    }
}
