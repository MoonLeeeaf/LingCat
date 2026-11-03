package io.github.moonleeeaf.lingcat.ui.screens.chat

import android.content.Context
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Log
import androidx.compose.foundation.lazy.LazyListState
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.data.db.AppDatabase
import io.github.moonleeeaf.lingcat.data.db.MessageEntity
import io.github.moonleeeaf.lingcat.e2e.E2EStateManager
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.classes.Classes.IMessage
import lingcat.client_protocol.ChatApi
import lingcat.client_protocol.FileApi
import lingcat.client_protocol.LingCatClient
import lingcat.client_protocol.MessageParser
import lingcat.methods.Methods.Receive_Chat_Message_Event
import lingcat.protocol.Methods
import org.json.JSONArray
import org.json.JSONObject

enum class SendStatus { SENDING, FAILED }

data class ChatUiState(
    val isLoading: Boolean = true,
    val messages: List<IMessage> = emptyList(),
    val inputText: String = "",
    val isSending: Boolean = false,
    val errorMsg: String? = null,
    val isLoadingMore: Boolean = false, // ★ 是否正在加载更多
    val hasMore: Boolean = true,        // ★ 是否还有更多历史消息

    val chatTitle: String = "加载中...",
    val peerUserId: String? = null,
    val isGroup: Boolean = false,

    val isE2EActive: Boolean = false, // ★ 是否开启 E2E
    val needUnlock: Boolean = false,   // ★ 是否需要弹解锁框
    val encryptThisMessage: Boolean = true,

    val editingMessage: IMessage? = null,

    val chatMembers: List<lingcat.classes.Classes.IUser> = emptyList(),

    val sendStatusMap: Map<Int, SendStatus> = emptyMap(),
)

class ChatViewModel : ViewModel() {
    private val TAG = "ChatVM"

    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()

    private var currentChatId: String? = null
    private var receiveListener: LingCatClient.OnReceiveListener? = null

    private var encryptStateBeforeEdit = false

    init {
        viewModelScope.launch {
            E2EStateManager.status.collect { status ->
                val peerId = _uiState.value.peerUserId
                val isGroup = _uiState.value.isGroup

                // 如果是私聊，并且不是 DISABLED 状态，就认为开启了 E2E
                val active = peerId != null && !isGroup && status != E2EStateManager.Status.DISABLED

                _uiState.value = _uiState.value.copy(
                    isE2EActive = active,
                    // 如果不可用，顺便把单次加密开关也关掉
                    encryptThisMessage = if (active) _uiState.value.encryptThisMessage else false
                )
            }
        }

        viewModelScope.launch {
            LingCatClientManager.globalEvents.collect { pkg ->
                when (pkg.method_id) {
                    Methods.Receive_Chat_Message_Event -> {
                        try {
                            val ev = Receive_Chat_Message_Event.parseFrom(pkg.data)
                            if (ev.hasMsg() && ev.msg.chatId == currentChatId) {
                                onNewMessageReceived(ev.msg)
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "parse event failed", e)
                        }
                    }
                    // ★ 新增：监听消息编辑事件
                    Methods.Message_Edited_Event -> {
                        try {
                            val ev = lingcat.methods.Methods.Message_Edited_Event.parseFrom(pkg.data)
                            if (ev.chatId == currentChatId) {
                                onMessageEdited(ev)
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "parse edit event failed", e)
                        }
                    }
                }
            }
        }
    }

    private var isLoadingMembers = false

    fun fetchChatMembersIfNeeded() {
        if (_uiState.value.isGroup && _uiState.value.chatMembers.isEmpty() && !isLoadingMembers) {
            isLoadingMembers = true
            viewModelScope.launch {
                try {
                    val client = LingCatClientManager.currentClient ?: return@launch
                    val token = LingCatClientManager.currentToken ?: return@launch
                    val chatId = currentChatId ?: return@launch

                    val members = withContext(Dispatchers.IO) {
                        ChatApi.getChatMembers(client, token, chatId)
                    }
                    _uiState.value = _uiState.value.copy(chatMembers = members)
                } catch (e: Exception) {
                    Log.e(TAG, "fetch members failed", e)
                } finally {
                    isLoadingMembers = false
                }
            }
        }
    }

