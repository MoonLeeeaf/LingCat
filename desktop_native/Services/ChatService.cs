using System.Globalization;
using Aprillz.MewUI;
using LingCat.ClientProtocol.Client;
using LingCat_Desktop.Ui;

namespace LingCat_Desktop.Services;

internal sealed class ChatService(AuthSession session)
{
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
            AvatarColor = Color.FromRgb(0x71, 0x56, 0x79),
            Snippet = chat.LastMessageText ?? string.Empty,
            Time = FormatTime(chat.LastMessageTime),
            LastMessageId = chat.LastMessageId,
            IsFavourite = chat.Favourited == true,
            IsGroup = chat.Type == "group",
        };
    }

    public async Task<IReadOnlyList<ChatMessage>> GetMessagesAsync(string chatId)
    {
        var messages = await ChatApi.GetChatMessagesAsync(session.Client, new(session.Stored.Token, chatId, Limit: 50)).ConfigureAwait(false);
        return messages.OrderBy(message => message.Id).Select(message => ToMessage(
            message.Id, message.Text, message.Time, message.SenderUserId, message.System == true)).ToArray();
    }

    public ChatMessage ToMessage(uint id, string text, ulong time, string? sender, bool system) => new()
    {
        Id = id, Text = text, Time = FormatTime(time), IsSystem = system,
        Sender = sender ?? string.Empty, IsMine = sender == session.User.Id,
    };

    public async Task<ChatMessage> SendAsync(string chatId, string text)
    {
        uint id = await ChatApi.SendChatMessageAsync(session.Client, new(session.Stored.Token, chatId, text)).ConfigureAwait(false);
        return ToMessage(id, text, (ulong)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), session.User.Id, false);
    }

    private static string FormatTime(ulong time)
    {
        if (time is 0 or > 253402300799999) return string.Empty;
        var local = DateTimeOffset.FromUnixTimeMilliseconds((long)time).LocalDateTime;
        return local.ToString(local.Date == DateTime.Today ? "HH:mm" : "yyyy-MM-dd HH:mm");
    }
}
