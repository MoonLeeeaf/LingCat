using Aprillz.MewUI;

namespace MewUI.Material.Gallery;

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
