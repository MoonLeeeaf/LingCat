using Aprillz.MewUI;
using Aprillz.MewUI.Rendering;

namespace MewUI.Material.Themes;

/// <summary>
/// A single elevation level expressed with MewUI's <see cref="IGraphicsContext.DrawBoxShadow"/>.
/// </summary>
public sealed record MaterialElevationToken(double BlurRadius, double OffsetY, double Opacity)
{
    public Color ShadowColor => Color.FromArgb(
        (byte)Math.Clamp(Math.Round(Opacity * 255), 0, 255), 0, 0, 0);
}

/// <summary>
/// Material Design 3 elevation levels.
/// </summary>
public sealed record MaterialElevation
{
    public required MaterialElevationToken Level0 { get; init; }
    public required MaterialElevationToken Level1 { get; init; }
    public required MaterialElevationToken Level2 { get; init; }
    public required MaterialElevationToken Level3 { get; init; }
    public required MaterialElevationToken Level4 { get; init; }
    public required MaterialElevationToken Level5 { get; init; }

    public static MaterialElevation Default { get; } = new()
    {
        Level0 = new(0, 0, 0),
        Level1 = new(2, 1, 0.28),
        Level2 = new(3, 1.5, 0.28),
        Level3 = new(8, 3, 0.28),
        Level4 = new(12, 4, 0.26),
        Level5 = new(16, 5, 0.24),
    };

    public MaterialElevationToken Get(int level) => level switch
    {
        <= 0 => Level0,
        1 => Level1,
        2 => Level2,
        3 => Level3,
        4 => Level4,
        _ => Level5,
    };

    public void Draw(
        IGraphicsContext context,
        Rect bounds,
        double cornerRadius,
        int level)
    {
        var token = Get(level);
        if (token.BlurRadius <= 0 || token.Opacity <= 0) return;

        context.DrawBoxShadow(
            bounds,
            cornerRadius,
            token.BlurRadius,
            token.ShadowColor,
            offsetY: token.OffsetY);
    }
}
