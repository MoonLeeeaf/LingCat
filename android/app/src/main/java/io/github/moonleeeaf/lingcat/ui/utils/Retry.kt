package io.github.moonleeeaf.lingcat.ui.utils

import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.delay

/**
 * 调用方重试：失败后按 [delaysMs] 依次等待再重试。
 *
 * - 只在可取消的作用域里使用（viewModelScope 等），取消会原样抛出；
 * - 成功返回后立即结束，不会因为后面的延迟白等；
 * - 最后一次仍失败时抛出最初/最近一次异常。
 *
 * 默认 1s / 3s / 9s，最多执行 4 次（首次 + 3 次重试）。
 */
suspend fun <T> retryWithBackoff(
    delaysMs: List<Long> = listOf(1_000L, 3_000L, 9_000L),
    block: suspend () -> T,
): T {
    var lastError: Throwable? = null

    for (delayMs in delaysMs) {
        try {
            return block()
        } catch (e: CancellationException) {
            throw e
        } catch (e: Throwable) {
            lastError = e
            delay(delayMs)
        }
    }

    try {
        return block()
    } catch (e: CancellationException) {
        throw e
    } catch (e: Throwable) {
        lastError = e
    }

    throw lastError ?: IllegalStateException("retryWithBackoff failed without an error")
}
