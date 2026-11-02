package io.github.moonleeeaf.lingcat.ui.screens.main

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.moonleeeaf.lingcat.data.AccountInfo
import io.github.moonleeeaf.lingcat.data.AuthStorage
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class AccountItem(
    val account: AccountInfo,
    val serverTitle: String
)

data class AccountListUiState(
    val accounts: List<AccountItem> = emptyList(),
    val isLoading: Boolean = false,
    val switchingAccount: String? = null, // 正在切换的账号 username
    val errorMsg: String? = null
)

class AccountListViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(AccountListUiState())
    val uiState: StateFlow<AccountListUiState> = _uiState.asStateFlow()

    init {
        loadAccounts()
    }

    fun loadAccounts() {
        val context = LingCatClientManager.appContext
        val rawAccounts = AuthStorage.getAllAccounts(context)
        val servers = LingCatClientManager.getSavedServers()

        // 把账号和服务器名称映射起来
        val items = rawAccounts.map { acc ->
            val serverTitle = servers.find { it.wsUrl == acc.serverWsUrl }?.siteTitle ?: "未知服务器"
            AccountItem(acc, serverTitle)
        }

        _uiState.value = _uiState.value.copy(accounts = items)
    }

    fun switchAccount(target: AccountItem) {
        if (_uiState.value.isLoading) return

        // 如果点的就是当前账号，直接返回
        if (target.account.token == LingCatClientManager.currentToken &&
            target.account.serverWsUrl == LingCatClientManager.currentServer?.wsUrl) {
            return
        }

        _uiState.value = _uiState.value.copy(isLoading = true, switchingAccount = target.account.username, errorMsg = null)

        viewModelScope.launch {
            val result = LingCatClientManager.switchAccount(target.account)
            if (result.isSuccess) {
                AuthStorage.setActiveAccount(LingCatClientManager.appContext, target.account)
                _uiState.value = _uiState.value.copy(isLoading = false)
                // 成功后清空栈，回到主页
                onSwitchSuccess()
            } else {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    switchingAccount = null,
                    errorMsg = "切换失败: ${result.exceptionOrNull()?.message}"
                )
            }
        }
    }

    fun deleteAccount(target: AccountItem) {
        val context = LingCatClientManager.appContext
        val isCurrent = target.account.token == LingCatClientManager.currentToken &&
                target.account.serverWsUrl == LingCatClientManager.currentServer?.wsUrl

        // 1. 从本地存储移除
        AuthStorage.removeAccount(context, target.account)

        // 2. 刷新列表
        loadAccounts()

        // 3. 如果删的是当前正在用的号，直接强制登出
        if (isCurrent) {
            LingCatClientManager.logout()
            onForceLogout()
        }
    }

    // 绑定强制退出的回调
    var onForceLogout: () -> Unit = {}

    // 留给 UI 层绑定的回调
    var onSwitchSuccess: () -> Unit = {}
}