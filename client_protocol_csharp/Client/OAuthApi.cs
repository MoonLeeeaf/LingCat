using ProtoMethods = Lingcat.Methods;

namespace LingCat.ClientProtocol.Client;

/// <summary>OAuth2 / OIDC API，移植自 client_protocol/OAuthApi.ts。</summary>
public static class OAuthApi
{
    public sealed record ExchangeOAuthCodeOptions(string Ticket, int TimeoutMs = 20000);

    /// <summary>用 OIDC 一次性票据换取本地 access_token。</summary>
    public static async Task<string> ExchangeOAuthCodeAsync(
        LingCatClient client,
        ExchangeOAuthCodeOptions options)
    {
        var request = new ProtoMethods.Exchange_OAuth_Code_Request
        {
            Ticket = options.Ticket,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Exchange_OAuth_Code_Request,
            request,
            ProtoMethods.Exchange_OAuth_Code_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.AccessToken;
    }

    public sealed record GetOAuthBindingsOptions(string AccessToken, int TimeoutMs = 20000);

    /// <summary>查询我已绑定的 OAuth 提供方 id 列表。</summary>
    public static async Task<IReadOnlyList<string>> GetOAuthBindingsAsync(
        LingCatClient client,
        GetOAuthBindingsOptions options)
    {
        var request = new ProtoMethods.Get_OAuth_Bindings_Request
        {
            AccessToken = options.AccessToken,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_OAuth_Bindings_Request,
            request,
            ProtoMethods.Get_OAuth_Bindings_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Providers.ToArray();
    }

    public sealed record UnbindOAuthOptions(
        string AccessToken,
        string Provider,
        int TimeoutMs = 20000);

    /// <summary>解绑指定 OAuth 提供方。</summary>
    public static Task UnbindOAuthAsync(LingCatClient client, UnbindOAuthOptions options)
    {
        var request = new ProtoMethods.Unbind_OAuth_Request
        {
            AccessToken = options.AccessToken,
            Provider = options.Provider,
        };

        return client.InvokeAndDecodeAsync(
            Methods.Unbind_OAuth_Request,
            request,
            ProtoMethods.Unbind_OAuth_Response.Parser,
            options.TimeoutMs);
    }
}
