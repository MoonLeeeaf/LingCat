package lingcat.client_protocol;

import com.google.protobuf.Parser;

import lingcat.methods.Methods.*;
import lingcat.protocol.Methods;
import lingcat.protocol.Package;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * 与 E2E（端到端加密）相关的 API。
 * 对外返回结构使用驼峰命名，与现有的 Java 代码风格保持一致。
 */
public final class E2EApi {

    public static final long DEFAULT_TIMEOUT_MS = 30_000L;

    private E2EApi() {}

    // ============================================================
    //                      对外数据结构
    // ============================================================

    /** 对应 TS 的 IUserE2EKey */
    public static class E2EKey {
        public final String publicKey;
        public final String encryptedPrivateKey;
        public final String kdfSalt;
        public final String kdfParams;
        public final String privNonce;
        public final int keyVersion;

        public E2EKey(String publicKey, String encryptedPrivateKey, String kdfSalt,
                      String kdfParams, String privNonce, int keyVersion) {
            this.publicKey = publicKey;
            this.encryptedPrivateKey = encryptedPrivateKey;
            this.kdfSalt = kdfSalt;
            this.kdfParams = kdfParams;
            this.privNonce = privNonce;
            this.keyVersion = keyVersion;
        }
    }

    /** 对应 TS 的 E2EPublicKeyItem */
    public static class E2EPublicKeyItem {
        public final String userId;
        public final String publicKey;

        public E2EPublicKeyItem(String userId, String publicKey) {
            this.userId = userId;
            this.publicKey = publicKey;
        }
    }

    // ============================================================
    //                      内部工具
    // ============================================================

    private static Package await(LingCatClient client, int methodId,
                                 byte[] data, long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        long effective = timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS;
        return client.invoke(methodId, data, 0, effective)
                .get(effective, TimeUnit.MILLISECONDS);
    }

    private static <T> T decode(Parser<T> parser, byte[] data) {
        return DecodeOrThrow.decode(parser, data);
    }

    // ============================================================
    //                      API
    // ============================================================

    /**
     * 上传/更新端到端加密密钥包
     */
    public static void uploadKey(LingCatClient client,
                                 String accessToken,
                                 String publicKey,
                                 String encryptedPrivateKey,
                                 String kdfSalt,
                                 String kdfParams,
                                 String privNonce,
                                 int keyVersion,
                                 long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Upload_E2E_Key_Request req = Upload_E2E_Key_Request.newBuilder()
                .setAccessToken(accessToken)
                .setPublicKey(publicKey)
                .setEncryptedPrivateKey(encryptedPrivateKey)
                .setKdfSalt(kdfSalt)
                .setKdfParams(kdfParams)
                .setPrivNonce(privNonce)
                .setKeyVersion(keyVersion)
                .build();

        byte[] data = await(client, Methods.Upload_E2E_Key_Request, req.toByteArray(), timeoutMs).data;

        // 即使返回值用不到也必须 decode，否则服务器 Error_Response 会被静默吞掉
        decode(Upload_E2E_Key_Response.parser(), data);
    }

    public static void uploadKey(LingCatClient client, String accessToken, String publicKey,
                                 String encryptedPrivateKey, String kdfSalt,
                                 String kdfParams, String privNonce, int keyVersion)
            throws InterruptedException, ExecutionException, TimeoutException {
        uploadKey(client, accessToken, publicKey, encryptedPrivateKey, kdfSalt, kdfParams, privNonce, keyVersion, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 获取自己的加密私钥包
     *
     * @param keyVersion 传 null 或不大于 0 的数表示拉取最新版本
     * @return 未找到时返回 null
     */
    public static E2EKey getMyKey(LingCatClient client,
                                  String accessToken,
                                  Integer keyVersion,
                                  long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Get_My_E2E_Key_Request.Builder b = Get_My_E2E_Key_Request.newBuilder()
                .setAccessToken(accessToken);

        if (keyVersion != null && keyVersion > 0) {
            b.setKeyVersion(keyVersion);
        }

        byte[] data = await(client, Methods.Get_My_E2E_Key_Request, b.build().toByteArray(), timeoutMs).data;
        Get_My_E2E_Key_Response res = decode(Get_My_E2E_Key_Response.parser(), data);

        if (!res.hasKey()) {
            return null;
        }

        lingcat.classes.Classes.IUserE2EKey k = res.getKey();
        return new E2EKey(
                k.getPublicKey(),
                k.getEncryptedPrivateKey(),
                k.getKdfSalt(),
                k.getKdfParams(),
                k.getPrivNonce(),
                k.getKeyVersion()
        );
    }

    public static E2EKey getMyKey(LingCatClient client, String accessToken, Integer keyVersion)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getMyKey(client, accessToken, keyVersion, DEFAULT_TIMEOUT_MS);
    }

    public static E2EKey getMyKey(LingCatClient client, String accessToken)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getMyKey(client, accessToken, null, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 批量拉取其他用户的公钥
     */
    public static List<E2EPublicKeyItem> getPublicKeys(LingCatClient client,
                                                       String accessToken,
                                                       List<String> userIds,
                                                       long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Get_E2E_Public_Keys_Request req = Get_E2E_Public_Keys_Request.newBuilder()
                .setAccessToken(accessToken)
                .addAllUserIds(userIds)
                .build();

        byte[] data = await(client, Methods.Get_E2E_Public_Keys_Request, req.toByteArray(), timeoutMs).data;
        Get_E2E_Public_Keys_Response res = decode(Get_E2E_Public_Keys_Response.parser(), data);

        List<E2EPublicKeyItem> result = new ArrayList<>();
        for (lingcat.classes.Classes.E2E_PublicKeyItem item : res.getKeysList()) {
            result.add(new E2EPublicKeyItem(item.getUserId(), item.getPublicKey()));
        }
        return result;
    }

    public static List<E2EPublicKeyItem> getPublicKeys(LingCatClient client, String accessToken, List<String> userIds)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getPublicKeys(client, accessToken, userIds, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 获取自己的所有历史密钥包
     */
    public static List<E2EKey> getAllMyKeys(LingCatClient client,
                                            String accessToken,
                                            long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Get_All_My_E2E_Keys_Request req = Get_All_My_E2E_Keys_Request.newBuilder()
                .setAccessToken(accessToken)
                .build();

        byte[] data = await(client, Methods.Get_All_My_E2E_Keys_Request, req.toByteArray(), timeoutMs).data;
        Get_All_My_E2E_Keys_Response res = decode(Get_All_My_E2E_Keys_Response.parser(), data);

        List<E2EKey> result = new ArrayList<>();
        for (lingcat.classes.Classes.IUserE2EKey k : res.getKeysList()) {
            result.add(new E2EKey(
                    k.getPublicKey(),
                    k.getEncryptedPrivateKey(),
                    k.getKdfSalt(),
                    k.getKdfParams(),
                    k.getPrivNonce(),
                    k.getKeyVersion()
            ));
        }
        return result;
    }

    public static List<E2EKey> getAllMyKeys(LingCatClient client, String accessToken)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getAllMyKeys(client, accessToken, DEFAULT_TIMEOUT_MS);
    }
}