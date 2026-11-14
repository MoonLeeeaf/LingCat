package io.github.moonleeeaf.lingcat.ui.screens.chat

import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.UiText
import io.github.moonleeeaf.lingcat.ui.UiTextException
import io.github.moonleeeaf.lingcat.ui.toUiTextOrNull
import io.github.moonleeeaf.lingcat.ui.uiText
import io.github.moonleeeaf.lingcat.ui.utils.cropImageToSquare
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.classes.Classes.IChat
import lingcat.classes.Classes.IChatAdmin
import lingcat.client_protocol.ChatApi
import lingcat.client_protocol.FileApi
import org.json.JSONObject

/** 对话设定里可以修改的群组资料字段。 */
enum class ChatProfileField {
    TITLE,
    DESCRIPTION,
    UNIQUE,
}

data class ChatSettingsUiState(
    val isLoading: Boolean = true,
    val loadError: UiText? = null,
    val chat: IChat? = null,

    /** 是否允许非成员直接加入。 */
    val allowJoin: Boolean = false,
    /** 是否允许在该群组发起会议；服务器未设置时默认允许。 */
    val allowMeeting: Boolean = true,

    // 权限：群主默认拥有全部权限，普通管理员按服务器下发的 permissions 判断。
    val canEditInfo: Boolean = false,
    val canEditSettings: Boolean = false,

    val isSavingSettings: Boolean = false,
    val isSavingProfile: Boolean = false,
    val isUploadingAvatar: Boolean = false,

    val errorMsg: UiText? = null,
    val successMsg: UiText? = null,
)

/**
 * 「对话设定」页面。
 *
 * 与 Web 端 ChatSettingsDialog 对齐：群组资料（头像 / 标题 / 简介 / 标识符）走
 * `Update_Chat_Profile_Request`，入群设置（允许加入 / 允许会议）走
 * `Update_Chat_Settings_Request`。两个接口都只对群主或拥有对应权限的管理员开放，
 * 因此先拉一次管理员列表来决定界面是否可编辑，避免普通成员点了才报错。
 */
class ChatSettingsViewModel : ViewModel() {
    private val TAG = "ChatSettingsVM"

    private val _uiState = MutableStateFlow(ChatSettingsUiState())
    val uiState: StateFlow<ChatSettingsUiState> = _uiState.asStateFlow()

    private var currentChatId: String? = null

    fun init(chatId: String) {
        if (currentChatId == chatId && _uiState.value.chat != null) return
        currentChatId = chatId
        load()
    }

    fun reload() {
        if (currentChatId == null) return
        load()
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(errorMsg = null, successMsg = null)
    }

