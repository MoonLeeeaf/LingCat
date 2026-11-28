using Aprillz.MewUI;

namespace MewUI.Material.Themes;

/// <summary>
/// Material Design 3 shape scale.
/// </summary>
public enum MaterialShape
{
    None,
    ExtraSmall,
    Small,
    Medium,
    Large,
    ExtraLarge,
    Full,
}

/// <summary>
/// Corner radius tokens of the Material Design 3 shape scale.
/// </summary>
public sealed record MaterialShapes
{
    public double None { get; init; }
    public double ExtraSmall { get; init; }
    public double Small { get; init; }
    public double Medium { get; init; }
    public double Large { get; init; }
    public double ExtraLarge { get; init; }
    public double Full { get; init; }

    public static MaterialShapes Default { get; } = new()
    {
        None = 0,
        ExtraSmall = 4,
        Small = 8,
        Medium = 12,
        Large = 16,
        ExtraLarge = 28,
        Full = 9999,
    };

    public double Radius(MaterialShape shape) => shape switch
    {
        MaterialShape.None => None,
        MaterialShape.ExtraSmall => ExtraSmall,
        MaterialShape.Small => Small,
        MaterialShape.Medium => Medium,
        MaterialShape.Large => Large,
        MaterialShape.ExtraLarge => ExtraLarge,
        MaterialShape.Full => Full,
        _ => Medium,
    };

    public CornerRadius Corner(MaterialShape shape) => new(Radius(shape));
}
