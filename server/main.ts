import { base_data_path, config } from './config.ts'
import createLingCatServer from './server.ts'
import { db } from './data/db.ts'

const server = createLingCatServer(base_data_path)

// 反向代理复用上游连接时，如果 Node 先按默认的 5s keepAliveTimeout 关闭空闲连接，
// 代理侧就会拿到 "upstream prematurely closed connection" 并回 502。
// 让 Node 的连接空闲时间明显长于代理的 keepalive，从源头避开这个竞态。
server.httpServer.keepAliveTimeout = 65_000
server.httpServer.headersTimeout = 66_000

server.httpServer.listen(config.port || 3601, config.hostname, () => {
    console.log('[Server] listening on', config.hostname || '0.0.0.0', config.port || 3601)
})

let shuttingDown = false
async function shutdown(signal: string) {
    if (shuttingDown) return
    shuttingDown = true
    console.log('[Server] received', signal, ', shutting down...')

    // 超时兜底: 5s 内没关完就强退
    const force = setTimeout(() => {
        console.error('[Server] graceful shutdown timeout, forcing exit')
        process.exit(1)
    }, 5000)
    force.unref?.()

    try { await server.close() } catch (e) { console.error('[Server] close error', e) }
    try { await db.destroy() } catch (e) { console.error('[Server] db destroy error', e) }

    clearTimeout(force)
    console.log('[Server] bye')
    process.exit(0)
}

process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('SIGTERM', () => void shutdown('SIGTERM'))

// 最后一道兜底：漏网的异步异常不应该让整个服务退出。
// 一次退出就意味着所有在线用户同时掉线、代理开始返回 502。
// 具体问题仍然要在调用点修复，这里只保证影响面可控。
process.on('unhandledRejection', (reason) => {
    console.error('[Server] unhandled rejection (process kept alive):', reason)
})
