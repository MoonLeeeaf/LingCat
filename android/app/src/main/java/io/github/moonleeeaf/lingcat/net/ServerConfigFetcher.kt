package io.github.moonleeeaf.lingcat.net

import io.github.moonleeeaf.lingcat.data.ServerConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.security.cert.X509Certificate
import java.util.concurrent.TimeUnit
import javax.net.ssl.SSLContext
import javax.net.ssl.X509TrustManager

object ServerConfigFetcher {

    // ★ 新增：信任所有证书的 TrustManager
    private val trustAllCerts = arrayOf<X509TrustManager>(object : X509TrustManager {
        override fun checkClientTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
        override fun checkServerTrusted(chain: Array<out X509Certificate>?, authType: String?) {}
        override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
    })

    // ★ 修改：构建 OkHttpClient 时应用该 TrustManager
    private val httpClient: OkHttpClient = try {
        val sslContext = SSLContext.getInstance("TLS")
        sslContext.init(null, trustAllCerts, java.security.SecureRandom())
        OkHttpClient.Builder()
            .sslSocketFactory(sslContext.socketFactory, trustAllCerts[0])
            .hostnameVerifier { _, _ -> true } // 忽略域名校验
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .build()
    } catch (e: Exception) {
        OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(10, TimeUnit.SECONDS)
            .build()
    }

    suspend fun fetch(rawInput: String): ServerConfig = withContext(Dispatchers.IO) {
        // 1. 规范化地址
        var cleanUrl = rawInput.trim().removeSuffix("/")

        // ★ 自动把 ws/wss 转为 http/https 以便拉取 config.json
        if (cleanUrl.startsWith("wss://", ignoreCase = true)) {
            cleanUrl = cleanUrl.replaceFirst("wss://", "https://", ignoreCase = true)
        } else if (cleanUrl.startsWith("ws://", ignoreCase = true)) {
            cleanUrl = cleanUrl.replaceFirst("ws://", "http://", ignoreCase = true)
        }

        // 如果没写协议，默认加上 http://（考虑到局域网开发比较多）
        if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
            cleanUrl = "http://$cleanUrl"
        }

        val configUrl = "$cleanUrl/config.json"
        val request = Request.Builder().url(configUrl).build()

        val response = httpClient.newCall(request).execute()
        if (!response.isSuccessful) {
            throw Exception("获取配置失败 (HTTP ${response.code})")
        }

        val body = response.body?.string() ?: throw Exception("配置文件为空")
        // 3. 解析 JSON
        val json = JSONObject(body)

        val siteTitle = json.optString("site_title", "LingCat")

        // 获取 HTTP 地址
        var httpUrl = json.optString("http_url").ifEmpty { cleanUrl }

        // 获取 WS 地址：如果服务器没给，就根据 HTTP 地址自动推导
        var wsUrl = json.optString("ws_url").ifEmpty {
            json.optString("wsUrl").ifEmpty {
                if (httpUrl.startsWith("https://")) {
                    httpUrl.replaceFirst("https://", "wss://")
                } else {
                    httpUrl.replaceFirst("http://", "ws://")
                }
            }
        }

        // 获取公钥：兼容新旧字段名
        val publicKeyHex = json.optString("server_public_key").ifEmpty {
            json.optString("public_key")
        }

        if (publicKeyHex.isEmpty()) {
            throw Exception("配置文件缺少 public_key，返回内容: $body")
        }

        // 4. 返回构建好的实体
        ServerConfig(
            rawUrl = rawInput,
            httpUrl = httpUrl,
            wsUrl = wsUrl,
            publicKeyHex = publicKeyHex,
            siteTitle = siteTitle
        )
    }
}