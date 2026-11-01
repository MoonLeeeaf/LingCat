package io.github.moonleeeaf.lingcat.e2e

import android.util.Base64
import android.util.Log
import com.goterl.lazysodium.LazySodiumAndroid
import com.goterl.lazysodium.Sodium
import com.sun.jna.NativeLong
import org.json.JSONObject
import java.nio.charset.StandardCharsets

object E2EManager {
    private const val TAG = "E2EDBG"

    // 使用你项目中保留的 Lazysodium 实例（如果改过名，请调整这里）
    private val lazySodium: LazySodiumAndroid = lingcat.protocol.LazySodiumStore.getLazySodium()
    private val sodium: Sodium = lazySodium.sodium

    private const val PUBLIC_KEY_BYTES = 32
    private const val SECRET_KEY_BYTES = 32
    private const val SCALARMULT_BYTES = 32
    private const val NPUB_BYTES = 24
    private const val ABYTES = 16
    private const val ARGON2ID13 = 2
    private const val SALT_BYTES = 16

    data class IdentityKeyPair(val publicKey: String, val privateKey: String)
    data class EncryptedPrivateKey(val encrypted: String, val salt: String, val nonce: String, val kdfParams: String)
    data class EncryptedMessage(val nonce: String, val ciphertext: String)

    /**
     * 生成 X25519 身份密钥对
     */
    fun generateIdentityKeyPair(): IdentityKeyPair {
        val pubBytes = ByteArray(PUBLIC_KEY_BYTES)
        val privBytes = ByteArray(SECRET_KEY_BYTES)
        if (sodium.crypto_kx_keypair(pubBytes, privBytes) != 0) {
            throw RuntimeException("生成密钥对失败")
        }
        val pub = Base64.encodeToString(pubBytes, Base64.NO_WRAP)
        val priv = Base64.encodeToString(privBytes, Base64.NO_WRAP)
        privBytes.fill(0)
        return IdentityKeyPair(pub, priv)
    }

    /**
     * 用密码加密私钥 (Argon2id + XChaCha20)
     */
    fun encryptPrivateKey(privateKeyB64: String, password: String): EncryptedPrivateKey {
        val privKeyBytes = tolerantB64Decode(privateKeyB64, "privKey")
        val pwdBytes = password.toByteArray(StandardCharsets.UTF_8)

        val salt = ByteArray(SALT_BYTES)
        sodium.randombytes_buf(salt, salt.size)

        val key = ByteArray(32)
        // Web端参数: m=64MB, t=3
        if (sodium.crypto_pwhash(key, key.size.toLong(), pwdBytes,
                pwdBytes.size.toLong(), salt, 3L, NativeLong(64L * 1024L * 1024L), ARGON2ID13) != 0) {
            throw RuntimeException("Argon2id 派生失败")
        }

        val nonce = ByteArray(NPUB_BYTES)
        sodium.randombytes_buf(nonce, nonce.size)

        val ciphertext = ByteArray(privKeyBytes.size + ABYTES)
        val cipherLen = LongArray(1)

        if (sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(ciphertext, cipherLen, privKeyBytes,
                privKeyBytes.size.toLong(), null, 0, null, nonce, key) != 0) {
            throw RuntimeException("XChaCha20 加密失败")
        }

        val kdfJson = "{\"m\":65536,\"t\":3,\"p\":1}"
        val enc = EncryptedPrivateKey(
            Base64.encodeToString(ciphertext, Base64.NO_WRAP),
            Base64.encodeToString(salt, Base64.NO_WRAP),
            Base64.encodeToString(nonce, Base64.NO_WRAP),
            kdfJson
        )
        key.fill(0)
        privKeyBytes.fill(0)
        return enc
    }

    /**
     * 用密码解密私钥
     */
    fun decryptPrivateKey(encryptedB64: String, saltB64: String, nonceB64: String, kdfJson: String, password: String): String {
        val kdf = JSONObject(kdfJson)
        val memlimit = NativeLong(kdf.optInt("m", 65536).toLong() * 1024L)
        val opslimit = kdf.optLong("t", 3L)

        val salt = tolerantB64Decode(saltB64, "salt")
        val nonce = tolerantB64Decode(nonceB64, "nonce")
        val ciphertext = tolerantB64Decode(encryptedB64, "cipher")
        val pwdBytes = password.toByteArray(StandardCharsets.UTF_8)

        val key = ByteArray(32)
        if (sodium.crypto_pwhash(key, key.size.toLong(), pwdBytes,
                pwdBytes.size.toLong(), salt, opslimit, memlimit, ARGON2ID13) != 0) {
            throw RuntimeException("派生失败")
        }

        val decrypted = ByteArray(ciphertext.size - ABYTES)
        val decLen = LongArray(1)
        val res = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(decrypted, decLen, null, ciphertext,
            ciphertext.size.toLong(), null, 0, nonce, key)

        key.fill(0)
        if (res != 0) throw Exception("密码错误")
        return Base64.encodeToString(decrypted, Base64.NO_WRAP)
    }

