package io.github.moonleeeaf.lingcat.ui.screens.chat

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.UiText
import io.github.moonleeeaf.lingcat.ui.UiTextException
import io.github.moonleeeaf.lingcat.ui.toUiTextOrNull
import io.github.moonleeeaf.lingcat.ui.uiText
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
    val errorMsg: UiText? = null
)

class ChatInfoViewModel : ViewModel() {
    private val TAG = "ChatInfoVM"
    private val _uiState = MutableStateFlow(ChatInfoUiState())
    val uiState: StateFlow<ChatInfoUiState> = _uiState.asStateFlow()

    private var currentChatId: String? = null

    fun init(chatId: String) {
        if (currentChatId == chatId && _uiState.value.chat != null) {
            // 已经加载过：对话设定页可能刚改了标题 / 头像，重新打开信息面板时
            // 先用内存缓存同步一次，避免显示旧资料。
            ProfileCache.getCachedChat(chatId)?.let { cached ->
                _uiState.value = _uiState.value.copy(chat = cached)
            }
            return
        }
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
                val client = LingCatClientManager.currentClient ?: throw UiTextException(uiText(R.string.error_not_connected))
                val token = LingCatClientManager.currentToken ?: throw UiTextException(uiText(R.string.error_not_signed_in))

                // 1. 拉取最新 Chat Info
                val chat = withContext(Dispatchers.IO) {
                    ChatApi.queryChatInfo(client, token, chatId)
                }

                // 3. 检查收藏状态
                val favChats = withContext(Dispatchers.IO) {
                    ChatApi.getMyFavouriteChats(client, token, 100, 0)
                }
                val isFav = favChats.any { it.id == chatId }

                // 写回缓存：对话设定页 / 聊天页都从 ProfileCache 取最新资料。
                if (chat != null) {
                    ProfileCache.cacheChats(listOf(chat))
                }

                _uiState.value = _uiState.value.copy(
                    chat = chat,
                    isFavourite = isFav,
                    isLoading = false
                )
            } catch (e: Exception) {
                Log.e(TAG, "load chat info failed", e)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMsg = e.toUiTextOrNull() ?: uiText(R.string.error_load_failed, e.message ?: "")
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