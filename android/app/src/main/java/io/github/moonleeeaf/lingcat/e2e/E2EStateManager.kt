package io.github.moonleeeaf.lingcat.e2e

import android.content.Context
import android.util.Log
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import lingcat.client_protocol.E2EApi
import org.json.JSONArray
import org.json.JSONObject

object E2EStateManager {
    private const val TAG = "E2EStateManager"
    private const val PREFS_VERIFY = "lingcat_e2e_verify"
    private const val PREFS_PUBS = "lingcat_e2e_pubs"

    enum class Status { DISABLED, LOCKED, UNLOCKED }

    private val _status = MutableStateFlow(Status.DISABLED)
    val status: StateFlow<Status> = _status.asStateFlow()

    // 缓存当前登录用户的私钥 (keyVersion -> privateKey)
    private val myPrivateKeys = mutableMapOf<Int, String>()
    private var myPublicKey: String? = null
    private var myKeyVersion: Int = 1

    // 缓存对方的公钥 (userId -> publicKey)
    private val peerKeys = mutableMapOf<String, String>()

    // 记录每个 peer 的验证状态: "verified" | "unverified" | "mismatch"
    private val _peerVerifyStatus = MutableStateFlow<Map<String, String>>(emptyMap())
    val peerVerifyStatus: StateFlow<Map<String, String>> = _peerVerifyStatus.asStateFlow()

    private lateinit var appContext: Context

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    private const val PREFS_LOCAL_KEYS = "lingcat_e2e_local_keys"

    // 获取当前账号的隔离 Key（防止多账号串号）
    private fun getCurrentAccountId(): String {
        return LingCatClientManager.currentUserId ?: "unknown"
    }

    // ★ 1. 保存加密后的私钥到 SharedPreferences
    private fun saveLocalKeys() {
        if (!::appContext.isInitialized || myPublicKey == null) return
        try {
            val obj = JSONObject().apply {
                put("pub", myPublicKey)
                put("ver", myKeyVersion)
                val keysObj = JSONObject()
                for ((ver, priv) in myPrivateKeys) {
                    keysObj.put(ver.toString(), priv)
                }
                put("keys", keysObj)
            }

            val encrypted = KeyStoreManager.encrypt(obj.toString())
            if (encrypted != null) {
                val sp = appContext.getSharedPreferences(PREFS_LOCAL_KEYS, Context.MODE_PRIVATE)
                sp.edit().putString(getCurrentAccountId(), encrypted).apply()
                Log.d(TAG, "本地私钥已加密保存")
            }
        } catch (e: Exception) {
            Log.e(TAG, "saveLocalKeys failed", e)
        }
    }

    // ★ 2. 从 SharedPreferences 读取并解密私钥
    private fun loadLocalKeys(): Boolean {
        if (!::appContext.isInitialized) return false
        try {
            val sp = appContext.getSharedPreferences(PREFS_LOCAL_KEYS, Context.MODE_PRIVATE)
            val encrypted = sp.getString(getCurrentAccountId(), null) ?: return false

            val json = KeyStoreManager.decrypt(encrypted) ?: return false
            val obj = JSONObject(json)
            val savedVer = obj.optInt("ver", 0)

            // 对比版本号：如果本地存的是旧的，直接作废
            if (savedVer != myKeyVersion) {
                sp.edit().remove(getCurrentAccountId()).apply()
                return false
            }

            myPublicKey = obj.getString("pub")
            val keysObj = obj.getJSONObject("keys")
            myPrivateKeys.clear()
            val iterator = keysObj.keys()
            while (iterator.hasNext()) {
                val k = iterator.next()
                myPrivateKeys[k.toInt()] = keysObj.getString(k)
            }
            return myPrivateKeys.isNotEmpty()
        } catch (e: Exception) {
            Log.e(TAG, "loadLocalKeys failed", e)
            return false
        }
    }