    // ★ 新增：处理消息被编辑的逻辑
    private fun onMessageEdited(ev: lingcat.methods.Methods.Message_Edited_Event) {
        viewModelScope.launch {
            val currentMessages = _uiState.value.messages
            val index = currentMessages.indexOfFirst { it.id == ev.id }

            if (index != -1) {
                val oldMsg = currentMessages[index]
                // 用事件里的新数据覆盖旧消息
                val updatedMsg = oldMsg.toBuilder()
                    .setText(ev.text)
                    .clearEntities()
                    .addAllEntities(ev.entitiesList)
                    .setEditedAt(ev.editedAt)
                    .build()

                val newList = currentMessages.toMutableList()
                newList[index] = updatedMsg
                // 改完后重新排一下
                val sorted = newList.distinctBy { it.id }.sortedWith(compareByDescending<IMessage> { it.time }.thenByDescending { it.id })
                _uiState.value = _uiState.value.copy(messages = sorted)
                Log.d(TAG, "Message ${ev.id} updated via event")
            }
        }
    }

    // 在 initChat 中也要确保调用了初始化拉取逻辑：
    fun initChat(chatId: String, initialTitle: String? = null) {
        currentChatId = chatId

        if (!initialTitle.isNullOrEmpty()) {
            _uiState.value = _uiState.value.copy(chatTitle = initialTitle)
        }

        if (receiveListener == null) {
            viewModelScope.launch {
                LingCatClientManager.globalEvents.collect { pkg ->
                    if (pkg.method_id == Methods.Receive_Chat_Message_Event) {
                        try {
                            val ev = Receive_Chat_Message_Event.parseFrom(pkg.data)
                            if (ev.hasMsg() && ev.msg.chatId == currentChatId) {
                                onNewMessageReceived(ev.msg)
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "parse event failed", e)
                        }
                    }
                }
            }
            receiveListener = LingCatClient.OnReceiveListener { /* 这是个假对象，只为了标记收集过了 */ }
        }

        _uiState.value = _uiState.value.copy(messages = emptyList(), isLoading = true)

        // ★ 核心修复 2：每次进聊天室，强制刷新 E2E 状态
        viewModelScope.launch {
            E2EStateManager.loadKeyState()
        }

        loadHistoryMessages(chatId)
        fetchChatInfo(chatId)
    }

    private fun fetchChatInfo(chatId: String) {
        viewModelScope.launch {
            try {
                val chat = ProfileCache.fetchChat(chatId)
                if (chat == null) {
                    // ★ 核心修复：拉取不到时，如果还停留在“加载中”，就兜底替换
                    if (_uiState.value.chatTitle == "加载中...") {
                        _uiState.value = _uiState.value.copy(chatTitle = "对话")
                    }
                    return@launch
                }

                var displayTitle = chat.title
                var peerId: String? = null

                if (chat.type == "private" && chat.hasPeerUserId()) {
                    peerId = chat.peerUserId
                    // ★ 优化：先查本地缓存，缓存没有再去拉
                    val peer = ProfileCache.getCachedUser(peerId) ?: ProfileCache.fetchUser(peerId)
                    if (peer != null) {
                        displayTitle = peer.nickname.ifEmpty { peer.username }
                    }
                    if (displayTitle.isBlank()) {
                        displayTitle = "私聊"
                    }
                } else if (displayTitle.isBlank()) {
                    displayTitle = "群聊"
                }

                _uiState.value = _uiState.value.copy(
                    chatTitle = displayTitle,
                    peerUserId = peerId,
                    isGroup = chat.type == "group"
                )
                updateE2EState()
            } catch (e: Exception) {
                Log.e(TAG, "fetch chat info failed", e)
                // ★ 异常发生时，防止卡死
                if (_uiState.value.chatTitle == "加载中...") {
                    _uiState.value = _uiState.value.copy(chatTitle = "对话")
                }
            }
        }
    }

