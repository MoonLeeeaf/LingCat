package io.github.moonleeeaf.lingcat.ui.screens.chat

import android.net.Uri
import android.provider.OpenableColumns
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AddPhotoAlternate
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import coil.compose.AsyncImage
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.Feedback
import io.github.moonleeeaf.lingcat.ui.components.FeedbackHost
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.client_protocol.FileApi
import lingcat.client_protocol.StickerApi

/** 与服务端保持一致的数量上限 */
private const val MAX_STICKERS_PER_PACK = 120

/**
 * 贴纸包详情弹窗。
 *
 * 作者可以改标题 / 添加 / 移除 / 删除包; 其他人可以订阅 / 取消订阅。
 */
@Composable
fun StickerPackDialog(
    packId: String,
    onDismiss: () -> Unit,
    onChanged: () -> Unit = {},
) {
    val scope = rememberCoroutineScope()
    var detail by remember { mutableStateOf<StickerApi.StickerPackDetail?>(null) }
    var loading by remember { mutableStateOf(true) }
    var busy by remember { mutableStateOf(false) }
    var refreshKey by remember { mutableIntStateOf(0) }
    var editingTitle by remember { mutableStateOf(false) }
    var titleDraft by remember { mutableStateOf("") }
    var confirmDelete by remember { mutableStateOf(false) }
    var pendingRemoveSticker by remember { mutableStateOf<StickerApi.Sticker?>(null) }

    val fileToken by LingCatClientManager.fileAccessToken.collectAsState()
    val client = LingCatClientManager.currentClient
    val accessToken = LingCatClientManager.currentToken

    LaunchedEffect(packId, refreshKey) {
        if (client == null || accessToken == null) {
            loading = false
            return@LaunchedEffect
        }
        try {
            val d = withContext(Dispatchers.IO) {
                StickerApi.queryStickerPack(client, accessToken, packId)
            }
            detail = d
            titleDraft = d.pack?.title ?: ""
        } catch (e: Exception) {
            Feedback.show(R.string.sticker_pack_load_failed)
        } finally {
            loading = false
        }
    }

    fun addStickerUris(uris: List<Uri>) {
        val current = detail ?: return
        if (client == null || accessToken == null) return
        scope.launch {
            busy = true
            try {
                val hashes = uploadStickerUris(uris)
                if (hashes.isEmpty()) {
                    Feedback.show(R.string.sticker_pack_invalid_type)
                    return@launch
                }
                val items = current.stickers.map { StickerApi.StickerInput(it.hash, it.emoji) } +
                        hashes.map { StickerApi.StickerInput(it, null) }
                if (items.size > MAX_STICKERS_PER_PACK) {
                    Feedback.show(R.string.sticker_pack_too_many, MAX_STICKERS_PER_PACK)
                    return@launch
                }
                withContext(Dispatchers.IO) {
                    StickerApi.setStickerPackContent(client, accessToken, packId, items)
                }
                Feedback.show(R.string.sticker_pack_added, hashes.size)
                refreshKey++
                onChanged()
            } catch (e: Exception) {
                Feedback.show(R.string.sticker_pack_load_failed)
            } finally {
                busy = false
            }
        }
    }

    val addLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetMultipleContents()
    ) { uris: List<Uri> ->
        if (uris.isNotEmpty()) addStickerUris(uris)
    }

    fun removeSticker(sticker: StickerApi.Sticker) {
        val current = detail ?: return
        if (client == null || accessToken == null) return
        scope.launch {
            busy = true
            try {
                val items = current.stickers
                    .filter { it.hash != sticker.hash }
                    .map { StickerApi.StickerInput(it.hash, it.emoji) }
                withContext(Dispatchers.IO) {
                    StickerApi.setStickerPackContent(client, accessToken, packId, items)
                }
                refreshKey++
                onChanged()
            } catch (e: Exception) {
                Feedback.show(R.string.sticker_pack_load_failed)
            } finally {
                busy = false
            }
        }
    }

    fun saveTitle() {
        val title = titleDraft.trim()
        if (title.isEmpty()) {
            Feedback.show(R.string.sticker_pack_enter_title)
            return
        }
        if (client == null || accessToken == null) return
        scope.launch {
            busy = true
            try {
                withContext(Dispatchers.IO) {
                    StickerApi.updateStickerPackTitle(client, accessToken, packId, title)
                }
                editingTitle = false
                Feedback.show(R.string.sticker_pack_title_updated)
                refreshKey++
                onChanged()
            } catch (e: Exception) {
                Feedback.show(R.string.sticker_pack_load_failed)
            } finally {
                busy = false
            }
        }
    }

    fun toggleSubscribe() {
        val current = detail ?: return
        if (client == null || accessToken == null) return
        val subscribed = !current.pack.subscribed
        scope.launch {
            busy = true
            try {
                withContext(Dispatchers.IO) {
                    StickerApi.setStickerPackSubscribed(client, accessToken, packId, subscribed)
                }
                Feedback.show(
                    if (subscribed) R.string.sticker_pack_subscribed else R.string.sticker_pack_unsubscribed
                )
                refreshKey++
                onChanged()
            } catch (e: Exception) {
                Feedback.show(R.string.sticker_pack_load_failed)
            } finally {
                busy = false
            }
        }
    }

    fun deletePack() {
        if (client == null || accessToken == null) return
        scope.launch {
            busy = true
            try {
                withContext(Dispatchers.IO) {
                    StickerApi.deleteStickerPack(client, accessToken, packId)
                }
                Feedback.show(R.string.sticker_pack_deleted)
                onChanged()
                onDismiss()
            } catch (e: Exception) {
                Feedback.show(R.string.sticker_pack_load_failed)
            } finally {
                busy = false
            }
        }
    }

    Dialog(
        onDismissRequest = { if (!busy) onDismiss() },
        properties = DialogProperties(usePlatformDefaultWidth = false),
    ) {
        Box {
            Surface(
                shape = RoundedCornerShape(20.dp),
                tonalElevation = 3.dp,
                modifier = Modifier
                    .padding(24.dp)
                    .widthIn(max = 480.dp)
                    .fillMaxWidth(),
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    val pack = detail?.pack
                    val isAuthor = pack?.isAuthor == true

                    // 标题区
                    if (editingTitle) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            OutlinedTextField(
                                value = titleDraft,
                                onValueChange = { if (it.length <= 64) titleDraft = it },
                                label = { Text(stringResource(R.string.sticker_pack_title_label)) },
                                singleLine = true,
                                modifier = Modifier.weight(1f),
                            )
                            IconButton(onClick = { saveTitle() }, enabled = !busy && titleDraft.isNotBlank()) {
                                Icon(Icons.Default.Check, contentDescription = stringResource(R.string.action_save))
                            }
                            IconButton(onClick = {
                                editingTitle = false
                                titleDraft = pack?.title ?: ""
                            }, enabled = !busy) {
                                Icon(Icons.Default.Close, contentDescription = stringResource(R.string.action_cancel))
                            }
                        }
                    } else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = pack?.title ?: stringResource(R.string.sticker_pack_untitled),
                                    style = MaterialTheme.typography.titleMedium,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis,
                                )
                                if (pack != null) {
                                    Text(
                                        text = stringResource(R.string.sticker_pack_count, detail?.stickers?.size ?: 0),
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    )
                                }
                            }
                            if (isAuthor) {
                                IconButton(onClick = { editingTitle = true }, enabled = !busy) {
                                    Icon(Icons.Default.Edit, contentDescription = stringResource(R.string.action_edit))
                                }
                            }
                        }
                    }

                    Spacer(Modifier.height(12.dp))

                    when {
                        loading -> Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(120.dp),
                            contentAlignment = Alignment.Center,
                        ) {
                            CircularProgressIndicator()
                        }

                        detail == null || detail!!.stickers.isEmpty() -> Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(100.dp),
                            contentAlignment = Alignment.Center,
                        ) {
                            Text(
                                text = stringResource(R.string.sticker_pack_empty),
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }

                        else -> LazyVerticalGrid(
                            columns = GridCells.Adaptive(64.dp),
                            modifier = Modifier.heightIn(max = 360.dp),
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            verticalArrangement = Arrangement.spacedBy(6.dp),
                        ) {
                            items(detail!!.stickers, key = { it.hash }) { sticker ->
                                val url = stickerUrl(sticker.hash, fileToken ?: "")
                                Box(
                                    modifier = Modifier
                                        .aspectRatio(1f)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)),
                                ) {
                                    AsyncImage(
                                        model = url,
                                        contentDescription = sticker.emoji ?: sticker.displayName(),
                                        contentScale = ContentScale.Fit,
                                        modifier = Modifier.fillMaxWidth().aspectRatio(1f),
                                    )
                                    if (isAuthor) {
                                        IconButton(
                                            onClick = { if (!busy) pendingRemoveSticker = sticker },
                                            enabled = !busy,
                                            modifier = Modifier
                                                .align(Alignment.TopEnd)
                                                .size(28.dp)
                                                .background(
                                                    MaterialTheme.colorScheme.scrim.copy(alpha = 0.45f),
                                                    CircleShape,
                                                ),
                                        ) {
                                            Icon(
                                                Icons.Default.Close,
                                                contentDescription = stringResource(R.string.sticker_pack_remove),
                                                tint = MaterialTheme.colorScheme.onPrimary,
                                                modifier = Modifier.size(16.dp),
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }

                    Spacer(Modifier.height(16.dp))

                    Row(verticalAlignment = Alignment.CenterVertically) {
                        if (isAuthor) {
                            Button(
                                onClick = { addLauncher.launch("image/*") },
                                enabled = !busy,
                            ) {
                                Icon(Icons.Default.AddPhotoAlternate, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(6.dp))
                                Text(stringResource(R.string.sticker_pack_add))
                            }
                            Spacer(Modifier.width(8.dp))
                            OutlinedButton(
                                onClick = { confirmDelete = true },
                                enabled = !busy,
                            ) {
                                Icon(Icons.Default.Delete, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(6.dp))
                                Text(stringResource(R.string.sticker_pack_delete))
                            }
                        } else if (pack != null) {
                            Button(
                                onClick = { toggleSubscribe() },
                                enabled = !busy,
                            ) {
                                Icon(
                                    if (pack.subscribed) Icons.Default.Close else Icons.Default.Add,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp),
                                )
                                Spacer(Modifier.width(6.dp))
                                Text(
                                    stringResource(
                                        if (pack.subscribed) R.string.sticker_pack_unsubscribe
                                        else R.string.sticker_pack_subscribe
                                    )
                                )
                            }
                        }
                        Spacer(Modifier.weight(1f))
                        TextButton(onClick = onDismiss, enabled = !busy) {
                            Text(stringResource(R.string.action_close))
                        }
                    }
                }
            }

            // 弹窗是独立 Window, 全局 Snackbar 会被遮罩挡住, 这里接管提示
            FeedbackHost(modifier = Modifier.align(Alignment.BottomCenter))
        }
    }

    pendingRemoveSticker?.let { sticker ->
        AlertDialog(
            onDismissRequest = { pendingRemoveSticker = null },
            title = { Text(stringResource(R.string.sticker_pack_remove)) },
            text = {
                Text(
                    stringResource(
                        R.string.sticker_pack_remove_confirm,
                        detail?.pack?.title ?: stringResource(R.string.sticker_pack_untitled),
                    )
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    pendingRemoveSticker = null
                    removeSticker(sticker)
                }) { Text(stringResource(R.string.action_delete)) }
            },
            dismissButton = {
                TextButton(onClick = { pendingRemoveSticker = null }) {
                    Text(stringResource(R.string.action_cancel))
                }
            },
        )
    }

    if (confirmDelete) {
        AlertDialog(
            onDismissRequest = { confirmDelete = false },
            title = { Text(stringResource(R.string.sticker_pack_delete)) },
            text = {
                Text(
                    stringResource(
                        R.string.sticker_pack_delete_confirm,
                        detail?.pack?.title ?: stringResource(R.string.sticker_pack_untitled),
                    )
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    confirmDelete = false
                    deletePack()
                }) { Text(stringResource(R.string.action_delete)) }
            },
            dismissButton = {
                TextButton(onClick = { confirmDelete = false }) {
                    Text(stringResource(R.string.action_cancel))
                }
            },
        )
    }
}

