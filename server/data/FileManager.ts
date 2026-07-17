import knex from "knex"
import { base_data_path } from "../config.ts"
import { IFile } from "../../protocol/classes-interfaces.ts"
import node_path from 'node:path'
import fs from 'node:fs'
import { fileTypeFromFile } from 'file-type'
import { db } from "./db.ts"

interface IServerFile extends IFile {
    key_id: number
    last_used_time?: number
}

export type { IServerFile }

const tableName = 'FilesMap';
(!await db.schema.hasTable(tableName)) && await db.schema.createTable(tableName, (table) => {
    table.increments('key_id').primary()
    table.string('hash').unique().notNullable()
    table.string('first_upload_file_name')
    table.string('belong_to_chat_id')
    table.integer('uploaded_at').notNullable()
    table.string('mime').notNullable()
    table.integer('last_used_time')
})

export default class FileManager {
    static async queryFileByHash(hash: string) {
        return await db<IServerFile>(tableName).where('hash', hash).first()
    }

    static async queryFilesByChatId(chatId: string): Promise<IServerFile[]> {
        return await db<IServerFile>(tableName)
            .where('belong_to_chat_id', chatId)
            .select('*')
    }

    static async updateLastUsedTime(hash: string) {
        await db<IServerFile>(tableName).update({ last_used_time: Date.now() }).where('hash', hash)
    }

    static async uploadFile(hash: string, fileName: string, filePath: string, chatId?: string): Promise<IServerFile> {
        const mFile = await this.queryFileByHash(hash)
        if (mFile) {
            return mFile
        }

        const mime = (await fileTypeFromFile(filePath))?.mime || 'application/octet-stream'

        const folder = node_path.join(
            base_data_path,
            'uploaded_files',
            hash.substring(0, 1),
            hash.substring(2, 3),
            hash.substring(3, 4)
        )
        fs.mkdirSync(folder, { recursive: true })
        fs.createReadStream(filePath).pipe(fs.createWriteStream(node_path.join(folder, hash)))

        await db(tableName).insert({
            hash: hash,
            first_upload_file_name: fileName,
            belong_to_chat_id: chatId || null,
            uploaded_at: Date.now(),
            mime,
        })

        return (await this.queryFileByHash(hash))!
    }

    static getFilePath(hash: string) {
        return node_path.join(
            base_data_path,
            'uploaded_files',
            hash.substring(0, 1),
            hash.substring(2, 3),
            hash.substring(3, 4),
            hash
        )
    }

    static async deleteFile(hash: string): Promise<void> {
        const file = await this.queryFileByHash(hash)
        if (!file) return

        const filePath = this.getFilePath(file.hash)
        try {
            fs.unlinkSync(filePath)
            await db(tableName).where('hash', hash).del()
        } catch (err) {
            console.log(err)
        }
    }
}
