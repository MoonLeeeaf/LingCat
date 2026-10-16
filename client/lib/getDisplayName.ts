import type { IUser } from 'lingcat-protocol'
import ProfileCache from '../ProfileCache.ts'
import RemarksCache from '../RemarksCache.ts'

/**
 * 统一获取用户显示名。
 * 优先级：备注 > 昵称 > 用户名 > userId 前 8 位
 *
 * 同步函数——不会触发网络请求。
 * 调用方需要先确保 ProfileCache / RemarksCache 已就绪。
 */
export function getDisplayName(user_id: string, user?: IUser | null): string {
    const remark = RemarksCache.get(user_id)
    if (remark) return remark

    if (user?.nickname) return user.nickname
    if (user?.username) return user.username

    const cached = ProfileCache.user_info[user_id]
    if (cached) {
        if (cached.nickname) return cached.nickname
        if (cached.username) return cached.username
    }

    return user_id
}