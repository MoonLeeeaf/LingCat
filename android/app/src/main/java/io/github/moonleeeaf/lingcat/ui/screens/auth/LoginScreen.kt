package io.github.moonleeeaf.lingcat.ui.screens.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.data.ServerConfig

@OptIn(ExperimentalMaterial3Api::class, androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onManageAccounts: () -> Unit,
    viewModel: LoginViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    var passwordVisible by remember { mutableStateOf(false) }
    var serverMenuExpanded by remember { mutableStateOf(false) }
    var showAddServerDialog by remember { mutableStateOf(false) }

    LaunchedEffect(uiState.isSuccess) {
        if (uiState.isSuccess) onLoginSuccess()
    }
    LaunchedEffect(uiState.errorMsg) {
        uiState.errorMsg?.let { snackbarHostState.showSnackbar(it); viewModel.clearError() }
    }

    var serverToDelete by remember { mutableStateOf<ServerConfig?>(null) }
    val pendingTofu by viewModel.pendingTofuConfig.collectAsState()
    val pendingTofuOld by viewModel.pendingTofuOldConfig.collectAsState()

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
            title = {
                Text(if (uiState.isRegisterMode) "注册" else "登录")
            },
            actions = {
                // ★ 账号管理入口
                IconButton(onClick = onManageAccounts) {
                    Icon(Icons.Default.ManageAccounts, contentDescription = "账号管理")
                }
            }
        )
        }
    ) { padding ->
        Box(
            modifier = Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()),
            contentAlignment = Alignment.TopCenter
        ) {
            Column(
                modifier = Modifier.widthIn(max = 400.dp).fillMaxWidth().padding(horizontal = 32.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Spacer(Modifier.height(30.dp))

                // ★ 服务器选择区域
                Box {
                    OutlinedCard(
                        onClick = { serverMenuExpanded = true },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = !uiState.serverLoading && !uiState.isLoading
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp).fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("当前服务器", style = MaterialTheme.typography.labelMedium)
                                Text(
                                    text = uiState.currentServer?.siteTitle ?: "未选择服务器",
                                    style = MaterialTheme.typography.bodyLarge
                                )
                                // ★ 显示 host:port
                                uiState.currentServer?.let { server ->
                                    val hostPort = server.httpUrl
                                        .removePrefix("https://")
                                        .removePrefix("http://")
                                        .removeSuffix("/")
                                    Text(
                                        text = hostPort,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                            if (uiState.serverLoading) {
                                CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                            } else {
                                Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                            }
                        }
                    }

                    DropdownMenu(
                        expanded = serverMenuExpanded,
                        onDismissRequest = { serverMenuExpanded = false }
                    ) {
                        uiState.savedServers.forEach { server ->
                            val isCurrent = server.wsUrl == uiState.currentServer?.wsUrl

                            DropdownMenuItem(
                                text = {
                                    Column {
                                        Text(server.siteTitle)
                                        // ★ 恢复：显示 host:port
                                        val hostPort = server.httpUrl
                                            .removePrefix("https://")
                                            .removePrefix("http://")
                                            .removeSuffix("/")
                                        Text(
                                            text = hostPort,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                    }
                                },
                                onClick = {
                                    viewModel.selectServer(server)
                                    serverMenuExpanded = false
                                },
                                trailingIcon = {
                                    IconButton(
                                        onClick = {
                                            if (!isCurrent) {
                                                // ★ 恢复：点击垃圾桶触发二次确认
                                                serverToDelete = server
                                                serverMenuExpanded = false
                                            }
                                        },
                                        enabled = !isCurrent
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = "删除服务器",
                                            tint = if (isCurrent) {
                                                MaterialTheme.colorScheme.onSurface.copy(alpha = 0.2f)
                                            } else {
                                                MaterialTheme.colorScheme.error.copy(alpha = 0.8f)
                                            }
                                        )
                                    }
                                }
                            )
                        }
                        DropdownMenuItem(
                            text = { Text("添加新服务器...") },
                            leadingIcon = { Icon(Icons.Default.Add, contentDescription = null) },
                            onClick = {
                                serverMenuExpanded = false
                                showAddServerDialog = true
                            }
                        )
                    }
                }

                Spacer(Modifier.height(24.dp))

                // 历史账号
                if (uiState.historyAccounts.isNotEmpty()) {
                    Text("最近登录：", style = MaterialTheme.typography.labelMedium, modifier = Modifier.fillMaxWidth())
                    FlowRow(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)
                    ) {
                        uiState.historyAccounts.forEach { acc ->
                            AssistChip(
                                onClick = { viewModel.quickLogin(acc) },
                                enabled = !uiState.isLoading && !uiState.serverLoading,
                                label = { Text(acc.username) },
                                leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) }
                            )
                        }
                    }
                }

                OutlinedTextField(
                    value = uiState.username,
                    onValueChange = viewModel::onUsernameChange,
                    label = { Text("账号") },
                    leadingIcon = { Icon(Icons.Default.Person, null) },
                    singleLine = true,
                    enabled = !uiState.isLoading,
                    modifier = Modifier.fillMaxWidth(),
                )
                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = uiState.password,
                    onValueChange = viewModel::onPasswordChange,
                    label = { Text("密码") },
                    leadingIcon = { Icon(Icons.Default.Lock, null) },
                    trailingIcon = {
                        val image = if (passwordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff
                        IconButton(onClick = { passwordVisible = !passwordVisible }) { Icon(image, null) }
                    },
                    singleLine = true,
                    enabled = !uiState.isLoading,
                    visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    modifier = Modifier.fillMaxWidth(),
                )

                if (uiState.isRegisterMode) {
                    Spacer(Modifier.height(16.dp))
                    OutlinedTextField(
                        value = uiState.confirmPassword,
                        onValueChange = viewModel::onConfirmPasswordChange,
                        label = { Text("确认密码") },
                        leadingIcon = { Icon(Icons.Default.Lock, null) },
                        singleLine = true,
                        enabled = !uiState.isLoading,
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                        modifier = Modifier.fillMaxWidth(),
                    )
                }

                Spacer(Modifier.height(32.dp))

                Button(
                    onClick = viewModel::submit,
                    enabled = !uiState.isLoading && !uiState.serverLoading && uiState.username.isNotBlank() && uiState.password.isNotBlank(),
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary, strokeWidth = 2.dp)
                    } else {
                        Text(if (uiState.isRegisterMode) "注册并登录" else "登录", style = MaterialTheme.typography.titleMedium)
                    }
                }

                TextButton(onClick = viewModel::toggleMode, modifier = Modifier.padding(top = 16.dp), enabled = !uiState.isLoading) {
                    Text(if (uiState.isRegisterMode) "已有账号？去登录喵" else "没有账号？去注册一个喵")
                }
            }
        }
    }

    // ★ 新增：确认删除弹窗
    if (serverToDelete != null) {
        AlertDialog(
            onDismissRequest = { serverToDelete = null },
            title = { Text("删除服务器") },
            text = { Text("确定要删除服务器 ${serverToDelete?.siteTitle} (${serverToDelete?.rawUrl}) 吗？\n这不会删除你的聊天记录。") },
            confirmButton = {
                TextButton(
                    onClick = {
                        serverToDelete?.let { viewModel.deleteServer(it) }
                        serverToDelete = null
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("删除")
                }
            },
            dismissButton = {
                TextButton(onClick = { serverToDelete = null }) {
                    Text("取消")
                }
            }
        )
    }

    if (pendingTofu != null) {
        AlertDialog(
            onDismissRequest = { viewModel.cancelTofuUpdate() },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Warning, contentDescription = null, tint = MaterialTheme.colorScheme.error)
                    Spacer(Modifier.width(8.dp))
                    Text("服务器公钥已变更")
                }
            },
            text = {
                Text(
                    text = "检测到服务器 ${pendingTofu?.siteTitle} 的安全指纹与本地记录不一致。\n\n" +
                            // en.....
                            "旧 Hex 16 位: ${pendingTofuOld?.publicKeyHex?.take(16)}...\n" +
                            "新 Hex 16 位: ${pendingTofu?.publicKeyHex?.take(16)}...\n\n" +
                            "这可能是因为服务器丢失了密钥，也可能是中间人攻击！",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onErrorContainer,
                    textAlign = TextAlign.Center
                )
            },
            confirmButton = {
                TextButton(
                    onClick = { viewModel.confirmTofuUpdate() },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("信任并登录")
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.cancelTofuUpdate() }) {
                    Text("取消")
                }
            }
        )
    }

    if (showAddServerDialog) {
        var urlText by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showAddServerDialog = false },
            title = { Text("添加服务器") },
            text = {
                OutlinedTextField(
                    value = urlText,
                    onValueChange = { urlText = it },
                    label = { Text("服务器地址 (如 http://...)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        if (urlText.isNotBlank()) viewModel.addNewServer(urlText)
                        showAddServerDialog = false
                    },
                    enabled = urlText.isNotBlank()
                ) { Text("保存") }
            },
            dismissButton = { TextButton(onClick = { showAddServerDialog = false }) { Text("取消") } }
        )
    }
}