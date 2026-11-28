using Aprillz.MewUI;

namespace MewUI.Material.Themes;

/// <summary>
/// Owns the active Material theme and keeps it in sync with MewUI's light/dark mode.
/// </summary>
public static class MaterialThemeManager
{
    public static readonly Color DefaultSeed = Color.FromRgb(0x67, 0x50, 0xA4);

    private static Color _seed = DefaultSeed;
    private static MaterialColorStyle _style = MaterialColorStyle.TonalSpot;
    private static ThemeVariant _mode = ThemeVariant.System;
    private static bool _isDark;
    private static WeakReference<Application>? _attached;
    private static bool _syncing;
    private static bool _motionEnabled = true;
    private static MaterialTheme _current = BuildTheme(false);

    /// <summary>Gets the active Material theme.</summary>
    public static MaterialTheme Current => _current;

    /// <summary>Gets the current theme mode.</summary>
    public static ThemeVariant Mode => _mode;

    /// <summary>Gets the current seed color.</summary>
    public static Color SeedColor => _seed;

    /// <summary>Gets the current tonal palette style.</summary>
    public static MaterialColorStyle Style => _style;

    /// <summary>Whether Material animations are enabled.</summary>
    public static bool MotionEnabled => _motionEnabled;

    /// <summary>Raised after the active Material theme changes.</summary>
    public static event Action<MaterialTheme>? Changed;

    /// <summary>Raised when motion is enabled or disabled.</summary>
    public static event Action<bool>? MotionChanged;

    /// <summary>
    /// Configures the initial seed, mode and palette style. Call before building the UI.
    /// </summary>
    public static void Initialize(
        Color? seed = null,
        ThemeVariant? mode = null,
        MaterialColorStyle? style = null)
    {
        if (seed is not null) _seed = seed.Value;
        if (style is not null) _style = style.Value;
        if (mode is not null) _mode = mode.Value;

        _isDark = _mode == ThemeVariant.Dark;
        _current = BuildTheme(_isDark);
    }

    /// <summary>
    /// Subscribes to MewUI theme changes. Call once after the application starts.
    /// </summary>
    public static void AttachToApplication()
    {
        if (!Application.IsRunning) return;
        var app = Application.Current;
        if (_attached != null && _attached.TryGetTarget(out var previous))
        {
            if (ReferenceEquals(previous, app)) return;
            previous.ThemeChanged -= OnApplicationThemeChanged;
        }

        _attached = new(app);
        app.ThemeChanged += OnApplicationThemeChanged;

        _syncing = true;
        try { app.SetTheme(_mode); }
        finally { _syncing = false; }

        if (_mode == ThemeVariant.System && _isDark != app.Theme.IsDark)
        {
            UpdateTheme(app.Theme.IsDark, notify: true);
        }

        ApplyMewUIAccent();
    }

    /// <summary>Switches between light, dark and system mode.</summary>
    public static void SetMode(ThemeVariant mode)
    {
        _mode = mode;

        if (Application.IsRunning)
        {
            _syncing = true;
            try
            {
                Application.Current.SetTheme(mode);
            }
            finally
            {
                _syncing = false;
            }
        }

        var isDark = mode == ThemeVariant.Light
            ? false
            : mode == ThemeVariant.Dark
                ? true
                : Application.IsRunning
                    ? Application.Current.Theme.IsDark
                    : _isDark;

        UpdateTheme(isDark, notify: true);
        ApplyMewUIAccent();
    }

    /// <summary>Regenerates the color scheme from a seed color.</summary>
    public static void SetSeed(Color seed)
    {
        _seed = seed;
        UpdateTheme(_isDark, notify: true);
        ApplyMewUIAccent();
    }

    /// <summary>Changes the Material tonal palette generation style.</summary>
    public static void SetColorStyle(MaterialColorStyle style)
    {
        _style = style;
        UpdateTheme(_isDark, notify: true);
        ApplyMewUIAccent();
    }

    /// <summary>
    /// Installs a fully custom theme, for example one assembled from user-provided color roles.
    /// </summary>
    public static void SetTheme(MaterialTheme theme)
    {
        ArgumentNullException.ThrowIfNull(theme);

        _current = theme;
        _isDark = theme.IsDark;
        Changed?.Invoke(_current);
        ApplyMewUIAccent();
    }

    /// <summary>Enables or disables Material motion.</summary>
    public static void SetMotionEnabled(bool enabled)
    {
        if (_motionEnabled == enabled) return;

        _motionEnabled = enabled;
        MotionChanged?.Invoke(enabled);
    }

    private static void OnApplicationThemeChanged(Theme oldTheme, Theme newTheme)
    {
        if (_syncing || _mode != ThemeVariant.System || oldTheme.IsDark == newTheme.IsDark) return;

        UpdateTheme(newTheme.IsDark, notify: true);
        ApplyMewUIAccent();
    }

    private static void UpdateTheme(bool isDark, bool notify)
    {
        _isDark = isDark;
        _current = BuildTheme(isDark);

        if (notify)
        {
            Changed?.Invoke(_current);
        }
    }

    private static MaterialTheme BuildTheme(bool isDark)
    {
        return new MaterialTheme
        {
            Name = isDark ? "Material Dark" : "Material Light",
            IsDark = isDark,
            Colors = ColorSchemeGenerator.Generate(_seed, isDark, _style),
            Typography = MaterialTypography.Default,
            Shapes = MaterialShapes.Default,
            Elevation = MaterialElevation.Default,
        };
    }

    private static void ApplyMewUIAccent()
    {
        if (!Application.IsRunning) return;

        _syncing = true;
        try
        {
            Application.Current.SetAccent(_current.Colors.Primary, _current.Colors.OnPrimary);
        }
        finally
        {
            _syncing = false;
        }
    }
}
