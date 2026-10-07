package io.github.moonleeeaf.lingcat.data;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * 一台服务器的配置。与账号解耦。
 */
public class ServerConfig {
    /** 归一化后的完整 URL（含 pathname），如 "https://example.com/lingcat" */
    public String url;
    /** 服务器公钥（hex） */
    public String publicKey;
    /** 从 /config.json 缓存 */
    public String siteTitle;
    public Boolean livekitEnabled;
    /** /config.json 里 oauth2 数组的 JSON 字符串缓存 */
    public String oauthProvidersJson;
    public long addedAt;

    public ServerConfig() {}

    public ServerConfig(String url, String publicKey) {
        this.url = url;
        this.publicKey = publicKey;
        this.addedAt = System.currentTimeMillis();
    }

    /** WebSocket 地址：http(s) → ws(s)，path 原样保留 */
    public String getWsUrl() {
        if (url == null) return null;
        if (url.startsWith("https://")) return "wss://" + url.substring("https://".length());
        if (url.startsWith("http://"))  return "ws://"  + url.substring("http://".length());
        return url;
    }

    /** HTTP 地址（就是 url 本身） */
    public String getHttpUrl() {
        return url;
    }

    /** 公钥 hex → byte[]；无公钥返回 null */
    public byte[] getPublicKeyBytes() {
        if (publicKey == null || publicKey.isEmpty()) return null;
        return hexToBytes(publicKey);
    }

    private static byte[] hexToBytes(String hex) {
        int n = hex.length();
        if ((n & 1) != 0) return null;
        byte[] out = new byte[n / 2];
        for (int i = 0; i < n; i += 2) {
            int hi = Character.digit(hex.charAt(i), 16);
            int lo = Character.digit(hex.charAt(i + 1), 16);
            if (hi < 0 || lo < 0) return null;
            out[i / 2] = (byte) ((hi << 4) | lo);
        }
        return out;
    }

    public JSONObject toJson() throws JSONException {
        JSONObject o = new JSONObject();
        o.put("url", url);
        o.put("publicKey", publicKey);
        if (siteTitle != null) o.put("siteTitle", siteTitle);
        if (livekitEnabled != null) o.put("livekitEnabled", livekitEnabled);
        if (oauthProvidersJson != null) o.put("oauthProvidersJson", oauthProvidersJson);
        o.put("addedAt", addedAt);
        return o;
    }

    public static ServerConfig fromJson(JSONObject o) {
        ServerConfig s = new ServerConfig();
        s.url = o.optString("url");
        s.publicKey = o.optString("publicKey");
        s.siteTitle = o.has("siteTitle") ? o.optString("siteTitle") : null;
        s.livekitEnabled = o.has("livekitEnabled") ? o.optBoolean("livekitEnabled") : null;
        s.oauthProvidersJson = o.has("oauthProvidersJson") ? o.optString("oauthProvidersJson") : null;
        s.addedAt = o.optLong("addedAt");
        return s;
    }
}