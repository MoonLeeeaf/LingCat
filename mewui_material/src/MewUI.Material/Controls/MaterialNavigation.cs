using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Rendering;
using MewUI.Material.Themes;

namespace MewUI.Material.Controls;

public enum MaterialNavigationLayout { Bar, Rail, Tabs }

/// <summary>Single-selection navigation with Tab, arrow, Home and End support. Hosts destinations, not pages.</summary>
public sealed class MaterialNavigation : MaterialSurface
{
    private readonly List<Destination> _items = [];
    private readonly StackPanel _panel = new StackPanel().Spacing(6);
    private int _selectedIndex = -1;

    public MaterialNavigation() : this(MaterialNavigationLayout.Bar) { }

    public MaterialNavigation(MaterialNavigationLayout layout)
    {
        Layout = layout;
        Variant = MaterialSurfaceVariant.Navigation;
        Padding = new Thickness(8);
        if (layout != MaterialNavigationLayout.Rail) _panel.Horizontal();
        Content = _panel;
    }

    public MaterialNavigationLayout Layout { get; }
    public event Action<int>? SelectionChanged;

    public int SelectedIndex
    {
        get => _selectedIndex;
        set
        {
            ArgumentOutOfRangeException.ThrowIfLessThan(value, -1);
            ArgumentOutOfRangeException.ThrowIfGreaterThanOrEqual(value, _items.Count);
            if (_selectedIndex == value) return;
            _selectedIndex = value;
            UpdateDestinations();
            SelectionChanged?.Invoke(value);
        }
    }

    public void AddDestination(string label)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(label);
        int index = _items.Count;
        var item = new Destination(Layout) { MinHeight = 48 };
        item.Content(label, accessKey: false);
        item.Click += () => SelectedIndex = index;
        item.KeyDown += e =>
        {
            if (e.Handled) return;
            bool vertical = Layout == MaterialNavigationLayout.Rail;
            int next = e.Key switch
            {
                Key.Home => 0,
                Key.End => _items.Count - 1,
                Key.Left when !vertical => (index + _items.Count - 1) % _items.Count,
                Key.Right when !vertical => (index + 1) % _items.Count,
                Key.Up when vertical => (index + _items.Count - 1) % _items.Count,
                Key.Down when vertical => (index + 1) % _items.Count,
                _ => -1,
            };
            if (next < 0) return;
            e.Handled = true;
            SelectedIndex = next;
            _items[next].Focus();
        };
        _items.Add(item);
        _panel.Add(item);
        if (index == 0 && SelectedIndex < 0) SelectedIndex = 0;
        else UpdateDestinations();
    }

    private void UpdateDestinations()
    {
        for (int i = 0; i < _items.Count; i++)
        {
            _items[i].Active = i == _selectedIndex;
            _items[i].IsTabStop = i == Math.Max(0, _selectedIndex);
        }
    }

    private sealed class Destination : MaterialButton
    {
        private readonly MaterialNavigationLayout _layout;
        public bool Active
        {
            get;
            set { if (field != value) { field = value; ApplyTheme(MaterialThemeManager.Current); } }
        }

        public Destination(MaterialNavigationLayout layout)
        {
            _layout = layout;
            Variant = MaterialButtonVariant.Text;
            if (layout == MaterialNavigationLayout.Tabs) CornerRadius = 4;
        }

        private protected override (Color Fill, Color Ink, Color Outline, int Elevation) Appearance(MaterialColorScheme c) =>
            !Active ? (Color.Transparent, c.OnSurfaceVariant, Color.Transparent, 0)
            : _layout == MaterialNavigationLayout.Tabs ? (Color.Transparent, c.Primary, Color.Transparent, 0)
            : (c.SecondaryContainer, c.OnSecondaryContainer, Color.Transparent, 0);

        protected override void OnRender(IGraphicsContext context)
        {
            base.OnRender(context);
            if (!Active || _layout != MaterialNavigationLayout.Tabs) return;
            var box = GetSnappedBorderBounds(Bounds);
            double width = Math.Min(32, box.Width);
            if (width <= 0 || box.Height < 3) return;
            context.FillRoundedRectangle(new Rect(box.X + (box.Width - width) / 2, box.Bottom - 3, width, 3),
                1.5, 1.5, Foreground);
        }
    }
}