    /**
     * 初始化本地验证状态（在 Application 中调用）
     */
    fun initVerifyState() {
        val spVerify = appContext.getSharedPreferences(PREFS_VERIFY, Context.MODE_PRIVATE)
        val spPubs = appContext.getSharedPreferences(PREFS_PUBS, Context.MODE_PRIVATE)

        val knownPubs = spPubs.all.mapValues { it.value as? String ?: "" }
        val newVerifyMap = mutableMapOf<String, String>()

        for ((uid, status) in spVerify.all) {
            if (status == "verified") newVerifyMap[uid] = "verified"
        }
        _peerVerifyStatus.value = newVerifyMap
    }

    /**
     * 初始化拉取自身状态
     */
    suspend fun loadKeyState() = withContext(Dispatchers.IO) {
        val client = LingCatClientManager.currentClient ?: return@withContext
        val token = LingCatClientManager.currentToken ?: return@withContext

        try {
            val bundle = E2EApi.getMyKey(client, token)
            if (bundle != null) {
                myPublicKey = bundle.publicKey
                myKeyVersion = bundle.keyVersion

                // 拉取成功后，尝试从本地加载，免去重新输入密码
                if (loadLocalKeys()) {
                    _status.value = Status.UNLOCKED
                    Log.d(TAG, "免密解锁成功，已从本地加载私钥")
                } else {
                    _status.value = Status.LOCKED
                }
            } else {
                _status.value = Status.DISABLED
            }
        } catch (e: Exception) {
            Log.e(TAG, "loadKeyState failed", e)
        }
    }

