import { lingcat as LingCatProto } from './lingcat-proto.js'
import sodium from 'libsodium-wrappers'

await sodium.ready

export default class Package {
    /** 
     * 请求方法
     * 二字节
     */
    method_id = -1
    /** 
     * 数据包长度
     * 四字节
     */
    length = -1
    /** 
     * 标志位
     * 二字节
     */
    flags = 0
    /** 
     * 请求 ID
     * 六字节
     */
    request_id = new Uint8Array()
    /** 
     * 数据
     * 变长
     */
    data = new Uint8Array()
    /**
     * 序列号
     * 仅加密消息可用
     */
    seq = -1
    isDecrypted = false

    static FLAG_ENCRYPTED = 2 ^ 0
    static FLAG_RESERVED = 2 ^ 1

    /**
     * 从二进制数据解包
     * 根据标志位自动进行解密
     */
    static decode(data: Uint8Array, secret?: Uint8Array, seq?: number) {
        const mPackage = new Package()
        const dv = new DataView(data.buffer, data.byteOffset, data.byteLength)
        let offset = 0
        mPackage.method_id = dv.getInt16(offset, false); offset += 2
        mPackage.length = dv.getInt32(offset, false); offset += 4
        mPackage.flags = dv.getInt16(offset, false); offset += 2
        mPackage.request_id = data.subarray(offset, offset + 6); offset += 6
        mPackage.data = data.subarray(offset, offset + mPackage.length)

        if (mPackage.flags & this.FLAG_ENCRYPTED) {
            if (secret == null) throw new Error("加密的数据包, 但未传递解密密钥!")

            mPackage.decrypt(seq!, secret)
        }

        return mPackage
    }

    encrypt(seq: number, secret: Uint8Array) {
        // public_nonce
        const iv = sodium.randombytes_buf(sodium.crypto_aead_aegis256_NPUBBYTES)

        const aad = new Uint8Array(4)
        new DataView(aad.buffer).setUint32(0, seq, false)

        this.data = LingCatProto.classes.EncryptedMessage.encode({
            seq,
            iv,
            aad,
            data: sodium.crypto_aead_aegis256_encrypt(this.data, aad, null, iv, secret)
        }).finish()
        this.length = this.data.length
        this.flags |= Package.FLAG_ENCRYPTED
        this.seq = seq

        this.isDecrypted = false

        return this
    }

    decrypt(seq: number, secret: Uint8Array) {
        const message = LingCatProto.classes.EncryptedMessage.decode(this.data)
        this.data = sodium.crypto_aead_aegis256_decrypt(null, message.data, message.aad, message.iv, secret)
        this.length = this.data.length
        this.isDecrypted = true
        this.flags &= ~Package.FLAG_ENCRYPTED
        this.seq = message.seq

        if (message.seq <= seq) throw new Error('数据包请求 seq 不符合要求, 需要 ' + seq + ', 数据包提供了 ' + message.seq)

        return this
    }

    static encode({
        method_id,
        flags,
        data,
    }: {
        method_id: number
        flags: number
        data: Uint8Array
    }) {
        const mPackage = new Package()
        const request_id = new Uint8Array(6)
        crypto.getRandomValues(request_id)
        mPackage.method_id = method_id
        mPackage.length = data.byteLength
        mPackage.flags = flags
        mPackage.request_id = request_id
        mPackage.data = data
        return mPackage
    }

    toBuffer() {
        const buffer = new Uint8Array(0 + 2 + 4 + 2 + 6 + this.data.byteLength)
        const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
        let offset = 0
        dv.setInt16(offset, this.method_id, false); offset += 2
        dv.setInt32(offset, this.length, false); offset += 4
        dv.setInt16(offset, this.flags, false); offset += 2
        buffer.set(this.request_id, offset); offset += 6
        buffer.set(this.data, offset)
        return buffer
    }

}