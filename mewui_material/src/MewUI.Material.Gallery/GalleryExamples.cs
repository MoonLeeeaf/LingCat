using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using MewUI.Material.Controls;

namespace MewUI.Material.Gallery;

internal sealed partial class GalleryView
{
    private static StackPanel BuildExamples()
    {
        var result = new Label().Text("Activate a button with the mouse, Space or Enter.");
        var buttons = new WrapPanel().Spacing(10);
        foreach (var (button, text, name) in new (MaterialButton, string, string)[]
        {
            (new FilledButton(), "Filled", "Filled"), (new FilledTonalButton(), "Tonal", "Filled tonal"),
            (new OutlinedButton(), "Outlined", "Outlined"), (new TextButton(), "Text", "Text"),
            (new ElevatedButton(), "Elevated", "Elevated"), (new MewUI.Material.Controls.IconButton(), "☆", "Standard icon"),
            (new FilledIconButton(), "+", "Filled icon"), (new FilledTonalIconButton(), "♥", "Tonal icon"),
            (new OutlinedIconButton(), "✓", "Outlined icon"), (new Fab(), "+", "Floating action button"),
            (new ExtendedFab(), "+ Create", "Extended floating action button"),
        })
        {
            buttons.Add(ActionButton(button, text, () => result.Text = $"Activated: {name}").ToolTip(name));
        }
        buttons.Add(new FilledButton { Content = new Label().Text("Disabled"), IsEnabled = false });

        var field = new OutlinedTextField { Label = "Display name", Placeholder = "Enter a name", SupportingText = "At least 3 characters" };
        field.Editor.TextChanged += text => field.HasError = text.Length is > 0 and < 3;
        var filled = new FilledTextField { Label = "Notes", Placeholder = "Type here" };
        var search = new MaterialSearchBar { Label = "Search the example list" };
        var matches = new Label();
        string[] items = ["Ada", "Grace", "Katherine", "Margaret"];
        void Filter(string query) => matches.Text = string.Join(", ", items.Where(i => i.Contains(query, StringComparison.OrdinalIgnoreCase))) is { Length: > 0 } found ? found : "No results";
        search.Editor.TextChanged += Filter;
        Filter(string.Empty);

        var check = new MaterialCheckBox { Content = new Label().Text("Three-state checkbox"), IsThreeState = true };
        var toggle = new MaterialSwitch { Content = new Label().Text("Sync over Wi-Fi"), IsChecked = true };
        var radio1 = new MaterialRadioButton { Content = new Label().Text("Email"), GroupName = "alerts", IsChecked = true };
        var radio2 = new MaterialRadioButton { Content = new Label().Text("Push"), GroupName = "alerts" };
        var selection = new Label().Text("Notifications: Email");
        radio1.CheckedChanged += value => { if (value) selection.Text = "Notifications: Email"; };
        radio2.CheckedChanged += value => { if (value) selection.Text = "Notifications: Push"; };
        check.CheckedChanged += value => result.Text = $"Checkbox: {value?.ToString() ?? "mixed"}";
        toggle.CheckedChanged += value => result.Text = $"Wi-Fi sync: {value == true}";

        var cards = new WrapPanel().Spacing(12);
        foreach (var variant in new[] { MaterialSurfaceVariant.FilledCard, MaterialSurfaceVariant.OutlinedCard, MaterialSurfaceVariant.ElevatedCard })
        {
            cards.Add(new MaterialSurface
            {
                Variant = variant,
                Content = new StackPanel().Spacing(8).Children(new Label().Text(variant.ToString()).SemiBold(),
                    ActionButton(new TextButton(), "Open", () => result.Text = $"Opened {variant}")),
            });
        }

        var snack = new MaterialSnackbar();
        var progress = new MaterialProgressBar { Minimum = 0, Maximum = 100, Value = 25 };
        var slider = new Slider { Minimum = 0, Maximum = 100, Value = 25 };
        slider.ValueChanged += value => progress.Value = value;
        var animate = new MaterialCheckBox { Content = new Label().Text("Indeterminate") };
        animate.CheckedChanged += value => progress.IsIndeterminate = value == true;
        var dialog = new FilledButton().Content("Open dialog");
        dialog.Click += async () =>
        {
            if (dialog.FindVisualRoot() is not Window owner) return;
            var accepted = await MaterialDialog.ConfirmAsync(owner, "Save changes?", "Try Tab, Enter, and Escape in this modal dialog.", "Save");
            UiThread.Post(() =>
            {
                if (dialog.FindVisualRoot() is null) return;
                if (accepted) snack.Show("Changes saved", "Undo", () => snack.Show("Save undone"));
                else snack.Show("No changes saved");
            });
        };

        var nav = new MaterialNavigation();
        var rail = new MaterialNavigation(MaterialNavigationLayout.Rail).HorizontalAlignment(HorizontalAlignment.Left);
        string[] destinations = ["Inbox", "Starred", "Archive"];
        foreach (var name in destinations) { nav.AddDestination(name); rail.AddDestination(name); }
        var page = new Label().Text("Inbox");
        nav.SelectionChanged += i => { rail.SelectedIndex = i; page.Text = destinations[i]; };
        rail.SelectionChanged += i => { nav.SelectedIndex = i; page.Text = destinations[i]; };

        return new StackPanel().Spacing(18).Padding(26).Children(result,
            Heading("Buttons"), buttons, new MaterialDivider(),
            Heading("Text fields and search"), field, filled, search, matches, new MaterialDivider(),
            Heading("Selection controls"), new WrapPanel().Spacing(12).Children(check, toggle, radio1, radio2), selection, new MaterialDivider(),
            Heading("Surfaces"), cards, new MaterialDivider(),
            Heading("Dialogs and feedback"), new WrapPanel().Spacing(8).Children(dialog,
                ActionButton(new OutlinedButton(), "Show snackbar", () => snack.Show("Item archived", "Undo", () => snack.Show("Item restored")))),
            snack, slider, progress, animate, new MaterialDivider(),
            Heading("Navigation bar and rail"), nav,
            new StackPanel().Horizontal().Spacing(18).Children(rail, page));
    }

    private static Label Heading(string title) => new Label().Text(title).FontSize(19).SemiBold();

    private static MaterialButton ActionButton(MaterialButton button, string text, Action action)
    {
        button.Content(text, accessKey: false);
        button.Click += action;
        return button;
    }
}
