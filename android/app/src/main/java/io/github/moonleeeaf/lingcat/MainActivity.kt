package io.github.moonleeeaf.lingcat

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.material3.windowsizeclass.ExperimentalMaterial3WindowSizeClassApi
import androidx.compose.material3.windowsizeclass.calculateWindowSizeClass
import androidx.lifecycle.lifecycleScope
import io.github.moonleeeaf.lingcat.data.AccountInfo
import io.github.moonleeeaf.lingcat.data.AuthStorage
import io.github.moonleeeaf.lingcat.data.ServerStorage
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.LingCatApp
import io.github.moonleeeaf.lingcat.ui.theme.LingCatTheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.client_protocol.OAuthApi
import lingcat.client_protocol.UserApi

class MainActivity : ComponentActivity() {

    // 传递聊天深链
    private val deepLinkChatId = MutableSharedFlow<String>(extraBufferCapacity = 1)
    // ★ 传递 OAuth 事件
    private val oauthEvents = MutableSharedFlow<OAuthEvent>(extraBufferCapacity = 1)

    @OptIn(ExperimentalMaterial3WindowSizeClassApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        handleIntent(intent)

        setContent {
            LingCatTheme {
                val windowSizeClass = calculateWindowSizeClass(this)
                LingCatApp(
                    deepLinkChatIdFlow = deepLinkChatId,
                    oauthEventFlow = oauthEvents,
                    windowSizeClass = windowSizeClass,
                )
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        val data = intent?.data

        // 1. 处理 OAuth 回调
        if (data != null && "lingcat" == data.scheme && "oauth" == data.host) {
            val path = data.path
            if (path != null && path.startsWith("/callback")) {
                processOAuthCallback(data)
                intent.data = null // 消费掉
                return
            }
        }

        // 2. 处理普通路由深链 (如通知点击)
        val chatId = intent?.getStringExtra("route_chat_id")
        if (!chatId.isNullOrEmpty()) {
            deepLinkChatId.tryEmit(chatId)
            intent.removeExtra("route_chat_id")
        }
    }

    // ★ 核心：处理浏览器带回来的 ticket / bound / error
    private fun processOAuthCallback(data: Uri) {
        val bound = data.getQueryParameter("oauth_bound")
        val ticket = data.getQueryParameter("oauth_ticket")
        val error = data.getQueryParameter("oauth_error")

        if (!error.isNullOrEmpty()) {
            if ("access_denied" == error) {
                oauthEvents.tryEmit(OAuthEvent.Error("你取消了授权"))
            } else {
                oauthEvents.tryEmit(OAuthEvent.Error("授权失败: $error"))
            }
            return
        }

        if (!bound.isNullOrEmpty()) {
            // 这是【绑定账号】的回调
            oauthEvents.tryEmit(OAuthEvent.Bound(bound))
            return
        }

        if (!ticket.isNullOrEmpty()) {
            // 这是【登录/注册】的回调
            lifecycleScope.launch(Dispatchers.IO) {
                try {
                    val client = LingCatClientManager.currentClient ?: throw Exception("客户端未连接")
                    val server = LingCatClientManager.currentServer ?: throw Exception("服务器未连接")

                    // 1. 换取 Token
                    val token = OAuthApi.exchangeOAuthCode(client, ticket, 15000L)
                    // 2. 查用户信息
                    val user = UserApi.queryMyUserInfo(client, token, 15000L)

                    // 3. 存本地
                    val acc = AccountInfo(
                        username = user.username.ifEmpty { user.id },
                        token = token,
                        userId = user.id,
                        serverWsUrl = server.wsUrl
                    )
                    AuthStorage.saveAccount(this@MainActivity, acc)
                    LingCatClientManager.setAuthSession(token, user.id)

                    // 4. 授权
                    withContext(Dispatchers.IO) {
                        try {
                            LingCatClientManager.authorize(client, token)
                        } catch (e: Exception) {
                            android.util.Log.w("OAuth", "authorize failed", e)
                        }
                    }

                    oauthEvents.tryEmit(OAuthEvent.LoginSuccess(acc))
                } catch (e: Exception) {
                    android.util.Log.e("OAuth", "exchange failed", e)
                    oauthEvents.tryEmit(OAuthEvent.Error("获取用户信息失败: ${e.message}"))
                }
            }
        }
    }
}