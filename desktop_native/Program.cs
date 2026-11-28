using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Resources;
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

var commandArgs = Environment.GetCommandLineArgs();
DesktopNotifications.DebugEnabled = commandArgs.Contains("--debug-notifications");
if (commandArgs.Contains("--test-notification") && OperatingSystem.IsLinux())
{
    DesktopNotifications.DebugEnabled = true;
    await using var test = new DesktopNotifications();
    var sent = await test.ShowAsync("LingCat", "Linux 系统通知测试", () => { }, CancellationToken.None);
    if (sent) await Task.Delay(TimeSpan.FromSeconds(6));
    Environment.ExitCode = sent ? 0 : 1;
    return;
}

startUp();
ImageDecoders.RegisterFallback(new PhotoDecoder());

AppPaths.Configure(commandArgs);

var themeMode = commandArgs.Any(a => a is "--light")
    ? ThemeVariant.Light
    : commandArgs.Any(a => a is "--dark")
        ? ThemeVariant.Dark
        : ThemeVariant.System;
MaterialThemeManager.Initialize(seed: UiTheme.Seed, mode: themeMode);
MaterialThemeManager.SetMotionEnabled(!commandArgs.Contains("--reduce-motion"));

var assembly = Assembly.GetExecutingAssembly();
var icon = IconSource.FromResource(assembly, "LingCat_Desktop.Assets.icon.ico");

var window = new Window { Padding = Thickness.Zero }
    .Title("LingCat")
    .Background(UiTheme.WindowBackground)
    .Resizable(1180, 760, 900, 600, 1800, 1200);
using var tray = new DesktopTray(window);
await using var notifications = new DesktopNotifications();
var root = new AppShellView(tray, notifications);
window.Content = root;

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

var application = Application.Create()
    .UseTheme(themeMode)
    .UseAccent(UiTheme.Accent);

if (LinuxDesktopFont.GetFamily() is { } fontFamily)
    application.UseMetrics(ThemeMetrics.Default with { FontFamily = fontFamily });

application
    .OnStartup(() =>
    {
        MaterialThemeManager.AttachToApplication();
        MaterialThemeManager.Changed += ApplyMaterialTheme;
        ApplyMaterialTheme(MaterialThemeManager.Current);
        root.Start();
        tray.Start();
    })
    .Run(window);
