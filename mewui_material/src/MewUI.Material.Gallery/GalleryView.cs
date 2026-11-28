using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using MewUI.Material.Controls;
using MewUI.Material.Themes;

namespace MewUI.Material.Gallery;

internal sealed partial class GalleryView
{
    private readonly TokenPage _tokens = new();
    private readonly ScrollViewer _scroll;
    private readonly StackPanel _examples;

    public GalleryView()
    {
        _examples = BuildExamples();
        _scroll = new ScrollViewer().VerticalScroll(ScrollMode.Auto).HorizontalScroll(ScrollMode.Disabled).Content(_examples);
        var pages = new MaterialNavigation(MaterialNavigationLayout.Tabs);
        pages.AddDestination("Components");
        pages.AddDestination("Theme tokens");
        pages.SelectionChanged += index =>
        {
            _scroll.Content = index == 1 ? _tokens : _examples;
            _scroll.SetScrollOffsets(0, 0);
        };
        Root = new MaterialSurface
        {
            Padding = new Thickness(0),
            Content = new Grid().Rows("Auto,Auto,*").Children(
                BuildTopBar().GridPosition(0, 0), pages.GridPosition(1, 0), _scroll.GridPosition(2, 0)),
        };
    }

    public MaterialSurface Root { get; }

    private sealed class TokenPage : MaterialContentControl
    {
        protected override void OnMaterialThemeChanged(MaterialTheme theme) => Content = BuildContent(theme);
    }

    private static MaterialSurface BuildTopBar()
    {
        var toggle = ActionButton(new FilledButton(), "Light / Dark", () => MaterialThemeManager.SetMode(
            MaterialThemeManager.Current.IsDark ? ThemeVariant.Light : ThemeVariant.Dark));
        var motion = new MaterialCheckBox { Content = new Label().Text("Reduce motion"), IsChecked = !MaterialThemeManager.MotionEnabled };
        motion.CheckedChanged += value => MaterialThemeManager.SetMotionEnabled(value != true);
        var actions = new WrapPanel().Spacing(8).Children(
            SeedButton("Purple", Color.FromRgb(0x67, 0x50, 0xA4)), SeedButton("Teal", Color.FromRgb(0, 0x6A, 0x6A)),
            SeedButton("Amber", Color.FromRgb(0x8B, 0x50, 0)),
            ActionButton(new TextButton(), "System", () => MaterialThemeManager.SetMode(ThemeVariant.System)), toggle, motion);

        return new MaterialSurface
        {
            Variant = MaterialSurfaceVariant.Navigation,
            Padding = new Thickness(20, 10),
            Content = new StackPanel().Spacing(6).Children(new Label().Text("MewUI.Material Gallery").FontSize(20).SemiBold(), actions),
        };
    }

    private static MaterialButton SeedButton(string label, Color seed) =>
        ActionButton(new FilledTonalButton(), label, () => MaterialThemeManager.SetSeed(seed));

    private static StackPanel BuildContent(MaterialTheme theme)
    {
        var colors = theme.Colors;

        var content = new StackPanel()
            .Spacing(22)
            .Padding(28, 22, 28, 32)
            .Children(
                SectionTitle("Color roles", colors),
                BuildColorRoles(colors),
                SectionTitle("Typography", colors),
                BuildTypography(theme),
                SectionTitle("Shape scale", colors),
                BuildShapes(theme),
                SectionTitle("Elevation", colors),
                BuildElevation(theme));

        return content;
    }

    private static Label SectionTitle(string text, MaterialColorScheme colors)
    {
        return new Label()
            .Text(text)
            .FontSize(17)
            .SemiBold()
            .Foreground(colors.OnSurface);
    }

    private static WrapPanel BuildColorRoles(MaterialColorScheme colors)
    {
        var panel = new WrapPanel()
            .Spacing(10)
            .ItemWidth(210)
            .ItemHeight(74);

        AddColor(panel, "Primary", colors.Primary, colors.OnPrimary);
        AddColor(panel, "Primary container", colors.PrimaryContainer, colors.OnPrimaryContainer);
        AddColor(panel, "Secondary", colors.Secondary, colors.OnSecondary);
        AddColor(panel, "Secondary container", colors.SecondaryContainer, colors.OnSecondaryContainer);
        AddColor(panel, "Tertiary", colors.Tertiary, colors.OnTertiary);
        AddColor(panel, "Tertiary container", colors.TertiaryContainer, colors.OnTertiaryContainer);
        AddColor(panel, "Primary fixed", colors.PrimaryFixed, colors.OnPrimaryFixed);
        AddColor(panel, "Primary fixed dim", colors.PrimaryFixedDim, colors.OnPrimaryFixedVariant);
        AddColor(panel, "Secondary fixed", colors.SecondaryFixed, colors.OnSecondaryFixed);
        AddColor(panel, "Secondary fixed dim", colors.SecondaryFixedDim, colors.OnSecondaryFixedVariant);
        AddColor(panel, "Tertiary fixed", colors.TertiaryFixed, colors.OnTertiaryFixed);
        AddColor(panel, "Tertiary fixed dim", colors.TertiaryFixedDim, colors.OnTertiaryFixedVariant);
        AddColor(panel, "Error", colors.Error, colors.OnError);
        AddColor(panel, "Error container", colors.ErrorContainer, colors.OnErrorContainer);
        AddColor(panel, "Surface", colors.Surface, colors.OnSurface);
        AddColor(panel, "Surface container", colors.SurfaceContainer, colors.OnSurface);
        AddColor(panel, "Surface high", colors.SurfaceContainerHigh, colors.OnSurface);
        AddColor(panel, "Surface variant", colors.SurfaceVariant, colors.OnSurfaceVariant);
        AddColor(panel, "Inverse surface", colors.InverseSurface, colors.InverseOnSurface);
        AddColor(panel, "Outline", colors.Outline, colors.Surface);
        AddColor(panel, "Outline variant", colors.OutlineVariant, colors.Surface);
        AddColor(panel, "Scrim", colors.Scrim, Color.FromRgb(255, 255, 255));

        return panel;
    }

