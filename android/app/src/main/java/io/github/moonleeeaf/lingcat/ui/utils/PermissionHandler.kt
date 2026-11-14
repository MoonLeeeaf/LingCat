package io.github.moonleeeaf.lingcat.ui.utils

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.provider.Settings
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.*
import androidx.compose.ui.res.stringResource
import io.github.moonleeeaf.lingcat.R
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.platform.LocalContext
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

// 辅助函数：从 Context 中找到 Activity
fun Context.findActivity(): Activity? {
    var context = this
    while (context is ContextWrapper) {
        if (context is Activity) return context
        context = context.baseContext
    }
    return null
}

/**
 * 权限请求的配置参数
 */
data class PermissionConfig(
    val permission: String,
    // 下面三项留空时使用内置文案；需要场景化说明时再传。
    val rationaleTitle: String? = null,
    val rationaleMessage: String, // 必须要求传入，因为不同场景解释不同
    val settingsTitle: String? = null,
    val settingsMessage: String? = null,
)

/**
 * 通用的权限请求 Hook (带默认弹窗 UI)
 */
@Composable
fun rememberPermissionRequestHandler(
    config: PermissionConfig,
    onGranted: () -> Unit
): () -> Unit {
    val context = LocalContext.current
    val activity = context.findActivity()

    var hasRequestedBefore by rememberSaveable { mutableStateOf(false) }
    var showRationaleDialog by remember { mutableStateOf(false) }
    var showSettingsDialog by remember { mutableStateOf(false) }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        hasRequestedBefore = true
        if (isGranted) {
            onGranted()
        } else {
            val shouldShowRationale = activity?.let {
                ActivityCompat.shouldShowRequestPermissionRationale(it, config.permission)
            } ?: false

            if (!shouldShowRationale) {
                // 被永久拒绝
                showSettingsDialog = true
            }
        }
    }

    val requestPermission: () -> Unit = {
        val isGranted = ContextCompat.checkSelfPermission(
            context, config.permission
        ) == PackageManager.PERMISSION_GRANTED

        if (isGranted) {
            onGranted()
        } else {
            val shouldShowRationale = activity?.let {
                ActivityCompat.shouldShowRequestPermissionRationale(it, config.permission)
            } ?: false

            if (shouldShowRationale) {
                showRationaleDialog = true
            } else {
                if (hasRequestedBefore) {
                    showSettingsDialog = true
                } else {
                    try {
                        launcher.launch(config.permission)
                    } catch (e: Exception) {
                        Log.e("Permission", "Failed to launch permission request", e)
                    }
                }
            }
        }
    }

    // 解释弹窗
    if (showRationaleDialog) {
        AlertDialog(
            onDismissRequest = { showRationaleDialog = false },
            title = { Text(config.rationaleTitle ?: stringResource(R.string.permission_required)) },
            text = { Text(config.rationaleMessage) },
            confirmButton = {
                TextButton(onClick = {
                    showRationaleDialog = false
                    launcher.launch(config.permission)
                }) {
                    Text(stringResource(R.string.permission_grant))
                }
            },
            dismissButton = {
                TextButton(onClick = { showRationaleDialog = false }) { Text(stringResource(R.string.action_cancel)) }
            }
        )
    }

    // 去设置弹窗
    if (showSettingsDialog) {
        AlertDialog(
            onDismissRequest = { showSettingsDialog = false },
            title = { Text(config.settingsTitle ?: stringResource(R.string.permission_disabled)) },
            text = {
                Text(config.settingsMessage ?: stringResource(R.string.permission_disabled_message))
            },
            confirmButton = {
                TextButton(onClick = {
                    showSettingsDialog = false
                    val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                        data = Uri.fromParts("package", context.packageName, null)
                    }
                    context.startActivity(intent)
                }) {
                    Text(stringResource(R.string.permission_open_settings))
                }
            },
            dismissButton = {
                TextButton(onClick = { showSettingsDialog = false }) { Text(stringResource(R.string.action_cancel)) }
            }
        )
    }

    return requestPermission
}

/**
 * 便捷重载：只需要传基本信息和文案 (适合单权限简单场景)
 */
@Composable
fun rememberPermissionRequestHandler(
    permission: String,
    rationaleMessage: String,
    onGranted: () -> Unit
): () -> Unit {
    return rememberPermissionRequestHandler(
        config = PermissionConfig(
            permission = permission,
            rationaleMessage = rationaleMessage
        ),
        onGranted = onGranted
    )
}