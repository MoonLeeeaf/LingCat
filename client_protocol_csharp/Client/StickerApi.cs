using ProtoClasses = Lingcat.Classes;
using ProtoMethods = Lingcat.Methods;

namespace LingCat.ClientProtocol.Client;

/// <summary>写入贴纸包内容的输入项；mime 与 sort 由服务端决定。</summary>
public sealed record StickerInput(string Hash, string? Emoji = null);

/// <summary>贴纸包及其贴纸。</summary>
public sealed record StickerPackDetail(StickerPack Pack, IReadOnlyList<Sticker> Stickers);

/// <summary>贴纸包 API，移植自 client_protocol/StickerApi.ts。</summary>
public static class StickerApi
{
    public sealed record GetMyStickerPacksOptions(string AccessToken, int TimeoutMs = 20000);

    /// <summary>我订阅的全部贴纸包及其贴纸。</summary>
    public static async Task<IReadOnlyList<StickerPackDetail>> GetMyStickerPacksAsync(
        LingCatClient client,
        GetMyStickerPacksOptions options)
    {
        var request = new ProtoMethods.Get_My_Sticker_Packs_Request
        {
            AccessToken = options.AccessToken,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_My_Sticker_Packs_Request,
            request,
            ProtoMethods.Get_My_Sticker_Packs_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        var byPack = new Dictionary<string, List<Sticker>>();
        foreach (var proto in response.Stickers)
        {
            var sticker = ProtoMapping.ToSticker(proto);
            if (!byPack.TryGetValue(sticker.PackId, out var list))
            {
                list = new List<Sticker>();
                byPack[sticker.PackId] = list;
            }

            list.Add(sticker);
        }

        return response.Packs.Select(proto =>
        {
            var pack = ProtoMapping.ToStickerPack(proto);
            return new StickerPackDetail(
                pack,
                byPack.TryGetValue(pack.Id, out var stickers)
                    ? stickers
                    : Array.Empty<Sticker>());
        }).ToArray();
    }

    public sealed record QueryStickerPackOptions(
        string AccessToken,
        string PackId,
        int TimeoutMs = 20000);

    /// <summary>查询单个贴纸包（点击消息里的贴纸时使用）。</summary>
    public static async Task<StickerPackDetail> QueryStickerPackAsync(
        LingCatClient client,
        QueryStickerPackOptions options)
    {
        var request = new ProtoMethods.Query_Sticker_Pack_Request
        {
            AccessToken = options.AccessToken,
            PackId = options.PackId,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Query_Sticker_Pack_Request,
            request,
            ProtoMethods.Query_Sticker_Pack_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return new StickerPackDetail(
            ProtoMapping.ToStickerPack(response.Pack ?? new ProtoClasses.IStickerPack()),
            response.Stickers.Select(ProtoMapping.ToSticker).ToArray());
    }

    public sealed record CreateStickerPackOptions(
        string AccessToken,
        string Title,
        int TimeoutMs = 20000);

    /// <summary>创建贴纸包。</summary>
    public static async Task<StickerPack> CreateStickerPackAsync(
        LingCatClient client,
        CreateStickerPackOptions options)
    {
        var request = new ProtoMethods.Create_Sticker_Pack_Request
        {
            AccessToken = options.AccessToken,
            Title = options.Title,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Create_Sticker_Pack_Request,
            request,
            ProtoMethods.Create_Sticker_Pack_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return ProtoMapping.ToStickerPack(response.Pack ?? new ProtoClasses.IStickerPack());
    }

    public sealed record UpdateStickerPackTitleOptions(
        string AccessToken,
        string PackId,
        string Title,
        int TimeoutMs = 20000);

    /// <summary>修改贴纸包标题（仅作者）。</summary>
    public static Task UpdateStickerPackTitleAsync(
        LingCatClient client,
        UpdateStickerPackTitleOptions options)
    {
        var request = new ProtoMethods.Update_Sticker_Pack_Title_Request
        {
            AccessToken = options.AccessToken,
            PackId = options.PackId,
            Title = options.Title,
        };

        return client.InvokeAndDecodeAsync(
            Methods.Update_Sticker_Pack_Title_Request,
            request,
            ProtoMethods.Update_Sticker_Pack_Title_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record SetStickerPackContentOptions(
        string AccessToken,
        string PackId,
        IReadOnlyList<StickerInput> Stickers,
        string? CoverFileHash = null,
        int TimeoutMs = 20000);

    /// <summary>覆盖式写入包内容；数组顺序即展示顺序。</summary>
    public static Task SetStickerPackContentAsync(
        LingCatClient client,
        SetStickerPackContentOptions options)
    {
        var request = new ProtoMethods.Set_Sticker_Pack_Content_Request
        {
            AccessToken = options.AccessToken,
            PackId = options.PackId,
        };

        foreach (var sticker in options.Stickers)
        {
            var proto = new ProtoMethods.StickerInput { Hash = sticker.Hash };
            if (sticker.Emoji is not null) proto.Emoji = sticker.Emoji;
            request.Stickers.Add(proto);
        }

        if (options.CoverFileHash is not null) request.CoverFileHash = options.CoverFileHash;

        return client.InvokeAndDecodeAsync(
            Methods.Set_Sticker_Pack_Content_Request,
            request,
            ProtoMethods.Set_Sticker_Pack_Content_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record SetStickerPackSubscribedOptions(
        string AccessToken,
        string PackId,
        bool Subscribed,
        int TimeoutMs = 20000);

    /// <summary>订阅/取消订阅贴纸包。</summary>
    public static Task SetStickerPackSubscribedAsync(
        LingCatClient client,
        SetStickerPackSubscribedOptions options)
    {
        var request = new ProtoMethods.Set_Sticker_Pack_Subscribed_Request
        {
            AccessToken = options.AccessToken,
            PackId = options.PackId,
            Subscribed = options.Subscribed,
        };

        return client.InvokeAndDecodeAsync(
            Methods.Set_Sticker_Pack_Subscribed_Request,
            request,
            ProtoMethods.Set_Sticker_Pack_Subscribed_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record DeleteStickerPackOptions(
        string AccessToken,
        string PackId,
        int TimeoutMs = 20000);

    /// <summary>删除贴纸包（仅作者）。</summary>
    public static Task DeleteStickerPackAsync(
        LingCatClient client,
        DeleteStickerPackOptions options)
    {
        var request = new ProtoMethods.Delete_Sticker_Pack_Request
        {
            AccessToken = options.AccessToken,
            PackId = options.PackId,
        };

        return client.InvokeAndDecodeAsync(
            Methods.Delete_Sticker_Pack_Request,
            request,
            ProtoMethods.Delete_Sticker_Pack_Response.Parser,
            options.TimeoutMs);
    }
}
