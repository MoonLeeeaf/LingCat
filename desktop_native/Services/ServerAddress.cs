using System.Text.RegularExpressions;

namespace LingCat_Desktop.Services;

/// <summary>
/// 服务端地址规范化，移植自 client/lib/serverAddress.ts。
/// </summary>
internal static partial class ServerAddress
{
    public static string Normalize(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw))
        {
            throw new ArgumentException("请填写服务端地址");
        }

        var value = raw.Trim();
        if (!SchemeRegex().IsMatch(value))
        {
            value = "https://" + value;
        }

        if (!Uri.TryCreate(value, UriKind.Absolute, out var uri))
        {
            throw new ArgumentException($"无效的服务端地址：{raw}");
        }

        var scheme = uri.Scheme.ToLowerInvariant();
        var secure = scheme is "https" or "wss";
        var insecure = scheme is "http" or "ws";
        if (!secure && !insecure)
        {
            throw new ArgumentException($"不支持的协议：{uri.Scheme}");
        }

        var hostname = uri.Host.TrimEnd('.');
        if (string.IsNullOrEmpty(hostname))
        {
            throw new ArgumentException("服务端地址缺少主机名");
        }

        var port = uri.IsDefaultPort ? secure ? 443 : 80 : uri.Port;
        var path = uri.AbsolutePath.TrimEnd('/');
        if (path == "/") path = string.Empty;

        return $"{hostname}:{port}{path}";
    }

    public static bool IsSecure(string address) => GetPort(address) == 443;

    public static string ToHttpUrl(string address)
    {
        return $"{(IsSecure(address) ? "https" : "http")}://{address}";
    }

    public static string ToWsUrl(string address)
    {
        return $"{(IsSecure(address) ? "wss" : "ws")}://{address}";
    }

    private static int? GetPort(string address)
    {
        var hostPart = address.Split('/')[0];
        var match = PortRegex().Match(hostPart);
        return match.Success ? int.Parse(match.Groups[1].Value) : null;
    }

    [GeneratedRegex("^[a-z][a-z0-9+.-]*://", RegexOptions.IgnoreCase)]
    private static partial Regex SchemeRegex();

    [GeneratedRegex(":(\\d+)$")]
    private static partial Regex PortRegex();
}
