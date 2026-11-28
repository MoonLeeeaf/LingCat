using Aprillz.MewUI;

namespace MewUI.Material.Themes;

/// <summary>
/// One entry of the Material Design 3 type scale.
/// </summary>
public sealed record MaterialTextStyle
{
    public string? FontFamily { get; init; }
    public required double FontSize { get; init; }
    public required FontWeight FontWeight { get; init; }
    public required double LineHeight { get; init; }
    public required double LetterSpacing { get; init; }
}

/// <summary>
/// Material Design 3 typography tokens.
/// </summary>
public sealed record MaterialTypography
{
    public required MaterialTextStyle DisplayLarge { get; init; }
    public required MaterialTextStyle DisplayMedium { get; init; }
    public required MaterialTextStyle DisplaySmall { get; init; }

    public required MaterialTextStyle HeadlineLarge { get; init; }
    public required MaterialTextStyle HeadlineMedium { get; init; }
    public required MaterialTextStyle HeadlineSmall { get; init; }

    public required MaterialTextStyle TitleLarge { get; init; }
    public required MaterialTextStyle TitleMedium { get; init; }
    public required MaterialTextStyle TitleSmall { get; init; }

    public required MaterialTextStyle BodyLarge { get; init; }
    public required MaterialTextStyle BodyMedium { get; init; }
    public required MaterialTextStyle BodySmall { get; init; }

    public required MaterialTextStyle LabelLarge { get; init; }
    public required MaterialTextStyle LabelMedium { get; init; }
    public required MaterialTextStyle LabelSmall { get; init; }

    /// <summary>
    /// The baseline Material 3 type scale. A null font family follows the MewUI/system UI font.
    /// </summary>
    public static MaterialTypography Default { get; } = new()
    {
        DisplayLarge = Style(57, FontWeight.Normal, 64, -0.25),
        DisplayMedium = Style(45, FontWeight.Normal, 52, 0),
        DisplaySmall = Style(36, FontWeight.Normal, 44, 0),

        HeadlineLarge = Style(32, FontWeight.Normal, 40, 0),
        HeadlineMedium = Style(28, FontWeight.Normal, 36, 0),
        HeadlineSmall = Style(24, FontWeight.Normal, 32, 0),

        TitleLarge = Style(22, FontWeight.Normal, 28, 0),
        TitleMedium = Style(16, FontWeight.Medium, 24, 0.15),
        TitleSmall = Style(14, FontWeight.Medium, 20, 0.1),

        BodyLarge = Style(16, FontWeight.Normal, 24, 0.5),
        BodyMedium = Style(14, FontWeight.Normal, 20, 0.25),
        BodySmall = Style(12, FontWeight.Normal, 16, 0.4),

        LabelLarge = Style(14, FontWeight.Medium, 20, 0.1),
        LabelMedium = Style(12, FontWeight.Medium, 16, 0.5),
        LabelSmall = Style(11, FontWeight.Medium, 16, 0.5),
    };

    private static MaterialTextStyle Style(
        double size,
        FontWeight weight,
        double lineHeight,
        double letterSpacing)
    {
        return new MaterialTextStyle
        {
            FontSize = size,
            FontWeight = weight,
            LineHeight = lineHeight,
            LetterSpacing = letterSpacing,
        };
    }
}
