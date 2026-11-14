import type { IMessageEntity } from 'lingcat-protocol'

/** 支持入库的贴纸 MIME → 扩展名 */
const EXT_BY_MIME: Record<string, string> = {
    'image/png': 'png',
    'image/webp': 'webp',
}

/**
 * 贴纸的展示文件名。
 *
 * 服务端识别出的真实 MIME 是唯一依据, 不能写死 webp:
 * 聊天里显示的 `sticker.png` / `sticker.webp` 要和实际文件一致。
 */
export function stickerDisplayName(mime?: string | null): string {
    const ext = EXT_BY_MIME[(mime || '').toLowerCase()]
    return `sticker.${ext || 'png'}`
}

export interface StickerRef {
    hash: string
    /** 贴纸所属的包; 从历史消息里可能拿不到 */
    packId?: string
    emoji?: string | null
    mime?: string | null
}

/**
 * 生成贴纸的文本层语法。
 *
 * 与 `lingcat://file?hash=` 同构, 旧客户端解析不到时退化为普通附件文本, 不会报错。
 */
export function buildStickerText(s: StickerRef): string {
    const params = new URLSearchParams()
    params.set('hash', s.hash)
    if (s.packId) params.set('packId', s.packId)
    if (s.emoji) params.set('emoji', s.emoji)
    return `![${stickerDisplayName(s.mime)}](lingcat://sticker?${params.toString()})`
}

export interface AttachmentEntityData {
    hash: string
    name?: string
    kind?: string
    packId?: string
    emoji?: string
    [key: string]: unknown
}

/** 安全解析 attachment entity 的 data 字段 */
export function parseAttachmentData(raw?: string | null): AttachmentEntityData | null {
    if (!raw) return null
    try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && typeof parsed.hash === 'string') {
            return parsed as AttachmentEntityData
        }
        return null
    } catch {
        return null
    }
}

/** 消息里唯一一个 attachment entity 且 kind=sticker 时的贴纸数据 */
export function getStickerEntityData(entity?: IMessageEntity | null): AttachmentEntityData | null {
    if (!entity || entity.type !== 'attachment') return null
    const data = parseAttachmentData(entity.data)
    return data?.kind === 'sticker' ? data : null
}

/**
 * 是否为纯贴纸消息: 唯一 entity 且是贴纸, entity 区间外的文本全为空白。
 *
 * 纯贴纸消息会去掉气泡与头像, 直接居中展示贴纸。
 */
export function isPureStickerMessage(text: string, entities?: IMessageEntity[] | null): boolean {
    if (!entities || entities.length !== 1) return false
    const entity = entities[0]
    if (!getStickerEntityData(entity)) return false
    return text.slice(0, entity.offset).trim() === ''
        && text.slice(entity.offset + entity.length).trim() === ''
}
