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

    site_title: string
    /** 部署子路径 (如 '/lingcat'); 用于拼接 OAuth 回调地址, 根路径留空 */
    base_path?: string

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

    /**
     * ===========================
     *      通用 OAuth2 / OIDC 登录
     * ===========================
     * 每个数组项是一种登录方式, 可配置任意 OIDC (Pocket ID/Keycloak/Authentik/Auth0...)
     * 或纯 OAuth2 (GitHub/Gitee...) 提供方。
     */
    oauth2?: OAuth2ProviderConfig[]

    /**
     * 允许客户端通过 `?redirect=` 指定的最终跳转地址白名单。
     * 用于原生客户端（Android / iOS / 桌面端）接收 OAuth 回调，
     * 例如 ['lingcat://oauth/callback']。
     *
     * 留空则使用内置默认值，仅允许 lingcat://oauth/callback。
     * 只允许自定义 scheme，http(s) 一律拒绝（防开放重定向）。
     */
    oauth_redirect_allowlist?: string[]
}

export interface OAuth2ProviderConfig {
    /** 唯一标识, 同时用作回调路径 (/oauth/<id>/...) 与 OAuthIdentities.provider */
    id: string
    enabled?: boolean
    /** 'oidc' (有 id_token, 用发现文档) 或 'oauth2' (纯授权码 + userinfo); 默认 'oidc' */
    type?: 'oidc' | 'oauth2'
    /** 登录按钮显示名 */
    display_name?: string

    /** --- OIDC --- */
    /** 发行者 URL, 用于发现文档, 例如 https://pocket.example.com */
    issuer?: string

    /** --- 通用 OAuth2 --- */
    authorization_url?: string
    token_url?: string
    userinfo_url?: string

    /** --- 公共 --- */
    client_id?: string
    client_secret?: string
    /** 空格分隔, 例如 "openid profile email"; 纯 OAuth2 例: "read:user user:email" */
    scopes?: string
    /** 回调地址; 留空则由请求 Host 推导为 <origin>/oauth/<id>/callback */
    redirect_uri?: string

    /** 用户信息字段映射 (纯 OAuth2 常用) */
    user_id_claim?: string
    name_claim?: string
    email_claim?: string

    /** token 端点客户端认证方式, 默认 'post' (可选 'basic') */
    token_auth?: 'post' | 'basic'
    /** 是否使用 PKCE (OIDC 默认 true; 纯 OAuth2 默认 false, 如 GitHub 不支持) */
    use_pkce?: boolean

    /** 首次登录是否自动建号; 默认 false (仅绑定, 策略 B) */
    auto_create_user?: boolean
}

const default_config: LingCatServerConfig = {
    port: 3601,
    token_secret: crypto.randomBytes(16).toString('utf-8'),

    site_title: '灵猫',
    base_path: '',

    livekit_enabled: false,
    livekit_url: 'ws://localhost:7880',
    livekit_http_url: '',
    livekit_api_key: 'devkey',
    livekit_api_secret: 'secret',
    max_meeting_participants: 6,
    meeting_token_ttl_seconds: 7200,

    oauth2: [],
    oauth_redirect_allowlist: ['lingcat://oauth/callback'],
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
