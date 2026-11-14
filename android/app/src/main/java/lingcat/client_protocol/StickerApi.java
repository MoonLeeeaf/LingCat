package lingcat.client_protocol;

import com.google.protobuf.Parser;

import lingcat.classes.Classes;
import lingcat.methods.Methods;
import lingcat.protocol.Package;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

/**
 * 贴纸包相关 API。
 *
 * 与 TS 端 client_protocol/StickerApi.ts 一一对应, 对外结构使用驼峰命名。
 */
public final class StickerApi {

    public static final long DEFAULT_TIMEOUT_MS = 30_000L;

    private StickerApi() {}

    // ============================================================
    //                      对外数据结构
    // ============================================================

    /** 对应 TS 的 ISticker */
    public static class Sticker {
        public final String hash;
        public final String packId;
        public final String mime;
        public final String emoji;
        public final int sort;

        public Sticker(String hash, String packId, String mime, String emoji, int sort) {
            this.hash = hash;
            this.packId = packId;
            this.mime = mime;
            this.emoji = emoji;
            this.sort = sort;
        }

        /** 展示文件名: sticker.<真实扩展名>, 与服务端识别出的 MIME 一致 */
        public String displayName() {
            if ("image/webp".equalsIgnoreCase(mime)) return "sticker.webp";
            return "sticker.png";
        }
    }

    /** 对应 TS 的 IStickerPack */
    public static class StickerPack {
        public final String id;
        public final String title;
        public final String authorUserId;
        /** 可为 null */
        public final String coverFileHash;
        public final long createdAt;
        public final long updatedAt;
        public final boolean subscribed;
        public final boolean isAuthor;

        public StickerPack(String id, String title, String authorUserId, String coverFileHash,
                           long createdAt, long updatedAt, boolean subscribed, boolean isAuthor) {
            this.id = id;
            this.title = title;
            this.authorUserId = authorUserId;
            this.coverFileHash = coverFileHash;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
            this.subscribed = subscribed;
            this.isAuthor = isAuthor;
        }
    }

    /** 一个包 + 它包含的贴纸 */
    public static class StickerPackDetail {
        public final StickerPack pack;
        public final List<Sticker> stickers;

        public StickerPackDetail(StickerPack pack, List<Sticker> stickers) {
            this.pack = pack;
            this.stickers = stickers;
        }
    }

    /** 写入包内容的输入项; mime 与 sort 由服务端决定 */
    public static class StickerInput {
        public final String hash;
        public final String emoji;

        public StickerInput(String hash, String emoji) {
            this.hash = hash;
            this.emoji = emoji;
        }
    }

    // ============================================================
    //                      内部工具
    // ============================================================

    private static Package await(LingCatClient client, int methodId,
                                 byte[] data, long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        long effective = timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS;
        return client.invoke(methodId, data, 0, effective)
                .get(effective, TimeUnit.MILLISECONDS);
    }

    private static <T> T decode(Parser<T> parser, byte[] data) {
        return DecodeOrThrow.decode(parser, data);
    }

    private static Sticker toSticker(Classes.ISticker s) {
        return new Sticker(
                s.getHash(),
                s.getPackId(),
                s.getMime(),
                s.hasEmoji() ? s.getEmoji() : null,
                s.getSort()
        );
    }

    private static StickerPack toPack(Classes.IStickerPack p) {
        return new StickerPack(
                p.getId(),
                p.getTitle(),
                p.getAuthorUserId(),
                p.hasCoverFileHash() ? p.getCoverFileHash() : null,
                p.getCreatedAt(),
                p.getUpdatedAt(),
                p.getSubscribed(),
                p.getIsAuthor()
        );
    }

    // ============================================================
    //                      API
    // ============================================================

    /** 我订阅的全部贴纸包及其贴纸 */
    public static List<StickerPackDetail> getMyStickerPacks(LingCatClient client,
                                                            String accessToken,
                                                            long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Methods.Get_My_Sticker_Packs_Request req =
                Methods.Get_My_Sticker_Packs_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .build();

        byte[] data = await(client, lingcat.protocol.Methods.Get_My_Sticker_Packs_Request,
                req.toByteArray(), timeoutMs).data;
        Methods.Get_My_Sticker_Packs_Response res =
                decode(Methods.Get_My_Sticker_Packs_Response.parser(), data);

        // 服务端把所有包的贴纸拍平在一个数组里, 这里按 packId 分组
        List<StickerPackDetail> result = new ArrayList<>();
        for (Classes.IStickerPack p : res.getPacksList()) {
            List<Sticker> stickers = new ArrayList<>();
            for (Classes.ISticker s : res.getStickersList()) {
                if (p.getId().equals(s.getPackId())) stickers.add(toSticker(s));
            }
            result.add(new StickerPackDetail(toPack(p), stickers));
        }
        return result;
    }

    public static List<StickerPackDetail> getMyStickerPacks(LingCatClient client, String accessToken)
            throws InterruptedException, ExecutionException, TimeoutException {
        return getMyStickerPacks(client, accessToken, DEFAULT_TIMEOUT_MS);
    }

    /** 查询单个贴纸包 (点击消息里的贴纸时使用) */
    public static StickerPackDetail queryStickerPack(LingCatClient client,
                                                     String accessToken,
                                                     String packId,
                                                     long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Methods.Query_Sticker_Pack_Request req =
                Methods.Query_Sticker_Pack_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setPackId(packId)
                        .build();

        byte[] data = await(client, lingcat.protocol.Methods.Query_Sticker_Pack_Request,
                req.toByteArray(), timeoutMs).data;
        Methods.Query_Sticker_Pack_Response res =
                decode(Methods.Query_Sticker_Pack_Response.parser(), data);

        StickerPack pack = res.hasPack() ? toPack(res.getPack()) : null;
        List<Sticker> stickers = new ArrayList<>();
        for (Classes.ISticker s : res.getStickersList()) stickers.add(toSticker(s));
        return new StickerPackDetail(pack, stickers);
    }

