using Aprillz.MewUI;

namespace MewUI.Material.Themes;

/// <summary>
/// Material Design 3 semantic color roles.
/// </summary>
public sealed record MaterialColorScheme
{
    public required Color Primary { get; init; }
    public required Color OnPrimary { get; init; }
    public required Color PrimaryContainer { get; init; }
    public required Color OnPrimaryContainer { get; init; }
    public required Color InversePrimary { get; init; }

    public required Color Secondary { get; init; }
    public required Color OnSecondary { get; init; }
    public required Color SecondaryContainer { get; init; }
    public required Color OnSecondaryContainer { get; init; }

    public required Color Tertiary { get; init; }
    public required Color OnTertiary { get; init; }
    public required Color TertiaryContainer { get; init; }
    public required Color OnTertiaryContainer { get; init; }

    public required Color PrimaryFixed { get; init; }
    public required Color PrimaryFixedDim { get; init; }
    public required Color OnPrimaryFixed { get; init; }
    public required Color OnPrimaryFixedVariant { get; init; }
    public required Color SecondaryFixed { get; init; }
    public required Color SecondaryFixedDim { get; init; }
    public required Color OnSecondaryFixed { get; init; }
    public required Color OnSecondaryFixedVariant { get; init; }
    public required Color TertiaryFixed { get; init; }
    public required Color TertiaryFixedDim { get; init; }
    public required Color OnTertiaryFixed { get; init; }
    public required Color OnTertiaryFixedVariant { get; init; }

    public required Color Error { get; init; }
    public required Color OnError { get; init; }
    public required Color ErrorContainer { get; init; }
    public required Color OnErrorContainer { get; init; }

    public required Color Background { get; init; }
    public required Color OnBackground { get; init; }

    public required Color Surface { get; init; }
    public required Color OnSurface { get; init; }
    public required Color SurfaceDim { get; init; }
    public required Color SurfaceBright { get; init; }
    public required Color SurfaceContainerLowest { get; init; }
    public required Color SurfaceContainerLow { get; init; }
    public required Color SurfaceContainer { get; init; }
    public required Color SurfaceContainerHigh { get; init; }
    public required Color SurfaceContainerHighest { get; init; }
    public required Color SurfaceVariant { get; init; }
    public required Color OnSurfaceVariant { get; init; }

    public required Color Outline { get; init; }
    public required Color OutlineVariant { get; init; }

    public required Color InverseSurface { get; init; }
    public required Color InverseOnSurface { get; init; }

    public required Color Scrim { get; init; }
    public required Color Shadow { get; init; }

    /// <summary>
    /// The surface tint used by elevated surfaces. M3 defines this as the primary role.
    /// </summary>
    public Color SurfaceTint => Primary;
}
