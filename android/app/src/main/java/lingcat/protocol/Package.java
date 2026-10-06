package lingcat.protocol;

import com.google.protobuf.ByteString;
import com.google.protobuf.InvalidProtocolBufferException;
import com.goterl.lazysodium.LazySodiumAndroid;
import lingcat.classes.Classes;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.security.SecureRandom;

public class Package {

    public static final int FLAG_ENCRYPTED   = 1 << 0;
    public static final int FLAG_RESERVED    = 1 << 1;
    public static final int PROTOCOL_VERSION = 2;

    private static final int AEAD_TAG_BYTES = 16;
    private static final int NONCE_BYTES    = 24;

    private static final SecureRandom RNG = new SecureRandom();

    public int method_id = -1;
    public int length = -1;
    public int flags = 0;
    public byte[] request_id = new byte[0];
    public byte[] data = new byte[0];
    /** -1 表示未设置；实际使用时为 uint32（AAD 用 4 字节大端承载） */
    public long seq = -1L;

    public boolean isDecrypted = false;
    public boolean isEncrypted = false;

    public byte[] iv;
    public byte[] aad;
    public byte[] tag;
    public String origin_server;
    public byte[] signature;
    public Integer protocol_version;

    /** 构造输入，避免静态方法与字段同名 */
    public static class Input {
        public int method_id;
        public byte[] data;
        public Integer flags;
        public byte[] request_id;
        public Long seq;
        public byte[] iv;
        public byte[] aad;
        public byte[] tag;
        public String origin_server;
        public byte[] signature;
        public Integer protocol_version;
    }

    /**
     * 将 Package 属性编码为 Package 实例
     * - 未提供 request_id 时自动生成 6 字节随机值
     * - 未提供 flags 时默认 0
     * - 未提供 protocol_version 时默认 2
     */
    public static Package encode(Input in) {
        byte[] rid = (in.request_id != null && in.request_id.length > 0)
                ? in.request_id
                : randomBytes(6);

        Package pkg = new Package();
        pkg.method_id = in.method_id;
        pkg.length = (in.data != null) ? in.data.length : 0;
        pkg.flags = (in.flags != null) ? in.flags : 0;
        pkg.request_id = rid;
        pkg.data = (in.data != null) ? in.data : new byte[0];
        pkg.seq = (in.seq != null) ? in.seq : -1L;
        pkg.isEncrypted = (pkg.flags & FLAG_ENCRYPTED) != 0;
        pkg.isDecrypted = !pkg.isEncrypted;
        pkg.iv = in.iv;
        pkg.aad = in.aad;
        pkg.tag = in.tag;
        pkg.origin_server = in.origin_server;
        pkg.signature = in.signature;
        pkg.protocol_version = (in.protocol_version != null)
                ? in.protocol_version
                : PROTOCOL_VERSION;
        return pkg;
    }

    /**
     * 从二进制解码为 Package 实例
     */
    public static Package decode(byte[] raw, byte[] secret, Long lastSeq)
            throws InvalidProtocolBufferException {
        Classes.Package proto = Classes.Package.parseFrom(raw);

        Input in = new Input();
        in.method_id = proto.getMethodId();
        in.data = proto.getData().toByteArray();
        in.flags = proto.getFlags();
        in.request_id = proto.getRequestId().toByteArray();
        in.seq = Integer.toUnsignedLong(proto.getSeq());
        in.iv = proto.getIv().toByteArray();
        in.aad = proto.getAad().toByteArray();
        in.tag = proto.getTag().toByteArray();
        in.origin_server = proto.hasOriginServer() ? proto.getOriginServer() : null;
        in.signature = proto.hasSignature() ? proto.getSignature().toByteArray() : null;
        in.protocol_version = proto.hasProtocolVersion() ? proto.getProtocolVersion() : null;

        Package pkg = encode(in);

        if ((pkg.flags & FLAG_ENCRYPTED) != 0 && secret != null) {
            pkg.decrypt(lastSeq != null ? lastSeq : -1L, secret);
        }

        return pkg;
    }

    /**
     * 将当前实例编码为二进制
     */
    public byte[] toBuffer() {
        Classes.Package.Builder builder = Classes.Package.newBuilder()
                .setMethodId(this.method_id)
                .setFlags(this.flags)
                .setRequestId(ByteString.copyFrom(this.request_id))
                .setSeq((int) this.seq)
                .setData(ByteString.copyFrom(this.data))
                .setIv(ByteString.copyFrom(this.iv != null ? this.iv : new byte[0]))
                .setAad(ByteString.copyFrom(this.aad != null ? this.aad : new byte[0]))
                .setTag(ByteString.copyFrom(this.tag != null ? this.tag : new byte[0]));

        if (this.origin_server != null) {
            builder.setOriginServer(this.origin_server);
        }
        if (this.signature != null) {
            builder.setSignature(ByteString.copyFrom(this.signature));
        }
        if (this.protocol_version != null) {
            builder.setProtocolVersion(this.protocol_version);
        }

        return builder.build().toByteArray();
    }

