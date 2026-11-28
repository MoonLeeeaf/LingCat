using Aprillz.MewUI;
using MewUI.Material.Themes;

namespace LingCat_Desktop.Ui;

/// <summary>Material roles for LingCat-specific visuals such as message bubbles.</summary>
internal static class UiTheme
{
    public static readonly Color Seed = Color.FromRgb(0, 0x6A, 0x6A);
    private static MaterialColorScheme Colors => MaterialThemeManager.Current.Colors;
    public static MaterialTypography Type => MaterialThemeManager.Current.Typography;
    public static MaterialShapes Shape => MaterialThemeManager.Current.Shapes;

    public static Color WindowBackground => Colors.Surface;
    public static Color Accent => Colors.Primary;
    public static Color AccentText => Colors.Primary;
    public static Color OnAccent => Colors.OnPrimary;
    public static Color OnSelection => Colors.OnSecondaryContainer;
    public static Color Text => Colors.OnSurface;
    public static Color TextSecondary => Colors.OnSurfaceVariant;
    public static Color TextMuted => Colors.OnSurfaceVariant;
    public static Color BubbleMine => Colors.PrimaryContainer;
    public static Color OnBubbleMine => Colors.OnPrimaryContainer;
    public static Color BubbleOther => Colors.SurfaceContainerHigh;
    public static Color BubbleSystem => Colors.SurfaceContainer;
    public static Color SurfaceActive => Colors.SecondaryContainer;
    public static Color Danger => Colors.Error;
    public static Color OnAvatar => Color.FromRgb(255, 255, 255);

    public static Color Rgb(uint rgb) => Color.FromRgb((byte)(rgb >> 16), (byte)(rgb >> 8), (byte)rgb);
}
