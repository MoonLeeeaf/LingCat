package io.github.moonleeeaf.lingcat.data

import android.content.Context
import android.util.Log
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.client_protocol.UserApi

object RemarksCache {
    private const val TAG = "RemarksCache"
    private const val PREFS_NAME = "lingcat_remarks"
    private lateinit var appContext: Context

    // 内存缓存，方便 UI 监听
    private val _remarks = MutableStateFlow<Map<String, String>>(emptyMap())
    val remarks: StateFlow<Map<String, String>> = _remarks.asStateFlow()

    fun init(context: Context) {
        appContext = context.applicationContext
        loadFromLocal()
    }

    /**
     * 从本地 SharedPreferences 初始化内存缓存
     */
    private fun loadFromLocal() {
        val sp = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val map = sp.all.mapValues { it.value as? String ?: "" }
        _remarks.value = map
    }

    /**
     * 从服务端拉取所有备注并更新本地缓存
     */
    suspend fun fetchFromServer() = withContext(Dispatchers.IO) {
        val client = LingCatClientManager.currentClient ?: return@withContext
        val token = LingCatClientManager.currentToken ?: return@withContext

        try {
            val list = UserApi.getMyUserRemarks(client, token)
            val map = list.associate { it.userId to it.remark }

            // 更新本地 SharedPreferences
            val sp = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            sp.edit().clear().apply() // 先清空旧的
            val editor = sp.edit()
            for ((k, v) in map) {
                editor.putString(k, v)
            }
            editor.apply()

            // 更新内存
            _remarks.value = map
            Log.d(TAG, "Remarks synced from server: ${map.size} items")
        } catch (e: Exception) {
            Log.e(TAG, "fetch remarks failed", e)
        }
    }

    /**
     * 获取备注（本地内存读取，极快）
     */
    fun getRemark(userId: String): String? {
        return _remarks.value[userId]
    }

    /**
     * 设置备注（先本地乐观更新，后发网络请求）
     */
    fun setRemark(userId: String, remark: String) {
        val currentMap = _remarks.value.toMutableMap()
        if (remark.isBlank()) {
            currentMap.remove(userId)
        } else {
            currentMap[userId] = remark
        }
        _remarks.value = currentMap

        // 本地保存
        val sp = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        if (remark.isBlank()) sp.edit().remove(userId).apply()
        else sp.edit().putString(userId, remark).apply()

        // 异步同步到服务端
        kotlinx.coroutines.CoroutineScope(Dispatchers.IO).launch {
            val client = LingCatClientManager.currentClient ?: return@launch
            val token = LingCatClientManager.currentToken ?: return@launch
            try {
                UserApi.setUserRemark(client, token, userId, remark)
                Log.d(TAG, "Remark synced to server for $userId")
            } catch (e: Exception) {
                Log.e(TAG, "set remark failed", e)
            }
        }
    }
}