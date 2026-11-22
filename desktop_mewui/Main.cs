using System.Diagnostics;
using System.Reflection;
using Aprillz.MewUI;
using Aprillz.MewUI.Controls;

var assembly = Assembly.GetExecutingAssembly();

Startup();

var window = new Window()
    .Resizable(950, 600)
    .Title("LingCat")
    .Icon(IconSource.FromStream(assembly.GetManifestResourceStream("LingCat_Desktop.icon.ico")));

Application.Run(window);

// ======================================================== //

static void Startup()
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
    else if (OperatingSystem.IsMacOS())
    {
        MacOSPlatform.Register();
        MewVGMacOSBackend.Register();
    }
    else
    {
        X11Platform.Register();
        MewVGX11Backend.Register();
    }
}


