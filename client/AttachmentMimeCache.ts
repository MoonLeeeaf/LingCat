const cache = new Map<string, Promise<string>>()

/**
 * 查询附件的 MIME 类型。
 * - 用 URL 作为缓存键（同一个 hash 只请求一次）
 * - HEAD 请求只取响应头，不下载内容
 * - 失败时降级为 application/octet-stream
 */
export function queryAttachmentMime(url: string): Promise<string> {
    const existing = cache.get(url)
    if (existing) return existing

    const promise = fetch(url, { method: 'HEAD' })
        .then((r) => {
            const ct = r.headers.get('Content-Type')
            return ct ? ct.split(';')[0].trim() : 'application/octet-stream'
        })
        .catch(() => 'application/octet-stream')

    cache.set(url, promise)
    return promise
}
