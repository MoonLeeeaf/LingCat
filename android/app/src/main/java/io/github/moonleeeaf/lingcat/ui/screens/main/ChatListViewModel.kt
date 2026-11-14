package io.github.moonleeeaf.lingcat.ui.screens.main

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.data.db.AppDatabase
import io.github.moonleeeaf.lingcat.data.db.ChatEntity
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.UiText
import io.github.moonleeeaf.lingcat.ui.UiTextException
import io.github.moonleeeaf.lingcat.ui.toUiTextOrNull
import io.github.moonleeeaf.lingcat.ui.uiText
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.classes.Classes
import lingcat.classes.Classes.IChat
import lingcat.client_protocol.ChatApi
import lingcat.client_protocol.DecodeOrThrow
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
    val recentChats: List<IChat> = emptyList(),
    val favouriteChats: List<IChat> = emptyList(),
    val allChats: List<IChat> = emptyList(),
    val unreadCounts: Map<String, Int> = emptyMap(), // ★ 新增：未读数记录
    val errorMsg: UiText? = null,
    /** 「打开对话」弹窗状态：输入 对话 ID / 用户 ID / 用户名 后解析出的 chatId。 */
    val openChat: OpenChatState = OpenChatState(),
    /** 「创建群组」弹窗状态：创建成功后返回的 chatId。 */
    val createGroup: CreateGroupState = CreateGroupState(),
)

/** 「打开对话」的请求状态。 */
data class OpenChatState(
    val isResolving: Boolean = false,
    val errorMsg: UiText? = null,
    /** 解析成功后要跳转的对话；界面消费后需要调用 [ChatListViewModel.resetOpenChatState]。 */
    val chatId: String? = null,
)

/** 「创建群组」的请求状态。 */
data class CreateGroupState(
    val isCreating: Boolean = false,
    val errorMsg: UiText? = null,
    /** 创建成功后要跳转的对话；界面消费后需要调用 [ChatListViewModel.resetCreateGroupState]。 */
    val chatId: String? = null,
)

class ChatListViewModel : ViewModel() {
    private val TAG = "ChatListVM"
    private val _uiState = MutableStateFlow(ChatListUiState())
    val uiState: StateFlow<ChatListUiState> = _uiState.asStateFlow()

    /** 全局 WebSocket 连接状态，供界面显示网络提示条 */
    val connectionState: StateFlow<LingCatClient.ConnectionState> = LingCatClientManager.connectionState

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

        // 从断线恢复为已连接后自动刷新列表：
        // 无论是全局状态条的「重试」还是底层自动重连，都能把断线期间的消息补回来。
        viewModelScope.launch {
            var previous: LingCatClient.ConnectionState? = null
            LingCatClientManager.connectionState.collect { state ->
                val last = previous
                previous = state
                if (state == LingCatClient.ConnectionState.CONNECTED &&
                    last != null &&
                    last != LingCatClient.ConnectionState.CONNECTED
                ) {
                    initAndLoad(isRefresh = true)
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
                val server = LingCatClientManager.currentServer ?: throw UiTextException(uiText(R.string.chat_list_err_server_missing))
                val token = LingCatClientManager.currentToken ?: throw UiTextException(uiText(R.string.chat_list_err_session_expired))

                var client = LingCatClientManager.currentClient
                if (client == null || !client.isReady()) {
                    val result = LingCatClientManager.connect(server)
                    if (result.isFailure) {
                        // 真实原因通常已经是 UiTextException，直接透传，不要再套一层前缀。
                        throw result.exceptionOrNull()
                            ?: UiTextException(uiText(R.string.chat_list_err_connect))
                    }
                    client = LingCatClientManager.currentClient
                }
                if (client == null) throw UiTextException(uiText(R.string.error_client_not_ready))

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
                        errorMsg = cause.toUiTextOrNull()
                            ?: uiText(R.string.chat_list_err_load, cause.message ?: "")
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
        // 保留空实现以兼容旧调用；三个 Tab 已经合并为“全部 / 收藏”筛选。
    }

    // ==========================================
    // 「打开对话 / 创建群组」
    // ==========================================

    /** 关闭「打开对话」弹窗时清空上次的输入结果与错误。 */
    fun resetOpenChatState() {
        _uiState.value = _uiState.value.copy(openChat = OpenChatState())
    }

    /** 关闭「创建群组」弹窗时清空上次的结果与错误。 */
    fun resetCreateGroupState() {
        _uiState.value = _uiState.value.copy(createGroup = CreateGroupState())
    }

    /**
     * 通过「对话 ID / 用户 ID / 用户名」打开对话。
     *
     * 依次尝试：当作对话 ID 查询 → 当作用户 ID 查询 → 当作用户名反查用户 ID；
     * 命中用户时复用（或创建）私聊，最终把 chatId 交给界面跳转。
     */
    fun openChatByInput(rawInput: String) {
        val input = rawInput.trim()
        if (input.isEmpty()) {
            _uiState.value = _uiState.value.copy(
                openChat = OpenChatState(errorMsg = uiText(R.string.open_chat_err_empty))
            )
            return
        }
        if (_uiState.value.openChat.isResolving) return

        _uiState.value = _uiState.value.copy(openChat = OpenChatState(isResolving = true))

        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient
                    ?: throw UiTextException(uiText(R.string.error_not_connected))
                val token = LingCatClientManager.currentToken
                    ?: throw UiTextException(uiText(R.string.error_not_signed_in))

                val (chatId, apiError) = withContext(Dispatchers.IO) {
                    resolveChatId(client, token, input)
                }

                if (chatId.isNullOrEmpty()) {
                    _uiState.value = _uiState.value.copy(
                        openChat = OpenChatState(
                            // 服务器的错误文案更具体（例如“用户不存在”），优先展示。
                            errorMsg = apiError?.let { UiText.Raw(it) }
                                ?: uiText(R.string.open_chat_err_not_found)
                        )
                    )
                } else {
                    _uiState.value = _uiState.value.copy(openChat = OpenChatState(chatId = chatId))
                    // 新建的私聊可能还不在列表里，顺手刷新一次。
                    initAndLoad(isRefresh = true)
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "open chat by input failed", e)
                _uiState.value = _uiState.value.copy(
                    openChat = OpenChatState(
                        errorMsg = e.toUiTextOrNull()
                            ?: uiText(R.string.open_chat_err_failed, e.message ?: "")
                    )
                )
            }
        }
    }

