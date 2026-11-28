using LingCat.ClientProtocol.Client;

namespace LingCat_Desktop.Services;

internal static class AvatarUpload
{
    private static readonly Dictionary<string, string> ImageTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        [".png"] = "image/png", [".jpg"] = "image/jpeg", [".jpeg"] = "image/jpeg",
        [".gif"] = "image/gif", [".webp"] = "image/webp", [".bmp"] = "image/bmp",
        [".avif"] = "image/avif", [".tif"] = "image/tiff", [".tiff"] = "image/tiff",
        [".ico"] = "image/vnd.microsoft.icon", [".heic"] = "image/heic", [".heif"] = "image/heif",
    };

    public static string[] FilePatterns => ImageTypes.Keys.Select(extension => "*" + extension).ToArray();

    public static async Task<User> UpdateAsync(AuthSession auth, string path)
    {
        if (!ImageTypes.TryGetValue(Path.GetExtension(path), out var mime))
            throw new InvalidDataException("请选择图片文件。");
        await using var stream = File.OpenRead(path);
        if (stream.Length == 0) throw new InvalidDataException("图片文件为空。");

        var token = auth.Stored.Token;
        var uploadToken = await FileApi.RequestUploadFileTokenAsync(auth.Client, new(token)).ConfigureAwait(false);
        var hash = await FileApi.UploadFileAsync(auth.Client, uploadToken, stream, mime, Path.GetFileName(path)).ConfigureAwait(false);
        await UserApi.UpdateMyProfileAsync(auth.Client, new(token, AvatarFileHash: hash)).ConfigureAwait(false);
        return auth.User with { AvatarFileHash = hash };
    }
}
