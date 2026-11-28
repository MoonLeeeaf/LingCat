using System.Text.Json;

namespace LingCat_Desktop.Services;

internal sealed class StoredSession
{
    public string Key { get; set; } = string.Empty;
    public string Server { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string Account { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public long LastUsedAt { get; set; }
}

internal sealed class StoreData
{
    public int Version { get; set; } = 1;
    public string? ActiveSessionKey { get; set; }
    public Dictionary<string, StoredSession> Sessions { get; set; } = new();
    public Dictionary<string, string> ServerPublicKeys { get; set; } = new();
}

/// <summary>
/// 本地会话与受信任服务端公钥的持久化存储，对应 TS 端的 ClientStorage / ClientManager 子集。
/// </summary>
internal sealed class SessionStore
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNameCaseInsensitive = true,
    };

    private readonly object _lock = new();
    private StoreData _data;

    private SessionStore()
    {
        _data = Load();
    }

    public static SessionStore Instance { get; } = new();

    public string? GetTrustedPublicKey(string server)
    {
        lock (_lock)
        {
            return _data.ServerPublicKeys.TryGetValue(server, out var key) ? key : null;
        }
    }

    public void TrustServer(string server, string publicKeyHex)
    {
        lock (_lock)
        {
            _data.ServerPublicKeys[server] = publicKeyHex.ToLowerInvariant();
            Save();
        }
    }

    public StoredSession? GetActiveSession()
    {
        lock (_lock)
        {
            return _data.ActiveSessionKey is not null
                && _data.Sessions.TryGetValue(_data.ActiveSessionKey, out var active) ? active : null;
        }
    }

    public IReadOnlyList<StoredSession> ListSessions()
    {
        lock (_lock)
        {
            return _data.Sessions.Values
                .OrderByDescending(session => session.LastUsedAt)
                .ToList();
        }
    }

    public StoredSession? GetSession(string key)
    {
        lock (_lock)
        {
            return _data.Sessions.TryGetValue(key, out var session) ? session : null;
        }
    }

    public void UpsertSession(StoredSession session)
    {
        lock (_lock)
        {
            _data.Sessions[session.Key] = session;
            _data.ActiveSessionKey = session.Key;
            Save();
        }
    }

    public void TouchSession(StoredSession session)
    {
        lock (_lock)
        {
            session.LastUsedAt = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            _data.Sessions[session.Key] = session;
            _data.ActiveSessionKey = session.Key;
            Save();
        }
    }

    public void RemoveSession(string key)
    {
        lock (_lock)
        {
            _data.Sessions.Remove(key);
            if (_data.ActiveSessionKey == key)
            {
                _data.ActiveSessionKey = null;
            }

            Save();
        }
    }

    public string? GetLastServer()
    {
        lock (_lock)
        {
            return _data.Sessions.Values
                .OrderByDescending(session => session.LastUsedAt)
                .Select(session => session.Server)
                .FirstOrDefault();
        }
    }

    private static string FilePath => AppPaths.StoreFilePath;

    private static StoreData Load()
    {
        try
        {
            if (!File.Exists(FilePath)) return new StoreData();

            var json = File.ReadAllText(FilePath);
            return JsonSerializer.Deserialize<StoreData>(json, JsonOptions) ?? new StoreData();
        }
        catch
        {
            return new StoreData();
        }
    }

    private void Save()
    {
        try
        {
            var directory = Path.GetDirectoryName(FilePath);
            if (!string.IsNullOrEmpty(directory))
            {
                Directory.CreateDirectory(directory);
            }

            File.WriteAllText(FilePath, JsonSerializer.Serialize(_data, JsonOptions));
        }
        catch
        {
            // 本地存储失败不应阻断登录流程。
        }
    }
}