    fun startEditing(message: IMessage) {
        viewModelScope.launch {
            encryptStateBeforeEdit = _uiState.value.encryptThisMessage
            var rawText = message.text ?: ""
            val e2eEntity = message.entitiesList.find { it.type == "e2e" }
            val isE2EMessage = e2eEntity != null

            if (e2eEntity != null) {
                if (E2EStateManager.status.value != E2EStateManager.Status.UNLOCKED) {
                    _uiState.value = _uiState.value.copy(errorMsg = "请先解锁端到端加密再编辑该消息")
                    return@launch
                }
                val plainJson = E2EStateManager.decryptFromPeer(e2eEntity.data, message.senderUserId)
                if (plainJson != null) {
                    try {
                        val obj = JSONObject(plainJson)
                        val text = obj.optString("text", "")
                        val entArr = obj.optJSONArray("entities")
                        val newEntities = mutableListOf<lingcat.classes.Classes.IMessageEntity>()
                        if (entArr != null) {
                            for (i in 0 until entArr.length()) {
                                val je = entArr.getJSONObject(i)
                                newEntities.add(lingcat.classes.Classes.IMessageEntity.newBuilder()
                                    .setType(je.getString("type"))
                                    .setOffset(je.getInt("offset"))
                                    .setLength(je.getInt("length"))
                                    .setData(je.optString("data", ""))
                                    .build())
                            }
                        }
                        rawText = MessageParser.entitiesToRawRichText(text, newEntities)
                    } catch (e: Exception) {
                        // fallback
                    }
                }
            } else {
                // 普通富文本转回 Markdown
                rawText = MessageParser.entitiesToRawRichText(message.text ?: "", message.entitiesList)
            }

            _uiState.value = _uiState.value.copy(
                editingMessage = message,
                inputText = rawText,
                // ★ 同步挂锁状态：如果是加密消息，强制打开发送加密；如果是明文，就关掉
                encryptThisMessage = isE2EMessage
            )
        }
    }

    fun cancelEditing() {
        _uiState.value = _uiState.value.copy(
            editingMessage = null,
            inputText = "",
            // ★ 恢复编辑前的挂锁状态
            encryptThisMessage = encryptStateBeforeEdit
        )
    }

    fun toggleEncryptThisMessage() {
        if (!_uiState.value.isE2EActive) return
        _uiState.value = _uiState.value.copy(
            encryptThisMessage = !_uiState.value.encryptThisMessage
        )
    }

    // 刷新 E2E 状态时，如果变成不可用，顺便把开关关掉
    private fun updateE2EState() {
        val peerId = _uiState.value.peerUserId
        val isGroup = _uiState.value.isGroup
        val e2eStatus = E2EStateManager.status.value

        // ★ 必须确保对方也有公钥，才认为是激活了 E2E
        val hasPeerKey = peerId != null && E2EStateManager.getPeerPublicKey(peerId) != null

        // 只有私聊 + 不是禁用状态 + 对方有公钥，才认为开启了 E2E
        val active = hasPeerKey && !isGroup && e2eStatus != E2EStateManager.Status.DISABLED

        _uiState.value = _uiState.value.copy(
            isE2EActive = active,
            encryptThisMessage = if (active) _uiState.value.encryptThisMessage else false
        )
    }
    // ★ 获取数据库 DAO
    private val messageDao by lazy {
        AppDatabase.getDatabase(LingCatClientManager.appContext).messageDao()
    }

    // ★ 改造：加载历史消息
    fun loadHistoryMessages(chatId: String) {
        // 1. 一进来，先置为加载中
        _uiState.value = _uiState.value.copy(isLoading = true, errorMsg = null)

        viewModelScope.launch {
            // ★ 核心改动 1：不管有没有网，先死磕本地数据库，给用户兜底
            val localEntities = withContext(Dispatchers.IO) {
                messageDao.getLatestMessages(chatId, 50)
            }
            if (localEntities.isNotEmpty()) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false, // 只要本地有，立刻关掉全屏转圈
                    messages = localEntities.map { it.toIMessage() }
                )
            }

