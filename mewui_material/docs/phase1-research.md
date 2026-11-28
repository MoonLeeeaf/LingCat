# Phase 1 Research — MewUI 0.22.1

This document records the API research that must precede MewUI.Material implementation.
The findings below were verified against the exact MewUI source revision used by the
published `Aprillz.MewUI` 0.22.1 package, not against other UI-framework experience.

## Sources inspected

- Official site: https://mewui.aprillz.net/
- Docs: https://mewui.aprillz.net/docs/
- GitHub: https://github.com/Aprillz/MewUI
- Local clone used for source verification: `/tmp/opencode/MewUI`
- Source commit: `2f6943d`
- Package version in that source: `0.22.1` (`build/MewUI.Common.props`)
- Local NuGet: `~/.nuget/packages/aprillz.mewui.core/0.22.1`
- Material 3 guidance: https://m3.material.io/ and https://m3.material.io/components

## Runtime and packages

- MewUI targets `net8.0` and `net10.0`; this project starts with `net10.0`, the current SDK/runtime.
- Platforms supported by the metapackage: Windows 10+, Linux/X11, macOS 12+, plus browser/WASM.
- Rendering backends include Direct2D, GDI, MewVG/OpenGL, MewVG/Metal and browser.
- `Aprillz.MewUI` is a metapackage. The reusable library references `Aprillz.MewUI.Core`;
  the Gallery references the metapackage plus the library.
- `MaterialColorUtilities` 0.3.0 is a pure C# Apache-2.0 implementation of Google's Material
  color utilities (HCT, tonal palettes, Scheme roles). It is used only by the color-scheme
  generator, not exposed as public API. NuGet package, project maintained through 2026.

## Control inheritance and custom controls

Verified from source and `docs/CustomControls.md`:

- `Control` is the base for self-drawn controls and templated controls. It supplies
  `Background`, `BorderBrush`, `BorderThickness`, `CornerRadius`, `Padding`, font/foreground,
  styles, visual state, and `Template`.
- `ContentControl : Control` owns one `Content` element and already implements measure,
  arrange, rendering, hit testing and logical/visual parent management for that content.
- `CommandSourceControl : ContentControl` adds command execution. `Button` derives from it.
- `RangeBase : Control` supplies `Minimum`, `Maximum`, `Value` and coercion.
- `Panel : FrameworkElement` hosts many children. It has no style/template/visual-state system.
- `Window : ContentControl`, so window chrome can be templated as well.

Custom state must be a `MewProperty<T>` registered on the owning control. Properties support
changed/coerce/validate callbacks and invalidation flags:
`AffectsRender`, `AffectsLayout`, `AffectsVisualState`, `Inherits`,
`BindsTwoWayByDefault`.

Read-only control state (`IsSelected`, etc.) uses `MewProperty<T>.RegisterReadOnly`.
Per-type defaults are overridden from a static constructor with `OverrideDefaultValue<T>()`.

Appearance values must not be assigned in constructors when they are meant to be styleable:
a constructor assignment is a local value and blocks style setters/triggers.

## Styles, visual states and transitions

Verified from `docs/Styling.md`, `Style.cs`, `StateTrigger.cs`, `SetterBase.cs`, `Transition.cs`:

- `Style` has `Setters`, `Triggers`, `Transitions`, `BasedOn`.
- `Setter.Create(property, value)` sets a static value.
- `Setter.Create(property, theme => value)` resolves from the current MewUI `Theme`.
- `StateTrigger.Match` / `Exclude` use `VisualStateFlags`:
  `Enabled`, `Hot`, `Focused`, `Pressed`, `Checked`, `Indeterminate`, `Active`,
  `Selected`, `ReadOnly`, `Invalid`.
- `Transition.Create(property, durationMs, easing)` animates style-resolved property changes.
- Controls compute their state in `ComputeVisualState()`. Overrides must register every input
  with `AffectsVisualState` or call `InvalidateVisualState()`.
- `StyleSheet` supports named styles and type rules; styles can be attached to any
  `FrameworkElement`.
