using ProtoClasses = Lingcat.Classes;

namespace LingCat.ClientProtocol.Client;

/// <summary>用户信息，对应协议中的 <c>IUser</c>。</summary>
public record User
{
    public required string Id { get; init; }
    public string? Username { get; init; }
    public required string Nickname { get; init; }
    public string? Description { get; init; }
    public string? AvatarFileHash { get; init; }
}

/// <summary>对话信息，对应协议中的 <c>IChat</c>。</summary>
public record Chat
{
    public required string Id { get; init; }

    /// <summary>私聊拿到的是对方的 title。</summary>
    public string? Title { get; init; }

    public string? ChatUnique { get; init; }

    /// <summary><c>private</c> 或 <c>group</c>。</summary>
    public required string Type { get; init; }

    public string? AvatarFileHash { get; init; }

    /// <summary>对话设置 JSON 字符串。</summary>
    public required string Settings { get; init; }

    public uint LastMessageId { get; init; }
    public ulong LastMessageTime { get; init; }
    public string? LastMessageText { get; init; }
    public string? Description { get; init; }

    /// <summary>当前用户是否为对话成员（客户端状态）。</summary>
    public bool? IsMember { get; init; }

    /// <summary>私聊时是对方用户 ID。</summary>
    public string? PeerUserId { get; init; }

    /// <summary>是否已收藏（客户端状态）。</summary>
    public bool? Favourited { get; init; }
}

/// <summary>群管理员，对应协议中的 <c>IChatAdmin</c>。</summary>
public record ChatAdmin : User
{
    /// <summary><c>owner</c> 或 <c>admin</c>。</summary>
    public required string Role { get; init; }

    /// <summary>权限 JSON 字符串。</summary>
    public required string Permissions { get; init; }

    public required string BelongToChatId { get; init; }
}

/// <summary>消息中的富文本实体，对应协议中的 <c>IMessageEntity</c>。</summary>
public record MessageEntity
{
    public required string Type { get; init; }

    /// <summary>UTF-16 码元起始位置。</summary>
    public required uint Offset { get; init; }

    /// <summary>UTF-16 码元长度。</summary>
    public required uint Length { get; init; }

    /// <summary>语义取决于 <see cref="Type"/>，纯样式实体可为 null。</summary>
    public string? Data { get; init; }
}

/// <summary>聊天消息，对应协议中的 <c>IMessage</c>。</summary>
public record Message
{
    public required uint Id { get; init; }
    public string? SenderUserId { get; init; }
    public bool? System { get; init; }
    public required string ChatId { get; init; }
    public required string Text { get; init; }
    public ulong Time { get; init; }
    public IReadOnlyList<MessageEntity> Entities { get; init; } = Array.Empty<MessageEntity>();
    public ulong? EditedAt { get; init; }
}

/// <summary>贴纸，对应协议中的 <c>ISticker</c>。</summary>
public record Sticker
{
    /// <summary>文件 sha256，同时是贴纸在包内的唯一标识。</summary>
    public required string Hash { get; init; }

    public required string PackId { get; init; }

    /// <summary>服务端识别出的真实 MIME。</summary>
    public required string Mime { get; init; }

    public string? Emoji { get; init; }
    public uint Sort { get; init; }
}

/// <summary>贴纸包，对应协议中的 <c>IStickerPack</c>。</summary>
public record StickerPack
{
    public required string Id { get; init; }
    public required string Title { get; init; }
    public required string AuthorUserId { get; init; }
    public string? CoverFileHash { get; init; }
    public ulong CreatedAt { get; init; }
    public ulong UpdatedAt { get; init; }

    /// <summary>当前用户是否已订阅。</summary>
    public bool? Subscribed { get; init; }

    /// <summary>当前用户是否为作者。</summary>
    public bool? IsAuthor { get; init; }
}

/// <summary>用户备注，对应协议中的 <c>IUserRemark</c>。</summary>
public record UserRemark
{
    public required string UserId { get; init; }
    public required string Remark { get; init; }
}

/// <summary>端到端加密密钥包，对应协议中的 <c>IUserE2EKey</c>。</summary>
public record UserE2EKey
{
    public required string PublicKey { get; init; }
    public required string EncryptedPrivateKey { get; init; }
    public required string KdfSalt { get; init; }
    public required string KdfParams { get; init; }
    public required string PrivNonce { get; init; }
    public int KeyVersion { get; init; }
}

/// <summary>其他用户的 E2E 公钥。</summary>
public record E2EPublicKey
{
    public required string UserId { get; init; }
    public required string PublicKey { get; init; }
}

/// <summary>会议在场成员。</summary>
public record MeetingParticipant
{
    /// <summary>LiveKit identity。</summary>
    public required string Identity { get; init; }

    public string? UserId { get; init; }
    public string? Nickname { get; init; }
    public string? Remark { get; init; }
    public string? AvatarFileHash { get; init; }
}

/// <summary>发起会议的结果。</summary>
public record MeetingStarted
{
    public required string MeetingId { get; init; }
    public required string Room { get; init; }
    public required string StarterUserId { get; init; }
}

/// <summary>加入会议所需的 LiveKit 凭证。</summary>
public record MeetingCredentials
{
    public required string Url { get; init; }
    public required string Room { get; init; }
    public required string Token { get; init; }
    public uint MaxParticipants { get; init; }
}

