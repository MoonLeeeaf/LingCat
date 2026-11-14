package io.github.moonleeeaf.lingcat.ui.screens.chat

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.data.RemarksCache
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import lingcat.classes.Classes.IUser
import lingcat.client_protocol.ChatApi

data class UserProfileUiState(
    val user: IUser? = null,
    val remark: String? = null,
    val isLoading: Boolean = true,
    /** 完全拿不到资料（且没有缓存兜底）时为 true，界面显示重试入口。 */
    val loadFailed: Boolean = false,
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

    /** 资料加载失败后由界面「重试」按钮调用。 */
    fun retry() {
        val userId = currentUserId ?: return
        fetchUserInfo(userId)
    }

    private fun fetchUserInfo(userId: String) {
        _uiState.value = _uiState.value.copy(
            isLoading = _uiState.value.user == null,
            loadFailed = false,
        )
        viewModelScope.launch {
            try {
                // 资料弹窗是用户主动打开的：失败要尽快暴露并给「重试」按钮，
                // 不在后台悄悄重试（否则用户会对着转圈等十几秒）。
                val latestUser = ProfileCache.requireUser(userId)
                _uiState.value = _uiState.value.copy(
                    user = latestUser ?: _uiState.value.user,
                    isLoading = false,
                    // 服务器确认不存在（null）也算拿不到资料
                    loadFailed = latestUser == null && _uiState.value.user == null,
                )
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "fetch user failed", e)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    // 有缓存就先展示缓存，不拿错误盖掉已有内容
                    loadFailed = _uiState.value.user == null,
                )
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