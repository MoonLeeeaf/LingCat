import { lingcat } from './lingcat-proto.js'
import sodium from 'libsodium-wrappers-sumo'

await sodium.ready

const AEAD_TAG_BYTES = 16

interface IPackageInput {
    method_id: number
    data: Uint8Array
    flags?: number
    request_id?: Uint8Array
    seq?: number
    iv?: Uint8Array
    aad?: Uint8Array
    tag?: Uint8Array
    origin_server?: string
    signature?: Uint8Array
    protocol_version?: number
}

export default class Package {
    static FLAG_ENCRYPTED = 1 << 0
    static FLAG_RESERVED = 1 << 1
    static PROTOCOL_VERSION = 2

    method_id = -1
    length = -1
    flags = 0
    request_id = new Uint8Array()
    data = new Uint8Array()
    seq = -1
    isDecrypted = false
    isEncrypted = false

    iv?: Uint8Array
    aad?: Uint8Array
    tag?: Uint8Array
    origin_server?: string
    signature?: Uint8Array
    protocol_version?: number

    /**
     * 将 Package 属性编码为 Package 实例
     * - 如果未提供 request_id，则自动生成 6 字节随机值
     * - 如果未提供 flags，则默认为 0
     * - 如果未提供 protocol_version，则默认使用 2
     */
    static encode(payload: IPackageInput): Package {
        const request_id = (payload.request_id && payload.request_id.length > 0)
            ? payload.request_id
            : (() => {
                const id = new Uint8Array(6)
                crypto.getRandomValues(id)
                return id
            })()

        const pkg = new Package()
        pkg.method_id = payload.method_id
        pkg.length = payload.data?.length ?? 0
        pkg.flags = payload.flags ?? 0
        pkg.request_id = request_id
        pkg.data = payload.data ?? new Uint8Array()
        pkg.seq = payload.seq ?? -1
        pkg.isEncrypted = !!(pkg.flags & Package.FLAG_ENCRYPTED)
        pkg.isDecrypted = !pkg.isEncrypted
        pkg.iv = payload.iv
        pkg.aad = payload.aad
        pkg.tag = payload.tag
        pkg.origin_server = payload.origin_server
        pkg.signature = payload.signature
        pkg.protocol_version = payload.protocol_version ?? Package.PROTOCOL_VERSION
        return pkg
    }

    /**
     * 从二进制解码为 Package 实例
     */
    static decode(mPackage: Uint8Array, secret?: Uint8Array, seq?: number) {
        const props = lingcat.classes.Package.decode(mPackage)
        const pkg = Package.encode({
            method_id: props.methodId,
            data: props.data ?? new Uint8Array(),
            flags: props.flags,
            request_id: props.requestId,
            seq: props.seq,
            iv: props.iv,
            aad: props.aad,
            tag: props.tag,

            origin_server: props.originServer!,
            signature: props.signature!,
            protocol_version: props.protocolVersion!,
        })

        if ((pkg.flags & Package.FLAG_ENCRYPTED) && secret != null) {
            pkg.decrypt(seq ?? -1, secret)
        }

        return pkg
    }

    /**
     * 将当前实例编码为二进制
     */
    toBuffer(): Uint8Array {
        return lingcat.classes.Package.encode({
            methodId: this.method_id,
            flags: this.flags,
            requestId: this.request_id,
            seq: this.seq,
            data: this.data,
            iv: this.iv,
            aad: this.aad,
            tag: this.tag,
            originServer: this.origin_server,
            signature: this.signature,
            protocolVersion: this.protocol_version,
        }).finish()
    }

    /**
     * 加密 Package
     * @param seq      发送序列号（同时作为 AAD）
     * @param secret   对称密钥（32 字节）
     */
    encrypt(seq: number, secret: Uint8Array): Package {
        if (this.flags & Package.FLAG_ENCRYPTED) {
            throw new Error('Package is already encrypted')
        }

        const iv = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES)
        const aad = new Uint8Array(4)
        new DataView(aad.buffer).setUint32(0, seq, false)

        const ciphertextWithTag = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
            this.data, aad, null, iv, secret
        )

        this.data = ciphertextWithTag.slice(0, ciphertextWithTag.length - AEAD_TAG_BYTES)
        this.tag = ciphertextWithTag.slice(ciphertextWithTag.length - AEAD_TAG_BYTES)
        this.iv = iv
        this.aad = aad
        this.seq = seq
        this.length = this.data.length
        this.flags |= Package.FLAG_ENCRYPTED
        this.isEncrypted = true
        this.isDecrypted = false

        return this
    }

    /**
     * 解密 Package
     * @param seq      接收方上次的最大 seq（用于防重放）
     * @param secret   对称密钥（32 字节）
     */
    decrypt(seq: number, secret: Uint8Array): Package {
        if (!(this.flags & Package.FLAG_ENCRYPTED)) {
            throw new Error('Package is not encrypted')
        }
        if (!this.iv || !this.aad || !this.tag) {
            throw new Error('Missing encryption parameters (iv / aad / tag)')
        }
        if (this.seq !== -1 && this.seq <= seq) {
            throw new Error(`数据包请求 seq 不符合要求, 需要 ${seq}, 数据包提供了 ${this.seq}`)
        }

        const ciphertextWithTag = new Uint8Array(this.data.length + AEAD_TAG_BYTES)
        ciphertextWithTag.set(this.data, 0)
        ciphertextWithTag.set(this.tag, this.data.length)

        this.data = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
            null, ciphertextWithTag, this.aad, this.iv, secret
        )
        this.length = this.data.length
        this.flags &= ~Package.FLAG_ENCRYPTED
        this.isDecrypted = true
        this.iv = undefined
        this.aad = undefined
        this.tag = undefined

        return this
    }
}