using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using MewUI.Material.Controls;
using MewUI.Material.Themes;

namespace LingCat_Desktop.Ui;

internal enum ChatListScope
{
    All,
    Favourites,
}

internal sealed class ChatSummary
{
    public required string Id { get; init; }
    public required string Title { get; set; }
    public required string AvatarText { get; set; }
    public required Color AvatarColor { get; init; }
    public string Snippet { get; set; } = string.Empty;
    public string Time { get; set; } = string.Empty;
    public uint LastMessageId { get; set; }
    public bool LastMessageEdited { get; set; }
    public bool IsFavourite { get; set; }
    public bool IsGroup { get; init; }
    public int MemberCount { get; init; }
    public string Draft { get; set; } = string.Empty;
    public bool HistoryLoading { get; set; }
    public bool Sending { get; set; }
    public string? HistoryError { get; set; }
    public string? SendError { get; set; }
    public List<ChatMessage> Messages { get; } = new();
}

internal sealed record ChatMessage
{
    public uint Id { get; init; }
    public required string Text { get; init; }
    public required string Time { get; init; }
    public string Sender { get; init; } = string.Empty;
    public bool IsMine { get; init; }
    public bool IsSystem { get; init; }
}

internal static class UiFactory
{
    public static Border Avatar(
        string text,
        Color background,
        double size = 40,
        double fontSize = 16,
        Color? foreground = null)
    {
        return new Border()
            .Width(size)
            .Height(size)
            .CornerRadius(size / 2)
            .Background(background)
            .Child(new Label()
                .Text(text)
                .FontSize(fontSize)
                .Bold()
                .Foreground(foreground ?? UiTheme.OnAvatar)
                .HorizontalAlignment(HorizontalAlignment.Center)
                .VerticalAlignment(VerticalAlignment.Center));
    }

    public static MaterialDivider DividerLine(bool vertical) => new()
    {
        Orientation = vertical ? Orientation.Vertical : Orientation.Horizontal,
    };

    // The multiline composer keeps its built-in editing behavior inside Material chrome.
    public static MaterialSurface EditorSurface(TextBase editor, UIElement content) => new EditorHost(editor, content);

    private sealed class EditorHost : MaterialSurface
    {
        private readonly TextBase _editor;

        public EditorHost(TextBase editor, UIElement content)
        {
            _editor = editor;
            Variant = MaterialSurfaceVariant.OutlinedCard;
            Padding = new Thickness(4, 0);
            editor.Background = Color.Transparent;
            editor.BorderThickness = 0;
            editor.GotFocus += UpdateFocus;
            editor.LostFocus += UpdateFocus;
            Content = content;
            OnMaterialThemeChanged(MaterialTheme);
        }

        protected override void OnMaterialThemeChanged(MaterialTheme theme)
        {
            base.OnMaterialThemeChanged(theme);
            if (_editor is null) return;
            _editor.FontSize = theme.Typography.BodyLarge.FontSize;
            CornerRadius = theme.Shapes.ExtraSmall;
            UpdateFocus();
        }

        private void UpdateFocus() => BorderBrush = _editor.IsFocused ? MaterialTheme.Colors.Primary : MaterialTheme.Colors.Outline;
    }

    public static Label Caption(string text, double size = 11)
    {
        return new Label()
            .Text(text)
            .FontSize(size)
            .Foreground(UiTheme.TextMuted);
    }
}
