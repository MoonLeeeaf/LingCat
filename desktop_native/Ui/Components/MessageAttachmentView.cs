using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Resources;
using LingCat_Desktop.Services;
using MewUI.Material.Controls;

namespace LingCat_Desktop.Ui.Components;

internal sealed class MessageAttachmentView
{
    public MessageAttachmentView(AuthSession auth, string hash, string name, bool isImage, bool isSticker)
    {
        Root = new StackPanel().Spacing(4);
        var filename = new TextBlock
        {
            Text = name, TextWrapping = TextWrapping.Wrap, Foreground = UiTheme.TextSecondary,
        };
        var status = new TextBlock { IsVisible = false, TextWrapping = TextWrapping.Wrap };
        var card = new TextButton
        {
            Content = new MaterialSurface
            {
                Variant = MaterialSurfaceVariant.FilledCard,
                Padding = new Thickness(12, 8),
                Content = new Grid().Columns("Auto,*").Children(
                    IconAssets.Create("ic_attachment.svg", 24, UiTheme.TextSecondary).GridPosition(0, 0),
                    filename.Margin(10, 0, 0, 0).VerticalAlignment(VerticalAlignment.Center).GridPosition(0, 1)),
            },
        }.Padding(0).ToolTip("保存附件");
        card.Click += () =>
        {
            if (Root.FindVisualRoot() is Window owner) _ = SaveAsync(auth, hash, name, owner, card, status);
        };

        if (isImage)
        {
            var preview = new Border();
            Root.Add(preview);
            _ = LoadPreviewAsync(auth, hash, name, isSticker, preview);
        }
        Root.Add(card);
        Root.Add(status);
    }

    public StackPanel Root { get; }

    private static async Task SaveAsync(AuthSession auth, string hash, string name, Window owner, Button button, TextBlock status)
    {
        if (!button.IsEnabled) return;
        try
        {
            var fileName = Path.GetFileName(name.Replace('\\', '/'));
            var invalid = Path.GetInvalidFileNameChars();
            fileName = string.Concat(fileName.Select(c => char.IsControl(c) || invalid.Contains(c) ? '_' : c)).Trim();
            if (fileName is "" or "." or "..") fileName = "附件";
            var destination = FileDialog.SaveFile(new SaveFileDialogOptions
            {
                Owner = owner, Title = "保存附件", FileName = fileName, OverwritePrompt = true,
            });
            if (string.IsNullOrEmpty(destination)) return;

            button.IsEnabled = false;
            status.IsVisible = true;
            status.Foreground = UiTheme.TextSecondary;
            status.Text = "正在保存…";
            await AttachmentDownload.SaveAsync(auth, hash, destination).ConfigureAwait(false);
            UiThread.Post(() => { status.Text = "已保存"; button.IsEnabled = true; });
        }
        catch (Exception ex)
        {
            UiThread.Post(() =>
            {
                status.IsVisible = true;
                status.Foreground = UiTheme.Danger;
                status.Text = ex switch
                {
                    OperationCanceledException => "保存超时，请重试。",
                    HttpRequestException => "下载失败，请检查连接后重试。",
                    _ => $"保存失败：{ex.Message}",
                };
                button.IsEnabled = true;
            });
        }
    }

    private static async Task LoadPreviewAsync(AuthSession auth, string hash, string name, bool sticker, Border host)
    {
        try
        {
            var bytes = await ImageCache.GetAsync(auth, hash).ConfigureAwait(false);
            if (!ImageDecoders.TryDecode(bytes, out var pixels, out var orientation)) return;
            var source = orientation == ImageOrientation.Identity ? ImageSource.FromBgraPixels(pixels) : ImageSource.FromBytes(bytes);
            UiThread.Post(() =>
            {
                var thumbnail = new Image().Source(source).StretchMode(Stretch.Uniform)
                    .MaxWidth(sticker ? 160 : 360).MaxHeight(sticker ? 160 : 260);
                var open = new TextButton { Content = thumbnail }.Padding(0).ToolTip("预览图片");
                open.Click += () =>
                {
                    if (host.FindVisualRoot() is Window owner) ShowPreview(owner, name, source);
                };
                host.Child = open;
            });
        }
        catch { /* The attachment remains available to save when a preview cannot load. */ }
    }

    private static void ShowPreview(Window owner, string name, ImageSource source)
    {
        var window = new Window
        {
            Title = name, StartupLocation = WindowStartupLocation.CenterOwner, Padding = Thickness.Zero,
        };
        window.Resizable(760, 600, 360, 260, 1800, 1400);
        window.PreviewKeyDown += e => { if (e.Key == Key.Escape) { e.Handled = true; window.Close(); } };
        var close = new TextButton().Content("关闭").HorizontalAlignment(HorizontalAlignment.Right).OnClick(window.Close);
        window.Content = new MaterialSurface
        {
            Variant = MaterialSurfaceVariant.Dialog, CornerRadius = 0, Padding = new Thickness(12),
            Content = new Grid().Rows("*,Auto").Children(
                new Image().Source(source).StretchMode(Stretch.Uniform).GridPosition(0, 0),
                close.GridPosition(1, 0)),
        };
        window.ShowDialog(owner);
    }
}
