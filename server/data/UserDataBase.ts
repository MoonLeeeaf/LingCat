import knex from 'knex'
import { base_data_path } from '../config.ts'
import { Code, type IUser } from 'lingcat-protocol'
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
    password: string
}

export type { IServerUser }

(!await db.schema.hasTable('Users')) && await db.schema.createTable('Users', (table) => {
    table.increments('key_id').primary()
    table.string('id').unique().notNullable()
    table.string('username').unique()
    table.string('nickname').notNullable()
    table.string('password').notNullable()
    table.string('description')
    table.string('avatar_file_hash')
    table.integer('created_at').notNullable()
})

export default class UserDataBase {
    static async createUser({
        username,
        nickname,
        password,
    }: {
        username?: string | null,
        nickname: string,
        password: string,
    }) {
        try {
            const userId = crypto.randomUUID()
            await db<IServerUser>('Users').insert({
                username,
                nickname,
                password: this.hashifyPassword(password),
                created_at: Date.now(),
                id: userId,
            })
            return userId
        } catch (e) {
            const s = e + ''
            if (s.indexOf('UNIQUE') != -1 && s.indexOf('username') != -1)
                throw { message: '用户名重复!', cause: e, code: Code.Bad_Request }
            else if (s.indexOf('NOT NULL') != -1 && s.indexOf('nickname') != -1)
                throw { message: '缺失昵称!', cause: e, code: Code.Bad_Request }
            else
                throw { message: s, cause: e, code: Code.Internal_Server_Error }
        }
    }
    static hashifyPassword(password: string) {
        return crypto.createHash('sha256').update(password + '_lingcat').digest().toString('hex')
    }

    static async queryUserById(id: string) {
        return await db<IServerUser>('Users').where('id', id).first()
    }
    static async queryUserByUserName(username: string) {
        return await db<IServerUser>('Users').where('username', username).first()
    }
    static async queryUserByAccount(account: string) {
        return await this.queryUserById(account) || await this.queryUserByUserName(account)
    }

    static async updateUserName(id: string, username: string) {
        await db<IServerUser>('Users').update({ username }).where('id', id)
    }
    static async updateNickName(id: string, username: string) {
        await db<IServerUser>('Users').update({ username }).where('id', id)
    }
    static async updateRawPassWord(id: string, password: string) {
        await db<IServerUser>('Users').update({ password }).where('id', id)
    }
    static async updateDescription(id: string, description: string) {
        await db<IServerUser>('Users').update({ description }).where('id', id)
    }
    static async updateAvatarFileHash(id: string, avatar_file_hash: string) {
        await db<IServerUser>('Users').update({ avatar_file_hash }).where('id', id)
    }
}
