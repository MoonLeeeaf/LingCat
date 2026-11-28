using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;

namespace LingCat.ClientProtocol.Client;

/// <summary>
/// 把用户输入的轻量语法解析为 text + entities。
/// 支持：<c>**bold**</c> <c>*italic*</c> <c>`code`</c> <c>[文字](url)</c>
/// <c>[@显示名](user:id)</c> <c>[@群名](chat:id)</c> <c>![文件名](file:id)</c>，
/// 以及 <c>![sticker.png](lingcat://sticker?hash=...&amp;packId=...&amp;emoji=...)</c>。
/// </summary>
public static class MessageParser
{
    private static readonly MessageParserJsonContext JsonContext = new(new JsonSerializerOptions
    {
        Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping,
    });

    private static readonly Regex BoldRegex = new(@"^\*\*([^*]+)\*\*", RegexOptions.Compiled);
    private static readonly Regex ItalicRegex = new(@"^\*([^*]+)\*", RegexOptions.Compiled);
    private static readonly Regex CodeRegex = new(@"^`([^`]+)`", RegexOptions.Compiled);
    private static readonly Regex StrikeRegex = new(@"^~~([^~]+)~~", RegexOptions.Compiled);
    private static readonly Regex SpoilerRegex = new(@"^\|\|([^|]+)\|\|", RegexOptions.Compiled);
    private static readonly Regex UserMentionRegex = new(@"^\[@([^\]]+)\]\(user:([^)]+)\)", RegexOptions.Compiled);
    private static readonly Regex ChatMentionRegex = new(@"^\[@([^\]]+)\]\(chat:([^)]+)\)", RegexOptions.Compiled);
    private static readonly Regex StickerRegex = new(@"^!\[([^\]]+)\]\(lingcat://sticker\?([^)]+)\)", RegexOptions.Compiled);
    private static readonly Regex FileRegex = new(@"^!\[([^\]]+)\]\((?:lingcat://file\?hash=|file:)([^)]+)\)", RegexOptions.Compiled);
    private static readonly Regex LinkRegex = new(@"^\[([^\]]+)\]\(([^)]+)\)", RegexOptions.Compiled);
    private static readonly Regex ReplyRegex = new(@"^\[reply:(\d+)\]", RegexOptions.Compiled);
    private static readonly Regex FileNamePrefixRegex = new(
        @"^(?:(?:Image|Video|File)=|(?:图片|视频|音频|文件)-)",
        RegexOptions.Compiled);

