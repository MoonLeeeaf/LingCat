using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using LingCat_Desktop.Services;
using MewUI.Material.Controls;
using MewUI.Material.Themes;

namespace LingCat_Desktop.Ui.Components;

/// <summary>
/// 账号管理对话框内容：当前账号、切换已保存账号、登录其他账号、退出登录。
/// </summary>
internal sealed class AccountPanelView
{
    private readonly ErrorMessage _error = new();

    public AccountPanelView(AuthSession auth, string? error = null)
    {
        var sessions = SessionStore.Instance.ListSessions();
        var list = new StackPanel()
            .Spacing(4);

        foreach (var session in sessions)
        {
            list.Add(BuildSessionRow(session, session.Key == auth.Stored.Key));
        }

        var children = new List<Element>
        {
            BuildCurrentUser(auth),
            new TextButton().Content("个人资料").OnClick(() => ProfileRequested?.Invoke()),
            UiFactory.DividerLine(false).Margin(0, 10, 0, 10),
            _error,
        };

        SetError(error);

        children.Add(new Label()
            .Text("账号")
            .FontSize(11)
            .Bold()
            .Foreground(UiTheme.TextMuted)
            .Margin(4, 0, 0, 4));
        children.Add(list);
        children.Add(UiFactory.DividerLine(false).Margin(0, 10, 0, 6));
        children.Add(new FilledTonalButton().Content("登录其他账号").OnClick(() => AddAccountRequested?.Invoke()));
        children.Add(new OutlinedButton().Content("退出登录").OnClick(() => LogoutRequested?.Invoke()));

        Root = new MaterialSurface
        {
            Variant = MaterialSurfaceVariant.Dialog,
            CornerRadius = 0,
            Padding = new Thickness(16),
            Content = new ScrollViewer()
                .VerticalScroll(ScrollMode.Auto)
                .HorizontalScroll(ScrollMode.Disabled)
                .Content(new StackPanel().Spacing(6).Children(children.ToArray())),
        };
    }

    public MaterialSurface Root { get; }

    public event Action<StoredSession>? SwitchRequested;

    public event Action? AddAccountRequested;

    public event Action? LogoutRequested;
    public event Action? ProfileRequested;

    public void SetError(string? message) => _error.SetMessage(message);

    private static StackPanel BuildCurrentUser(AuthSession auth)
    {
        return new StackPanel()
            .Spacing(4)
            .Children(
                new Label()
                    .Text("当前账号")
                    .FontSize(10)
                    .SemiBold(),
                new Label()
                    .Text(auth.User.Nickname)
                    .FontSize(14)
                    .Bold()
                    .TextTrimming(TextTrimming.CharacterEllipsis),
                new Label().Text(auth.Stored.Account).FontSize(11),
                new Label().Text(auth.Stored.Server).FontSize(10));
    }

    private UIElement BuildSessionRow(StoredSession session, bool active)
    {
        var displayName = string.IsNullOrWhiteSpace(session.Nickname)
            ? session.Account
            : session.Nickname;

        var title = new Label()
            .Text(displayName)
            .FontSize(12)
            .Bold()
            .TextTrimming(TextTrimming.CharacterEllipsis);

        var subtitle = new Label().Text(session.Server).FontSize(10)
            .TextTrimming(TextTrimming.CharacterEllipsis);

        var content = new Grid()
            .Columns("*,Auto")
            .Children(new StackPanel()
                .Spacing(1)
                .VerticalAlignment(VerticalAlignment.Center)
                .Children(title, subtitle)
                .GridPosition(0, 0));

        if (active)
        {
            content.Add(new Label()
                .Text("当前")
                .FontSize(10)
                .Margin(8, 0, 0, 0)
                .VerticalAlignment(VerticalAlignment.Center)
                .GridPosition(0, 1));
            return content.Padding(8, 7);
        }

        var row = new TextButton { Content = content }.Padding(8, 7);
        row.Click += () => SwitchRequested?.Invoke(session);
        return row;
    }

    private sealed class ErrorMessage : MaterialContentControl
    {
        private readonly Label _label = new Label().TextWrapping(TextWrapping.Wrap);

        public ErrorMessage()
        {
            Content = _label;
            OnMaterialThemeChanged(MaterialTheme);
        }

        public void SetMessage(string? message)
        {
            _label.Text = message ?? string.Empty;
            IsVisible = !string.IsNullOrWhiteSpace(message);
        }

        protected override void OnMaterialThemeChanged(MaterialTheme theme)
        {
            _label.Foreground = theme.Colors.Error;
            _label.FontSize = theme.Typography.BodySmall.FontSize;
        }
    }
}
