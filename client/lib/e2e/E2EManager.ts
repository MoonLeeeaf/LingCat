import sodium from 'libsodium-wrappers-sumo'
import type { E2EPayload, EncryptedPrivateKeyBundle } from './types.ts'
import { IMessageEntity } from 'lingcat-protocol'

// 顶层 await 保证模块加载时 libsodium 已经就绪
await sodium.ready

export default class E2EKeyManager {
    /**
     * 1. 生成长期身份密钥对
     */
    static generateIdentityKeyPair() {
        const keypair = sodium.crypto_kx_keypair()
        const res = {
            publicKey: sodium.to_base64(keypair.publicKey),
            privateKey: sodium.to_base64(keypair.privateKey)
        }
        // 清理底层原始字节
        sodium.memzero(keypair.privateKey)
        return res
    }

    /**
     * 2. 用密码加密私钥 (生成给服务端存的包)
     */
    static encryptPrivateKey(
        privateKeyB64: string,
        password: string,
    ): {
        encrypted: string,
        salt: string,
        nonce: string,
        kdfParams: { m: number, t: number, p: number }
    } {
        const salt = sodium.randombytes_buf(16)
        const kdfParams = { m: 64 * 1024, t: 3, p: 1 }

        // 2. 派生 KEK (Argon2id)
        const key = sodium.crypto_pwhash(
            32,
            password,
            salt,
            kdfParams.t,
            kdfParams.m * 1024,
            sodium.crypto_pwhash_ALG_ARGON2ID13
        )

        // 3. XChaCha20-Poly1305 加密
        const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES)
        const privKeyBuf = sodium.from_base64(privateKeyB64)
        
        const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
            privKeyBuf, null, null, nonce, key
        )

        // 清理敏感内存
        sodium.memzero(key)
        sodium.memzero(privKeyBuf)

        return {
            encrypted: sodium.to_base64(ciphertext),
            salt: sodium.to_base64(salt),
            nonce: sodium.to_base64(nonce),
            kdfParams
        }
    }

    /**
     * 3. 用密码解密私钥 (登录时用)
     */
    static decryptPrivateKey(bundle: EncryptedPrivateKeyBundle, password: string): string {
        const salt = sodium.from_base64(bundle.salt)
        const key = sodium.crypto_pwhash(
            32,
            password,
            salt,
            bundle.kdfParams.t,
            bundle.kdfParams.m * 1024,
            sodium.crypto_pwhash_ALG_ARGON2ID13
        )

        const nonce = sodium.from_base64(bundle.nonce)
        const ciphertext = sodium.from_base64(bundle.encryptedPrivateKey)

        try {
            const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
                null, ciphertext, null, nonce, key
            )
            sodium.memzero(key)
            
            const b64 = sodium.to_base64(decrypted)
            sodium.memzero(decrypted) // 清理解密后的私钥明文缓冲
            return b64
        } catch (e) {
            sodium.memzero(key)
            throw new Error('密码错误或数据损坏')
        }
    }

    /**
     * 4. 计算共享密钥并加解密消息
     */
    static deriveSharedKey(myPrivateKeyB64: string, peerPublicKeyB64: string): Uint8Array {
        const myPriv = sodium.from_base64(myPrivateKeyB64)
        const peerPub = sodium.from_base64(peerPublicKeyB64)

        const shared = sodium.crypto_scalarmult(myPriv, peerPub)
        // 使用 BLAKE2b 作为 KDF 派生最终对称密钥
        const key = sodium.crypto_generichash(32, shared, null)

        sodium.memzero(myPriv)
        sodium.memzero(shared)
        return key
    }

    static encryptMessage(text: string, sharedKey: Uint8Array) {
        const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES)
        const textBytes = sodium.from_string(text)
        
        const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
            textBytes, null, null, nonce, sharedKey
        )
        sodium.memzero(textBytes) // 清理明文缓冲

        return {
            nonce: sodium.to_base64(nonce),
            ciphertext: sodium.to_base64(ciphertext)
        }
    }

    static decryptMessage(payload: E2EPayload, sharedKey: Uint8Array): string {
        const nonce = sodium.from_base64(payload.nonce)
        const ciphertext = sodium.from_base64(payload.ciphertext)
        try {
            const decrypted = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
                null, ciphertext, null, nonce, sharedKey
            )
            const text = sodium.to_string(decrypted)
            sodium.memzero(decrypted) // 清理明文缓冲
            return text
        } catch {
            throw new Error('消息解密失败，可能密钥不匹配或消息被篡改')
        }
    }

    /**
     * 将明文数据和加密信息打包成 IMessageEntity
     */
    static buildE2EEntity(payload: E2EPayload): IMessageEntity {
        return {
            type: 'e2e',
            offset: 0,
            length: 1,
            data: JSON.stringify(payload)
        }
    }

    /**
     * 从 IMessageEntity 中解析出 E2EPayload
     */
    static parseE2EEntity(entity: IMessageEntity): E2EPayload | null {
        if (entity.type !== 'e2e' || !entity.data) return null
        try {
            return JSON.parse(entity.data) as E2EPayload
        } catch {
            return null
        }
    }

    /**
     * 生成 60 位安全码
     */
    static getSafetyNumber(pubA: string, pubB: string): string {
        const keys = [pubA, pubB].sort()
        const data = "lingcat-e2e-v1:" + keys[0] + keys[1]
        const hash = sodium.crypto_generichash(30, sodium.from_string(data), null)
        let result = []
        for (let i = 0; i < 30; i += 5) {
            const num = ((hash[i] << 24) | (hash[i+1] << 16) | (hash[i+2] << 8) | hash[i+3]) >>> 0
            result.push((num % 100000).toString().padStart(5, '0'))
        }
        return result.join(' ')
    }

    /** 生成恢复码 (24个单词) */
    static generateRecoveryCode(): string {
        const words = ["apple", "banana", "cat", "dog", "egg", "fish", "grape", "hat", "ice", "juice", "key", "lion", "moon", "nest", "orange", "pig", "queen", "rabbit", "sun", "tree", "umbrella", "van", "water", "xray", "yellow", "zoo", "pear", "bird", "rock", "star", "lamp", "book", "door", "window", "car", "bus", "train", "plane", "ship", "boat", "milk", "tea", "rice", "bread", "meat", "salt", "sugar", "fire", "rain", "snow"]
        const res = []
        for(let i = 0; i < 24; i++) {
            const idx = sodium.randombytes_uniform(words.length)
            res.push(words[idx])
        }
        return res.join(' ')
    }
}