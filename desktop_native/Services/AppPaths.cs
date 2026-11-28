namespace LingCat_Desktop.Services;

/// <summary>
/// 应用数据路径。支持通过 <c>--data-dir=./LingCat-Data</c> 指定便携数据目录。
/// </summary>
internal static class AppPaths
{
    private static string? _dataDirectory;

    public static void Configure(IReadOnlyList<string> args)
    {
        for (var i = 0; i < args.Count; i++)
        {
            var arg = args[i];

            if (arg.StartsWith("--data-dir=", StringComparison.Ordinal))
            {
                SetDataDirectory(arg["--data-dir=".Length..]);
            }
            else if (arg == "--data-dir" && i + 1 < args.Count)
            {
                SetDataDirectory(args[++i]);
            }
        }
    }

    public static string StoreFilePath
    {
        get
        {
            if (_dataDirectory is not null)
            {
                return Path.Combine(_dataDirectory, "store.json");
            }

            var root = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
            if (string.IsNullOrEmpty(root))
            {
                root = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
            }

            if (string.IsNullOrEmpty(root))
            {
                root = Path.Combine(
                    Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                    ".config");
            }

            return Path.Combine(root, "LingCat", "store.json");
        }
    }

    public static string ImageCacheDirectory
    {
        get
        {
            if (_dataDirectory is not null) return Path.Combine(_dataDirectory, "cache", "images");
            if (OperatingSystem.IsLinux())
            {
                var root = Environment.GetEnvironmentVariable("XDG_CACHE_HOME");
                if (string.IsNullOrEmpty(root) || !Path.IsPathFullyQualified(root))
                    root = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.UserProfile), ".cache");
                return Path.Combine(root, "LingCat", "images");
            }
            return Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "LingCat", "cache", "images");
        }
    }

    private static void SetDataDirectory(string raw)
    {
        if (string.IsNullOrWhiteSpace(raw)) return;

        var value = raw.Trim();
        if (value == "~")
        {
            value = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
        }
        else if (value.StartsWith("~/", StringComparison.Ordinal))
        {
            value = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                value[2..]);
        }

        _dataDirectory = Path.GetFullPath(value);
    }
}
