using Aprillz.MewUI;
using Aprillz.MewUI.Animation;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Rendering;
using MewUI.Material.Themes;

namespace MewUI.Material.Controls;

public static class MaterialDialog
{
    /// <summary>Shows a modal confirmation. Closing with Escape or the window close button returns false.</summary>
    public static async Task<bool> ConfirmAsync(Window owner, string title, string message,
        string confirmText = "OK", string cancelText = "Cancel")
    {
        var dialog = new Window { Title = title };
        dialog.Resizable(460, 260, 340, 200, 1000, 800);
        bool confirmed = false;
        var accept = new FilledButton { Content = new Label().Text(confirmText) };
        var cancel = new TextButton { Content = new Label().Text(cancelText) };
        accept.Click += () => { confirmed = true; dialog.Close(); };
        cancel.Click += () => dialog.Close();
        dialog.PreviewKeyDown += e => { if (e.Key == Key.Escape) { e.Handled = true; dialog.Close(); } };
        dialog.Content = new MaterialSurface
        {
            Variant = MaterialSurfaceVariant.Dialog,
            Padding = new Thickness(24),
            Content = new Grid().Rows("Auto,*,Auto").Children(
                new Label().Text(title).FontSize(MaterialThemeManager.Current.Typography.HeadlineSmall.FontSize).GridPosition(0, 0),
                new ScrollViewer().VerticalScroll(ScrollMode.Auto).Content(new Label().Text(message).TextWrapping(TextWrapping.Wrap)).GridPosition(1, 0),
                new StackPanel().Horizontal().Spacing(8).HorizontalAlignment(HorizontalAlignment.Right)
                    .Children(cancel, accept).GridPosition(2, 0)),
        };
        var completion = dialog.ShowDialogAsync(owner);
        if (!completion.IsCompleted) cancel.Focus();
        await completion.ConfigureAwait(false);
        return confirmed;
    }
}

/// <summary>A persistent snackbar; callers control placement and may dismiss it explicitly.</summary>
public sealed class MaterialSnackbar : MaterialSurface
{
    private readonly Label _message = new();
    private readonly StackPanel _actions = new StackPanel().Horizontal().Spacing(4);

    public MaterialSnackbar()
    {
        Variant = MaterialSurfaceVariant.Snackbar;
        Content = new Grid().Columns("*,Auto").Children(_message.TextWrapping(TextWrapping.Wrap).GridPosition(0, 0), _actions.GridPosition(0, 1));
        Show(string.Empty);
        IsVisible = false;
    }

    public event Action? Dismissed;

    public void Show(string message, string? actionText = null, Action? action = null)
    {
        _message.Text = message;
        _actions.Clear();
        if (!string.IsNullOrWhiteSpace(actionText) && action != null)
            AddAction(actionText, () => { Dismiss(); action(); });
        AddAction("Dismiss", Dismiss);
        IsVisible = true;
        UpdateActionColors(MaterialTheme);
    }

    private void AddAction(string text, Action action)
    {
        var button = new TextButton { Content = new Label().Text(text) };
        button.Click += action;
        _actions.Add(button);
    }

    public void Dismiss()
    {
        if (!IsVisible) return;
        IsVisible = false;
        _actions.Clear();
        Dismissed?.Invoke();
    }

    protected override void OnMaterialThemeChanged(MaterialTheme theme)
    {
        base.OnMaterialThemeChanged(theme);
        if (_actions != null) UpdateActionColors(theme);
    }

    private void UpdateActionColors(MaterialTheme theme)
    {
        foreach (var child in _actions.Children)
            if (child is TextButton button) button.Foreground = theme.Colors.InversePrimary;
    }
}

public sealed class MaterialProgressBar : RangeBase
{
    public static readonly MewProperty<bool> IsIndeterminateProperty =
        MewProperty<bool>.Register<MaterialProgressBar>(nameof(IsIndeterminate), false,
            MewPropertyOptions.AffectsRender, static (self, _, _) => self.UpdateClock());
    private AnimationClock? _clock;
    private bool _mounted;

    public bool IsIndeterminate { get => GetValue(IsIndeterminateProperty); set => SetValue(IsIndeterminateProperty, value); }

    protected override Size MeasureContent(Size availableSize) => new(100, 4);
    protected override void OnRender(IGraphicsContext context)
    {
        var box = GetSnappedBorderBounds(Bounds);
        var c = MaterialThemeManager.Current.Colors;
        var track = new Rect(box.X, box.Y + (box.Height - 4) / 2, box.Width, Math.Min(box.Height, 4));
        double length = IsIndeterminate ? .28 : Maximum > Minimum ? Math.Clamp((Value - Minimum) / (Maximum - Minimum), 0, 1) : 0;
        double offset = IsIndeterminate ? (_clock?.Progress ?? .5) * (1 - length) : 0;
        context.FillRoundedRectangle(track, 2, 2, c.SecondaryContainer);
        if (length > 0) context.FillRoundedRectangle(new Rect(track.X + track.Width * offset, track.Y, track.Width * length, track.Height), 2, 2, c.Primary);
    }

    private void UpdateClock()
    {
        if (_mounted && IsVisible && IsEffectivelyEnabled && IsIndeterminate && MaterialThemeManager.MotionEnabled)
        {
            _clock ??= new AnimationClock(TimeSpan.FromMilliseconds(800)) { AutoReverse = true, RepeatCount = -1, TickCallback = _ => InvalidateVisual() };
            if (!_clock.IsRunning) _clock.Start();
        }
        else { _clock?.Stop(); _clock = null; }
        InvalidateVisual();
    }

    private void ThemeChanged(MaterialTheme _) => InvalidateVisual();
    private void MotionChanged(bool _) => UpdateClock();

    private void Mount(bool mounted)
    {
        if (_mounted != mounted)
        {
            _mounted = mounted;
            if (mounted) { MaterialThemeManager.Changed += ThemeChanged; MaterialThemeManager.MotionChanged += MotionChanged; }
            else { MaterialThemeManager.Changed -= ThemeChanged; MaterialThemeManager.MotionChanged -= MotionChanged; }
        }
        UpdateClock();
    }

    protected override void OnMewPropertyChanged(MewProperty property)
    {
        base.OnMewPropertyChanged(property);
        if (property == IsVisibleProperty || property == IsEffectivelyEnabledProperty) UpdateClock();
        if (property == ValueProperty || property == MinimumProperty || property == MaximumProperty) InvalidateVisual();
    }

    protected override void OnVisualRootChanged(Element? oldRoot, Element? newRoot)
    {
        base.OnVisualRootChanged(oldRoot, newRoot);
        Mount(newRoot != null);
    }

    protected override void OnDispose() { Mount(false); base.OnDispose(); }
}
