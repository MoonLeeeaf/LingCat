import { db } from "./db.ts"
import type { ISticker, IStickerPack } from "lingcat-protocol"

const packsTable = 'StickerPacks'
const stickersTable = 'Stickers'
const linksTable = 'UserStickerPacks'

;(!await db.schema.hasTable(packsTable)) && await db.schema.createTable(packsTable, (table) => {
    table.string('id').primary()
    table.string('title').notNullable()
    table.string('author_user_id').notNullable()
    table.string('cover_file_hash')
    table.integer('created_at').notNullable()
    table.integer('updated_at').notNullable()

    table.index('author_user_id', 'idx_sticker_pack_author')
})

;(!await db.schema.hasTable(stickersTable)) && await db.schema.createTable(stickersTable, (table) => {
    table.string('pack_id').notNullable()
    table.string('hash').notNullable()
    table.string('mime').notNullable()
    table.string('emoji')
    table.integer('sort').notNullable().defaultTo(0)

    table.primary(['pack_id', 'hash'])
    table.index('pack_id', 'idx_sticker_pack')
})

;(!await db.schema.hasTable(linksTable)) && await db.schema.createTable(linksTable, (table) => {
    table.string('user_id').notNullable()
    table.string('pack_id').notNullable()
    table.integer('created_at').notNullable()

    table.primary(['user_id', 'pack_id'])
    table.index('user_id', 'idx_user_sticker_pack')
})

export interface StickerContentInput {
    hash: string
    mime: string
    emoji?: string | null
}

export default class StickerDataBase {
    static async queryPack(packId: string): Promise<IStickerPack | undefined> {
        return await db<IStickerPack>(packsTable).where('id', packId).first()
    }

    /** 我订阅的包, 按订阅时间倒序 */
    static async queryPacksOfUser(userId: string): Promise<IStickerPack[]> {
        return await db(packsTable + ' as p')
            .join(linksTable + ' as l', 'l.pack_id', 'p.id')
            .where('l.user_id', userId)
            .orderBy('l.created_at', 'desc')
            .select('p.*') as IStickerPack[]
    }

    static async queryStickers(packId: string): Promise<ISticker[]> {
        return await db<ISticker>(stickersTable).where('pack_id', packId).orderBy('sort', 'asc') as ISticker[]
    }

    static async queryStickersOfPacks(packIds: string[]): Promise<ISticker[]> {
        if (packIds.length === 0) return []
        return await db<ISticker>(stickersTable)
            .whereIn('pack_id', packIds)
            .orderBy('sort', 'asc') as ISticker[]
    }

    static async createPack(pack: {
        id: string
        title: string
        author_user_id: string
        cover_file_hash?: string | null
    }): Promise<IStickerPack> {
        const now = Date.now()
        await db(packsTable).insert({
            id: pack.id,
            title: pack.title,
            author_user_id: pack.author_user_id,
            cover_file_hash: pack.cover_file_hash || null,
            created_at: now,
            updated_at: now,
        })
        // 作者自动订阅自己的包
        await this.setSubscribed(pack.author_user_id, pack.id, true)
        return (await this.queryPack(pack.id))!
    }

    static async updateTitle(packId: string, title: string): Promise<void> {
        await db(packsTable).where('id', packId).update({ title, updated_at: Date.now() })
    }

    /**
     * 覆盖式写入包内容。校验失败时整体回滚, 不会清空旧内容。
     */
    static async setContent(packId: string, items: StickerContentInput[], coverFileHash?: string | null): Promise<void> {
        await db.transaction(async (trx) => {
            await trx(stickersTable).where('pack_id', packId).del()

            if (items.length > 0) {
                await trx(stickersTable).insert(items.map((it, index) => ({
                    pack_id: packId,
                    hash: it.hash,
                    mime: it.mime,
                    emoji: it.emoji || null,
                    sort: index,
                })))
            }

            const patch: Record<string, unknown> = { updated_at: Date.now() }
            if (coverFileHash !== undefined) patch.cover_file_hash = coverFileHash || null
            await trx(packsTable).where('id', packId).update(patch)
        })
    }

    static async isSubscribed(userId: string, packId: string): Promise<boolean> {
        const row = await db(linksTable).where({ user_id: userId, pack_id: packId }).first()
        return !!row
    }

    static async countSubscribedPacks(userId: string): Promise<number> {
        const row = await db(linksTable).where('user_id', userId).count<{ count: number }[]>('* as count')
        return Number(row[0]?.count || 0)
    }

    static async setSubscribed(userId: string, packId: string, subscribed: boolean): Promise<void> {
        if (subscribed) {
            const exists = await this.isSubscribed(userId, packId)
            if (exists) return
            await db(linksTable).insert({ user_id: userId, pack_id: packId, created_at: Date.now() })
        } else {
            await db(linksTable).where({ user_id: userId, pack_id: packId }).del()
        }
    }

    /**
     * 删除包: 只清理包内容与订阅关系, 不物理删除图片文件。
     * 历史消息仍然按 hash 引用这些文件。
     */
    static async deletePack(packId: string): Promise<void> {
        await db.transaction(async (trx) => {
            await trx(stickersTable).where('pack_id', packId).del()
            await trx(linksTable).where('pack_id', packId).del()
            await trx(packsTable).where('id', packId).del()
        })
    }
}
