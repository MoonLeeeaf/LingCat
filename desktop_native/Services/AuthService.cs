using System.Net;
using System.Security.Cryptography;
using System.Text.Json;
using LingCat.ClientProtocol.Client;

namespace LingCat_Desktop.Services;

internal sealed record ServerConfig(string? PublicKey);

internal sealed class AuthSession : IAsyncDisposable
{
    public required StoredSession Stored { get; init; }
    public required User User { get; set; }
    public required LingCatClient Client { get; init; }
    public required string ConnectionSessionId { get; init; }

    public ValueTask DisposeAsync() => Client.DisposeAsync();
}

/// <summary>
/// 登录、注册与会话恢复。对应 useAuthFlow.tsx + UserMainLayout 的初始化流程。
/// </summary>
internal static class AuthService
{
    private static readonly HttpClient Http = new()
    {
        Timeout = TimeSpan.FromSeconds(15),
    };

    public static async Task<AuthSession> LoginAsync(
        string rawServer,
        string account,
        string password,
        CancellationToken cancellationToken = default)
    {
        var (server, publicKey) = await ResolveServerAsync(rawServer, cancellationToken).ConfigureAwait(false);
        var client = CreateClient(server, publicKey);

        try
        {
            await ConnectAsync(client, cancellationToken).ConfigureAwait(false);
            var token = await UserApi.LoginAsync(
                client,
                new UserApi.LoginOptions(account, password)).ConfigureAwait(false);

            return await CompleteLoginAsync(
                client, server, token, account, cancellationToken).ConfigureAwait(false);
        }
        catch
        {
            await client.DisposeAsync().ConfigureAwait(false);
            throw;
        }
    }

    public static async Task<AuthSession> RegisterAsync(
        string rawServer,
        string username,
        string nickname,
        string password,
        CancellationToken cancellationToken = default)
    {
        var (server, publicKey) = await ResolveServerAsync(rawServer, cancellationToken).ConfigureAwait(false);
        var client = CreateClient(server, publicKey);

        try
        {
            await ConnectAsync(client, cancellationToken).ConfigureAwait(false);

            var trimmedUsername = string.IsNullOrWhiteSpace(username) ? null : username.Trim();
            await UserApi.RegisterAsync(client, new UserApi.RegisterOptions(
                password,
                nickname.Trim(),
                trimmedUsername)).ConfigureAwait(false);

            var account = trimmedUsername ?? nickname.Trim();
            var token = await UserApi.LoginAsync(
                client,
                new UserApi.LoginOptions(account, password)).ConfigureAwait(false);

            return await CompleteLoginAsync(
                client, server, token, account, cancellationToken).ConfigureAwait(false);
        }
        catch
        {
            await client.DisposeAsync().ConfigureAwait(false);
            throw;
        }
    }

    public static async Task<AuthSession> RestoreAsync(
        StoredSession stored,
        CancellationToken cancellationToken = default)
    {
        var publicKeyHex = SessionStore.Instance.GetTrustedPublicKey(stored.Server)
            ?? throw new InvalidOperationException("本地没有该服务端的公钥记录，请重新登录");

        var client = CreateClient(stored.Server, Convert.FromHexString(publicKeyHex));
        try
        {
            await ConnectAsync(client, cancellationToken).ConfigureAwait(false);

            var connectionSessionId = NewConnectionSessionId();
            await UserApi.AuthorizeAsync(client, new UserApi.AuthorizeOptions(
                stored.Token,
                connectionSessionId)).ConfigureAwait(false);

            var me = await UserApi.QueryMyUserInfoAsync(client, new UserApi.QueryMyUserInfoOptions(
                stored.Token)).ConfigureAwait(false);

            stored.Account = me.Username ?? stored.Account;
            stored.Nickname = me.Nickname;
            SessionStore.Instance.TouchSession(stored);

            return new AuthSession
            {
                Stored = stored,
                User = me,
                Client = client,
                ConnectionSessionId = connectionSessionId,
            };
        }
        catch
        {
            await client.DisposeAsync().ConfigureAwait(false);
            throw;
        }
    }

