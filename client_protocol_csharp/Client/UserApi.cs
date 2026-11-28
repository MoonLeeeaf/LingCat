using ProtoMethods = Lingcat.Methods;

namespace LingCat.ClientProtocol.Client;

/// <summary>用户相关 API，移植自 client_protocol/UserApi.ts。</summary>
public static class UserApi
{
    public sealed record RegisterOptions(
        string Password,
        string Nickname,
        string? Username = null,
        int TimeoutMs = 20000);

    /// <summary>注册新的账号，返回用户 ID。</summary>
    public static async Task<string> RegisterAsync(LingCatClient client, RegisterOptions options)
    {
        var request = new ProtoMethods.User_Registration_Request
        {
            Password = options.Password,
            Nickname = options.Nickname,
        };

        if (options.Username is not null) request.Username = options.Username;

        var response = await client.InvokeAndDecodeAsync(
            Methods.User_Registration_Request,
            request,
            ProtoMethods.User_Registration_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Id;
    }

    public sealed record LoginOptions(string Account, string Password, int TimeoutMs = 20000);

    /// <summary>获取访问令牌。</summary>
    public static async Task<string> LoginAsync(LingCatClient client, LoginOptions options)
    {
        var request = new ProtoMethods.User_Login_Request
        {
            Account = options.Account,
            Password = options.Password,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.User_Login_Request,
            request,
            ProtoMethods.User_Login_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.AccessToken;
    }

    public sealed record AuthorizeOptions(string AccessToken, string SessionId, int TimeoutMs = 20000);

    /// <summary>验证访问令牌以接受客户端事件。</summary>
    public static Task AuthorizeAsync(LingCatClient client, AuthorizeOptions options)
    {
        var request = new ProtoMethods.Authorize_Request
        {
            AccessToken = options.AccessToken,
            SessionId = options.SessionId,
        };

        return client.InvokeAndDecodeAsync(
            Methods.Authorize_Request,
            request,
            ProtoMethods.Authorize_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record QueryMyUserInfoOptions(string AccessToken, int TimeoutMs = 20000);

    /// <summary>查询我的用户信息。</summary>
    public static async Task<User> QueryMyUserInfoAsync(
        LingCatClient client,
        QueryMyUserInfoOptions options)
    {
        var request = new ProtoMethods.Query_My_User_Info_Request
        {
            AccessToken = options.AccessToken,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Query_My_User_Info_Request,
            request,
            ProtoMethods.Query_My_User_Info_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return ProtoMapping.ToUser(response.Info);
    }

    public sealed record QueryUserInfoOptions(
        string AccessToken,
        string UserId,
        int TimeoutMs = 20000);

    /// <summary>查询用户信息。</summary>
    public static async Task<User> QueryUserInfoAsync(
        LingCatClient client,
        QueryUserInfoOptions options)
    {
        var request = new ProtoMethods.Query_User_Info_Request
        {
            AccessToken = options.AccessToken,
            UserId = options.UserId,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Query_User_Info_Request,
            request,
            ProtoMethods.Query_User_Info_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return ProtoMapping.ToUser(response.Info);
    }

    public sealed record GetUserIdByUsernameOptions(
        string AccessToken,
        string Username,
        int TimeoutMs = 20000);

    /// <summary>通过用户名获取用户 ID。</summary>
    public static async Task<string> GetUserIdByUsernameAsync(
        LingCatClient client,
        GetUserIdByUsernameOptions options)
    {
        var request = new ProtoMethods.Get_User_Id_By_Username_Request
        {
            AccessToken = options.AccessToken,
            Username = options.Username,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_User_Id_By_Username_Request,
            request,
            ProtoMethods.Get_User_Id_By_Username_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.UserId;
    }

    public sealed record UpdateMyProfileOptions(
        string AccessToken,
        string? Username = null,
        string? Nickname = null,
        string? Description = null,
        string? AvatarFileHash = null,
        int TimeoutMs = 20000);

    /// <summary>更新我的资料。</summary>
    public static Task UpdateMyProfileAsync(LingCatClient client, UpdateMyProfileOptions options)
    {
        var request = new ProtoMethods.Update_My_Profile_Request
        {
            AccessToken = options.AccessToken,
        };

        if (options.Username is not null) request.Username = options.Username;
        if (options.Nickname is not null) request.Nickname = options.Nickname;
        if (options.Description is not null) request.Description = options.Description;
        if (options.AvatarFileHash is not null) request.AvatarFileHash = options.AvatarFileHash;

        return client.InvokeAndDecodeAsync(
            Methods.Update_My_Profile_Request,
            request,
            ProtoMethods.Update_My_Profile_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record VerifyPasswordIdentityOptions(
        string AccessToken,
        string OldPassword,
        int TimeoutMs = 20000);

    /// <summary>验证身份并获取修改密码的临时令牌。</summary>
    public static async Task<string> VerifyPasswordIdentityAsync(
        LingCatClient client,
        VerifyPasswordIdentityOptions options)
    {
        var request = new ProtoMethods.Verify_Password_Identity_Request
        {
            AccessToken = options.AccessToken,
            OldPassword = options.OldPassword,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Verify_Password_Identity_Request,
            request,
            ProtoMethods.Verify_Password_Identity_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.ChangeToken;
    }

    public sealed record ChangePasswordOptions(
        string AccessToken,
        string ChangeToken,
        string NewPassword,
        int TimeoutMs = 20000);

    /// <summary>修改密码（需先获取 change_token）。</summary>
    public static Task ChangePasswordAsync(LingCatClient client, ChangePasswordOptions options)
    {
        var request = new ProtoMethods.Change_Password_Request
        {
            AccessToken = options.AccessToken,
            ChangeToken = options.ChangeToken,
            NewPassword = options.NewPassword,
        };

        return client.InvokeAndDecodeAsync(
            Methods.Change_Password_Request,
            request,
            ProtoMethods.Change_Password_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record SetUserRemarkOptions(
        string AccessToken,
        string TargetUserId,
        string Remark,
        int TimeoutMs = 20000);

    /// <summary>设置某个用户的备注（仅自己可见，空字符串表示删除）。</summary>
    public static Task SetUserRemarkAsync(LingCatClient client, SetUserRemarkOptions options)
    {
        var request = new ProtoMethods.Set_User_Remark_Request
        {
            AccessToken = options.AccessToken,
            TargetUserId = options.TargetUserId,
            Remark = options.Remark,
        };

        return client.InvokeAndDecodeAsync(
            Methods.Set_User_Remark_Request,
            request,
            ProtoMethods.Set_User_Remark_Response.Parser,
            options.TimeoutMs);
    }

    public sealed record GetMyUserRemarksOptions(string AccessToken, int TimeoutMs = 20000);

    /// <summary>获取我的全部用户备注。</summary>
    public static async Task<IReadOnlyList<UserRemark>> GetMyUserRemarksAsync(
        LingCatClient client,
        GetMyUserRemarksOptions options)
    {
        var request = new ProtoMethods.Get_My_User_Remarks_Request
        {
            AccessToken = options.AccessToken,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_My_User_Remarks_Request,
            request,
            ProtoMethods.Get_My_User_Remarks_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Remarks
            .Select(r => new UserRemark { UserId = r.UserId, Remark = r.Remark })
            .ToArray();
    }

    public sealed record GetOnlineStatusOptions(
        string AccessToken,
        IReadOnlyList<string> UserIds,
        int TimeoutMs = 20000);

    /// <summary>批量查询用户在线状态，返回 userId -> online。</summary>
    public static async Task<IReadOnlyDictionary<string, bool>> GetOnlineStatusAsync(
        LingCatClient client,
        GetOnlineStatusOptions options)
    {
        var request = new ProtoMethods.Get_Online_Status_Request
        {
            AccessToken = options.AccessToken,
        };
        request.UserIds.AddRange(options.UserIds);

        var response = await client.InvokeAndDecodeAsync(
            Methods.Get_Online_Status_Request,
            request,
            ProtoMethods.Get_Online_Status_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        var result = new Dictionary<string, bool>();
        foreach (var status in response.Statuses)
        {
            if (!string.IsNullOrEmpty(status.UserId)) result[status.UserId] = status.Online;
        }

        return result;
    }
}
