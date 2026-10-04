import { base_data_path, config } from './config.ts'
import createLingCatServer from './server.ts'
import { db } from './data/db.ts'

const server = createLingCatServer(base_data_path)

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
