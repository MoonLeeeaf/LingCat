import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const repoRoot = fileURLToPath(new URL('..', import.meta.url))

function gitOutput(args: string): string {
    try {
        return execSync(`git ${args}`, {
            cwd: repoRoot,
            stdio: ['ignore', 'pipe', 'ignore'],
        }).toString().trim()
    } catch {
        return ''
    }
}

function readProtocolVersion(): string {
    try {
        const pkg = JSON.parse(readFileSync(new URL('../protocol/package.json', import.meta.url), 'utf8'))
        return pkg.version || 'unknown'
    } catch {
        return 'unknown'
    }
}

const gitSha = process.env.GIT_SHA || gitOutput('rev-parse --short HEAD') || 'unknown'
const gitDirty = process.env.GIT_DIRTY != null
    ? process.env.GIT_DIRTY === '1' || process.env.GIT_DIRTY.toLowerCase() === 'true'
    : gitOutput('status --porcelain').length > 0

export const versionInfo = {
    /** 服务端与客户端共享的协议包版本 */
    protocol_version: readProtocolVersion(),
    /** 服务端部署对应的 git 提交 (短 SHA) */
    git_sha: gitSha,
    /** 服务端源码是否包含未提交改动 */
    git_dirty: gitDirty,
    /** 服务端进程启动时间 */
    started_at: new Date().toISOString(),
}
