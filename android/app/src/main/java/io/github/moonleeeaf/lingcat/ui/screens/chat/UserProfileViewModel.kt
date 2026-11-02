package io.github.moonleeeaf.lingcat.ui.screens.chat

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.data.RemarksCache
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import lingcat.classes.Classes.IUser
import lingcat.client_protocol.ChatApi

data class UserProfileUiState(
    val user: IUser? = null,
    val remark: String? = null,
    val isLoading: Boolean = false
)

class UserProfileViewModel : ViewModel() {
    private val TAG = "UserProfileVM"
    private val _uiState = MutableStateFlow(UserProfileUiState())
    val uiState: StateFlow<UserProfileUiState> = _uiState.asStateFlow()

    private var currentUserId: String? = null

    fun init(userId: String) {
        if (currentUserId == userId) return
        currentUserId = userId

        // 1. 极速读取本地缓存和备注
        val cachedUser = ProfileCache.getCachedUser(userId)
        val remark = RemarksCache.getRemark(userId)
        _uiState.value = _uiState.value.copy(user = cachedUser, remark = remark)

        // 2. 异步拉取最新资料
        fetchUserInfo(userId)
    }

    private fun fetchUserInfo(userId: String) {
        _uiState.value = _uiState.value.copy(isLoading = _uiState.value.user == null)
        viewModelScope.launch {
            try {
                val latestUser = ProfileCache.fetchUser(userId)
                if (latestUser != null) {
                    _uiState.value = _uiState.value.copy(user = latestUser, isLoading = false)
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            } catch (e: Exception) {
                Log.e(TAG, "fetch user failed", e)
                _uiState.value = _uiState.value.copy(isLoading = false)
            }
        }
    }

    fun saveRemark(newRemark: String) {
        val userId = currentUserId ?: return
        RemarksCache.setRemark(userId, newRemark)
        _uiState.value = _uiState.value.copy(remark = newRemark.ifBlank { null })
    }

    /**
     * 获取或创建私聊，成功后回调 chatId
     */
    fun startPrivateChat(onSuccess: (String) -> Unit) {
        val userId = currentUserId ?: return
        // if (userId == LingCatClientManager.currentUserId) return // 不能和自己私聊

        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient ?: return@launch
                val token = LingCatClientManager.currentToken ?: return@launch

                val chatId = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) {
                    ChatApi.getOrCreatePrivateChat(client, token, userId)
                }
                onSuccess(chatId)
            } catch (e: Exception) {
                Log.e(TAG, "start private chat failed", e)
            }
        }
    }
}