    /// <summary>把用户输入的轻量语法解析为 text + entities。</summary>
    public static ParsedMessage ParseMessage(string input)
    {
        var text = new StringBuilder();
        var entities = new List<MessageEntity>();
        var i = 0;

        void AddEntity(string type, string value, string? data = null)
        {
            entities.Add(new MessageEntity
            {
                Type = type,
                Offset = (uint)text.Length,
                Length = (uint)value.Length,
                Data = data,
            });
            text.Append(value);
        }

        while (i < input.Length)
        {
            // 转义：\* → 字面 *
            if (input[i] == '\\' && i + 1 < input.Length)
            {
                text.Append(input[i + 1]);
                i += 2;
                continue;
            }

            var rest = input.Substring(i);
            Match match;

            // **bold**
            if ((match = BoldRegex.Match(rest)).Success)
            {
                AddEntity("bold", match.Groups[1].Value);
                i += match.Length;
                continue;
            }

            // *italic*
            if ((match = ItalicRegex.Match(rest)).Success)
            {
                AddEntity("italic", match.Groups[1].Value);
                i += match.Length;
                continue;
            }

            // `code`
            if ((match = CodeRegex.Match(rest)).Success)
            {
                AddEntity("code", match.Groups[1].Value);
                i += match.Length;
                continue;
            }

            // ~~删除线~~
            if ((match = StrikeRegex.Match(rest)).Success)
            {
                AddEntity("strikethrough", match.Groups[1].Value);
                i += match.Length;
                continue;
            }

            // ||剧透||
            if ((match = SpoilerRegex.Match(rest)).Success)
            {
                AddEntity("spoiler", match.Groups[1].Value);
                i += match.Length;
                continue;
            }

            // [@显示名](user:id)
            if ((match = UserMentionRegex.Match(rest)).Success)
            {
                AddEntity(
                    "user_mention",
                    "@" + match.Groups[1].Value,
                    match.Groups[2].Value);
                i += match.Length;
                continue;
            }

            // [@群名](chat:id)
            if ((match = ChatMentionRegex.Match(rest)).Success)
            {
                AddEntity(
                    "chat_mention",
                    "@" + match.Groups[1].Value,
                    match.Groups[2].Value);
                i += match.Length;
                continue;
            }

            // ![贴纸](lingcat://sticker?hash=xxx&packId=yyy&emoji=zzz)
            if ((match = StickerRegex.Match(rest)).Success)
            {
                var query = ParseQuery(match.Groups[2].Value);
                if (query.TryGetValue("hash", out var hash) && !string.IsNullOrEmpty(hash))
                {
                    var name = match.Groups[1].Value;
                    var payload = new Dictionary<string, string>
                    {
                        ["hash"] = hash,
                        ["name"] = string.IsNullOrEmpty(name) ? "sticker" : name,
                        ["kind"] = "sticker",
                    };

                    if (query.TryGetValue("packId", out var packId) && !string.IsNullOrEmpty(packId))
                    {
                        payload["packId"] = packId;
                    }

                    if (query.TryGetValue("emoji", out var emoji) && !string.IsNullOrEmpty(emoji))
                    {
                        payload["emoji"] = emoji;
                    }

                    AddEntity("attachment", "[附件]", JsonSerializer.Serialize(payload, JsonContext.DictionaryStringString));
                    i += match.Length;
                    continue;
                }
            }

            // ![文件](lingcat://file?hash=xxx) 或 ![文件](file:xxx)
            if ((match = FileRegex.Match(rest)).Success)
            {
                // m[1] 可能是 "图片" / "Video=video.mp4" / "File=doc.pdf"
                // 剥掉 Video= / File= / Image= 或 图片- / 音频- 等前缀，只留文件名。
                var name = match.Groups[1].Value;
                var prefix = FileNamePrefixRegex.Match(name);
                if (prefix.Success) name = name[prefix.Length..];

                var payload = new Dictionary<string, string>
                {
                    ["hash"] = match.Groups[2].Value,
                    ["name"] = string.IsNullOrEmpty(name) ? "Unnamed" : name,
                };

                AddEntity("attachment", "[附件]", JsonSerializer.Serialize(payload, JsonContext.DictionaryStringString));
                i += match.Length;
                continue;
            }

            // [文字](url)
            if ((match = LinkRegex.Match(rest)).Success)
            {
                AddEntity("link", match.Groups[1].Value, match.Groups[2].Value);
                i += match.Length;
                continue;
            }

            // [reply:12345]
            if ((match = ReplyRegex.Match(rest)).Success)
            {
                AddEntity("reply", "[回复]", match.Groups[1].Value);
                i += match.Length;
                continue;
            }

            // 普通字符
            text.Append(input[i]);
            i++;
        }

        return new ParsedMessage(text.ToString(), entities);
    }

