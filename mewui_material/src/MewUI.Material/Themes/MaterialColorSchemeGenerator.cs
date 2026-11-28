using Aprillz.MewUI;
using MaterialColorUtilities.Palettes;
using MaterialColorUtilities.Schemes;

namespace MewUI.Material.Themes;

/// <summary>
/// Palette generation style, mirroring the Android 13 Material color styles.
/// </summary>
public enum MaterialColorStyle
{
    TonalSpot,
    Vibrant,
    Expressive,
    Rainbow,
    FruitSalad,
    Content,
    Spritz,
}

/// <summary>
/// Generates Material Design 3 color schemes from a seed color using HCT tonal palettes.
/// </summary>
public static class ColorSchemeGenerator
{
    public static MaterialColorScheme Generate(
        Color seed,
        bool isDark,
        MaterialColorStyle style = MaterialColorStyle.TonalSpot)
    {
        var core = CorePalette.Of(ToArgb(seed), ToLibraryStyle(style));
        Scheme<uint> scheme = isDark
            ? new DarkSchemeMapper().Map(core)
            : new LightSchemeMapper().Map(core);

        return new MaterialColorScheme
        {
            Primary = FromArgb(scheme.Primary),
            OnPrimary = FromArgb(scheme.OnPrimary),
            PrimaryContainer = FromArgb(scheme.PrimaryContainer),
            OnPrimaryContainer = FromArgb(scheme.OnPrimaryContainer),
            InversePrimary = FromArgb(scheme.InversePrimary),

            Secondary = FromArgb(scheme.Secondary),
            OnSecondary = FromArgb(scheme.OnSecondary),
            SecondaryContainer = FromArgb(scheme.SecondaryContainer),
            OnSecondaryContainer = FromArgb(scheme.OnSecondaryContainer),

            Tertiary = FromArgb(scheme.Tertiary),
            OnTertiary = FromArgb(scheme.OnTertiary),
            TertiaryContainer = FromArgb(scheme.TertiaryContainer),
            OnTertiaryContainer = FromArgb(scheme.OnTertiaryContainer),

            PrimaryFixed = FromArgb(core.Primary[90]),
            PrimaryFixedDim = FromArgb(core.Primary[80]),
            OnPrimaryFixed = FromArgb(core.Primary[10]),
            OnPrimaryFixedVariant = FromArgb(core.Primary[30]),
            SecondaryFixed = FromArgb(core.Secondary[90]),
            SecondaryFixedDim = FromArgb(core.Secondary[80]),
            OnSecondaryFixed = FromArgb(core.Secondary[10]),
            OnSecondaryFixedVariant = FromArgb(core.Secondary[30]),
            TertiaryFixed = FromArgb(core.Tertiary[90]),
            TertiaryFixedDim = FromArgb(core.Tertiary[80]),
            OnTertiaryFixed = FromArgb(core.Tertiary[10]),
            OnTertiaryFixedVariant = FromArgb(core.Tertiary[30]),

            Error = FromArgb(scheme.Error),
            OnError = FromArgb(scheme.OnError),
            ErrorContainer = FromArgb(scheme.ErrorContainer),
            OnErrorContainer = FromArgb(scheme.OnErrorContainer),

            Background = FromArgb(scheme.Background),
            OnBackground = FromArgb(scheme.OnBackground),

            Surface = FromArgb(scheme.Surface),
            OnSurface = FromArgb(scheme.OnSurface),
            SurfaceDim = FromArgb(scheme.SurfaceDim),
            SurfaceBright = FromArgb(scheme.SurfaceBright),
            SurfaceContainerLowest = FromArgb(scheme.SurfaceContainerLowest),
            SurfaceContainerLow = FromArgb(scheme.SurfaceContainerLow),
            SurfaceContainer = FromArgb(scheme.SurfaceContainer),
            SurfaceContainerHigh = FromArgb(scheme.SurfaceContainerHigh),
            SurfaceContainerHighest = FromArgb(scheme.SurfaceContainerHighest),
            SurfaceVariant = FromArgb(scheme.SurfaceVariant),
            OnSurfaceVariant = FromArgb(scheme.OnSurfaceVariant),

            Outline = FromArgb(scheme.Outline),
            OutlineVariant = FromArgb(scheme.OutlineVariant),

            InverseSurface = FromArgb(scheme.InverseSurface),
            InverseOnSurface = FromArgb(scheme.InverseOnSurface),

            Scrim = Color.FromRgb(0, 0, 0),
            Shadow = FromArgb(scheme.Shadow),
        };
    }

    public static uint ToArgb(Color color)
        => ((uint)color.A << 24)
         | ((uint)color.R << 16)
         | ((uint)color.G << 8)
         | color.B;

    public static Color FromArgb(uint argb)
        => Color.FromArgb(
            (byte)(argb >> 24),
            (byte)(argb >> 16),
            (byte)(argb >> 8),
            (byte)argb);

    private static MaterialColorUtilities.Palettes.Style ToLibraryStyle(MaterialColorStyle style) => style switch
    {
        MaterialColorStyle.Vibrant => MaterialColorUtilities.Palettes.Style.Vibrant,
        MaterialColorStyle.Expressive => MaterialColorUtilities.Palettes.Style.Expressive,
        MaterialColorStyle.Rainbow => MaterialColorUtilities.Palettes.Style.Rainbow,
        MaterialColorStyle.FruitSalad => MaterialColorUtilities.Palettes.Style.FruitSalad,
        MaterialColorStyle.Content => MaterialColorUtilities.Palettes.Style.Content,
        MaterialColorStyle.Spritz => MaterialColorUtilities.Palettes.Style.Spritz,
        _ => MaterialColorUtilities.Palettes.Style.TonalSpot,
    };
}
