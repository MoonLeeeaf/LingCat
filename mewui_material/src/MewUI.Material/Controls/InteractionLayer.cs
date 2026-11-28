using Aprillz.MewUI;
using Aprillz.MewUI.Animation;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Rendering;
using MewUI.Material.Themes;

namespace MewUI.Material.Controls;

internal sealed class InteractionLayer(Action invalidate)
{
    private AnimationClock? _ripple;
    private AnimationClock? _fade;
    private Point? _origin;
    private double _opacity;
    private double _target;
    private bool _mounted;

    internal bool IsAnimating => _ripple?.IsRunning == true || _fade?.IsRunning == true;

    public void SetMounted(bool mounted)
    {
        if (_mounted == mounted) return;
        _mounted = mounted;
        if (mounted)
            MaterialThemeManager.MotionChanged += MotionChanged;
        else
        {
            MaterialThemeManager.MotionChanged -= MotionChanged;
            Stop();
            _opacity = _target = 0;
        }
    }

    private void MotionChanged(bool enabled)
    {
        if (enabled) return;
        Stop();
        _opacity = _target;
        invalidate();
    }

    private void Stop()
    {
        _fade?.Stop();
        _ripple?.Stop();
    }

    public void SetState(bool enabled, bool hot, bool focused, bool pressed)
    {
        double target = !enabled ? 0 : pressed || focused ? .10 : hot ? .08 : 0;
        if (!enabled) _ripple?.Stop();
        if (target != _target)
        {
            _target = target;
            _fade?.Stop();
            if (!_mounted || !MaterialThemeManager.MotionEnabled || !enabled)
                _opacity = target;
            else
            {
                double start = _opacity;
                _fade = new AnimationClock(TimeSpan.FromMilliseconds(120))
                {
                    TickCallback = t => { _opacity = start + (target - start) * t; invalidate(); },
                };
                _fade.Start();
            }
        }
        invalidate();
    }

    public void Pulse(Point? origin = null)
    {
        if (!_mounted || !MaterialThemeManager.MotionEnabled) return;
        _origin = origin;
        _ripple ??= new AnimationClock(TimeSpan.FromMilliseconds(350), static t => 1 - Math.Pow(1 - t, 3))
        {
            TickCallback = _ => invalidate(),
        };
        _ripple.Start();
        invalidate();
    }

    public void Draw(IGraphicsContext context, Rect bounds, double radius, Color ink)
    {
        if (_opacity > 0)
            context.FillRoundedRectangle(bounds, radius, radius, ink.WithAlpha((byte)Math.Round(_opacity * 255)));
        if (_ripple is not { IsRunning: true } clock) return;

        double x = Math.Clamp(_origin?.X ?? bounds.X + bounds.Width / 2, bounds.X, bounds.Right);
        double y = Math.Clamp(_origin?.Y ?? bounds.Y + bounds.Height / 2, bounds.Y, bounds.Bottom);
        double dx = Math.Max(x - bounds.X, bounds.Right - x);
        double dy = Math.Max(y - bounds.Y, bounds.Bottom - y);
        double extent = Math.Sqrt(dx * dx + dy * dy) * clock.Progress;
        if (extent <= 0) return;
        context.Save();
        try
        {
            context.SetClipRoundedRect(bounds, radius, radius);
            context.FillEllipse(new Rect(x - extent, y - extent, extent * 2, extent * 2),
                ink.WithAlpha((byte)Math.Round(30 * (1 - clock.RawProgress))));
        }
        finally { context.Restore(); }
    }

    public static Point? Pointer(Control owner, MouseEventArgs args)
    {
        if (owner.FindVisualRoot() is not Window window || window.Handle == 0) return null;
        var point = args.GetPosition(owner);
        return new Point(owner.Bounds.X + point.X, owner.Bounds.Y + point.Y);
    }

    public static void DrawFocus(IGraphicsContext context, Rect bounds, double radius, Color color)
    {
        if (bounds.Width <= 4 || bounds.Height <= 4) return;
        var outline = new Rect(bounds.X + 1.5, bounds.Y + 1.5, bounds.Width - 3, bounds.Height - 3);
        radius = Math.Max(0, radius - 1.5);
        context.DrawRoundedRectangle(outline, radius, radius, color, 2);
    }
}
