import { IClientConfig } from '../ClientConfig.ts'
import ClientManager, { type ServerTrustStatus } from '../ClientManager.ts'
import { normalizeServerAddress } from './serverAddress.ts'

export interface TrustCheckResult {
    addr: string
    publicKeyHex: string
    status: ServerTrustStatus
    config: IClientConfig
}

/**
 * 拉取 config.json + 判定本地信任状态。
 * 调用方根据 status 决定下一步：
 *   - trusted  → 直接用
 *   - new      → 弹 TOFU 确认
 *   - mismatch → 弹警告
 */
export async function checkServer(
    rawAddr: string,
): Promise<TrustCheckResult> {
    const addr = normalizeServerAddress(rawAddr)
    const config = await ClientManager.fetchServerConfig(addr)

    if (!config.public_key) {
        throw new Error('服务端未返回公钥')
    }

    const status = ClientManager.checkServerTrust(addr, config.public_key)
    return {
        addr,
        publicKeyHex: config.public_key,
        status,
        config,
    }
}

/**
 * 用户确认后调用。
 */
export function acceptServerPublicKey(addr: string, publicKeyHex: string): void {
    ClientManager.trustServer(addr, publicKeyHex)
}