using System.Runtime.InteropServices;
using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using NotificationIcon.NET;
using MenuItem = NotificationIcon.NET.MenuItem;

namespace LingCat_Desktop.Services;

internal sealed partial class DesktopTray(Window window) : IDisposable
{
    private IDisposable? _icon;
    private bool _hidden;
    private bool _exiting;
    private bool _disposed;

    public bool IsWindowActive => !_hidden && window.IsActive && window.WindowState != WindowState.Minimized;

    public async void Start()
    {
        var dispatcher = Application.Current?.Dispatcher;
        if (dispatcher is null) return;
        void ToggleFromTray() => dispatcher.BeginInvoke(Toggle);
        void ExitFromTray() => dispatcher.BeginInvoke(Exit);
        try
        {
            if (OperatingSystem.IsLinux())
            {
                var tray = await LinuxTray.CreateAsync(ToggleFromTray, ExitFromTray).ConfigureAwait(false);
                dispatcher.BeginInvoke(() => Attach(tray));
            }
            else if (OperatingSystem.IsWindows())
                Attach(new WindowsTray(ToggleFromTray, ExitFromTray));
            else if (OperatingSystem.IsMacOS())
                Attach(new MacTray(ToggleFromTray, ExitFromTray));
        }
        catch (Exception ex) { Console.Error.WriteLine($"系统托盘不可用：{ex.Message}"); }
    }

    private void Attach(IDisposable? tray)
    {
        if (_disposed) { tray?.Dispose(); return; }
        _icon = tray;
        if (tray is not null) window.Closing += OnClosing;
    }

    private void OnClosing(ClosingEventArgs args)
    {
        if (_exiting || _icon is LinuxTray { IsAvailable: false }) return;
        args.Cancel = true;
        window.Hide();
        _hidden = true;
    }

    private void Toggle()
    {
        if (_disposed || _exiting) return;
        if (!_hidden && window.WindowState != WindowState.Minimized)
        {
            window.Hide();
            _hidden = true;
            return;
        }

        ShowWindow();
    }

    public void ShowWindow()
    {
        if (_disposed || _exiting) return;
        if (_hidden)
        {
            window.Show();
            // MewUI 0.22.1's X11 backend does not remap a previously shown surface.
            if (OperatingSystem.IsLinux() && XOpenDisplay(0) is var display && display != 0)
            {
                try { XMapRaised(display, window.Handle); }
                finally { XCloseDisplay(display); }
            }
            _hidden = false;
        }
        if (window.WindowState == WindowState.Minimized) window.Restore();
        window.Activate();
    }

    private void Exit()
    {
        if (_disposed || _exiting) return;
        _exiting = true;
        window.Close();
    }

    public void Dispose()
    {
        _disposed = true;
        window.Closing -= OnClosing;
        _icon?.Dispose();
        _icon = null;
    }

    [LibraryImport("libX11.so.6")] private static partial nint XOpenDisplay(nint name);
    [LibraryImport("libX11.so.6")] private static partial int XMapRaised(nint display, nint window);
    [LibraryImport("libX11.so.6")] private static partial int XCloseDisplay(nint display);

    private sealed partial class WindowsTray : IDisposable
    {
        private readonly Thread _thread;
        private readonly CancellationTokenSource _stop = new();

        public WindowsTray(Action toggle, Action exit)
        {
            var ready = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
            _thread = new Thread(() => Run(toggle, exit, ready)) { IsBackground = true, Name = "LingCat tray" };
            _thread.Start();
            try { ready.Task.GetAwaiter().GetResult(); }
            catch { Dispose(); throw; }
        }

        private void Run(Action toggle, Action exit, TaskCompletionSource ready)
        {
            var path = Path.Combine(Path.GetTempPath(), $"LingCat-{Guid.NewGuid():N}.ico");
            try
            {
                using (var resource = typeof(DesktopTray).Assembly.GetManifestResourceStream("LingCat_Desktop.Assets.icon.ico")!)
                using (var file = File.Open(path, FileMode.CreateNew)) resource.CopyTo(file);
                using var icon = NotifyIcon.Create(path, [new MenuItem("显示/隐藏窗口") { Click = (_, _) => toggle() },
                    new MenuItem("退出程序") { Click = (_, _) => exit() }]);

                nint handle = 0;
                do { handle = FindWindowEx(0, handle, "TRAY", null); }
                while (handle != 0 && GetWindowThreadProcessId(handle, 0) != GetCurrentThreadId());
                if (handle == 0) throw new InvalidOperationException("未找到托盘窗口。");
                Subclass callback = (hwnd, message, wParam, lParam, _, _) =>
                {
                    if (message == 0x401 && lParam == 0x202) { toggle(); return 0; } // WM_USER+1 / WM_LBUTTONUP
                    return DefSubclassProc(hwnd, message, wParam, lParam);
                };
                if (!SetWindowSubclass(handle, callback, 1, 0)) throw new InvalidOperationException("无法注册托盘点击回调。");
                ready.TrySetResult();
                try
                {
                    while (!_stop.IsCancellationRequested)
                    {
                        icon.MessageLoopIteration(false);
                        _stop.Token.WaitHandle.WaitOne(20);
                    }
                }
                finally { RemoveWindowSubclass(handle, callback, 1); }
            }
            catch (Exception ex) { if (!ready.TrySetException(ex)) Console.Error.WriteLine($"系统托盘错误：{ex.Message}"); }
            finally { try { File.Delete(path); } catch (IOException) { } catch (UnauthorizedAccessException) { } }
        }

        public void Dispose()
        {
            _stop.Cancel();
            if (_thread.Join(TimeSpan.FromSeconds(2))) _stop.Dispose();
        }

        [UnmanagedFunctionPointer(CallingConvention.Winapi)]
        private delegate nint Subclass(nint hwnd, uint message, nuint wParam, nint lParam, nuint id, nuint reference);
        [DllImport("comctl32.dll")] private static extern bool SetWindowSubclass(nint hwnd, Subclass callback, nuint id, nuint reference);
        [DllImport("comctl32.dll")] private static extern bool RemoveWindowSubclass(nint hwnd, Subclass callback, nuint id);
        [LibraryImport("comctl32.dll")] private static partial nint DefSubclassProc(nint hwnd, uint message, nuint wParam, nint lParam);
        [LibraryImport("user32.dll", EntryPoint = "FindWindowExW", StringMarshalling = StringMarshalling.Utf16)]
        private static partial nint FindWindowEx(nint parent, nint after, string className, string? title);
        [LibraryImport("user32.dll")] private static partial uint GetWindowThreadProcessId(nint hwnd, nint processId);
        [LibraryImport("kernel32.dll")] private static partial uint GetCurrentThreadId();
    }
}
