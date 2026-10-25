const cache = new Map<string, Promise<string>>()

/**
 * 查询附件的 MIME 类型。
 * - 优先用 hash 作为缓存键（token 刷新导致 URL 变化时仍能命中）
 * - HEAD 请求只取响应头，不下载内容
 * - 失败时降级为 application/octet-stream
 */
export function queryAttachmentMime(url: string, cacheKey?: string): Promise<string> {
    const key = cacheKey || url
    const existing = cache.get(key)
    if (existing) return existing

    const promise = fetch(url, { method: 'HEAD' })
        .then((r) => {
            const ct = r.headers.get('Content-Type')
            return ct ? ct.split(';')[0].trim() : 'application/octet-stream'
        })
        .catch(() => 'application/octet-stream')

    cache.set(key, promise)
    return promise
}