            // 2. 如果网络环境允许，再去拉网络数据
            try {
                val client = LingCatClientManager.currentClient
                val token = LingCatClientManager.currentToken

                // 如果客户端没连上或者 token 为空，说明断网，直接返回，保留本地数据
                if (client == null || token == null || !client.isReady()) {
                    if (localEntities.isEmpty()) {
                        _uiState.value = _uiState.value.copy(isLoading = false, errorMsg = "网络断开，无本地记录")
                    }
                    return@launch
                }

                // 3. 发起网络请求
                val remoteHistory = withContext(Dispatchers.IO) {
                    ChatApi.getChatMessages(client, token, chatId, null, null, 50)
                }
                val reversedRemote = remoteHistory.reversed()

                if (reversedRemote.isNotEmpty()) {
                    // 存入数据库
                    withContext(Dispatchers.IO) {
                        messageDao.insertMessages(reversedRemote.map { MessageEntity.from(it) })
                    }

                    // ★ 核心改动 2：网络数据安全合并
                    // 这里只合并最新的 50 条，即使本地有陈旧的历史碎片，也不会造成中间断层
                    // 因为万一中间有断层，用户往上滑时，loadMoreMessages 会检测到并去请求网络。
                    val combined = (reversedRemote + _uiState.value.messages)
                        .distinctBy { it.id }
                        .sortedWith(compareByDescending<IMessage> { it.time }.thenByDescending { it.id })

                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        messages = combined,
                        errorMsg = null
                    )
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }

            } catch (e: Exception) {
                Log.e(TAG, "load remote history failed", e)
                // ★ 核心改动 3：网络炸了，如果本地有数据，千万别弹“加载失败”
                if (_uiState.value.messages.isEmpty()) {
                    _uiState.value = _uiState.value.copy(isLoading = false, errorMsg = "加载失败")
                } else {
                    _uiState.value = _uiState.value.copy(isLoading = false)
                }
            }
        }
    }

    // 抽离出一个本地查询的方法，单纯用来断网兜底
    private suspend fun loadFromLocal(chatId: String) {
        try {
            val localEntities = withContext(Dispatchers.IO) {
                messageDao.getLatestMessages(chatId, 50)
            }
            val localMsgs = localEntities.map { it.toIMessage() }
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                messages = localMsgs,
                errorMsg = if (localMsgs.isEmpty()) "网络断开，无本地记录" else null
            )
        } catch (dbE: Exception) {
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                errorMsg = "加载消息失败"
            )
        }
    }

    // ★ 收到新消息时，存入数据库
    private fun onNewMessageReceived(msg: IMessage) {
        viewModelScope.launch {
            // 存库
            withContext(Dispatchers.IO) {
                messageDao.insertMessage(MessageEntity.from(msg))
            }

            val state = _uiState.value
            if (state.messages.any { it.id == msg.id }) return@launch

            val newList = (state.messages + msg)
                .distinctBy { it.id }
                .sortedWith(compareByDescending<IMessage> { it.time }.thenByDescending { it.id })

            _uiState.value = state.copy(messages = newList)
        }
    }

    /**
     * 根据 ID 查找消息。
     * 优先查内存，其次查本地 Room 数据库，最后请求网络兜底。
     */
    suspend fun getMessageById(targetId: Int): IMessage? {
        // 1. 查内存
        val inMemory = _uiState.value.messages.find { it.id == targetId }
        if (inMemory != null) return inMemory

        // 2. 查数据库
        try {
            val localEntity = withContext(Dispatchers.IO) {
                messageDao.getMessageById(targetId)
            }
            if (localEntity != null) return localEntity.toIMessage()
        } catch (e: Exception) {
            Log.e(TAG, "query db msg failed", e)
        }

        // 3. 查网络
        try {
            val client = LingCatClientManager.currentClient ?: return null
            val token = LingCatClientManager.currentToken ?: return null
            val chatId = currentChatId ?: return null

            val fetched = withContext(Dispatchers.IO) {
                ChatApi.getChatMessages(client, token, chatId, targetId + 1, targetId - 1, 1)
            }
            val targetMsg = fetched.find { it.id == targetId }

            // 顺手存数据库
            if (targetMsg != null) {
                withContext(Dispatchers.IO) {
                    messageDao.insertMessage(MessageEntity.from(targetMsg))
                }
            }
            return targetMsg
        } catch (e: Exception) {
            Log.e(TAG, "query network msg failed", e)
        }
        return null
    }

    // 增加一个 isLoadingNewer 状态
    private var isLoadingNewer = false

    fun loadMoreNewer() {
        val state = _uiState.value
        if (isLoadingNewer || state.isLoading || state.isLoadingMore) return

        val newestMsgInList = state.messages.firstOrNull() ?: return
        val chatId = currentChatId ?: return

        isLoadingNewer = true
        viewModelScope.launch {
            try {
                var shouldFetchNetwork = true

                // 查本地
                val localNewerEntities = withContext(Dispatchers.IO) {
                    messageDao.getMessagesAfter(chatId, newestMsgInList.id, 50)
                }

                if (localNewerEntities.isNotEmpty()) {
                    // 连续性检测 (最新一条 ID - 当前 ID <= 查到数量)
                    val idDiff = localNewerEntities.last().id - newestMsgInList.id
                    val isContinuous = idDiff <= localNewerEntities.size

                    if (isContinuous) {
                        val localNewer = localNewerEntities.map { it.toIMessage() }
                        val newList = (state.messages + localNewer)
                            .distinctBy { it.id }
                            .sortedWith(compareByDescending<IMessage> { it.time }.thenByDescending { it.id })

                        _uiState.value = _uiState.value.copy(messages = newList)

                        if (localNewerEntities.size >= 50) {
                            isLoadingNewer = false
                            shouldFetchNetwork = false
                        }
                    } else {
                        Log.w(TAG, "向下加载遇到断层，强制走网络")
                    }
                }

                // 查网络
                if (shouldFetchNetwork) {
                    val client = LingCatClientManager.currentClient ?: throw Exception("未连接")
                    val token = LingCatClientManager.currentToken ?: throw Exception("未登录")

                    val remoteNewer = withContext(Dispatchers.IO) {
                        ChatApi.getChatMessages(client, token, chatId, null, newestMsgInList.id, 50)
                    }

                    if (remoteNewer.isNotEmpty()) {
                        withContext(Dispatchers.IO) {
                            messageDao.insertMessages(remoteNewer.map { MessageEntity.from(it) })
                        }

                        val newList = (_uiState.value.messages + remoteNewer)
                            .distinctBy { it.id }
                            .sortedWith(compareByDescending<IMessage> { it.time }.thenByDescending { it.id })

                        _uiState.value = _uiState.value.copy(messages = newList)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "load more newer failed", e)
            } finally {
                isLoadingNewer = false
            }
        }
    }

    // ★ 发送成功后，自己发的消息也要回显存库并展示
    // (注意：这里通常会收到服务端的回显事件，如果没收到，可以在 sendMessage 成功后手动塞入一个假 msg 存库，这里我们依赖 WS 回显)

    // ★ 加载更多历史消息时，优先从本地拿
    fun loadMoreMessages() {
        val state = _uiState.value
        if (state.isLoadingMore || !state.hasMore || state.messages.isEmpty()) return

        _uiState.value = state.copy(isLoadingMore = true)

        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient ?: throw Exception("未连接")
                val token = LingCatClientManager.currentToken ?: throw Exception("未登录")
                val chatId = currentChatId ?: return@launch

                val oldestMsg = state.messages.last()
                val oldestMsgId = oldestMsg.id

                var useLocalData = false
                var localMsgs = emptyList<IMessage>()

                // 1. 查本地
                val localEntities = withContext(Dispatchers.IO) {
                    messageDao.getMessagesBefore(chatId, oldestMsgId, 50)
                }

                if (localEntities.isNotEmpty()) {
                    val mostRecentLocalId = localEntities.first().id
                    val gap = oldestMsgId - mostRecentLocalId

                    // ★ 连续性检测：差值最大不能超过本地查到的条数！
                    // 如果 oldest 是 2791，本地下一条是 1507，差值 1284，肯定大于 50，直接判定断层！
                    if (gap <= localEntities.size) {
                        useLocalData = true
                        localMsgs = localEntities.map { it.toIMessage() }
                    } else {
                        Log.w(TAG, "本地数据断层：$oldestMsgId 到 $mostRecentLocalId，强制走网络")
                    }
                }

                if (useLocalData) {
                    // 本地连续，直接拼接
                    val newList = (state.messages + localMsgs)
                        .distinctBy { it.id }
                        .sortedWith(compareByDescending<IMessage> { it.time }.thenByDescending { it.id })

                    _uiState.value = _uiState.value.copy(
                        messages = newList,
                        isLoadingMore = false,
                        hasMore = localEntities.size >= 50
                    )
                } else {
                    // 2. 本地断层或没数据，走网络
                    val olderMessages = withContext(Dispatchers.IO) {
                        ChatApi.getChatMessages(client, token, chatId, oldestMsgId, null, 50)
                    }

                    if (olderMessages.isNotEmpty()) {
                        withContext(Dispatchers.IO) {
                            messageDao.insertMessages(olderMessages.map { MessageEntity.from(it) })
                        }
                        val newList = (_uiState.value.messages + olderMessages.reversed())
                            .distinctBy { it.id }
                            .sortedWith(compareByDescending<IMessage> { it.time }.thenByDescending { it.id })

                        _uiState.value = _uiState.value.copy(
                            messages = newList,
                            isLoadingMore = false,
                            hasMore = olderMessages.size >= 50
                        )
                    } else {
                        _uiState.value = _uiState.value.copy(isLoadingMore = false, hasMore = false)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "load more failed", e)
                _uiState.value = _uiState.value.copy(isLoadingMore = false)
            }
        }
    }

    // ============================================================
    // 跳转到任意位置 (用于点击引用回复、或者从搜索/通知跳转)
    // ============================================================
    suspend fun jumpToMessage(targetMsgId: Int, listState: LazyListState): Boolean {
        val index = _uiState.value.messages.indexOfFirst { it.id == targetMsgId }
        if (index != -1) {
            listState.animateScrollToItem(index)
            return true
        }

        _uiState.value = _uiState.value.copy(isLoading = true)
        try {
            val client = LingCatClientManager.currentClient ?: throw Exception("未连接")
            val token = LingCatClientManager.currentToken ?: throw Exception("未登录")
            val chatId = currentChatId ?: return false

            val contextMessages = withContext(Dispatchers.IO) {
                ChatApi.getChatMessages(client, token, chatId, targetMsgId + 50, targetMsgId - 1, 50)
            }

            if (contextMessages.isNotEmpty()) {
                val sortedMessages = contextMessages
                    .distinctBy { it.id }
                    .sortedWith(compareByDescending<IMessage> { it.time }.thenByDescending { it.id })

                withContext(Dispatchers.IO) {
                    messageDao.insertMessages(sortedMessages.map { MessageEntity.from(it) })
                }

                // ★ 覆盖内存
                _uiState.value = _uiState.value.copy(
                    messages = sortedMessages,
                    isLoading = false,
                    hasMore = true
                )

                val newIndex = sortedMessages.indexOfFirst { it.id == targetMsgId }
                if (newIndex != -1) {
                    listState.scrollToItem(newIndex)
                }
                return true
            }
        } catch (e: Exception) {
            Log.e(TAG, "jump failed", e)
        }
        _uiState.value = _uiState.value.copy(isLoading = false)
        return false
    }

    fun onInputChange(text: String) {
        _uiState.value = _uiState.value.copy(inputText = text)
    }

    // ★ 1. 缓存待上传的文件 (原始文件名 -> 文件信息)
    data class CachedFile(val uri: Uri, val name: String, val mime: String)
    private val cachedFiles = mutableMapOf<String, CachedFile>()

    /**
     * 选中文件后，将占位符插入输入框，并加入缓存
     */
    fun addFileToInput(context: Context, uri: Uri) {
        viewModelScope.launch {
            try {
                val (name, mime) = withContext(Dispatchers.IO) {
                    var fileName = "文件_${System.currentTimeMillis()}"
                    var mimeType = context.contentResolver.getType(uri) ?: "application/octet-stream"

                    context.contentResolver.query(uri, null, null, null, null)?.use { cursor ->
                        if (cursor.moveToFirst()) {
                            val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                            if (nameIndex >= 0) fileName = cursor.getString(nameIndex)
                        }
                    }
                    Pair(fileName, mimeType)
                }

                // 处理重名
                var finalName = name
                var i = 1
                while (cachedFiles.containsKey(finalName)) {
                    finalName = "${name}_${i}"
                    i++
                }

                cachedFiles[finalName] = CachedFile(uri, name, mime)

                // 判断类型前缀，对齐 Web 端
                val prefix = when {
                    mime.startsWith("image/") -> "图片"
                    mime.startsWith("video/") -> "视频"
                    mime.startsWith("audio/") -> "音频"
                    else -> "文件"
                }

                // 插入到输入框
                val insertText = "![$prefix-$finalName]($finalName)"
                _uiState.value = _uiState.value.copy(
                    inputText = _uiState.value.inputText + insertText
                )

            } catch (e: Exception) {
                Log.e(TAG, "addFile failed", e)
                _uiState.value = _uiState.value.copy(errorMsg = "读取文件失败")
            }
        }
    }

    /**
     * 发送时先上传所有附件，并替换文本中的占位符
     */
    private suspend fun uploadAndReplaceAttachments(rawText: String): String = withContext(Dispatchers.IO) {
        if (cachedFiles.isEmpty()) return@withContext rawText

        var processedText = rawText
        val client = LingCatClientManager.currentClient ?: throw Exception("未连接")
        val token = LingCatClientManager.currentToken ?: throw Exception("未登录")
        val chatId = currentChatId ?: throw Exception("无聊天ID")

        // 找出文本里真正包含的文件
        val toUpload = cachedFiles.keys.filter { processedText.contains("($it)") }
        if (toUpload.isEmpty()) return@withContext rawText

        // 申请一次上传 Token
        val uploadToken = FileApi.requestUploadFileToken(client, token, 30000L)

        for (fileName in toUpload) {
            val cf = cachedFiles[fileName] ?: continue

            // 读取文件字节
            val bytes = android.os.Build.VERSION.SDK_INT.let {
                // 如果需要，这里可以通过 context 读取，由于我们拿不到 context，最好在 addFile 时一并读入内存，或者用全局 Context
                LingCatClientManager.appContext.contentResolver.openInputStream(cf.uri)?.use { it.readBytes() }
            } ?: throw Exception("读取文件失败: ${cf.name}")

            // 上传
            val hash = FileApi.uploadFile(client, uploadToken, chatId, bytes, cf.mime, cf.name)

            // 替换文本里的 (文件名) 为 (file:hash)
            processedText = processedText.replace("($fileName)", "(file:$hash)")
        }

        processedText
    }

    fun sendMessage() {
        val chatId = currentChatId ?: return
        val rawText = _uiState.value.inputText.trim()
        if (rawText.isEmpty() || _uiState.value.isSending) return

        // 1. 构建临时消息
        val tempId = -System.currentTimeMillis().toInt() // 负数 ID
        val tempTime = System.currentTimeMillis()
        val parsed = MessageParser.parseMessage(rawText)

        val tempMsg = IMessage.newBuilder()
            .setId(tempId)
            .setChatId(chatId)
            .setSenderUserId(LingCatClientManager.currentUserId ?: "")
            .setText(parsed.text)
            .addAllEntities(parsed.entities ?: emptyList())
            .setTime(tempTime)
            .build()

        // 2. 立即上屏（乐观更新）
        val currentList = _uiState.value.messages.toMutableList()
        currentList.add(0, tempMsg)
        val newStatusMap = _uiState.value.sendStatusMap.toMutableMap()
        newStatusMap[tempId] = SendStatus.SENDING

        _uiState.value = _uiState.value.copy(
            messages = currentList,
            sendStatusMap = newStatusMap,
            inputText = "",
            isSending = true
        )

        // 3. 执行真正的发送
        performSend(chatId, rawText, tempId)
    }

    fun resendMessage(tempId: Int) {
        val chatId = currentChatId ?: return
        val msg = _uiState.value.messages.find { it.id == tempId } ?: return
        if (_uiState.value.sendStatusMap[tempId] != SendStatus.FAILED) return

        // 还原原始文本（使用 entitiesToRawRichText 兜底）
        val rawText = MessageParser.entitiesToRawRichText(msg.text, msg.entitiesList)

        val newStatusMap = _uiState.value.sendStatusMap.toMutableMap()
        newStatusMap[tempId] = SendStatus.SENDING
        _uiState.value = _uiState.value.copy(sendStatusMap = newStatusMap, isSending = true)

        performSend(chatId, rawText, tempId)
    }

    private fun performSend(chatId: String, rawText: String, tempId: Int) {
        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient ?: throw Exception("未连接")
                val token = LingCatClientManager.currentToken ?: throw Exception("未登录")

                // 1. 解析文本
                var parsed = withContext(Dispatchers.Default) { MessageParser.parseMessage(rawText) }
                var finalText = parsed.text
                var finalEntities = parsed.entities ?: emptyList()

                // 2. 处理附件
                if (cachedFiles.isNotEmpty()) {
                    val uploadedText = uploadAndReplaceAttachments(rawText)
                    parsed = withContext(Dispatchers.Default) { MessageParser.parseMessage(uploadedText) }
                    finalText = parsed.text
                    finalEntities = parsed.entities ?: emptyList()
                }

                // 3. 处理 E2E 加密
                val peerId = _uiState.value.peerUserId
                val isE2E = _uiState.value.isE2EActive && _uiState.value.encryptThisMessage && peerId != null
                if (isE2E) {
                    if (E2EStateManager.status.value != E2EStateManager.Status.UNLOCKED) {
                        throw Exception("端到端加密未解锁")
                    }
                    withContext(Dispatchers.IO) { E2EStateManager.fetchPeerKey(peerId!!, force = true) }

                    val payloadJson = JSONObject().apply {
                        put("text", parsed.text)
                        val arr = JSONArray()
                        parsed.entities?.forEach { e ->
                            arr.put(JSONObject().apply {
                                put("type", e.type)
                                put("offset", e.offset)
                                put("length", e.length)
                                put("data", e.data)
                            })
                        }
                        put("entities", arr)
                    }.toString()

                    val encryptedData = E2EStateManager.encryptForPeer(payloadJson, peerId!!)
                    if (encryptedData != null) {
                        finalText = "🔒"
                        finalEntities = listOf(
                            lingcat.classes.Classes.IMessageEntity.newBuilder()
                                .setType("e2e")
                                .setOffset(0)
                                .setLength(1)
                                .setData(encryptedData)
                                .build()
                        )
                    } else {
                        throw Exception("端到端加密失败，请重试")
                    }
                }

                // 4. 发送
                val newMsgId = withContext(Dispatchers.IO) {
                    ChatApi.sendChatMessage(client, token, chatId, finalText, finalEntities)
                }

                // 5. 发送成功，替换临时消息
                withContext(Dispatchers.Main) {
                    val currentList = _uiState.value.messages.toMutableList()
                    val index = currentList.indexOfFirst { it.id == tempId }
                    if (index != -1) {
                        val finalMsg = currentList[index].toBuilder()
                            .setId(newMsgId)
                            .setText(finalText) // 如果加密了，这里就会替换成 🔒
                            .clearEntities()
                            .addAllEntities(finalEntities)
                            .build()
                        currentList[index] = finalMsg
                    }
                    val newStatusMap = _uiState.value.sendStatusMap.toMutableMap()
                    newStatusMap.remove(tempId)

                    _uiState.value = _uiState.value.copy(
                        messages = currentList,
                        sendStatusMap = newStatusMap,
                        isSending = false
                    )
                    cachedFiles.clear()
                }

            } catch (e: Exception) {
                Log.e(TAG, "send failed", e)
                withContext(Dispatchers.Main) {
                    val newStatusMap = _uiState.value.sendStatusMap.toMutableMap()
                    newStatusMap[tempId] = SendStatus.FAILED
                    _uiState.value = _uiState.value.copy(
                        sendStatusMap = newStatusMap,
                        isSending = false,
                        errorMsg = "发送失败: ${e.message}"
                    )
                }
            }
        }
    }

    // 4. 清理弹窗状态
    fun clearNeedUnlock() {
        _uiState.value = _uiState.value.copy(needUnlock = false)
    }

    override fun onCleared() {
        super.onCleared()
        receiveListener?.let { LingCatClientManager.currentClient?.removeOnReceiveListener(it) }
    }
}