package io.github.moonleeeaf.lingcat.ui

import android.content.Context
import androidx.annotation.StringRes
import androidx.compose.runtime.Composable
import androidx.compose.ui.res.stringResource

/**
 * 一条“还没有最终成形”的界面文案。
 *
 * ViewModel / Manager 里产生的提示（例如“登录已过期”“发送失败: xxx”）不能直接把中文写死，
 * 也不应该持有 Context。这里把它们保存成“字符串资源 id + 参数”，
 * 等真正要显示的时候（Composable 或 Snackbar 层）再解析成本地化文本。
 */
sealed interface UiText {
    /** 来自 strings.xml 的文案，[args] 对应 `%1$s` / `%1$d` 等占位符。 */
    data class Res(@StringRes val resId: Int, val args: List<Any> = emptyList()) : UiText

    /** 已经是最终文本（例如服务器返回的原始错误），不再做任何翻译。 */
    data class Raw(val text: String) : UiText
}

/** 构造一条资源文案。放在 ViewModel 里使用。 */
fun uiText(@StringRes resId: Int, vararg args: Any): UiText = UiText.Res(resId, args.toList())

/** 在 Composable 中解析成当前语言下的文本。 */
@Composable
fun UiText.asString(): String = when (this) {
    is UiText.Res -> stringResource(resId, *args.toTypedArray())
    is UiText.Raw -> text
}

/** 在非 Composable 环境（Snackbar、通知等）中解析成当前语言下的文本。 */
fun UiText.resolve(context: Context): String = when (this) {
    is UiText.Res -> context.getString(resId, *args.toTypedArray())
    is UiText.Raw -> text
}

/**
 * 带上“资源文案”的异常。
 *
 * ViewModel 内部的校验错误（未连接、无聊天 ID……）会一路 `throw` 到最外层再变成 `errorMsg`，
 * 中途没有 Context 可以用来翻译。用这个异常把资源 id 带过去即可。
 */
class UiTextException(val uiText: UiText) : Exception()

/** 从异常链里找出 [UiTextException] 携带的文案。 */
fun Throwable.toUiTextOrNull(): UiText? {
    var current: Throwable? = this
    while (current != null) {
        if (current is UiTextException) return current.uiText
        current = current.cause
    }
    return null
}

