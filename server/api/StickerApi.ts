import crypto from 'node:crypto'
import { Code, LingCatProto, Methods, Package } from 'lingcat-protocol'
import type { ISendPackageFunction } from './ISendPackageFunction.ts'
import TokenManager from './TokenManager.ts'
import sendError from './sendError.ts'
import StickerDataBase from '../data/StickerDataBase.ts'
import FileManager from '../data/FileManager.ts'
import type { ISticker, IStickerPack } from 'lingcat-protocol'

/** 单个包最多多少张贴纸 */
const MAX_STICKERS_PER_PACK = 120
/** 一个用户最多订阅多少个包 */
const MAX_SUBSCRIBED_PACKS = 200
/** 一个用户最多创建多少个包 */
const MAX_AUTHORED_PACKS = 50
/** 标题长度上限 */
const MAX_TITLE_LENGTH = 64
/** 单个贴纸接口的请求体上限 (120 张贴纸的 hash 远小于这个值) */
const MAX_REQUEST_BYTES = 256 * 1024

function normalizeTitle(raw: string): string | null {
    const title = (raw || '').trim()
    if (title.length === 0 || title.length > MAX_TITLE_LENGTH) return null
    return title
}

function packToProto(pack: IStickerPack, userId: string, subscribed: boolean): LingCatProto.classes.IStickerPack.$Properties {
    return {
        id: pack.id,
        title: pack.title,
        authorUserId: pack.author_user_id,
        coverFileHash: pack.cover_file_hash,
        createdAt: pack.created_at,
        updatedAt: pack.updated_at,
        subscribed,
        isAuthor: pack.author_user_id === userId,
    }
}

function stickerToProto(sticker: ISticker): LingCatProto.classes.ISticker.$Properties {
    return {
        hash: sticker.hash,
        packId: sticker.pack_id,
        mime: sticker.mime,
        emoji: sticker.emoji,
        sort: sticker.sort,
    }
}

async function verifyUserId(accessToken: string): Promise<string> {
    return (await TokenManager.verifyAccessToken(accessToken)).user_id
}

