using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using MewUI.Material.Controls;
using MewUI.Material.Themes;

namespace MewUI.Material.Tests;

public class ComponentInteractionTests
{
    [Fact]
    public void ButtonActivatesOncePerKeyPressAndCancelsWhenFocusMoves()
    {
        var button = new KeyboardButton();
        var other = new Button();
        var window = new Window { Content = new StackPanel().Children(button, other) };
        try
        {
            int clicks = 0;
            button.Click += () => clicks++;
            Assert.True(window.FocusManager.SetFocus(button));
            button.Down(Key.Space);
            button.Down(Key.Space);
            button.Up(Key.Enter);
            Assert.Equal(0, clicks);
            button.Up(Key.Space);
            Assert.Equal(1, clicks);

            button.Down(Key.Enter);
            window.FocusManager.SetFocus(other);
            button.Up(Key.Enter);
            Assert.Equal(1, clicks);

            window.FocusManager.SetFocus(button);
            button.Down(Key.Space);
            button.IsEnabled = false;
            button.Up(Key.Space);
            Assert.Equal(1, clicks);
        }
        finally { window.Content = null; button.Dispose(); other.Dispose(); }
    }

    [Fact]
    public void ThemeObserversUnsubscribeWhenRemovedOrDisposed()
    {
        var seed = MaterialThemeManager.SeedColor;
        var surface = new ObservedContent();
        var window = new Window { Content = surface };
        try
        {
            var before = surface.Notifications;
            MaterialThemeManager.SetSeed(Color.FromRgb(10, 50, 90));
            Assert.Equal(before + 1, surface.Notifications);
            window.Content = null;
            MaterialThemeManager.SetSeed(Color.FromRgb(90, 50, 10));
            Assert.Equal(before + 1, surface.Notifications);
            window.Content = surface;
            Assert.Equal(before + 2, surface.Notifications);
            surface.Dispose();
            MaterialThemeManager.SetSeed(seed);
            Assert.Equal(before + 2, surface.Notifications);
        }
        finally { window.Content = null; surface.Dispose(); MaterialThemeManager.SetSeed(seed); }
    }

    [Fact]
    public void ReducedMotionAndDetachStopActiveInkClocks()
    {
        var ink = new InteractionLayer(() => { });
        bool previous = MaterialThemeManager.MotionEnabled;
        try
        {
            MaterialThemeManager.SetMotionEnabled(true);
            ink.SetMounted(true);
            ink.SetState(true, true, false, false);
            ink.Pulse();
            Assert.True(ink.IsAnimating);

            MaterialThemeManager.SetMotionEnabled(false);
            Assert.False(ink.IsAnimating);
            ink.SetState(true, false, false, true);
            ink.Pulse();
            Assert.False(ink.IsAnimating);

            MaterialThemeManager.SetMotionEnabled(true);
            ink.Pulse();
            Assert.True(ink.IsAnimating);
            ink.SetMounted(false);
            Assert.False(ink.IsAnimating);
        }
        finally { ink.SetMounted(false); MaterialThemeManager.SetMotionEnabled(previous); }
    }

    [Fact]
    public void NavigationSelectionOnlyRaisesOnceAndMovesTabStop()
    {
        var nav = new MaterialNavigation(MaterialNavigationLayout.Tabs);
        nav.AddDestination("Inbox");
        nav.AddDestination("Archive");
        var items = Assert.IsType<StackPanel>(nav.Content).Children;
        var window = new Window { Content = nav };
        try
        {
            Assert.True(window.FocusManager.SetFocus(Assert.IsAssignableFrom<UIElement>(items[0])));
            var selected = new List<int>();
            nav.SelectionChanged += selected.Add;
            // Public selection controls the active destination and roving tab stop.
            nav.SelectedIndex = 1;
            nav.SelectedIndex = 1;
            Assert.Equal(new[] { 1 }, selected);
            Assert.False(Assert.IsAssignableFrom<UIElement>(items[0]).IsTabStop);
            Assert.True(Assert.IsAssignableFrom<UIElement>(items[1]).IsTabStop);
        }
        finally { window.Content = null; nav.Dispose(); }
    }

    private sealed class KeyboardButton : MaterialButton
    {
        public void Down(Key key) => OnKeyDown(new KeyEventArgs(key, 0));
        public void Up(Key key) => OnKeyUp(new KeyEventArgs(key, 0));
    }

    private sealed class ObservedContent : MaterialContentControl
    {
        public int Notifications { get; private set; }
        protected override void OnMaterialThemeChanged(MaterialTheme theme) => Notifications++;
    }
}
