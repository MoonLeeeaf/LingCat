# MewUI.Material

Material Design 3 theme system and component library for [MewUI](https://mewui.aprillz.net/).

The library is built only on public MewUI 0.22.1 APIs and does not modify or fork MewUI.

## Components

| Family | Available controls |
| --- | --- |
| Buttons | Filled, tonal, outlined, text, elevated, four icon variants, FAB and extended FAB |
| Text input | Filled and outlined fields with supporting/error text, search bar with a localizable `ClearButtonText` |
| Selection | Checkbox (including mixed state), switch, grouped radio buttons |
| Surfaces | Filled, outlined and elevated cards, surfaces, and horizontal/vertical dividers |
| Feedback | Modal confirmation, snackbar with optional action, determinate/indeterminate progress |
| Navigation | Bar, rail and tabs with a roving tab stop and arrow-key navigation |

The Gallery has a live component page and a theme-token page. Use the toolbar to change
light/dark mode, seed color or reduced motion without resetting the component examples.

## Layout

```text
src/
  MewUI.Material/            core reusable library
    Themes/                  color, typography, shape, elevation, theme manager
    Controls/                component families and shared interaction rendering
  MewUI.Material.Gallery/    gallery application
docs/
  phase1-research.md         verified MewUI API research
tests/                       headless theme and interaction tests
```

## Build

```bash
dotnet build MewUI.Material.slnx -c Release
dotnet test MewUI.Material.slnx -c Release
dotnet pack src/MewUI.Material/MewUI.Material.csproj -c Release
```

Run the gallery:

```bash
dotnet run --project src/MewUI.Material.Gallery/MewUI.Material.Gallery.csproj
```

## Theme usage

```csharp
using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using MewUI.Material.Controls;
using MewUI.Material.Themes;

MaterialThemeManager.Initialize(
    seed: Color.FromRgb(0x67, 0x50, 0xA4),
    mode: ThemeVariant.System);

var save = new FilledButton().Content("Save");
save.Click += () => { /* Save settings */ };
// Register MaterialThemeManager.AttachToApplication with Application.OnStartup.
```

Call runtime setters on the UI thread. `SetSeed`, `SetMode` and `SetTheme` update mounted
controls; `SetMotionEnabled(false)` stops custom animation clocks while retaining hover,
focus and press feedback. Hosts can connect that setting to their own motion preference.
The manager also syncs MewUI's accent so built-in controls use the Material primary color.
For custom controls, inherit `MaterialControl` or `MaterialContentControl` and override
`OnMaterialThemeChanged` to update theme-dependent visuals.

The Gallery registers Direct2D on Windows and MewVG on Linux/X11 and macOS. The core package
does not depend on any platform backend. Typography exposes the full scale as tokens;
standard MewUI content uses the supported font size and weight properties.

## Dependencies

- `Aprillz.MewUI.Core` 0.22.1 — UI framework
- `MaterialColorUtilities` 0.3.0 — Apache-2.0 HCT/tonal-palette implementation

## License

MIT. See `LICENSE`.
