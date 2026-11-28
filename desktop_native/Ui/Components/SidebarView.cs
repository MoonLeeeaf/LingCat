using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Resources;
using LingCat_Desktop.Services;
using MewUI.Material.Controls;
using MaterialIconButton = MewUI.Material.Controls.IconButton;

namespace LingCat_Desktop.Ui.Components;

/// <summary>
/// 最左侧图标导航栏。对应 UserMainLayout 里的 navigation rail：
/// 顶部账号入口、中部一级导航、底部设置入口。
/// </summary>
internal sealed class SidebarView
{
    private sealed record NavEntry(MaterialIconButton Item, SimpleSvgSource Icon);

    private readonly Dictionary<ChatListScope, NavEntry> _navItems = new();
    private readonly MaterialIconButton _accountButton;
    private SimpleSvgSource? _settingsIcon;
    private ChatListScope _scope = ChatListScope.All;

    public SidebarView(AuthSession auth)
    {
        _accountButton = BuildBrand(auth);
        Root = new MaterialSurface
        {
            Variant = MaterialSurfaceVariant.Navigation,
            Padding = new Thickness(10, 14, 10, 12),
            Content = new Grid()
                .Rows("Auto,Auto,*,Auto")
                .Children(
                     _accountButton.GridPosition(0, 0),
                    BuildNavigation().GridPosition(1, 0),
                     BuildFooter().GridPosition(3, 0)),
        };

        UpdateNavVisuals();
    }

    public MaterialSurface Root { get; }

    public event Action<ChatListScope>? ScopeChanged;

    public event Action? SettingsRequested;

    public event Action? AccountRequested;

    public ChatListScope Scope => _scope;

    public void FocusAccountButton() => _accountButton.Focus();

    public void SetScope(ChatListScope scope)
    {
        if (_scope == scope) return;

        _scope = scope;
        UpdateNavVisuals();
        ScopeChanged?.Invoke(scope);
    }

    public void ApplyTheme()
    {
        UpdateNavVisuals();
        if (_settingsIcon is not null) _settingsIcon.Tint = UiTheme.TextSecondary;
    }

    private MaterialIconButton BuildBrand(AuthSession auth)
    {
        var avatar = new UserAvatar(auth.User, auth.Client, auth.Stored.Token, 44);
        var button = CreateRoundButton(avatar.Root, $"账号：{auth.User.Nickname}").HorizontalAlignment(HorizontalAlignment.Center);
        button.Click += () => AccountRequested?.Invoke();
        return button;
    }

    private StackPanel BuildNavigation()
    {
        return new StackPanel()
            .Spacing(10)
            .Margin(0, 26, 0, 0)
            .HorizontalAlignment(HorizontalAlignment.Center)
            .Children(
                CreateNavItem("ic_chats.svg", "全部对话", ChatListScope.All),
                CreateNavItem("ic_star.svg", "收藏对话", ChatListScope.Favourites));
    }

    private MaterialIconButton CreateNavItem(string iconFile, string tooltip, ChatListScope scope)
    {
        var icon = IconAssets.Load(iconFile, UiTheme.Text);
        var item = CreateRoundButton(IconAssets.Create(icon, 20), tooltip);

        item.Click += () => SetScope(scope);

        _navItems[scope] = new NavEntry(item, icon);
        return item;
    }

    private StackPanel BuildFooter()
    {
        var icon = _settingsIcon = IconAssets.Load("ic_settings.svg", UiTheme.TextSecondary);
        var settings = CreateRoundButton(IconAssets.Create(icon, 20), "外观设置");
        settings.Click += () => SettingsRequested?.Invoke();

        return new StackPanel()
            .HorizontalAlignment(HorizontalAlignment.Center)
            .Children(settings);
    }

    private static MaterialIconButton CreateRoundButton(UIElement content, string tooltip)
    {
        return new MaterialIconButton { Content = content }
            .Width(46)
            .Height(46)
            .CornerRadius(23)
            .Cursor(CursorType.Hand)
            .ToolTip(tooltip);
    }

    private void UpdateNavVisuals()
    {
        foreach (var (scope, entry) in _navItems)
        {
            var active = scope == _scope;
            entry.Item.Variant = active ? MaterialButtonVariant.TonalIcon : MaterialButtonVariant.StandardIcon;
            entry.Icon.Tint = active ? UiTheme.OnSelection : UiTheme.TextSecondary;
        }
    }
}
