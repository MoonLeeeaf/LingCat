import { useEffect } from 'react'

export type AsyncEffectCallback = (
  signal: AbortSignal,
) => void | (() => void) | Promise<void | (() => void)>

export type DependencyList = readonly unknown[]

/**
 * 类似 useEffect，但 effect 可以是 async 函数。
 *
 * - 自动注入 AbortSignal，依赖变化 / 卸载时触发 abort
 * - 支持 async effect 返回 cleanup（同步或异步的清理函数）
 * - 防止"卸载后 setState"的竞态（通过 signal.aborted 检查）
 *
 * 用法：
 *   useAsyncEffect(async (signal) => {
 *     const r = await fetch(url, { signal })
 *     const data = await r.json()
 *     if (signal.aborted) return
 *     setData(data)
 *   }, [url])
 */
export function useAsyncEffect(
  effect: AsyncEffectCallback,
  deps?: DependencyList,
): void {
  useEffect(() => {
    const ctrl = new AbortController()
    let cancelled = false
    let cleanup: (() => void) | undefined

    ;(async () => {
      try {
        const result = await effect(ctrl.signal)
        if (typeof result === 'function') {
          if (cancelled) {
            try { result() } catch (e) { console.error('[useAsyncEffect] cleanup', e) }
          } else {
            cleanup = result
          }
        }
      } catch (e) {
        if (!ctrl.signal.aborted) {
          console.error('[useAsyncEffect]', e)
        }
      }
    })()

    return () => {
      cancelled = true
      ctrl.abort()
      try { cleanup?.() } catch (e) { console.error('[useAsyncEffect] cleanup', e) }
    }
  }, deps)
}