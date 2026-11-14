import { LingCatProto, Methods } from "lingcat-protocol"
import type { ISticker, IStickerPack } from "lingcat-protocol"
import LingCatClient from "./LingCatClient.ts"
import decodeOrThrow from "./decodeOrThrow.ts"

/** 写入包内容的输入项; mime 与 sort 由服务端决定 */
export interface StickerInput {
    hash: string
    emoji?: string
}

export interface StickerPackDetail {
    pack: IStickerPack
    stickers: ISticker[]
}

function toPack(p: LingCatProto.classes.IStickerPack.$Properties): IStickerPack {
    return {
        id: p.id!,
        title: p.title!,
        author_user_id: p.authorUserId!,
        cover_file_hash: p.coverFileHash ?? undefined,
        created_at: Number(p.createdAt ?? 0),
        updated_at: Number(p.updatedAt ?? 0),
        subscribed: p.subscribed ?? undefined,
        is_author: p.isAuthor ?? undefined,
    }
}

function toSticker(s: LingCatProto.classes.ISticker.$Properties): ISticker {
    return {
        hash: s.hash!,
        pack_id: s.packId!,
        mime: s.mime!,
        emoji: s.emoji ?? undefined,
        sort: Number(s.sort ?? 0),
    }
}

export default class StickerApi {
    /** 我订阅的全部贴纸包及其贴纸 */
    static async getMyStickerPacks(client: LingCatClient, {
        access_token,
        timeout,
    }: {
        access_token: string
        timeout?: number
    }): Promise<StickerPackDetail[]> {
        const res = decodeOrThrow<LingCatProto.methods.Get_My_Sticker_Packs_Response>(
            LingCatProto.methods.Get_My_Sticker_Packs_Response,
            (await client.invoke({
                method_id: Methods.Get_My_Sticker_Packs_Request,
                data: LingCatProto.methods.Get_My_Sticker_Packs_Request.encode({
                    accessToken: access_token,
                }).finish(),
                timeout,
            })).data,
        )

        const byPack = new Map<string, ISticker[]>()
        for (const s of res.stickers || []) {
            const sticker = toSticker(s)
            const list = byPack.get(sticker.pack_id)
            if (list) list.push(sticker)
            else byPack.set(sticker.pack_id, [sticker])
        }

        return (res.packs || []).map(p => {
            const pack = toPack(p)
            return { pack, stickers: byPack.get(pack.id) ?? [] }
        })
    }

    /** 查询单个包 (点击消息里的贴纸时使用) */
    static async queryStickerPack(client: LingCatClient, {
        access_token,
        pack_id,
        timeout,
    }: {
        access_token: string
        pack_id: string
        timeout?: number
    }): Promise<StickerPackDetail> {
        const res = decodeOrThrow<LingCatProto.methods.Query_Sticker_Pack_Response>(
            LingCatProto.methods.Query_Sticker_Pack_Response,
            (await client.invoke({
                method_id: Methods.Query_Sticker_Pack_Request,
                data: LingCatProto.methods.Query_Sticker_Pack_Request.encode({
                    accessToken: access_token,
                    packId: pack_id,
                }).finish(),
                timeout,
            })).data,
        )

        return {
            pack: toPack(res.pack || {}),
            stickers: (res.stickers || []).map(toSticker),
        }
    }

    static async createStickerPack(client: LingCatClient, {
        access_token,
        title,
        timeout,
    }: {
        access_token: string
        title: string
        timeout?: number
    }): Promise<IStickerPack> {
        const res = decodeOrThrow<LingCatProto.methods.Create_Sticker_Pack_Response>(
            LingCatProto.methods.Create_Sticker_Pack_Response,
            (await client.invoke({
                method_id: Methods.Create_Sticker_Pack_Request,
                data: LingCatProto.methods.Create_Sticker_Pack_Request.encode({
                    accessToken: access_token,
                    title,
                }).finish(),
                timeout,
            })).data,
        )
        return toPack(res.pack || {})
    }

    static async updateStickerPackTitle(client: LingCatClient, {
        access_token,
        pack_id,
        title,
        timeout,
    }: {
        access_token: string
        pack_id: string
        title: string
        timeout?: number
    }): Promise<void> {
        decodeOrThrow<LingCatProto.methods.Update_Sticker_Pack_Title_Response>(
            LingCatProto.methods.Update_Sticker_Pack_Title_Response,
            (await client.invoke({
                method_id: Methods.Update_Sticker_Pack_Title_Request,
                data: LingCatProto.methods.Update_Sticker_Pack_Title_Request.encode({
                    accessToken: access_token,
                    packId: pack_id,
                    title,
                }).finish(),
                timeout,
            })).data,
        )
    }

    /** 覆盖式写入包内容; 数组顺序即展示顺序 */
    static async setStickerPackContent(client: LingCatClient, {
        access_token,
        pack_id,
        stickers,
        cover_file_hash,
        timeout,
    }: {
        access_token: string
        pack_id: string
        stickers: StickerInput[]
        /** 不传则保留原封面 */
        cover_file_hash?: string
        timeout?: number
    }): Promise<void> {
        decodeOrThrow<LingCatProto.methods.Set_Sticker_Pack_Content_Response>(
            LingCatProto.methods.Set_Sticker_Pack_Content_Response,
            (await client.invoke({
                method_id: Methods.Set_Sticker_Pack_Content_Request,
                data: LingCatProto.methods.Set_Sticker_Pack_Content_Request.encode({
                    accessToken: access_token,
                    packId: pack_id,
                    stickers: stickers.map(s => ({ hash: s.hash, emoji: s.emoji })),
                    coverFileHash: cover_file_hash,
                }).finish(),
                timeout,
            })).data,
        )
    }

    static async setStickerPackSubscribed(client: LingCatClient, {
        access_token,
        pack_id,
        subscribed,
        timeout,
    }: {
        access_token: string
        pack_id: string
        subscribed: boolean
        timeout?: number
    }): Promise<void> {
        decodeOrThrow<LingCatProto.methods.Set_Sticker_Pack_Subscribed_Response>(
            LingCatProto.methods.Set_Sticker_Pack_Subscribed_Response,
            (await client.invoke({
                method_id: Methods.Set_Sticker_Pack_Subscribed_Request,
                data: LingCatProto.methods.Set_Sticker_Pack_Subscribed_Request.encode({
                    accessToken: access_token,
                    packId: pack_id,
                    subscribed,
                }).finish(),
                timeout,
            })).data,
        )
    }

    static async deleteStickerPack(client: LingCatClient, {
        access_token,
        pack_id,
        timeout,
    }: {
        access_token: string
        pack_id: string
        timeout?: number
    }): Promise<void> {
        decodeOrThrow<LingCatProto.methods.Delete_Sticker_Pack_Response>(
            LingCatProto.methods.Delete_Sticker_Pack_Response,
            (await client.invoke({
                method_id: Methods.Delete_Sticker_Pack_Request,
                data: LingCatProto.methods.Delete_Sticker_Pack_Request.encode({
                    accessToken: access_token,
                    packId: pack_id,
                }).finish(),
                timeout,
            })).data,
        )
    }
}
