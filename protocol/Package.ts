import { randomBytes } from '@noble/hashes/utils.js'
import { gcm } from '@noble/ciphers/aes.js'
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
    METHOD_ID: number = -999
    FLAGS: number = -1
    LENGTH: number = -1

    /**
     * 一般规定, 发出端设定好请求 ID 后, 接收端以同样的请求 ID 响应数据, 发出端对比以接收响应
     */
    REQUEST_ID: Uint8Array = new Uint8Array()

    SEQ_AFTER_DECRYPTION: number = -999

    data: Uint8Array = new Uint8Array()

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
        mPackage.REQUEST_ID = randomBytes(6)
        mPackage.data = buffer
        return mPackage
    }

    getSeqIfEncrypted() {
        return lingcat.classes.EncryptedMessage.decode(this.data).seq
    }

    decryptData(seq: number, key: Uint8Array): Uint8Array {
        const msg = lingcat.classes.EncryptedMessage.decode(this.data)
        if (msg.seq <= seq) {
            throw new Error(`数据包请求 seq 不符合要求, 需要 ${seq}, 数据包提供了 ${msg.seq}`)
        }

        const cipher = gcm(key, msg.iv, msg.aad)
        const message = new Uint8Array(msg.data.length + msg.tag.length)
        message.set(msg.data)
        message.set(msg.tag, msg.data.length)

        try {
            const plaintext = cipher.decrypt(message)
            return plaintext;
        } catch (e) {
            throw new Error('GCM 解密失败或 tag 无效')
        }
    }

    encryptData(seq: number, key: Uint8Array): Uint8Array {
        const iv = randomBytes(12)
        const aad = Buffer.alloc(4)
        aad.writeUInt32BE(seq)

        const decipher = gcm(key, iv, aad)
        const message = decipher.encrypt(this.data)
        const tag = message.slice(-16)
        const ciphertext = message.slice(0, -16)

        const msg = lingcat.classes.EncryptedMessage.encode({
            seq,
            iv,
            data: ciphertext,
            tag,
            aad,
        }).finish()
        return msg
    }

    encrypt(seq: number, key: ArrayBuffer) {
        const mPackage = new Package()
        mPackage.METHOD_ID = this.METHOD_ID
        mPackage.FLAGS = this.FLAGS | Package.FLAG_ENCRYPTED
        mPackage.data = this.encryptData(seq, Buffer.from(key))
        mPackage.LENGTH = mPackage.data.length
        mPackage.REQUEST_ID = this.REQUEST_ID
        return mPackage
    }

    decrypt(seq: number, key: ArrayBuffer) {
        const mPackage = new Package()
        mPackage.METHOD_ID = this.METHOD_ID
        mPackage.SEQ_AFTER_DECRYPTION = this.getSeqIfEncrypted()
        mPackage.FLAGS = this.FLAGS & Package.FLAG_ENCRYPTED
        mPackage.data = this.decryptData(seq, Buffer.from(key))
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