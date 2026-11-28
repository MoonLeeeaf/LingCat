using System.Diagnostics;
using System.Runtime.InteropServices;

namespace LingCat_Desktop.Services;

internal static partial class LinuxDesktopFont
{
    public static string? GetFamily()
    {
        if (!OperatingSystem.IsLinux()) return null;

        var desktop = Environment.GetEnvironmentVariable("XDG_CURRENT_DESKTOP")
            ?? Environment.GetEnvironmentVariable("XDG_SESSION_DESKTOP") ?? string.Empty;

        foreach (var name in desktop.Split(':', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries))
        {
            string? family = name.ToUpperInvariant() switch
            {
                "KDE" or "PLASMA" => ReadKdeFamily(),
                "GNOME" or "UNITY" or "X-CINNAMON" or "CINNAMON" or "MATE" => ReadGtkFamily(name),
                "XFCE" => ParsePangoFont(ReadSetting("xfconf-query", "-c", "xsettings", "-p", "/Gtk/FontName")),
                _ => null,
            };
            if (!string.IsNullOrWhiteSpace(family)) return family;
        }
        return null;
    }

    private static string? ReadKdeFamily()
    {
        var version = Environment.GetEnvironmentVariable("KDE_SESSION_VERSION");
        var font = ReadSetting(version == "5" ? "kreadconfig5" : "kreadconfig6", "--file", "kdeglobals", "--group", "General", "--key", "font")
            ?? ReadSetting(version == "5" ? "kreadconfig6" : "kreadconfig5", "--file", "kdeglobals", "--group", "General", "--key", "font");
        // KDE serializes the family followed by size, weight and other QFont fields.
        return font?.Split(',', 2)[0].Trim();
    }

    private static string? ReadGtkFamily(string desktop)
    {
        var schema = desktop.ToUpperInvariant() switch
        {
            "X-CINNAMON" or "CINNAMON" => "org.cinnamon.desktop.interface",
            "MATE" => "org.mate.interface",
            _ => "org.gnome.desktop.interface",
        };
        return ParsePangoFont(ReadSetting("gsettings", "get", schema, "font-name")?.Trim('\'', '"'));
    }

    private static string? ParsePangoFont(string? font)
    {
        if (string.IsNullOrWhiteSpace(font)) return null;
        try
        {
            // Pango separates the family from the size, style and weight in GTK font descriptions.
            var description = pango_font_description_from_string(font);
            if (description == 0) return null;
            try { return Marshal.PtrToStringUTF8(pango_font_description_get_family(description)); }
            finally { pango_font_description_free(description); }
        }
        catch (DllNotFoundException) { return null; }
        catch (EntryPointNotFoundException) { return null; }
    }

    private static string? ReadSetting(string program, params string[] arguments)
    {
        var start = new ProcessStartInfo(program)
        {
            UseShellExecute = false,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
        };
        foreach (var argument in arguments) start.ArgumentList.Add(argument);

        try
        {
            using var process = new Process { StartInfo = start };
            if (!process.Start()) return null;
            var output = process.StandardOutput.ReadToEndAsync();
            var errors = process.StandardError.ReadToEndAsync();
            if (!process.WaitForExit(750))
            {
                process.Kill();
                return null;
            }
            if (!Task.WaitAll([output, errors], 100) || process.ExitCode != 0) return null;
            var value = output.Result.Trim();
            return value.Length == 0 ? null : value;
        }
        catch (System.ComponentModel.Win32Exception) { return null; }
        catch (InvalidOperationException) { return null; }
        catch (AggregateException) { return null; }
    }

    [LibraryImport("libpango-1.0.so.0", StringMarshalling = StringMarshalling.Utf8)]
    private static partial nint pango_font_description_from_string(string font);

    [LibraryImport("libpango-1.0.so.0")]
    private static partial nint pango_font_description_get_family(nint description);

    [LibraryImport("libpango-1.0.so.0")]
    private static partial void pango_font_description_free(nint description);
}
