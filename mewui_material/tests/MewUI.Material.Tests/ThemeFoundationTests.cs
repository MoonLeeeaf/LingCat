using Aprillz.MewUI;
using MewUI.Material.Themes;

namespace MewUI.Material.Tests;

public class ThemeFoundationTests
{
    private static readonly Color Seed = Color.FromRgb(0x67, 0x50, 0xA4);

    [Fact]
    public void GeneratesLightAndDarkSchemes()
    {
        var light = ColorSchemeGenerator.Generate(Seed, isDark: false);
        var dark = ColorSchemeGenerator.Generate(Seed, isDark: true);

        Assert.NotEqual(light.Surface, dark.Surface);
        Assert.NotEqual(light.Primary, dark.Primary);
        Assert.True(Luminance(light.Surface) > Luminance(dark.Surface));
        Assert.True(Luminance(light.OnSurface) < Luminance(light.Surface));
        Assert.True(Luminance(dark.OnSurface) > Luminance(dark.Surface));
    }

    [Fact]
    public void AllRequiredRolesAreOpaque()
    {
        var scheme = ColorSchemeGenerator.Generate(Seed, isDark: false);

        var roles = new[]
        {
            scheme.Primary, scheme.OnPrimary,
            scheme.PrimaryContainer, scheme.OnPrimaryContainer,
            scheme.InversePrimary,
            scheme.Secondary, scheme.OnSecondary,
            scheme.SecondaryContainer, scheme.OnSecondaryContainer,
            scheme.Tertiary, scheme.OnTertiary,
            scheme.TertiaryContainer, scheme.OnTertiaryContainer,
            scheme.Error, scheme.OnError,
            scheme.ErrorContainer, scheme.OnErrorContainer,
            scheme.Background, scheme.OnBackground,
            scheme.Surface, scheme.OnSurface,
            scheme.SurfaceDim, scheme.SurfaceBright,
            scheme.SurfaceContainerLowest, scheme.SurfaceContainerLow,
            scheme.SurfaceContainer, scheme.SurfaceContainerHigh,
            scheme.SurfaceContainerHighest,
            scheme.SurfaceVariant, scheme.OnSurfaceVariant,
            scheme.Outline, scheme.OutlineVariant,
            scheme.InverseSurface, scheme.InverseOnSurface,
            scheme.Scrim, scheme.Shadow,
        };

        Assert.All(roles, color => Assert.Equal(byte.MaxValue, color.A));
    }

    [Fact]
    public void SeedChangesPrimaryHue()
    {
        var blue = ColorSchemeGenerator.Generate(Color.FromRgb(0x00, 0x6A, 0xAA), false);
        var orange = ColorSchemeGenerator.Generate(Color.FromRgb(0x8B, 0x50, 0x00), false);

        Assert.NotEqual(blue.Primary, orange.Primary);
    }

    [Theory]
    [InlineData(MaterialColorStyle.TonalSpot)]
    [InlineData(MaterialColorStyle.Vibrant)]
    public void FixedRolesStayTheSameAcrossLightAndDark(MaterialColorStyle style)
    {
        var light = ColorSchemeGenerator.Generate(Seed, false, style);
        var dark = ColorSchemeGenerator.Generate(Seed, true, style);
        Assert.Equal(light.PrimaryFixed, dark.PrimaryFixed);
        Assert.Equal(light.OnPrimaryFixedVariant, dark.OnPrimaryFixedVariant);
        Assert.Equal(light.SecondaryFixedDim, dark.SecondaryFixedDim);
        Assert.Equal(light.OnSecondaryFixed, dark.OnSecondaryFixed);
        Assert.Equal(light.TertiaryFixed, dark.TertiaryFixed);
        Assert.Equal(light.OnTertiaryFixed, dark.OnTertiaryFixed);
        Assert.True(Luminance(light.PrimaryFixed) > Luminance(light.OnPrimaryFixed));
    }

    [Fact]
    public void TypographyContainsTheFullM3Scale()
    {
        var typography = MaterialTypography.Default;

        Assert.Equal(57, typography.DisplayLarge.FontSize);
        Assert.Equal(32, typography.HeadlineSmall.LineHeight);
        Assert.Equal(FontWeight.Medium, typography.LabelLarge.FontWeight);
        Assert.Equal(11, typography.LabelSmall.FontSize);
    }

    [Fact]
    public void ShapeAndElevationTokensAreOrdered()
    {
        var shapes = MaterialShapes.Default;
        var elevation = MaterialElevation.Default;

        Assert.Equal(0, shapes.Radius(MaterialShape.None));
        Assert.True(shapes.Radius(MaterialShape.ExtraSmall) < shapes.Radius(MaterialShape.Small));
        Assert.True(shapes.Radius(MaterialShape.Large) < shapes.Radius(MaterialShape.ExtraLarge));
        Assert.Equal(9999, shapes.Radius(MaterialShape.Full));

        Assert.Equal(0, elevation.Level0.BlurRadius);
        Assert.True(elevation.Level5.BlurRadius > elevation.Level1.BlurRadius);
    }

    private static double Luminance(Color color)
        => 0.2126 * color.R + 0.7152 * color.G + 0.0722 * color.B;
}
