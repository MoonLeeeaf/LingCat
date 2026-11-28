using System.Reflection;
using System.Runtime.CompilerServices;
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
    private static readonly ConditionalWeakTable<LingCatClient, AvatarCache> Caches = new();

    private readonly double _size;
    private IImageSource _source = DefaultSource.Value;

    public UserAvatar(User user, LingCatClient client, string accessToken, double size)
        : this(user.AvatarFileHash, client, accessToken, size)
    {
        Root.ToolTip($"{user.Nickname} · {user.Username ?? user.Id}");
    }

    public UserAvatar(string? hash, LingCatClient client, string accessToken, double size, string? lookupUserId = null)
    {
        _size = size;

        Root = new Border()
            .Width(size)
            .Height(size)
            .CornerRadius(size / 2)
            .ClipToBounds(true)
            .Background(UiTheme.SurfaceActive)
            .Cursor(CursorType.Hand)
            .Child(CreateImage(_source));

        if (!string.IsNullOrWhiteSpace(hash) || !string.IsNullOrWhiteSpace(lookupUserId))
        {
            _ = LoadAvatarAsync(hash, lookupUserId, client, accessToken);
        }
    }

    public Border Root { get; }

    public void ShowPreview(Window owner)
    {
        var window = new Window
        {
            Title = "头像", StartupLocation = WindowStartupLocation.CenterOwner, Padding = Thickness.Zero,
            Content = new Image().Source(_source).StretchMode(Stretch.Uniform),
        };
        window.Resizable(480, 480, 240, 240, 900, 900);
        window.PreviewKeyDown += e => { if (e.Key == Key.Escape) { e.Handled = true; window.Close(); } };
        window.ShowDialog(owner);
    }

    private async Task LoadAvatarAsync(string? hash, string? lookupUserId, LingCatClient client, string accessToken)
    {
        try
        {
            var cache = Caches.GetValue(client, _ => new AvatarCache());
            if (string.IsNullOrWhiteSpace(hash) && !string.IsNullOrWhiteSpace(lookupUserId))
                hash = await cache.Profiles.Get(lookupUserId, async () =>
                    (await UserApi.QueryUserInfoAsync(client, new(accessToken, lookupUserId)).ConfigureAwait(false)).AvatarFileHash).ConfigureAwait(false);
            if (string.IsNullOrWhiteSpace(hash)) return;
            var avatarHash = hash;
            var source = await cache.Images.Get(avatarHash, async () =>
            {
                var fileToken = await FileApi.RequestAccessUploadFileTokenAsync(client, new(accessToken)).ConfigureAwait(false);
                var url = client.GetFileUrlByHashAndToken(avatarHash, fileToken);
                return ImageSource.FromBytes(await Http.GetByteArrayAsync(url).ConfigureAwait(false));
            }).ConfigureAwait(false);

            UiThread.Post(() =>
            {
                _source = source;
                Root.Child = CreateImage(source);
            });
        }
        catch
        {
            // 头像加载失败时保留默认头像。
        }
    }

    private sealed class AvatarCache
    {
        public readonly RecentRequests<string?> Profiles = new();
        public readonly RecentRequests<ImageSource> Images = new();
    }

    private sealed class RecentRequests<T>
    {
        private readonly Dictionary<string, (DateTimeOffset Expires, Task<T> Request)> _entries = new();

        public Task<T> Get(string key, Func<Task<T>> load)
        {
            lock (_entries)
            {
                var now = DateTimeOffset.UtcNow;
                if (_entries.TryGetValue(key, out var entry) && entry.Expires > now && !entry.Request.IsFaulted && !entry.Request.IsCanceled)
                    return entry.Request;
                if (_entries.Count >= 128 && !_entries.ContainsKey(key))
                    _entries.Remove(_entries.MinBy(item => item.Value.Expires).Key);
                var request = load();
                _entries[key] = (now.AddMinutes(5), request);
                return request;
            }
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
