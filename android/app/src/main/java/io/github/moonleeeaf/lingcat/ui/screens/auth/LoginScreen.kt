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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.data.ServerConfig
import io.github.moonleeeaf.lingcat.ui.Feedback

@OptIn(ExperimentalMaterial3Api::class, androidx.compose.foundation.layout.ExperimentalLayoutApi::class)
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onManageAccounts: () -> Unit,
    viewModel: LoginViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var passwordVisible by remember { mutableStateOf(false) }
    var serverMenuExpanded by remember { mutableStateOf(false) }
    var showAddServerDialog by remember { mutableStateOf(false) }

    LaunchedEffect(uiState.isSuccess) {
        if (uiState.isSuccess) onLoginSuccess()
    }
    LaunchedEffect(uiState.errorMsg) {
        uiState.errorMsg?.let { Feedback.show(it); viewModel.clearError() }
    }

    var serverToDelete by remember { mutableStateOf<ServerConfig?>(null) }
    val pendingTofu by viewModel.pendingTofuConfig.collectAsState()
    val pendingTofuOld by viewModel.pendingTofuOldConfig.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
            title = {
                Text(if (uiState.isRegisterMode) stringResource(R.string.login_register) else stringResource(R.string.login_login))
            },
            actions = {
                // ★ 账号管理入口
                IconButton(onClick = onManageAccounts) {
                    Icon(Icons.Default.ManageAccounts, contentDescription = stringResource(R.string.account_management))
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
                                Text(stringResource(R.string.login_current_server), style = MaterialTheme.typography.labelMedium)
                                Text(
                                    text = uiState.currentServer?.siteTitle ?: stringResource(R.string.login_no_server),
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
                                            contentDescription = stringResource(R.string.login_delete_server),
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
                            text = { Text(stringResource(R.string.login_add_server)) },
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
                    Text(stringResource(R.string.login_recent), style = MaterialTheme.typography.labelMedium, modifier = Modifier.fillMaxWidth())
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

                if (uiState.isRegisterMode) {
                    // ★ 注册模式：显示昵称（必填）
                    OutlinedTextField(
                        value = uiState.nickname,
                        onValueChange = viewModel::onNicknameChange,
                        label = { Text(stringResource(R.string.label_nickname)) },
                        leadingIcon = { Icon(Icons.Default.Badge, contentDescription = null) },
                        singleLine = true,
                        enabled = !uiState.isLoading,
                        modifier = Modifier.fillMaxWidth(),
                    )
                    Spacer(Modifier.height(16.dp))

                    // ★ 注册模式：显示用户名（可选）
                    OutlinedTextField(
                        value = uiState.username,
                        onValueChange = viewModel::onUsernameChange,
                        label = { Text(stringResource(R.string.login_username_optional)) },
                        leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                        singleLine = true,
                        enabled = !uiState.isLoading,
                        modifier = Modifier.fillMaxWidth(),
                    )
                } else {
                    // 登录模式：还是原来的账号
                    OutlinedTextField(
                        value = uiState.username,
                        onValueChange = viewModel::onUsernameChange,
                        label = { Text(stringResource(R.string.login_account)) },
                        leadingIcon = { Icon(Icons.Default.Person, null) },
                        singleLine = true,
                        enabled = !uiState.isLoading,
                        modifier = Modifier.fillMaxWidth(),
                    )
                }

                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = uiState.password,
                    onValueChange = viewModel::onPasswordChange,
                    label = { Text(stringResource(R.string.label_password)) },
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
                        label = { Text(stringResource(R.string.label_confirm_password)) },
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
                    enabled = if (uiState.isRegisterMode) {
                        uiState.nickname.isNotBlank() && uiState.password.isNotBlank() && uiState.confirmPassword.isNotBlank() && !uiState.isLoading
                    } else {
                        uiState.username.isNotBlank() && uiState.password.isNotBlank() && !uiState.isLoading
                    },
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                ) {
                    if (uiState.isLoading) {
                        CircularProgressIndicator(modifier = Modifier.size(24.dp), color = MaterialTheme.colorScheme.onPrimary, strokeWidth = 2.dp)
                    } else {
                        Text(if (uiState.isRegisterMode) stringResource(R.string.login_register_and_login) else stringResource(R.string.login_login), style = MaterialTheme.typography.titleMedium)
                    }
                }

                TextButton(onClick = viewModel::toggleMode, modifier = Modifier.padding(top = 16.dp), enabled = !uiState.isLoading) {
                    Text(if (uiState.isRegisterMode) stringResource(R.string.login_switch_to_login) else stringResource(R.string.login_switch_to_register))
                }
            }
        }
    }

    // ★ 新增：确认删除弹窗
    if (serverToDelete != null) {
        AlertDialog(
            onDismissRequest = { serverToDelete = null },
            title = { Text(stringResource(R.string.login_delete_server)) },
            text = { Text(stringResource(R.string.login_delete_server_message, serverToDelete?.siteTitle ?: "", serverToDelete?.rawUrl ?: "")) },
            confirmButton = {
                TextButton(
                    onClick = {
                        serverToDelete?.let { viewModel.deleteServer(it) }
                        serverToDelete = null
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text(stringResource(R.string.action_delete))
                }
            },
            dismissButton = {
                TextButton(onClick = { serverToDelete = null }) {
                    Text(stringResource(R.string.action_cancel))
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
                    Text(stringResource(R.string.tofu_title))
                }
            },
            text = {
                Text(
                    text = stringResource(
                        R.string.tofu_fingerprint_message,
                        pendingTofu?.siteTitle ?: "",
                        pendingTofuOld?.publicKeyHex?.take(16) ?: "",
                        pendingTofu?.publicKeyHex?.take(16) ?: "",
                    ),
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.error,
                    textAlign = TextAlign.Center
                )
            },
            confirmButton = {
                TextButton(
                    onClick = { viewModel.confirmTofuUpdate() },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text(stringResource(R.string.tofu_trust_login))
                }
            },
            dismissButton = {
                TextButton(onClick = { viewModel.cancelTofuUpdate() }) {
                    Text(stringResource(R.string.action_cancel))
                }
            }
        )
    }

    if (showAddServerDialog) {
        var urlText by remember { mutableStateOf("") }
        AlertDialog(
            onDismissRequest = { showAddServerDialog = false },
            title = { Text(stringResource(R.string.login_add_server_title)) },
            text = {
                OutlinedTextField(
                    value = urlText,
                    onValueChange = { urlText = it },
                    label = { Text(stringResource(R.string.login_server_address)) },
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
                ) { Text(stringResource(R.string.action_save)) }
            },
            dismissButton = { TextButton(onClick = { showAddServerDialog = false }) { Text(stringResource(R.string.action_cancel)) } }
        )
    }
}