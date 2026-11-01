package io.github.moonleeeaf.lingcat.ui.screens.main

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.data.db.AppDatabase
import io.github.moonleeeaf.lingcat.data.db.ChatEntity
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.classes.Classes
import lingcat.classes.Classes.IChat
import lingcat.client_protocol.ChatApi
import lingcat.client_protocol.LingCatClient
import lingcat.client_protocol.UserApi
import lingcat.protocol.Methods
import lingcat.protocol.Package
import java.util.UUID

// ★ 新增 IDLE 状态
enum class ListLoadState { IDLE, CONNECTING, LOADING_DATA, SUCCESS, ERROR }

data class ChatListUiState(
    val loadState: ListLoadState = ListLoadState.IDLE,
    val isRefreshing: Boolean = false,
    val currentTab: Int = 0,
    val recentChats: List<IChat> = emptyList(),
    val favouriteChats: List<IChat> = emptyList(),
    val allChats: List<IChat> = emptyList(),
    val unreadCounts: Map<String, Int> = emptyMap(), // ★ 新增：未读数记录
    val errorMsg: String? = null
) {
    val currentChats: List<IChat>
        get() = when(currentTab) {
            0 -> recentChats
            1 -> favouriteChats
            else -> allChats
        }
}

class ChatListViewModel : ViewModel() {
    private val TAG = "ChatListVM"
    private val _uiState = MutableStateFlow(ChatListUiState())
    val uiState: StateFlow<ChatListUiState> = _uiState.asStateFlow()

    private var isFetching = false

    private val chatDao by lazy {
        AppDatabase.getDatabase(LingCatClientManager.appContext).chatDao()
    }

    init {
        initAndLoad()

        // ★ 核心修复：直接订阅全局事件流，断线重连后依然有效
        viewModelScope.launch {
            LingCatClientManager.globalEvents.collect { pkg ->
                if (pkg.method_id == Methods.Receive_Chat_Message_Event) {
                    try {
                        val ev = lingcat.methods.Methods.Receive_Chat_Message_Event.parseFrom(pkg.data)
                        if (ev.hasMsg()) {
                            handleNewMessage(ev.msg)
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "parse message event failed", e)
                    }
                }
            }
        }
    }
    private fun loadLocalChats() {
        viewModelScope.launch {
            try {
                val localEntities = withContext(Dispatchers.IO) { chatDao.getAllChats() }
                if (localEntities.isNotEmpty()) {
                    val all = localEntities.map { it.toIChat() }
                    val fav = localEntities.filter { it.isFavourite }.map { it.toIChat() }

                    // 简单粗暴：把本地所有数据当成“全部”展示，最近就取前 50 个
                    val recent = all.take(50)

                    _uiState.value = _uiState.value.copy(
                        recentChats = recent,
                        favouriteChats = fav,
                        allChats = all,
                        loadState = ListLoadState.SUCCESS // 既然有缓存，先变成功状态
                    )
                }
            } catch (e: Exception) {
                Log.e(TAG, "load local chats failed", e)
            }
        }
    }

    // ★ 新增：保存到本地缓存（全量覆盖）
    private suspend fun saveChatsToDb(recent: List<IChat>, fav: List<IChat>, all: List<IChat>) {
        withContext(Dispatchers.IO) {
            try {
                val favIds = fav.map { it.id }.toSet()
                // 把最近、收藏、全部的标志统一算进 all 里存起来
                val entities = all.map { chat ->
                    ChatEntity.from(chat, isFavourite = favIds.contains(chat.id))
                }
                chatDao.clearChats()
                chatDao.insertChats(entities)
            } catch (e: Exception) {
                Log.e(TAG, "save chats to db failed", e)
            }
        }
    }

