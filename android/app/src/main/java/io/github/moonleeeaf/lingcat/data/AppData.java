package io.github.moonleeeaf.lingcat.data;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 顶层数据结构。持久化为一整块 JSON。
 */
public class AppData {
    /** 服务器列表，按 addedAt 排序 */
    public final List<ServerConfig> servers = new ArrayList<>();
    /** serverUrl -> 账号列表 */
    public final Map<String, List<Account>> accountsByServer = new HashMap<>();
    /** serverUrl -> 当前活跃账号的 userId */
    public final Map<String, String> activeAccountByServer = new HashMap<>();
    /** 上次使用的服务器 URL */
    public String currentServerUrl;

    // ============ 序列化 ============

    public JSONObject toJson() throws JSONException {
        JSONObject root = new JSONObject();

        JSONArray serversArr = new JSONArray();
        for (ServerConfig s : servers) serversArr.put(s.toJson());
        root.put("servers", serversArr);

        JSONObject accountsObj = new JSONObject();
        for (Map.Entry<String, List<Account>> e : accountsByServer.entrySet()) {
            JSONArray arr = new JSONArray();
            for (Account a : e.getValue()) arr.put(a.toJson());
            accountsObj.put(e.getKey(), arr);
        }
        root.put("accountsByServer", accountsObj);

        JSONObject activeObj = new JSONObject();
        for (Map.Entry<String, String> e : activeAccountByServer.entrySet()) {
            activeObj.put(e.getKey(), e.getValue());
        }
        root.put("activeAccountByServer", activeObj);

        if (currentServerUrl != null) root.put("currentServerUrl", currentServerUrl);

        return root;
    }

    public static AppData fromJson(JSONObject root) {
        AppData d = new AppData();

        JSONArray serversArr = root.optJSONArray("servers");
        if (serversArr != null) {
            for (int i = 0; i < serversArr.length(); i++) {
                JSONObject o = serversArr.optJSONObject(i);
                if (o != null) d.servers.add(ServerConfig.fromJson(o));
            }
        }

        JSONObject accountsObj = root.optJSONObject("accountsByServer");
        if (accountsObj != null) {
            for (java.util.Iterator<String> it = accountsObj.keys(); it.hasNext(); ) {
                String url = it.next();
                JSONArray arr = accountsObj.optJSONArray(url);
                if (arr == null) continue;
                List<Account> list = new ArrayList<>();
                for (int i = 0; i < arr.length(); i++) {
                    JSONObject o = arr.optJSONObject(i);
                    if (o != null) list.add(Account.fromJson(o));
                }
                d.accountsByServer.put(url, list);
            }
        }

        JSONObject activeObj = root.optJSONObject("activeAccountByServer");
        if (activeObj != null) {
            for (java.util.Iterator<String> it = activeObj.keys(); it.hasNext(); ) {
                String url = it.next();
                d.activeAccountByServer.put(url, activeObj.optString(url));
            }
        }

        d.currentServerUrl = root.has("currentServerUrl")
                ? root.optString("currentServerUrl") : null;

        return d;
    }

    // ============ 便捷查询 ============

    public ServerConfig findServer(String url) {
        for (ServerConfig s : servers) {
            if (s.url.equals(url)) return s;
        }
        return null;
    }

    public List<Account> getAccounts(String serverUrl) {
        List<Account> list = accountsByServer.get(serverUrl);
        return list != null ? list : new ArrayList<>();
    }

    public Account findAccount(String serverUrl, String userId) {
        List<Account> list = accountsByServer.get(serverUrl);
        if (list == null) return null;
        for (Account a : list) {
            if (a.userId.equals(userId)) return a;
        }
        return null;
    }

    public Account getActiveAccount(String serverUrl) {
        String uid = activeAccountByServer.get(serverUrl);
        if (uid == null) return null;
        return findAccount(serverUrl, uid);
    }

    public ServerConfig getCurrentServer() {
        if (currentServerUrl == null) return null;
        return findServer(currentServerUrl);
    }

    public Account getCurrentAccount() {
        if (currentServerUrl == null) return null;
        return getActiveAccount(currentServerUrl);
    }
}