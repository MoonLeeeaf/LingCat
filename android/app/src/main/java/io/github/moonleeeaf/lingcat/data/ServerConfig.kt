package io.github.moonleeeaf.lingcat.data

import org.json.JSONObject

data class ServerConfig(
    val rawUrl: String,
    val httpUrl: String,
    val wsUrl: String,
    val publicKeyHex: String,
    val siteTitle: String = "灵猫",
    // ★ 新增：服务端下发的 OAuth 提供者列表 (JSON 字符串)
    val oauthProvidersJson: String = "[]"
) {
    fun toJsonString(): String {
        return JSONObject().apply {
            put("rawUrl", rawUrl)
            put("httpUrl", httpUrl)
            put("wsUrl", wsUrl)
            put("publicKeyHex", publicKeyHex)
            put("siteTitle", siteTitle)
            put("oauthProvidersJson", oauthProvidersJson) // ★
        }.toString()
    }

    companion object {
        fun fromJson(jsonStr: String): ServerConfig? {
            return try {
                val obj = JSONObject(jsonStr)
                ServerConfig(
                    rawUrl = obj.getString("rawUrl"),
                    httpUrl = obj.getString("httpUrl"),
                    wsUrl = obj.getString("wsUrl"),
                    publicKeyHex = obj.getString("publicKeyHex"),
                    siteTitle = obj.optString("siteTitle", "灵猫"),
                    oauthProvidersJson = obj.optString("oauthProvidersJson", "[]") // ★
                )
            } catch (e: Exception) {
                null
            }
        }
    }
}