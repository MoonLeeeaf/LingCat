using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using LingCat_Desktop.Services;
using MewUI.Material.Controls;
using MewUI.Material.Themes;

namespace LingCat_Desktop.Ui.Components;

/// <summary>
/// 侧边栏头像弹出的账号面板：当前账号、切换已保存账号、登录其他账号、退出登录。
/// </summary>
internal sealed class AccountPanelView
{
    private readonly Button _closeButton;

    public AccountPanelView(AuthSession auth, string? error = null)
    {
        var sessions = SessionStore.Instance.ListSessions();
        var list = new StackPanel()
            .Spacing(4);

        foreach (var session in sessions)
        {
            list.Add(BuildSessionRow(session, session.Key == auth.Stored.Key));
        }

        _closeButton = new TextButton().Content("关闭").HorizontalAlignment(HorizontalAlignment.Right)
            .OnClick(() => CloseRequested?.Invoke());
        var children = new List<Element>
        {
            _closeButton,
            BuildCurrentUser(auth),
            UiFactory.DividerLine(false).Margin(0, 10, 0, 10),
        };

        if (!string.IsNullOrWhiteSpace(error))
        {
            children.Add(new ErrorMessage(error).Margin(0, 0, 0, 8));
        }

        children.Add(new Label()
            .Text("账号")
            .FontSize(11)
            .Bold()
            .Foreground(UiTheme.TextMuted)
            .Margin(4, 0, 0, 4));
        children.Add(new ScrollViewer()
            .VerticalScroll(ScrollMode.Auto)
            .HorizontalScroll(ScrollMode.Disabled)
            .MaxHeight(280)
            .Content(list));
        children.Add(UiFactory.DividerLine(false).Margin(0, 10, 0, 6));
        children.Add(new FilledTonalButton().Content("＋  登录其他账号").OnClick(() => AddAccountRequested?.Invoke()));
        children.Add(new OutlinedButton().Content("退出登录").OnClick(() => LogoutRequested?.Invoke()));

        Root = new MaterialSurface
        {
            Variant = MaterialSurfaceVariant.Dialog,
            Content = new StackPanel().Spacing(6).Children(children.ToArray()),
        }
            .Width(320)
            .Padding(16);
    }

    public MaterialSurface Root { get; }

    public event Action<StoredSession>? SwitchRequested;

    public event Action? AddAccountRequested;

    public event Action? LogoutRequested;
    public event Action? CloseRequested;

    public void FocusFirstAction() => _closeButton.Focus();

    private static StackPanel BuildCurrentUser(AuthSession auth)
    {
        var text = new StackPanel()
            .Spacing(2)
            .VerticalAlignment(VerticalAlignment.Center)
            .Children(
                new Label()
                    .Text(auth.User.Nickname)
                    .FontSize(14)
                    .Bold()
                    .TextTrimming(TextTrimming.CharacterEllipsis),
                new Label().Text(auth.Stored.Account).FontSize(11),
                new Label().Text(auth.Stored.Server).FontSize(10));

        return new StackPanel()
            .Spacing(10)
            .Children(
                new Label()
                    .Text("当前账号")
                    .FontSize(10)
                    .SemiBold(),
                new Grid()
                    .Columns("Auto,*")
                    .Children(
                        UiFactory.Avatar(
                                FirstChar(auth.User.Nickname),
                                UiTheme.Accent,
                                42,
                                16,
                                UiTheme.OnAccent)
                            .GridPosition(0, 0),
                        text
                            .Margin(10, 0, 0, 0)
                            .GridPosition(0, 1)));
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
                .Columns("Auto,*,Auto")
                .Children(
                    UiFactory.Avatar(FirstChar(displayName), UiTheme.SurfaceActive, 32, 12, UiTheme.Text)
                        .GridPosition(0, 0),
                    new StackPanel()
                        .Spacing(1)
                        .Margin(8, 0, 0, 0)
                        .VerticalAlignment(VerticalAlignment.Center)
                        .Children(title, subtitle)
                        .GridPosition(0, 1),
                    new Label()
                        .Text(active ? "当前" : string.Empty)
                        .FontSize(10)
                        .VerticalAlignment(VerticalAlignment.Center)
                        .GridPosition(0, 2));

        if (active)
        {
            return new MaterialSurface { Variant = MaterialSurfaceVariant.FilledCard, Content = content }.Padding(8, 7);
        }

        var row = new TextButton { Content = content }.Padding(8, 7);
        row.Click += () => SwitchRequested?.Invoke(session);
        return row;
    }

    private sealed class ErrorMessage : MaterialContentControl
    {
        private readonly Label _label;

        public ErrorMessage(string message)
        {
            _label = new Label().Text(message).TextWrapping(TextWrapping.Wrap);
            Content = _label;
            OnMaterialThemeChanged(MaterialTheme);
        }

        protected override void OnMaterialThemeChanged(MaterialTheme theme)
        {
            _label.Foreground = theme.Colors.Error;
            _label.FontSize = theme.Typography.BodySmall.FontSize;
        }
    }

    private static string FirstChar(string value)
    {
        return string.IsNullOrWhiteSpace(value) ? "?" : value.Trim()[0].ToString();
    }
}
