using System.Reflection;
using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using LingCat.ClientProtocol.Client;

namespace LingCat_Desktop.Ui.Components;

/// <summary>
/// 用户圆形头像。优先加载用户设置的远程头像，失败时回退到 Assets/default_avatar.png。
/// </summary>
internal sealed class UserAvatar
{
    private static readonly Assembly Assembly = typeof(UserAvatar).Assembly;
    private static readonly HttpClient Http = new()
    {
        Timeout = TimeSpan.FromSeconds(15),
    };

    private static readonly Lazy<ImageSource> DefaultSource = new(() =>
        ImageSource.FromResource(Assembly, "LingCat_Desktop.Assets.default_avatar.png"));

    private readonly double _size;

    public UserAvatar(User user, LingCatClient client, string accessToken, double size)
    {
        _size = size;

        Root = new Border()
            .Width(size)
            .Height(size)
            .CornerRadius(size / 2)
            .ClipToBounds(true)
            .Background(UiTheme.SurfaceActive)
            .Cursor(CursorType.Hand)
            .ToolTip($"{user.Nickname} · {user.Username ?? user.Id}")
            .Child(CreateImage(DefaultSource.Value));

        if (!string.IsNullOrWhiteSpace(user.AvatarFileHash))
        {
            _ = LoadAvatarAsync(user.AvatarFileHash, client, accessToken);
        }
    }

    public Border Root { get; }

    private async Task LoadAvatarAsync(string hash, LingCatClient client, string accessToken)
    {
        try
        {
            var fileToken = await FileApi.RequestAccessUploadFileTokenAsync(
                client,
                new FileApi.RequestAccessUploadFileTokenOptions(accessToken)).ConfigureAwait(false);

            var url = client.GetFileUrlByHashAndToken(hash, fileToken);
            var bytes = await Http.GetByteArrayAsync(url).ConfigureAwait(false);
            var source = ImageSource.FromBytes(bytes);

            UiThread.Post(() => Root.Child = CreateImage(source));
        }
        catch
        {
            // 头像加载失败时保留默认头像。
        }
    }

    private Image CreateImage(IImageSource source)
    {
        return new Image()
            .Source(source)
            .Width(_size)
            .Height(_size)
            .StretchMode(Stretch.UniformToFill)
            .HorizontalAlignment(HorizontalAlignment.Center)
            .VerticalAlignment(VerticalAlignment.Center);
    }
}
