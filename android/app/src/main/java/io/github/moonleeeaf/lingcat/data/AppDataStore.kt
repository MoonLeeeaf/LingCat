package io.github.moonleeeaf.lingcat.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import org.json.JSONObject

private val Context.dataStore: DataStore<Preferences>
        by preferencesDataStore(name = "lingcat_auth")

/**
 * 统一持久化入口。
 *
 * 用法：
 *   1. Application.onCreate() 里调 AppDataStore.init(this)
 *   2. 读：AppDataStore.data()
 *   3. 写：AppDataStore.upsertServer(...) / addAccount(...) / ...
 *
 * 读写模型：内存缓存 + DataStore 异步持久化。
 * 读走内存（同步、零开销）；写更新内存 + fire-and-forget 到 DataStore。
 */
object AppDataStore {
    private val KEY = stringPreferencesKey("app_data")
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    @Volatile private var memory: AppData = AppData()

    @Volatile private var store: DataStore<Preferences>? = null

    @Volatile private var initialized = false

    @JvmStatic
    fun init(context: Context) {
        if (initialized) return
        synchronized(this) {
            if (initialized) return
            val s = context.applicationContext.dataStore
            store = s
            memory = runBlocking {
                try {
                    val prefs = s.data.first()
                    val json = prefs[KEY]
                    if (json.isNullOrEmpty()) AppData()
                    else AppData.fromJson(JSONObject(json))
                } catch (e: Exception) {
                    AppData()
                }
            }
            initialized = true
        }
    }

    private fun persistAsync() {
        val s = store ?: return
        val json = memory.toJson().toString()
        scope.launch {
            try {
                s.edit { it[KEY] = json }
            } catch (_: Exception) { /* 持久化失败不阻断业务 */ }
        }
    }

    /** 读：拿的是内存快照（引用共享，勿直接改） */
    @JvmStatic
    fun data(): AppData = memory

    // ============================================================
    //                      服务器
    // ============================================================

    /** 新增或更新服务器。若 url 已存在则合并字段（publicKey 不覆盖 null） */
    @JvmStatic
    fun upsertServer(cfg: ServerConfig) {
        synchronized(this) {
            val existing = memory.findServer(cfg.url)
            if (existing == null) {
                memory.servers.add(cfg)
            } else {
                if (cfg.publicKey != null) existing.publicKey = cfg.publicKey
                if (cfg.siteTitle != null) existing.siteTitle = cfg.siteTitle
                if (cfg.livekitEnabled != null) existing.livekitEnabled = cfg.livekitEnabled
                if (cfg.oauthProvidersJson != null) existing.oauthProvidersJson = cfg.oauthProvidersJson
            }
            persistAsync()
        }
    }

    @JvmStatic
    fun removeServer(url: String) {
        synchronized(this) {
            memory.servers.removeAll { it.url == url }
            memory.accountsByServer.remove(url)
            memory.activeAccountByServer.remove(url)
            if (memory.currentServerUrl == url) memory.currentServerUrl = null
            persistAsync()
        }
    }


    @JvmStatic
    fun setCurrentServer(url: String?) {
        synchronized(this) {
            memory.currentServerUrl = url
            persistAsync()
        }
    }

    // ============================================================
    //                      账号
    // ============================================================


    @JvmStatic
    fun clearActiveAccount(serverUrl: String) {
        synchronized(this) {
            memory.activeAccountByServer.remove(serverUrl)
            persistAsync()
        }
    }

    @JvmStatic
    fun addAccount(serverUrl: String, account: Account) {
        synchronized(this) {
            val list = memory.accountsByServer
                .getOrPut(serverUrl) { mutableListOf() }
            // 已存在则更新 token / 资料
            val idx = list.indexOfFirst { it.userId == account.userId }
            if (idx >= 0) {
                list[idx].accessToken = account.accessToken
                if (account.nickname != null) list[idx].nickname = account.nickname
                if (account.username != null) list[idx].username = account.username
                if (account.avatarFileHash != null) list[idx].avatarFileHash = account.avatarFileHash
                account.serverUrl = serverUrl
            } else {
                list.add(account)
            }
            // 首个账号自动设为活跃
            if (memory.activeAccountByServer[serverUrl] == null) {
                memory.activeAccountByServer[serverUrl] = account.userId
            }
            persistAsync()
        }
    }

    @JvmStatic
    fun removeAccount(serverUrl: String, userId: String) {
        synchronized(this) {
            val list = memory.accountsByServer[serverUrl]
            list?.removeAll { it.userId == userId }
            if (memory.activeAccountByServer[serverUrl] == userId) {
                memory.activeAccountByServer[serverUrl] = list?.firstOrNull()?.userId
            }
            persistAsync()
        }
    }

    @JvmStatic
    fun setActiveAccount(serverUrl: String, userId: String) {
        synchronized(this) {
            memory.activeAccountByServer[serverUrl] = userId
            persistAsync()
        }
    }

    /** 更新某个已存在账号的 accessToken（比如重新登录后） */
    @JvmStatic
    fun updateAccessToken(serverUrl: String, userId: String, newToken: String) {
        synchronized(this) {
            val acc = memory.findAccount(serverUrl, userId) ?: return
            acc.accessToken = newToken
            persistAsync()
        }
    }
}