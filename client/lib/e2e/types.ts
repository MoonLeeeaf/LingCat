// 服务端发回来的加密私钥包
export interface EncryptedPrivateKeyBundle {
    publicKey: string           // Base64，明文
    encryptedPrivateKey: string // Base64，密文
    salt: string                // Base64，Argon2id 用的盐
    nonce: string               // Base64，加密私钥用的 AEAD nonce
    kdfParams: {
        m: number               // 内存大小 (KB)
        t: number               // 迭代次数
        p: number               // 并行度
    }
    keyVersion: number
}

// 消息密文结构 (塞在 Entity data 里的 JSON)
export interface E2EPayload {
    v: number                   // 协议版本，固定写 1
    keyVersion: number          // 密钥版本
    senderPub: string           // Base64，发送方公钥
    receiverPub: string           // Base64
    nonce: string               // Base64
    ciphertext: string          // Base64
}