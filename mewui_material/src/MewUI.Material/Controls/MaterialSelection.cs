using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Rendering;
using MewUI.Material.Themes;

namespace MewUI.Material.Controls;

public class MaterialCheckBox : CheckBox
{
    private readonly SelectionChrome _chrome;
    public MaterialCheckBox() : this(false) { }
    private protected MaterialCheckBox(bool isSwitch) => _chrome = new(this, isSwitch ? 52 : 18);

    protected override Size MeasureContent(Size availableSize) => Template != null ? base.MeasureContent(availableSize) : _chrome.Measure(EffectiveContent, availableSize);
    protected override void ArrangeContent(Rect bounds) { if (Template != null) base.ArrangeContent(bounds); else _chrome.Arrange(EffectiveContent, bounds); }
    protected override void OnRender(IGraphicsContext context) { if (Template != null) base.OnRender(context); else _chrome.Draw(context, IsChecked, radio: false); }
    protected override void OnVisualStateChanged(VisualState oldState, VisualState newState) { base.OnVisualStateChanged(oldState, newState); _chrome.Update(newState.IsEnabled, newState.IsHot, newState.IsFocused, newState.IsPressed); }
    protected override void OnVisualRootChanged(Element? oldRoot, Element? newRoot) { base.OnVisualRootChanged(oldRoot, newRoot); _chrome.Mount(newRoot != null); }
    protected override void OnMouseDown(MouseEventArgs e) { base.OnMouseDown(e); if (e.Button == MouseButton.Left && IsPressed) _chrome.Pulse(e); }
    protected override void OnKeyUp(KeyEventArgs e) { if (e.Key == Key.Space && IsFocused && IsEffectivelyEnabled) _chrome.Pulse(); base.OnKeyUp(e); }
    protected override void OnDispose() { _chrome.Mount(false); base.OnDispose(); }
}

public sealed class MaterialSwitch : MaterialCheckBox
{
    public MaterialSwitch() : base(true) { }
}

public sealed class MaterialRadioButton : RadioButton
{
    private readonly SelectionChrome _chrome;
    public MaterialRadioButton() => _chrome = new(this, 20);

    protected override Size MeasureContent(Size availableSize) => Template != null ? base.MeasureContent(availableSize) : _chrome.Measure(EffectiveContent, availableSize);
    protected override void ArrangeContent(Rect bounds) { if (Template != null) base.ArrangeContent(bounds); else _chrome.Arrange(EffectiveContent, bounds); }
    protected override void OnRender(IGraphicsContext context) { if (Template != null) base.OnRender(context); else _chrome.Draw(context, IsChecked, radio: true); }
    protected override void OnVisualStateChanged(VisualState oldState, VisualState newState) { base.OnVisualStateChanged(oldState, newState); _chrome.Update(newState.IsEnabled, newState.IsHot, newState.IsFocused, newState.IsPressed); }
    protected override void OnVisualRootChanged(Element? oldRoot, Element? newRoot) { base.OnVisualRootChanged(oldRoot, newRoot); _chrome.Mount(newRoot != null); }
    protected override void OnMouseDown(MouseEventArgs e) { base.OnMouseDown(e); if (e.Button == MouseButton.Left && IsPressed) _chrome.Pulse(e); }
    protected override void OnKeyUp(KeyEventArgs e) { if (e.Key == Key.Space && IsFocused && IsEffectivelyEnabled) _chrome.Pulse(); base.OnKeyUp(e); }
    protected override void OnDispose() { _chrome.Mount(false); base.OnDispose(); }
}

internal sealed class SelectionChrome
{
    private readonly Control _owner;
    private readonly double _width;
    private readonly InteractionLayer _layer;
    public SelectionChrome(Control owner, double width)
    {
        _owner = owner;
        _width = width;
        _layer = new(owner.InvalidateVisual);
        Apply(MaterialThemeManager.Current);
    }

