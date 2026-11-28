using ProtoMethods = Lingcat.Methods;

namespace LingCat.ClientProtocol.Client;

/// <summary>会议 API，移植自 client_protocol/MeetingApi.ts。</summary>
public static class MeetingApi
{
    public sealed record StartMeetingOptions(
        string AccessToken,
        string ChatId,
        string? Title = null,
        int TimeoutMs = 20000);

    /// <summary>发起会议；服务端会向对话成员广播 <c>Meeting_Started_Event</c>。</summary>
    public static async Task<MeetingStarted> StartMeetingAsync(
        LingCatClient client,
        StartMeetingOptions options)
    {
        var request = new ProtoMethods.Start_Meeting_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
        };

        if (options.Title is not null) request.Title = options.Title;

        var response = await client.InvokeAndDecodeAsync(
            Methods.Start_Meeting_Request,
            request,
            ProtoMethods.Start_Meeting_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return new MeetingStarted
        {
            MeetingId = response.MeetingId,
            Room = response.Room,
            StarterUserId = response.StarterUserId,
        };
    }

    public sealed record GetMeetingTokenOptions(
        string AccessToken,
        string ChatId,
        string MeetingId,
        int TimeoutMs = 20000);

    /// <summary>获取加入指定会议所需的 LiveKit 令牌。</summary>
    public static async Task<MeetingCredentials> GetMeetingTokenAsync(
        LingCatClient client,
        GetMeetingTokenOptions options)
    {
        var request = new ProtoMethods.Get_Meeting_Token_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
            MeetingId = options.MeetingId,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_Meeting_Token_Request,
            request,
            ProtoMethods.Get_Meeting_Token_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return new MeetingCredentials
        {
            Url = response.Url,
            Room = response.Room,
            Token = response.Token,
            MaxParticipants = response.MaxParticipants,
        };
    }

    public sealed record GetActiveMeetingOptions(
        string AccessToken,
        string ChatId,
        int TimeoutMs = 20000);

    /// <summary>查询对话中正在进行的会议。</summary>
    public static async Task<ActiveMeeting> GetActiveMeetingAsync(
        LingCatClient client,
        GetActiveMeetingOptions options)
    {
        var request = new ProtoMethods.Get_Active_Meeting_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_Active_Meeting_Request,
            request,
            ProtoMethods.Get_Active_Meeting_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return new ActiveMeeting
        {
            HasMeeting = response.HasMeeting,
            MeetingId = response.MeetingId,
            Room = response.Room,
            StarterUserId = response.StarterUserId,
            Title = response.HasTitle ? response.Title : null,
        };
    }

    public sealed record EndMeetingOptions(
        string AccessToken,
        string ChatId,
        string MeetingId,
        int TimeoutMs = 20000);

    /// <summary>结束会议（发起人 / 群主 / 管理员）。</summary>
    public static Task EndMeetingAsync(LingCatClient client, EndMeetingOptions options)
    {
        var request = new ProtoMethods.End_Meeting_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
            MeetingId = options.MeetingId,
        };

        return client.InvokeAndDecodeAsync(
            Methods.End_Meeting_Request,
            request,
            ProtoMethods.End_Meeting_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record GetMeetingParticipantsOptions(
        string AccessToken,
        string ChatId,
        string? MeetingId = null,
        int TimeoutMs = 20000);

    /// <summary>查询会议在场成员（供横幅显示人数/头像堆叠）。</summary>
    public static async Task<MeetingParticipantList> GetMeetingParticipantsAsync(
        LingCatClient client,
        GetMeetingParticipantsOptions options)
    {
        var request = new ProtoMethods.Get_Meeting_Participants_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
        };

        if (options.MeetingId is not null) request.MeetingId = options.MeetingId;

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_Meeting_Participants_Request,
            request,
            ProtoMethods.Get_Meeting_Participants_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return new MeetingParticipantList
        {
            MeetingId = response.MeetingId,
            Room = response.Room,
            Count = response.Count,
            Participants = response.Participants
                .Select(ProtoMapping.ToMeetingParticipant)
                .ToArray(),
        };
    }

    public sealed record UpdateMeetingTitleOptions(
        string AccessToken,
        string ChatId,
        string MeetingId,
        string Title,
        int TimeoutMs = 20000);

    /// <summary>修改进行中会议的标题。</summary>
    public static async Task<string> UpdateMeetingTitleAsync(
        LingCatClient client,
        UpdateMeetingTitleOptions options)
    {
        var request = new ProtoMethods.Update_Meeting_Title_Request
        {
            AccessToken = options.AccessToken,
            ChatId = options.ChatId,
            MeetingId = options.MeetingId,
            Title = options.Title,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Update_Meeting_Title_Request,
            request,
            ProtoMethods.Update_Meeting_Title_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Title;
    }
}