    /**
     * 首次生成 E2E 密钥
     */
    suspend fun setupNewKey(password: String): Boolean = withContext(Dispatchers.IO) {
        val client = LingCatClientManager.currentClient ?: return@withContext false
        val token = LingCatClientManager.currentToken ?: return@withContext false

        try {
            val pair = E2EManager.generateIdentityKeyPair()
            val enc = E2EManager.encryptPrivateKey(pair.privateKey, password)

            E2EApi.uploadKey(client, token, pair.publicKey, enc.encrypted, enc.salt, enc.kdfParams, enc.nonce, 1)

            myPrivateKeys[1] = pair.privateKey
            myPublicKey = pair.publicKey
            myKeyVersion = 1
            _status.value = Status.UNLOCKED
            saveLocalKeys()
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "setupNewKey failed", e)
            return@withContext false
        }
    }

    /**
     * 生成新版本密钥
     */
    suspend fun generateNewKey(password: String, newVersion: Int): Boolean = withContext(Dispatchers.IO) {
        val client = LingCatClientManager.currentClient ?: return@withContext false
        val token = LingCatClientManager.currentToken ?: return@withContext false

        try {
            val pair = E2EManager.generateIdentityKeyPair()
            val enc = E2EManager.encryptPrivateKey(pair.privateKey, password)

            E2EApi.uploadKey(client, token, pair.publicKey, enc.encrypted, enc.salt, enc.kdfParams, enc.nonce, newVersion)

            myPrivateKeys[newVersion] = pair.privateKey
            myPublicKey = pair.publicKey
            myKeyVersion = newVersion
            _status.value = Status.UNLOCKED
            saveLocalKeys()
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "generateNewKey failed", e)
            return@withContext false
        }
    }

    /**
     * 解锁：拉取全量历史密钥并解密
     */
    suspend fun unlock(password: String): Boolean = withContext(Dispatchers.IO) {
        val client = LingCatClientManager.currentClient ?: return@withContext false
        val token = LingCatClientManager.currentToken ?: return@withContext false

        try {
            val allBundles = E2EApi.getAllMyKeys(client, token)
            if (allBundles.isNullOrEmpty()) return@withContext false

            val maxVersion = allBundles.maxOfOrNull { it.keyVersion } ?: 1
            var decryptedLatest = false
            val newKeys = mutableMapOf<Int, String>()

            for (bundle in allBundles) {
                try {
                    val priv = E2EManager.decryptPrivateKey(
                        bundle.encryptedPrivateKey, bundle.kdfSalt, bundle.privNonce, bundle.kdfParams, password
                    )
                    newKeys[bundle.keyVersion] = priv
                    if (bundle.keyVersion == maxVersion) {
                        decryptedLatest = true
                        myPublicKey = bundle.publicKey
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "v${bundle.keyVersion} 解密失败")
                }
            }

            if (decryptedLatest) {
                myPrivateKeys.clear()
                myPrivateKeys.putAll(newKeys)
                myKeyVersion = maxVersion
                _status.value = Status.UNLOCKED

                saveLocalKeys() // ★ 核心：保存到本地
                return@withContext true
            }
            return@withContext false
        } catch (e: Exception) {
            Log.e(TAG, "unlock failed", e)
        }
        return@withContext false
    }

    fun lock() {
        myPrivateKeys.clear()
        _status.value = Status.LOCKED
    }

    /**
     * 修改主密码：原子化操作
     */
    suspend fun changePassword(oldPassword: String, newPassword: String): Boolean = withContext(Dispatchers.IO) {
        val client = LingCatClientManager.currentClient ?: return@withContext false
        val token = LingCatClientManager.currentToken ?: return@withContext false

        try {
            val allBundles = E2EApi.getAllMyKeys(client, token)
            if (allBundles.isNullOrEmpty()) return@withContext false

            val newEncryptedBundles = mutableListOf<E2EApi.E2EKey>()

            // 1. 先在内存中全部解密并重加密
            for (bundle in allBundles) {
                try {
                    val privBase64 = E2EManager.decryptPrivateKey(
                        bundle.encryptedPrivateKey, bundle.kdfSalt, bundle.privNonce, bundle.kdfParams, oldPassword
                    )
                    val enc = E2EManager.encryptPrivateKey(privBase64, newPassword)

                    newEncryptedBundles.add(E2EApi.E2EKey(
                        bundle.publicKey, enc.encrypted, enc.salt, enc.kdfParams, enc.nonce, bundle.keyVersion
                    ))
                } catch (e: Exception) {
                    if (bundle.keyVersion == myKeyVersion) throw Exception("旧密码错误，终止修改")
                    Log.w(TAG, "无法用旧密码解密 v${bundle.keyVersion}，跳过")
                }
            }

            // 2. 批量上传
            for (bundle in newEncryptedBundles) {
                E2EApi.uploadKey(client, token, bundle.publicKey, bundle.encryptedPrivateKey, bundle.kdfSalt, bundle.kdfParams, bundle.privNonce, bundle.keyVersion)
            }

            // 3. 修改完毕，自动锁定，让用户用新密码重新解
            lock()
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "changePassword failed", e)
            return@withContext false
        }
    }

    /**
     * 修改特定版本密码
     */
    suspend fun changeVersionPassword(version: Int, oldPassword: String, newPassword: String): Boolean = withContext(Dispatchers.IO) {
        val client = LingCatClientManager.currentClient ?: return@withContext false
        val token = LingCatClientManager.currentToken ?: return@withContext false

        try {
            val bundle = E2EApi.getMyKey(client, token, version) ?: return@withContext false

            val privBase64 = E2EManager.decryptPrivateKey(
                bundle.encryptedPrivateKey, bundle.kdfSalt, bundle.privNonce, bundle.kdfParams, oldPassword
            )
            val enc = E2EManager.encryptPrivateKey(privBase64, newPassword)

            E2EApi.uploadKey(client, token, bundle.publicKey, enc.encrypted, enc.salt, enc.kdfParams, enc.nonce, version)

            myPrivateKeys[version] = privBase64
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "changeVersionPassword failed", e)
            return@withContext false
        }
    }

    /**
     * 拉取对方公钥
     */
    suspend fun fetchPeerKey(userId: String, force: Boolean = false) = withContext(Dispatchers.IO) {
        // 如果不强制刷新，且本地有缓存，才直接返回
        if (!force && peerKeys.containsKey(userId)) return@withContext

        val client = LingCatClientManager.currentClient ?: return@withContext
        val token = LingCatClientManager.currentToken ?: return@withContext

        try {
            val res = E2EApi.getPublicKeys(client, token, listOf(userId))
            res?.firstOrNull()?.let { item ->
                val newPubKey = item.publicKey
                peerKeys[userId] = newPubKey

                val spPubs = appContext.getSharedPreferences(PREFS_PUBS, Context.MODE_PRIVATE)
                val knownPub = spPubs.getString(userId, null)
                val newVerifyMap = _peerVerifyStatus.value.toMutableMap()

                if (knownPub != null && knownPub != newPubKey) {
                    // 发现对方公钥变更
                    newVerifyMap[userId] = "mismatch"
                } else if (!newVerifyMap.containsKey(userId)) {
                    newVerifyMap[userId] = "unverified"
                }
                _peerVerifyStatus.value = newVerifyMap
                spPubs.edit().putString(userId, newPubKey).apply()
            }
        } catch (e: Exception) {
            Log.e(TAG, "fetch peer key failed", e)
        }
    }

    fun setPeerVerified(userId: String) {
        val newMap = _peerVerifyStatus.value.toMutableMap()
        newMap[userId] = "verified"
        _peerVerifyStatus.value = newMap

        val spVerify = appContext.getSharedPreferences(PREFS_VERIFY, Context.MODE_PRIVATE)
        spVerify.edit().putString(userId, "verified").apply()
    }

    fun getMyPublicKey(): String? = myPublicKey
    fun getPeerPublicKey(userId: String): String? = peerKeys[userId]
    fun getMyKeyVersion(): Int = myKeyVersion
    fun getMyPrivateKeys(): Map<Int, String> = myPrivateKeys
    fun getPeerVerifyStatus(userId: String): String = _peerVerifyStatus.value[userId] ?: "unverified"

    /**
     * 加解密消息 (沿用之前代码，这里只写调用)
     */
    fun encryptForPeer(plaintextJson: String, peerUserId: String): String? {
        if (_status.value != Status.UNLOCKED) return null
        val myPriv = myPrivateKeys[myKeyVersion] ?: return null
        val myPub = myPublicKey ?: return null
        val peerPub = peerKeys[peerUserId] ?: return null

        return try {
            val sharedKey = E2EManager.deriveSharedKey(myPriv, peerPub)
            val msg = E2EManager.encryptMessage(plaintextJson, sharedKey)
            JSONObject().apply {
                put("v", 1)
                put("keyVersion", myKeyVersion)
                put("senderPub", myPub)
                put("receiverPub", peerPub)
                put("nonce", msg.nonce)
                put("ciphertext", msg.ciphertext)
            }.toString()
        } catch (e: Exception) { null }
    }

    fun decryptFromPeer(entityData: String, senderUserId: String): String? {
        if (_status.value != Status.UNLOCKED) return null
        try {
            val payload = JSONObject(entityData)
            val targetPub = if (senderUserId == LingCatClientManager.currentUserId) payload.getString("receiverPub") else payload.getString("senderPub")
            val nonce = payload.getString("nonce")
            val ciphertext = payload.getString("ciphertext")
            val keyVersion = payload.optInt("keyVersion", 1)

            for (priv in myPrivateKeys.values) {
                try {
                    val sharedKey = E2EManager.deriveSharedKey(priv, targetPub)
                    return E2EManager.decryptMessage(ciphertext, nonce, sharedKey)
                } catch (e: Exception) { /* 尝试下一个私钥 */ }
            }

            return JSONObject().apply {
                put("text", "🔒 [使用了旧密钥 ($keyVersion), 但无法解密此消息]")
                put("entities", JSONArray())
                put("needVersion", keyVersion)
            }.toString()
        } catch (e: Exception) { return null }
    }

    /**
     * 解锁特定版本的历史密钥
     */
    suspend fun unlockSpecificVersion(version: Int, password: String): Boolean = withContext(Dispatchers.IO) {
        val client = LingCatClientManager.currentClient ?: return@withContext false
        val token = LingCatClientManager.currentToken ?: return@withContext false

        try {
            val bundle = E2EApi.getMyKey(client, token, version) ?: return@withContext false
            val priv = E2EManager.decryptPrivateKey(
                bundle.encryptedPrivateKey, bundle.kdfSalt, bundle.privNonce, bundle.kdfParams, password
            )
            myPrivateKeys[version] = priv
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "unlockSpecificVersion failed", e)
            return@withContext false
        }
    }
}