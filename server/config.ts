import fs from 'node:fs'
import { fileExists, mkdir } from 'lingcat-shared'
import crypto from 'node:crypto'

export const base_data_path = (process.argv.join().indexOf('vite') != -1) ? '../lingcat_data' : './lingcat_data'

mkdir(base_data_path)

export interface LingCatServerConfig {
    port?: number
    hostname?: string
    token_secret?: string
    max_file_size?: number

    /**
     * ===========================
     *     会议 (LiveKit)
     * ===========================
     */
    /** 是否启用会议功能 */
    livekit_enabled?: boolean
    /** 客户端连接 LiveKit 的地址, 例如 ws://localhost:7880 或 wss://livekit.example.com */
    livekit_url?: string
    /** 服务端访问 LiveKit HTTP API 的地址, 留空则由 livekit_url 推导 (用于人数兜底) */
    livekit_http_url?: string
    /** LiveKit API Key */
    livekit_api_key?: string
    /** LiveKit API Secret */
    livekit_api_secret?: string
    /** 单场会议最大人数 */
    max_meeting_participants?: number
    /** 会议令牌有效期 (秒) */
    meeting_token_ttl_seconds?: number
}

const default_config: LingCatServerConfig = {
    port: 3601,
    token_secret: crypto.randomBytes(16).toString('utf-8'),

    livekit_enabled: false,
    livekit_url: 'ws://localhost:7880',
    livekit_http_url: '',
    livekit_api_key: 'devkey',
    livekit_api_secret: 'secret',
    max_meeting_participants: 6,
    meeting_token_ttl_seconds: 7200,
}

if (!fileExists(base_data_path + '/config.json'))
    fs.writeFileSync(base_data_path + '/config.json', JSON.stringify(default_config, null, 4))

export let config: LingCatServerConfig = { ...default_config }
try {
    config = {
        ...default_config,
        ...JSON.parse(fs.readFileSync(base_data_path + '/config.json', 'utf8')),
    }
} catch (e) {
    console.log(e)
}

/**
 * 将 ws(s):// 地址推导为 http(s):// (LiveKit HTTP API 使用)
 */
export function livekitHttpUrl() {
    if (config.livekit_http_url) return config.livekit_http_url
    const url = config.livekit_url || ''
    if (url.startsWith('wss://')) return 'https://' + url.slice('wss://'.length)
    if (url.startsWith('ws://')) return 'http://' + url.slice('ws://'.length)
    return url
}
