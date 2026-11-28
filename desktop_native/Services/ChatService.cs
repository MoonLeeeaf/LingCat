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
                var title = string.IsNullOrWhiteSpace(chat.Title) ? chat.ChatUnique ?? chat.Id : chat.Title;
                chats.Add(new ChatSummary
                {
                    Id = chat.Id, Title = title,
                    AvatarText = title.Length == 0 ? "灵" : StringInfo.GetNextTextElement(title),
                    AvatarColor = Color.FromRgb(0x71, 0x56, 0x79),
                    Snippet = chat.LastMessageText ?? string.Empty,
                    Time = FormatTime(chat.LastMessageTime),
                    IsFavourite = chat.Favourited == true,
                    IsGroup = chat.Type == "group",
                });
            }
            if (batch.Count < pageSize) return chats;
        }
    }

    public async Task<IReadOnlyList<ChatMessage>> GetMessagesAsync(string chatId)
    {
        var messages = await ChatApi.GetChatMessagesAsync(session.Client, new(session.Stored.Token, chatId, Limit: 50)).ConfigureAwait(false);
        return messages.OrderBy(message => message.Id).Select(message => new ChatMessage
        {
            Id = message.Id, Text = message.Text, Time = FormatTime(message.Time),
            IsSystem = message.System == true, Sender = message.SenderUserId ?? string.Empty,
            IsMine = message.SenderUserId == session.User.Id,
        }).ToArray();
    }

    public async Task<ChatMessage> SendAsync(string chatId, string text)
    {
        uint id = await ChatApi.SendChatMessageAsync(session.Client, new(session.Stored.Token, chatId, text)).ConfigureAwait(false);
        return new ChatMessage { Id = id, Text = text, Time = DateTime.Now.ToString("HH:mm"), Sender = "我", IsMine = true };
    }

    private static string FormatTime(ulong time)
    {
        if (time is 0 or > 253402300799999) return string.Empty;
        var local = DateTimeOffset.FromUnixTimeMilliseconds((long)time).LocalDateTime;
        return local.ToString(local.Date == DateTime.Today ? "HH:mm" : "yyyy-MM-dd HH:mm");
    }
}
