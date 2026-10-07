package lingcat.client_protocol;

import java.security.SecureRandom;
import java.security.cert.X509Certificate;
import java.util.concurrent.TimeUnit;

import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;

import okhttp3.OkHttpClient;

/**
 * 全局共用的 OkHttpClient。
 *
 * 策略：信任任意 TLS 证书（含自签）。
 *
 * 为什么安全：
 *   LingCat 协议在应用层做了 X25519 + Ed25519 握手 + XChaCha20-Poly1305
 *   会话加密，TLS 只作为传输管道，不承担安全职责。
 *   中间人即使换掉 TLS 证书，也无法伪造握手签名。
 *
 * 唯一风险：TOFU 首次连接时的指纹确认必须真实核对。
 */
public final class HttpClientProvider {

    private HttpClientProvider() {}

    private static volatile OkHttpClient cached;

    public static OkHttpClient get() {
        if (cached != null) return cached;
        synchronized (HttpClientProvider.class) {
            if (cached != null) return cached;
            cached = build();
            return cached;
        }
    }

    private static OkHttpClient build() {
        try {
            // 信任所有证书
            TrustManager[] trustAll = new TrustManager[]{
                    new X509TrustManager() {
                        @Override
                        public void checkClientTrusted(X509Certificate[] chain, String authType) {}

                        @Override
                        public void checkServerTrusted(X509Certificate[] chain, String authType) {}

                        @Override
                        public X509Certificate[] getAcceptedIssuers() {
                            return new X509Certificate[0];
                        }
                    }
            };

            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, trustAll, new SecureRandom());

            return new OkHttpClient.Builder()
                    .sslSocketFactory(sslContext.getSocketFactory(),
                            (X509TrustManager) trustAll[0])
                    .hostnameVerifier((hostname, session) -> true)
                    .connectTimeout(15, TimeUnit.SECONDS)
                    .readTimeout(0, TimeUnit.SECONDS)
                    .writeTimeout(30, TimeUnit.SECONDS)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Failed to build OkHttpClient", e);
        }
    }
}