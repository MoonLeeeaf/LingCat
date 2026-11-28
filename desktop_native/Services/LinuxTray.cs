using Aprillz.MewUI;
using Tmds.DBus.Protocol;

namespace LingCat_Desktop.Services;

internal sealed class LinuxTray(DBusConnection connection, Action toggle, Action exit) : IDisposable
{
    private const string Watcher = "org.kde.StatusNotifierWatcher";
    private const string WatcherPath = "/StatusNotifierWatcher";
    private const string Item = "org.kde.StatusNotifierItem";
    private const string ItemPath = "/StatusNotifierItem";
    private const string Menu = "com.canonical.dbusmenu";
    private const string MenuPath = "/MenuBar";
    private const string Properties = "org.freedesktop.DBus.Properties";
    private const string Layout = "(ia{sv}av)";
    private static readonly string[] ItemProperties = ["Category", "Id", "Title", "Status", "WindowId", "IconName", "IconPixmap", "ItemIsMenu", "Menu"];
    private static readonly string[] MenuProperties = ["Version", "TextDirection", "Status"];
    private byte[] _argb = [];
    private int _width, _height;

    public bool IsAvailable { get; private set; }

    public static async Task<LinuxTray?> CreateAsync(Action toggle, Action exit)
    {
        if (DBusAddress.Session is not { } address) return null;
        var connection = new DBusConnection(address);
        var tray = new LinuxTray(connection, toggle, exit);
        try
        {
            await connection.ConnectAsync().AsTask().WaitAsync(TimeSpan.FromSeconds(3)).ConfigureAwait(false);
            bool host = await connection.CallMethodAsync(CreateCall(connection, Properties, "Get", "ss", Watcher, "IsStatusNotifierHostRegistered"),
                static (message, _) => message.GetBodyReader().ReadVariantValue().GetBool(), null)
                .WaitAsync(TimeSpan.FromSeconds(3)).ConfigureAwait(false);
            if (!host) { tray.Dispose(); return null; }
            tray.LoadIcon();
            connection.AddMethodHandler(new Handler(tray, ItemPath));
            connection.AddMethodHandler(new Handler(tray, MenuPath));
            await connection.CallMethodAsync(CreateCall(connection, Watcher, "RegisterStatusNotifierItem", "s", ItemPath))
                .WaitAsync(TimeSpan.FromSeconds(3)).ConfigureAwait(false);
            tray.IsAvailable = true;
            return tray;
        }
        catch { tray.Dispose(); throw; }
    }

    private static MessageBuffer CreateCall(DBusConnection connection, string @interface, string member, string signature, params string[] values)
    {
        using var writer = connection.GetMessageWriter();
        writer.WriteMethodCallHeader(Watcher, WatcherPath, @interface, member, signature);
        foreach (var value in values) writer.WriteString(value);
        return writer.CreateMessage();
    }

    private void LoadIcon()
    {
        // Use the small ICO frame to avoid sending the full-size application PNG over D-Bus.
        var icon = IconSource.FromResource(typeof(LinuxTray).Assembly, "LingCat_Desktop.Assets.icon.ico");
        if (icon.Pick(32) is not ImageSource source) return;
        _width = source.PixelWidth;
        _height = source.PixelHeight;
        _argb = new byte[checked(_width * _height * 4)];
        source.CopyPixels(_argb, _width * 4);
        for (int i = 0; i < _argb.Length; i += 4)
            (_argb[i], _argb[i + 1], _argb[i + 2], _argb[i + 3]) = (_argb[i + 3], _argb[i + 2], _argb[i + 1], _argb[i]);
    }

