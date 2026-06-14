import sodium from "libsodium-wrappers-sumo"

await sodium.ready

function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Uint8Array {
    // PRK = HMAC-SHA256(salt, ikm)
    return sodium.crypto_auth_hmacsha256(ikm, salt)
}

function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Uint8Array {
    let okm = new Uint8Array(0)
    let previous = new Uint8Array(0)
    let blockIndex = 1
    while (okm.length < length) {
        const input = new Uint8Array(previous.length + info.length + 1)
        input.set(previous, 0)
        input.set(info, previous.length)
        input[input.length - 1] = blockIndex
        const block = sodium.crypto_auth_hmacsha256(input, prk)
        okm = new Uint8Array([...okm, ...block])
        previous = block
        blockIndex++
        if (blockIndex > 255) throw new Error('HKDF expand too long')
    }
    return okm.slice(0, length)
}

function hkdf(ikm: Uint8Array, salt: Uint8Array, info: Uint8Array, length: number): Uint8Array {
    const prk = hkdfExtract(salt, ikm);
    return hkdfExpand(prk, info, length);
}

export function randomSha256Salt() {
    return sodium.randombytes_buf(sodium.crypto_auth_hmacsha256_KEYBYTES)
}

export default class SecureKey {
    /**
     * 客户端 / 服务端生成临时密钥对
     * 后续交换各自的长期密钥, 验证后计算共同的会话临时对称密钥
     */
    static All_generateExchangeKeyPair() {
        return sodium.crypto_kx_keypair()
    }
    static Client_getSessionKeyPair(public_key: Uint8Array, private_key: Uint8Array, server_public_key: Uint8Array) {
        return sodium.crypto_kx_client_session_keys(public_key, private_key, server_public_key)
    }
    static Server_getSessionKeyPair(public_key: Uint8Array, private_key: Uint8Array, client_public_key: Uint8Array) {
        return sodium.crypto_kx_server_session_keys(public_key, private_key, client_public_key)
    }
    static Server_generateLongTermKeyPair() {
        return sodium.crypto_sign_keypair()
    }
    static Server_signCheckMessage(server_public_key: Uint8Array, client_public_key: Uint8Array, server_long_term_private_key: Uint8Array) {
        const message = Uint8Array.from([
            ...server_public_key,
            ...client_public_key,
        ])
        return sodium.crypto_sign_detached(message, server_long_term_private_key)
    }
    static Client_checkSignedMessage(signed_message: Uint8Array, server_public_key: Uint8Array, client_public_key: Uint8Array, server_long_term_public_key: Uint8Array) {
        const message = Uint8Array.from([
            ...server_public_key,
            ...client_public_key,
        ])
        return sodium.crypto_sign_verify_detached(signed_message, message, server_long_term_public_key)
    }
    /**
     * 计算共享秘密, 以派生密钥, 等同于 crypto.diffieHellman
     */
    static All_getSharedSecret(opposite_public_key: Uint8Array, private_key: Uint8Array) {
        return sodium.crypto_scalarmult(private_key, opposite_public_key)
    }
    /**
     * 根据共享秘密派生双向密钥
     */
    static Client_hkdf(shared_secret: Uint8Array, salt: Uint8Array) {
        return {
            keyRecv: hkdf(shared_secret, salt, sodium.from_string("server-to-client"), 32),
            keySend: hkdf(shared_secret, salt, sodium.from_string("client-to-server"), 32),
        }
    }
    /**
     * 根据共享秘密派生双向密钥
     */
    static Server_hkdf(shared_secret: Uint8Array, salt: Uint8Array) {
        return {
            keyRecv: hkdf(shared_secret, salt, sodium.from_string("client-to-server"), 32),
            keySend: hkdf(shared_secret, salt, sodium.from_string("server-to-client"), 32),
        }
    }
}