    /**
     * 加密 Package
     * @param seq      发送序列号（同时作为 AAD）
     * @param secret   对称密钥（32 字节）
     */
    public Package encrypt(long seq, byte[] secret) {
        if ((this.flags & FLAG_ENCRYPTED) != 0) {
            throw new IllegalStateException("Package is already encrypted");
        }

        LazySodiumAndroid sodium = LazySodiumStore.getLazySodium();

        byte[] iv = randomBytes(NONCE_BYTES);
        byte[] aad = seqToAad(seq);

        // 输出缓冲区：明文长度 + 16 字节 tag
        byte[] ciphertextWithTag = new byte[this.data.length + AEAD_TAG_BYTES];
        long[] ciphertextLen = new long[1];

        boolean ok = sodium.cryptoAeadXChaCha20Poly1305IetfEncrypt(
                ciphertextWithTag, ciphertextLen,     // c, cLen
                this.data, this.data.length,          // m, mLen
                aad, aad.length,                      // ad, adLen
                null,                                 // nSec
                iv,                                   // nPub
                secret                                // k
        );

        if (!ok) {
            throw new RuntimeException("Encryption failed");
        }

        int total = (int) ciphertextLen[0];
        int dataLen = total - AEAD_TAG_BYTES;

        this.data = new byte[dataLen];
        System.arraycopy(ciphertextWithTag, 0, this.data, 0, dataLen);

        this.tag = new byte[AEAD_TAG_BYTES];
        System.arraycopy(ciphertextWithTag, dataLen, this.tag, 0, AEAD_TAG_BYTES);

        this.iv = iv;
        this.aad = aad;
        this.seq = seq;
        this.length = this.data.length;
        this.flags |= FLAG_ENCRYPTED;
        this.isEncrypted = true;
        this.isDecrypted = false;

        return this;
    }

    /**
     * 解密 Package
     * @param lastSeq  接收方上次的最大 seq（用于防重放）
     * @param secret   对称密钥（32 字节）
     */
    public Package decrypt(long lastSeq, byte[] secret) {
        if ((this.flags & FLAG_ENCRYPTED) == 0) {
            throw new IllegalStateException("Package is not encrypted");
        }
        if (this.iv == null || this.aad == null || this.tag == null) {
            throw new IllegalStateException("Missing encryption parameters (iv / aad / tag)");
        }
        if (this.seq != -1L && this.seq <= lastSeq) {
            throw new SecurityException("数据包请求 seq 不符合要求, 需要 " + lastSeq
                    + ", 数据包提供了 " + this.seq);
        }

        LazySodiumAndroid sodium = LazySodiumStore.getLazySodium();

        // 拼接 data || tag
        byte[] ciphertextWithTag = new byte[this.data.length + this.tag.length];
        System.arraycopy(this.data, 0, ciphertextWithTag, 0, this.data.length);
        System.arraycopy(this.tag, 0, ciphertextWithTag, this.data.length, this.tag.length);

        // 明文缓冲：长度不超过密文
        byte[] plaintext = new byte[ciphertextWithTag.length];
        long[] plaintextLen = new long[1];

        boolean ok = sodium.cryptoAeadXChaCha20Poly1305IetfDecrypt(
                plaintext, plaintextLen,              // m, mLen
                null,                                 // nSec
                ciphertextWithTag, ciphertextWithTag.length,  // c, cLen
                this.aad, this.aad.length,            // ad, adLen
                this.iv,                              // nPub
                secret                                // k
        );

        if (!ok) {
            throw new SecurityException("Decryption failed");
        }

        int len = (int) plaintextLen[0];
        byte[] realPlaintext = new byte[len];
        System.arraycopy(plaintext, 0, realPlaintext, 0, len);

        this.data = realPlaintext;
        this.length = realPlaintext.length;
        this.flags &= ~FLAG_ENCRYPTED;
        this.isDecrypted = true;
        this.isEncrypted = false;
        this.iv = null;
        this.aad = null;
        this.tag = null;

        return this;
    }

    private static byte[] randomBytes(int n) {
        byte[] b = new byte[n];
        RNG.nextBytes(b);
        return b;
    }

    /** 将 seq 写成 4 字节大端 */
    private static byte[] seqToAad(long seq) {
        return ByteBuffer.allocate(4)
                .order(ByteOrder.BIG_ENDIAN)
                .putInt((int) seq)
                .array();
    }
}