    private static async Task<AuthSession> CompleteLoginAsync(
        LingCatClient client,
        string server,
        string token,
        string fallbackAccount,
        CancellationToken cancellationToken)
    {
        var connectionSessionId = NewConnectionSessionId();
        await UserApi.AuthorizeAsync(client, new UserApi.AuthorizeOptions(
            token,
            connectionSessionId)).ConfigureAwait(false);

        var me = await UserApi.QueryMyUserInfoAsync(client, new UserApi.QueryMyUserInfoOptions(
            token)).ConfigureAwait(false);

        var stored = new StoredSession
        {
            Key = $"{server}::{me.Id}",
            Server = server,
            UserId = me.Id,
            Account = me.Username ?? fallbackAccount,
            Nickname = me.Nickname,
            Token = token,
            LastUsedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
        };

        SessionStore.Instance.UpsertSession(stored);

        return new AuthSession
        {
            Stored = stored,
            User = me,
            Client = client,
            ConnectionSessionId = connectionSessionId,
        };
    }

    private static async Task<(string Server, byte[] PublicKey)> ResolveServerAsync(
        string rawServer,
        CancellationToken cancellationToken)
    {
        var server = ServerAddress.Normalize(rawServer);
        var config = await FetchConfigAsync(server, cancellationToken).ConfigureAwait(false);

        if (string.IsNullOrWhiteSpace(config.PublicKey))
        {
            throw new InvalidOperationException("服务端未返回公钥");
        }

        var publicKeyHex = config.PublicKey.Trim().ToLowerInvariant();
        _ = Convert.FromHexString(publicKeyHex);

        var known = SessionStore.Instance.GetTrustedPublicKey(server);
        if (known is null)
        {
            // 首次连接采用 TOFU：信任并保存服务端公钥。
            SessionStore.Instance.TrustServer(server, publicKeyHex);
        }
        else if (!string.Equals(known, publicKeyHex, StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "服务端公钥与本地记录不一致，已阻止连接。请确认服务端是否被替换。");
        }

        return (server, Convert.FromHexString(publicKeyHex));
    }

    private static async Task<ServerConfig> FetchConfigAsync(
        string server,
        CancellationToken cancellationToken)
    {
        var url = ServerAddress.ToHttpUrl(server).TrimEnd('/') + "/config.json";

        for (var attempt = 0; ; attempt++)
        {
            try
            {
                using var response = await Http.GetAsync(url, cancellationToken).ConfigureAwait(false);
                if (!response.IsSuccessStatusCode)
                {
                    if ((int)response.StatusCode < 500 || attempt >= 1)
                    {
                        throw new HttpRequestException(
                            $"config.json 返回 {(int)response.StatusCode}",
                            null,
                            response.StatusCode);
                    }
                }
                else
                {
                    var json = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
                    using var document = JsonDocument.Parse(json);
                    var publicKey = document.RootElement.TryGetProperty("public_key", out var key)
                        ? key.GetString()
                        : null;
                    return new ServerConfig(publicKey);
                }
            }
            catch (HttpRequestException) when (attempt == 0)
            {
                // 服务重启或代理连接复用竞态，稍后重试一次。
            }
            catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
            {
                throw new TimeoutException("连接服务端超时");
            }

            await Task.Delay(300, cancellationToken).ConfigureAwait(false);
        }
    }

    private static LingCatClient CreateClient(string server, byte[] publicKey)
    {
        return new LingCatClient(
            ServerAddress.ToWsUrl(server),
            ServerAddress.ToHttpUrl(server),
            publicKey);
    }

    private static async Task ConnectAsync(
        LingCatClient client,
        CancellationToken cancellationToken)
    {
        if (client.IsConnected) return;

        var completion = new TaskCompletionSource(
            TaskCreationOptions.RunContinuationsAsynchronously);

        void OnStateChanged()
        {
            if (client.IsConnected)
            {
                completion.TrySetResult();
            }
        }

        void OnHandshakeFailed(string reason)
        {
            completion.TrySetException(new IOException($"连接失败：{reason}"));
        }

        using var subscription = client.SubscribeConnectionState(OnStateChanged);
        client.HandshakeFailed += OnHandshakeFailed;

        try
        {
            client.Init();

            using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeout.CancelAfter(TimeSpan.FromSeconds(15));
            await completion.Task.WaitAsync(timeout.Token).ConfigureAwait(false);
        }
        finally
        {
            client.HandshakeFailed -= OnHandshakeFailed;
        }
    }

    private static string NewConnectionSessionId()
    {
        return "desktop-" + Convert.ToHexString(RandomNumberGenerator.GetBytes(4)).ToLowerInvariant();
    }
}
