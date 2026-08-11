package lingcat.protocol;

import com.goterl.lazysodium.LazySodiumAndroid;
import com.goterl.lazysodium.utils.Key;
import com.goterl.lazysodium.utils.KeyPair;

import java.nio.charset.StandardCharsets;

public class SecureKey {
    private static LazySodiumAndroid lazySodium = LazySodiumStore.getLazySodium();

    private static byte[] hkdfExtract(byte[] salt, byte[] ikm) throws Exception {
        byte[] key = salt != null ? salt : new byte[32];
        byte[] out = new byte[32];
        boolean success = lazySodium.cryptoAuthHMACSha256(out, ikm, ikm.length, key);
        if (!success) throw new Exception("HKDF extract failed");
        return out;
    }

    private static byte[] hkdfExpand(byte[] prk, byte[] info, int length) throws Exception {
        byte[] okm = new byte[0];
        byte[] previous = new byte[0];
        int blockIndex = 1;
        while (okm.length < length) {
            // 构造输入： previous || info || blockIndex
            byte[] input = new byte[previous.length + info.length + 1];
            System.arraycopy(previous, 0, input, 0, previous.length);
            System.arraycopy(info, 0, input, previous.length, info.length);
            input[input.length - 1] = (byte) blockIndex;

            byte[] out = new byte[32];
            boolean success = lazySodium.cryptoAuthHMACSha256(out, input, input.length, prk);
            if (!success) throw new Exception("HKDF expand failed");

            byte[] block = out;
            // 拼接 block 到 okm
            byte[] newOkm = new byte[okm.length + block.length];
            System.arraycopy(okm, 0, newOkm, 0, okm.length);
            System.arraycopy(block, 0, newOkm, okm.length, block.length);
            okm = newOkm;
            previous = block;
            blockIndex++;
            if (blockIndex > 255) {
                throw new Exception("HKDF expand too long");
            }
        }
        byte[] result = new byte[length];
        System.arraycopy(okm, 0, result, 0, length);
        return result;
    }

    public static byte[] hkdf(byte[] ikm, byte[] salt, String info, int length) throws Exception {
        byte[] prk = hkdfExtract(salt, ikm);
        byte[] infoBytes = info.getBytes(StandardCharsets.UTF_8);
        return hkdfExpand(prk, infoBytes, length);
    }

    /**
     * sodium.crypto_kx_keypair
     */
    public static KeyPair All_generateExchangeKeyPair() throws Exception {
        return lazySodium.cryptoKxKeypair();
    }

    /**
     * sodium.crypto_scalarmult(private_key, opposite_public_key)
     */
    public static byte[] All_getSharedSecret(byte[] private_key, byte[] opposite_public_key) throws Exception {
        return lazySodium.cryptoScalarMult(Key.fromBytes(private_key), Key.fromBytes(opposite_public_key)).getAsBytes();
    }

    /**
     * sodium.crypto_sign_verify_detached(signed_message, message, server_long_term_public_key)
     * <p>
     * const message = Uint8Array.from([
     *     ...server_public_key,
     *     ...client_public_key,
     * ])
     */
    public static boolean Client_checkSignedMessage(byte[] signed_message, byte[]  server_public_key, byte[] client_public_key, byte[]  server_long_term_public_key) throws Exception {
        byte[] message = new byte[server_public_key.length + client_public_key.length];
        System.arraycopy(server_public_key, 0, message, 0, server_public_key.length);
        System.arraycopy(client_public_key, 0, message, server_public_key.length, client_public_key.length);

        return lazySodium.cryptoSignVerifyDetached(signed_message, message, message.length, server_long_term_public_key);
    }

    public static ClientSessionKeys Client_hkdf(byte[] sharedSecret, byte[] salt) throws Exception {
        byte[] keyRecv = hkdf(sharedSecret, salt, "server-to-client", 32);
        byte[] keySend = hkdf(sharedSecret, salt, "client-to-server", 32);
        return new ClientSessionKeys(keyRecv, keySend);
    }

    public static class ClientSessionKeys {
        public final byte[] keyRecv;
        public final byte[] keySend;

        public ClientSessionKeys(byte[] keyRecv, byte[] keySend) {
            this.keyRecv = keyRecv;
            this.keySend = keySend;
        }
    }
}
