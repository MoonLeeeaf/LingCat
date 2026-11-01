package io.github.moonleeeaf.lingcat.ui.screens.chat

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.classes.Classes.IChat
import lingcat.classes.Classes.IUser
import lingcat.client_protocol.ChatApi

data class ChatInfoUiState(
    val chat: IChat? = null,
    val isFavourite: Boolean = false,
    val isLoading: Boolean = true,
    val errorMsg: String? = null
)

class ChatInfoViewModel : ViewModel() {
    private val TAG = "ChatInfoVM"
    private val _uiState = MutableStateFlow(ChatInfoUiState())
    val uiState: StateFlow<ChatInfoUiState> = _uiState.asStateFlow()

    private var currentChatId: String? = null

    fun init(chatId: String) {
        if (currentChatId == chatId && _uiState.value.chat != null) return
        currentChatId = chatId

        // 先从缓存极速渲染
        val cached = ProfileCache.getCachedChat(chatId)
        if (cached != null) {
            _uiState.value = _uiState.value.copy(chat = cached, isLoading = false)
        }

        loadChatInfo(chatId)
    }

    private fun loadChatInfo(chatId: String) {
        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient ?: throw Exception("未连接")
                val token = LingCatClientManager.currentToken ?: throw Exception("未登录")

                // 1. 拉取最新 Chat Info
                val chat = withContext(Dispatchers.IO) {
                    ChatApi.queryChatInfo(client, token, chatId)
                }

                // 3. 检查收藏状态
                val favChats = withContext(Dispatchers.IO) {
                    ChatApi.getMyFavouriteChats(client, token, 100, 0)
                }
                val isFav = favChats.any { it.id == chatId }

                _uiState.value = _uiState.value.copy(
                    chat = chat,
                    isFavourite = isFav,
                    isLoading = false
                )
            } catch (e: Exception) {
                Log.e(TAG, "load chat info failed", e)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMsg = "加载失败: ${e.message}"
                )
            }
        }
    }

    fun toggleFavourite() {
        val chatId = currentChatId ?: return
        val targetState = !_uiState.value.isFavourite

        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient ?: return@launch
                val token = LingCatClientManager.currentToken ?: return@launch

                withContext(Dispatchers.IO) {
                    ChatApi.setChatFavourited(client, token, chatId, targetState)
                }
                _uiState.value = _uiState.value.copy(isFavourite = targetState)
            } catch (e: Exception) {
                Log.e(TAG, "toggle fav failed", e)
            }
        }
    }
}