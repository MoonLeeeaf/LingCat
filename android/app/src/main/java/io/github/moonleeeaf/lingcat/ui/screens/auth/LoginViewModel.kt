package io.github.moonleeeaf.lingcat.ui.screens.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.moonleeeaf.lingcat.data.AccountInfo
import io.github.moonleeeaf.lingcat.data.AuthStorage
import io.github.moonleeeaf.lingcat.data.ServerConfig
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.client_protocol.UserApi

data class LoginUiState(
    // 服务器相关
    val savedServers: List<ServerConfig> = emptyList(),
    val currentServer: ServerConfig? = null,
    val serverLoading: Boolean = false,

    // 账号相关
    val nickname: String = "", // ★ 新增：注册用的昵称
    val username: String = "",
    val password: String = "",
    val confirmPassword: String = "",
    val isRegisterMode: Boolean = false,
    val historyAccounts: List<AccountInfo> = emptyList(),

    // 状态
    val isLoading: Boolean = false,
    val errorMsg: String? = null,
    val isSuccess: Boolean = false
)

class LoginViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(LoginUiState())
    val uiState: StateFlow<LoginUiState> = _uiState.asStateFlow()
    // ★ 用来触发 UI 弹窗的状态
    private val _pendingTofuConfig = MutableStateFlow<ServerConfig?>(null)
    val pendingTofuConfig: StateFlow<ServerConfig?> = _pendingTofuConfig.asStateFlow()

    // ★ 新增：保存待确认的旧配置
    private val _pendingTofuOldConfig = MutableStateFlow<ServerConfig?>(null)
    val pendingTofuOldConfig: StateFlow<ServerConfig?> = _pendingTofuOldConfig.asStateFlow()

    fun addNewServer(rawUrl: String) {
        _uiState.value = _uiState.value.copy(serverLoading = true, errorMsg = null)
        viewModelScope.launch {
            val result = LingCatClientManager.addAndVerifyServer(rawUrl)
            if (result.isSuccess) {
                val newServer = result.getOrThrow()
                val servers = LingCatClientManager.getSavedServers()
                _uiState.value = _uiState.value.copy(savedServers = servers, currentServer = newServer)
                connectToServer(newServer)
            } else {
                val e = result.exceptionOrNull()
                if (e is LingCatClientManager.TofuMismatchException) {
                    _pendingTofuOldConfig.value = e.oldConfig // ★ 保存旧配置
                    _pendingTofuConfig.value = e.newConfig
                    _uiState.value = _uiState.value.copy(serverLoading = false)
                } else {
                    _uiState.value = _uiState.value.copy(
                        serverLoading = false,
                        errorMsg = "添加服务器失败: ${e?.message}"
                    )
                }
            }
        }
    }

    fun confirmTofuUpdate() {
        val config = _pendingTofuConfig.value ?: return
        LingCatClientManager.forceSaveServer(config)
        _pendingTofuConfig.value = null
        _pendingTofuOldConfig.value = null // ★ 清理

        val servers = LingCatClientManager.getSavedServers()
        _uiState.value = _uiState.value.copy(savedServers = servers, currentServer = config)
        connectToServer(config)
    }

    fun cancelTofuUpdate() {
        _pendingTofuConfig.value = null
        _pendingTofuOldConfig.value = null // ★ 清理
    }

    init {
        loadServersAndConnect()
    }

    fun loadServersAndConnect() {
        val servers = LingCatClientManager.getSavedServers()
        val current = LingCatClientManager.currentServer ?: servers.firstOrNull()

        _uiState.value = _uiState.value.copy(savedServers = servers, currentServer = current)

        if (current != null) {
            connectToServer(current)
        }
    }

    fun selectServer(server: ServerConfig) {
        if (_uiState.value.currentServer?.wsUrl == server.wsUrl) return
        _uiState.value = _uiState.value.copy(currentServer = server)
        connectToServer(server)
    }

    private fun connectToServer(server: ServerConfig) {
        if (LingCatClientManager.currentServer?.wsUrl == server.wsUrl && LingCatClientManager.currentClient?.isReady() == true) {
            loadHistoryAccounts(server.wsUrl)
            return
        }

        _uiState.value = _uiState.value.copy(serverLoading = true, errorMsg = null)
        viewModelScope.launch {
            val result = LingCatClientManager.connect(server)
            if (result.isSuccess) {
                _uiState.value = _uiState.value.copy(serverLoading = false)
                loadHistoryAccounts(server.wsUrl)
            } else {
                _uiState.value = _uiState.value.copy(
                    serverLoading = false,
                    errorMsg = "连接服务器失败: ${result.exceptionOrNull()?.message}"
                )
            }
        }
    }

    private fun loadHistoryAccounts(wsUrl: String) {
        val accounts = AuthStorage.getAccountsByServer(LingCatClientManager.appContext, wsUrl)
        _uiState.value = _uiState.value.copy(historyAccounts = accounts)
    }


    fun onUsernameChange(value: String) { _uiState.value = _uiState.value.copy(username = value, errorMsg = null) }
    fun onPasswordChange(value: String) { _uiState.value = _uiState.value.copy(password = value, errorMsg = null) }
    fun onConfirmPasswordChange(value: String) { _uiState.value = _uiState.value.copy(confirmPassword = value, errorMsg = null) }
    fun clearError() { _uiState.value = _uiState.value.copy(errorMsg = null) }
    fun onNicknameChange(value: String) {
        _uiState.value = _uiState.value.copy(nickname = value, errorMsg = null)
    }

    // ★ 切换登录/注册模式时，清空多余状态
    fun toggleMode() {
        _uiState.value = _uiState.value.copy(
            isRegisterMode = !_uiState.value.isRegisterMode,
            nickname = "",
            password = "",
            confirmPassword = "",
            errorMsg = null
        )
    }

    fun submit() {
        val state = _uiState.value
        val server = state.currentServer ?: run {
            _uiState.value = state.copy(errorMsg = "请先选择或添加一个服务器喵")
            return
        }

        val username = state.username.trim()
        val nickname = state.nickname.trim()
        val password = state.password

        if (state.isRegisterMode) {
            // ★ 注册模式：严格校验昵称
            if (nickname.isEmpty()) {
                _uiState.value = state.copy(errorMsg = "昵称不能为空喵")
                return
            }
            if (password != state.confirmPassword) {
                _uiState.value = state.copy(errorMsg = "两次输入的密码不一致喵")
                return
            }
            // 如果用户没填用户名，我们可以用随机字符串或者留空，让服务端生成
            // 但为了方便，如果为空，我们就传 null 或者空字符串
        } else {
            // 登录模式：严格校验账号
            if (username.isEmpty() || password.isEmpty()) {
                _uiState.value = state.copy(errorMsg = "账号和密码不能为空")
                return
            }
        }

        _uiState.value = state.copy(isLoading = true, errorMsg = null)

        viewModelScope.launch {
            try {
                var client = LingCatClientManager.currentClient
                if (client == null || !client.isReady()) {
                    val result = withContext(Dispatchers.IO) { LingCatClientManager.connect(server) }
                    if (result.isFailure) throw Exception("网络连接失败")
                    client = LingCatClientManager.currentClient!!
                }

                val token = withContext(Dispatchers.IO) {
                    if (state.isRegisterMode) {
                        // 1. 先注册，拿到服务端分配的用户 ID
                        val newUserId = UserApi.register(
                            client,
                            username.ifEmpty { null }, // username 可选，如果为空传 null
                            password,
                            nickname
                        )

                        // 2. 决定用什么账号去登录
                        // 优先用用户填写的 username，如果没填，就用刚刚注册返回的 newUserId
                        val accountToLogin = username.ifEmpty { newUserId }

                        // 3. 调用登录获取 Token
                        UserApi.login(client, accountToLogin, password)
                    } else {
                        // 正常登录模式
                        UserApi.login(client, username, password)
                    }
                }

                if (token.isNullOrEmpty()) throw Exception("获取 Token 失败")
                val me = withContext(Dispatchers.IO) { UserApi.queryMyUserInfo(client, token) }

                LingCatClientManager.setAuthSession(token, me.id)
                AuthStorage.saveAccount(
                    LingCatClientManager.appContext,
                    AccountInfo(username, token, me.id, server.wsUrl)
                )

                LingCatClientManager.startKeepAliveService()

                _uiState.value = _uiState.value.copy(isLoading = false, isSuccess = true)
            } catch (e: Exception) {
                val cause = e.cause ?: e
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMsg = "${if (state.isRegisterMode) "注册" else "登录"}失败: ${cause.message}"
                )
            }
        }
    }

    fun deleteServer(server: ServerConfig) {
        // ★ 核心修复：如果是当前正在使用的服务器，直接拒绝
        if (_uiState.value.currentServer?.wsUrl == server.wsUrl) {
            _uiState.value = _uiState.value.copy(errorMsg = "无法删除正在使用的服务器喵！")
            return
        }

        LingCatClientManager.deleteServer(server)

        val remaining = LingCatClientManager.getSavedServers()
        _uiState.value = _uiState.value.copy(savedServers = remaining)
    }

    fun quickLogin(account: AccountInfo) {
        if (_uiState.value.isLoading) return
        _uiState.value = _uiState.value.copy(isLoading = true, errorMsg = null)

        viewModelScope.launch {
            try {
                val server = LingCatClientManager.getSavedServers().find { it.wsUrl == account.serverWsUrl }
                    ?: throw Exception("找不到服务器配置")

                if (LingCatClientManager.currentServer?.wsUrl != server.wsUrl || LingCatClientManager.currentClient?.isReady() != true) {
                    val result = withContext(Dispatchers.IO) { LingCatClientManager.connect(server) }
                    if (result.isFailure) throw Exception("网络连接失败")
                }

                val client = LingCatClientManager.currentClient!!
                val me = withContext(Dispatchers.IO) { UserApi.queryMyUserInfo(client, account.token) }

                LingCatClientManager.setAuthSession(account.token, me.id)
                AuthStorage.saveAccount(LingCatClientManager.appContext, account)

                _uiState.value = _uiState.value.copy(isLoading = false, isSuccess = true)
            } catch (e: Exception) {
                onUsernameChange(account.username)
                _uiState.value = _uiState.value.copy(isLoading = false, errorMsg = "登录已过期，请重新输入密码喵")
            }
        }
    }
}