    private static void AddColor(
        WrapPanel panel,
        string name,
        Color background,
        Color foreground)
    {
        var swatch = new Border()
            .Height(50)
            .CornerRadius(10)
            .Background(background)
            .BorderBrush(Color.FromArgb(40, 128, 128, 128))
            .BorderThickness(1)
            .Padding(9, 5)
            .Child(new StackPanel()
                .Spacing(1)
                .Children(
                    new Label()
                        .Text(name)
                        .FontSize(10)
                        .SemiBold()
                        .Foreground(foreground),
                    new Label()
                        .Text(Hex(background))
                        .FontSize(9)
                        .Foreground(foreground.WithAlpha(190))));

        panel.Add(swatch);
    }

    private static WrapPanel BuildTypography(MaterialTheme theme)
    {
        var colors = theme.Colors;
        var panel = new WrapPanel()
            .Spacing(14)
            .ItemWidth(360)
            .ItemHeight(112);

        AddType(panel, colors, "Display Large", theme.Typography.DisplayLarge);
        AddType(panel, colors, "Headline Medium", theme.Typography.HeadlineMedium);
        AddType(panel, colors, "Title Large", theme.Typography.TitleLarge);
        AddType(panel, colors, "Body Large", theme.Typography.BodyLarge);
        AddType(panel, colors, "Label Large", theme.Typography.LabelLarge);

        return panel;
    }

    private static void AddType(
        WrapPanel panel,
        MaterialColorScheme colors,
        string name,
        MaterialTextStyle style)
    {
        panel.Add(new StackPanel()
            .Spacing(2)
            .Children(
                new Label()
                    .Text(name)
                    .FontSize(style.FontSize)
                    .FontWeight(style.FontWeight)
                    .Foreground(colors.OnSurface),
                new Label()
                    .Text($"{style.FontSize:0} / {style.LineHeight:0} / {style.LetterSpacing:0.##}")
                    .FontSize(10)
                    .Foreground(colors.OnSurfaceVariant)));
    }

    private static WrapPanel BuildShapes(MaterialTheme theme)
    {
        var colors = theme.Colors;
        var panel = new WrapPanel()
            .Spacing(12)
            .ItemWidth(120)
            .ItemHeight(74);

        foreach (var shape in Enum.GetValues<MaterialShape>())
        {
            var radius = theme.Shapes.Radius(shape);
            panel.Add(new StackPanel()
                .Spacing(5)
                .Children(
                    new Border()
                        .Height(42)
                        .CornerRadius(Math.Min(radius, 21))
                        .Background(colors.SecondaryContainer)
                        .BorderBrush(colors.OutlineVariant)
                        .BorderThickness(1),
                    new Label()
                        .Text($"{shape} · {(radius >= 9999 ? "Full" : radius.ToString("0"))}")
                        .FontSize(9)
                        .Foreground(colors.OnSurfaceVariant)));
        }

        return panel;
    }

    private static WrapPanel BuildElevation(MaterialTheme theme)
    {
        var colors = theme.Colors;
        var panel = new WrapPanel()
            .Spacing(16)
            .ItemWidth(140)
            .ItemHeight(108);

        for (var level = 0; level <= 5; level++)
        {
            var token = theme.Elevation.Get(level);
            panel.Add(new StackPanel()
                .Spacing(6)
                .Children(
                    new ElevationSwatch(theme, level),
                    new Label()
                        .Text($"Level {level} · blur {token.BlurRadius:0}")
                        .FontSize(9)
                        .Foreground(colors.OnSurfaceVariant)));
        }

        return panel;
    }

    private static string Hex(Color color)
        => $"#{color.R:X2}{color.G:X2}{color.B:X2}";

    private sealed class ElevationSwatch : Control
    {
        private readonly MaterialTheme _theme;
        private readonly int _level;

        public ElevationSwatch(MaterialTheme theme, int level)
        {
            _theme = theme;
            _level = level;
            Width = 112;
            Height = 68;
            IsHitTestVisible = false;
        }

        protected override Size MeasureContent(Size availableSize)
            => new(112, 68);

        protected override void OnRender(Aprillz.MewUI.Rendering.IGraphicsContext context)
        {
            var bounds = Bounds;
            _theme.Elevation.Draw(context, bounds, 14, _level);
            context.FillRoundedRectangle(bounds, 14, 14, _theme.Colors.SurfaceContainerLow);
            context.DrawRoundedRectangle(
                bounds,
                14,
                14,
                _theme.Colors.OutlineVariant,
                1);
        }
    }
}
