package io.github.moonleeeaf.lingcat.ui.screens.chat

import android.util.Log
import androidx.annotation.StringRes
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
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
import lingcat.classes.Classes.IChatAdmin
import lingcat.classes.Classes.IUser
import lingcat.client_protocol.ChatApi

data class MemberUiModel(
    val user: IUser,
    val role: String, // "owner", "admin", "member"
    @StringRes val roleLabelRes: Int // 展示用的角色名，交给界面本地化
)

data class ChatMembersUiState(
    val isLoading: Boolean = true,
    val errorMsg: UiText? = null,
    val searchQuery: String = "",
    val owner: List<MemberUiModel> = emptyList(),
    val admins: List<MemberUiModel> = emptyList(),
    val members: List<MemberUiModel> = emptyList(),
    val myRole: String = "member",
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
                val client = LingCatClientManager.currentClient ?: throw UiTextException(uiText(R.string.error_not_connected))
                val token = LingCatClientManager.currentToken ?: throw UiTextException(uiText(R.string.error_not_signed_in))

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

                val myId = LingCatClientManager.currentUserId
                val myAdminInfo = rawAdmins.find { it.id == myId }
                val myRole = myAdminInfo?.role ?: "member"

                // 3. 处理角色分组
                val adminMap = rawAdmins.associateBy { it.id }
                val ownerList = mutableListOf<MemberUiModel>()
                val adminList = mutableListOf<MemberUiModel>()
                val memberList = mutableListOf<MemberUiModel>()

                for (user in rawMembers) {
                    val adminInfo = adminMap[user.id]
                    when (adminInfo?.role) {
                        "owner" -> ownerList.add(MemberUiModel(user, "owner", R.string.label_owner))
                        "admin" -> adminList.add(MemberUiModel(user, "admin", R.string.chat_members_group_admin))
                        else -> memberList.add(MemberUiModel(user, "member", R.string.chat_members_role_member))
                    }
                }

                allOwner = ownerList
                allAdmins = adminList
                allMembers = memberList

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    owner = allOwner,
                    admins = allAdmins,
                    members = allMembers,
                    myRole = myRole,
                )
            } catch (e: Exception) {
                Log.e(TAG, "load members failed", e)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    errorMsg = e.toUiTextOrNull()
                        ?: uiText(R.string.chat_members_err_load, e.message ?: "")
                )
            }
        }
    }

    fun removeMember(chatId: String, user: IUser) {
        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient ?: return@launch
                val token = LingCatClientManager.currentToken ?: return@launch
                withContext(Dispatchers.IO) {
                    ChatApi.removeChatMember(client, token, chatId, user.id)
                }
                // 成功后刷新列表
                loadMembers(chatId)
            } catch (e: Exception) {
                Log.e(TAG, "remove member failed", e)
            }
        }
    }

    // ★ 新增操作：添加为管理员
    fun addAdmin(chatId: String, user: IUser) {
        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient ?: return@launch
                val token = LingCatClientManager.currentToken ?: return@launch
                withContext(Dispatchers.IO) {
                    // 默认给予空权限，后续可再编辑
                    ChatApi.addChatAdmin(client, token, chatId, user.id, "{}")
                }
                loadMembers(chatId)
            } catch (e: Exception) {
                Log.e(TAG, "add admin failed", e)
            }
        }
    }

    // ★ 新增操作：移除管理员
    fun removeAdmin(chatId: String, user: IUser) {
        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient ?: return@launch
                val token = LingCatClientManager.currentToken ?: return@launch
                withContext(Dispatchers.IO) {
                    ChatApi.removeChatAdmin(client, token, chatId, user.id)
                }
                loadMembers(chatId)
            } catch (e: Exception) {
                Log.e(TAG, "remove admin failed", e)
            }
        }
    }
}