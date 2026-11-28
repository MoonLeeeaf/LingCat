using System.Globalization;
using Aprillz.MewUI;
using LingCat.ClientProtocol.Client;
using LingCat_Desktop.Ui;

namespace LingCat_Desktop.Services;

internal sealed class ChatService(AuthSession session)
{
    public const int HistoryPageSize = 50;
    public async Task<IReadOnlyList<ChatSummary>> GetChatsAsync(CancellationToken cancellationToken)
    {
        const uint pageSize = 100;
        var chats = new List<ChatSummary>();
        var seen = new HashSet<string>();
        for (uint offset = 0; ; offset += pageSize)
        {
            cancellationToken.ThrowIfCancellationRequested();
            var batch = await ChatApi.GetMyChatsAsync(session.Client, new(session.Stored.Token, pageSize, offset)).ConfigureAwait(false);
            foreach (var chat in batch)
            {
                if (!seen.Add(chat.Id)) continue;
                chats.Add(ToSummary(chat));
            }
            if (batch.Count < pageSize) return chats;
        }
    }

    public static ChatSummary ToSummary(Chat chat)
    {
        var title = string.IsNullOrWhiteSpace(chat.Title) ? chat.ChatUnique ?? chat.Id : chat.Title;
        return new ChatSummary
        {
            Id = chat.Id, Title = title,
            AvatarText = title.Length == 0 ? "灵" : StringInfo.GetNextTextElement(title),
            AvatarFileHash = chat.AvatarFileHash,
            PeerUserId = chat.PeerUserId,
            AvatarColor = Color.FromRgb(0x71, 0x56, 0x79),
            Snippet = chat.LastMessageText ?? string.Empty,
            Time = FormatTime(chat.LastMessageTime),
            LastMessageId = chat.LastMessageId,
            IsFavourite = chat.Favourited == true,
            IsGroup = chat.Type == "group",
        };
    }

    public async Task<IReadOnlyList<ChatMessage>> GetMessagesAsync(string chatId, uint? before = null, uint? after = null,
        uint limit = HistoryPageSize)
    {
        var messages = await ChatApi.GetChatMessagesAsync(session.Client,
            new(session.Stored.Token, chatId, Before: before, After: after, Limit: limit)).ConfigureAwait(false);
        return messages.OrderBy(message => message.Id).Select(message => ToMessage(
            message.Id, message.Text, message.Time, message.SenderUserId, message.System == true, message.Entities)).ToArray();
    }

    public async Task<ChatMessage?> GetMessageAsync(string chatId, uint id)
    {
        var messages = await ChatApi.GetChatMessagesAsync(session.Client,
            new(session.Stored.Token, chatId, Before: id == uint.MaxValue ? null : id + 1, Limit: 1)).ConfigureAwait(false);
        var message = messages.FirstOrDefault(item => item.Id == id);
        return message is null ? null : ToMessage(message.Id, message.Text, message.Time,
            message.SenderUserId, message.System == true, message.Entities);
    }

    public async Task<(IReadOnlyList<ChatMessage> Messages, bool HasOlder, bool HasNewer)> GetMessagesAroundAsync(string chatId, uint id)
    {
        const uint halfPage = HistoryPageSize / 2;
        var earlier = GetMessagesAsync(chatId, before: id == uint.MaxValue ? null : id + 1, limit: halfPage);
        var later = GetMessagesAsync(chatId, after: id, limit: halfPage);
        await Task.WhenAll(earlier, later).ConfigureAwait(false);
        var before = await earlier.ConfigureAwait(false);
        var after = await later.ConfigureAwait(false);
        return (before.Concat(after).ToArray(), before.Count == halfPage, after.Count == halfPage);
    }

    public ChatMessage ToMessage(uint id, string text, ulong time, string? sender, bool system, IReadOnlyList<MessageEntity>? entities = null) => new()
    {
        Id = id, Text = text, Time = FormatTime(time), IsSystem = system,
        Sender = sender ?? string.Empty, IsMine = sender == session.User.Id,
        Entities = entities ?? [],
    };

    public static MessageEntity ToEntity(Lingcat.Classes.IMessageEntity entity) => new()
    {
        Type = entity.Type, Offset = entity.Offset, Length = entity.Length, Data = entity.HasData ? entity.Data : null,
    };

    public async Task<ChatMessage> SendAsync(string chatId, string text)
    {
        var parsed = MessageParser.ParseMessage(text);
        uint id = await ChatApi.SendChatMessageAsync(session.Client,
            new(session.Stored.Token, chatId, parsed.Text, parsed.Entities)).ConfigureAwait(false);
        return ToMessage(id, parsed.Text, (ulong)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), session.User.Id, false, parsed.Entities);
    }

    private static string FormatTime(ulong time)
    {
        if (time is 0 or > 253402300799999) return string.Empty;
        var local = DateTimeOffset.FromUnixTimeMilliseconds((long)time).LocalDateTime;
        return local.ToString(local.Date == DateTime.Today ? "HH:mm" : "yyyy-MM-dd HH:mm");
    }
}
