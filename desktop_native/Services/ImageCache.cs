using System.Security.Cryptography;
using System.Text;
using LingCat.ClientProtocol.Client;

namespace LingCat_Desktop.Services;

internal static class ImageCache
{
    private const long MaxCacheBytes = 256L * 1024 * 1024;
    private const int MaxEntryBytes = 32 * 1024 * 1024;
    private static readonly HttpClient Http = new() { Timeout = TimeSpan.FromSeconds(15) };
    private static readonly SemaphoreSlim WriteLock = new(1);

    public static Task<byte[]> GetAsync(AuthSession auth, string hash) =>
        GetOrFetchAsync(auth.Stored.Server, auth.User.Id, hash, async () =>
        {
            var token = await FileApi.RequestAccessUploadFileTokenAsync(auth.Client, new(auth.Stored.Token)).ConfigureAwait(false);
            return await Http.GetByteArrayAsync(auth.Client.GetFileUrlByHashAndToken(hash, Uri.EscapeDataString(token))).ConfigureAwait(false);
        });

    internal static async Task<byte[]> GetOrFetchAsync(string server, string userId, string hash, Func<Task<byte[]>> fetch)
    {
        if (hash.Length != 64 || !hash.All(Uri.IsHexDigit)) throw new InvalidDataException("无效的图片文件哈希。");
        var scope = Convert.ToHexStringLower(SHA256.HashData(Encoding.UTF8.GetBytes(server + "\n" + userId)));
        var directory = AppPaths.ImageCacheDirectory;
        var path = Path.Combine(directory, $"{scope}-{hash.ToLowerInvariant()}.image");

        try
        {
            var file = new FileInfo(path);
            if (file.Exists && file.Length is > 0 and <= MaxEntryBytes)
            {
                var cached = await File.ReadAllBytesAsync(path).ConfigureAwait(false);
                if (MatchesHash(cached, hash))
                {
                    try { File.SetLastWriteTimeUtc(path, DateTime.UtcNow); }
                    catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { }
                    return cached;
                }
            }
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { }

        var bytes = await fetch().ConfigureAwait(false);
        if (!MatchesHash(bytes, hash)) throw new InvalidDataException("图片内容与文件哈希不一致。");
        if (bytes.Length is > 0 and <= MaxEntryBytes)
            await SaveAsync(directory, path, bytes).ConfigureAwait(false);
        return bytes;
    }

    private static bool MatchesHash(byte[] bytes, string hash) =>
        Convert.ToHexString(SHA256.HashData(bytes)).Equals(hash, StringComparison.OrdinalIgnoreCase);

    private static async Task SaveAsync(string directory, string path, byte[] bytes)
    {
        await WriteLock.WaitAsync().ConfigureAwait(false);
        var temp = path + "." + Guid.NewGuid().ToString("N") + ".tmp";
        try
        {
            Directory.CreateDirectory(directory);
            await File.WriteAllBytesAsync(temp, bytes).ConfigureAwait(false);
            File.Move(temp, path, overwrite: true);

            // Cache hits touch the timestamp so recently used files are kept first.
            var files = new DirectoryInfo(directory).GetFiles("*.image")
                .OrderByDescending(file => file.LastWriteTimeUtc);
            long remaining = MaxCacheBytes;
            foreach (var file in files)
            {
                if (file.Length <= remaining) remaining -= file.Length;
                else file.Delete();
            }
        }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { }
        finally
        {
            try { File.Delete(temp); }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { }
            finally { WriteLock.Release(); }
        }
    }
}
