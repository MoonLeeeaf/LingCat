import knex from "knex"
import { base_data_path } from "../config.ts"
import crypto from 'node:crypto'
import fs from 'node:fs'
import node_path from 'node:path'
import { db } from "./db.ts"

const tableName = 'UploadSessions'

;(async () => {
    if (!await db.schema.hasTable(tableName)) {
        await db.schema.createTable(tableName, (table) => {
            table.uuid('upload_id').primary()
            table.string('user_id').notNullable()
            table.bigInteger('total_size').notNullable()
            table.bigInteger('offset').defaultTo(0)
            table.string('file_name').notNullable()
            table.string('mime').notNullable()
            table.string('belong_to_chat_id')
            table.string('expected_hash')
            table.string('status').defaultTo('pending')
            table.string('temp_path').notNullable()
            table.bigInteger('created_at').notNullable()
            table.bigInteger('updated_at').notNullable()
            table.bigInteger('expires_at').notNullable()
        })
    }
})()

export default class UploadSessionManager {
    static getTempDir() {
        const dir = node_path.join(base_data_path, 'upload_sessions')
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
        return dir
    }

    static async createSession(user_id: string, size: number, fileName: string, mime: string, belong_to_chat_id?: string, expected_hash?: string) {
        const upload_id = crypto.randomUUID()
        const temp_path = node_path.join(this.getTempDir(), `${upload_id}.part`)
        const now = Date.now()
        const expires_at = now + 24 * 60 * 60 * 1000 // 24小时后过期

        // 初始化空文件
        fs.writeFileSync(temp_path, '')

        await db(tableName).insert({
            upload_id,
            user_id,
            total_size: size,
            offset: 0,
            file_name: fileName,
            mime,
            belong_to_chat_id,
            expected_hash,
            status: 'pending',
            temp_path,
            created_at: now,
            updated_at: now,
            expires_at
        })

        return { upload_id, temp_path, offset: 0 }
    }

    static async getSession(upload_id: string, user_id: string) {
        return await db(tableName).where({ upload_id, user_id }).first()
    }

    static async deleteSession(upload_id: string) {
        const session = await db(tableName).where({ upload_id }).first()
        if (session && fs.existsSync(session.temp_path)) {
            fs.unlinkSync(session.temp_path)
        }
        await db(tableName).where({ upload_id }).del()
    }

    static async appendChunk(upload_id: string, stream: NodeJS.ReadableStream, startOffset: number, totalSize: number): Promise<number> {
        const session = await db(tableName).where({ upload_id }).first()
        if (!session) throw new Error('Session not found')

        // 校验当前实际文件大小与客户端传的 offset 是否匹配
        const actualSize = fs.existsSync(session.temp_path) ? fs.statSync(session.temp_path).size : 0
        if (actualSize !== startOffset) {
            throw { code: 409, message: 'Offset mismatch', actualOffset: actualSize }
        }

        return new Promise((resolve, reject) => {
            const writeStream = fs.createWriteStream(session.temp_path, { flags: 'a' }) // 追加模式
            
            stream.pipe(writeStream)
            
            stream.on('error', (err) => reject(err))
            writeStream.on('error', (err) => reject(err))
            
            writeStream.on('finish', async () => {
                const newSize = fs.statSync(session.temp_path).size
                await db(tableName).where({ upload_id }).update({ offset: newSize, updated_at: Date.now() })
                resolve(newSize)
            })
        })
    }

    static async cleanupExpired() {
        const now = Date.now()
        const expired = await db(tableName).where('expires_at', '<', now).andWhere('status', 'pending')
        for (const session of expired) {
            await this.deleteSession(session.upload_id)
        }
    }
}

// 启动时执行一次清理，之后每小时清理一次
UploadSessionManager.cleanupExpired().catch(console.error)
setInterval(() => UploadSessionManager.cleanupExpired().catch(console.error), 3600_000)
