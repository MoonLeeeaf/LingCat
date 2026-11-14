package io.github.moonleeeaf.lingcat.ui

import android.content.Context
import androidx.annotation.StringRes
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow

/**
 * 全局轻量反馈总线。
 *
 * 统一用 Snackbar 展示“已复制 / 已保存 / 操作失败”这类短反馈，
 * 避免同一个 App 里 Toast、Snackbar、内联红字、完全无反馈四种写法混用。
 *
 * 支持直接传字符串资源：这样在 onClick 等非 composable 的 lambda 里
 * 也能给出本地化文案，而不需要把界面文字写死在代码里。
 */
object Feedback {
    private val _events = MutableSharedFlow<String>(
        extraBufferCapacity = 8,
        onBufferOverflow = BufferOverflow.DROP_OLDEST,
    )

    val events = _events.asSharedFlow()

    private var appContext: Context? = null

    /** 由 MainActivity 在启动时调用一次。 */
    fun init(context: Context) {
        appContext = context.applicationContext
    }

    fun show(message: String) {
        if (message.isNotBlank()) {
            _events.tryEmit(message)
        }
    }

    fun show(@StringRes resId: Int, vararg args: Any) {
        val context = appContext ?: return
        show(context.getString(resId, *args))
    }

    /** 展示 ViewModel / Manager 产出的资源文案。 */
    fun show(text: UiText) {
        val context = appContext ?: return
        show(text.resolve(context))
    }
}
