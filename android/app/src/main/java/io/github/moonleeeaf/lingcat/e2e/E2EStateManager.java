package io.github.moonleeeaf.lingcat.e2e;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import io.github.moonleeeaf.lingcat.data.Account;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.client_protocol.E2EApi;
import lingcat.client_protocol.LingCatClient;

public class E2EStateManager {
    private static final String TAG = "E2EStateManager";
    private static final ExecutorService IO = Executors.newSingleThreadExecutor();

    private static volatile E2EStateManager instance;

    public static E2EStateManager getInstance() {
        return instance;
    }

    public static void init(Context appContext) {
        if (instance == null) {
            synchronized (E2EStateManager.class) {
                if (instance == null) {
                    instance = new E2EStateManager(appContext.getApplicationContext());
                }
            }
        }
    }

    // ============================================================
    //                      状态定义
    // ============================================================

    public enum Status {
        LOADING, DISABLED, LOCKED, UNLOCKED, ERROR_FETCH, ERROR_SERVER
    }

    public interface OnE2EStateChangedListener {
        void onE2EStateChanged();
    }

    private final Context appContext;
    private final SharedPreferences sp;

    private volatile Status status = Status.LOADING;
    private volatile String myPublicKey = null;
    private volatile int myKeyVersion = 1;

    // 内存缓存的私钥字典 (版本 -> Base64私钥)
    private final Map<Integer, String> myPrivateKeys = new HashMap<>();
    // 缓存的对方公钥
    private final Map<String, String> peerKeys = new HashMap<>();
    // 验证状态 (verified, unverified, mismatch)
    private final Map<String, String> peerVerifyStatus = new HashMap<>();

    private final CopyOnWriteArrayList<OnE2EStateChangedListener> listeners = new CopyOnWriteArrayList<>();

    private E2EStateManager(Context ctx) {
        this.appContext = ctx;
        this.sp = ctx.getSharedPreferences("lingcat_e2e", Context.MODE_PRIVATE);
        loadLocalVerifyState();
    }

    // ============================================================
    //                      监听与通知
    // ============================================================

    public void addListener(OnE2EStateChangedListener l) { listeners.add(l); }
    public void removeListener(OnE2EStateChangedListener l) { listeners.remove(l); }

    private void notifyChanged() {
        for (OnE2EStateChangedListener l : listeners) {
            try { l.onE2EStateChanged(); } catch (Exception ignored) {}
        }
    }

    public Status getStatus() { return status; }
    public String getMyPublicKey() { return myPublicKey; }
    public int getMyKeyVersion() { return myKeyVersion; }
    public Map<Integer, String> getMyPrivateKeys() { return myPrivateKeys; }
    public Map<String, String> getPeerKeys() { return peerKeys; }
    public Map<String, String> getPeerVerifyStatus() { return peerVerifyStatus; }

    // ============================================================
    //                      本地持久化 (SharedPrefs)
    // ============================================================

