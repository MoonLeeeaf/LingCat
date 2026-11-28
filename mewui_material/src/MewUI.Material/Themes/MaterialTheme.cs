namespace MewUI.Material.Themes;

/// <summary>
/// A resolved Material Design 3 theme: color roles plus typography, shapes and elevation.
/// </summary>
public sealed record MaterialTheme
{
    public required string Name { get; init; }
    public required bool IsDark { get; init; }
    public required MaterialColorScheme Colors { get; init; }
    public required MaterialTypography Typography { get; init; }
    public required MaterialShapes Shapes { get; init; }
    public required MaterialElevation Elevation { get; init; }
}
