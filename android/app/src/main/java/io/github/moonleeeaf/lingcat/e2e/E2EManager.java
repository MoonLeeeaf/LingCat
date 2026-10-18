package io.github.moonleeeaf.lingcat.e2e;

import android.util.Base64;

import com.goterl.lazysodium.LazySodiumAndroid;
import com.goterl.lazysodium.Sodium;
import com.sun.jna.NativeLong;

import org.json.JSONObject;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import lingcat.classes.Classes.IMessageEntity;
import lingcat.protocol.LazySodiumStore;

/**
 * 纯密码学与 E2E 数据处理封装。
 */
public final class E2EManager {

    // 获取全局单例，并直接取底层的 Sodium 实例
    private static final LazySodiumAndroid lazySodium = LazySodiumStore.getLazySodium();
    private static final Sodium sodium = lazySodium.getSodium();

    // libsodium 常量（避免自己瞎猜）
    private static final int CRYPTO_KX_PUBLICKEYBYTES = 32;
    private static final int CRYPTO_KX_SECRETKEYBYTES = 32;
    private static final int CRYPTO_SCALARMULT_BYTES = 32;
    private static final int CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES = 24;
    private static final int CRYPTO_AEAD_XCHACHA20POLY1305_IETF_ABYTES = 16;
    private static final int CRYPTO_PWHASH_ALG_ARGON2ID13 = 2;
    private static final int CRYPTO_PWHASH_SALTBYTES = 16;

    private E2EManager() {}

    // ============================================================
    //                      数据结构定义
    // ============================================================

    public static class IdentityKeyPair {
        public final String publicKey;
        public final String privateKey;
        public IdentityKeyPair(String pub, String priv) {
            this.publicKey = pub;
            this.privateKey = priv;
        }
    }

    public static class EncryptedPrivateKey {
        public final String encrypted;
        public final String salt;
        public final String nonce;
        public final String kdfParams;
        public EncryptedPrivateKey(String encrypted, String salt, String nonce, String kdfParams) {
            this.encrypted = encrypted;
            this.salt = salt;
            this.nonce = nonce;
            this.kdfParams = kdfParams;
        }
    }

    public static class EncryptedMessage {
        public final String nonce;
        public final String ciphertext;
        public EncryptedMessage(String nonce, String ciphertext) {
            this.nonce = nonce;
            this.ciphertext = ciphertext;
        }
    }

    // ============================================================
    //                      核心密码学操作
    // ============================================================

    /**
     * 使用底层原生接口生成 X25519 密钥对
     */
    public static IdentityKeyPair generateIdentityKeyPair() {
        byte[] pubBytes = new byte[CRYPTO_KX_PUBLICKEYBYTES];
        byte[] privBytes = new byte[CRYPTO_KX_SECRETKEYBYTES];

        if (sodium.crypto_kx_keypair(pubBytes, privBytes) != 0) {
            throw new RuntimeException("生成密钥对失败");
        }

        String pubB64 = Base64.encodeToString(pubBytes, Base64.NO_WRAP);
        String privB64 = Base64.encodeToString(privBytes, Base64.NO_WRAP);

        Arrays.fill(privBytes, (byte) 0);
        return new IdentityKeyPair(pubB64, privBytes == null ? null : privB64);
    }

