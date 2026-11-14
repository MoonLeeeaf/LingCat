package io.github.moonleeeaf.lingcat.ui.utils

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import java.io.ByteArrayOutputStream

/**
 * 把用户选择的图片裁成正方形并缩放，输出 PNG 字节。
 *
 * 头像类上传都需要这一步（个人头像、群组头像），之前只在 EditProfileViewModel
 * 里写了一份私有实现，这里抽出来共用。
 *
 * @return 处理失败（例如无法读取图片流）时返回 null。
 */
fun cropImageToSquare(context: Context, uri: Uri, targetSize: Int): ByteArray? {
    val opts = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, opts) }
    if (opts.outWidth <= 0 || opts.outHeight <= 0) return null

    var sample = 1
    val minSide = minOf(opts.outWidth, opts.outHeight)
    while (minSide / sample > targetSize * 2) sample *= 2

    opts.inSampleSize = sample
    opts.inJustDecodeBounds = false
    val bmp = context.contentResolver.openInputStream(uri)
        ?.use { BitmapFactory.decodeStream(it, null, opts) }
        ?: return null

    try {
        val w = bmp.width
        val h = bmp.height
        val side = minOf(w, h)
        val x = (w - side) / 2
        val y = (h - side) / 2
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
