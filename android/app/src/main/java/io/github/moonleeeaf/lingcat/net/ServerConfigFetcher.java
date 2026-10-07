package io.github.moonleeeaf.lingcat.net;

import lingcat.client_protocol.HttpClientProvider;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.ResponseBody;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.util.concurrent.TimeUnit;

/**
 * 拉取并解析服务器 /config.json。
 *
 * 与 Web 端 ClientConfig.loadFrom() 对齐：
 *   - URL = serverUrl + "/config.json"
 *   - 无缓存（cache: no-store）
 */
public class ServerConfigFetcher {

    public static class Result {
        public String siteTitle;
        public String publicKey;
        public Boolean livekitEnabled;
        /** oauth2 数组的原始 JSON 字符串，缓存用 */
        public String oauthProvidersJson;
        /** 原始 JSON，调试用 */
        public JSONObject raw;
    }

    /** config.json 里解析失败 / 缺 public_key 等致命问题的异常 */
    public static class ConfigException extends IOException {
        public ConfigException(String msg) { super(msg); }
    }

    private static final OkHttpClient CLIENT = HttpClientProvider.get();

    /**
     * 同步拉取。调用方必须放在工作线程。
     *
     * @param serverUrl 已归一化的服务器 URL，如 "https://example.com/lingcat"
     */
    public static Result fetch(String serverUrl) throws IOException {
        String url = serverUrl + "/config.json";

        Request request = new Request.Builder()
                .url(url)
                .header("Cache-Control", "no-store")
                .header("Accept", "application/json")
                .build();

        try (Response response = CLIENT.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new ConfigException("HTTP " + response.code() + " from " + url);
            }
            ResponseBody body = response.body();
            if (body == null) {
                throw new ConfigException("empty body from " + url);
            }
            String text = body.string();

            JSONObject json;
            try {
                json = new JSONObject(text);
            } catch (Exception e) {
                throw new ConfigException("invalid JSON from " + url + ": " + e.getMessage());
            }

            Result r = new Result();
            r.raw = json;
            r.siteTitle = json.optString("site_title", null);
            String pk = json.optString("public_key", null);
            r.publicKey = (pk != null && !pk.isEmpty()) ? pk : null;
            if (json.has("livekit_enabled")) {
                r.livekitEnabled = json.optBoolean("livekit_enabled");
            }
            JSONArray oauth = json.optJSONArray("oauth2");
            if (oauth != null) {
                r.oauthProvidersJson = oauth.toString();
            }
            return r;
        }
    }
}