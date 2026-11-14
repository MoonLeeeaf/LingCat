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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.Feedback
import io.github.moonleeeaf.lingcat.ui.components.EmptyState

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

    var accountToDelete by remember { mutableStateOf<AccountItem?>(null) }

    LaunchedEffect(Unit) {
        viewModel.onSwitchSuccess = onSwitchSuccess
        viewModel.onForceLogout = onForceLogout
    }

    LaunchedEffect(uiState.errorMsg) {
        uiState.errorMsg?.let { Feedback.show(it) }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.account_management)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.action_back))
                    }
                },
                actions = {
                    IconButton(onClick = onAddAccount) {
                        Icon(Icons.Default.Add, contentDescription = stringResource(R.string.account_add))
                    }
                }
            )
        }
    ) { padding ->
        Box(Modifier.fillMaxSize().padding(padding)) {
            if (uiState.accounts.isEmpty()) {
                EmptyState(
                    title = stringResource(R.string.account_empty),
                    icon = Icons.Default.Person,
                    modifier = Modifier.align(Alignment.Center),
                )
            } else {
                LazyColumn(Modifier.fillMaxSize()) {
                    items(uiState.accounts) { item ->
                        val isCurrent = item.account.token == LingCatClientManager.currentToken &&
                                item.account.serverWsUrl == LingCatClientManager.currentServer?.wsUrl

                        val isSwitching = uiState.switchingAccount == item.account.username

                        ListItem(
                            headlineContent = { Text(item.account.username) },
                            supportingContent = {
                                Text(
                                    (item.serverTitle ?: stringResource(R.string.account_unknown_server)) +
                                        " " + item.account.serverWsUrl
                                )
                            },
                            trailingContent = {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    if (isSwitching) {
                                        CircularProgressIndicator(modifier = Modifier.size(24.dp), strokeWidth = 2.dp)
                                    } else if (isCurrent) {
                                        Text(stringResource(R.string.account_current), color = MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelMedium)
                                    }

                                    // ★ 删除按钮
                                    IconButton(
                                        onClick = { accountToDelete = item },
                                        enabled = !isSwitching
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Delete,
                                            contentDescription = stringResource(R.string.action_delete),
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
            title = { Text(stringResource(R.string.account_delete_title)) },
            text = {
                Text(
                    stringResource(
                        R.string.account_delete_message,
                        accountToDelete?.account?.username ?: "",
                    )
                )
            },
            confirmButton = {
                TextButton(
                    onClick = {
                        accountToDelete?.let { viewModel.deleteAccount(it) }
                        accountToDelete = null
                    },
                    colors = ButtonDefaults.textButtonColors(contentColor = MaterialTheme.colorScheme.error)
                ) {
                    Text(stringResource(R.string.action_delete))
                }
            },
            dismissButton = {
                TextButton(onClick = { accountToDelete = null }) {
                    Text(stringResource(R.string.action_cancel))
                }
            }
        )
    }
}