    // ★ 修改 initAndLoad：先读缓存，再拉网络
    fun initAndLoad(isRefresh: Boolean = false) {
        if (isFetching) return
        isFetching = true

        if (isRefresh) {
            _uiState.value = _uiState.value.copy(isRefreshing = true, errorMsg = null)
        } else {
            // 首次进来，先尝试从本地刷出界面，不让用户看转圈
            loadLocalChats()
            // 如果本地没数据，才显示全屏加载圈
            if (_uiState.value.allChats.isEmpty()) {
                _uiState.value = _uiState.value.copy(loadState = ListLoadState.CONNECTING, errorMsg = null)
            }
        }

        viewModelScope.launch {
            try {
                val server = LingCatClientManager.currentServer ?: throw Exception("服务器配置丢失")
                val token = LingCatClientManager.currentToken ?: throw Exception("登录失效，请重新登录")

                var client = LingCatClientManager.currentClient
                if (client == null || !client.isReady()) {
                    val result = LingCatClientManager.connect(server)
                    if (result.isFailure) throw Exception("网络连接失败: ${result.exceptionOrNull()?.message}")
                    client = LingCatClientManager.currentClient
                }
                if (client == null) throw Exception("客户端未就绪")

                LingCatClientManager.authorize(client, token)

                if (!isRefresh) {
                    _uiState.value = _uiState.value.copy(loadState = ListLoadState.LOADING_DATA)
                }

                val recent = withContext(Dispatchers.IO) { ChatApi.getMyChats(client, token, 50, 0) }
                val fav = withContext(Dispatchers.IO) { ChatApi.getMyFavouriteChats(client, token, 100, 0) }
                val all = withContext(Dispatchers.IO) { ChatApi.getMyChats(client, token, 1000, 0) }

                ProfileCache.cacheChats(all)

                // ★ 网络拉取成功，更新内存 & 保存到数据库
                saveChatsToDb(recent, fav, all)

                _uiState.value = _uiState.value.copy(
                    loadState = ListLoadState.SUCCESS,
                    isRefreshing = false,
                    recentChats = recent,
                    favouriteChats = fav,
                    allChats = all
                )
            } catch (e: Exception) {
                Log.e(TAG, "Load failed", e)
                val cause = e.cause ?: e

                // ★ 核心体验兜底：如果拉取失败，但本地有数据，就静默保留本地数据，不要切 ERROR 状态
                if (_uiState.value.allChats.isNotEmpty()) {
                    _uiState.value = _uiState.value.copy(
                        isRefreshing = false,
                        // 如果你想要个提示，可以弹个 snackbar，但别清空列表
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        loadState = ListLoadState.ERROR,
                        isRefreshing = false,
                        errorMsg = "失败: ${cause.message}"
                    )
                }
            } finally {
                isFetching = false
            }
        }
    }

    // ★ 修改 handleNewMessage：收到新消息，顺手更新数据库
    private fun handleNewMessage(msg: Classes.IMessage) {
        Log.d(TAG, "收到新消息: ${msg.chatId} - ${msg.text}")
        val isMine = msg.senderUserId == LingCatClientManager.currentUserId
        val currentUnread = _uiState.value.unreadCounts[msg.chatId] ?: 0
        val newUnreadMap = _uiState.value.unreadCounts.toMutableMap()

        if (!isMine) {
            newUnreadMap[msg.chatId] = currentUnread + 1
        }

        val newRecent = updateList(_uiState.value.recentChats, msg)
        val newFav = updateList(_uiState.value.favouriteChats, msg)
        val newAll = updateList(_uiState.value.allChats, msg)

        _uiState.value = _uiState.value.copy(
            recentChats = newRecent,
            favouriteChats = newFav,
            allChats = newAll,
            unreadCounts = newUnreadMap
        )

        // ★ 把更新后的列表静默存库
        viewModelScope.launch {
            saveChatsToDb(newRecent, newFav, newAll)
        }
    }

    // updateList 方法保持不变
    private fun updateList(list: List<IChat>, msg: Classes.IMessage): List<IChat> {
        val chatIndex = list.indexOfFirst { it.id == msg.chatId }
        if (chatIndex == -1) {
            // 如果是全新的会话，现在的方案是忽略（或者你可以调一次 API 拉取新 Chat 信息）
            return list
        }

        val targetChat = list[chatIndex]

        var previewText = msg.text

        val updatedChat = targetChat.toBuilder()
            .setLastMessageText(previewText)
            .setLastMessageTime(msg.time)
            .build()

        val newList = list.toMutableList()
        newList.removeAt(chatIndex)
        newList.add(0, updatedChat) // 移到第 0 位

        return newList
    }

    fun selectTab(index: Int) {
        _uiState.value = _uiState.value.copy(currentTab = index)
    }

}