    private void loadLocalVerifyState() {
        try {
            String pubs = sp.getString("peer_pubs", "{}");
            String verify = sp.getString("peer_verify", "{}");

            JSONObject pObj = new JSONObject(pubs);
            JSONObject vObj = new JSONObject(verify);

            peerVerifyStatus.clear();
            java.util.Iterator<String> keys = vObj.keys();
            while(keys.hasNext()) {
                String k = keys.next();
                if ("verified".equals(vObj.optString(k))) {
                    peerVerifyStatus.put(k, "verified");
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "loadLocalVerifyState failed", e);
        }
    }

    private void savePeerPub(String userId, String pub) {
        try {
            String pubs = sp.getString("peer_pubs", "{}");
            JSONObject pObj = new JSONObject(pubs);
            pObj.put(userId, pub);
            sp.edit().putString("peer_pubs", pObj.toString()).apply();
        } catch (Exception ignored) {}
    }

    private String getKnownPeerPub(String userId) {
        try {
            String pubs = sp.getString("peer_pubs", "{}");
            JSONObject pObj = new JSONObject(pubs);
            return pObj.optString(userId, null);
        } catch (Exception ignored) {}
        return null;
    }

    private void saveVerifyStatus(String userId, String statusStr) {
        peerVerifyStatus.put(userId, statusStr);
        try {
            JSONObject vObj = new JSONObject();
            for (Map.Entry<String, String> entry : peerVerifyStatus.entrySet()) {
                if ("verified".equals(entry.getValue())) {
                    vObj.put(entry.getKey(), "verified");
                }
            }
            sp.edit().putString("peer_verify", vObj.toString()).apply();
        } catch (Exception ignored) {}
    }

    // ============================================================
    //                      业务逻辑
    // ============================================================

    private LingCatClient getClient() { return LingCatClientManager.getInstance().getCurrent(); }
    private String getToken() {
        ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
        if (s == null) return null;
        Account acc = AppDataStore.data().getActiveAccount(s.url);
        return acc != null ? acc.accessToken : null;
    }

    /**
     * 加载初始化状态
     */
    public void loadKeyState() {
        IO.execute(() -> {
            LingCatClient client = getClient();
            String token = getToken();
            if (client == null || token == null) {
                status = Status.ERROR_FETCH;
                notifyChanged();
                return;
            }

            status = Status.LOADING;
            notifyChanged();

            try {
                E2EApi.E2EKey bundle = E2EApi.getMyKey(client, token);
                if (bundle == null) {
                    status = Status.DISABLED;
                    notifyChanged();
                    return;
                }

                myPublicKey = bundle.publicKey;
                myKeyVersion = bundle.keyVersion;

                // 检查本地公钥变更
                for (Map.Entry<String, String> entry : peerKeys.entrySet()) {
                    String known = getKnownPeerPub(entry.getKey());
                    if (known != null && !known.equals(entry.getValue())) {
                        peerVerifyStatus.put(entry.getKey(), "mismatch");
                    }
                }

                status = Status.LOCKED;
            } catch (Exception e) {
                status = Status.ERROR_SERVER;
            }
            notifyChanged();
        });
    }

    /**
     * 首次生成密钥
     */
    public void setupNewKey(String password) throws Exception {
        LingCatClient client = getClient();
        String token = getToken();
        if (client == null || token == null) return;

        E2EManager.IdentityKeyPair pair = E2EManager.generateIdentityKeyPair();
        E2EManager.EncryptedPrivateKey enc = E2EManager.encryptPrivateKey(pair.privateKey, password);

        E2EApi.uploadKey(client, token, pair.publicKey, enc.encrypted, enc.salt, enc.kdfParams, enc.nonce, 1);

        myPrivateKeys.put(1, pair.privateKey);
        myPublicKey = pair.publicKey;
        myKeyVersion = 1;
        status = Status.UNLOCKED;
        notifyChanged();
    }

    /**
     * 生成新版本密钥 (重置密钥)
     */
    public void generateNewKey(String password, int newVersion) throws Exception {
        LingCatClient client = getClient();
        String token = getToken();
        if (client == null || token == null) {
            throw new Exception("未连接服务器");
        }

        // 1. 生成新的密钥对
        E2EManager.IdentityKeyPair pair = E2EManager.generateIdentityKeyPair();

        // 2. 用密码加密新私钥
        E2EManager.EncryptedPrivateKey enc = E2EManager.encryptPrivateKey(pair.privateKey, password);

        // 3. 上传到服务端 (覆盖指定版本)
        E2EApi.uploadKey(client, token, pair.publicKey, enc.encrypted, enc.salt, enc.kdfParams, enc.nonce, newVersion);

        // 4. 更新本地内存状态
        myPrivateKeys.put(newVersion, pair.privateKey);
        myPublicKey = pair.publicKey;
        myKeyVersion = newVersion;
        status = Status.UNLOCKED;
        notifyChanged();
    }

    /**
     * 解锁 (拉取全量历史密钥并尝试解密)
     */
    public boolean unlock(String password) {
        LingCatClient client = getClient();
        String token = getToken();
        if (client == null || token == null) return false;

        try {
            List<E2EApi.E2EKey> allBundles = E2EApi.getAllMyKeys(client, token);
            if (allBundles == null || allBundles.isEmpty()) return false;

            Map<Integer, String> newPrivateKeys = new HashMap<>();
            boolean decryptedLatest = false;

            for (E2EApi.E2EKey bundle : allBundles) {
                try {
                    String priv = E2EManager.decryptPrivateKey(
                            bundle.encryptedPrivateKey, bundle.kdfSalt, bundle.kdfParams, bundle.privNonce, password);
                    newPrivateKeys.put(bundle.keyVersion, priv);
                    if (bundle.keyVersion == myKeyVersion) {
                        decryptedLatest = true;
                    }
                } catch (Exception e) {
                    Log.w(TAG, "历史密钥 v" + bundle.keyVersion + " 解密失败");
                }
            }

            if (!decryptedLatest) return false;

            myPrivateKeys.clear();
            myPrivateKeys.putAll(newPrivateKeys);
            status = Status.UNLOCKED;
            notifyChanged();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 锁定
     */
    public void lock() {
        status = Status.LOCKED;
        myPrivateKeys.clear();
        notifyChanged();
    }

    /**
     * 拉取对方公钥
     */
    public void fetchPeerKeys(List<String> userIds) {
        LingCatClient client = getClient();
        String token = getToken();
        if (client == null || token == null || userIds.isEmpty()) return;

        List<String> missing = new ArrayList<>();
        for (String id : userIds) {
            if (!peerKeys.containsKey(id)) missing.add(id);
        }
        if (missing.isEmpty()) return;

        try {
            List<E2EApi.E2EPublicKeyItem> res = E2EApi.getPublicKeys(client, token, missing);
            for (E2EApi.E2EPublicKeyItem item : res) {
                peerKeys.put(item.userId, item.publicKey);
                if (!peerVerifyStatus.containsKey(item.userId)) {
                    String known = getKnownPeerPub(item.userId);
                    if (known != null && !known.equals(item.publicKey)) {
                        peerVerifyStatus.put(item.userId, "mismatch");
                    } else {
                        peerVerifyStatus.put(item.userId, "unverified");
                    }
                }
                savePeerPub(item.userId, item.publicKey);
            }
            notifyChanged();
        } catch (Exception e) {
            Log.e(TAG, "fetchPeerKeys failed", e);
        }
    }

    public void setPeerVerified(String userId) {
        saveVerifyStatus(userId, "verified");
        notifyChanged();
    }

    /**
     * 加密发送
     */
    public String encryptForPeer(String plaintext, String peerUserId) {
        if (status != Status.UNLOCKED || myPublicKey == null) return null;
        String myPriv = myPrivateKeys.get(myKeyVersion);
        if (myPriv == null) return null;
        String receiverPub = peerKeys.get(peerUserId);
        if (receiverPub == null) return null;

        try {
            byte[] sharedKey = E2EManager.deriveSharedKey(myPriv, receiverPub);
            E2EManager.EncryptedMessage msg = E2EManager.encryptMessage(plaintext, sharedKey);

            // 手动组装 E2EPayload (类似 Web 端的 JSON.stringify)
            JSONObject payload = new JSONObject();
            payload.put("v", 1);
            payload.put("keyVersion", myKeyVersion);
            payload.put("senderPub", myPublicKey);
            payload.put("receiverPub", receiverPub);
            payload.put("nonce", msg.nonce);
            payload.put("ciphertext", msg.ciphertext);

            return payload.toString();
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 解密接收
     */
    public String decryptFromPeer(String entityJson, String senderUserId) {
        if (status != Status.UNLOCKED) return null;

        try {
            JSONObject payload = new JSONObject(entityJson);
            // 获取当前用户的 ID 以区分自己发的消息
            ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
            Account acc = s != null ? AppDataStore.data().getActiveAccount(s.url) : null;
            String myUserId = acc != null ? acc.userId : "";

            boolean isMine = senderUserId.equals(myUserId);
            String targetPub = isMine ? payload.getString("receiverPub") : payload.getString("senderPub");
            String nonce = payload.getString("nonce");
            String ciphertext = payload.getString("ciphertext");
            int keyVersion = payload.optInt("keyVersion", 1);

            // 遍历本地所有私钥尝试解密 (解决多版本历史密钥问题)
            for (String priv : myPrivateKeys.values()) {
                try {
                    byte[] sharedKey = E2EManager.deriveSharedKey(priv, targetPub);
                    return E2EManager.decryptMessage(ciphertext, nonce, sharedKey);
                } catch (Exception ignored) {}
            }

            // 如果全解不开，返回特定的 JSON 标记，通知 UI 提示需要输入旧密码
            JSONObject err = new JSONObject();
            err.put("text", "🔒 [此消息使用了旧密码，点击解锁]");
            err.put("entities", new JSONArray());
            err.put("needVersion", keyVersion);
            return err.toString();

        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 解锁特定旧版本密钥
     */
    public boolean unlockSpecificVersion(int version, String password) {
        LingCatClient client = getClient();
        String token = getToken();
        if (client == null || token == null) return false;

        try {
            E2EApi.E2EKey bundle = E2EApi.getMyKey(client, token, version);
            if (bundle == null) return false;

            String priv = E2EManager.decryptPrivateKey(
                    bundle.encryptedPrivateKey, bundle.kdfSalt, bundle.kdfParams, bundle.privNonce, password);

            myPrivateKeys.put(version, priv);
            notifyChanged();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 独立修改某个版本的密码
     */
    public boolean changeVersionPassword(int version, String oldPassword, String newPassword) {
        LingCatClient client = getClient();
        String token = getToken();
        if (client == null || token == null) return false;

        try {
            E2EApi.E2EKey bundle = E2EApi.getMyKey(client, token, version);
            if (bundle == null) return false;

            String priv = E2EManager.decryptPrivateKey(
                    bundle.encryptedPrivateKey, bundle.kdfSalt, bundle.kdfParams, bundle.privNonce, oldPassword);

            E2EManager.EncryptedPrivateKey enc = E2EManager.encryptPrivateKey(priv, newPassword);

            E2EApi.uploadKey(client, token, bundle.publicKey, enc.encrypted, enc.salt, enc.kdfParams, enc.nonce, version);

            myPrivateKeys.put(version, priv);
            notifyChanged();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 批量修改主密码 (会尝试解开所有历史版本并用新密码重新加密)
     */
    public boolean changePassword(String oldPassword, String newPassword) {
        LingCatClient client = getClient();
        String token = getToken();
        if (client == null || token == null) return false;

        try {
            List<E2EApi.E2EKey> allBundles = E2EApi.getAllMyKeys(client, token);
            if (allBundles == null || allBundles.isEmpty()) return false;

            List<E2EApi.E2EKey> toUpdate = new ArrayList<>();

            for (E2EApi.E2EKey bundle : allBundles) {
                try {
                    String priv = E2EManager.decryptPrivateKey(
                            bundle.encryptedPrivateKey, bundle.kdfSalt, bundle.kdfParams, bundle.privNonce, oldPassword);
                    E2EManager.EncryptedPrivateKey enc = E2EManager.encryptPrivateKey(priv, newPassword);

                    // 复用对象结构，稍微改一下
                    E2EApi.E2EKey updated = new E2EApi.E2EKey(
                            bundle.publicKey, enc.encrypted, enc.salt, enc.kdfParams, enc.nonce, bundle.keyVersion);
                    toUpdate.add(updated);
                } catch (Exception e) {
                    if (bundle.keyVersion == myKeyVersion) {
                        throw new Exception("旧密码错误，终止修改");
                    }
                }
            }

            for (E2EApi.E2EKey bundle : toUpdate) {
                E2EApi.uploadKey(client, token, bundle.publicKey, bundle.encryptedPrivateKey,
                        bundle.kdfSalt, bundle.kdfParams, bundle.privNonce, bundle.keyVersion);
            }

            // 改完后锁定并要求重新解锁
            lock();
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}