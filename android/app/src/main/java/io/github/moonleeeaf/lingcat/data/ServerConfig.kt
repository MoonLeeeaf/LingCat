package io.github.moonleeeaf.lingcat.data

import org.json.JSONObject

data class ServerConfig(
    // 用户最初输入的地址
    val rawUrl: String,
    // 实际使用的 HTTP 地址
    val httpUrl: String,
    // 实际使用的 WS 地址
    val wsUrl: String,
    // 服务器 Ed25519 公钥的 Hex 字符串
    val publicKeyHex: String,
    // 服务器名称（来自 config.json 的 site_title 等）
    val siteTitle: String = "灵猫"
) {
    // 将对象转为 JSON 字符串存入本地
    fun toJsonString(): String {
        return JSONObject().apply {
            put("rawUrl", rawUrl)
            put("httpUrl", httpUrl)
            put("wsUrl", wsUrl)
            put("publicKeyHex", publicKeyHex)
            put("siteTitle", siteTitle)
        }.toString()
    }

    companion object {
        // 从本地读取的 JSON 转回对象
        fun fromJson(jsonStr: String): ServerConfig? {
            return try {
                val obj = JSONObject(jsonStr)
                ServerConfig(
                    rawUrl = obj.getString("rawUrl"),
                    httpUrl = obj.getString("httpUrl"),
                    wsUrl = obj.getString("wsUrl"),
                    publicKeyHex = obj.getString("publicKeyHex"),
                    siteTitle = obj.optString("siteTitle", "LingCat")
                )
            } catch (e: Exception) {
                null
            }
        }
    }
}