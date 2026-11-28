using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using MewUI.Material.Themes;

namespace MewUI.Material.Controls;

public enum MaterialTextFieldVariant { Filled, Outlined, Search }

/// <summary>A labelled field backed by a native MewUI editor (IME, clipboard and selection).</summary>
public class MaterialTextField : MaterialContentControl
{
    private readonly Label _label = new();
    private readonly Label _support = new();
    private readonly Border _frame;
    private readonly MaterialTextFieldVariant _variant;
    private readonly TextButton? _clearButton;
    private bool _error;

    public MaterialTextField() : this(MaterialTextFieldVariant.Outlined) { }

    private protected MaterialTextField(MaterialTextFieldVariant variant)
    {
        _variant = variant;
        Editor = new TextBox().Padding(16, 0).MinHeight(54).BorderThickness(0).Background(Color.Transparent);
        UIElement input = Editor;
        if (variant == MaterialTextFieldVariant.Search)
        {
            Editor.Placeholder = "Search";
            var clear = _clearButton = new TextButton { IsEnabled = false };
            clear.Content("Clear", accessKey: false);
            clear.Click += () => { Editor.Focus(); Editor.Text = string.Empty; };
            Editor.TextChanged += text => clear.IsEnabled = text.Length != 0;
            input = new Grid().Columns("*,Auto").Children(Editor.GridPosition(0, 0), clear.GridPosition(0, 1));
        }
        _frame = new Border().Child(input);
        Content = new StackPanel().Spacing(4).Children(_label, _frame, _support);
        Editor.GotFocus += Refresh;
        Editor.LostFocus += Refresh;
        Editor.MouseEnter += Refresh;
        Editor.MouseLeave += Refresh;
        _label.MouseUp += e => { if (e.Button == MouseButton.Left) Editor.Focus(); };
        Editor.KeyDown += e =>
        {
            if (e.Handled || e.Key != Key.Enter || Submitted == null) return;
            e.Handled = true;
            Submitted.Invoke(Text);
        };
        Refresh();
    }

    public TextBox Editor { get; }
    public string Text { get => Editor.Text; set => Editor.Text = value; }
    public string Placeholder { get => Editor.Placeholder; set => Editor.Placeholder = value; }
    public string Label { get => _label.Text; set { _label.Text = value; Refresh(); } }
    public string SupportingText { get => _support.Text; set { _support.Text = value; Refresh(); } }
    public bool HasError { get => _error; set { _error = value; Refresh(); } }
    public MaterialTextFieldVariant Variant { get => _variant; }
    public event Action<string>? Submitted;

    protected void SetClearButtonText(string text) => _clearButton?.Content(text, accessKey: false);

    private void Refresh() => OnMaterialThemeChanged(MaterialTheme);

    protected override void OnMaterialThemeChanged(MaterialTheme theme)
    {
        base.OnMaterialThemeChanged(theme);
        var c = theme.Colors;
        bool focused = Editor.IsFocused;
        bool enabled = IsEffectivelyEnabled;
        var ink = !enabled ? c.OnSurface.WithAlpha(97) : HasError ? c.Error : focused ? c.Primary : c.OnSurfaceVariant;
        _label.IsVisible = !string.IsNullOrEmpty(Label);
        _support.IsVisible = !string.IsNullOrEmpty(SupportingText);
        _label.Foreground = _support.Foreground = ink;
        _label.FontSize = _support.FontSize = theme.Typography.BodySmall.FontSize;
        Editor.FontSize = theme.Typography.BodyLarge.FontSize;
        Editor.Foreground = enabled ? c.OnSurface : ink;
        _frame.CornerRadius = Variant == MaterialTextFieldVariant.Search ? Math.Min(28, theme.Shapes.Full) : theme.Shapes.ExtraSmall;
        var fill = Variant switch
        {
            MaterialTextFieldVariant.Filled => c.SurfaceContainerHighest,
            MaterialTextFieldVariant.Search => c.SurfaceContainerHigh,
            _ => Color.Transparent,
        };
        _frame.Background = enabled && Editor.IsMouseOver ? Color.Composite(fill, c.OnSurface.WithAlpha(20)) : fill;
        _frame.BorderBrush = !enabled ? c.OnSurface.WithAlpha(31) : focused || HasError ? ink : c.Outline;
        // A fixed border allocation avoids moving the caret when focus changes.
        _frame.BorderThickness = 2;
        if (Variant != MaterialTextFieldVariant.Outlined && !focused && !HasError) _frame.BorderBrush = Color.Transparent;
    }

    protected override void OnMewPropertyChanged(MewProperty property)
    {
        base.OnMewPropertyChanged(property);
        if (property == IsEffectivelyEnabledProperty && _frame != null) Refresh();
    }
}

public sealed class FilledTextField : MaterialTextField { public FilledTextField() : base(MaterialTextFieldVariant.Filled) { } }
public sealed class OutlinedTextField : MaterialTextField;
public sealed class MaterialSearchBar : MaterialTextField
{
    public MaterialSearchBar() : base(MaterialTextFieldVariant.Search) { }

    public string ClearButtonText
    {
        get;
        set { field = value; SetClearButtonText(value); }
    } = "Clear";
}
