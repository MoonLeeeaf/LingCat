using System.Text.Json;
using ProtoMethods = Lingcat.Methods;

namespace LingCat.ClientProtocol.Client;

/// <summary>对话相关 API，移植自 client_protocol/ChatApi.ts。</summary>
public static class ChatApi
{
    public sealed record AddChatAdminOptions(
        string AccessToken,
        string ChatId,
        string TargetUserId,
        IReadOnlyDictionary<string, bool>? Permissions = null,
        int TimeoutMs = 20000);

    /// <summary>添加管理员（仅群主可操作）。</summary>
    public static Task AddChatAdminAsync(LingCatClient client, AddChatAdminOptions options)
    {
        var request = new ProtoMethods.Add_Chat_Admin_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
            TargetUserId = options.TargetUserId,
        };

        if (options.Permissions is not null)
        {
            request.Permissions = JsonSerializer.Serialize(options.Permissions);
        }

        return client.InvokeAndDecodeAsync(
            Methods.Add_Chat_Admin_Request,
            request,
            ProtoMethods.Add_Chat_Admin_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record EditChatAdminPermissionsOptions(
        string AccessToken,
        string ChatId,
        string TargetUserId,
        IReadOnlyDictionary<string, bool> Permissions,
        int TimeoutMs = 20000);

    /// <summary>修改管理员权限。</summary>
    public static Task EditChatAdminPermissionsAsync(
        LingCatClient client,
        EditChatAdminPermissionsOptions options)
    {
        var request = new ProtoMethods.Edit_Chat_Admin_Permissions_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
            TargetUserId = options.TargetUserId,
            Permissions = JsonSerializer.Serialize(options.Permissions),
        };

        return client.InvokeAndDecodeAsync(
            Methods.Edit_Chat_Admin_Permissions_Request,
            request,
            ProtoMethods.Edit_Chat_Admin_Permissions_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record RemoveChatAdminOptions(
        string AccessToken,
        string ChatId,
        string TargetUserId,
        int TimeoutMs = 20000);

    /// <summary>删除管理员。</summary>
    public static Task RemoveChatAdminAsync(LingCatClient client, RemoveChatAdminOptions options)
    {
        var request = new ProtoMethods.Remove_Chat_Admin_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
            TargetUserId = options.TargetUserId,
        };

        return client.InvokeAndDecodeAsync(
            Methods.Remove_Chat_Admin_Request,
            request,
            ProtoMethods.Remove_Chat_Admin_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record JoinChatOptions(
        string AccessToken,
        string ChatId,
        string? Answer = null,
        int TimeoutMs = 20000);

    /// <summary>加入对话。</summary>
    public static async Task<JoinChatResult> JoinChatAsync(LingCatClient client, JoinChatOptions options)
    {
        var request = new ProtoMethods.Join_Chat_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
        };

        if (options.Answer is not null) request.Answer = options.Answer;

        var response = await client.InvokeAndDecodeAsync(
            Methods.Join_Chat_Request,
            request,
            ProtoMethods.Join_Chat_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return new JoinChatResult { PendingApproval = response.PendingApproval };
    }

    public sealed record RemoveChatMemberOptions(
        string AccessToken,
        string ChatId,
        string TargetUserId,
        int TimeoutMs = 20000);

    /// <summary>移除群成员。</summary>
    public static Task RemoveChatMemberAsync(
        LingCatClient client,
        RemoveChatMemberOptions options)
    {
        var request = new ProtoMethods.Remove_Chat_Member_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
            TargetUserId = options.TargetUserId,
        };

        return client.InvokeAndDecodeAsync(
            Methods.Remove_Chat_Member_Request,
            request,
            ProtoMethods.Remove_Chat_Member_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record UpdateChatSettingsOptions(
        string AccessToken,
        string ChatId,
        IReadOnlyDictionary<string, object?> Settings,
        int TimeoutMs = 20000);

    /// <summary>更新群设置（JSON 格式）。</summary>
    public static Task UpdateChatSettingsAsync(
        LingCatClient client,
        UpdateChatSettingsOptions options)
    {
        var request = new ProtoMethods.Update_Chat_Settings_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
            Settings = JsonSerializer.Serialize(options.Settings),
        };

        return client.InvokeAndDecodeAsync(
            Methods.Update_Chat_Settings_Request,
            request,
            ProtoMethods.Update_Chat_Settings_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record UpdateChatProfileOptions(
        string AccessToken,
        string ChatId,
        string? AvatarFileHash = null,
        string? Title = null,
        string? Description = null,
        string? Unique = null,
        int TimeoutMs = 20000);

    /// <summary>更新群资料（头像、标题、描述）。</summary>
    public static Task UpdateChatProfileAsync(
        LingCatClient client,
        UpdateChatProfileOptions options)
    {
        var request = new ProtoMethods.Update_Chat_Profile_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
        };

        if (options.AvatarFileHash is not null) request.AvatarFileHash = options.AvatarFileHash;
        if (options.Title is not null) request.Title = options.Title;
        if (options.Description is not null) request.Description = options.Description;
        if (options.Unique is not null) request.Unique = options.Unique;

        return client.InvokeAndDecodeAsync(
            Methods.Update_Chat_Profile_Request,
            request,
            ProtoMethods.Update_Chat_Profile_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record GetChatAdminsOptions(
        string AccessToken,
        string ChatId,
        int TimeoutMs = 20000);

    /// <summary>获取群管理员列表。</summary>
    public static async Task<IReadOnlyList<ChatAdmin>> GetChatAdminsAsync(
        LingCatClient client,
        GetChatAdminsOptions options)
    {
        var request = new ProtoMethods.Get_Chat_Admins_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_Chat_Admins_Request,
            request,
            ProtoMethods.Get_Chat_Admins_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Admins.Select(ProtoMapping.ToChatAdmin).ToArray();
    }

    public sealed record GetChatMembersOptions(
        string AccessToken,
        string ChatId,
        int TimeoutMs = 20000);

    /// <summary>获取群成员列表。</summary>
    public static async Task<IReadOnlyList<User>> GetChatMembersAsync(
        LingCatClient client,
        GetChatMembersOptions options)
    {
        var request = new ProtoMethods.Get_Chat_Members_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_Chat_Members_Request,
            request,
            ProtoMethods.Get_Chat_Members_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Members.Select(ProtoMapping.ToUser).ToArray();
    }

    public sealed record GetOrCreatePrivateChatOptions(
        string AccessToken,
        string TargetUserId,
        int TimeoutMs = 20000);

    /// <summary>创建/获取私聊对话的 ID。</summary>
    public static async Task<string> GetOrCreatePrivateChatAsync(
        LingCatClient client,
        GetOrCreatePrivateChatOptions options)
    {
        var request = new ProtoMethods.Get_Or_Create_Private_Chat_Request
        {
            AccessToken = options.AccessToken,
            TargetUserId = options.TargetUserId,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_Or_Create_Private_Chat_Request,
            request,
            ProtoMethods.Get_Or_Create_Private_Chat_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.ChatId;
    }

    public sealed record GetAnotherUserFromPrivateChatOptions(
        string AccessToken,
        string TargetChatId,
        int TimeoutMs = 20000);

    /// <summary>
    /// 从私聊中获取另一个用户的 ID；若该私聊只有当前用户自己（如“已保存消息”），
    /// 则返回自己的 ID。
    /// </summary>
    public static async Task<string> GetAnotherUserFromPrivateChatAsync(
        LingCatClient client,
        GetAnotherUserFromPrivateChatOptions options)
    {
        var request = new ProtoMethods.Get_Another_User_From_Private_Chat_Request
        {
            AccessToken = options.AccessToken,
            TargetChatId = options.TargetChatId,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_Another_User_From_Private_Chat_Request,
            request,
            ProtoMethods.Get_Another_User_From_Private_Chat_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.UserId;
    }

    public sealed record QueryChatInfoOptions(
        string AccessToken,
        string ChatId,
        int TimeoutMs = 20000);

    /// <summary>获取对话信息。</summary>
    public static async Task<Chat> QueryChatInfoAsync(
        LingCatClient client,
        QueryChatInfoOptions options)
    {
        var request = new ProtoMethods.Query_Chat_Info_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Query_Chat_Info_Request,
            request,
            ProtoMethods.Query_Chat_Info_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return ProtoMapping.ToChat(response.Info);
    }

    public sealed record GetChatMessagesOptions(
        string AccessToken,
        string ChatId,
        uint? Before = null,
        uint? After = null,
        uint? Limit = null,
        int TimeoutMs = 20000);

    /// <summary>获取对话的消息。</summary>
    public static async Task<IReadOnlyList<Message>> GetChatMessagesAsync(
        LingCatClient client,
        GetChatMessagesOptions options)
    {
        var request = new ProtoMethods.Get_Chat_Messages_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
        };

        if (options.Before.HasValue) request.Before = options.Before.Value;
        if (options.After.HasValue) request.After = options.After.Value;
        if (options.Limit.HasValue) request.Limit = options.Limit.Value;

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_Chat_Messages_Request,
            request,
            ProtoMethods.Get_Chat_Messages_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Messages.Select(ProtoMapping.ToMessage).ToArray();
    }

    public sealed record SendChatMessageOptions(
        string AccessToken,
        string ChatId,
        string Text,
        IReadOnlyList<MessageEntity>? Entities = null,
        int TimeoutMs = 20000);

    /// <summary>发送消息，返回该消息的 ID。</summary>
    public static async Task<uint> SendChatMessageAsync(
        LingCatClient client,
        SendChatMessageOptions options)
    {
        var request = new ProtoMethods.Send_Chat_Message_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
            Text = options.Text,
        };

        if (options.Entities is not null)
        {
            request.Entities.AddRange(options.Entities.Select(ProtoMapping.ToProto));
        }

        var response = await client.InvokeAndDecodeAsync(
            Methods.Send_Chat_Message_Request,
            request,
            ProtoMethods.Send_Chat_Message_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Id;
    }

    public sealed record EditChatMessageOptions(
        string AccessToken,
        string ChatId,
        uint MessageId,
        string Text,
        IReadOnlyList<MessageEntity>? Entities = null,
        int TimeoutMs = 20000);

    /// <summary>编辑消息。</summary>
    public static Task EditChatMessageAsync(LingCatClient client, EditChatMessageOptions options)
    {
        var request = new ProtoMethods.Edit_Chat_Message_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
            MessageId = options.MessageId,
            Text = options.Text,
        };

        if (options.Entities is not null)
        {
            request.Entities.AddRange(options.Entities.Select(ProtoMapping.ToProto));
        }

        return client.InvokeAndDecodeAsync(
            Methods.Edit_Chat_Message_Request,
            request,
            ProtoMethods.Edit_Chat_Message_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record GetMyChatsOptions(
        string AccessToken,
        uint? Limit = null,
        uint? Offset = null,
        int TimeoutMs = 20000);

    /// <summary>获取我的所有对话。</summary>
    public static async Task<IReadOnlyList<Chat>> GetMyChatsAsync(
        LingCatClient client,
        GetMyChatsOptions options)
    {
        var request = new ProtoMethods.Get_My_Chats_Request
        {
            AccessToken = options.AccessToken,
        };

        if (options.Limit.HasValue) request.Limit = options.Limit.Value;
        if (options.Offset.HasValue) request.Offset = options.Offset.Value;

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_My_Chats_Request,
            request,
            ProtoMethods.Get_My_Chats_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Chats.Select(ProtoMapping.ToChat).ToArray();
    }

    public sealed record SetChatFavouritedOptions(
        string AccessToken,
        string ChatId,
        bool Favourited,
        int TimeoutMs = 20000);

    /// <summary>设置对话的收藏状态。</summary>
    public static Task SetChatFavouritedAsync(
        LingCatClient client,
        SetChatFavouritedOptions options)
    {
        var request = new ProtoMethods.Set_Chat_Favourited_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
            Favourited = options.Favourited,
        };

        return client.InvokeAndDecodeAsync(
            Methods.Set_Chat_Favourited_Request,
            request,
            ProtoMethods.Set_Chat_Favourited_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record GetMyFavouriteChatsOptions(
        string AccessToken,
        uint? Limit = null,
        uint? Offset = null,
        int TimeoutMs = 20000);

    /// <summary>
    /// 获取我的收藏对话。
    /// <para>已废弃：请使用 <see cref="GetMyChatsAsync"/> 返回的 <see cref="Chat.Favourited"/> 本地筛选。</para>
    /// </summary>
    public static async Task<IReadOnlyList<Chat>> GetMyFavouriteChatsAsync(
        LingCatClient client,
        GetMyFavouriteChatsOptions options)
    {
#pragma warning disable CS0612 // 兼容旧客户端的废弃接口
        var request = new ProtoMethods.Get_My_Favourite_Chats_Request
        {
            AccessToken = options.AccessToken,
        };

        if (options.Limit.HasValue) request.Limit = options.Limit.Value;
        if (options.Offset.HasValue) request.Offset = options.Offset.Value;

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_My_Favourite_Chats_Request,
            request,
            ProtoMethods.Get_My_Favourite_Chats_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Chats.Select(ProtoMapping.ToChat).ToArray();
#pragma warning restore CS0612
    }

    public sealed record SearchMyChatsOptions(
        string AccessToken,
        string Keyword,
        uint? Limit = null,
        int TimeoutMs = 20000);

    /// <summary>搜索我的对话。</summary>
    public static async Task<IReadOnlyList<Chat>> SearchMyChatsAsync(
        LingCatClient client,
        SearchMyChatsOptions options)
    {
        var request = new ProtoMethods.Search_My_Chats_Request
        {
            AccessToken = options.AccessToken,
            Keyword = options.Keyword,
        };

        if (options.Limit.HasValue) request.Limit = options.Limit.Value;

        var response = await client.InvokeAndDecodeAsync(
            Methods.Search_My_Chats_Request,
            request,
            ProtoMethods.Search_My_Chats_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Chats.Select(ProtoMapping.ToChat).ToArray();
    }

    public sealed record ResolveChatIdentifierOptions(
        string AccessToken,
        string Identifier,
        int TimeoutMs = 20000);

    /// <summary>把对话标识（如 unique）解析为 chat_id。</summary>
    public static async Task<string> ResolveChatIdentifierAsync(
        LingCatClient client,
        ResolveChatIdentifierOptions options)
    {
        var request = new ProtoMethods.Resolve_Chat_Identifier_Request
        {
            AccessToken = options.AccessToken,
            Identifier = options.Identifier,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Resolve_Chat_Identifier_Request,
            request,
            ProtoMethods.Resolve_Chat_Identifier_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.ChatId;
    }

    public sealed record CreateGroupOptions(
        string AccessToken,
        string Title,
        string? Unique = null,
        int TimeoutMs = 20000);

    /// <summary>创建群组，返回 chat_id。</summary>
    public static async Task<string> CreateGroupAsync(LingCatClient client, CreateGroupOptions options)
    {
        var request = new ProtoMethods.Create_Group_Request
        {
            AccessToken = options.AccessToken,
            Title = options.Title,
        };

        if (options.Unique is not null) request.Unique = options.Unique;

        var response = await client.InvokeAndDecodeAsync(
            Methods.Create_Group_Request,
            request,
            ProtoMethods.Create_Group_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.ChatId;
    }
}
