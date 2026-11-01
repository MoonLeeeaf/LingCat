package io.github.moonleeeaf.lingcat.app

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue

object AppState {
    /** 当前正在查看的聊天 ID，离开聊天界面时置为 null */
    var activeChatId by mutableStateOf<String?>(null)

    /** App 是否在前台运行 */
    var isAppForeground by mutableStateOf(false)
}