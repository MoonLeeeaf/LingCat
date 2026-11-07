import knex from "knex"
import { base_data_path } from "../config.ts"
import { IFile } from "../../protocol/classes-interfaces.ts"
import node_path from 'node:path'
import fs from 'node:fs'
import { db } from "./db.ts"
import crypto from 'node:crypto'
import { finished } from 'node:stream/promises'

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

    static async uploadFile(hash: string, fileName: string, filePath: string, mime: string, chatId?: string): Promise<IServerFile> {
        const mFile = await this.queryFileByHash(hash)
        if (mFile) {
            // 如果数据库有记录，且临时文件和最终文件不同，就把临时文件删掉
            if (filePath !== this.getFilePath(hash) && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath)
            }
            return mFile
        }

        const folder = node_path.join(base_data_path, 'uploaded_files', hash.substring(0, 1), hash.substring(2, 3), hash.substring(3, 4))
        fs.mkdirSync(folder, { recursive: true })
        const finalPath = node_path.join(folder, hash)

        // ★ 核心修复：只有源文件和目标文件不同时，才进行拷贝
        if (filePath !== finalPath) {
            const copyStream = fs.createReadStream(filePath).pipe(fs.createWriteStream(finalPath))
            await finished(copyStream)
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath) // 拷贝完删掉临时文件
        }

        await db(tableName).insert({
            hash, first_upload_file_name: fileName, belong_to_chat_id: chatId || null, uploaded_at: Date.now(), mime,
        })

        return (await this.queryFileByHash(hash))!
    }

    // ★ 新增：用于分块上传完成时的落盘
    static async finalizeUploadFromTemp(tempPath: string, expectedHash?: string): Promise<string> {
        const folder = node_path.join(base_data_path, 'uploaded_files', 'temp')
        fs.mkdirSync(folder, { recursive: true })
        
        const realHash = await new Promise<string>((resolve, reject) => {
            const hasher = crypto.createHash('sha256')
            const stream = fs.createReadStream(tempPath)
            
            stream.on('data', (chunk) => hasher.update(chunk))
            stream.on('end', () => resolve(hasher.digest('hex')))
            stream.on('error', (err) => reject(err))
        })

        if (expectedHash && expectedHash !== realHash) {
            throw new Error(`Hash mismatch. Expected: ${expectedHash}, Got: ${realHash}`)
        }

        const finalPath = this.getFilePath(realHash)

        // 如果已经存在，直接删除临时文件
        if (fs.existsSync(finalPath)) {
            fs.unlinkSync(tempPath)
            return realHash
        }

        // 2. 移动到最终目录
        const finalFolder = node_path.dirname(finalPath)
        fs.mkdirSync(finalFolder, { recursive: true })
        
        try {
            fs.renameSync(tempPath, finalPath)
        } catch (e) {
            // 跨磁盘分区回退
            fs.createReadStream(tempPath).pipe(fs.createWriteStream(finalPath))
            fs.unlinkSync(tempPath)
        }

        return realHash
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
