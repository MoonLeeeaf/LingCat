package io.github.moonleeeaf.lingcat.ui

import android.content.Context
import androidx.annotation.StringRes
import kotlinx.coroutines.channels.BufferOverflow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import java.util.concurrent.atomic.AtomicInteger

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

    /**
     * 正在展示「弹窗内 FeedbackHost」的弹窗数量。
     *
     * Compose Dialog / ModalBottomSheet 都是独立 Window，Activity 里的全局 Snackbar
     * 会被弹窗遮罩盖住。弹窗内注册 FeedbackHost 后，全局 host 让位，改由弹窗自己展示。
     */
    private val modalHostCount = AtomicInteger(0)

    /** 是否有弹窗正在接管提示展示 */
    val isModalHostActive: Boolean get() = modalHostCount.get() > 0

    /** 由弹窗内的 FeedbackHost 调用，返回注销函数 */
    fun registerModalHost(): () -> Unit {
        modalHostCount.incrementAndGet()
        return { modalHostCount.decrementAndGet() }
    }

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