    public static StickerPackDetail queryStickerPack(LingCatClient client, String accessToken, String packId)
            throws InterruptedException, ExecutionException, TimeoutException {
        return queryStickerPack(client, accessToken, packId, DEFAULT_TIMEOUT_MS);
    }

    public static StickerPack createStickerPack(LingCatClient client,
                                                String accessToken,
                                                String title,
                                                long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Methods.Create_Sticker_Pack_Request req =
                Methods.Create_Sticker_Pack_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setTitle(title)
                        .build();

        byte[] data = await(client, lingcat.protocol.Methods.Create_Sticker_Pack_Request,
                req.toByteArray(), timeoutMs).data;
        Methods.Create_Sticker_Pack_Response res =
                decode(Methods.Create_Sticker_Pack_Response.parser(), data);

        return res.hasPack() ? toPack(res.getPack()) : null;
    }

    public static StickerPack createStickerPack(LingCatClient client, String accessToken, String title)
            throws InterruptedException, ExecutionException, TimeoutException {
        return createStickerPack(client, accessToken, title, DEFAULT_TIMEOUT_MS);
    }

    /** 修改包标题 (仅作者) */
    public static void updateStickerPackTitle(LingCatClient client,
                                              String accessToken,
                                              String packId,
                                              String title,
                                              long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Methods.Update_Sticker_Pack_Title_Request req =
                Methods.Update_Sticker_Pack_Title_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setPackId(packId)
                        .setTitle(title)
                        .build();

        byte[] data = await(client, lingcat.protocol.Methods.Update_Sticker_Pack_Title_Request,
                req.toByteArray(), timeoutMs).data;
        // 即使返回值用不到也必须 decode, 否则 Error_Response 会被静默吞掉
        decode(Methods.Update_Sticker_Pack_Title_Response.parser(), data);
    }

    public static void updateStickerPackTitle(LingCatClient client, String accessToken,
                                              String packId, String title)
            throws InterruptedException, ExecutionException, TimeoutException {
        updateStickerPackTitle(client, accessToken, packId, title, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 覆盖式写入包内容 (仅作者)。数组顺序即展示顺序, 空列表表示清空。
     *
     * @param coverFileHash 传 null 表示保留原封面
     */
    public static void setStickerPackContent(LingCatClient client,
                                             String accessToken,
                                             String packId,
                                             List<StickerInput> stickers,
                                             String coverFileHash,
                                             long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Methods.Set_Sticker_Pack_Content_Request.Builder b =
                Methods.Set_Sticker_Pack_Content_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setPackId(packId);

        if (stickers != null) {
            for (StickerInput s : stickers) {
                Methods.StickerInput.Builder in = Methods.StickerInput.newBuilder()
                        .setHash(s.hash);
                if (s.emoji != null && !s.emoji.isEmpty()) in.setEmoji(s.emoji);
                b.addStickers(in.build());
            }
        }
        if (coverFileHash != null) b.setCoverFileHash(coverFileHash);

        byte[] data = await(client, lingcat.protocol.Methods.Set_Sticker_Pack_Content_Request,
                b.build().toByteArray(), timeoutMs).data;
        decode(Methods.Set_Sticker_Pack_Content_Response.parser(), data);
    }

    public static void setStickerPackContent(LingCatClient client, String accessToken,
                                             String packId, List<StickerInput> stickers)
            throws InterruptedException, ExecutionException, TimeoutException {
        setStickerPackContent(client, accessToken, packId, stickers, null, DEFAULT_TIMEOUT_MS);
    }

    public static void setStickerPackSubscribed(LingCatClient client,
                                                String accessToken,
                                                String packId,
                                                boolean subscribed,
                                                long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Methods.Set_Sticker_Pack_Subscribed_Request req =
                Methods.Set_Sticker_Pack_Subscribed_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setPackId(packId)
                        .setSubscribed(subscribed)
                        .build();

        byte[] data = await(client, lingcat.protocol.Methods.Set_Sticker_Pack_Subscribed_Request,
                req.toByteArray(), timeoutMs).data;
        decode(Methods.Set_Sticker_Pack_Subscribed_Response.parser(), data);
    }

    public static void setStickerPackSubscribed(LingCatClient client, String accessToken,
                                                String packId, boolean subscribed)
            throws InterruptedException, ExecutionException, TimeoutException {
        setStickerPackSubscribed(client, accessToken, packId, subscribed, DEFAULT_TIMEOUT_MS);
    }

    public static void deleteStickerPack(LingCatClient client,
                                         String accessToken,
                                         String packId,
                                         long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Methods.Delete_Sticker_Pack_Request req =
                Methods.Delete_Sticker_Pack_Request.newBuilder()
                        .setAccessToken(accessToken)
                        .setPackId(packId)
                        .build();

        byte[] data = await(client, lingcat.protocol.Methods.Delete_Sticker_Pack_Request,
                req.toByteArray(), timeoutMs).data;
        decode(Methods.Delete_Sticker_Pack_Response.parser(), data);
    }

    public static void deleteStickerPack(LingCatClient client, String accessToken, String packId)
            throws InterruptedException, ExecutionException, TimeoutException {
        deleteStickerPack(client, accessToken, packId, DEFAULT_TIMEOUT_MS);
    }
}
