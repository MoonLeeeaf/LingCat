using System.Diagnostics;
using System.Text.Json;
using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using LingCat.ClientProtocol.Client;
using LingCat_Desktop.Services;
using MewUI.Material.Controls;

namespace LingCat_Desktop.Ui.Components;

internal sealed class RichMessageContent(AuthSession auth, ChatService service, ChatSummary? chat,
    Action<string> showUser, Action<string> showChat, Action<uint> jumpToMessage)
{
    public UIElement Build(ChatMessage message)
    {
        var body = new StackPanel().Spacing(6);
        var text = message.Text;
        // Never render encrypted payload bytes, even if the entity range is malformed.
        if (message.Entities.Any(e => e.Type == "e2e"))
        {
            body.Add(Plain("[加密消息]", UiTheme.Danger));
            return body;
        }

        var inline = new List<MessageEntity>();
        int start = 0;
        void Flush(int end)
        {
            if (end <= start) return;
            var part = text[start..end];
            body.Add(inline.Count == 0 ? Plain(part) : new RichMessageText(part,
                inline.Select(e => e with { Offset = e.Offset - (uint)start }).ToArray(), Activate)
            {
                Foreground = UiTheme.Text,
                FontSize = UiTheme.Type.BodyMedium.FontSize,
            });
            inline.Clear();
        }

        foreach (var entity in RichMessageText.ValidEntities(text, message.Entities))
        {
            if (entity.Type is not ("reply" or "attachment")) { inline.Add(entity); continue; }
            Flush((int)entity.Offset);
            body.Add(entity.Type == "reply" ? BuildReply(entity.Data) : BuildAttachment(entity.Data));
            start = (int)(entity.Offset + entity.Length);
        }
        Flush(text.Length);
        return body;
    }

    private static TextBlock Plain(string text, Color? color = null) => new()
    {
        Text = text, TextWrapping = TextWrapping.Wrap, FontSize = UiTheme.Type.BodyMedium.FontSize,
        Foreground = color ?? UiTheme.Text,
    };

    private UIElement BuildReply(string? data)
    {
        if (chat is null || !uint.TryParse(data, out uint id) || id == 0) return Plain("[无效回复]", UiTheme.TextMuted);
        var label = Plain("正在加载引用...", UiTheme.TextSecondary);
        label.TextTrimming = TextTrimming.CharacterEllipsis;
        label.TextWrapping = TextWrapping.NoWrap;
        var quote = new MaterialSurface { Variant = MaterialSurfaceVariant.FilledCard, Content = label }.Padding(8, 5);
        var cached = chat.Messages.Find(item => item.Id == id);
        if (cached is not null) label.Text = QuoteText(cached);
        else _ = LoadReplyAsync(chat.Id, id, label);
        return new TextButton { Content = quote }.Padding(0).ToolTip("跳转到原消息").OnClick(() => jumpToMessage(id));
    }

    private static string QuoteText(ChatMessage message) => message.Entities.Any(e => e.Type == "e2e")
        ? "↪ [加密消息]" : "↪ " + message.Text.ReplaceLineEndings(" ");

    private async Task LoadReplyAsync(string chatId, uint id, TextBlock label)
    {
        ChatMessage? message = null;
        try { message = await service.GetMessageAsync(chatId, id).ConfigureAwait(false); }
        catch { /* An unavailable quote does not affect the containing message. */ }
        UiThread.Post(() => label.Text = message is null ? "[引用消息不可用]" : QuoteText(message));
    }

    private UIElement BuildAttachment(string? data)
    {
        if (string.IsNullOrEmpty(data)) return Plain("[无效附件]", UiTheme.TextMuted);
        try
        {
            using var document = JsonDocument.Parse(data);
            var root = document.RootElement;
            if (root.ValueKind != JsonValueKind.Object) return Plain("[无效附件]", UiTheme.TextMuted);
            string? hash = ReadString(root, "hash");
            if (hash is null || hash.Length != 64 || !hash.All(Uri.IsHexDigit)) return Plain("[无效附件]", UiTheme.TextMuted);
            string name = ReadString(root, "name") ?? "附件";
            bool sticker = ReadString(root, "kind") == "sticker";
            var extension = Path.GetExtension(name).ToLowerInvariant();
            bool image = sticker || extension is ".png" or ".jpg" or ".jpeg" or ".gif" or ".webp" or ".bmp" or ".ico" ||
                ReadString(root, "mime")?.StartsWith("image/", StringComparison.OrdinalIgnoreCase) == true;
            return new MessageAttachmentView(auth, hash, name, image, sticker).Root;
        }
        catch (JsonException) { return Plain("[无效附件]", UiTheme.TextMuted); }
    }

    private static string? ReadString(JsonElement root, string key) =>
        root.TryGetProperty(key, out var value) && value.ValueKind == JsonValueKind.String ? value.GetString() : null;

    private void Activate(MessageEntity entity)
    {
        if (string.IsNullOrWhiteSpace(entity.Data)) return;
        switch (entity.Type)
        {
            case "user_mention": showUser(entity.Data); break;
            case "chat_mention": showChat(entity.Data); break;
            case "link" when Uri.TryCreate(entity.Data, UriKind.Absolute, out var uri) && uri.Scheme is "http" or "https":
                try { using var process = Process.Start(new ProcessStartInfo(uri.AbsoluteUri) { UseShellExecute = true }); }
                catch (System.ComponentModel.Win32Exception) { }
                break;
        }
    }
}
