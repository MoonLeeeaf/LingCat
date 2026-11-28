using System.Globalization;
using System.Net;
using System.Text.Json;
using LingCat_Desktop.Ui;
using Notify.NET.Abstractions;
using Notify.NET.Builder;
using Notify.NET.Platform.Linux;
using Notify.NET.Platform.MacOS;

namespace LingCat_Desktop.Services;

internal sealed class DesktopNotifications : IAsyncDisposable
{
    private readonly SemaphoreSlim _gate = new(1);
    private INotificationService? _service;
    private WindowsNotifications? _windows;
    private bool _initializationAttempted;
    private bool _disposed;

    public async Task ShowAsync(string title, string body, Action openChat, CancellationToken token)
    {
        try
        {
            await _gate.WaitAsync(token).ConfigureAwait(false);
            try
            {
                if (_disposed || token.IsCancellationRequested) return;
                if (OperatingSystem.IsWindows())
                {
                    _windows ??= new WindowsNotifications();
                    await _windows.ShowAsync(title, body, openChat, token).ConfigureAwait(false);
                    return;
                }
                if (!_initializationAttempted)
                {
                    _initializationAttempted = true;
                    // macOS can wait for the permission prompt; don't block the UI thread.
                    _service = await Task.Run<INotificationService?>(static () =>
                        OperatingSystem.IsLinux() ? new LinuxNotificationService("LingCat") :
                        OperatingSystem.IsMacOS() ? new MacOSNotificationService("LingCat") : null).ConfigureAwait(false);
                }
                if (_service?.IsSupported != true || token.IsCancellationRequested) return;
                // Freedesktop notification bodies support a subset of markup, unlike chat text.
                var request = NotificationBuilder.Create(title)
                    .WithBody(OperatingSystem.IsLinux() ? WebUtility.HtmlEncode(body) : body)
                    .OnActivated(_ => openChat());
                if (OperatingSystem.IsLinux()) request.AddButton("打开对话", _ => openChat(), "default");
                await _service.ShowAsync(request.Build(), token).ConfigureAwait(false);
            }
            finally { _gate.Release(); }
        }
        catch (OperationCanceledException) when (token.IsCancellationRequested) { }
        catch (Exception ex) { System.Diagnostics.Trace.TraceWarning("消息通知失败：{0}", ex.Message); }
    }

    internal static uint? ReplyId(ChatMessage message) =>
        uint.TryParse(message.Entities.FirstOrDefault(e => e.Type == "reply")?.Data,
            NumberStyles.None, CultureInfo.InvariantCulture, out uint id) && id != 0 ? id : null;

    internal static string Preview(ChatMessage message)
    {
        if (message.Entities.Any(e => e.Type == "e2e")) return "[加密消息]";
        var attachment = message.Entities.FirstOrDefault(e => e.Type is "attachment" or "file" or "image" or "audio" or "video");
        var prefix = attachment?.Type switch
        {
            "image" => "[图片]", "audio" => "[语音]", "video" => "[视频]", "file" => "[文件]",
            "attachment" => AttachmentPreview(attachment.Data), _ => null,
        };
        var text = message.Text.ReplaceLineEndings(" ").Trim();
        if (prefix is not null && text.StartsWith("[附件]", StringComparison.Ordinal)) text = text[4..].TrimStart();
        if (prefix is not null) text = (prefix + " " + text).TrimEnd();
        var elements = StringInfo.ParseCombiningCharacters(text);
        return elements.Length > 160 ? text[..elements[160]] + "…" : text;
    }

    private static string AttachmentPreview(string? data)
    {
        if (data is null) return "[附件]";
        try
        {
            using var json = JsonDocument.Parse(data);
            var root = json.RootElement;
            if (root.ValueKind != JsonValueKind.Object) return "[附件]";
            string? Read(string key) => root.TryGetProperty(key, out var value) && value.ValueKind == JsonValueKind.String
                ? value.GetString() : null;
            if (Read("kind") == "sticker") return "[贴纸]";
            return Read("mime")?.Split('/')[0] switch
            {
                "image" => "[图片]", "audio" => "[语音]", "video" => "[视频]",
                _ => Path.GetExtension(Read("name"))?.ToLowerInvariant() switch
                {
                    ".png" or ".jpg" or ".jpeg" or ".gif" or ".webp" or ".bmp" => "[图片]",
                    ".mp3" or ".wav" or ".ogg" or ".m4a" or ".opus" => "[语音]",
                    ".mp4" or ".mkv" or ".mov" => "[视频]",
                    _ => "[文件]",
                },
            };
        }
        catch (JsonException) { return "[附件]"; }
    }

    public async ValueTask DisposeAsync()
    {
        await _gate.WaitAsync().ConfigureAwait(false);
        try
        {
            _disposed = true;
            if (OperatingSystem.IsWindows()) _windows?.Dispose();
            _service?.Dispose();
        }
        finally { _gate.Release(); }
    }
}
