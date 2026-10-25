import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { base_data_path, config } from "../server/config.ts"
import { nodePolyfills } from "vite-plugin-node-polyfills"
import fs from "node:fs"
import { execSync } from "node:child_process"

const path = base_data_path + "/page"

try {
  fs.rmSync(path, { recursive: true, force: true })
} catch (e) {}

function gitOutput(args: string): string {
  try {
    return execSync(`git ${args}`, {
      cwd: '..',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString().trim()
  } catch {
    return ''
  }
}

// 部署时可用 GIT_SHA / GIT_DIRTY 覆盖, 避免在“分支文件覆盖 main”的部署方式下显示错误的 HEAD
const buildSha = process.env.GIT_SHA || gitOutput('rev-parse HEAD') || 'unknown'
const buildDirty = process.env.GIT_DIRTY != null
  ? process.env.GIT_DIRTY === '1' || process.env.GIT_DIRTY.toLowerCase() === 'true'
  : gitOutput('status --porcelain').length > 0
const buildTime = process.env.BUILD_TIME || new Date().toISOString()
const buildBranch = process.env.GIT_BRANCH || gitOutput('rev-parse --abbrev-ref HEAD') || 'unknown'
const buildChannel = process.env.BUILD_CHANNEL || (process.env.NODE_ENV === 'development' ? 'dev' : 'prod')

function readVersion(relativePath: string): string {
  try {
    const pkg = JSON.parse(fs.readFileSync(new URL(relativePath, import.meta.url), 'utf8'))
    return pkg.version || 'unknown'
  } catch {
    return 'unknown'
  }
}

const appVersion = readVersion('./package.json')
const protocolVersion = readVersion('../protocol/package.json')

//   ''          → '/'
//   '/lingcat'  → '/lingcat/'
//   '/lingcat/' → '/lingcat/'
const basePath = (config.base_path || '').replace(/\/+$/, '')
const viteBase = basePath + '/'

export default defineConfig({
  base: viteBase,
  define: {
    __BUILD_SHA__: JSON.stringify(buildSha),
    __BUILD_TIME__: JSON.stringify(buildTime),
    __BUILD_DIRTY__: JSON.stringify(buildDirty),
    __BUILD_BRANCH__: JSON.stringify(buildBranch),
    __BUILD_CHANNEL__: JSON.stringify(buildChannel),
    __APP_VERSION__: JSON.stringify(appVersion),
    __PROTOCOL_VERSION__: JSON.stringify(protocolVersion),
  },
  plugins: [
    react(),
    nodePolyfills({
      include: ["crypto", "stream", "vm"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  build: {
    sourcemap: true,
    outDir: path,
    rolldownOptions: {
      // 不变
    },
  },
})