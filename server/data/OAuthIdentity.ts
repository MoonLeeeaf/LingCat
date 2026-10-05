import { db } from './db.ts'

export interface IOAuthIdentity {
    key_id?: number
    provider: string
    subject: string
    user_id: string
    created_at: number
}

const tableName = 'OAuthIdentities';
(!await db.schema.hasTable(tableName)) && await db.schema.createTable(tableName, (table) => {
    table.increments('key_id').primary()
    table.string('provider').notNullable()
    table.string('subject').notNullable()
    table.string('user_id').notNullable()
    table.integer('created_at').notNullable()
    table.unique(['provider', 'subject'], 'idx_unique_provider_subject')
    table.index('user_id', 'idx_oauth_user_id')
})

export default class OAuthIdentity {
    static async getUserIdBySubject(provider: string, subject: string) {
        const row = await db<IOAuthIdentity>(tableName).where({ provider, subject }).first()
        return row?.user_id
    }

    static async link(provider: string, subject: string, user_id: string) {
        await db<IOAuthIdentity>(tableName)
            .insert({ provider, subject, user_id, created_at: Date.now() })
            .onConflict(['provider', 'subject'])
            .merge({ user_id })
    }

    static async unlink(provider: string, subject: string) {
        await db<IOAuthIdentity>(tableName).where({ provider, subject }).del()
    }

    static async getByUser(user_id: string) {
        return await db<IOAuthIdentity>(tableName).where({ user_id })
    }
}
