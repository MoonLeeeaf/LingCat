import SessionEnv from '../SessionEnv.ts'

/** 把 Vite 的 BASE_URL 规范化成 '/path' 或 ''（根路径） */
function normalizeBasePath(base: string): string {
    if (!base || base === '/' || base === './') return ''
    let p = base
    if (p.startsWith('./')) p = p.slice(2)
    if (!p.startsWith('/')) p = '/' + p
    p = p.replace(/\/+$/, '')
    return p === '/' ? '' : p
}

export function getCurrentServerAddr(): string | null {
    if (SessionEnv.isOutOfServer) return null

    const port = location.port
        || (location.protocol === 'https:' ? '443' : '80')

    const path = normalizeBasePath(import.meta.env.BASE_URL || '/')

    return `${location.hostname}:${port}${path}`
}

/**
 * 规范化服务端地址，统一为 `host:port[/path]` 格式。
 * - 去掉协议前缀（用于推默认端口）
 * - 保留路径——多路径部署是合法的（如 example.com/lingcat）
 * - 去掉尾部斜杠
 * - 无端口时按协议补默认（https/wss→443，http/ws→80，裸 host→443）
 */
export function normalizeServerAddress(raw: string): string {
    if (!raw) throw new Error('server address is empty')
    let s = raw.trim()

    // 没有 scheme 时补一个，用于 URL 解析
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) {
        s = 'https://' + s
    }

    let u: URL
    try {
        u = new URL(s)
    } catch {
        throw new Error(`Invalid server address: ${raw}`)
    }

    const isSecure = u.protocol === 'https:' || u.protocol === 'wss:'
    const isInsecure = u.protocol === 'http:' || u.protocol === 'ws:'
    if (!isSecure && !isInsecure) {
        throw new Error(`Unsupported protocol: ${u.protocol}`)
    }

    // 去掉末尾点（DNS 绝对域名写法 / 粘贴时的脏字符）
    let hostname = u.hostname.replace(/\.+$/, '')
    if (!hostname) throw new Error('Missing hostname')

    // 补端口
    let port = u.port
    if (!port) port = isSecure ? '443' : '80'

    // 路径去掉末尾斜杠
    let path = u.pathname.replace(/\/+$/, '')
    if (path === '/') path = ''

    return `${hostname}:${port}${path}`
}

/** 从规范化地址取端口（没有则返回 null） */
export function getPort(addr: string): number | null {
    const hostPart = addr.split('/')[0]
    const m = hostPart.match(/:(\d+)$/)
    return m ? parseInt(m[1], 10) : null
}

/**
 * 判断地址是否应该用 secure 协议。
 * 用户强调"鬼知道是 443 还是 80"，所以按端口判断：
 *   443 → secure；其余 → insecure。
 * 如果未来有"443 端口但走 http"这种诡异部署，再显式指定。
 */
export function isSecure(addr: string): boolean {
    return getPort(addr) === 443
}

/** 从规范化地址派生 ws/wss */
export function toWsUrl(addr: string): string {
    return `${isSecure(addr) ? 'wss' : 'ws'}://${addr}`
}

/** 从规范化地址派生 http/https */
export function toHttpUrl(addr: string): string {
    return `${isSecure(addr) ? 'https' : 'http'}://${addr}`
}