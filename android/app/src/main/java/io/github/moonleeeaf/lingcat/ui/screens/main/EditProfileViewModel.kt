package io.github.moonleeeaf.lingcat.ui.screens.main

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
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
import lingcat.classes.Classes.IUser
import lingcat.client_protocol.FileApi
import lingcat.client_protocol.OAuthApi
import lingcat.client_protocol.UserApi
import org.json.JSONArray
import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.net.URLEncoder

data class OAuthProvider(val id: String, val displayName: String)

data class EditProfileUiState(
    val isLoading: Boolean = false,
    val isSaving: Boolean = false,
    val profile: IUser? = null,
    // ★ 核心修复：把类型从 List<String> 改为 List<OAuthProvider>
    val oauthProviders: List<OAuthProvider> = emptyList(),
    // ★ 注意：bindings 依然保存的是 id 的字符串列表，用来判断是否已绑定
    val bindings: List<String> = emptyList(),
    val errorMsg: String? = null,
    val successMsg: String? = null
)

class EditProfileViewModel : ViewModel() {
    private val TAG = "EditProfileVM"
    private val _uiState = MutableStateFlow(EditProfileUiState())
    val uiState: StateFlow<EditProfileUiState> = _uiState.asStateFlow()

    private val client get() = LingCatClientManager.currentClient
    private val token get() = LingCatClientManager.currentToken
    private val server get() = LingCatClientManager.currentServer

    init {
        loadProfile()
        parseOAuthProviders()
    }

    private fun parseOAuthProviders() {
        val json = server?.oauthProvidersJson ?: return
        try {
            val arr = JSONArray(json)
            val list = mutableListOf<OAuthProvider>()
            for (i in 0 until arr.length()) {
                val p = arr.getJSONObject(i)
                val id = p.optString("id")
                val displayName = p.optString("display_name", id)
                if (id.isNotEmpty()) {
                    list.add(OAuthProvider(id, displayName))
                }
            }
            // ype mismatch.
            //Required:
            //List<String>
            //Found:
            //MutableList<OAuthProvider>
            _uiState.value = _uiState.value.copy(oauthProviders = list)
        } catch (e: Exception) {
            Log.w(TAG, "parse oauth failed", e)
        }
    }

    fun loadProfile() {
        if (client == null || token == null) return
        _uiState.value = _uiState.value.copy(isLoading = true)
        viewModelScope.launch {
            try {
                val user = withContext(Dispatchers.IO) { UserApi.queryMyUserInfo(client, token!!) }
                _uiState.value = _uiState.value.copy(profile = user, isLoading = false)

                if (_uiState.value.oauthProviders.isNotEmpty()) {
                    loadBindings()
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isLoading = false, errorMsg = "加载资料失败: ${e.message}")
            }
        }
    }

    private fun loadBindings() {
        viewModelScope.launch {
            try {
                val list = withContext(Dispatchers.IO) { OAuthApi.getOAuthBindings(client, token!!, 15000L) }
                _uiState.value = _uiState.value.copy(bindings = list ?: emptyList())
            } catch (e: Exception) {
                Log.w(TAG, "load bindings failed", e)
            }
        }
    }

    fun saveProfile(nickname: String, username: String, description: String) {
        if (client == null || token == null) return
        _uiState.value = _uiState.value.copy(isSaving = true, errorMsg = null)

        viewModelScope.launch {
            try {
                withContext(Dispatchers.IO) {
                    UserApi.updateMyProfile(
                        client, token!!,
                        username.ifEmpty { null },
                        nickname.ifEmpty { null },
                        description.ifEmpty { null },
                        null
                    )
                }
                ProfileCache.clearAll() // 清理缓存让界面用新数据刷新
                _uiState.value = _uiState.value.copy(isSaving = false, successMsg = "保存成功")
                loadProfile()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isSaving = false, errorMsg = "保存失败: ${e.message}")
            }
        }
    }

    fun uploadAvatar(context: Context, uri: Uri) {
        if (client == null || token == null) return
        _uiState.value = _uiState.value.copy(isSaving = true, errorMsg = null)

        viewModelScope.launch {
            try {
                val pngBytes = withContext(Dispatchers.IO) { cropToSquare(context, uri, 512) }
                    ?: throw Exception("图片处理失败")

                val uploadToken = withContext(Dispatchers.IO) {
                    FileApi.requestUploadFileToken(client, token!!, 15000L)
                }
                val hash = withContext(Dispatchers.IO) {
                    FileApi.uploadFile(client, uploadToken, null, pngBytes, "image/png", "avatar.png")
                } ?: throw Exception("上传失败")

                withContext(Dispatchers.IO) {
                    UserApi.updateMyProfile(client, token!!, null, null, null, hash)
                }

                // ★ 修复：去掉了 AppDataStore 的更新，依靠 ProfileCache.clearAll() 即可
                ProfileCache.clearAll()
                _uiState.value = _uiState.value.copy(isSaving = false, successMsg = "头像已更新")
                loadProfile()
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isSaving = false, errorMsg = "头像上传失败: ${e.message}")
            }
        }
    }

    fun unbindOAuth(providerId: String) {
        if (client == null || token == null) return
        viewModelScope.launch {
            try {
                withContext(Dispatchers.IO) {
                    OAuthApi.unbindOAuth(client, token!!, providerId, 15000L)
                }
                loadBindings()
                _uiState.value = _uiState.value.copy(successMsg = "已解绑")
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(errorMsg = "解绑失败: ${e.message}")
            }
        }
    }

    // ★ 新增：拼接 OAuth 绑定 URL
    fun getOAuthBindUrl(providerId: String): String? {
        val httpUrl = server?.httpUrl ?: return null
        val tok = token ?: return null
        return try {
            val redirect = URLEncoder.encode("lingcat://oauth/callback", "UTF-8")
            val tokenEnc = URLEncoder.encode(tok, "UTF-8")
            "$httpUrl/oauth/$providerId/login?mode=bind&access_token=$tokenEnc&redirect=$redirect"
        } catch (e: Exception) {
            null
        }
    }

    fun clearMessages() {
        _uiState.value = _uiState.value.copy(errorMsg = null, successMsg = null)
    }

    // 裁剪方形逻辑 (从旧版搬过来)
    private fun cropToSquare(context: Context, uri: Uri, targetSize: Int): ByteArray? {
        val opts = BitmapFactory.Options().apply { inJustDecodeBounds = true }
        context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, opts) }
        if (opts.outWidth <= 0 || opts.outHeight <= 0) return null

        var sample = 1
        val minSide = minOf(opts.outWidth, opts.outHeight)
        while (minSide / sample > targetSize * 2) sample *= 2

        opts.inSampleSize = sample
        opts.inJustDecodeBounds = false
        val bmp = context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, opts) } ?: return null

        try {
            val w = bmp.width; val h = bmp.height
            val side = minOf(w, h)
            val x = (w - side) / 2; val y = (h - side) / 2
            val square = Bitmap.createBitmap(bmp, x, y, side, side)
            val scaled = Bitmap.createScaledBitmap(square, targetSize, targetSize, true)

            val bos = ByteArrayOutputStream()
            scaled.compress(Bitmap.CompressFormat.PNG, 100, bos)
            if (square != bmp && !square.isRecycled) square.recycle()
            if (scaled != square && !scaled.isRecycled) scaled.recycle()
            return bos.toByteArray()
        } finally {
            if (!bmp.isRecycled) bmp.recycle()
        }
    }
}