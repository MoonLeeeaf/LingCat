package lingcat.client_protocol;

import com.google.protobuf.Parser;

import lingcat.methods.Methods.Exchange_OAuth_Code_Request;
import lingcat.methods.Methods.Exchange_OAuth_Code_Response;
import lingcat.methods.Methods.Get_OAuth_Bindings_Request;
import lingcat.methods.Methods.Get_OAuth_Bindings_Response;
import lingcat.methods.Methods.Unbind_OAuth_Request;
import lingcat.methods.Methods.Unbind_OAuth_Response;
import lingcat.protocol.Methods;
import lingcat.protocol.Package;

import java.util.Collections;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * 与 TS 端 OAuthApi 对齐。
 */
public final class OAuthApi {

    public static final long DEFAULT_TIMEOUT_MS = 30_000L;

    private OAuthApi() {}

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
     * 用 OIDC 一次性票据换取本地 access_token
     * @return access_token
     */
    public static String exchangeOAuthCode(LingCatClient client,
                                           String ticket,
                                           long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Exchange_OAuth_Code_Request req = Exchange_OAuth_Code_Request.newBuilder()
                .setTicket(ticket)
                .build();

        byte[] data = await(client, Methods.Exchange_OAuth_Code_Request,
                req.toByteArray(), timeoutMs).data;

        return decode(Exchange_OAuth_Code_Response.parser(), data).getAccessToken();
    }

    public static String exchangeOAuthCode(LingCatClient client, String ticket)
            throws InterruptedException, ExecutionException, TimeoutException {
        return exchangeOAuthCode(client, ticket, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 查询我已绑定的 OAuth 提供方 id 列表
     * 对应 TS: res.providers ?? []
     */
    public static List<String> getOAuthBindings(LingCatClient client,
                                                String accessToken,
                                                long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Get_OAuth_Bindings_Request req = Get_OAuth_Bindings_Request.newBuilder()
                .setAccessToken(accessToken)
                .build();

        byte[] data = await(client, Methods.Get_OAuth_Bindings_Request,
                req.toByteArray(), timeoutMs).data;

        Get_OAuth_Bindings_Response res =
                decode(Get_OAuth_Bindings_Response.parser(), data);

        List<String> providers = res.getProvidersList();
        // protobuf repeated 字段默认返回不可变空 list，这里的判空是防御性写法
        return providers != null ? providers : Collections.emptyList();
    }

    public static List<String> getOAuthBindings(LingCatClient client, String accessToken)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getOAuthBindings(client, accessToken, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 解绑指定 OAuth 提供方
     */
    public static void unbindOAuth(LingCatClient client,
                                   String accessToken,
                                   String provider,
                                   long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Unbind_OAuth_Request req = Unbind_OAuth_Request.newBuilder()
                .setAccessToken(accessToken)
                .setProvider(provider)
                .build();

        byte[] data = await(client, Methods.Unbind_OAuth_Request,
                req.toByteArray(), timeoutMs).data;

        // 即使返回值用不到也必须 decode，否则服务器 Error_Response 会被静默吞掉
        decode(Unbind_OAuth_Response.parser(), data);
    }

    public static void unbindOAuth(LingCatClient client,
                                   String accessToken,
                                   String provider)
            throws InterruptedException, ExecutionException, TimeoutException {
        unbindOAuth(client, accessToken, provider, DEFAULT_TIMEOUT_MS);
    }
}