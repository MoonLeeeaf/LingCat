using Aprillz.MewUI;
using LingCat.ClientProtocol.Client;

namespace LingCat_Desktop.Services;

internal static class AvatarUpload
{
    public static async Task<User> UpdateAsync(AuthSession auth, string path)
    {
        const int maxBytes = 5 * 1024 * 1024;
        await using var stream = File.OpenRead(path);
        if (stream.Length is <= 0 or > maxBytes)
            throw new InvalidDataException("请选择不超过 5 MB 的图片。");
        var bytes = new byte[(int)stream.Length];
        await stream.ReadExactlyAsync(bytes).ConfigureAwait(false);

        string mime = bytes.AsSpan().StartsWith(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }) ? "image/png"
            : bytes.AsSpan().StartsWith(new byte[] { 255, 216, 255 }) ? "image/jpeg"
            : throw new InvalidDataException("仅支持 PNG 和 JPEG 图片。");
        using var image = ImageSource.FromBytes(bytes);
        int width = image.PixelWidth, height = image.PixelHeight;
        if (width is <= 0 or > 4096 || height is <= 0 or > 4096)
            throw new InvalidDataException("图片无法读取，或宽高超过 4096 像素。");
        image.CopyPixels(new byte[width * height * 4], width * 4);

        var token = auth.Stored.Token;
        var uploadToken = await FileApi.RequestUploadFileTokenAsync(auth.Client, new(token)).ConfigureAwait(false);
        var hash = await FileApi.UploadFileAsync(auth.Client,
            new(uploadToken, bytes, Mime: mime, FileName: mime == "image/png" ? "avatar.png" : "avatar.jpg")).ConfigureAwait(false);
        await UserApi.UpdateMyProfileAsync(auth.Client, new(token, AvatarFileHash: hash)).ConfigureAwait(false);
        return auth.User with { AvatarFileHash = hash };
    }
}
