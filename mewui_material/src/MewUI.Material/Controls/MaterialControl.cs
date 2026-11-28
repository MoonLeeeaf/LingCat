using Aprillz.MewUI.Controls;
using MewUI.Material.Themes;

namespace MewUI.Material.Controls;

/// <summary>A self-rendered control that observes Material tokens while mounted.</summary>
public abstract class MaterialControl : Control
{
    protected MaterialTheme MaterialTheme => MaterialThemeManager.Current;

    protected virtual void OnMaterialThemeChanged(MaterialTheme theme) => InvalidateVisual();

    protected override void OnVisualRootChanged(Element? oldRoot, Element? newRoot)
    {
        base.OnVisualRootChanged(oldRoot, newRoot);
        MaterialThemeManager.Changed -= OnMaterialThemeChanged;
        if (newRoot is null) return;
        MaterialThemeManager.Changed += OnMaterialThemeChanged;
        OnMaterialThemeChanged(MaterialTheme);
    }

    protected override void OnDispose()
    {
        MaterialThemeManager.Changed -= OnMaterialThemeChanged;
        base.OnDispose();
    }
}

/// <summary>A content host that observes Material tokens while mounted.</summary>
public abstract class MaterialContentControl : ContentControl
{
    protected MaterialTheme MaterialTheme => MaterialThemeManager.Current;

    protected virtual void OnMaterialThemeChanged(MaterialTheme theme) => InvalidateVisual();

    protected override void OnVisualRootChanged(Element? oldRoot, Element? newRoot)
    {
        base.OnVisualRootChanged(oldRoot, newRoot);
        MaterialThemeManager.Changed -= OnMaterialThemeChanged;
        if (newRoot is null) return;
        MaterialThemeManager.Changed += OnMaterialThemeChanged;
        OnMaterialThemeChanged(MaterialTheme);
    }

    protected override void OnDispose()
    {
        MaterialThemeManager.Changed -= OnMaterialThemeChanged;
        base.OnDispose();
    }
}
