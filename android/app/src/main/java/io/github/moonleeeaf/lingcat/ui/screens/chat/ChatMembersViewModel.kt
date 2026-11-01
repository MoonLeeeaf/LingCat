package io.github.moonleeeaf.lingcat.ui.screens.chat

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.classes.Classes.IChatAdmin
import lingcat.classes.Classes.IUser
import lingcat.client_protocol.ChatApi

data class MemberUiModel(
    val user: IUser,
    val role: String, // "owner", "admin", "member"
    val roleDisplayName: String // "群主", "管理员", "成员"
)

data class ChatMembersUiState(
    val isLoading: Boolean = true,
    val errorMsg: String? = null,
    val searchQuery: String = "",
    val owner: List<MemberUiModel> = emptyList(),
    val admins: List<MemberUiModel> = emptyList(),
    val members: List<MemberUiModel> = emptyList()
)

class ChatMembersViewModel : ViewModel() {
    private val TAG = "ChatMembersVM"
    private val _uiState = MutableStateFlow(ChatMembersUiState())
    val uiState: StateFlow<ChatMembersUiState> = _uiState.asStateFlow()

    private var currentChatId: String? = null
    private var allOwner = listOf<MemberUiModel>()
    private var allAdmins = listOf<MemberUiModel>()
    private var allMembers = listOf<MemberUiModel>()

    fun init(chatId: String) {
        if (currentChatId == chatId) return
        currentChatId = chatId
        loadMembers(chatId)
    }

    fun onSearchQueryChange(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        filterMembers(query)
    }

    private fun filterMembers(query: String) {
        val q = query.trim().lowercase()
        if (q.isEmpty()) {
            _uiState.value = _uiState.value.copy(
                owner = allOwner,
                admins = allAdmins,
                members = allMembers
            )
            return
        }

        fun match(model: MemberUiModel): Boolean {
            val u = model.user
            return u.id.lowercase().contains(q) ||
                    u.username.lowercase().contains(q) ||
                    u.nickname.lowercase().contains(q)
        }

        _uiState.value = _uiState.value.copy(
            owner = allOwner.filter { match(it) },
            admins = allAdmins.filter { match(it) },
            members = allMembers.filter { match(it) }
        )
    }

    private fun loadMembers(chatId: String) {
        _uiState.value = _uiState.value.copy(isLoading = true, errorMsg = null)
        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient ?: throw Exception("未连接")
                val token = LingCatClientManager.currentToken ?: throw Exception("未登录")

                // 1. 拉取成员列表
                val rawMembers = withContext(Dispatchers.IO) {
                    ChatApi.getChatMembers(client, token, chatId)
                }

                // 2. 拉取管理员列表
                val rawAdmins = try {
                    withContext(Dispatchers.IO) {
                        ChatApi.getChatAdmins(client, token, chatId)
                    }
                } catch (e: Exception) {
                    emptyList<IChatAdmin>() // 容错，如果没有管理员接口或没权限
                }

                // 3. 处理角色分组
                val adminMap = rawAdmins.associateBy { it.id }
                val ownerList = mutableListOf<MemberUiModel>()
                val adminList = mutableListOf<MemberUiModel>()
                val memberList = mutableListOf<MemberUiModel>()

                for (user in rawMembers) {
                    val adminInfo = adminMap[user.id]
                    when (adminInfo?.role) {
                        "owner" -> ownerList.add(MemberUiModel(user, "owner", "群主"))
                        "admin" -> adminList.add(MemberUiModel(user, "admin", "管理员"))
                        else -> memberList.add(MemberUiModel(user, "member", "成员"))
                    }
                }

                allOwner = ownerList
                allAdmins = adminList
                allMembers = memberList

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    owner = allOwner,
                    admins = allAdmins,
                    members = allMembers
                )
            } catch (e: Exception) {
                Log.e(TAG, "load members failed", e)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMsg = "加载群成员失败: ${e.message}"
                )
            }
        }
    }
}