    /**
     * 创建群组。
     *
     * @param rawTitle 群名称，必填。
     * @param rawUnique 群唯一标识符，可留空。
     */
    fun createGroup(rawTitle: String, rawUnique: String) {
        val title = rawTitle.trim()
        if (title.isEmpty()) {
            _uiState.value = _uiState.value.copy(
                createGroup = CreateGroupState(errorMsg = uiText(R.string.create_group_err_empty))
            )
            return
        }
        if (_uiState.value.createGroup.isCreating) return

        val unique = rawUnique.trim().takeIf { it.isNotEmpty() }
        _uiState.value = _uiState.value.copy(createGroup = CreateGroupState(isCreating = true))

        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient
                    ?: throw UiTextException(uiText(R.string.error_not_connected))
                val token = LingCatClientManager.currentToken
                    ?: throw UiTextException(uiText(R.string.error_not_signed_in))

                val chatId = withContext(Dispatchers.IO) {
                    ChatApi.createGroup(client, token, title, unique)
                }

                if (chatId.isNullOrEmpty()) {
                    _uiState.value = _uiState.value.copy(
                        createGroup = CreateGroupState(
                            errorMsg = uiText(R.string.create_group_err_failed, "")
                        )
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        createGroup = CreateGroupState(chatId = chatId)
                    )
                    initAndLoad(isRefresh = true)
                }
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "create group failed", e)
                _uiState.value = _uiState.value.copy(
                    createGroup = CreateGroupState(
                        errorMsg = e.toUiTextOrNull()
                            ?: uiText(R.string.create_group_err_failed, e.message ?: "")
                    )
                )
            }
        }
    }

    /**
     * 把用户输入的「对话 ID / 用户 ID / 用户名」解析成 chatId。
     *
     * @return first = chatId（失败为 null），second = 服务端最近一次返回的错误文案。
     */
    private suspend fun resolveChatId(
        client: LingCatClient,
        token: String,
        input: String,
    ): Pair<String?, String?> {
        var apiError: String? = null

        // 依次尝试三种解释；单个候选失败（找不到 / 类型不匹配）不算整体失败。
        suspend fun <T> attempt(block: suspend () -> T): T? = try {
            block()
        } catch (e: CancellationException) {
            throw e
        } catch (e: DecodeOrThrow.ApiException) {
            apiError = e.message
            null
        } catch (e: Exception) {
            Log.d(TAG, "resolve \"$input\" failed: ${e.message}", e)
            null
        }

        // 1) 对话 ID
        attempt { ChatApi.queryChatInfo(client, token, input) }
            ?.id?.takeIf { it.isNotEmpty() }
            ?.let { return it to null }

        // 2) 用户 ID
        attempt { UserApi.queryUserInfo(client, token, input) }
            ?.id?.takeIf { it.isNotEmpty() }
            ?.let { userId ->
                val chatId = attempt { ChatApi.getOrCreatePrivateChat(client, token, userId) }
                return chatId?.takeIf { it.isNotEmpty() } to apiError
            }

        // 3) 用户名
        val userId = attempt { UserApi.getUserIdByUsername(client, token, input) }
            ?.takeIf { it.isNotEmpty() }
            ?: return null to apiError

        val chatId = attempt { ChatApi.getOrCreatePrivateChat(client, token, userId) }
        return chatId?.takeIf { it.isNotEmpty() } to apiError
    }
}
