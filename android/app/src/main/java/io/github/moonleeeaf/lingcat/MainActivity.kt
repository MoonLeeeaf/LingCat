package io.github.moonleeeaf.lingcat

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import io.github.moonleeeaf.lingcat.ui.LingCatApp
import io.github.moonleeeaf.lingcat.ui.theme.LingCatTheme
import kotlinx.coroutines.flow.MutableSharedFlow

class MainActivity : ComponentActivity() {

    // 用于处理通知跳转
    private val deepLinkChatId = MutableSharedFlow<String>(extraBufferCapacity = 1)

    // ★ 权限申请 Launcher
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        // 这里可以处理用户拒绝后的逻辑（比如 Toast 提示），目前先静默
        permissions.forEach { (permission, isGranted) ->
            if (!isGranted) {
                // 如果用户拒绝了通知或存储权限，可以在这里做点记录
                android.util.Log.w("Permission", "权限被拒绝: $permission")
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        handleIntent(intent)
        requestAppPermissions() // ★ 发起权限申请

        setContent {
            LingCatTheme {
                LingCatApp(deepLinkChatIdFlow = deepLinkChatId)
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleIntent(intent)
    }

    private fun handleIntent(intent: Intent?) {
        val chatId = intent?.getStringExtra("route_chat_id")
        if (!chatId.isNullOrEmpty()) {
            deepLinkChatId.tryEmit(chatId)
            intent.removeExtra("route_chat_id")
        }
    }

    /**
     * 动态申请权限
     */
    private fun requestAppPermissions() {
        val permissionsToRequest = mutableListOf<String>()

        // 1. Android 13 (API 33) 及以上需要申请通知权限
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        // 2. Android 9 (API 28) 及以下下载图片到相册需要存储权限
        if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.P) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.WRITE_EXTERNAL_STORAGE) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.WRITE_EXTERNAL_STORAGE)
            }
        }

        // 3. 如果有需要申请的权限，就发起请求
        if (permissionsToRequest.isNotEmpty()) {
            permissionLauncher.launch(permissionsToRequest.toTypedArray())
        }
    }
}