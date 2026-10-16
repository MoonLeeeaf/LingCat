import ClientManager from './ClientManager.ts'
import { UserApi } from 'lingcat-client-protocol'

export default class RemarksCache {
    /** userId → remark。空字符串或不存在表示"无备注" */
    static user_remarks: { [k: string]: string } = {}

    /** 正在进行的 loadAll（并发去重） */
    private static loadPromise: Promise<void> | null = null

    /** 上次成功加载对应的 session.key（切账号自动失效） */
    private static loadedForSessionKey: string | null = null

    /** 同步读备注。未加载或无备注返回 undefined */
    static get(user_id: string): string | undefined {
        const r = this.user_remarks[user_id]
        return r && r.length > 0 ? r : undefined
    }

    /**
     * 本地更新（自己改备注后调用，避免立即全量重拉）。
     * 传空字符串 = 删除备注。
     */
    static set(user_id: string, remark: string) {
        if (remark && remark.length > 0) {
            this.user_remarks[user_id] = remark
        } else {
            delete this.user_remarks[user_id]
        }
    }

    /**
     * 全量拉取。
     * - 并发去重：多个调用者只发一次请求
     * - 切换账号自动失效（session.key 变化时重拉）
     * - 拉失败不抛，只是保留旧数据（备注不是关键路径）
     */
    static async loadAll(): Promise<void> {
        const session = ClientManager.getActiveSession()
        if (!session) return

        // 有正在进行的 → 复用它
        if (this.loadPromise) return this.loadPromise

        // 已为当前 session 拉过 → 直接返回
        if (this.loadedForSessionKey === session.key) return

        // 切换了账号 → 清空旧数据
        if (this.loadedForSessionKey !== session.key) {
            this.user_remarks = {}
        }

        this.loadPromise = (async () => {
            try {
                const client = ClientManager.getActiveClient()
                if (!client) return

                const res = await UserApi.getMyUserRemarks(client, {
                    access_token: session.token,
                })

                const next: { [k: string]: string } = {}
                for (const r of res) {
                    // proto 生成的是 camelCase（userId），业务用 snake_case，这里统一转
                    const uid = r.user_id
                    const remark = r.remark
                    if (uid && remark) next[uid] = remark
                }
                this.user_remarks = next
                this.loadedForSessionKey = session.key
            } catch (e) {
                console.warn('[RemarksCache] loadAll failed', e)
                // 不抛：备注拉失败不影响主流程
            } finally {
                this.loadPromise = null
            }
        })()

        return this.loadPromise
    }

    /** 收到变更事件时重拉（多设备同步） */
    static async refresh(): Promise<void> {
        this.loadedForSessionKey = null
        return this.loadAll()
    }

    /** 切账号 / 登出时手动清空 */
    static clear() {
        this.user_remarks = {}
        this.loadedForSessionKey = null
        this.loadPromise = null
    }
}