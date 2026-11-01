package io.github.moonleeeaf.lingcat.e2e

import androidx.compose.foundation.clickable
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
import io.github.moonleeeaf.lingcat.e2e.E2EManager
import io.github.moonleeeaf.lingcat.e2e.E2EStateManager
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
                Text("端到端加密")
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(4.dp) // ★ 统一控制列表项之间的间距
            ) {
                when (e2eStatus) {
                    // ==========================================
                    // 状态 1: 尚未开启
                    // ==========================================
                    E2EStateManager.Status.DISABLED -> {
                        Text("你尚未生成加密密钥，设置一个安全密码即可开启端到端加密。")
                        Spacer(Modifier.height(16.dp))
                        OutlinedTextField(
                            value = inputPwd,
                            onValueChange = { inputPwd = it; errorMsg = null },
                            label = { Text("设置安全密码") },
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
                        Text("你的加密密钥已锁定，请输入密码解锁以查看安全码和收发消息。")
                        Spacer(Modifier.height(16.dp))
                        OutlinedTextField(
                            value = inputPwd,
                            onValueChange = { inputPwd = it; errorMsg = null },
                            label = { Text("安全密码") },
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
                                headlineContent = { Text("安全码 (点击复制)") },
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
                                        // 最好在这里弹个 Toast 或者轻微震动提示
                                    }
                            )
                        } else if (peerUserId != null) {
                            ListItem(
                                headlineContent = { Text("无法验证") },
                                supportingContent = { Text("对方尚未开启端到端加密") },
                                leadingContent = { Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
                                colors = ListItemDefaults.colors(containerColor = Color.Transparent)
                            )
                        }

                        if (peerUserId != null && safetyNumber != null) {
                            when (currentVerifyStatus) {
                                "mismatch" -> {
                                    ListItem(
                                        headlineContent = { Text("安全码已变更！", color = MaterialTheme.colorScheme.error) },
                                        supportingContent = { Text("对方可能更新了密钥，或者正遭受中间人攻击，请核实！", color = MaterialTheme.colorScheme.error) },
                                        leadingContent = { Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error) },
                                        colors = ListItemDefaults.colors(containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.3f)),
                                        modifier = Modifier.clip(RoundedCornerShape(12.dp)).clickable {
                                            E2EStateManager.setPeerVerified(peerUserId)
                                        }
                                    )
                                }
                                "verified" -> {
                                    ListItem(
                                        headlineContent = { Text("已标记为安全") },
                                        supportingContent = { Text("你已确认此人的安全码") },
                                        leadingContent = { Icon(Icons.Default.CheckCircle, contentDescription = null, tint = MaterialTheme.colorScheme.primary) },
                                        colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                                        modifier = Modifier.clip(RoundedCornerShape(12.dp))
                                    )
                                }
                                else -> {
                                    ListItem(
                                        headlineContent = { Text("标记为已验证") },
                                        supportingContent = { Text("对比上方安全码，确认无误后点击") },
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
                            headlineContent = { Text("修改主密码") },
                            supportingContent = { Text("重新加密所有历史版本密钥") },
                            leadingContent = { Icon(Icons.Default.VpnKey, contentDescription = null) },
                            colors = ListItemDefaults.colors(containerColor = Color.Transparent),
                            modifier = Modifier
                                .clip(RoundedCornerShape(12.dp))
                                .clickable { showChangePwdDialog = true }
                        )

                        ListItem(
                            headlineContent = { Text("生成新密钥") },
                            supportingContent = { Text("当前 v${E2EStateManager.getMyKeyVersion()}，重置后安全码会变更") },
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
                                if (!ok) errorMsg = "生成失败，请重试"
                                else inputPwd = ""
                            }
                        },
                        enabled = inputPwd.isNotBlank() && !isWorking
                    ) {
                        if (isWorking) CircularProgressIndicator(Modifier.size(16.dp)) else Text("生成并开启")
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
                                if (!ok) errorMsg = "密码错误"
                                else inputPwd = ""
                            }
                        },
                        enabled = inputPwd.isNotBlank() && !isWorking
                    ) {
                        if (isWorking) CircularProgressIndicator(Modifier.size(16.dp)) else Text("解锁")
                    }
                }
                E2EStateManager.Status.UNLOCKED -> {
                    TextButton(onClick = onDismiss) { Text("完成") }
                }
            }
        },
        dismissButton = {
            if (e2eStatus != E2EStateManager.Status.UNLOCKED) {
                TextButton(onClick = onDismiss, enabled = !isWorking) { Text("取消") }
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
            title = { Text("修改主密码") },
            text = {
                Column {
                    OutlinedTextField(value = oldPwd, onValueChange = { oldPwd = it; errorMsg = null }, label = { Text("当前密码") }, visualTransformation = PasswordVisualTransformation())
                    Spacer(Modifier.height(8.dp))
                    OutlinedTextField(value = newPwd, onValueChange = { newPwd = it; errorMsg = null }, label = { Text("新密码") }, visualTransformation = PasswordVisualTransformation())
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
                                errorMsg = "旧密码错误或网络异常"
                            }
                        }
                    },
                    enabled = oldPwd.isNotBlank() && newPwd.isNotBlank() && !isWorking
                ) { Text("确认修改") }
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
            title = { Text("生成新密钥") },
            text = {
                Column {
                    Text("警告：对方的安全码将会变更，需要重新验证。", color = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.height(16.dp))
                    OutlinedTextField(value = pwd, onValueChange = { pwd = it; errorMsg = null }, label = { Text("输入当前密码") }, visualTransformation = PasswordVisualTransformation())
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
                                errorMsg = "密码错误或网络异常"
                            }
                        }
                    },
                    enabled = pwd.isNotBlank() && !isWorking
                ) { Text("确认重置") }
            }
        )
    }
}