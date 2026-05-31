import crypto from 'node:crypto'
import { lingcat } from './lingcat-proto.js'

function toBuffer(data: Buffer | ArrayBuffer | Buffer[] | Uint8Array) {
    let buffer: Buffer
    if (data instanceof Uint8Array)
        buffer = Buffer.from(data)
    else if (Array.isArray(data))
        buffer = Buffer.from(new Uint8Array(Buffer.concat(data)))
    else
        buffer = Buffer.from(new Uint8Array(data))
    return buffer
}

export default class Package {
    METHOD_ID: number
    FLAGS: number
    LENGTH: number

    /**
     * 一般规定, 发出端设定好请求 ID 后, 接收端以同样的请求 ID 响应数据, 发出端对比以接收响应
     */
    REQUEST_ID: Uint8Array

    SEQ_AFTER_DECRYPTION: number = -999

    data: Uint8Array

    static FLAG_ENCRYPTED = 1

    static fromBuffer(data: Buffer | ArrayBuffer | Buffer[] | Uint8Array) {
        const buffer = toBuffer(data)
        const mPackage = new Package()
        mPackage.METHOD_ID = buffer.readUInt16LE(0)
        mPackage.FLAGS = buffer.readUInt16LE(0 + 2)
        mPackage.LENGTH = buffer.readUInt32LE(0 + 2 + 2)
        mPackage.REQUEST_ID = buffer.subarray(0 + 2 + 2 + 4, 0 + 2 + 2 + 4 + 6)
        mPackage.data = buffer.subarray(0 + 2 + 2 + 4 + 6, 0 + 2 + 2 + 4 + 6 + mPackage.LENGTH)
        return mPackage
    }

    static fromObject({ method_id, flags, data }: {
        method_id: number,
        flags: number,
        data: Buffer | ArrayBuffer | Buffer[] | Uint8Array,
    }) {
        const buffer = toBuffer(data)
        const mPackage = new Package()
        mPackage.METHOD_ID = method_id
        mPackage.FLAGS = flags
        mPackage.LENGTH = buffer.length
        mPackage.REQUEST_ID = crypto.randomBytes(6)
        mPackage.data = buffer
        return mPackage
    }

    getSeqIfEncrypted() {
        return lingcat.classes.EncryptedMessage.decode(this.data).seq
    }

    decryptData(seq: number, key: ArrayBuffer) {
        const msg = lingcat.classes.EncryptedMessage.decode(this.data)
        // console.log('decrypt', key, msg)
        if (msg.seq <= seq) throw new Error('数据包请求 seq 不符合要求, 需要 ' + seq + ', 数据包提供了 ' + msg.seq)
        const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(key), msg.iv)
        decipher.setAuthTag(msg.tag)
        decipher.setAAD(msg.aad)
        return Buffer.concat([
            decipher.update(msg.data),
            decipher.final()
        ])
    }

    encryptData(seq: number, key: ArrayBuffer) {
        const iv = crypto.randomBytes(12)

        const aad = Buffer.alloc(4)
        aad.writeUInt32BE(seq)

        const decipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key), iv)
        decipher.setAAD(aad)
        const data = Buffer.concat([
            decipher.update(this.data),
            decipher.final()
        ])
        const tag = decipher.getAuthTag()
        const msg = lingcat.classes.EncryptedMessage.encode({
            seq,
            iv,
            data,
            tag,
            aad,
        }).finish()
        // console.log('encrypt', key, lingcat.classes.EncryptedMessage.decode(msg))
        return msg
    }

    encrypt(seq: number, key: ArrayBuffer) {
        const mPackage = new Package()
        mPackage.METHOD_ID = this.METHOD_ID
        mPackage.FLAGS = this.FLAGS | Package.FLAG_ENCRYPTED
        mPackage.data = this.encryptData(seq, key)
        mPackage.LENGTH = mPackage.data.length
        mPackage.REQUEST_ID = this.REQUEST_ID
        return mPackage
    }

    decrypt(seq: number, key: ArrayBuffer) {
        const mPackage = new Package()
        mPackage.METHOD_ID = this.METHOD_ID
        mPackage.SEQ_AFTER_DECRYPTION = this.getSeqIfEncrypted()
        mPackage.FLAGS = this.FLAGS & Package.FLAG_ENCRYPTED
        mPackage.data = this.decryptData(seq, key)
        mPackage.LENGTH = mPackage.data.length
        mPackage.REQUEST_ID = this.REQUEST_ID
        return mPackage
    }

    toBuffer() {
        const buffer = Buffer.allocUnsafe(2 + 2 + 2 + 4 + 6 + this.data.length)
        buffer.writeUInt16LE(this.METHOD_ID, 0)
        buffer.writeUInt16LE(this.FLAGS, 0 + 2)
        buffer.writeUInt32LE(this.data.length, 0 + 2 + 2)
        buffer.set(this.REQUEST_ID, 0 + 2 + 2 + 4)
        buffer.set(this.data, 0 + 2 + 2 + 4 + 6)
        return buffer
    }
}
