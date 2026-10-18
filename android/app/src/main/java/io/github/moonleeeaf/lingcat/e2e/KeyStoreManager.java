package io.github.moonleeeaf.lingcat.e2e;

import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import android.util.Log;

import java.nio.charset.StandardCharsets;
import java.security.KeyStore;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

public class KeyStoreManager {
    private static final String TAG = "KeyStoreManager";
    private static final String ANDROID_KEYSTORE = "AndroidKeyStore";
    private static final String KEY_ALIAS = "LingCatE2EKey";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";

    // 获取或生成硬件级密钥
    private static SecretKey getOrCreateSecretKey() throws Exception {
        KeyStore keyStore = KeyStore.getInstance(ANDROID_KEYSTORE);
        keyStore.load(null);
        if (keyStore.containsAlias(KEY_ALIAS)) {
            return (SecretKey) keyStore.getKey(KEY_ALIAS, null);
        }

        KeyGenerator keyGenerator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, ANDROID_KEYSTORE);
        KeyGenParameterSpec keyGenParameterSpec = new KeyGenParameterSpec.Builder(
                KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build();
        keyGenerator.init(keyGenParameterSpec);
        return keyGenerator.generateKey();
    }

    // 加密字符串
    public static String encrypt(String plaintext) {
        try {
            SecretKey key = getOrCreateSecretKey();
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key);
            byte[] iv = cipher.getIV();
            byte[] encrypted = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));

            // 拼接 IV 和 密文 (IV长度一般是12字节)
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
            return Base64.encodeToString(combined, Base64.NO_WRAP);
        } catch (Exception e) {
            Log.e(TAG, "encrypt failed", e);
            return null;
        }
    }

    // 解密字符串
    public static String decrypt(String ciphertextB64) {
        try {
            SecretKey key = getOrCreateSecretKey();
            byte[] combined = Base64.decode(ciphertextB64, Base64.NO_WRAP);

            // 提取 IV 和 密文
            byte[] iv = new byte[12];
            System.arraycopy(combined, 0, iv, 0, 12);
            byte[] encrypted = new byte[combined.length - 12];
            System.arraycopy(combined, 12, encrypted, 0, encrypted.length);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            GCMParameterSpec spec = new GCMParameterSpec(128, iv);
            cipher.init(Cipher.DECRYPT_MODE, key, spec);
            byte[] decrypted = cipher.doFinal(encrypted);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            Log.e(TAG, "decrypt failed", e);
            return null;
        }
    }
}