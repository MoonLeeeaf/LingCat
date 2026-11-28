using System.Collections.Concurrent;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Runtime.Versioning;

namespace LingCat_Desktop.Services;

// Notify.NET 1.1.0's managed Windows loader uses Assembly.CodeBase, which is unavailable in Native AOT.
// Call the package's WinToastWrapper C ABI directly and keep all toast operations on one STA.
[SupportedOSPlatform("windows")]
internal sealed partial class WindowsNotifications : IDisposable
{
    private static readonly ConcurrentDictionary<long, Action> Activations = new();
    private readonly BlockingCollection<Action> _work = new();
    private readonly Thread _thread;
    private readonly TaskCompletionSource<bool> _ready = new(TaskCreationOptions.RunContinuationsAsynchronously);
    private nint _library;
    private int _disposed;

    public WindowsNotifications()
    {
        _thread = new Thread(Run) { IsBackground = true, Name = "LingCat notifications" };
        _thread.SetApartmentState(ApartmentState.STA);
        _thread.Start();
    }

    public async Task ShowAsync(string title, string body, Action activate, CancellationToken token)
    {
        if (!await _ready.Task.WaitAsync(token).ConfigureAwait(false)) return;
        var completed = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        _work.Add(() =>
        {
            try
            {
                token.ThrowIfCancellationRequested();
                Show(title, body, activate);
                completed.TrySetResult();
            }
            catch (Exception ex) { completed.TrySetException(ex); }
        }, token);
        await completed.Task.ConfigureAwait(false);
    }

    private unsafe void Run()
    {
        bool initialized = false;
        try
        {
            _library = LoadWrapper();
            var compatible = (delegate* unmanaged[Cdecl]<int>)NativeLibrary.GetExport(_library, "WNT_IsCompatible");
            if (compatible() == 0) { _ready.TrySetResult(false); return; }
            var initialize = (delegate* unmanaged[Cdecl]<char*, char*, char*, int>)NativeLibrary.GetExport(_library, "WNT_Initialize");
            fixed (char* name = "LingCat", id = "LingCat.Desktop") initialized = initialize(name, id, null) != 0;
            if (!initialized) throw new InvalidOperationException("无法初始化 Windows 消息通知。");
            _ready.TrySetResult(true);
            while (!_work.IsCompleted)
            {
                if (_work.TryTake(out var job, 20)) job();
                while (PeekMessage(out var message, 0, 0, 0, 1) != 0)
                {
                    TranslateMessage(in message);
                    DispatchMessage(in message);
                }
            }
        }
        catch (Exception ex) { _ready.TrySetException(ex); }
        finally
        {
            Activations.Clear();
            if (initialized)
                ((delegate* unmanaged[Cdecl]<void>)NativeLibrary.GetExport(_library, "WNT_Uninitialize"))();
            // The native wrapper may still receive OS callbacks after uninitialization.
            // Keep the module loaded until process exit.
        }
    }

    private static nint LoadWrapper()
    {
        const string name = "WinToastWrapper.dll";
        var directory = AppContext.BaseDirectory;
        var flat = Path.Combine(directory, name);
        var rid = "win-" + RuntimeInformation.ProcessArchitecture.ToString().ToLowerInvariant();
        return NativeLibrary.Load(File.Exists(flat) ? flat : Path.Combine(directory, "runtimes", rid, "native", name));
    }

    private unsafe void Show(string title, string body, Action activate)
    {
        var show = (delegate* unmanaged[Cdecl]<Toast*, Handler*, long>)NativeLibrary.GetExport(_library, "WNT_ShowToast");
        fixed (char* titlePtr = title, bodyPtr = body)
        {
            var toast = new Toast { Title = (nint)titlePtr, Body = (nint)bodyPtr, AudioFile = -1 };
            var handler = new Handler { Activated = &OnActivated, Dismissed = &OnDismissed, Failed = &OnFailed };
            var id = show(&toast, &handler);
            if (id <= 0) throw new InvalidOperationException($"Windows 通知发送失败（{id}）。");
            Activations[id] = activate;
        }
    }

    [UnmanagedCallersOnly(CallConvs = [typeof(CallConvStdcall)])]
    private static void OnActivated(long id)
    {
        try { if (Activations.TryRemove(id, out var activate)) activate(); }
        catch (Exception ex) { System.Diagnostics.Trace.TraceWarning("打开通知会话失败：{0}", ex.Message); }
    }

    [UnmanagedCallersOnly(CallConvs = [typeof(CallConvStdcall)])]
    private static void OnDismissed(long id, int reason) => Activations.TryRemove(id, out _);

    [UnmanagedCallersOnly(CallConvs = [typeof(CallConvStdcall)])]
    private static void OnFailed(long id) => Activations.TryRemove(id, out _);

    public void Dispose()
    {
        if (Interlocked.Exchange(ref _disposed, 1) != 0) return;
        _work.CompleteAdding();
        if (_thread.Join(TimeSpan.FromSeconds(5))) _work.Dispose();
    }

    // Layouts match Notify.NET 1.1.0's WinToastWrapper.h and Win32 MSG.
    [StructLayout(LayoutKind.Sequential)]
    private struct Toast
    {
        public nint Title, Body, ImagePath, HeroImagePath, ButtonLabels;
        public int ButtonCount;
        public long ExpirationMs;
        public int Scenario, AudioOption;
        public nint InlineImagePath, AttributionText, CustomAudioPath;
        public int CropHint, AudioFile;
    }

    [StructLayout(LayoutKind.Sequential)]
    private unsafe struct Handler
    {
        public delegate* unmanaged[Stdcall]<long, void> Activated;
        public delegate* unmanaged[Stdcall]<long, int, void> ButtonActivated, Dismissed;
        public delegate* unmanaged[Stdcall]<long, void> Failed;
    }

    [StructLayout(LayoutKind.Sequential)]
    private struct Message
    {
        public nint Window;
        public uint Id;
        public nuint WParam;
        public nint LParam;
        public uint Time;
        public int X, Y;
        public uint Private;
    }

    [LibraryImport("user32.dll", EntryPoint = "PeekMessageW")]
    private static partial int PeekMessage(out Message message, nint window, uint min, uint max, uint remove);
    [LibraryImport("user32.dll")]
    private static partial int TranslateMessage(in Message message);
    [LibraryImport("user32.dll", EntryPoint = "DispatchMessageW")]
    private static partial nint DispatchMessage(in Message message);
}