- A control outside MewUI core can install a default style through its own `StyleSheet` type rule.
  That style layers over MewUI's framework default style.

## Templates

Verified from `docs/ControlTemplate.md` and `src/MewUI/Controls/ControlTemplate.cs`:

- `Template` is a `MewProperty<ControlTemplate?>`.
- `DelegateControlTemplate<TControl>` builds a tree with `(owner, context)`.
- `ctx.Register("PART_Name", element)` registers parts for `GetTemplateChild<T>()`.
- `ctx.Bind(part, targetProperty, sourceProperty)` is template binding.
- `ctx.BindChrome(part)` forwards Background/BorderBrush/BorderThickness/CornerRadius.
- `ContentPresenter` projects the owner's content slot.
- Templates are lazy, rebuilt on `Template` change and optionally on theme/DPI change.
- Part state that must survive theme/DPI rebuilds belongs in control properties.

## Theme APIs

Verified from `docs/Theme.md`, `Core/Theme.cs`, `Core/ThemeManager.cs`,
`Core/Application.cs`, `Core/AppOptions.cs`:

- MewUI `Theme` is an immutable record of `Name`, `Palette`, `Metrics`; `IsDark` is derived.
- `ThemeManager` builds the palette from `ThemeVariant`, accent and `ThemeSeed`.
- Default seed/metrics/accent/mode can only be changed before `Application.Run`.
- At runtime, public APIs are `Application.Current.SetTheme(ThemeVariant)` and
  `SetAccent(Color, accentText)`.
- There is public runtime support for theme variant and accent; there is **no public API to
  install a fully custom `Theme` object** in 0.22.1 (`ThemeManager.SetCustomTheme` is internal).
- `Application.Current.ThemeChanged` and `Window.ThemeChanged` report `(oldTheme, newTheme)`.
- MewUI styles can resolve values from the current MewUI theme but not from a custom
  Material token object.

### Decision for Material themes

Material themes cannot be represented as MewUI `Theme` objects through public APIs. Therefore:

- `MaterialThemeManager` owns the Material `MaterialTheme` token object.
- It exposes `Changed`; components subscribe while mounted and refresh themselves.
- It still calls `SetAccent(Primary, OnPrimary)` so native MewUI controls (TextBox caret,
  selection, focus rings) stay visually aligned.
- It follows `ThemeVariant.System` via `Application.Current.ThemeChanged`.
- Custom user schemes are installed with `MaterialThemeManager.SetTheme(...)`.

A base control / theme-aware helper will subscribe in `OnVisualRootChanged` and unsubscribe
when the root becomes null, avoiding a permanent static-event leak.

## Rendering

Verified from `IGraphicsContext.cs`, `GraphicsContextBase.cs`, `docs/CustomControls.md`:

- `OnRender(IGraphicsContext)` is retained/recorded, not called every frame.
- Every read in `OnRender` must be invalidated by `AffectsRender` or `InvalidateVisual()`.
- Primitives include `FillRoundedRectangle`, `DrawRoundedRectangle`, `FillEllipse`, paths,
  clipping (`SetClipRoundedRect`), transforms, images and text drawing helpers.
- `DrawBoxShadow(bounds, cornerRadius, blurRadius, color, offsetX, offsetY)` exists and is
  supported by the retained renderer. This will be the elevation implementation.
- Text must use `MeasureEngineText` / `DrawEngineText` on custom controls.
- Layout is in DIP; pixel snapping is render-only. Use `GetSnappedBorderBounds`,
  `LayoutRounding.*`, `GetBorderVisualInset`, `GetDpi`.
- `OnRender` should not recompute measurement and must not call `InvalidateMeasure`.
- Children are drawn after `OnRender`; `OnRenderOverlay` draws over them.

## Input and focus

- Override `OnMouseDown`, `OnMouseUp`, `OnMouseMove`, `OnMouseEnter`, `OnMouseLeave`,
  `OnKeyDown`, `OnKeyUp` and call base first.
