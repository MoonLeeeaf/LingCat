package lingcat.protocol;

import com.goterl.lazysodium.LazySodiumAndroid;
import com.google.protobuf.ByteString;
import com.google.protobuf.InvalidProtocolBufferException;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.security.SecureRandom;

import lingcat.classes.Classes.EncryptedMessage;

public class Package {
    private static final int REQUEST_ID_LEN = 6;
    private static final int AEAD_NPUBBYTES = 24;
    private static LazySodiumAndroid lazySodium = LazySodiumStore.getLazySodium();

    public static final int FLAG_ENCRYPTED = 2;
    public static final int FLAG_RESERVED = 3;


    private int methodId = -1;
    private int length = -1;
    private int flags = 0;
    private byte[] requestId = new byte[0];
    private byte[] data = new byte[0];
    private int seq = -1;
    private boolean isDecrypted = false;

    private Package() {}

    /**
     * 从二进制数据解包（自动解密）
     * @param data   原始字节
     * @param secret 解密密钥（如果加密）
     * @param seq    期望的序列号（用于解密校验）
     * @return       解析后的 Package 实例
     */
    public static Package decode(byte[] data, byte[] secret, int seq) throws Exception {
        Package pkg = new Package();
        ByteBuffer buffer = ByteBuffer.wrap(data).order(ByteOrder.BIG_ENDIAN);

        pkg.methodId = buffer.getShort();      // 2 bytes
        pkg.length = buffer.getInt();          // 4 bytes
        pkg.flags = buffer.getShort();         // 2 bytes
        pkg.requestId = new byte[REQUEST_ID_LEN];
        buffer.get(pkg.requestId);              // 6 bytes
        pkg.data = new byte[pkg.length];
        buffer.get(pkg.data);                   // variable length

        // 如果加密标志位被设置，则解密
        if ((pkg.flags & FLAG_ENCRYPTED) != 0) {
            if (secret == null) {
                throw new Exception("Encrypted package but no secret provided!");
            }
            pkg.decrypt(seq, secret);
        }

        return pkg;
    }

    /**
     * 编码新包
     * @param methodId 方法ID
     * @param flags    标志位
     * @param data     载荷数据
     * @return         未加密的 Package 实例
     */
    public static Package encode(int methodId, int flags, byte[] data) {
        Package pkg = new Package();
        // 生成随机 requestId
        byte[] rid = new byte[REQUEST_ID_LEN];
        new SecureRandom().nextBytes(rid);
        pkg.methodId = methodId;
        pkg.length = data.length;
        pkg.flags = flags;
        pkg.requestId = rid;
        pkg.data = data;
        return pkg;
    }

    /**
     * 加密当前包
     * @param seq    序列号
     * @param secret 对称密钥
     * @return       当前实例（链式）
     */
    public Package encrypt(int seq, byte[] secret) throws Exception {
        // 生成随机 nonce
        byte[] nonce = new byte[AEAD_NPUBBYTES];
        new SecureRandom().nextBytes(nonce);

        // 构造 AAD = seq 的 4 字节大端表示
        byte[] aad = ByteBuffer.allocate(4).order(ByteOrder.BIG_ENDIAN).putInt(seq).array();

        byte[] ciphertext = new byte[data.length + 16];
        long[] cLen = new long[1];

        boolean success = lazySodium.cryptoAeadXChaCha20Poly1305IetfEncrypt(
                ciphertext, cLen,
                data, data.length,
                aad, aad.length,
                null,
                nonce,
                secret
        );
        if (!success) {
            throw new Exception("XChaCha encryption failed");
        }

        // 构建 EncryptedMessage 并序列化
        EncryptedMessage.Builder builder = EncryptedMessage.newBuilder();
        builder.setSeq(seq);
        builder.setIv(ByteString.copyFrom(nonce));
        builder.setData(ByteString.copyFrom(ciphertext));
        builder.setAad(ByteString.copyFrom(aad));
        byte[] protoData = builder.build().toByteArray();

        // 更新自身
        this.data = protoData;
        this.length = protoData.length;
        this.flags |= FLAG_ENCRYPTED;
        this.seq = seq;
        this.isDecrypted = false;

        return this;
    }

    /**
     * 解密当前包
     * @param seq    期望的序列号（用于校验）
     * @param secret 对称密钥
     * @return       当前实例（链式）
     */
    public Package decrypt(int seq, byte[] secret) throws Exception {
        // 解析 Protobuf
        EncryptedMessage msg;
        try {
            msg = EncryptedMessage.parseFrom(this.data);
        } catch (InvalidProtocolBufferException e) {
            throw new Exception("Failed to parse EncryptedMessage", e);
        }

        byte[] nonce = msg.getIv().toByteArray();
        byte[] aad = msg.getAad().toByteArray();
        byte[] ciphertext = msg.getData().toByteArray();

        byte[] plaintext = new byte[ciphertext.length - 16];
        long[] mLen = new long[1];

        boolean success = lazySodium.cryptoAeadXChaCha20Poly1305IetfDecrypt(
                plaintext, mLen,
                null,   // 密钥的随机数（可空）
                ciphertext, ciphertext.length,
                aad, aad.length,
                nonce,
                secret
        );

        if (!success) {
            throw new Exception("XChaCha decryption failed");
        }

        // 校验序列号
        if (msg.getSeq() <= seq) {
            throw new Exception("Invalid seq: expected > " + seq + ", got " + msg.getSeq());
        }

        // 更新自身
        this.data = plaintext;
        this.length = (int) mLen[0];
        this.isDecrypted = true;
        this.flags &= ~FLAG_ENCRYPTED;
        this.seq = msg.getSeq();

        return this;
    }

    /**
     * 序列化为二进制字节数组
     */
    public byte[] toBuffer() {
        int totalLen = 2 + 4 + 2 + REQUEST_ID_LEN + data.length;
        ByteBuffer buffer = ByteBuffer.allocate(totalLen).order(ByteOrder.BIG_ENDIAN);
        buffer.putShort((short) methodId);
        buffer.putInt(length);
        buffer.putShort((short) flags);
        buffer.put(requestId);
        buffer.put(data);
        return buffer.array();
    }

    public int getMethodId() { return methodId; }
    public int getLength() { return length; }
    public int getFlags() { return flags; }
    public byte[] getRequestId() { return requestId; }
    public byte[] getData() { return data; }
    public int getSeq() { return seq; }
    public boolean isDecrypted() { return isDecrypted; }
    public void setFlags(int flags) { this.flags = flags; }
}