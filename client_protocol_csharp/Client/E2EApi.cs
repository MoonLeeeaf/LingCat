using ProtoMethods = Lingcat.Methods;

namespace LingCat.ClientProtocol.Client;

/// <summary>端到端加密密钥 API，移植自 client_protocol/E2EApi.ts。</summary>
public static class E2EApi
{
    public sealed record UploadKeyOptions(
        string AccessToken,
        string PublicKey,
        string EncryptedPrivateKey,
        string KdfSalt,
        string KdfParams,
        string PrivNonce,
        int KeyVersion,
        int TimeoutMs = 20000);

    /// <summary>上传/更新端到端加密密钥包。</summary>
    public static Task UploadKeyAsync(LingCatClient client, UploadKeyOptions options)
    {
        var request = new ProtoMethods.Upload_E2E_Key_Request
        {
            AccessToken = options.AccessToken,
            PublicKey = options.PublicKey,
            EncryptedPrivateKey = options.EncryptedPrivateKey,
            KdfSalt = options.KdfSalt,
            KdfParams = options.KdfParams,
            PrivNonce = options.PrivNonce,
            KeyVersion = options.KeyVersion,
        };

        return client.InvokeAndDecodeAsync(
            Methods.Upload_E2E_Key_Request,
            request,
            ProtoMethods.Upload_E2E_Key_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record GetMyKeyOptions(
        string AccessToken,
        int? KeyVersion = null,
        int TimeoutMs = 20000);

    /// <summary>获取自己的加密私钥包；服务端没有密钥时返回 null。</summary>
    public static async Task<UserE2EKey?> GetMyKeyAsync(
        LingCatClient client,
        GetMyKeyOptions options)
    {
        try
        {
            var request = new ProtoMethods.Get_My_E2E_Key_Request
            {
                AccessToken = options.AccessToken,
            };

            if (options.KeyVersion is > 0) request.KeyVersion = options.KeyVersion.Value;

            var response = await client.InvokeAndDecodeAsync(
                Methods.Get_My_E2E_Key_Request,
                request,
                ProtoMethods.Get_My_E2E_Key_Response.Parser,
                options.TimeoutMs).ConfigureAwait(false);

            return response.Key is null ? null : ProtoMapping.ToUserE2EKey(response.Key);
        }
        catch
        {
            // 与 TS 版一致：服务端返回错误（如密钥不存在）时视为 null。
            return null;
        }
    }

    public sealed record GetPublicKeysOptions(
        string AccessToken,
        IReadOnlyList<string> UserIds,
        int TimeoutMs = 20000);

    /// <summary>批量拉取其他用户的公钥。</summary>
    public static async Task<IReadOnlyList<E2EPublicKey>> GetPublicKeysAsync(
        LingCatClient client,
        GetPublicKeysOptions options)
    {
        var request = new ProtoMethods.Get_E2E_Public_Keys_Request
        {
            AccessToken = options.AccessToken,
        };
        request.UserIds.AddRange(options.UserIds);

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_E2E_Public_Keys_Request,
            request,
            ProtoMethods.Get_E2E_Public_Keys_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Keys
            .Select(k => new E2EPublicKey { UserId = k.UserId, PublicKey = k.PublicKey })
            .ToArray();
    }

    public sealed record GetAllMyKeysOptions(string AccessToken, int TimeoutMs = 20000);

    /// <summary>获取自己的所有历史密钥包。</summary>
    public static async Task<IReadOnlyList<UserE2EKey>> GetAllMyKeysAsync(
        LingCatClient client,
        GetAllMyKeysOptions options)
    {
        var request = new ProtoMethods.Get_All_My_E2E_Keys_Request
        {
            AccessToken = options.AccessToken,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_All_My_E2E_Keys_Request,
            request,
            ProtoMethods.Get_All_My_E2E_Keys_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Keys.Select(ProtoMapping.ToUserE2EKey).ToArray();
    }
}
