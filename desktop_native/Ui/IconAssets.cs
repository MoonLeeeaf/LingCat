using System.Reflection;
using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Resources;

namespace LingCat_Desktop.Ui;

/// <summary>
/// 图标资源加载。当前使用 Assets 下的占位 SVG，后续替换同名文件即可。
/// </summary>
internal static class IconAssets
{
    private static readonly Assembly Assembly = typeof(IconAssets).Assembly;

    public static SimpleSvgSource Load(string fileName, Color tint)
    {
        var source = SimpleSvgSource.FromResource(
            Assembly,
            $"LingCat_Desktop.Assets.{fileName}");
        source.Tint = tint;
        return source;
    }

    public static Image Create(string fileName, double size, Color tint)
    {
        return Create(Load(fileName, tint), size);
    }

    public static Image Create(SimpleSvgSource source, double size)
    {
        return new Image()
            .Source(source)
            .Width(size)
            .Height(size)
            .HorizontalAlignment(HorizontalAlignment.Center)
            .VerticalAlignment(VerticalAlignment.Center);
    }
}
