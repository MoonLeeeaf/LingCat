package io.github.moonleeeaf.lingcat.data;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * 单个服务器下的一个账号。userId 在服务器内唯一。
 */
public class Account {
    public String userId;
    public String accessToken;
    public String nickname;
    public String username;
    public String avatarFileHash;
    public String serverUrl;
    public long addedAt;

    public Account() {}

    public Account(String userId, String accessToken) {
        this.userId = userId;
        this.accessToken = accessToken;
        this.addedAt = System.currentTimeMillis();
    }

    public JSONObject toJson() throws JSONException {
        JSONObject o = new JSONObject();
        o.put("userId", userId);
        o.put("accessToken", accessToken);
        if (nickname != null) o.put("nickname", nickname);
        if (username != null) o.put("username", username);
        if (avatarFileHash != null) o.put("avatarFileHash", avatarFileHash);
        o.put("addedAt", addedAt);
        return o;
    }

    public static Account fromJson(JSONObject o) {
        Account a = new Account();
        a.userId = o.optString("userId");
        a.accessToken = o.optString("accessToken");
        a.nickname = o.has("nickname") ? o.optString("nickname") : null;
        a.username = o.has("username") ? o.optString("username") : null;
        a.avatarFileHash = o.has("avatarFileHash") ? o.optString("avatarFileHash") : null;
        a.addedAt = o.optLong("addedAt");
        return a;
    }
}