export default class StickerApi {
    static async onCall(sendPackage: ISendPackageFunction, mPackage: Package) {
        // 只拦截贴纸接口, 其它 API 的大消息仍由各自的 handler 处理
        if (
            mPackage.method_id >= Methods.Get_My_Sticker_Packs_Request &&
            mPackage.method_id <= Methods.Delete_Sticker_Pack_Response &&
            mPackage.data.length > MAX_REQUEST_BYTES
        ) {
            return sendError(sendPackage, mPackage.method_id, 'Request body too large', Code.Bad_Request)
        }
        switch (mPackage.method_id) {
            /**
             * ===============================
             *      我订阅的全部贴纸包
             * ===============================
             */
            case Methods.Get_My_Sticker_Packs_Request: {
                const data = LingCatProto.methods.Get_My_Sticker_Packs_Request.decode(mPackage.data)
                const user_id = await verifyUserId(data.accessToken)

                const packs = await StickerDataBase.queryPacksOfUser(user_id)
                const stickers = await StickerDataBase.queryStickersOfPacks(packs.map(p => p.id))

                sendPackage(Package.encode({
                    method_id: Methods.Get_My_Sticker_Packs_Response,
                    flags: 0,
                    data: LingCatProto.methods.Get_My_Sticker_Packs_Response.encode({
                        packs: packs.map(p => packToProto(p, user_id, true)),
                        stickers: stickers.map(stickerToProto),
                    }).finish(),
                }))
                break
            }
            /**
             * ===============================
             *         查询单个贴纸包
             * ===============================
             */
            case Methods.Query_Sticker_Pack_Request: {
                const data = LingCatProto.methods.Query_Sticker_Pack_Request.decode(mPackage.data)
                const user_id = await verifyUserId(data.accessToken)

                const pack = await StickerDataBase.queryPack(data.packId)
                if (!pack) {
                    return sendError(sendPackage, mPackage.method_id, 'Sticker pack not found', Code.Not_Found)
                }

                const subscribed = await StickerDataBase.isSubscribed(user_id, pack.id)
                const stickers = await StickerDataBase.queryStickers(pack.id)

                sendPackage(Package.encode({
                    method_id: Methods.Query_Sticker_Pack_Response,
                    flags: 0,
                    data: LingCatProto.methods.Query_Sticker_Pack_Response.encode({
                        pack: packToProto(pack, user_id, subscribed),
                        stickers: stickers.map(stickerToProto),
                    }).finish(),
                }))
                break
            }
            /**
             * ===============================
             *           创建贴纸包
             * ===============================
             */
            case Methods.Create_Sticker_Pack_Request: {
                const data = LingCatProto.methods.Create_Sticker_Pack_Request.decode(mPackage.data)
                const user_id = await verifyUserId(data.accessToken)

                const title = normalizeTitle(data.title)
                if (!title) {
                    return sendError(sendPackage, mPackage.method_id, `Title must be 1-${MAX_TITLE_LENGTH} characters`, Code.Bad_Request)
                }

                const authored = (await StickerDataBase.queryPacksOfUser(user_id))
                    .filter(p => p.author_user_id === user_id)
                if (authored.length >= MAX_AUTHORED_PACKS) {
                    return sendError(sendPackage, mPackage.method_id, `You can create at most ${MAX_AUTHORED_PACKS} packs`, Code.Forbidden)
                }

                const pack = await StickerDataBase.createPack({
                    id: crypto.randomUUID(),
                    title,
                    author_user_id: user_id,
                    cover_file_hash: null,
                })

                sendPackage(Package.encode({
                    method_id: Methods.Create_Sticker_Pack_Response,
                    flags: 0,
                    data: LingCatProto.methods.Create_Sticker_Pack_Response.encode({
                        pack: packToProto(pack, user_id, true),
                    }).finish(),
                }))
                break
            }
            /**
             * ===============================
             *          修改包标题
             * ===============================
             */
            case Methods.Update_Sticker_Pack_Title_Request: {
                const data = LingCatProto.methods.Update_Sticker_Pack_Title_Request.decode(mPackage.data)
                const user_id = await verifyUserId(data.accessToken)

                const pack = await StickerDataBase.queryPack(data.packId)
                if (!pack) {
                    return sendError(sendPackage, mPackage.method_id, 'Sticker pack not found', Code.Not_Found)
                }
                if (pack.author_user_id !== user_id) {
                    return sendError(sendPackage, mPackage.method_id, 'Only the author can edit this pack', Code.Forbidden)
                }

                const title = normalizeTitle(data.title)
                if (!title) {
                    return sendError(sendPackage, mPackage.method_id, `Title must be 1-${MAX_TITLE_LENGTH} characters`, Code.Bad_Request)
                }

                await StickerDataBase.updateTitle(pack.id, title)

                sendPackage(Package.encode({
                    method_id: Methods.Update_Sticker_Pack_Title_Response,
                    flags: 0,
                    data: LingCatProto.methods.Update_Sticker_Pack_Title_Response.encode({}).finish(),
                }))
                break
            }
            /**
             * ===============================
             *        覆盖式写入包内容
             * ===============================
             */
            case Methods.Set_Sticker_Pack_Content_Request: {
                const data = LingCatProto.methods.Set_Sticker_Pack_Content_Request.decode(mPackage.data)
                const user_id = await verifyUserId(data.accessToken)

                const pack = await StickerDataBase.queryPack(data.packId)
                if (!pack) {
                    return sendError(sendPackage, mPackage.method_id, 'Sticker pack not found', Code.Not_Found)
                }
                if (pack.author_user_id !== user_id) {
                    return sendError(sendPackage, mPackage.method_id, 'Only the author can edit this pack', Code.Forbidden)
                }
                if (data.stickers.length > MAX_STICKERS_PER_PACK) {
                    return sendError(sendPackage, mPackage.method_id, `A pack can hold at most ${MAX_STICKERS_PER_PACK} stickers`, Code.Bad_Request)
                }

                // 先全部校验, 有任何一项失败就不动旧内容
                const seen = new Set<string>()
                const items: { hash: string, mime: string, emoji?: string | null }[] = []

                for (const input of data.stickers) {
                    const hash = (input.hash || '').trim()
                    if (!hash) {
                        return sendError(sendPackage, mPackage.method_id, 'Sticker hash should not be empty', Code.Bad_Request)
                    }
                    if (seen.has(hash)) {
                        return sendError(sendPackage, mPackage.method_id, 'Duplicated sticker: ' + hash, Code.Bad_Request)
                    }
                    seen.add(hash)

                    const mime = await FileManager.detectStickerMime(hash)
                    if (!mime) {
                        return sendError(sendPackage, mPackage.method_id, 'Not a supported sticker image: ' + hash, Code.Bad_Request)
                    }

                    const emoji = input.emoji ? input.emoji.trim().slice(0, 16) : undefined
                    items.push({ hash, mime, emoji })
                }

                let coverFileHash: string | undefined
                if (data.coverFileHash !== undefined && data.coverFileHash !== null && data.coverFileHash !== '') {
                    const coverMime = await FileManager.detectStickerMime(data.coverFileHash)
                    if (!coverMime) {
                        return sendError(sendPackage, mPackage.method_id, 'Cover is not a supported image', Code.Bad_Request)
                    }
                    coverFileHash = data.coverFileHash
                }

                await StickerDataBase.setContent(pack.id, items, coverFileHash)

                sendPackage(Package.encode({
                    method_id: Methods.Set_Sticker_Pack_Content_Response,
                    flags: 0,
                    data: LingCatProto.methods.Set_Sticker_Pack_Content_Response.encode({}).finish(),
                }))
                break
            }
            /**
             * ===============================
             *          订阅 / 取消订阅
             * ===============================
             */
            case Methods.Set_Sticker_Pack_Subscribed_Request: {
                const data = LingCatProto.methods.Set_Sticker_Pack_Subscribed_Request.decode(mPackage.data)
                const user_id = await verifyUserId(data.accessToken)

                const pack = await StickerDataBase.queryPack(data.packId)
                if (!pack) {
                    return sendError(sendPackage, mPackage.method_id, 'Sticker pack not found', Code.Not_Found)
                }

                if (data.subscribed) {
                    const count = await StickerDataBase.countSubscribedPacks(user_id)
                    const already = await StickerDataBase.isSubscribed(user_id, pack.id)
                    if (!already && count >= MAX_SUBSCRIBED_PACKS) {
                        return sendError(sendPackage, mPackage.method_id, `You can subscribe to at most ${MAX_SUBSCRIBED_PACKS} packs`, Code.Forbidden)
                    }
                } else if (pack.author_user_id === user_id) {
                    return sendError(sendPackage, mPackage.method_id, 'The author cannot unsubscribe from their own pack', Code.Bad_Request)
                }

                await StickerDataBase.setSubscribed(user_id, pack.id, data.subscribed)

                sendPackage(Package.encode({
                    method_id: Methods.Set_Sticker_Pack_Subscribed_Response,
                    flags: 0,
                    data: LingCatProto.methods.Set_Sticker_Pack_Subscribed_Response.encode({}).finish(),
                }))
                break
            }
            /**
             * ===============================
             *           删除贴纸包
             * ===============================
             */
            case Methods.Delete_Sticker_Pack_Request: {
                const data = LingCatProto.methods.Delete_Sticker_Pack_Request.decode(mPackage.data)
                const user_id = await verifyUserId(data.accessToken)

                const pack = await StickerDataBase.queryPack(data.packId)
                if (!pack) {
                    return sendError(sendPackage, mPackage.method_id, 'Sticker pack not found', Code.Not_Found)
                }
                if (pack.author_user_id !== user_id) {
                    return sendError(sendPackage, mPackage.method_id, 'Only the author can delete this pack', Code.Forbidden)
                }

                // 只清理包与订阅关系, 图片文件保留, 历史消息继续可用
                await StickerDataBase.deletePack(pack.id)

                sendPackage(Package.encode({
                    method_id: Methods.Delete_Sticker_Pack_Response,
                    flags: 0,
                    data: LingCatProto.methods.Delete_Sticker_Pack_Response.encode({}).finish(),
                }))
                break
            }
            default:
                return false
        }
        return true
    }
}
