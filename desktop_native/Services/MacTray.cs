using System.Runtime.InteropServices;

namespace LingCat_Desktop.Services;

// Created, used, and disposed on the AppKit main thread.
internal sealed unsafe partial class MacTray : IDisposable
{
    private const string ObjC = "/usr/lib/libobjc.A.dylib";
    private static readonly Dictionary<nint, MacTray> Targets = new();
    private static nint _targetClass;
    private readonly Action _toggle;
    private readonly Action _exit;
    private nint _statusBar, _statusItem, _target, _menu;

    public MacTray(Action toggle, Action exit)
    {
        _toggle = toggle;
        _exit = exit;
        try
        {
            _statusBar = Send(GetClass("NSStatusBar"), Sel("systemStatusBar"));
            _statusItem = Send(SendLength(_statusBar, Sel("statusItemWithLength:"), -1), Sel("retain"));
            var button = Send(_statusItem, Sel("button"));
            if (button == 0) throw new InvalidOperationException("无法创建 macOS 菜单栏图标。");

            _target = Send(Send(TargetClass(), Sel("alloc")), Sel("init"));
            _menu = New("NSMenu");
            if (_target == 0 || _menu == 0) throw new InvalidOperationException("无法创建 macOS 菜单栏菜单。");
            Targets.Add(_target, this);
            SendVoid(_menu, Sel("setAutoenablesItems:"), 0);
            AddMenuItem("显示/隐藏窗口", "lingCatToggle:");
            AddMenuItem("退出程序", "lingCatExit:");
            SetIcon(button);
            SendVoid(button, Sel("setToolTip:"), String("LingCat"));
            SendVoid(button, Sel("setTarget:"), _target);
            SendVoid(button, Sel("setAction:"), Sel("lingCatStatusClick:"));
            // NSEventMaskLeftMouseUp | NSEventMaskRightMouseUp.
            Send(button, Sel("sendActionOn:"), (1 << 2) | (1 << 4));
        }
        catch { Dispose(); throw; }
    }

    private void SetIcon(nint button)
    {
        using var resource = typeof(MacTray).Assembly.GetManifestResourceStream("LingCat_Desktop.Assets.icon.png")!;
        using var buffer = new MemoryStream();
        resource.CopyTo(buffer);
        fixed (byte* bytes = buffer.GetBuffer())
        {
            var data = SendData(GetClass("NSData"), Sel("dataWithBytes:length:"), bytes, (nuint)buffer.Length);
            var image = Send(Send(GetClass("NSImage"), Sel("alloc")), Sel("initWithData:"), data);
            if (image == 0) { SendVoid(button, Sel("setTitle:"), String("LingCat")); return; }
            SendSize(image, Sel("setSize:"), new NativeSize(18, 18));
            SendVoid(button, Sel("setImage:"), image);
            Release(image);
        }
    }

    private void AddMenuItem(string title, string action)
    {
        var item = SendThree(Send(GetClass("NSMenuItem"), Sel("alloc")), Sel("initWithTitle:action:keyEquivalent:"),
            String(title), Sel(action), String(string.Empty));
        if (item == 0) throw new InvalidOperationException("无法创建 macOS 托盘菜单项。");
        SendVoid(item, Sel("setTarget:"), _target);
        SendVoid(_menu, Sel("addItem:"), item);
        Release(item);
    }

    private static nint TargetClass()
    {
        if (_targetClass != 0) return _targetClass;
        var type = AllocateClass(GetClass("NSObject"), "LingCatStatusItemTarget", 0);
        if (type == 0) throw new InvalidOperationException("无法创建 macOS 托盘回调。");
        if (AddMethod(type, Sel("lingCatStatusClick:"), &Clicked, "v@:@") == 0 ||
            AddMethod(type, Sel("lingCatToggle:"), &Toggle, "v@:@") == 0 ||
            AddMethod(type, Sel("lingCatExit:"), &Exit, "v@:@") == 0)
        {
            DisposeClass(type);
            throw new InvalidOperationException("无法注册 macOS 托盘回调。");
        }
        RegisterClass(type);
        return _targetClass = type;
    }