- Gate input with `IsEffectivelyEnabled`, not `IsEnabled`.
- Mouse capture: `FindVisualRoot() as Window` → `CaptureMouse` / `ReleaseMouseCapture`.
- `FocusableProperty.OverrideDefaultValue<T>(true)` for keyboard-capable custom controls.
- Focus can be moved with `Focus()`, `FocusManager`, and reached through Tab/Shift+Tab.
- `IsTabStop(false)` excludes only from tab traversal, not from programmatic/mouse focus.
- `ComputeVisualState()` already maps enabled/hot/focused/pressed into flags.

## Animation

- `AnimationClock` is a frame-driven clock with duration, easing, repeat, auto-reverse,
  `TickCallback` and `CompletedCallback`.
- `AnimationManager` is driven by the render pulse; active clocks keep the render loop
  continuous. No per-control timer is needed or wanted.
- `Transition` is the preferred path for property-value changes (hover/pressed/focus).
- There is no built-in reduced-motion API in 0.22.1. Material will expose
  `MaterialThemeManager.MotionEnabled` and controls must stop/skip animations when false.
- Clocks attached to elements are weakly owned by MewUI; custom animation clocks still must be
  stopped when a control is detached/disposed.

## Ripple and state layers

MewUI 0.22.1 has no built-in ripple helper. The Material interaction layer will be implemented
inside Material controls:

- Hover/focus/pressed state layers use ordinary MewUI style triggers and colors.
- Ripple is drawn by a custom render overlay using `AnimationClock`, clipped to the control's
  rounded shape, and stopped when the control leaves the visual tree or motion is disabled.
- State-layer colors are derived from M3 roles: OnSurface at 8% hover, 10% focus, 10% pressed,
  12% dragged.
- All of this stays in C# and uses only `IGraphicsContext`/`AnimationClock` APIs.

## Decided project baseline

- Core package: `MewUI.Material` targeting `net10.0`, referencing `Aprillz.MewUI.Core` 0.22.1
  and `MaterialColorUtilities` 0.3.0.
- Gallery: `MewUI.Material.Gallery`, references the metapackage and the core library.
- Platform registration follows MewUI's official runtime branching (Win32/Direct2D,
  X11/MewVG, macOS/MewVG).
- Do not modify or fork MewUI.
- Do not use Avalonia/WPF/MAUI or platform-specific native controls for core behavior.
- Do not add platform-only shadow/ripple code; use `DrawBoxShadow` and vector primitives.

## Phase 1 implementation status

Implemented and compiling:

- `MaterialColorScheme` with the requested M3 semantic roles.
- `ColorSchemeGenerator` from seed via HCT tonal palettes (Light/Dark, tonal style selectable).
- `MaterialTypography` baseline type scale.
- `MaterialShapes` shape scale.
- `MaterialElevation` levels using `DrawBoxShadow`.
- `MaterialTheme`, `MaterialThemeManager` (seed, mode, custom theme, motion flag, runtime events).
- Gallery theme-token page that rebuilds on Material theme changes and validates:
  color roles, type scale, shape scale and box-shadow elevation.

## Component implementation notes

- The published `Aprillz.MewUI.Core` 0.22.1 assembly is the API authority. Its
  `Control.BorderThicknessProperty` and `CornerRadiusProperty` take `double`;
  `MouseEventArgs.GetPosition(UIElement)` is public, while `Position` is internal.
  Material ink and navigation indicators use the published `OnRender` override.
- `AnimationClock.AttachTo` is internal. Material uses public `Start`/`Stop` and
  explicitly stops clocks on motion disable, detach and disposal. The shared ink layer
  uses MewUI visual state flags for its targets and clips the ripple in DIP coordinates.
- Material buttons and selection controls reuse MewUI input handling. The text fields
  retain the stock `TextBox` for text editing and IME. The modal helper uses
  `Window.ShowDialogAsync`; callers dispatch post-await UI updates as needed.
- `Aprillz.MewUI.Automation` is unavailable in the published Core package. Keyboard
  navigation and focus are supported; screen-reader behavior is not claimed.
