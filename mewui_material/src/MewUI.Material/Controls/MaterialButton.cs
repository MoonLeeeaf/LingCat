using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Rendering;
using MewUI.Material.Themes;

namespace MewUI.Material.Controls;

public enum MaterialButtonVariant { Filled, FilledTonal, Outlined, Text, Elevated, StandardIcon, FilledIcon, TonalIcon, OutlinedIcon, Fab, ExtendedFab }

/// <summary>Material button chrome on top of MewUI's command, content and input behavior.</summary>
public class MaterialButton : Button
{
    public static readonly MewProperty<MaterialButtonVariant> VariantProperty =
        MewProperty<MaterialButtonVariant>.Register<MaterialButton>(nameof(Variant), MaterialButtonVariant.Filled,
            MewPropertyOptions.AffectsLayout | MewPropertyOptions.AffectsRender,
            static (self, _, _) => self.ApplyTheme(MaterialThemeManager.Current));

    private readonly InteractionLayer _interaction;
    private Key? _activationKey;
    private bool _hidePointerFocusRing;

    public MaterialButton()
    {
        _interaction = new InteractionLayer(InvalidateVisual);
        ApplyTheme(MaterialThemeManager.Current);
    }

    public MaterialButtonVariant Variant { get => GetValue(VariantProperty); set => SetValue(VariantProperty, value); }

    private protected virtual (Color Fill, Color Ink, Color Outline, int Elevation) Appearance(MaterialColorScheme c) => Variant switch
    {
        MaterialButtonVariant.Filled or MaterialButtonVariant.FilledIcon => (c.Primary, c.OnPrimary, Color.Transparent, 0),
        MaterialButtonVariant.FilledTonal or MaterialButtonVariant.TonalIcon => (c.SecondaryContainer, c.OnSecondaryContainer, Color.Transparent, 0),
        MaterialButtonVariant.Outlined or MaterialButtonVariant.OutlinedIcon => (Color.Transparent, c.Primary, c.Outline, 0),
        MaterialButtonVariant.Elevated => (c.SurfaceContainerLow, c.Primary, Color.Transparent, 1),
        MaterialButtonVariant.Fab or MaterialButtonVariant.ExtendedFab => (c.PrimaryContainer, c.OnPrimaryContainer, Color.Transparent, 3),
        MaterialButtonVariant.StandardIcon => (Color.Transparent, c.OnSurfaceVariant, Color.Transparent, 0),
        _ => (Color.Transparent, c.Primary, Color.Transparent, 0),
    };

    private protected void ApplyTheme(MaterialTheme theme)
    {
        var (fill, ink, outline, _) = Appearance(theme.Colors);
        bool icon = Variant is >= MaterialButtonVariant.StandardIcon and <= MaterialButtonVariant.OutlinedIcon;
        bool fab = Variant is MaterialButtonVariant.Fab or MaterialButtonVariant.ExtendedFab;
        bool square = icon || Variant == MaterialButtonVariant.Fab;
        double size = fab ? 56 : 40;
        var sheet = new StyleSheet();
        sheet.Define<MaterialButton>(new Style(typeof(MaterialButton))
        {
            OverridesDefaultStyle = true,
            Setters =
            [
                Setter.Create(BackgroundProperty, fill), Setter.Create(ForegroundProperty, ink),
                Setter.Create(BorderBrushProperty, outline),
                Setter.Create(BorderThicknessProperty, outline.A == 0 ? 0d : 1d),
                Setter.Create(CornerRadiusProperty, theme.Shapes.Radius(fab ? MaterialShape.Large : MaterialShape.Full)),
                Setter.Create(MinHeightProperty, size), Setter.Create(MinWidthProperty, square ? size : 64),
                Setter.Create(PaddingProperty, new Thickness(square ? 0 : Variant == MaterialButtonVariant.Text ? 12 : 24, 0)),
                Setter.Create(FontSizeProperty, theme.Typography.LabelLarge.FontSize),
                Setter.Create(FontWeightProperty, theme.Typography.LabelLarge.FontWeight),
            ],
            Triggers =
            [
                new StateTrigger
                {
                    Exclude = VisualStateFlags.Enabled,
                    Setters =
                    [
                        Setter.Create(ForegroundProperty, theme.Colors.OnSurface.WithAlpha(97)),
                        Setter.Create(BackgroundProperty, fill.A == 0 ? fill : theme.Colors.OnSurface.WithAlpha(31)),
                        Setter.Create(BorderBrushProperty, outline.A == 0 ? outline : theme.Colors.OnSurface.WithAlpha(31)),
                    ],
                },
            ],
        });
        StyleSheet = sheet;
        InvalidateVisual();
    }

    protected override void OnVisualRootChanged(Element? oldRoot, Element? newRoot)
    {
        base.OnVisualRootChanged(oldRoot, newRoot);
        _interaction.SetMounted(newRoot != null);
        MaterialThemeManager.Changed -= ApplyTheme;
        if (newRoot != null)
        {
            MaterialThemeManager.Changed += ApplyTheme;
            ApplyTheme(MaterialThemeManager.Current);
            UpdateInteraction(ComputeVisualState());
        }
        else
        {
            _hidePointerFocusRing = false;
            CancelKey();
        }
    }

