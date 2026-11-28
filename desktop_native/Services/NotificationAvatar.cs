using SkiaSharp;

namespace LingCat_Desktop.Services;

internal sealed class NotificationAvatar : IDisposable
{
    private readonly Dictionary<(string Server, string UserId, string Hash), string> _files = new();
    private DirectoryInfo? _directory;

    public async Task<string?> GetPathAsync(AuthSession auth, string hash, CancellationToken token)
    {
        var key = (auth.Stored.Server, auth.User.Id, hash);
        if (_files.TryGetValue(key, out var path) && File.Exists(path)) return path;
        var bytes = await ImageCache.GetAsync(auth, hash).WaitAsync(TimeSpan.FromSeconds(2), token).ConfigureAwait(false);
        var png = await Task.Run(() => EncodeThumbnail(bytes), token).ConfigureAwait(false);
        if (png is null) return null;

        // Keep the PNG available while the OS may still be displaying the notification.
        _directory ??= Directory.CreateTempSubdirectory("LingCat-notifications-");
        path = Path.Combine(_directory.FullName, $"{Guid.NewGuid():N}.png");
        await File.WriteAllBytesAsync(path, png, token).ConfigureAwait(false);
        _files[key] = path;
        return path;
    }

    internal static byte[]? EncodeThumbnail(byte[] bytes)
    {
        using var data = SKData.CreateCopy(bytes);
        using var codec = SKCodec.Create(data);
        if (codec is null) return null;
        var info = codec.Info;
        if (info.Width is <= 0 or > 32768 || info.Height is <= 0 or > 32768 ||
            (long)info.Width * info.Height > 64L * 1024 * 1024) return null;

        // Skia also accepts interlaced PNGs that MewUI's built-in PNG decoder does not.
        using var source = SKBitmap.Decode(codec);
        if (source is null) return null;
        double scale = Math.Min(1, 128d / Math.Max(info.Width, info.Height));
        using var thumbnail = source.Resize(source.Info.WithSize(Math.Max(1, (int)(info.Width * scale)),
            Math.Max(1, (int)(info.Height * scale))), new SKSamplingOptions(SKFilterMode.Linear));
        using var png = thumbnail?.Encode(SKEncodedImageFormat.Png, 100);
        return png?.ToArray();
    }

    public void Dispose()
    {
        _files.Clear();
        try { _directory?.Delete(recursive: true); }
        catch (Exception ex) when (ex is IOException or UnauthorizedAccessException) { }
    }
}