    private void Handle(MethodContext context, string path)
    {
        var request = context.Request;
        var member = request.MemberAsString;
        var reader = request.GetBodyReader();
        if (request.InterfaceAsString == Properties && member is "Get" or "GetAll")
        {
            string expected = path == ItemPath ? Item : Menu;
            var properties = reader.ReadString() == expected ? (path == ItemPath ? ItemProperties : MenuProperties) : [];
            if (member == "Get")
            {
                string property = reader.ReadString();
                if (!properties.Contains(property)) { context.ReplyError("org.freedesktop.DBus.Error.UnknownProperty", property); return; }
                var writer = context.CreateReplyWriter("v");
                try { WriteProperty(ref writer, property); context.Reply(writer.CreateMessage()); }
                finally { writer.Dispose(); }
            }
            else
            {
                var writer = context.CreateReplyWriter("a{sv}");
                try
                {
                    var entries = writer.WriteDictionaryStart();
                    foreach (var property in properties)
                    {
                        writer.WriteDictionaryEntryStart();
                        writer.WriteString(property);
                        WriteProperty(ref writer, property);
                    }
                    writer.WriteDictionaryEnd(entries);
                    context.Reply(writer.CreateMessage());
                }
                finally { writer.Dispose(); }
            }
            return;
        }

        if (path == ItemPath && request.InterfaceAsString == Item && member is "Activate" or "ContextMenu" or "SecondaryActivate" or "Scroll")
        {
            ReplyEmpty(context);
            if (member == "Activate") toggle();
            return;
        }
        if (path == MenuPath && request.InterfaceAsString == Menu)
        {
            switch (member)
            {
                case "GetLayout":
                    int parent = reader.ReadInt32(), depth = reader.ReadInt32();
                    if (parent is < 0 or > 2) break;
                    var layout = context.CreateReplyWriter("u" + Layout);
                    try
                    {
                        layout.WriteUInt32(1);
                        WriteNode(ref layout, parent, depth != 0);
                        context.Reply(layout.CreateMessage());
                    }
                    finally { layout.Dispose(); }
                    return;
                case "AboutToShow":
                    using (var writer = context.CreateReplyWriter("b"))
                    {
                        writer.WriteBool(false);
                        context.Reply(writer.CreateMessage());
                    }
                    return;
                case "Event":
                    int id = reader.ReadInt32();
                    bool clicked = reader.ReadString() == "clicked";
                    ReplyEmpty(context);
                    if (clicked && id == 1) toggle();
                    else if (clicked && id == 2) exit();
                    return;
            }
        }
        context.ReplyUnknownMethodError();
    }

    private void WriteProperty(ref MessageWriter writer, string property)
    {
        switch (property)
        {
            case "Category": writer.WriteVariantString("ApplicationStatus"); break;
            case "Id": case "Title": writer.WriteVariantString("LingCat"); break;
            case "Status": writer.WriteVariantString("Active"); break;
            case "WindowId": writer.WriteVariantUInt32(0); break;
            case "IconName": writer.WriteVariantString(""); break;
            case "IconPixmap":
                writer.WriteSignature("a(iiay)");
                var icons = writer.WriteArrayStart(DBusType.Struct);
                if (_argb.Length > 0)
                {
                    writer.WriteStructureStart();
                    writer.WriteInt32(_width);
                    writer.WriteInt32(_height);
                    writer.WriteArray(_argb);
                }
                writer.WriteArrayEnd(icons);
                break;
            case "ItemIsMenu": writer.WriteVariantBool(false); break;
            case "Menu": writer.WriteVariantObjectPath(MenuPath); break;
            case "Version": writer.WriteVariantUInt32(3); break;
            case "TextDirection": writer.WriteVariantString("ltr"); break;
        }
    }

    private static void WriteNode(ref MessageWriter writer, int id, bool children)
    {
        writer.WriteStructureStart();
        writer.WriteInt32(id);
        var properties = writer.WriteDictionaryStart();
        writer.WriteDictionaryEntryStart();
        writer.WriteString(id == 0 ? "children-display" : "label");
        writer.WriteVariantString(id switch { 0 => "submenu", 1 => "显示/隐藏窗口", _ => "退出程序" });
        writer.WriteDictionaryEnd(properties);
        var nodes = writer.WriteArrayStart(DBusType.Variant);
        if (id == 0 && children)
            for (int child = 1; child <= 2; child++)
            {
                writer.WriteSignature(Layout);
                WriteNode(ref writer, child, false);
            }
        writer.WriteArrayEnd(nodes);
    }

    private static void ReplyEmpty(MethodContext context)
    {
        if (context.NoReplyExpected) return;
        using var writer = context.CreateReplyWriter(null);
        context.Reply(writer.CreateMessage());
    }

    public void Dispose()
    {
        IsAvailable = false;
        connection.Dispose();
    }

    private sealed class Handler(LinuxTray tray, string path) : IPathMethodHandler
    {
        public string Path => path;
        public bool HandlesChildPaths => false;
        public ValueTask HandleMethodAsync(MethodContext context)
        {
            tray.Handle(context, path);
            return ValueTask.CompletedTask;
        }
    }
}