    protected override void OnVisualStateChanged(VisualState oldState, VisualState newState)
    {
        base.OnVisualStateChanged(oldState, newState);
        UpdateInteraction(newState);
    }

    private void UpdateInteraction(VisualState state) =>
        _interaction.SetState(state.IsEnabled, state.IsHot, state.IsFocused, state.IsPressed);

    protected override void OnRender(IGraphicsContext context)
    {
        if (Template != null) { base.OnRender(context); return; }
        var theme = MaterialThemeManager.Current;
        var box = GetSnappedBorderBounds(Bounds);
        double radius = Math.Min(CornerRadius, Math.Min(box.Width, box.Height) / 2);
        if (IsEffectivelyEnabled)
        {
            int level = Appearance(theme.Colors).Elevation;
            if (level != 0) theme.Elevation.Draw(context, box, radius, level + (IsMouseOver && !IsPressed ? 1 : 0));
        }
        DrawBackgroundAndBorder(context, box, Background, BorderBrush, BorderThickness, radius);
        if (IsEffectivelyEnabled) _interaction.Draw(context, box, radius, Foreground);
        if (IsFocused && IsEffectivelyEnabled && !_hidePointerFocusRing)
            InteractionLayer.DrawFocus(context, box, radius, Background == theme.Colors.Primary ? theme.Colors.OnPrimary : theme.Colors.Primary);
    }

    protected override void OnMouseDown(MouseEventArgs e)
    {
        base.OnMouseDown(e);
        if (e.Button == MouseButton.Left && IsEffectivelyEnabled && IsPressed)
        {
            _hidePointerFocusRing = true;
            InvalidateVisual();
            _interaction.Pulse(InteractionLayer.Pointer(this, e));
        }
    }

    protected override void OnKeyDown(KeyEventArgs e)
    {
        if (IsFocused && _hidePointerFocusRing)
        {
            _hidePointerFocusRing = false;
            InvalidateVisual();
        }
        if (e.Key is not (Key.Space or Key.Enter)) { base.OnKeyDown(e); return; }
        if (_activationKey is null && !e.IsRepeat && IsEffectivelyEnabled && IsFocused && !IsMouseCaptured)
        {
            base.OnKeyDown(e);
            if (IsPressed) { _activationKey = e.Key; _interaction.Pulse(); }
        }
        else if (_activationKey != null) e.Handled = true;
    }

    protected override void OnKeyUp(KeyEventArgs e)
    {
        if (e.Key is not (Key.Space or Key.Enter)) { base.OnKeyUp(e); return; }
        if (_activationKey != e.Key) return;
        _activationKey = null;
        base.OnKeyUp(e);
    }

    private void CancelKey()
    {
        if (_activationKey is null) return;
        _activationKey = null;
        if (!IsMouseCaptured) SetPressed(false);
    }

    protected override void OnLostFocus()
    {
        _hidePointerFocusRing = false;
        CancelKey();
        base.OnLostFocus();
    }

    protected override void OnMewPropertyChanged(MewProperty property)
    {
        base.OnMewPropertyChanged(property);
        if ((property == IsEffectivelyEnabledProperty && !IsEffectivelyEnabled) || (property == IsVisibleProperty && !IsVisible)) CancelKey();
    }

    protected override void OnDispose()
    {
        MaterialThemeManager.Changed -= ApplyTheme;
        _interaction.SetMounted(false);
        base.OnDispose();
    }

}

public sealed class FilledButton : MaterialButton;
public sealed class FilledTonalButton : MaterialButton { public FilledTonalButton() => Variant = MaterialButtonVariant.FilledTonal; }
public sealed class OutlinedButton : MaterialButton { public OutlinedButton() => Variant = MaterialButtonVariant.Outlined; }
public sealed class TextButton : MaterialButton { public TextButton() => Variant = MaterialButtonVariant.Text; }
public sealed class ElevatedButton : MaterialButton { public ElevatedButton() => Variant = MaterialButtonVariant.Elevated; }
public sealed class IconButton : MaterialButton { public IconButton() => Variant = MaterialButtonVariant.StandardIcon; }
public sealed class FilledIconButton : MaterialButton { public FilledIconButton() => Variant = MaterialButtonVariant.FilledIcon; }
public sealed class FilledTonalIconButton : MaterialButton { public FilledTonalIconButton() => Variant = MaterialButtonVariant.TonalIcon; }
public sealed class OutlinedIconButton : MaterialButton { public OutlinedIconButton() => Variant = MaterialButtonVariant.OutlinedIcon; }
public sealed class Fab : MaterialButton { public Fab() => Variant = MaterialButtonVariant.Fab; }
public sealed class ExtendedFab : MaterialButton { public ExtendedFab() => Variant = MaterialButtonVariant.ExtendedFab; }