/// <summary>对话中正在进行的会议。</summary>
public record ActiveMeeting
{
    public bool HasMeeting { get; init; }
    public required string MeetingId { get; init; }
    public required string Room { get; init; }
    public required string StarterUserId { get; init; }
    public string? Title { get; init; }
}

/// <summary>会议在场成员列表。</summary>
public record MeetingParticipantList
{
    public required string MeetingId { get; init; }
    public required string Room { get; init; }
    public uint Count { get; init; }
    public IReadOnlyList<MeetingParticipant> Participants { get; init; } =
        Array.Empty<MeetingParticipant>();
}

/// <summary>加入对话的结果。</summary>
public record JoinChatResult
{
    public bool PendingApproval { get; init; }
}

/// <summary>解析轻量语法后的消息。</summary>
public record ParsedMessage(string Text, IReadOnlyList<MessageEntity> Entities);

/// <summary>协议层数据类到客户端模型的映射。</summary>
internal static class ProtoMapping
{
    public static User ToUser(ProtoClasses.IUser proto) => new()
    {
        Id = proto.Id,
        Username = proto.HasUsername ? proto.Username : null,
        Nickname = proto.Nickname,
        Description = proto.HasDescription ? proto.Description : null,
        AvatarFileHash = proto.HasAvatarFileHash ? proto.AvatarFileHash : null,
    };

    public static Chat ToChat(ProtoClasses.IChat proto) => new()
    {
        Id = proto.Id,
        Title = proto.HasTitle ? proto.Title : null,
        ChatUnique = proto.HasChatUnique ? proto.ChatUnique : null,
        Type = proto.Type,
        AvatarFileHash = proto.HasAvatarFileHash ? proto.AvatarFileHash : null,
        Settings = proto.Settings,
        LastMessageId = proto.LastMessageId,
        LastMessageTime = proto.LastMessageTime,
        LastMessageText = proto.HasLastMessageText ? proto.LastMessageText : null,
        Description = proto.HasDescription ? proto.Description : null,
        IsMember = proto.IsMember,
        PeerUserId = proto.HasPeerUserId ? proto.PeerUserId : null,
        Favourited = proto.HasFavourited ? proto.Favourited : null,
    };

    public static ChatAdmin ToChatAdmin(ProtoClasses.IChatAdmin proto) => new()
    {
        Id = proto.Id,
        Username = proto.HasUsername ? proto.Username : null,
        Nickname = proto.Nickname,
        Description = proto.HasDescription ? proto.Description : null,
        AvatarFileHash = proto.HasAvatarFileHash ? proto.AvatarFileHash : null,
        Role = proto.Role,
        Permissions = proto.Permissions,
        BelongToChatId = proto.BelongToChatId,
    };

    public static MessageEntity ToMessageEntity(ProtoClasses.IMessageEntity proto) => new()
    {
        Type = proto.Type,
        Offset = proto.Offset,
        Length = proto.Length,
        Data = proto.HasData ? proto.Data : null,
    };

    public static Message ToMessage(ProtoClasses.IMessage proto) => new()
    {
        Id = proto.Id,
        SenderUserId = proto.HasSenderUserId ? proto.SenderUserId : null,
        System = proto.HasSystem ? proto.System : null,
        ChatId = proto.ChatId,
        Text = proto.Text,
        Time = proto.Time,
        Entities = proto.Entities.Select(ToMessageEntity).ToArray(),
        EditedAt = proto.HasEditedAt ? proto.EditedAt : null,
    };

    public static Sticker ToSticker(ProtoClasses.ISticker proto) => new()
    {
        Hash = proto.Hash,
        PackId = proto.PackId,
        Mime = proto.Mime,
        Emoji = proto.HasEmoji ? proto.Emoji : null,
        Sort = proto.Sort,
    };

    public static StickerPack ToStickerPack(ProtoClasses.IStickerPack proto) => new()
    {
        Id = proto.Id,
        Title = proto.Title,
        AuthorUserId = proto.AuthorUserId,
        CoverFileHash = proto.HasCoverFileHash ? proto.CoverFileHash : null,
        CreatedAt = proto.CreatedAt,
        UpdatedAt = proto.UpdatedAt,
        Subscribed = proto.HasSubscribed ? proto.Subscribed : null,
        IsAuthor = proto.HasIsAuthor ? proto.IsAuthor : null,
    };

    public static UserE2EKey ToUserE2EKey(ProtoClasses.IUserE2EKey proto) => new()
    {
        PublicKey = proto.PublicKey,
        EncryptedPrivateKey = proto.EncryptedPrivateKey,
        KdfSalt = proto.KdfSalt,
        KdfParams = proto.KdfParams,
        PrivNonce = proto.PrivNonce,
        KeyVersion = proto.KeyVersion,
    };

    public static MeetingParticipant ToMeetingParticipant(ProtoClasses.IMeetingParticipant proto) => new()
    {
        Identity = proto.Identity,
        UserId = proto.HasUserId ? proto.UserId : null,
        Nickname = proto.HasNickname ? proto.Nickname : null,
        Remark = proto.HasRemark ? proto.Remark : null,
        AvatarFileHash = proto.HasAvatarFileHash ? proto.AvatarFileHash : null,
    };

    public static ProtoClasses.IMessageEntity ToProto(MessageEntity entity)
    {
        var proto = new ProtoClasses.IMessageEntity
        {
            Type = entity.Type,
            Offset = entity.Offset,
            Length = entity.Length,
        };

        if (entity.Data is not null) proto.Data = entity.Data;
        return proto;
    }
}
