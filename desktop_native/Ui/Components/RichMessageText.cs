using System.Globalization;
using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Rendering;
using Aprillz.MewUI.Text;
using LingCat.ClientProtocol.Client;

namespace LingCat_Desktop.Ui.Components;

internal sealed class RichMessageText(string text, IReadOnlyList<MessageEntity> entities, Action<MessageEntity> activate) : TextElement
{
    private readonly HashSet<MessageEntity> _revealed = [];
    private readonly List<Rect> _hitBounds = [];
    private ITextLayout? _layout;
    private (double Width, uint Dpi, TextRunStyle Style) _key;

    // Wire offsets count UTF-16 units; MewUI style ranges must also respect grapheme boundaries.
    internal static IEnumerable<MessageEntity> ValidEntities(string text, IReadOnlyList<MessageEntity> entities)
    {
        if (entities.Count == 0) yield break;
        var boundaries = StringInfo.ParseCombiningCharacters(text).ToHashSet();
        boundaries.Add(text.Length);
        uint cursor = 0;
        foreach (var entity in entities.OrderBy(item => item.Offset))
        {
            ulong end = (ulong)entity.Offset + entity.Length;
            if (entity.Length == 0 || entity.Offset < cursor || end > (ulong)text.Length ||
                !boundaries.Contains((int)entity.Offset) || !boundaries.Contains((int)end)) continue;
            cursor = (uint)end;
            yield return entity;
        }
    }

    private ITextLayout Layout(double width)
    {
        var style = new TextRunStyle(FontFamily, FontSize, FontWeight);
        var key = (Width: width, Dpi: GetDpi(), Style: style);
        if (_layout is not null && key == _key) return _layout;
        _key = key;
        return _layout = GetGraphicsFactory().TextEngine.CreateLayout(new TextLayoutRequest
        {
            Text = text.AsMemory(), Dpi = key.Dpi, DefaultStyle = style,
            Paragraph = new TextParagraphStyle { MaxWidth = width, Wrapping = TextWrapping.Wrap },
            Runs = entities.Select(e => new GeometryStyleRun((int)e.Offset, (int)e.Length, e.Type switch
            {
                "bold" => style with { Weight = FontWeight.Bold },
                "italic" => style with { Italic = true },
                "code" => style with { FontFamily = "monospace" },
                "strikethrough" => style with { Decoration = TextDecoration.Strikethrough },
                "link" => style with { Decoration = TextDecoration.Underline },
                "e2e" => style with { Italic = true },
                _ => style,
            })).ToArray(),
        });
    }

    protected override Size MeasureContent(Size availableSize) => availableSize.Width <= 0 ? Size.Empty :
        Layout(availableSize.Width).MeasuredSize;

    protected override void OnRender(IGraphicsContext context)
    {
        if (Bounds.Width <= 0) return;
        var spans = new List<TextPaintSpan>();
        foreach (var entity in entities)
        {
            var range = new TextRange((int)entity.Offset, (int)entity.Length);
            switch (entity.Type)
            {
                case "code": spans.Add(new(range, Background: UiTheme.SurfaceActive)); break;
                case "spoiler" when !_revealed.Contains(entity):
                    spans.Add(new(range, Foreground: UiTheme.SurfaceActive, Background: UiTheme.SurfaceActive)); break;
                case "link" or "user_mention" or "chat_mention": spans.Add(new(range, Foreground: UiTheme.Accent)); break;
                case "e2e": spans.Add(new(range, Foreground: UiTheme.Danger)); break;
            }
        }
        context.Save();
        try
        {
            context.SetClip(Bounds);
            context.Text.Draw(Layout(Bounds.Width), new Point(Bounds.X, Bounds.Y), new TextDrawOptions(Foreground, spans.ToArray(), Owner: this));
        }
        finally { context.Restore(); }
    }

    protected override void OnMouseUp(MouseEventArgs e)
    {
        base.OnMouseUp(e);
        if (e.Handled || e.Button != MouseButton.Left || Bounds.Width <= 0) return;
        var point = e.GetPosition(this);
        foreach (var entity in entities)
        {
            if (entity.Type is not ("spoiler" or "link" or "user_mention" or "chat_mention")) continue;
            _hitBounds.Clear();
            Layout(Bounds.Width).GetRangeBounds((int)entity.Offset, (int)entity.Length, _hitBounds);
            if (!_hitBounds.Any(rect => rect.Contains(point))) continue;
            e.Handled = true;
            if (entity.Type == "spoiler") { _revealed.Add(entity); InvalidateVisual(); }
            else activate(entity);
            break;
        }
    }
}