    private void Apply(MaterialTheme theme)
    {
        var sheet = new StyleSheet();
        var style = new Style(typeof(Control))
        {
            OverridesDefaultStyle = true,
            Setters = [Setter.Create(Control.ForegroundProperty, theme.Colors.OnSurface),
                Setter.Create(Control.PaddingProperty, new Thickness(12, 0)),
                Setter.Create(FrameworkElement.MinHeightProperty, 48d)],
            Triggers = [new StateTrigger { Exclude = VisualStateFlags.Enabled,
                Setters = [Setter.Create(Control.ForegroundProperty, theme.Colors.OnSurface.WithAlpha(97))] }],
        };
        if (_owner is MaterialRadioButton) sheet.Define<MaterialRadioButton>(style);
        else sheet.Define<MaterialCheckBox>(style);
        _owner.StyleSheet = sheet;
        _owner.InvalidateVisual();
    }

    public void Mount(bool mounted)
    {
        _layer.SetMounted(mounted);
        MaterialThemeManager.Changed -= Apply;
        if (!mounted) return;
        MaterialThemeManager.Changed += Apply;
        Apply(MaterialThemeManager.Current);
    }

    public Size Measure(Element? label, Size available)
    {
        var padding = _owner.Padding;
        double leading = _width + (label == null ? 0 : 12);
        label?.Measure(new Size(Math.Max(0, available.Width - leading - padding.HorizontalThickness), available.Height));
        return new Size(leading + (label?.DesiredSize.Width ?? 0), Math.Max(32, label?.DesiredSize.Height ?? 0)).Inflate(padding);
    }

    public void Arrange(Element? label, Rect bounds)
    {
        bounds = bounds.Deflate(_owner.Padding);
        double leading = _width + 12;
        label?.Arrange(new Rect(bounds.X + leading, bounds.Y, Math.Max(0, bounds.Width - leading), bounds.Height));
    }

    public void Update(bool enabled, bool hot, bool focused, bool pressed) => _layer.SetState(enabled, hot, focused, pressed);
    public void Pulse(MouseEventArgs? args = null) => _layer.Pulse(args == null ? null : InteractionLayer.Pointer(_owner, args));

    public void Draw(IGraphicsContext ctx, bool? value, bool radio)
    {
        var c = MaterialThemeManager.Current.Colors;
        var bounds = _owner.Bounds;
        bool enabled = _owner.IsEffectivelyEnabled, selected = value != false;
        var ink = enabled ? selected ? c.Primary : c.OnSurfaceVariant : c.OnSurface.WithAlpha(97);
        double h = _width == 52 ? 32 : _width;
        var glyph = new Rect(bounds.X + _owner.Padding.Left, bounds.Y + (bounds.Height - h) / 2, _width, h);
        if (enabled) _layer.Draw(ctx, bounds, Math.Min(bounds.Height / 2, 24), ink);
        if (_width == 52)
        {
            var track = selected ? ink : c.SurfaceContainerHighest;
            ctx.FillRoundedRectangle(glyph, 16, 16, track);
            if (!selected) ctx.DrawRoundedRectangle(glyph, 16, 16, enabled ? c.Outline : ink, 2);
            double size = selected ? 24 : 16;
            ctx.FillEllipse(new Rect(glyph.X + (selected ? 24 : 8), glyph.Y + (32 - size) / 2, size, size),
                enabled ? selected ? c.OnPrimary : c.Outline : selected ? c.Surface : ink);
        }
        else if (radio)
        {
            ctx.DrawEllipse(glyph, ink, 2);
            if (selected) ctx.FillEllipse(new Rect(glyph.X + 5, glyph.Y + 5, 10, 10), ink);
        }
        else if (!selected) ctx.DrawRoundedRectangle(glyph, 2, 2, ink, 2);
        else
        {
            ctx.FillRoundedRectangle(glyph, 2, 2, ink);
            var mark = enabled ? c.OnPrimary : c.Surface;
            Point P(double x, double y) => new(glyph.X + x, glyph.Y + y);
            if (value == null) ctx.DrawLine(P(4, 9), P(14, 9), mark, 2);
            else { ctx.DrawLine(P(4, 9), P(7.5, 12.5), mark, 2); ctx.DrawLine(P(7.5, 12.5), P(14, 5.5), mark, 2); }
        }
        if (enabled && _owner.IsFocused) InteractionLayer.DrawFocus(ctx, bounds, 24, c.Primary);
    }
}
