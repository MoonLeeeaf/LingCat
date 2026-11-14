package io.github.moonleeeaf.lingcat.ui

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import io.github.moonleeeaf.lingcat.data.ProfileCache
import io.github.moonleeeaf.lingcat.data.RemarksCache
import lingcat.classes.Classes.IUser

/**
 * 用户显示名：备注 > 昵称 > 用户名 > 兜底文案。
 *
 * 会订阅 [RemarksCache.remarks]，在资料页修改备注后，聊天标题、消息发送者、
 * 成员列表等所有使用处都会自动刷新，而不是等下次重新进入页面。
 */
@Composable
fun rememberUserDisplayName(user: IUser?, fallback: String = ""): String {
    val remarks by RemarksCache.remarks.collectAsState()
    return if (user == null) {
        fallback
    } else {
        RemarksCache.displayName(user.id, user.nickname, user.username, remarks, fallback)
    }
}

/** 只知道 userId 时的版本：优先备注，其次缓存里的用户资料。 */
@Composable
fun rememberUserDisplayName(userId: String?, fallback: String = ""): String {
    val remarks by RemarksCache.remarks.collectAsState()
    if (userId.isNullOrEmpty()) return fallback

    remarks[userId]?.takeIf { it.isNotBlank() }?.let { return it }

    val user = ProfileCache.getCachedUser(userId) ?: return fallback
    return RemarksCache.displayName(user.id, user.nickname, user.username, remarks, fallback)
}
