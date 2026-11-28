using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using MewUI.Material.Themes;

namespace MewUI.Material.Controls;

public enum MaterialTextFieldVariant { Filled, Outlined, Search }
public enum MaterialTextFieldInputType { Text, Password }

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
    public MaterialTextField(MaterialTextFieldInputType inputType) : this(MaterialTextFieldVariant.Outlined, inputType) { }

    private protected MaterialTextField(MaterialTextFieldVariant variant, MaterialTextFieldInputType inputType = MaterialTextFieldInputType.Text)
    {
        _variant = variant;
        InputType = inputType;
        InputEditor = (inputType switch
        {
            MaterialTextFieldInputType.Text => (SingleLineTextBase)new TextBox(),
            MaterialTextFieldInputType.Password when variant != MaterialTextFieldVariant.Search => new PasswordBox(),
            _ => throw new ArgumentOutOfRangeException(nameof(inputType)),
        }).Padding(16, 0).MinHeight(54).BorderThickness(0).Background(Color.Transparent);
        UIElement input = InputEditor;
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
        InputEditor.GotFocus += Refresh;
        InputEditor.LostFocus += Refresh;
        InputEditor.MouseEnter += Refresh;
        InputEditor.MouseLeave += Refresh;
        _label.Target = InputEditor;
        _label.MouseUp += e => { if (e.Button == MouseButton.Left) InputEditor.Focus(); };
        InputEditor.KeyDown += e =>
        {
            if (e.Handled || e.Key != Key.Enter || !IsEffectivelyEnabled) return;
            var submitted = InputType == MaterialTextFieldInputType.Text ? Submitted : null;
            if (SubmitRequested == null && submitted == null) return;
            e.Handled = true;
            submitted?.Invoke(Text);
            SubmitRequested?.Invoke();
        };
        Refresh();
    }

    /// <summary>Gets the input mode selected when the field was created.</summary>
    public MaterialTextFieldInputType InputType { get; }
    /// <summary>Gets the native editor for focus, keyboard, and shared editing options.</summary>
    public SingleLineTextBase InputEditor { get; }
    /// <summary>Gets the native editor for a plain-text field.</summary>
    public TextBox Editor => InputEditor as TextBox ?? throw new InvalidOperationException("This field uses a password editor. Use InputEditor or Password.");
    public string Text { get => Editor.Text; set => Editor.Text = value; }
    /// <summary>Gets or sets the value of a password field. The returned string is unmasked.</summary>
    public string Password { get => PasswordEditor.Password; set => PasswordEditor.Password = value; }
    private PasswordBox PasswordEditor => InputEditor as PasswordBox ?? throw new InvalidOperationException("This field does not use a password editor.");
    public string Placeholder { get => InputEditor.Placeholder; set => InputEditor.Placeholder = value; }
    public string Label { get => _label.Text; set { _label.Text = value; Refresh(); } }
    public string SupportingText { get => _support.Text; set { _support.Text = value; Refresh(); } }
    public bool HasError { get => _error; set { _error = value; Refresh(); } }
    public MaterialTextFieldVariant Variant { get => _variant; }
    /// <summary>Raised when Enter is pressed in a plain-text field.</summary>
    public event Action<string>? Submitted;
    /// <summary>Raised when Enter is pressed, without exposing the input value.</summary>
    public event Action? SubmitRequested;

    protected void SetClearButtonText(string text) => _clearButton?.Content(text, accessKey: false);

    private void Refresh() => OnMaterialThemeChanged(MaterialTheme);

    protected override void OnMaterialThemeChanged(MaterialTheme theme)
    {
        base.OnMaterialThemeChanged(theme);
        var c = theme.Colors;
        bool focused = InputEditor.IsFocused;
        bool enabled = IsEffectivelyEnabled;
        var ink = !enabled ? c.OnSurface.WithAlpha(97) : HasError ? c.Error : focused ? c.Primary : c.OnSurfaceVariant;
        _label.IsVisible = !string.IsNullOrEmpty(Label);
        _support.IsVisible = !string.IsNullOrEmpty(SupportingText);
        _label.Foreground = _support.Foreground = ink;
        _label.FontSize = _support.FontSize = theme.Typography.BodySmall.FontSize;
        InputEditor.FontSize = theme.Typography.BodyLarge.FontSize;
        InputEditor.Foreground = enabled ? c.OnSurface : ink;
        _frame.CornerRadius = Variant == MaterialTextFieldVariant.Search ? Math.Min(28, theme.Shapes.Full) : theme.Shapes.ExtraSmall;
        var fill = Variant switch
        {
            MaterialTextFieldVariant.Filled => c.SurfaceContainerHighest,
            MaterialTextFieldVariant.Search => c.SurfaceContainerHigh,
            _ => Color.Transparent,
        };
        _frame.Background = enabled && InputEditor.IsMouseOver ? Color.Composite(fill, c.OnSurface.WithAlpha(20)) : fill;
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

public sealed class FilledTextField : MaterialTextField
{
    public FilledTextField() : this(MaterialTextFieldInputType.Text) { }
    public FilledTextField(MaterialTextFieldInputType inputType) : base(MaterialTextFieldVariant.Filled, inputType) { }
}

public sealed class OutlinedTextField : MaterialTextField
{
    public OutlinedTextField() { }
    public OutlinedTextField(MaterialTextFieldInputType inputType) : base(inputType) { }
}
public sealed class MaterialSearchBar : MaterialTextField
{
    public MaterialSearchBar() : base(MaterialTextFieldVariant.Search) { }

    public string ClearButtonText
    {
        get;
        set { field = value; SetClearButtonText(value); }
    } = "Clear";
}
