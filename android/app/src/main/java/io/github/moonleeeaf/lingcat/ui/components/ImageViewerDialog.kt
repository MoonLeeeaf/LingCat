package io.github.moonleeeaf.lingcat.ui.components // 或者是你的包名

import android.content.ContentValues
import android.content.Context
import android.graphics.BitmapFactory
import android.os.Build
import android.provider.MediaStore
import android.webkit.MimeTypeMap
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.detectTransformGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Download
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.*
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
import coil.compose.AsyncImage
import coil.compose.AsyncImagePainter
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import lingcat.client_protocol.HttpClientProvider
import okhttp3.OkHttpClient
import okhttp3.Request

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

        // ★ 新增：下载状态
        var isDownloading by remember { mutableStateOf(false) }

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
                contentDescription = "查看大图",
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

            // ★ 右上角按钮区
            Row(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(top = 32.dp, end = 16.dp), // 避开状态栏
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // 下载按钮
                IconButton(
                    onClick = {
                        if (isDownloading) return@IconButton
                        isDownloading = true
                        coroutineScope.launch {
                            val success = downloadImage(context, imageUrl)
                            isDownloading = false
                            if (success) {
                                Toast.makeText(context, "图片已保存到相册喵~", Toast.LENGTH_SHORT).show()
                            } else {
                                Toast.makeText(context, "保存失败，请重试", Toast.LENGTH_SHORT).show()
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
                            contentDescription = "下载",
                            tint = Color.White
                        )
                    }
                }

                // 关闭按钮
                IconButton(onClick = onDismiss) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "关闭",
                        tint = Color.White
                    )
                }
            }
        }
    }
}

/**
 * 下载网络图片并保存到系统相册（防 OOM、动态后缀版）
 */
private suspend fun downloadImage(context: Context, url: String): Boolean = withContext(Dispatchers.IO) {
    try {
        // 1. 准备网络请求
        val client = HttpClientProvider.get()
        val request = Request.Builder().url(url).build()
        val response = client.newCall(request).execute()

        if (!response.isSuccessful) return@withContext false
        val body = response.body ?: return@withContext false

        // 2. 动态推断 MIME 和后缀
        var mimeType = body.contentType()?.toString() ?: "image/jpeg"
        // 清理可能带的 charset
        if (mimeType.contains(";")) mimeType = mimeType.substringBefore(";")

        var extension = MimeTypeMap.getSingleton().getExtensionFromMimeType(mimeType)
        if (extension == null) {
            // 如果网络没返回 MIME，尝试从 URL 里切
            extension = url.substringBefore('?').substringAfterLast('.', "jpg")
            mimeType = "image/$extension"
        }

        val fileName = "LingCat_${System.currentTimeMillis()}.$extension"

        // 3. 配置 MediaStore
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

        // 4. 流式写入（防 OOM）
        resolver.openOutputStream(uri)?.use { outputStream ->
            body.byteStream().use { inputStream ->
                inputStream.transferTo(outputStream)
            }
        }

        // 5. 结束写入
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