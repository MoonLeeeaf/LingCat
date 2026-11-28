using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using MewUI.Material.Controls;

namespace LingCat_Desktop.Ui.Components;

internal sealed class ProfileDialog
{
    private readonly StackPanel _body = new StackPanel().Spacing(6);
    private readonly TextBlock _status = Text(string.Empty);
    private readonly MaterialProgressBar _progress = new() { IsVisible = false, Height = 4 };
    private bool _closed;
    private bool _busy;

    public ProfileDialog(string title)
    {
        Window = new Window { Title = title, StartupLocation = WindowStartupLocation.CenterOwner, Padding = Thickness.Zero };
        Window.Resizable(430, 540, 340, 320, 720, 850);
        Window.Closed += () => _closed = true;
        Window.PreviewKeyDown += e => { if (e.Key == Key.Escape) { e.Handled = true; Window.Close(); } };
        var close = new TextButton().Content("关闭").HorizontalAlignment(HorizontalAlignment.Right).OnClick(Window.Close);
        Window.Content = new MaterialSurface
        {
            Variant = MaterialSurfaceVariant.Dialog, CornerRadius = 0, Padding = new Thickness(20),
            Content = new Grid().Rows("Auto,*,Auto").Children(
                new StackPanel().Spacing(4).Children(_progress, _status).GridPosition(0, 0),
                new ScrollViewer().VerticalScroll(ScrollMode.Auto).HorizontalScroll(ScrollMode.Disabled)
                    .Content(_body).GridPosition(1, 0),
                close.Margin(0, 8, 0, 0).GridPosition(2, 0)),
        };
    }

    public Window Window { get; }
    public void Clear() => _body.Clear();
    public void Add(UIElement element) => _body.Add(element);

    public void Header(UserAvatar avatar, string name, string? subtitle)
    {
        var labels = new StackPanel().Spacing(3).VerticalAlignment(VerticalAlignment.Center);
        labels.Add(Text(name, UiTheme.Type.HeadlineSmall.FontSize));
        if (!string.IsNullOrWhiteSpace(subtitle)) labels.Add(Text(subtitle, 12, UiTheme.TextSecondary));
        Add(new Grid().Columns("Auto,*").Margin(0, 0, 0, 12).Children(
            new TextButton { Content = avatar.Root }.Padding(0).MinWidth(64)
                .ToolTip("查看头像").OnClick(() => avatar.ShowPreview(Window)).GridPosition(0, 0),
            labels.Margin(12, 0, 0, 0).GridPosition(0, 1)));
    }

    public void Field(string label, string? value, string icon, bool copy = true)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        var row = Row(icon, value, label);
        if (copy)
            Add(new TextButton { Content = row }.Padding(8, 6).ToolTip("复制" + label).OnClick(() =>
            {
                if (Application.Current?.PlatformServices.Clipboard?.TrySetText(value) == true)
                    SetStatus($"已复制{label}");
                else
                    SetStatus("无法访问剪贴板", error: true);
            }));
        else Add(row.Padding(8, 6));
    }

    public void Action(string label, string icon, Action action) =>
        Add(new TextButton { Content = Row(icon, label, null) }.Padding(8, 6).OnClick(action));

    private static Grid Row(string icon, string value, string? caption)
    {
        var labels = new StackPanel().Spacing(2).Children(Text(value));
        if (caption is not null) labels.Add(Text(caption, 12, UiTheme.TextSecondary));
        return new Grid().Columns("Auto,*").Children(
            IconAssets.Create(icon, 22, UiTheme.TextSecondary).GridPosition(0, 0),
            labels.Margin(12, 0, 0, 0).GridPosition(0, 1));
    }

    public static TextBlock Text(string value, double size = 14, Color? color = null) => new()
    {
        Text = value, TextWrapping = TextWrapping.Wrap, FontSize = size, Foreground = color ?? UiTheme.Text,
    };

    public void SetStatus(string text, bool error = false)
    {
        _status.Text = text;
        _status.Foreground = error ? UiTheme.Danger : UiTheme.TextSecondary;
        _status.IsVisible = text.Length != 0;
    }

    public void Show(Window owner, Action load)
    {
        SetStatus(string.Empty);
        Window.Loaded += load;
        try { Window.ShowDialog(owner); }
        finally { _closed = true; }
    }

    public async void Run<T>(string waiting, string failure, Func<Task<T>> operation, Action<T> onSuccess)
    {
        if (_closed || _busy) return;
        SetBusy(true, waiting);
        try
        {
            var result = await operation().ConfigureAwait(false);
            UiThread.Post(() =>
            {
                if (_closed) return;
                SetBusy(false, string.Empty);
                onSuccess(result);
            });
        }
        catch (Exception ex)
        {
            UiThread.Post(() =>
            {
                if (_closed) return;
                SetBusy(false, string.Empty);
                SetStatus($"{failure}：{ex.Message}", error: true);
            });
        }
    }

    private void SetBusy(bool busy, string status)
    {
        _busy = busy;
        _body.IsEnabled = !busy;
        _progress.IsVisible = _progress.IsIndeterminate = busy;
        SetStatus(status);
    }
}