    /**
     * 用密码加密私钥 (Argon2id + XChaCha20)
     */
    public static EncryptedPrivateKey encryptPrivateKey(String privateKeyB64, String password) {
        byte[] privKeyBytes = Base64.decode(privateKeyB64, Base64.NO_WRAP);
        byte[] passwordBytes = password.getBytes(StandardCharsets.UTF_8);

        // 1. 生成 salt
        byte[] salt = new byte[CRYPTO_PWHASH_SALTBYTES];
        sodium.randombytes_buf(salt, salt.length);

        // 2. Argon2id 派生 KEK
        // Web 端参数: m=64*1024 KB (64MB), t=3
        long opslimit = 3L;
        NativeLong memlimit = new NativeLong(64L * 1024L * 1024L); // 注意 JNA 需要 NativeLong
        byte[] key = new byte[32]; // 32 bytes KEK

        int pwhashRes = sodium.crypto_pwhash(
                key, key.length,
                passwordBytes, passwordBytes.length,
                salt,
                opslimit, memlimit, CRYPTO_PWHASH_ALG_ARGON2ID13
        );
        if (pwhashRes != 0) throw new RuntimeException("Argon2id 派生失败");

        // 3. XChaCha20-Poly1305 加密
        byte[] nonce = new byte[CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES];
        sodium.randombytes_buf(nonce, nonce.length);

        byte[] ciphertext = new byte[privKeyBytes.length + CRYPTO_AEAD_XCHACHA20POLY1305_IETF_ABYTES];
        long[] cipherLen = new long[1];

        int encRes = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
                ciphertext, cipherLen,
                privKeyBytes, privKeyBytes.length,
                null, 0, // ad, adLen
                null, nonce, key
        );
        if (encRes != 0) throw new RuntimeException("XChaCha20 加密失败");

        Arrays.fill(key, (byte) 0);
        Arrays.fill(privKeyBytes, (byte) 0);
        Arrays.fill(passwordBytes, (byte) 0);

        String kdfParams = String.format("{\"m\":%d,\"t\":%d,\"p\":1}", 64 * 1024, 3);

