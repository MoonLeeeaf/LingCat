package io.github.moonleeeaf.lingcat.ui.screens.splash

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import io.github.moonleeeaf.lingcat.data.AuthStorage
import io.github.moonleeeaf.lingcat.data.ServerConfig
import io.github.moonleeeaf.lingcat.data.ServerStorage
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.net.ServerConfigFetcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull

@Composable
fun SplashScreen(
    onNeedLogin: () -> Unit,
    onLoggedIn: () -> Unit
) {
    // 状态：正在加载中
    var isLoading by remember { mutableStateOf(true) }

    // 状态：TOFU 冲突（如果非空，说明拦截了，需要用户确认）
    var tofuConflictConfig by remember { mutableStateOf<ServerConfig?>(null) }
    var originalServer by remember { mutableStateOf<ServerConfig?>(null) }

    LaunchedEffect(Unit) {
        val context = LingCatClientManager.appContext
        val lastAccount = AuthStorage.getLastAccount(context)

        if (lastAccount == null) {
            onNeedLogin()
            return@LaunchedEffect
        }

        val savedServer = LingCatClientManager.getSavedServers().find { it.wsUrl == lastAccount.serverWsUrl }
        if (savedServer == null) {
            onNeedLogin()
            return@LaunchedEffect
        }

        // ★ 核心修复 1：在进入主界面之前，尝试静默拉取最新 config.json
        // 加上 3 秒超时，防止断网时卡在 Splash
        val fetchedConfig = withTimeoutOrNull(3000L) {
            withContext(Dispatchers.IO) {
                try {
                    ServerConfigFetcher.fetch(savedServer.rawUrl)
                } catch (e: Exception) {
                    null // 断网或请求失败，返回 null
                }
            }
        }

        // ★ 核心修复 2：如果拉取成功，且公钥不匹配，拦截！
        if (fetchedConfig != null && fetchedConfig.publicKeyHex != savedServer.publicKeyHex) {
            originalServer = savedServer
            tofuConflictConfig = fetchedConfig
            isLoading = false
            return@LaunchedEffect
        }

        // 如果拉取成功且公钥匹配，或者拉取失败（断网），都直接放行
        // （底层握手依然会二次校验签名，所以断网时放行是安全的）
        LingCatClientManager.currentServer = savedServer
        LingCatClientManager.setAuthSession(lastAccount.token, lastAccount.userId)
        LingCatClientManager.startKeepAliveService()

        onLoggedIn()
    }

    // ==========================================
    // UI 渲染
    // ==========================================

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        if (isLoading) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
        } else if (tofuConflictConfig != null) {
            // 显示 TOFU 警告 UI
            AlertDialog(
                onDismissRequest = {},
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                        Spacer(Modifier.width(8.dp))
                        Text("服务器公钥已变更")
                    }
                },
                text = {
                    Text(
                        text = "检测到服务器 ${originalServer?.siteTitle} 的安全指纹与本地记录不一致。\n\n" +
                                "旧 Hex 16 位: ${originalServer?.publicKeyHex?.take(16)}...\n" +
                                "新 Hex 16 位: ${tofuConflictConfig?.publicKeyHex?.take(16)}...\n\n" +
                                "这可能是因为服务器丢失了密钥，也可能是中间人攻击！",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onErrorContainer,
                        textAlign = TextAlign.Center
                    )
                },
                confirmButton = {
                    TextButton(
                        onClick = {
                            // 用户确认信任
                            val newConfig = tofuConflictConfig ?: return@TextButton
                            ServerStorage.save(LingCatClientManager.appContext, newConfig)

                            // 继续登录流程
                            LingCatClientManager.currentServer = newConfig
                            val acc =
                                AuthStorage.getLastAccount(LingCatClientManager.appContext)
                            if (acc != null) {
                                LingCatClientManager.setAuthSession(acc.token, acc.userId)
                            }
                            LingCatClientManager.startKeepAliveService()
                            onLoggedIn()
                        },
                        colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                    ) {
                        Text("信任并登录")
                    }
                },
                dismissButton = {
                    TextButton(onClick = {
                        AuthStorage.clear(LingCatClientManager.appContext)
                        onNeedLogin()
                    }) {
                        Text("清除登录态")
                    }
                }
            )
        }
    }
}