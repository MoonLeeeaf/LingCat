package io.github.moonleeeaf.lingcat.ui.components

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.webkit.MimeTypeMap
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.Share // ★ 新增分享图标
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.*
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.core.content.FileProvider
import coil.compose.AsyncImage
import coil.compose.AsyncImagePainter
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.ui.Feedback
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.client_protocol.HttpClientProvider
import okhttp3.Request
import java.io.File

@Composable
fun ImageViewerDialog(
    imageUrl: String?,
    onDismiss: () -> Unit
) {
    if (imageUrl == null) return

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(
            usePlatformDefaultWidth = false,
            decorFitsSystemWindows = false
        )
    ) {
        var scale by remember { mutableStateOf(1f) }
        var offset by remember { mutableStateOf(Offset.Zero) }
        var isLoading by remember { mutableStateOf(true) }

        // 下载和分享的状态
        var isDownloading by remember { mutableStateOf(false) }
        var isSharing by remember { mutableStateOf(false) }

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black)
                .pointerInput(Unit) {
                    detectTransformGestures { _, pan, zoom, _ ->
                        scale = (scale * zoom).coerceIn(1f, 5f)
                        if (scale > 1f) {
                            offset += pan
                        } else {
                            offset = Offset.Zero
                        }
                    }
                }
                .pointerInput(Unit) {
                    detectTapGestures(
                        onDoubleTap = {
                            if (scale > 1f) {
                                scale = 1f
                                offset = Offset.Zero
                            } else {
                                scale = 2.5f
                            }
                        },
                        onTap = {
                            if (scale <= 1.01f) {
                                onDismiss()
                            }
                        }
                    )
                }
        ) {
            AsyncImage(
                model = imageUrl,
                contentDescription = stringResource(R.string.image_viewer_desc),
                contentScale = ContentScale.Fit,
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer(
                        scaleX = scale,
                        scaleY = scale,
                        translationX = offset.x,
                        translationY = offset.y
                    ),
                onState = { state ->
                    isLoading = state is AsyncImagePainter.State.Loading
                }
            )

            if (isLoading) {
                CircularProgressIndicator(
                    color = Color.White,
                    modifier = Modifier.align(Alignment.Center)
                )
            }

            // 右上角按钮区
            // 之前按钮直接压在图片上、也没有状态栏留白：浅色图片上白色图标完全看不清。
            // 现在每个按钮加一层半透明黑色底，并让出状态栏高度。
            Row(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .statusBarsPadding()
                    .padding(top = 8.dp, end = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // ★ 新增：分享按钮
                IconButton(
                    modifier = Modifier
                        .background(Color.Black.copy(alpha = 0.45f), CircleShape),
                    onClick = {
                        if (isSharing) return@IconButton
                        isSharing = true
                        coroutineScope.launch {
                            val success = shareImage(context, imageUrl)
                            isSharing = false
                            if (!success) {
                                Feedback.show(R.string.share_failed_prepare)
                            }
                        }
                    }
                ) {
                    if (isSharing) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Share,
                            contentDescription = stringResource(R.string.action_share),
                            tint = Color.White
                        )
                    }
                }

                // 下载按钮
                IconButton(
                    modifier = Modifier
                        .background(Color.Black.copy(alpha = 0.45f), CircleShape),
                    onClick = {
                        if (isDownloading) return@IconButton
                        isDownloading = true
                        coroutineScope.launch {
                            val success = downloadImage(context, imageUrl)
                            isDownloading = false
                            if (success) {
                                Feedback.show(R.string.image_saved)
                            } else {
                                Feedback.show(R.string.save_failed_retry)
                            }
                        }
                    }
                ) {
                    if (isDownloading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = Color.White,
                            strokeWidth = 2.dp
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Download,
                            contentDescription = stringResource(R.string.action_download),
                            tint = Color.White
                        )
                    }
                }

                // 关闭按钮
                IconButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .background(Color.Black.copy(alpha = 0.45f), CircleShape),
                ) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = stringResource(R.string.action_close),
                        tint = Color.White
                    )
                }
            }
        }
    }
}

