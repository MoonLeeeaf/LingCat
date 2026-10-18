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

    /** 最近一次 unlock() 失败的具体原因，供 UI 直接展示 */
    private volatile String lastUnlockError = null;

    public String getLastUnlockError() { return lastUnlockError; }

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

                if (loadLocalKeys()) {
                    status = Status.UNLOCKED;
                } else {
                    status = Status.LOCKED;
                }
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
        saveLocalKeys();
        status = Status.UNLOCKED;
        notifyChanged();
    }

    /**
     * 解锁 (拉取全量历史密钥并尝试解密)
     */
    /**
     * 解锁 (拉取全量历史密钥并尝试解密)
     */
    public boolean unlock(String password) {
        lastUnlockError = null;

        LingCatClient client = getClient();
        String token = getToken();
        if (client == null || token == null) {
            lastUnlockError = "未连接服务器或登录失效";
            Log.w(TAG, "unlock aborted: client/token null");
            return false;
        }

        try {
            List<E2EApi.E2EKey> allBundles = E2EApi.getAllMyKeys(client, token);
            if (allBundles == null || allBundles.isEmpty()) {
                lastUnlockError = "服务端没有你的密钥记录";
                Log.w(TAG, "unlock: server has no key bundles");
                return false;
            }

            int maxVersion = 0;
            for (E2EApi.E2EKey b : allBundles) {
                if (b.keyVersion > maxVersion) maxVersion = b.keyVersion;
            }

            Map<Integer, String> newPrivateKeys = new HashMap<>();
            boolean decryptedLatest = false;
            Exception latestError = null;

            for (E2EApi.E2EKey bundle : allBundles) {
                try {
                    String priv = E2EManager.decryptPrivateKey(
                            bundle.encryptedPrivateKey, bundle.kdfSalt,
                            bundle.privNonce, bundle.kdfParams, password);
                    newPrivateKeys.put(bundle.keyVersion, priv);
                    if (bundle.keyVersion == maxVersion) {
                        decryptedLatest = true;
                    }
                } catch (Exception e) {
                    if (bundle.keyVersion == maxVersion) latestError = e;
                    Log.w(TAG, "历史密钥 v" + bundle.keyVersion + " 解密失败", e);
                }
            }

            if (!decryptedLatest) {
                String msg = "最新版 v" + maxVersion + " 解密失败："
                        + (latestError != null ? latestError.getMessage() : "未知");
                lastUnlockError = msg;
                Log.w(TAG, "unlock failed: " + msg
                        + "（成功解出版本: " + newPrivateKeys.keySet() + "）");
                return false;
            }

            myPrivateKeys.clear();
            myPrivateKeys.putAll(newPrivateKeys);
            myKeyVersion = maxVersion;

            // ★ 修复：如果此前没拉取过公钥，在解锁成功时顺手拉取最新公钥
            if (myPublicKey == null) {
                for (E2EApi.E2EKey b : allBundles) {
                    if (b.keyVersion == maxVersion) {
                        myPublicKey = b.publicKey;
                        break;
                    }
                }
            }

            saveLocalKeys();
            status = Status.UNLOCKED;
            notifyChanged();
            return true;
        } catch (Exception e) {
            lastUnlockError = "网络或协议异常：" + e.getClass().getSimpleName()
                    + (e.getMessage() != null ? " (" + e.getMessage() + ")" : "");
            Log.e(TAG, "unlock outer failed", e);
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
    /**
     * 加密发送
     */
    public String encryptForPeer(String plaintext, String peerUserId) {
        // ★ 拆开判断，精准报错
        if (status != Status.UNLOCKED) {
            throw new IllegalStateException("加密未解锁");
        }
        if (myPublicKey == null) {
            throw new IllegalStateException("本地公钥为空（可能是密钥数据未加载）");
        }

        String myPriv = myPrivateKeys.get(myKeyVersion);
        if (myPriv == null) {
            throw new IllegalStateException("本地私钥缺失：找不到版本 v" + myKeyVersion);
        }
        String receiverPub = peerKeys.get(peerUserId);
        if (receiverPub == null) {
            throw new IllegalStateException("缺少对方公钥");
        }

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
            Log.e(TAG, "encryptForPeer 底层加解密失败", e);
            throw new IllegalStateException("底层加解密算法失败: " + e.getMessage());
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
                    bundle.encryptedPrivateKey, bundle.kdfSalt, bundle.privNonce, bundle.kdfParams, password);

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
        if (client == null || token == null) {
            Log.w(TAG, "changeVersionPassword v" + version + " aborted: client/token null");
            return false;
        }

        E2EApi.E2EKey bundle;
        try {
            bundle = E2EApi.getMyKey(client, token, version);
        } catch (Exception e) {
            Log.e(TAG, "changeVersionPassword v" + version + " fetch bundle failed", e);
            return false;
        }
        if (bundle == null) {
            Log.w(TAG, "changeVersionPassword v" + version + " bundle not found");
            return false;
        }

        String priv;
        try {
            priv = E2EManager.decryptPrivateKey(
                    bundle.encryptedPrivateKey, bundle.kdfSalt,
                    bundle.privNonce, bundle.kdfParams, oldPassword);
        } catch (Exception e) {
            Log.w(TAG, "changeVersionPassword v" + version + " 旧密码解密失败", e);
            return false;
        }

        try {
            E2EManager.EncryptedPrivateKey enc = E2EManager.encryptPrivateKey(priv, newPassword);

            E2EApi.uploadKey(client, token, bundle.publicKey, enc.encrypted,
                    enc.salt, enc.kdfParams, enc.nonce, version);

            myPrivateKeys.put(version, priv);
            notifyChanged();
            return true;
        } catch (Exception e) {
            Log.e(TAG, "changeVersionPassword v" + version + " 重新加密/上传失败", e);
            return false;
        }
    }

    /**
     * 批量修改主密码 (会尝试解开所有历史版本并用新密码重新加密)
     */
    public boolean changePassword(String oldPassword, String newPassword) {
        LingCatClient client = getClient();
        String token = getToken();
        if (client == null || token == null) {
            Log.w(TAG, "changePassword aborted: client/token null");
            return false;
        }

        List<E2EApi.E2EKey> allBundles;
        try {
            allBundles = E2EApi.getAllMyKeys(client, token);
        } catch (Exception e) {
            Log.e(TAG, "changePassword fetch all keys failed", e);
            return false;
        }
        if (allBundles == null || allBundles.isEmpty()) {
            Log.w(TAG, "changePassword: server has no key bundles");
            return false;
        }

        // 以服务端实际存在的最新版本为准，避免 myKeyVersion 异步未初始化时误判
        int maxVersion = 0;
        for (E2EApi.E2EKey b : allBundles) {
            if (b.keyVersion > maxVersion) maxVersion = b.keyVersion;
        }

        List<E2EApi.E2EKey> toUpdate = new ArrayList<>();
        boolean latestDecrypted = false;

        for (E2EApi.E2EKey bundle : allBundles) {
            try {
                String priv = E2EManager.decryptPrivateKey(
                        bundle.encryptedPrivateKey, bundle.kdfSalt,
                        bundle.privNonce, bundle.kdfParams, oldPassword);
                E2EManager.EncryptedPrivateKey enc = E2EManager.encryptPrivateKey(priv, newPassword);

                toUpdate.add(new E2EApi.E2EKey(
                        bundle.publicKey, enc.encrypted, enc.salt,
                        enc.kdfParams, enc.nonce, bundle.keyVersion));

                if (bundle.keyVersion == maxVersion) latestDecrypted = true;
            } catch (Exception e) {
                // 非最新版解密失败：保留原行为，跳过该版本，不阻断主流程
                Log.w(TAG, "changePassword v" + bundle.keyVersion + " 旧密码解密/重加密失败（跳过）", e);
            }
        }

        if (!latestDecrypted) {
            Log.w(TAG, "changePassword aborted: 最新版 v" + maxVersion
                    + " 旧密码解密失败（成功解出版本: 待确认，toUpdate=" + toUpdate.size() + "）");
            return false;
        }

        // 逐个上传；任一失败立即中止并锁定，避免"云端已改一半、内存还开着"的脏状态
        for (E2EApi.E2EKey bundle : toUpdate) {
            try {
                E2EApi.uploadKey(client, token, bundle.publicKey, bundle.encryptedPrivateKey,
                        bundle.kdfSalt, bundle.kdfParams, bundle.privNonce, bundle.keyVersion);
            } catch (Exception e) {
                Log.e(TAG, "changePassword upload v" + bundle.keyVersion + " failed（已中止）", e);
                lock();
                return false;
            }
        }

        // 改完后锁定并要求重新解锁
        lock();
        return true;
    }

    /** 解锁成功后，将私钥包用 Keystore 加密并存入 SharedPrefs */
    private void saveLocalKeys() {
        try {
            org.json.JSONObject obj = new org.json.JSONObject();
            obj.put("pub", myPublicKey);
            obj.put("ver", myKeyVersion);
            org.json.JSONObject keysObj = new org.json.JSONObject();
            for (Map.Entry<Integer, String> e : myPrivateKeys.entrySet()) {
                keysObj.put(String.valueOf(e.getKey()), e.getValue());
            }
            obj.put("keys", keysObj);

            String encrypted = KeyStoreManager.encrypt(obj.toString());
            if (encrypted != null) {
                sp.edit().putString("local_keys_" + getCurrentAccountId(), encrypted).apply();
                Log.d(TAG, "本地私钥已加密保存");
            }
        } catch (Exception e) {
            Log.e(TAG, "saveLocalKeys failed", e);
        }
    }

    /** 尝试从本地加载并解密私钥 */
    /** 获取当前账号的唯一标识 */
    private String getCurrentAccountId() {
        ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
        Account acc = s != null ? AppDataStore.data().getActiveAccount(s.url) : null;
        String id = (s != null ? s.url : "unknown") + "_" + (acc != null ? acc.userId : "unknown");
        Log.d(TAG, "currentAccountId = " + id);
        return id;
    }

    /** 尝试从本地加载并解密私钥 */
    private boolean loadLocalKeys() {
        try {
            String key = "local_keys_" + getCurrentAccountId();
            String encrypted = sp.getString(key, null);
            if (encrypted == null) {
                Log.d(TAG, "loadLocalKeys: 没找到本地缓存 " + key);
                return false;
            }

            String json = KeyStoreManager.decrypt(encrypted);
            if (json == null) {
                Log.e(TAG, "loadLocalKeys: KeyStore 解密失败");
                return false;
            }

            org.json.JSONObject obj = new org.json.JSONObject(json);
            int savedVer = obj.optInt("ver", 0);

            // 如果本地版本和服务端最新版本不一致（例如在其他设备生成过新密钥），则废弃本地缓存
            if (savedVer != myKeyVersion) {
                Log.w(TAG, "loadLocalKeys: 版本不匹配 本地v" + savedVer + " vs 服务端v" + myKeyVersion);
                sp.edit().remove(key).apply();
                return false;
            }

            myPublicKey = obj.getString("pub");
            org.json.JSONObject keysObj = obj.getJSONObject("keys");
            java.util.Iterator<String> iter = keysObj.keys();
            myPrivateKeys.clear();
            while (iter.hasNext()) {
                String k = iter.next();
                myPrivateKeys.put(Integer.parseInt(k), keysObj.getString(k));
            }
            Log.d(TAG, "loadLocalKeys: 成功恢复本地私钥，版本 v" + savedVer);
            return !myPrivateKeys.isEmpty();
        } catch (Exception e) {
            Log.e(TAG, "loadLocalKeys failed", e);
            return false;
        }
    }
}