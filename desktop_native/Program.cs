using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using LingCat_Desktop.Services;
using LingCat_Desktop.Ui;
using MewUI.Material.Themes;
using System.Reflection;

void startUp()
{
    var args = Environment.GetCommandLineArgs();

    if (OperatingSystem.IsWindows())
    {
        Win32Platform.Register();


        if (args.Any(a => a is "--gdi"))
        {
            GdiBackend.Register();
        }
        else if (args.Any(a => a is "--vg"))
        {
            MewVGWin32Backend.Register();
        }
        else
        {
            Direct2DBackend.Register();
        }
    }
    else if (OperatingSystem.IsLinux())
    {
        X11Platform.Register();
        MewVGX11Backend.Register();
    }
    else if (OperatingSystem.IsMacOS())
    {
        MacOSPlatform.Register();
        MewVGMacOSBackend.Register();
    }
    else
    {
        throw new PlatformNotSupportedException("Unsupported OS.");
    }
}

startUp();

var commandArgs = Environment.GetCommandLineArgs();
AppPaths.Configure(commandArgs);

var themeMode = commandArgs.Any(a => a is "--light")
    ? ThemeVariant.Light
    : commandArgs.Any(a => a is "--dark")
        ? ThemeVariant.Dark
        : ThemeVariant.System;
MaterialThemeManager.Initialize(seed: UiTheme.Seed, mode: themeMode);
MaterialThemeManager.SetMotionEnabled(!commandArgs.Contains("--reduce-motion"));

var assembly = Assembly.GetExecutingAssembly();
var root = new AppShellView();
var icon = IconSource.FromResource(assembly, "LingCat_Desktop.Assets.icon.ico");

var window = new Window()
    .Title("LingCat")
    .Background(UiTheme.WindowBackground)
    .Resizable(1180, 760, 900, 600, 1800, 1200)
    .Content(root);

if (OperatingSystem.IsLinux())
{
    // MewUI 0.22.1 first tries to set _NET_WM_ICON before initializing its CARDINAL atom.
    window.Loaded += () => window.Icon = icon;
}
else
{
    window.Icon = icon;
}

void ApplyMaterialTheme(MaterialTheme theme)
{
    window.Background = theme.Colors.Surface;
    root.ApplyTheme(theme);
}

window.Closed += () =>
{
    MaterialThemeManager.Changed -= ApplyMaterialTheme;
    _ = root.DisposeSessionAsync();
};

Application.Create()
    .UseTheme(themeMode)
    .UseAccent(UiTheme.Accent)
    .OnStartup(() =>
    {
        MaterialThemeManager.AttachToApplication();
        MaterialThemeManager.Changed += ApplyMaterialTheme;
        ApplyMaterialTheme(MaterialThemeManager.Current);
        root.Start();
    })
    .Run(window);