        return new EncryptedPrivateKey(
                Base64.encodeToString(ciphertext, Base64.NO_WRAP),
                Base64.encodeToString(salt, Base64.NO_WRAP),
                Base64.encodeToString(nonce, Base64.NO_WRAP),
                kdfParams
        );
    }

    /**
     * 用密码解密私钥
     */
    public static String decryptPrivateKey(String encryptedB64, String saltB64, String nonceB64, String kdfParamsJson, String password) throws Exception {
        JSONObject kdf = new JSONObject(kdfParamsJson);
        int m = kdf.optInt("m", 64 * 1024);
        long memlimitLong = (long) m * 1024L;
        long opslimit = kdf.optLong("t", 3);

        byte[] salt = Base64.decode(saltB64, Base64.NO_WRAP);
        byte[] nonce = Base64.decode(nonceB64, Base64.NO_WRAP);
        byte[] ciphertext = Base64.decode(encryptedB64, Base64.NO_WRAP);
        byte[] passwordBytes = password.getBytes(StandardCharsets.UTF_8);

        byte[] key = new byte[32];
        int pwhashRes = sodium.crypto_pwhash(
                key, key.length,
                passwordBytes, passwordBytes.length,
                salt,
                opslimit, new NativeLong(memlimitLong), CRYPTO_PWHASH_ALG_ARGON2ID13
        );
        if (pwhashRes != 0) throw new RuntimeException("Argon2id 派生失败");

        byte[] decrypted = new byte[ciphertext.length - CRYPTO_AEAD_XCHACHA20POLY1305_IETF_ABYTES];
        long[] decryptedLen = new long[1];

        int decRes = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
                decrypted, decryptedLen,
                null, // nSec
                ciphertext, ciphertext.length,
                null, 0, // ad, adLen
                nonce, key
        );

        Arrays.fill(key, (byte) 0);
        Arrays.fill(passwordBytes, (byte) 0);

        if (decRes != 0) {
            Arrays.fill(decrypted, (byte) 0);
            throw new Exception("密码错误或数据损坏");
        }

        String result = Base64.encodeToString(decrypted, Base64.NO_WRAP);
        Arrays.fill(decrypted, (byte) 0);
        return result;
    }

    /**
     * 计算共享密钥
     */
    public static byte[] deriveSharedKey(String myPrivateKeyB64, String peerPublicKeyB64) {
        byte[] myPriv = Base64.decode(myPrivateKeyB64, Base64.NO_WRAP);
        byte[] peerPub = Base64.decode(peerPublicKeyB64, Base64.NO_WRAP);

        // X25519 ECDH
        byte[] shared = new byte[CRYPTO_SCALARMULT_BYTES];
        if (sodium.crypto_scalarmult(shared, myPriv, peerPub) != 0) {
            throw new RuntimeException("ECDH 计算失败");
        }

        // BLAKE2b 派生最终对称密钥 (32 字节)
        byte[] key = new byte[32];
        sodium.crypto_generichash(key, key.length, shared, shared.length, null, 0);

        Arrays.fill(myPriv, (byte) 0);
        Arrays.fill(shared, (byte) 0);
        return key;
    }

    /**
     * 加密消息
     */
    public static EncryptedMessage encryptMessage(String text, byte[] sharedKey) {
        byte[] textBytes = text.getBytes(StandardCharsets.UTF_8);
        byte[] nonce = new byte[CRYPTO_AEAD_XCHACHA20POLY1305_IETF_NPUBBYTES];
        sodium.randombytes_buf(nonce, nonce.length);

        byte[] ciphertext = new byte[textBytes.length + CRYPTO_AEAD_XCHACHA20POLY1305_IETF_ABYTES];
        long[] cipherLen = new long[1];

        int encRes = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
                ciphertext, cipherLen,
                textBytes, textBytes.length,
                null, 0,
                null, nonce, sharedKey
        );

        Arrays.fill(textBytes, (byte) 0);
        if (encRes != 0) throw new RuntimeException("消息加密失败");

        return new EncryptedMessage(
                Base64.encodeToString(nonce, Base64.NO_WRAP),
                Base64.encodeToString(ciphertext, Base64.NO_WRAP)
        );
    }

    /**
     * 解密消息
     */
    public static String decryptMessage(String ciphertextB64, String nonceB64, byte[] sharedKey) throws Exception {
        byte[] nonce = Base64.decode(nonceB64, Base64.NO_WRAP);
        byte[] ciphertext = Base64.decode(ciphertextB64, Base64.NO_WRAP);

        byte[] decrypted = new byte[ciphertext.length - CRYPTO_AEAD_XCHACHA20POLY1305_IETF_ABYTES];
        long[] decryptedLen = new long[1];

        int decRes = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
                decrypted, decryptedLen,
                null,
                ciphertext, ciphertext.length,
                null, 0,
                nonce, sharedKey
        );

        if (decRes != 0) {
            Arrays.fill(decrypted, (byte) 0);
            throw new Exception("消息解密失败");
        }

        String result = new String(decrypted, StandardCharsets.UTF_8);
        Arrays.fill(decrypted, (byte) 0);
        return result;
    }

    // ============================================================
    //                      E2E 包装与安全码
    // ============================================================

    public static IMessageEntity buildE2EEntity(String payloadJson) {
        return IMessageEntity.newBuilder()
                .setType("e2e")
                .setOffset(0)
                .setLength(1)
                .setData(payloadJson)
                .build();
    }

    /**
     * 生成 60 位安全码
     */
    public static String getSafetyNumber(String pubA, String pubB) {
        String[] keys = {pubA, pubB};
        Arrays.sort(keys); // 字典序排序

        String data = "lingcat-e2e-v1:" + keys[0] + keys[1];
        byte[] dataBytes = data.getBytes(StandardCharsets.UTF_8);

        byte[] hash = new byte[30];
        sodium.crypto_generichash(hash, hash.length, dataBytes, dataBytes.length, null, 0);

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < 30; i += 5) {
            long num = ((long)(hash[i] & 0xFF) << 24) |
                    ((long)(hash[i+1] & 0xFF) << 16) |
                    ((long)(hash[i+2] & 0xFF) << 8) |
                    ((long)(hash[i+3] & 0xFF));
            long part = num % 100000;
            if (i > 0) sb.append(" ");
            sb.append(String.format("%05d", part));
        }
        return sb.toString();
    }
}