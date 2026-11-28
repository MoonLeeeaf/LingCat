using System.Security.Cryptography;
using LingCat.ClientProtocol.Client;

namespace LingCat_Desktop.Services;

internal static class AttachmentDownload
{
    private static readonly HttpClient Http = new();

    public static async Task SaveAsync(AuthSession auth, string hash, string destination)
    {
        if (hash.Length != 64 || !hash.All(Uri.IsHexDigit)) throw new InvalidDataException("附件哈希无效。");
        using var timeout = new CancellationTokenSource(TimeSpan.FromMinutes(10));
        var ct = timeout.Token;
        var token = await FileApi.RequestAccessUploadFileTokenAsync(auth.Client, new(auth.Stored.Token)).ConfigureAwait(false);
        var url = auth.Client.GetFileUrlByHashAndToken(hash, Uri.EscapeDataString(token));
        using var response = await Http.GetAsync(url, HttpCompletionOption.ResponseHeadersRead, ct).ConfigureAwait(false);
        response.EnsureSuccessStatusCode();
        await using var input = await response.Content.ReadAsStreamAsync(ct).ConfigureAwait(false);
        await SaveVerifiedAsync(input, hash, destination, ct).ConfigureAwait(false);
    }

    internal static async Task SaveVerifiedAsync(Stream input, string hash, string destination, CancellationToken ct)
    {
        var directory = Path.GetDirectoryName(Path.GetFullPath(destination))!;
        var temporary = Path.Combine(directory, $".lingcat-{Guid.NewGuid():N}.part");
        try
        {
            using var checksum = IncrementalHash.CreateHash(HashAlgorithmName.SHA256);
            await using (var output = new FileStream(temporary, FileMode.CreateNew, FileAccess.Write, FileShare.None, 81920, useAsync: true))
            {
                var buffer = new byte[81920];
                int read;
                while ((read = await input.ReadAsync(buffer, ct).ConfigureAwait(false)) > 0)
                {
                    checksum.AppendData(buffer.AsSpan(0, read));
                    await output.WriteAsync(buffer.AsMemory(0, read), ct).ConfigureAwait(false);
                }
            }
            if (!Convert.ToHexString(checksum.GetHashAndReset()).Equals(hash, StringComparison.OrdinalIgnoreCase))
                throw new InvalidDataException("下载的附件内容与哈希不一致。");
            ct.ThrowIfCancellationRequested();
            File.Move(temporary, destination, overwrite: true);
        }
        finally
        {
            try { File.Delete(temporary); }
            catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { }
        }
    }
}
