package io.github.moonleeeaf.lingcat.ui.screens.chat

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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
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
import coil.compose.AsyncImage
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.Feedback
import io.github.moonleeeaf.lingcat.ui.components.FeedbackHost
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.client_protocol.StickerApi

/**
 * 贴纸选择面板。选中后把 `lingcat://sticker?...` 语法插入输入框。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StickerPickerSheet(
    onDismiss: () -> Unit,
    onPick: (hash: String, packId: String, emoji: String?, mime: String) -> Unit,
) {
    val scope = rememberCoroutineScope()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    var details by remember { mutableStateOf<List<StickerApi.StickerPackDetail>?>(null) }
    var activePackId by remember { mutableStateOf<String?>(null) }
    var refreshKey by remember { mutableIntStateOf(0) }
    var showCreate by remember { mutableStateOf(false) }
    var managePackId by remember { mutableStateOf<String?>(null) }
    var creating by remember { mutableStateOf(false) }
    var createTitle by remember { mutableStateOf("") }

    val fileToken by LingCatClientManager.fileAccessToken.collectAsState()
    val client = LingCatClientManager.currentClient
    val accessToken = LingCatClientManager.currentToken

    LaunchedEffect(refreshKey) {
        if (client == null || accessToken == null) {
            details = emptyList()
            return@LaunchedEffect
        }
        try {
            val list = withContext(Dispatchers.IO) {
                StickerApi.getMyStickerPacks(client, accessToken)
            }
            details = list
            val current = activePackId
            if (current == null || list.none { it.pack?.id == current }) {
                activePackId = list.firstOrNull { it.stickers.isNotEmpty() }?.pack?.id
                    ?: list.firstOrNull()?.pack?.id
            }
        } catch (e: Exception) {
            Feedback.show(R.string.sticker_pack_load_failed)
            details = emptyList()
        }
    }

    val active = details?.firstOrNull { it.pack?.id == activePackId }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
    ) {
        Box {
            Column(modifier = Modifier.padding(horizontal = 16.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        text = stringResource(R.string.sticker_input_action),
                        style = MaterialTheme.typography.titleMedium,
                        modifier = Modifier.weight(1f),
                    )
                    IconButton(onClick = { showCreate = true }, enabled = !creating) {
                        Icon(Icons.Default.Add, contentDescription = stringResource(R.string.sticker_pack_create))
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = stringResource(R.string.action_close))
                    }
                }

                when {
                    details == null -> Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(120.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        CircularProgressIndicator()
                    }

                    details!!.isEmpty() -> Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(100.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Text(
                            text = stringResource(R.string.sticker_panel_empty),
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }

                    else -> {
                        LazyRow(
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            items(details!!, key = { it.pack?.id ?: it.hashCode().toString() }) { d ->
                                d.pack?.let { pack ->
                                    val selected = pack.id == activePackId
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(50))
                                            .background(
                                                if (selected) MaterialTheme.colorScheme.primary.copy(alpha = 0.16f)
                                                else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                                            )
                                            .clickable { activePackId = pack.id }
                                            .padding(horizontal = 12.dp, vertical = 6.dp),
                                    ) {
                                        Text(
                                            text = pack.title,
                                            style = MaterialTheme.typography.bodySmall,
                                            color = if (selected) MaterialTheme.colorScheme.primary
                                            else MaterialTheme.colorScheme.onSurface,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis,
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(Modifier.height(8.dp))

                        if (active == null || active.stickers.isEmpty()) {
                            Box(
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
                        } else {
                            LazyVerticalGrid(
                                columns = GridCells.Adaptive(64.dp),
                                modifier = Modifier.heightIn(max = 300.dp),
                                horizontalArrangement = Arrangement.spacedBy(6.dp),
                                verticalArrangement = Arrangement.spacedBy(6.dp),
                            ) {
                                items(active.stickers, key = { it.hash }) { sticker ->
                                    val packId = active.pack?.id
                                    val url = LingCatClientManager.currentClient
                                        ?.getFileUrlByHashAndToken(sticker.hash, fileToken ?: "")
                                    AsyncImage(
                                        model = url,
                                        contentDescription = sticker.emoji ?: sticker.displayName(),
                                        contentScale = ContentScale.Fit,
                                        modifier = Modifier
                                            .aspectRatio(1f)
                                            .clip(RoundedCornerShape(8.dp))
                                            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.25f))
                                            .clickable {
                                                if (packId != null) {
                                                    onPick(sticker.hash, packId, sticker.emoji, sticker.mime)
                                                    onDismiss()
                                                }
                                            },
                                    )
                                }
                            }
                        }

                        if (active?.pack != null) {
                            TextButton(
                                onClick = { managePackId = active.pack?.id },
                                modifier = Modifier.fillMaxWidth(),
                            ) {
                                Icon(Icons.Default.Settings, contentDescription = null, modifier = Modifier.size(18.dp))
                                Spacer(Modifier.width(6.dp))
                                Text(
                                    stringResource(
                                        R.string.sticker_pack_manage,
                                        active.pack?.title ?: "",
                                    )
                                )
                            }
                        }
                    }
                }

                Spacer(Modifier.height(16.dp))
            }

            // BottomSheet 同样是独立 Window, 由它自己展示提示
            FeedbackHost(modifier = Modifier.align(Alignment.BottomCenter))
        }
    }

    if (showCreate) {
        AlertDialog(
            onDismissRequest = { if (!creating) showCreate = false },
            title = { Text(stringResource(R.string.sticker_pack_create)) },
            text = {
                OutlinedTextField(
                    value = createTitle,
                    onValueChange = { if (it.length <= 64) createTitle = it },
                    label = { Text(stringResource(R.string.sticker_pack_title_label)) },
                    singleLine = true,
                )
            },
            confirmButton = {
                TextButton(
                    enabled = !creating && createTitle.isNotBlank(),
                    onClick = {
                        val title = createTitle.trim()
                        if (title.isEmpty()) {
                            Feedback.show(R.string.sticker_pack_enter_title)
                            return@TextButton
                        }
                        if (client == null || accessToken == null) return@TextButton
                        scope.launch {
                            creating = true
                            try {
                                val pack = withContext(Dispatchers.IO) {
                                    StickerApi.createStickerPack(client, accessToken, title)
                                }
                                Feedback.show(R.string.sticker_pack_created)
                                showCreate = false
                                createTitle = ""
                                refreshKey++
                                if (pack != null) {
                                    activePackId = pack.id
                                    managePackId = pack.id
                                }
                            } catch (e: Exception) {
                                Feedback.show(R.string.sticker_pack_load_failed)
                            } finally {
                                creating = false
                            }
                        }
                    },
                ) { Text(stringResource(R.string.create_group_action)) }
            },
            dismissButton = {
                TextButton(onClick = { showCreate = false }, enabled = !creating) {
                    Text(stringResource(R.string.action_cancel))
                }
            },
        )
    }

    managePackId?.let { id ->
        StickerPackDialog(
            packId = id,
            onDismiss = { managePackId = null },
            onChanged = { refreshKey++ },
        )
    }
}