    private fun load() {
        val chatId = currentChatId ?: return
        _uiState.value = _uiState.value.copy(isLoading = true, loadError = null)

        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient
                    ?: throw UiTextException(uiText(R.string.error_not_connected))
                val token = LingCatClientManager.currentToken
                    ?: throw UiTextException(uiText(R.string.error_not_signed_in))

                // 必须拿服务器最新的资料：标题 / 设置可能刚被其他管理员改过。
                val chat = withContext(Dispatchers.IO) {
                    ProfileCache.refreshChat(chatId)
                } ?: throw UiTextException(
                    uiText(R.string.chat_settings_load_failed, "chat not found")
                )

                // 管理员列表用于判断当前账号有没有 edit_info / edit_settings 权限。
                // 普通成员也能成功请求这个接口，失败时按“无权限”处理即可。
                val admins = try {
                    withContext(Dispatchers.IO) {
                        ChatApi.getChatAdmins(client, token, chatId)
                    }
                } catch (e: CancellationException) {
                    throw e
                } catch (e: Exception) {
                    Log.w(TAG, "load chat admins failed", e)
                    emptyList<IChatAdmin>()
                }

                val me = admins.find { it.id == LingCatClientManager.currentUserId }
                val isOwner = me?.role == "owner"
                val permissions = parseJson(me?.permissions)
                val canEditInfo = isOwner || permissions.optBoolean("edit_info", false)
                val canEditSettings = isOwner || permissions.optBoolean("edit_settings", false)

                val settings = parseJson(chat.settings)

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    loadError = null,
                    chat = chat,
                    allowJoin = settings.optBoolean("allow_join", false),
                    allowMeeting = settings.optBoolean("allow_meeting", true),
                    canEditInfo = canEditInfo,
                    canEditSettings = canEditSettings,
                    isSavingSettings = false,
                    isSavingProfile = false,
                    isUploadingAvatar = false,
                )
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "load chat settings failed", e)
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    loadError = e.toUiTextOrNull()
                        ?: uiText(R.string.chat_settings_load_failed, e.message ?: ""),
                )
            }
        }
    }

    fun setAllowJoin(enabled: Boolean) {
        val state = _uiState.value
        if (!state.canEditSettings || state.isSavingSettings || state.allowJoin == enabled) return
        persistSettings(allowJoin = enabled, allowMeeting = state.allowMeeting)
    }

    fun setAllowMeeting(enabled: Boolean) {
        val state = _uiState.value
        if (!state.canEditSettings || state.isSavingSettings || state.allowMeeting == enabled) return
        persistSettings(allowJoin = state.allowJoin, allowMeeting = enabled)
    }

    private fun persistSettings(allowJoin: Boolean, allowMeeting: Boolean) {
        val chatId = currentChatId ?: return
        val previous = _uiState.value

        // 乐观更新：开关立刻跟手，失败再回滚。
        _uiState.value = previous.copy(
            allowJoin = allowJoin,
            allowMeeting = allowMeeting,
            isSavingSettings = true,
        )

        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient
                    ?: throw UiTextException(uiText(R.string.error_not_connected))
                val token = LingCatClientManager.currentToken
                    ?: throw UiTextException(uiText(R.string.error_not_signed_in))

                val settingsJson = JSONObject().apply {
                    put("allow_join", allowJoin)
                    put("allow_meeting", allowMeeting)
                }.toString()

                withContext(Dispatchers.IO) {
                    ChatApi.updateChatSettings(client, token, chatId, settingsJson)
                }

                val updatedChat = previous.chat?.let {
                    IChat.newBuilder(it).setSettings(settingsJson).build()
                }
                updatedChat?.let { ProfileCache.cacheChats(listOf(it)) }

                _uiState.value = _uiState.value.copy(
                    chat = updatedChat ?: _uiState.value.chat,
                    isSavingSettings = false,
                )
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "update chat settings failed", e)
                _uiState.value = _uiState.value.copy(
                    allowJoin = previous.allowJoin,
                    allowMeeting = previous.allowMeeting,
                    isSavingSettings = false,
                    errorMsg = e.toUiTextOrNull()
                        ?: uiText(R.string.chat_settings_save_failed, e.message ?: ""),
                )
            }
        }
    }

    fun updateProfile(field: ChatProfileField, value: String) {
        val state = _uiState.value
        if (!state.canEditInfo || state.isSavingProfile || state.isUploadingAvatar) return
        val chatId = currentChatId ?: return
        val chat = state.chat ?: return
        val trimmed = value.trim()

        if (trimmed.isEmpty()) {
            _uiState.value = state.copy(errorMsg = uiText(R.string.chat_settings_value_required))
            return
        }

        _uiState.value = state.copy(isSavingProfile = true, errorMsg = null)

        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient
                    ?: throw UiTextException(uiText(R.string.error_not_connected))
                val token = LingCatClientManager.currentToken
                    ?: throw UiTextException(uiText(R.string.error_not_signed_in))

                withContext(Dispatchers.IO) {
                    when (field) {
                        // 服务端约定：null 表示不修改该字段。
                        ChatProfileField.TITLE ->
                            ChatApi.updateChatProfile(client, token, chatId, null, trimmed, null, null)
                        ChatProfileField.DESCRIPTION ->
                            ChatApi.updateChatProfile(client, token, chatId, null, null, trimmed, null)
                        ChatProfileField.UNIQUE ->
                            ChatApi.updateChatProfile(client, token, chatId, null, null, null, trimmed)
                    }
                }

                val builder = IChat.newBuilder(chat)
                when (field) {
                    ChatProfileField.TITLE -> builder.setTitle(trimmed)
                    ChatProfileField.DESCRIPTION -> builder.setDescription(trimmed)
                    ChatProfileField.UNIQUE -> builder.setChatUnique(trimmed)
                }
                val updatedChat = builder.build()
                ProfileCache.cacheChats(listOf(updatedChat))
                LingCatClientManager.notifyChatListChanged()

                _uiState.value = _uiState.value.copy(
                    chat = updatedChat,
                    isSavingProfile = false,
                    successMsg = uiText(R.string.chat_settings_profile_updated),
                )
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "update chat profile failed", e)
                _uiState.value = _uiState.value.copy(
                    isSavingProfile = false,
                    errorMsg = e.toUiTextOrNull()
                        ?: uiText(R.string.chat_settings_profile_failed, e.message ?: ""),
                )
            }
        }
    }

    fun uploadAvatar(context: Context, uri: Uri) {
        val state = _uiState.value
        if (!state.canEditInfo || state.isUploadingAvatar || state.isSavingProfile) return
        val chatId = currentChatId ?: return
        val chat = state.chat ?: return

        _uiState.value = state.copy(isUploadingAvatar = true, errorMsg = null)

        viewModelScope.launch {
            try {
                val client = LingCatClientManager.currentClient
                    ?: throw UiTextException(uiText(R.string.error_not_connected))
                val token = LingCatClientManager.currentToken
                    ?: throw UiTextException(uiText(R.string.error_not_signed_in))

                val pngBytes = withContext(Dispatchers.IO) {
                    cropImageToSquare(context, uri, 512)
                } ?: throw UiTextException(uiText(R.string.edit_profile_err_image_process))

                val uploadToken = withContext(Dispatchers.IO) {
                    FileApi.requestUploadFileToken(client, token, 15_000L)
                }
                val hash = withContext(Dispatchers.IO) {
                    FileApi.uploadFile(client, uploadToken, null, pngBytes, "image/png", "avatar.png")
                } ?: throw UiTextException(uiText(R.string.edit_profile_err_upload))

                withContext(Dispatchers.IO) {
                    ChatApi.updateChatProfile(client, token, chatId, hash, null, null, null)
                }

                val updatedChat = IChat.newBuilder(chat).setAvatarFileHash(hash).build()
                ProfileCache.cacheChats(listOf(updatedChat))
                LingCatClientManager.notifyChatListChanged()

                _uiState.value = _uiState.value.copy(
                    chat = updatedChat,
                    isUploadingAvatar = false,
                    successMsg = uiText(R.string.chat_settings_avatar_updated),
                )
            } catch (e: CancellationException) {
                throw e
            } catch (e: Exception) {
                Log.e(TAG, "upload chat avatar failed", e)
                _uiState.value = _uiState.value.copy(
                    isUploadingAvatar = false,
                    errorMsg = e.toUiTextOrNull()
                        ?: uiText(R.string.edit_profile_err_avatar, e.message ?: ""),
                )
            }
        }
    }

    private fun parseJson(raw: String?): JSONObject {
        if (raw.isNullOrBlank()) return JSONObject()
        return try {
            JSONObject(raw)
        } catch (e: Exception) {
            Log.w(TAG, "invalid json: $raw", e)
            JSONObject()
        }
    }
}
