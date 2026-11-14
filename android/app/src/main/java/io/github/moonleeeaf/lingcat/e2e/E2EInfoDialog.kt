package io.github.moonleeeaf.lingcat.e2e

import androidx.compose.foundation.clickable
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.res.stringResource
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.e2e.E2EManager
import io.github.moonleeeaf.lingcat.e2e.E2EStateManager
import io.github.moonleeeaf.lingcat.ui.Feedback
import kotlinx.coroutines.launch

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun E2EInfoDialog(
    peerUserId: String?,
    onDismiss: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val clipboardManager = LocalClipboardManager.current
    val context = LocalContext.current

    val e2eStatus by E2EStateManager.status.collectAsState()
    val verifyStatusMap by E2EStateManager.peerVerifyStatus.collectAsState()
    val myPub = E2EStateManager.getMyPublicKey()
    var peerPub by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(peerUserId) {
        if (peerUserId != null) {
            android.util.Log.d("E2EDebug", "开始拉取对方公钥, peerUserId = $peerUserId")

            // 强制去拉取一次对方公钥
            E2EStateManager.fetchPeerKey(peerUserId, force = true)

            // 拉完后，重新去内存读一次
            peerPub = E2EStateManager.getPeerPublicKey(peerUserId)

            android.util.Log.d("E2EDebug", "拉取完成, 获取到的 peerPub = $peerPub")
        } else {
            android.util.Log.e("E2EDebug", "当前不是私聊，或者 peerUserId 丢失！")
        }
    }

    // 弹窗状态
    var showChangePwdDialog by remember { mutableStateOf(false) }
    var showRotateKeyDialog by remember { mutableStateOf(false) }

    // 输入密码状态（用于生成或解锁）
    var inputPwd by remember { mutableStateOf("") }
    var isWorking by remember { mutableStateOf(false) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    // 计算安全码
    val safetyNumber = remember(myPub, peerPub) {
        if (myPub != null && peerPub != null) E2EManager.getSafetyNumber(myPub, peerPub ?: "") else null
    }

    val currentVerifyStatus = if (peerUserId != null) verifyStatusMap[peerUserId] ?: "unverified" else "unverified"

    AlertDialog(
        onDismissRequest = { if (!isWorking) onDismiss() },
        title = {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Security, contentDescription = null, tint = MaterialTheme.colorScheme.primary)
                Spacer(Modifier.width(8.dp))
                Text(stringResource(R.string.chat_e2e))
            }
        },
        text = {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    // 内容较多（安全码 + 三组操作 + 提示），小屏/横屏时必须可滚动。
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                when (e2eStatus) {
                    // ==========================================
                    // 状态 1: 尚未开启
                    // ==========================================
                    E2EStateManager.Status.DISABLED -> {
                        Text(stringResource(R.string.e2e_disabled_desc))
                        Spacer(Modifier.height(16.dp))
                        OutlinedTextField(
                            value = inputPwd,
                            onValueChange = { inputPwd = it; errorMsg = null },
                            label = { Text(stringResource(R.string.e2e_set_password)) },
                            singleLine = true,
                            visualTransformation = PasswordVisualTransformation(),
                            enabled = !isWorking,
                            modifier = Modifier.fillMaxWidth()
                        )
                        if (errorMsg != null) Text(errorMsg!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                    }

                    // ==========================================
                    // 状态 2: 已生成但锁定
                    // ==========================================
                    E2EStateManager.Status.LOCKED -> {
                        Text(stringResource(R.string.e2e_locked_desc))
                        Spacer(Modifier.height(16.dp))
                        OutlinedTextField(
                            value = inputPwd,
                            onValueChange = { inputPwd = it; errorMsg = null },
                            label = { Text(stringResource(R.string.security_password)) },
                            singleLine = true,
                            visualTransformation = PasswordVisualTransformation(),
                            enabled = !isWorking,
                            modifier = Modifier.fillMaxWidth()
                        )
                        if (errorMsg != null) Text(errorMsg!!, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                    }

                    // ==========================================
                    // 状态 3: 已解锁（展示安全码和操作）
                    // ==========================================
                    E2EStateManager.Status.UNLOCKED -> {
                        if (safetyNumber != null) {
                            // ★ 优化 1：把安全码改成 ListItem 风格，带圆角
                            ListItem(
                                headlineContent = { Text(stringResource(R.string.e2e_safety_number)) },
                                supportingContent = {
                                    Text(
                                        text = safetyNumber,
                                        color = MaterialTheme.colorScheme.primary
                                    )
                                },
                                leadingContent = {
                                    Icon(Icons.Default.Fingerprint, contentDescription = null)
                                },
                                colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(12.dp)) // ★ 核心：圆角涟漪
                                    .clickable {
                                        clipboardManager.setText(AnnotatedString(safetyNumber))
                                        Feedback.show(R.string.e2e_copied)
                                    }
                            )
                        } else if (peerUserId != null) {
                            ListItem(
                                headlineContent = { Text(stringResource(R.string.e2e_cannot_verify)) },
                                supportingContent = { Text(stringResource(R.string.e2e_peer_disabled)) },
                                leadingContent = { Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
                                colors = ListItemDefaults.colors(containerColor = Color.Transparent)
                            )
                        }

                        if (peerUserId != null && safetyNumber != null) {
                            when (currentVerifyStatus) {
                                "mismatch" -> {
                                    ListItem(
                                        headlineContent = { Text(stringResource(R.string.e2e_mismatch_title), color = MaterialTheme.colorScheme.error) },
                                        supportingContent = { Text(stringResource(R.string.e2e_mismatch_desc), color = MaterialTheme.colorScheme.error) },
                                        leadingContent = { Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
                                        colors = ListItemDefaults.colors(containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)),
                                        modifier = Modifier.clip(RoundedCornerShape(12.dp)).clickable {
                                            E2EStateManager.setPeerVerified(peerUserId)
                                        }
                                    )
                                }
                                "verified" -> {
                                    ListItem(
                                        headlineContent = { Text(stringResource(R.string.e2e_verified_title)) },
                                        supportingContent = { Text(stringResource(R.string.e2e_verified_desc)) },
                                        leadingContent = { Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
                                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                                        modifier = Modifier.clip(RoundedCornerShape(12.dp))
                                    )
                                }
                                else -> {
                                    ListItem(
                                        headlineContent = { Text(stringResource(R.string.e2e_mark_verified)) },
                                        supportingContent = { Text(stringResource(R.string.e2e_mark_verified_desc)) },
                                        leadingContent = { Icon(Icons.Default.CheckCircleOutline, contentDescription = null) },
                                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                                        modifier = Modifier.clip(RoundedCornerShape(12.dp)).clickable {
                                            E2EStateManager.setPeerVerified(peerUserId)
                                        }
                                    )
                                }
                            }
                        }

                        // ★ 优化 3：给操作按钮加圆角
                        ListItem(
                            headlineContent = { Text(stringResource(R.string.e2e_change_password)) },
                            supportingContent = { Text(stringResource(R.string.e2e_change_password_desc)) },
                            leadingContent = { Icon(Icons.Default.VpnKey, contentDescription = null) },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { showChangePwdDialog = true }
                        )

                        ListItem(
                            headlineContent = { Text(stringResource(R.string.e2e_generate_key)) },
                            supportingContent = { Text(stringResource(R.string.e2e_generate_key_desc, E2EStateManager.getMyKeyVersion())) },
                            leadingContent = { Icon(Icons.Default.Refresh, contentDescription = null) },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { showRotateKeyDialog = true }
                        )
                    }
                }
            }
        },
        confirmButton = {
            when (e2eStatus) {
                E2EStateManager.Status.DISABLED -> {
                    TextButton(
                        onClick = {
                            if (inputPwd.isBlank()) return@TextButton
                            coroutineScope.launch {
                                isWorking = true
                                val ok = E2EStateManager.setupNewKey(inputPwd)
                                isWorking = false
                                if (!ok) errorMsg = context.getString(R.string.e2e_generate_failed)
                                else inputPwd = ""
                            }
                        },
                        enabled = inputPwd.isNotBlank() && !isWorking
                    ) {
                        if (isWorking) CircularProgressIndicator(Modifier.size(16.dp)) else Text(stringResource(R.string.e2e_generate_and_enable))
                    }
                }
                E2EStateManager.Status.LOCKED -> {
                    TextButton(
                        onClick = {
                            if (inputPwd.isBlank()) return@TextButton
                            coroutineScope.launch {
                                isWorking = true
                                val ok = E2EStateManager.unlock(inputPwd)
                                isWorking = false
                                if (!ok) errorMsg = context.getString(R.string.password_incorrect)
                                else inputPwd = ""
                            }
                        },
                        enabled = inputPwd.isNotBlank() && !isWorking
                    ) {
                        if (isWorking) CircularProgressIndicator(Modifier.size(16.dp)) else Text(stringResource(R.string.action_unlock))
                    }
                }
                E2EStateManager.Status.UNLOCKED -> {
                    TextButton(onClick = onDismiss) { Text(stringResource(R.string.e2e_done)) }
                }
            }
        },
        dismissButton = {
            if (e2eStatus != E2EStateManager.Status.UNLOCKED) {
                TextButton(onClick = onDismiss, enabled = !isWorking) { Text(stringResource(R.string.action_cancel)) }
            }
        }
    )

    if (showChangePwdDialog) {
        var oldPwd by remember { mutableStateOf("") }
        var newPwd by remember { mutableStateOf("") }
        var isWorking by remember { mutableStateOf(false) }
        var errorMsg by remember { mutableStateOf<String?>(null) }

        AlertDialog(
            onDismissRequest = { if (!isWorking) showChangePwdDialog = false },
            title = { Text(stringResource(R.string.e2e_change_password)) },
            text = {
                Column {
                    OutlinedTextField(value = oldPwd, onValueChange = { oldPwd = it; errorMsg = null }, label = { Text(stringResource(R.string.e2e_current_password)) }, visualTransformation = PasswordVisualTransformation())
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(value = newPwd, onValueChange = { newPwd = it; errorMsg = null }, label = { Text(stringResource(R.string.e2e_new_password)) }, visualTransformation = PasswordVisualTransformation())
                    if (errorMsg != null) Text(errorMsg!!, color = MaterialTheme.colorScheme.error)
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        coroutineScope.launch {
                            isWorking = true
                            val ok = E2EStateManager.changePassword(oldPwd, newPwd)
                            isWorking = false
                            if (ok) {
                                showChangePwdDialog = false
                                onDismiss() // 密码改完会锁定，退出面板要求用新密码解锁
                            } else {
                                errorMsg = context.getString(R.string.e2e_old_password_wrong)
                            }
                        }
                    },
                    enabled = oldPwd.isNotBlank() && newPwd.isNotBlank() && !isWorking
                ) { Text(stringResource(R.string.e2e_confirm_change)) }
            }
        )
    }

    // --- 生成新密钥弹窗 ---
    if (showRotateKeyDialog) {
        var pwd by remember { mutableStateOf("") }
        var isWorking by remember { mutableStateOf(false) }
        var errorMsg by remember { mutableStateOf<String?>(null) }

        AlertDialog(
            onDismissRequest = { if (!isWorking) showRotateKeyDialog = false },
            title = { Text(stringResource(R.string.e2e_generate_key)) },
            text = {
                Column {
                    Text(stringResource(R.string.e2e_rotate_warning), color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(16.dp))
                    OutlinedTextField(value = pwd, onValueChange = { pwd = it; errorMsg = null }, label = { Text(stringResource(R.string.e2e_enter_current_password)) }, visualTransformation = PasswordVisualTransformation())
                    if (errorMsg != null) Text(errorMsg!!, color = MaterialTheme.colorScheme.error)
                }
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        coroutineScope.launch {
                            isWorking = true
                            // 生成下一版本
                            val nextVersion = E2EStateManager.getMyKeyVersion() + 1
                            val ok = E2EStateManager.generateNewKey(pwd, nextVersion)
                            isWorking = false
                            if (ok) {
                                showRotateKeyDialog = false
                            } else {
                                errorMsg = context.getString(R.string.e2e_password_network_error)
                            }
                        }
                    },
                    enabled = pwd.isNotBlank() && !isWorking
                ) { Text(stringResource(R.string.e2e_confirm_reset)) }
            }
        )
    }
}