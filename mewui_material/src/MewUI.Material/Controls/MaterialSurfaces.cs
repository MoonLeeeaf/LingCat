using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Rendering;
using MewUI.Material.Themes;

namespace MewUI.Material.Controls;

public enum MaterialSurfaceVariant { Surface, FilledCard, OutlinedCard, ElevatedCard, Dialog, Snackbar, Navigation }

public class MaterialSurface : MaterialContentControl
{
    public static readonly MewProperty<MaterialSurfaceVariant> VariantProperty =
        MewProperty<MaterialSurfaceVariant>.Register<MaterialSurface>(nameof(Variant), MaterialSurfaceVariant.Surface,
            MewPropertyOptions.AffectsRender, static (self, _, _) => self.OnMaterialThemeChanged(self.MaterialTheme));

    static MaterialSurface() => PaddingProperty.OverrideDefaultValue<MaterialSurface>(new Thickness(16));

    public MaterialSurface() => ApplyTheme(MaterialTheme);

    public MaterialSurfaceVariant Variant { get => GetValue(VariantProperty); set => SetValue(VariantProperty, value); }

    protected override void OnMaterialThemeChanged(MaterialTheme theme)
    {
        ApplyTheme(theme);
        base.OnMaterialThemeChanged(theme);
    }

    private void ApplyTheme(MaterialTheme theme)
    {
        var c = theme.Colors;
        var sheet = new StyleSheet();
        sheet.Define<MaterialSurface>(new Style(typeof(MaterialSurface))
        {
            Setters =
            [
                Setter.Create(ForegroundProperty, Variant == MaterialSurfaceVariant.Snackbar ? c.InverseOnSurface : c.OnSurface),
                Setter.Create(BackgroundProperty, Variant switch
                {
                    MaterialSurfaceVariant.FilledCard or MaterialSurfaceVariant.Navigation => c.SurfaceContainer,
                    MaterialSurfaceVariant.ElevatedCard => c.SurfaceContainerLow,
                    MaterialSurfaceVariant.Dialog => c.SurfaceContainerHigh,
                    MaterialSurfaceVariant.Snackbar => c.InverseSurface,
                    _ => c.Surface,
                }),
                Setter.Create(CornerRadiusProperty, Variant switch
                {
                    MaterialSurfaceVariant.Dialog => theme.Shapes.ExtraLarge,
                    MaterialSurfaceVariant.Surface or MaterialSurfaceVariant.Navigation => theme.Shapes.None,
                    MaterialSurfaceVariant.Snackbar => theme.Shapes.ExtraSmall,
                    _ => theme.Shapes.Medium,
                }),
                Setter.Create(BorderThicknessProperty, Variant == MaterialSurfaceVariant.OutlinedCard ? 1d : 0d),
                Setter.Create(BorderBrushProperty, c.OutlineVariant),
            ],
        });
        StyleSheet = sheet;
    }

    protected override void OnRender(IGraphicsContext context)
    {
        if (Template != null) { base.OnRender(context); return; }
        var box = GetSnappedBorderBounds(Bounds);
        double radius = Math.Min(CornerRadius, Math.Min(box.Width, box.Height) / 2);
        int elevation = Variant switch { MaterialSurfaceVariant.ElevatedCard => 1, MaterialSurfaceVariant.Snackbar => 3, _ => 0 };
        MaterialTheme.Elevation.Draw(context, box, radius, elevation);
        DrawBackgroundAndBorder(context, box, Background, BorderBrush, BorderThickness, radius);
    }
}

public sealed class MaterialDivider : MaterialControl
{
    public static readonly MewProperty<Orientation> OrientationProperty =
        MewProperty<Orientation>.Register<MaterialDivider>(nameof(Orientation), Orientation.Horizontal, MewPropertyOptions.AffectsLayout);

    public Orientation Orientation { get => GetValue(OrientationProperty); set => SetValue(OrientationProperty, value); }

    protected override Size MeasureContent(Size availableSize) => Orientation == Orientation.Vertical ? new(1, 0) : new(0, 1);
    protected override void OnRender(IGraphicsContext context) => context.FillRectangle(GetSnappedBorderBounds(Bounds), MaterialTheme.Colors.OutlineVariant);
}