/**
 * 动态获取后缀名的小工具
 */
private fun getFileExtension(url: String, mimeType: String): String {
    var ext = MimeTypeMap.getSingleton().getExtensionFromMimeType(mimeType)
    if (ext == null) {
        ext = url.substringBefore('?').substringAfterLast('.', "jpg")
    }
    return ext
}

/**
 * ★ 新增：下载到缓存并调起系统分享
 */
private suspend fun shareImage(context: Context, url: String): Boolean = withContext(Dispatchers.IO) {
    try {
        val client = HttpClientProvider.get()
        val request = Request.Builder().url(url).build()
        val response = client.newCall(request).execute()

        if (!response.isSuccessful) return@withContext false
        val body = response.body ?: return@withContext false

        var mimeType = body.contentType()?.toString() ?: "image/jpeg"
        if (mimeType.contains(";")) mimeType = mimeType.substringBefore(";")

        val extension = getFileExtension(url, mimeType)

        // 1. 准备缓存目录 (在 file_paths.xml 中配过)
        val cacheDir = File(context.cacheDir, "shared_images")
        if (!cacheDir.exists()) cacheDir.mkdirs()

        // 为了防止缓存堆积，可以清空一下旧文件，或者带时间戳
        cacheDir.listFiles()?.forEach { it.delete() } // 简单清理之前的分享缓存

        val tempFile = File(cacheDir, "share_${System.currentTimeMillis()}.$extension")

        // 2. 流式写入缓存文件 (防 OOM)
        tempFile.outputStream().use { outputStream ->
            body.byteStream().use { inputStream ->
                // ★ 替换为经典的流拷贝，兼容 API 24
                val buffer = ByteArray(8192)
                var bytesRead: Int
                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                    outputStream.write(buffer, 0, bytesRead)
                }
                outputStream.flush()
            }
        }

        // 3. 生成 FileProvider URI
        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider", // 必须和 Manifest 里的 authorities 一致
            tempFile
        )

        // 4. 构建分享 Intent
        val shareIntent = Intent(Intent.ACTION_SEND).apply {
            type = mimeType
            putExtra(Intent.EXTRA_STREAM, uri)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION) // 赋予目标 App 临时读取权限
        }

        // 5. 回到主线程调起系统分享面板
        withContext(Dispatchers.Main) {
            context.startActivity(Intent.createChooser(shareIntent, context.getString(R.string.share_image_title)))
        }
        return@withContext true
    } catch (e: Exception) {
        e.printStackTrace()
        return@withContext false
    }
}

/**
 * 下载网络图片并保存到系统相册（防 OOM、动态后缀版） - 保持不变
 */
private suspend fun downloadImage(context: Context, url: String): Boolean = withContext(Dispatchers.IO) {
    try {
        val client = HttpClientProvider.get()
        val request = Request.Builder().url(url).build()
        val response = client.newCall(request).execute()

        if (!response.isSuccessful) return@withContext false
        val body = response.body ?: return@withContext false

        var mimeType = body.contentType()?.toString() ?: "image/jpeg"
        if (mimeType.contains(";")) mimeType = mimeType.substringBefore(";")

        val extension = getFileExtension(url, mimeType)
        val fileName = "LingCat_${System.currentTimeMillis()}.$extension"

        val values = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, fileName)
            put(MediaStore.Images.Media.MIME_TYPE, mimeType)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/LingCat")
                put(MediaStore.Images.Media.IS_PENDING, 1)
            }
        }

        val resolver = context.contentResolver
        val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values) ?: return@withContext false

        resolver.openOutputStream(uri)?.use { outputStream ->
            body.byteStream().use { inputStream ->
                // ★ 替换为经典的流拷贝，兼容 API 24
                val buffer = ByteArray(8192)
                var bytesRead: Int
                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                    outputStream.write(buffer, 0, bytesRead)
                }
                outputStream.flush()
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            values.clear()
            values.put(MediaStore.Images.Media.IS_PENDING, 0)
            resolver.update(uri, values, null, null)
        }

        return@withContext true
    } catch (e: Exception) {
        e.printStackTrace()
        return@withContext false
    }
}