    [UnmanagedCallersOnly]
    private static void Clicked(nint target, nint selector, nint button)
    {
        try
        {
            if (!Targets.TryGetValue(target, out var tray)) return;
            var app = Send(GetClass("NSApplication"), Sel("sharedApplication"));
            var current = Send(app, Sel("currentEvent"));
            // Right mouse up, or Ctrl-click (the macOS secondary-click shortcut).
            if (current != 0 && (Send(current, Sel("type")) == 4 || (Send(current, Sel("modifierFlags")) & (1 << 18)) != 0))
                SendMenu(GetClass("NSMenu"), Sel("popUpContextMenu:withEvent:forView:"), tray._menu, current, button);
            else tray._toggle();
        }
        catch (Exception ex) { Console.Error.WriteLine($"macOS 托盘操作失败：{ex.Message}"); }
    }

    [UnmanagedCallersOnly]
    private static void Toggle(nint target, nint selector, nint sender) => Invoke(target, exit: false);

    [UnmanagedCallersOnly]
    private static void Exit(nint target, nint selector, nint sender) => Invoke(target, exit: true);

    private static void Invoke(nint target, bool exit)
    {
        try { if (Targets.TryGetValue(target, out var tray)) (exit ? tray._exit : tray._toggle)(); }
        catch (Exception ex) { Console.Error.WriteLine($"macOS 托盘操作失败：{ex.Message}"); }
    }

    public void Dispose()
    {
        if (_statusItem != 0) SendVoid(_statusBar, Sel("removeStatusItem:"), _statusItem);
        Targets.Remove(_target);
        Release(_statusItem);
        Release(_menu);
        Release(_target);
        _statusItem = _menu = _target = 0;
    }

    private static nint New(string type) => Send(Send(GetClass(type), Sel("alloc")), Sel("init"));
    private static void Release(nint obj) { if (obj != 0) SendVoid(obj, Sel("release")); }
    [StructLayout(LayoutKind.Sequential)]
    private readonly record struct NativeSize(double Width, double Height);

    [LibraryImport(ObjC, EntryPoint = "objc_getClass", StringMarshalling = StringMarshalling.Utf8)] private static partial nint GetClass(string name);
    [LibraryImport(ObjC, EntryPoint = "sel_registerName", StringMarshalling = StringMarshalling.Utf8)] private static partial nint Sel(string name);
    [LibraryImport(ObjC, EntryPoint = "objc_allocateClassPair", StringMarshalling = StringMarshalling.Utf8)] private static partial nint AllocateClass(nint superclass, string name, nuint extraBytes);
    [LibraryImport(ObjC, EntryPoint = "objc_registerClassPair")] private static partial void RegisterClass(nint type);
    [LibraryImport(ObjC, EntryPoint = "objc_disposeClassPair")] private static partial void DisposeClass(nint type);
    [LibraryImport(ObjC, EntryPoint = "class_addMethod", StringMarshalling = StringMarshalling.Utf8)] private static partial byte AddMethod(nint type, nint selector, delegate* unmanaged<nint, nint, nint, void> callback, string encoding);
    [LibraryImport(ObjC, EntryPoint = "objc_msgSend")] private static partial nint Send(nint receiver, nint selector);
    [LibraryImport(ObjC, EntryPoint = "objc_msgSend")] private static partial nint Send(nint receiver, nint selector, nint value);
    [LibraryImport(ObjC, EntryPoint = "objc_msgSend")] private static partial nint SendLength(nint receiver, nint selector, double length);
    [LibraryImport(ObjC, EntryPoint = "objc_msgSend")] private static partial nint SendData(nint receiver, nint selector, byte* bytes, nuint length);
    [LibraryImport(ObjC, EntryPoint = "objc_msgSend")] private static partial nint SendThree(nint receiver, nint selector, nint first, nint second, nint third);
    [LibraryImport(ObjC, EntryPoint = "objc_msgSend")] private static partial void SendMenu(nint receiver, nint selector, nint menu, nint mouseEvent, nint view);
    [LibraryImport(ObjC, EntryPoint = "objc_msgSend")] private static partial void SendVoid(nint receiver, nint selector);
    [LibraryImport(ObjC, EntryPoint = "objc_msgSend")] private static partial void SendVoid(nint receiver, nint selector, nint value);
    [LibraryImport(ObjC, EntryPoint = "objc_msgSend")] private static partial void SendSize(nint receiver, nint selector, NativeSize size);
    [LibraryImport(ObjC, EntryPoint = "objc_msgSend", StringMarshalling = StringMarshalling.Utf8)] private static partial nint SendString(nint receiver, nint selector, string value);
    private static nint String(string value) => SendString(GetClass("NSString"), Sel("stringWithUTF8String:"), value);
}
