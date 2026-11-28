using Aprillz.MewUI;

namespace LingCat_Desktop.Ui;

internal static class UiThread
{
    public static void Post(Action action)
    {
        var dispatcher = Application.Current?.Dispatcher;
        if (dispatcher is null)
        {
            action();
            return;
        }

        if (dispatcher.IsOnUIThread)
        {
            action();
        }
        else
        {
            dispatcher.BeginInvoke(action);
        }
    }
}
