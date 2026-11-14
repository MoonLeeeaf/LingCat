package io.github.moonleeeaf.lingcat.ui.screens.chat

import lingcat.classes.Classes.IMessageEntity
import org.json.JSONObject
import java.net.URLEncoder

/** attachment entity 里贴纸相关的字段 */
data class StickerEntityInfo(
    val hash: String,
    val name: String,
    val packId: String?,
    val emoji: String?,
)

/**
 * 如果 entity 是贴纸 (attachment + kind=sticker), 返回解析结果; 否则返回 null。
 */
fun parseStickerEntity(entity: IMessageEntity?): StickerEntityInfo? {
    if (entity == null || entity.type != "attachment") return null
    return try {
        val json = JSONObject(entity.data ?: "")
        if (json.optString("kind") != "sticker") return null
        val hash = json.optString("hash")
        if (hash.isEmpty()) return null
        StickerEntityInfo(
            hash = hash,
            name = json.optString("name"),
            packId = json.optString("packId").ifEmpty { null },
            emoji = json.optString("emoji").ifEmpty { null },
        )
    } catch (_: Exception) {
        null
    }
}

/**
 * 纯贴纸消息: 唯一 entity 且是贴纸, entity 区间外的文本全为空白。
 */
fun pureStickerEntity(text: String, entities: List<IMessageEntity>): IMessageEntity? {
    if (entities.size != 1) return null
    val entity = entities[0]
    if (parseStickerEntity(entity) == null) return null

    val beforeEnd = entity.offset.coerceIn(0, text.length)
    val afterStart = (entity.offset + entity.length).coerceIn(0, text.length)
    val before = text.substring(0, beforeEnd)
    val after = text.substring(afterStart)
    return if (before.isBlank() && after.isBlank()) entity else null
}

/** 展示文件名: sticker.<真实扩展名>, 与服务端识别出的 MIME 一致 */
fun stickerDisplayName(mime: String?): String {
    return if (mime.equals("image/webp", ignoreCase = true)) "sticker.webp" else "sticker.png"
}

private fun urlEncode(value: String): String {
    return URLEncoder.encode(value, "UTF-8").replace("+", "%20")
}

/**
 * 生成贴纸的文本层语法, 与 Web 端完全一致。
 */
fun buildStickerText(hash: String, packId: String?, emoji: String?, mime: String?): String {
    val query = buildString {
        append("hash=").append(urlEncode(hash))
        if (!packId.isNullOrEmpty()) append("&packId=").append(urlEncode(packId))
        if (!emoji.isNullOrEmpty()) append("&emoji=").append(urlEncode(emoji))
    }
    return "![${stickerDisplayName(mime)}](lingcat://sticker?$query)"
}
