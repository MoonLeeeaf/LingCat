package io.github.moonleeeaf.lingcat.data

import android.content.Context
import org.json.JSONObject

object DraftCache {
    private const val PREFS_NAME = "lingcat_drafts"
    private lateinit var appContext: Context

    // ★ 新增：完整草稿数据类
    data class DraftData(val text: String, val editingMsgId: Int? = null)

    fun init(context: Context) {
        appContext = context.applicationContext
    }

    fun saveDraft(chatId: String, text: String, editingMsgId: Int? = null) {
        if (!::appContext.isInitialized) return
        val sp = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        // 如果文本为空，且没有在编辑，就清空草稿
        if (text.isBlank() && editingMsgId == null) {
            sp.edit().remove(chatId).apply()
        } else {
            val json = JSONObject().apply {
                put("text", text)
                if (editingMsgId != null) {
                    put("editingId", editingMsgId)
                }
            }
            sp.edit().putString(chatId, json.toString()).apply()
        }
    }

    fun getDraft(chatId: String): DraftData? {
        if (!::appContext.isInitialized) return null
        val sp = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val str = sp.getString(chatId, null) ?: return null
        return try {
            val json = JSONObject(str)
            DraftData(
                text = json.optString("text", ""),
                editingMsgId = if (json.has("editingId")) json.getInt("editingId") else null
            )
        } catch (e: Exception) {
            null
        }
    }

    fun clearDraft(chatId: String) {
        if (!::appContext.isInitialized) return
        val sp = appContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        sp.edit().remove(chatId).apply()
    }
}