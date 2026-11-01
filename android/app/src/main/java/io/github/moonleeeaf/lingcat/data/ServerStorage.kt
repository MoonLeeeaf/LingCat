package io.github.moonleeeaf.lingcat.data

import android.content.Context
import org.json.JSONArray

object ServerStorage {
    private const val PREFS_NAME = "lingcat_servers"
    private const val KEY_SERVERS = "saved_servers"

    private fun getSp(context: Context) = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    /** 获取保存的所有服务器 */
    fun getAll(context: Context): List<ServerConfig> {
        val sp = getSp(context)
        val jsonStr = sp.getString(KEY_SERVERS, "[]") ?: "[]"
        val list = mutableListOf<ServerConfig>()
        try {
            val array = JSONArray(jsonStr)
            for (i in 0 until array.length()) {
                ServerConfig.fromJson(array.getString(i))?.let { list.add(it) }
            }
        } catch (e: Exception) {}
        return list
    }

    /** 保存或更新一个服务器（去重） */
    fun save(context: Context, config: ServerConfig) {
        val list = getAll(context).toMutableList()
        // 根据 wsUrl 或 rawUrl 去重
        list.removeAll { it.wsUrl == config.wsUrl }
        list.add(config)

        val array = JSONArray()
        list.forEach { array.put(it.toJsonString()) }
        getSp(context).edit().putString(KEY_SERVERS, array.toString()).apply()
    }

    /** 删除一个服务器 */
    fun delete(context: Context, wsUrl: String) {
        val list = getAll(context).toMutableList()
        list.removeAll { it.wsUrl == wsUrl }
        val array = JSONArray()
        list.forEach { array.put(it.toJsonString()) }
        getSp(context).edit().putString(KEY_SERVERS, array.toString()).apply()
    }
}