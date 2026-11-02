package io.github.moonleeeaf.lingcat.data

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

data class AccountInfo(
    val username: String,
    val token: String,
    val userId: String,
    val serverWsUrl: String
) {
    fun toJson(): String = JSONObject().apply {
        put("username", username)
        put("token", token)
        put("userId", userId)
        put("serverWsUrl", serverWsUrl)
    }.toString()

    companion object {
        fun fromJson(jsonStr: String): AccountInfo? = try {
            val obj = JSONObject(jsonStr)
            AccountInfo(
                obj.getString("username"),
                obj.getString("token"),
                obj.getString("userId"),
                obj.getString("serverWsUrl")
            )
        } catch (e: Exception) { null }
    }
}

object AuthStorage {
    private const val PREFS_NAME = "lingcat_auth"
    private const val KEY_ACCOUNTS = "saved_accounts"
    private const val KEY_ACTIVE_ACCOUNT = "active_account" // ★ 新增：记录当前活跃账号

    private fun getSp(context: Context) = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    /** 获取所有登录过的账号 */
    fun getAllAccounts(context: Context): List<AccountInfo> {
        val sp = getSp(context)
        val jsonStr = sp.getString(KEY_ACCOUNTS, "[]") ?: "[]"
        val list = mutableListOf<AccountInfo>()
        try {
            val array = JSONArray(jsonStr)
            for (i in 0 until array.length()) {
                AccountInfo.fromJson(array.getString(i))?.let { list.add(it) }
            }
        } catch (e: Exception) {}
        return list
    }

    /** 获取指定服务器下的历史账号 */
    fun getAccountsByServer(context: Context, wsUrl: String): List<AccountInfo> {
        return getAllAccounts(context).filter { it.serverWsUrl == wsUrl }
    }

    /** 保存或更新账号（去重），并将它设为活跃账号 */
    fun saveAccount(context: Context, account: AccountInfo) {
        val list = getAllAccounts(context).toMutableList()
        // 移除同服务器下的同名账号，更新为最新的 Token
        list.removeAll { it.serverWsUrl == account.serverWsUrl && it.username == account.username }
        list.add(account)

        val array = JSONArray()
        list.forEach { array.put(it.toJson()) }

        // ★ 记录当前活跃账号的唯一键 (serverWsUrl + "_" + username)
        val activeKey = "${account.serverWsUrl}_${account.username}"
        getSp(context).edit()
            .putString(KEY_ACCOUNTS, array.toString())
            .putString(KEY_ACTIVE_ACCOUNT, activeKey)
            .apply()
    }

    /** ★ 切换账号时，显式标记谁是活跃账号 */
    fun setActiveAccount(context: Context, account: AccountInfo) {
        val activeKey = "${account.serverWsUrl}_${account.username}"
        getSp(context).edit().putString(KEY_ACTIVE_ACCOUNT, activeKey).apply()
    }

    /** 获取最近一次真正登录/切换的账号 */
    fun getLastAccount(context: Context): AccountInfo? {
        val sp = getSp(context)
        val activeKey = sp.getString(KEY_ACTIVE_ACCOUNT, null)
        val all = getAllAccounts(context)

        if (activeKey != null) {
            // 根据唯一标识去找
            return all.find { "${it.serverWsUrl}_${it.username}" == activeKey }
        }
        // 如果以前的老版本没存 activeKey，那只能兜底取最后一个
        return all.lastOrNull()
    }

    fun clear(context: Context) {
        getSp(context).edit().clear().apply()
    }

    fun removeAccount(context: Context, targetAccount: AccountInfo) {
        val list = getAllAccounts(context).toMutableList()
        list.removeAll {
            it.serverWsUrl == targetAccount.serverWsUrl && it.username == targetAccount.username
        }

        val array = JSONArray()
        list.forEach { array.put(it.toJson()) }
        getSp(context).edit().putString(KEY_ACCOUNTS, array.toString()).apply()
    }
}