using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using MewUI.Material.Gallery;
using MewUI.Material.Themes;

void RegisterPlatform()
{
    if (OperatingSystem.IsWindows())
    {
        Win32Platform.Register();
        Direct2DBackend.Register();
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

RegisterPlatform();

MaterialThemeManager.Initialize(mode: ThemeVariant.System);

var gallery = new GalleryView();
var window = new Window
{
    Title = "MewUI.Material Gallery",
    Background = MaterialThemeManager.Current.Colors.Background,
    Padding = Thickness.Zero,
};
window.Resizable(1180, 780, 900, 600, 2200, 1400);
window.Content = gallery.Root;

Application.Create()
    .UseTheme(ThemeVariant.System)
    .OnStartup(() => MaterialThemeManager.AttachToApplication())
    .Run(window);