    /**
     * 生成 60 位安全码
     */
    fun getSafetyNumber(pubA: String, pubB: String): String {
        val keys = listOf(pubA, pubB).sorted()
        val data = "lingcat-e2e-v1:${keys[0]}${keys[1]}"
        val dataBytes = data.toByteArray(StandardCharsets.UTF_8)

        val hash = ByteArray(30)
        sodium.crypto_generichash(hash, hash.size, dataBytes, dataBytes.size.toLong(), null, 0)

        val sb = StringBuilder()
        var i = 0
        while (i < 30) {
            val num = ((hash[i].toLong() and 0xFF) shl 24) or
                    ((hash[i + 1].toLong() and 0xFF) shl 16) or
                    ((hash[i + 2].toLong() and 0xFF) shl 8) or
                    (hash[i + 3].toLong() and 0xFF)
            val part = num % 100000
            if (i > 0) sb.append(" ")
            sb.append(String.format("%05d", part))
            i += 5
        }
        return sb.toString()
    }

    fun deriveSharedKey(myPrivateKeyB64: String, peerPublicKeyB64: String): ByteArray {
        val myPriv = tolerantB64Decode(myPrivateKeyB64, "myPrivateKey")
        val peerPub = tolerantB64Decode(peerPublicKeyB64, "peerPublicKey")

        // ★ 核心防御：如果长度不是 32，直接抛出人类能看懂的错误
        if (myPriv.size != 32 || peerPub.size != 32) {
            Log.e(TAG, "密钥长度不合法: myPriv=${myPriv.size}, peerPub=${peerPub.size}")
            throw IllegalArgumentException("密钥长度错误 (私钥:${myPriv.size}B, 公钥:${peerPub.size}B)")
        }

        // X25519 ECDH
        val shared = ByteArray(32)
        if (sodium.crypto_scalarmult(shared, myPriv, peerPub) != 0) {
            throw RuntimeException("ECDH 计算失败")
        }

        // BLAKE2b 派生最终对称密钥 (32 字节)
        val key = ByteArray(32)
        sodium.crypto_generichash(key, key.size, shared, shared.size.toLong(), null, 0)

        myPriv.fill(0)
        shared.fill(0)
        return key
    }

    fun encryptMessage(text: String, sharedKey: ByteArray): EncryptedMessage {
        val textBytes = text.toByteArray(StandardCharsets.UTF_8)
        val nonce = ByteArray(NPUB_BYTES)
        sodium.randombytes_buf(nonce, nonce.size)
        val ciphertext = ByteArray(textBytes.size + ABYTES)
        val cipherLen = LongArray(1)

        if (sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(ciphertext, cipherLen, textBytes,
                textBytes.size.toLong(), null, 0, null, nonce, sharedKey) != 0) {
            throw RuntimeException("消息加密失败")
        }
        return EncryptedMessage(
            Base64.encodeToString(nonce, Base64.NO_WRAP),
            Base64.encodeToString(ciphertext, Base64.NO_WRAP)
        )
    }

    fun decryptMessage(ciphertextB64: String, nonceB64: String, sharedKey: ByteArray): String {
        val nonce = tolerantB64Decode(nonceB64, "nonce")
        val ciphertext = tolerantB64Decode(ciphertextB64, "cipher")
        val decrypted = ByteArray(ciphertext.size - ABYTES)
        val decLen = LongArray(1)

        if (sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(decrypted, decLen, null, ciphertext,
                ciphertext.size.toLong(), null, 0, nonce, sharedKey) != 0) {
            throw Exception("消息解密失败")
        }
        return String(decrypted, StandardCharsets.UTF_8)
    }

    private fun tolerantB64Decode(str: String, fieldName: String): ByteArray {
        // 1. URL-Safe 转标准
        var norm = str.replace('-', '+').replace('_', '/').replace("\\s+".toRegex(), "")

        // 2. 长度校验与补齐
        when (norm.length % 4) {
            2 -> norm += "=="
            3 -> norm += "="
            1 -> {
                Log.e(TAG, "Base64 长度非法: $fieldName, len=${norm.length}")
                throw IllegalArgumentException("密钥格式损坏，无法解析")
            }
        }

        return try {
            // 使用 DEFAULT 能够自动忽略换行符
            Base64.decode(norm, Base64.DEFAULT)
        } catch (e: IllegalArgumentException) {
            Log.e(TAG, "b64 fail field=$fieldName len=${str.length}")
            throw e
        }
    }
}