private fun stickerUrl(hash: String, fileToken: String): String? {
    return LingCatClientManager.currentClient?.getFileUrlByHashAndToken(hash, fileToken)
}

/**
 * 上传选中的贴纸文件, 返回服务端 hash 列表。
 * 只接受 PNG / WebP。
 */
private suspend fun uploadStickerUris(uris: List<Uri>): List<String> = withContext(Dispatchers.IO) {
    val client = LingCatClientManager.currentClient ?: return@withContext emptyList()
    val accessToken = LingCatClientManager.currentToken ?: return@withContext emptyList()
    val resolver = LingCatClientManager.appContext.contentResolver

    val uploadToken = FileApi.requestUploadFileToken(client, accessToken, 30_000L)

    val hashes = mutableListOf<String>()
    for (uri in uris) {
        var name = "sticker_${System.currentTimeMillis()}"
        var mime = resolver.getType(uri) ?: "image/png"
        var size = 0L

        resolver.query(uri, null, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (nameIndex >= 0) cursor.getString(nameIndex)?.let { name = it }
                val sizeIndex = cursor.getColumnIndex(OpenableColumns.SIZE)
                if (sizeIndex >= 0) size = cursor.getLong(sizeIndex)
            }
        }

        if (mime != "image/png" && mime != "image/webp") continue
        if (size <= 0L) continue

        hashes.add(
            FileApi.uploadFileResumable(
                client,
                uploadToken,
                null,
                resolver,
                uri,
                size,
                mime,
                name,
                null,
            )
        )
    }
    hashes
}
