package io.github.moonleeeaf.lingcat.ui.screens.main

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.net.LingCatClientManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AccountListScreen(
    onBack: () -> Unit,
    onAddAccount: () -> Unit,
    onSwitchSuccess: () -> Unit,
    onForceLogout: () -> Unit,
    viewModel: AccountListViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    var accountToDelete by remember { mutableStateOf<AccountItem?>(null) }

    LaunchedEffect(Unit) {
        viewModel.onSwitchSuccess = onSwitchSuccess
        viewModel.onForceLogout = onForceLogout
    }

    // 绑定切换成功的回调
    LaunchedEffect(Unit) {
        viewModel.onSwitchSuccess = onSwitchSuccess
    }

    LaunchedEffect(uiState.errorMsg) {
        uiState.errorMsg?.let { snackbarHostState.showSnackbar(it) }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("账号管理") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                },
                actions = {
                    IconButton(onClick = onAddAccount) {
                        Icon(Icons.Default.Add, contentDescription = "添加新账号")
                    }
                }
            )
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            if (uiState.accounts.isEmpty()) {
                Text("还没有保存的账号喵", Modifier.align(Alignment.Center))
            } else {
                LazyColumn(Modifier.fillMaxSize()) {
                    items(uiState.accounts) { item ->
                        val isCurrent = item.account.token == LingCatClientManager.currentToken &&
                                item.account.serverWsUrl == LingCatClientManager.currentServer?.wsUrl

                        val isSwitching = uiState.switchingAccount == item.account.username

                        ListItem(
                            headlineContent = { Text(item.account.username) },
                            supportingContent = { Text(item.serverTitle + " " + item.account.serverWsUrl) },
                            trailingContent = {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    if (isSwitching) {
                                        CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                                    } else if (isCurrent) {
                                        Text("当前", color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelMedium)
                                    }

                                    // ★ 删除按钮
                                    IconButton(
                                        onClick = { accountToDelete = item },
                                        enabled = !isSwitching
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = "删除",
                                            tint = MaterialTheme.colorScheme.error.copy(alpha = 0.7f)
                                        )
                                    }
                                }
                            },
                            modifier = Modifier.clickable(enabled = !uiState.isLoading && !isCurrent) {
                                viewModel.switchAccount(item)
                            }
                        )
                        HorizontalDivider()
                    }
                }
            }
        }
    }

    // ★ 删除确认弹窗
    if (accountToDelete != null) {
        AlertDialog(
            onDismissRequest = { accountToDelete = null },
            title = { Text("删除登录状态") },
            text = {
                val isCurrent = accountToDelete?.account?.token == LingCatClientManager.currentToken
                Text("确定要删除账号 ${accountToDelete?.account?.username} 的登录状态吗？\n" +
                        if (isCurrent) "这会导致你立即退出当前账号！" else "下次登录需要重新输入密码。")
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        accountToDelete?.let { viewModel.deleteAccount(it) }
                        accountToDelete = null
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text("删除")
                }
            },
            dismissButton = {
                TextButton(onClick = { accountToDelete = null }) {
                    Text("取消")
                }
            }
        )
    }
}