    /// <summary>把 text + entities 还原为轻量语法。</summary>
    public static string EntitiesToRawRichText(string text, IReadOnlyList<MessageEntity>? entities)
    {
        if (entities is null || entities.Count == 0) return text;

        var ordered = entities.OrderBy(e => e.Offset);
        var output = new StringBuilder();
        var cursor = 0;

        foreach (var entity in ordered)
        {
            var offset = (int)entity.Offset;
            var length = (int)entity.Length;

            if (offset > cursor && cursor < text.Length)
            {
                output.Append(text.AsSpan(cursor, Math.Min(offset, text.Length) - cursor));
            }

            var start = Math.Min(offset, text.Length);
            var seg = text.Substring(start, Math.Min(length, text.Length - start));

            switch (entity.Type)
            {
                case "bold":
                    output.Append("**").Append(seg).Append("**");
                    break;
                case "italic":
                    output.Append('*').Append(seg).Append('*');
                    break;
                case "code":
                    output.Append('`').Append(seg).Append('`');
                    break;
                case "strikethrough":
                    output.Append("~~").Append(seg).Append("~~");
                    break;
                case "spoiler":
                    output.Append("||").Append(seg).Append("||");
                    break;
                case "link":
                    output.Append('[').Append(seg).Append("](").Append(entity.Data).Append(')');
                    break;
                case "user_mention":
                    output.Append("[@").Append(TrimLeadingAt(seg)).Append("](user:")
                        .Append(entity.Data).Append(')');
                    break;
                case "chat_mention":
                    output.Append("[@").Append(TrimLeadingAt(seg)).Append("](chat:")
                        .Append(entity.Data).Append(')');
                    break;
                case "attachment":
                    output.Append(AttachmentToRaw(seg, entity.Data));
                    break;
                case "reply":
                    output.Append("[reply:").Append(entity.Data).Append(']');
                    break;
                default:
                    output.Append(seg);
                    break;
            }

            cursor = offset + length;
        }

        if (cursor < text.Length)
        {
            output.Append(text.AsSpan(cursor));
        }

        return output.ToString();
    }

    private static string AttachmentToRaw(string seg, string? data)
    {
        if (data is null) return seg;

        try
        {
            using var document = JsonDocument.Parse(data);
            var root = document.RootElement;

            var kind = root.TryGetProperty("kind", out var kindElement)
                ? kindElement.GetString()
                : null;
            var name = root.TryGetProperty("name", out var nameElement)
                ? nameElement.GetString()
                : null;

            if (kind == "sticker")
            {
                var hash = root.TryGetProperty("hash", out var hashElement)
                    ? hashElement.GetString()
                    : null;

                var parameters = new List<string>();
                if (!string.IsNullOrEmpty(hash)) parameters.Add("hash=" + UrlEncode(hash));

                if (root.TryGetProperty("packId", out var packElement))
                {
                    var packId = packElement.GetString();
                    if (!string.IsNullOrEmpty(packId))
                    {
                        parameters.Add("packId=" + UrlEncode(packId));
                    }
                }

                if (root.TryGetProperty("emoji", out var emojiElement))
                {
                    var emoji = emojiElement.GetString();
                    if (!string.IsNullOrEmpty(emoji))
                    {
                        parameters.Add("emoji=" + UrlEncode(emoji));
                    }
                }

                return $"![{(string.IsNullOrEmpty(name) ? "sticker" : name)}](lingcat://sticker?{string.Join("&", parameters)})";
            }

            var fileHash = root.TryGetProperty("hash", out var fileHashElement)
                ? fileHashElement.GetString()
                : null;

            return $"![{name}](file:{fileHash})";
        }
        catch (JsonException)
        {
            return seg;
        }
        catch (InvalidOperationException)
        {
            return seg;
        }
    }

    private static string TrimLeadingAt(string value)
    {
        return value.StartsWith('@') ? value[1..] : value;
    }

    private static Dictionary<string, string> ParseQuery(string query)
    {
        var result = new Dictionary<string, string>();

        foreach (var part in query.Split('&'))
        {
            if (part.Length == 0) continue;

            var separator = part.IndexOf('=');
            var key = separator >= 0 ? part[..separator] : part;
            var value = separator >= 0 ? part[(separator + 1)..] : string.Empty;

            result[DecodeQueryComponent(key)] = DecodeQueryComponent(value);
        }

        return result;
    }

    private static string DecodeQueryComponent(string value)
    {
        return Uri.UnescapeDataString(value.Replace("+", " "));
    }

    private static string UrlEncode(string value)
    {
        return Uri.EscapeDataString(value).Replace("%20", "+");
    }
}
