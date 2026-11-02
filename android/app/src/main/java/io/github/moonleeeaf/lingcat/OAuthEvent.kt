package io.github.moonleeeaf.lingcat

import io.github.moonleeeaf.lingcat.data.AccountInfo

sealed class OAuthEvent {
    // 绑定成功（用于资料页刷新）
    data class Bound(val provider: String) : OAuthEvent()
    // 登录/注册成功（用于跳转聊天列表）
    data class LoginSuccess(val account: AccountInfo) : OAuthEvent()
    // 发生错误
    data class Error(val message: String) : OAuthEvent()
}