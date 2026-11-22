using Google.Protobuf;
using LingCat.Protocol;
using Lingcat.Classes;
using Lingcat.Methods;

namespace LingCat.ClientProtocol;

/// <summary>
/// 用户相关 API，对应 <c>client_protocol/UserApi.ts</c>。
/// 所有方法都需要先完成握手（<see cref="LingCatClient.Init"/> 或 <see cref="LingCatClient.ConnectAsync"/>）。
/// </summary>
public static class UserApi
{
    /// <summary>
    /// 注册新账号，返回用户 ID。
    /// </summary>
    public static async Task<string> RegisterAsync(
        this LingCatClient client,
        string password,
        string nickname,
        string? username = null,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var request = new User_Registration_Request
        {
            Password = password,
            Nickname = nickname,
        };
        if (username is not null)
        {
            request.Username = username;
        }

        var response = await InvokeAsync(
            client,
            Methods.User_Registration_Request,
            request,
            User_Registration_Response.Parser,
            timeout,
            cancellationToken).ConfigureAwait(false);

        return response.Id;
    }

    /// <summary>
    /// 登录并获取访问令牌。
    /// </summary>
    public static async Task<string> LoginAsync(
        this LingCatClient client,
        string account,
        string password,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var request = new User_Login_Request
        {
            Account = account,
            Password = password,
        };

        var response = await InvokeAsync(
            client,
            Methods.User_Login_Request,
            request,
            User_Login_Response.Parser,
            timeout,
            cancellationToken).ConfigureAwait(false);

        return response.AccessToken;
    }

    /// <summary>
    /// 验证访问令牌，使当前连接可以接收该用户的事件。
    /// </summary>
    public static async Task AuthorizeAsync(
        this LingCatClient client,
        string accessToken,
        string sessionId,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var request = new Authorize_Request
        {
            AccessToken = accessToken,
            SessionId = sessionId,
        };

        await InvokeAsync(
            client,
            Methods.Authorize_Request,
            request,
            Authorize_Response.Parser,
            timeout,
            cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// 查询当前登录用户的信息。
    /// </summary>
    public static async Task<IUser> QueryMyUserInfoAsync(
        this LingCatClient client,
        string accessToken,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var request = new Query_My_User_Info_Request
        {
            AccessToken = accessToken,
        };

        var response = await InvokeAsync(
            client,
            Methods.Query_My_User_Info_Request,
            request,
            Query_My_User_Info_Response.Parser,
            timeout,
            cancellationToken).ConfigureAwait(false);

        return response.Info
            ?? throw new InvalidOperationException("Query_My_User_Info_Response.info is missing");
    }

    /// <summary>
    /// 查询指定用户的信息。
    /// </summary>
    public static async Task<IUser> QueryUserInfoAsync(
        this LingCatClient client,
        string accessToken,
        string userId,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var request = new Query_User_Info_Request
        {
            AccessToken = accessToken,
            UserId = userId,
        };

        var response = await InvokeAsync(
            client,
            Methods.Query_User_Info_Request,
            request,
            Query_User_Info_Response.Parser,
            timeout,
            cancellationToken).ConfigureAwait(false);

        return response.Info
            ?? throw new InvalidOperationException("Query_User_Info_Response.info is missing");
    }

    /// <summary>
    /// 通过用户名获取用户 ID。
    /// </summary>
    public static async Task<string> GetUserIdByUsernameAsync(
        this LingCatClient client,
        string accessToken,
        string username,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var request = new Get_User_Id_By_Username_Request
        {
            AccessToken = accessToken,
            Username = username,
        };

        var response = await InvokeAsync(
            client,
            Methods.Get_User_Id_By_Username_Request,
            request,
            Get_User_Id_By_Username_Response.Parser,
            timeout,
            cancellationToken).ConfigureAwait(false);

        return response.UserId;
    }

    /// <summary>
    /// 更新当前用户资料。只提交非 <c>null</c> 的字段。
    /// </summary>
    public static async Task UpdateMyProfileAsync(
        this LingCatClient client,
        string accessToken,
        string? username = null,
        string? nickname = null,
        string? description = null,
        string? avatarFileHash = null,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var request = new Update_My_Profile_Request
        {
            AccessToken = accessToken,
        };
        if (!string.IsNullOrEmpty(username))
        {
            request.Username = username;
        }
        if (!string.IsNullOrEmpty(nickname))
        {
            request.Nickname = nickname;
        }
        if (!string.IsNullOrEmpty(description))
        {
            request.Description = description;
        }
        if (!string.IsNullOrEmpty(avatarFileHash))
        {
            request.AvatarFileHash = avatarFileHash;
        }

        await InvokeAsync(
            client,
            Methods.Update_My_Profile_Request,
            request,
            Update_My_Profile_Response.Parser,
            timeout,
            cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// 验证旧密码并获取修改密码用的临时令牌。
    /// </summary>
    public static async Task<string> VerifyPasswordIdentityAsync(
        this LingCatClient client,
        string accessToken,
        string oldPassword,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var request = new Verify_Password_Identity_Request
        {
            AccessToken = accessToken,
            OldPassword = oldPassword,
        };

        var response = await InvokeAsync(
            client,
            Methods.Verify_Password_Identity_Request,
            request,
            Verify_Password_Identity_Response.Parser,
            timeout,
            cancellationToken).ConfigureAwait(false);

        return response.ChangeToken;
    }

    /// <summary>
    /// 修改密码（需先调用 <see cref="VerifyPasswordIdentityAsync"/>）。
    /// </summary>
    public static async Task ChangePasswordAsync(
        this LingCatClient client,
        string accessToken,
        string changeToken,
        string newPassword,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var request = new Change_Password_Request
        {
            AccessToken = accessToken,
            ChangeToken = changeToken,
            NewPassword = newPassword,
        };

        await InvokeAsync(
            client,
            Methods.Change_Password_Request,
            request,
            Change_Password_Response.Parser,
            timeout,
            cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// 设置用户备注。空字符串表示删除备注。
    /// </summary>
    public static async Task SetUserRemarkAsync(
        this LingCatClient client,
        string accessToken,
        string targetUserId,
        string remark,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var request = new Set_User_Remark_Request
        {
            AccessToken = accessToken,
            TargetUserId = targetUserId,
            Remark = remark,
        };

        await InvokeAsync(
            client,
            Methods.Set_User_Remark_Request,
            request,
            Set_User_Remark_Response.Parser,
            timeout,
            cancellationToken).ConfigureAwait(false);
    }

    /// <summary>
    /// 获取当前用户的全部备注。
    /// </summary>
    public static async Task<IReadOnlyList<IUserRemark>> GetMyUserRemarksAsync(
        this LingCatClient client,
        string accessToken,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var request = new Get_My_User_Remarks_Request
        {
            AccessToken = accessToken,
        };

        var response = await InvokeAsync(
            client,
            Methods.Get_My_User_Remarks_Request,
            request,
            Get_My_User_Remarks_Response.Parser,
            timeout,
            cancellationToken).ConfigureAwait(false);

        return response.Remarks;
    }

    /// <summary>
    /// 批量查询用户在线状态。
    /// </summary>
    public static async Task<IReadOnlyDictionary<string, bool>> GetOnlineStatusAsync(
        this LingCatClient client,
        string accessToken,
        IEnumerable<string> userIds,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var request = new Get_Online_Status_Request
        {
            AccessToken = accessToken,
        };
        request.UserIds.AddRange(userIds);

        var response = await InvokeAsync(
            client,
            Methods.Get_Online_Status_Request,
            request,
            Get_Online_Status_Response.Parser,
            timeout,
            cancellationToken).ConfigureAwait(false);

        var result = new Dictionary<string, bool>();
        foreach (var status in response.Statuses)
        {
            if (!string.IsNullOrEmpty(status.UserId))
            {
                result[status.UserId] = status.Online;
            }
        }

        return result;
    }

    private static async Task<TResponse> InvokeAsync<TResponse>(
        LingCatClient client,
        uint methodId,
        Google.Protobuf.IMessage request,
        MessageParser<TResponse> parser,
        TimeSpan? timeout,
        CancellationToken cancellationToken)
        where TResponse : class, IMessage<TResponse>, new()
    {
        var package = await client.InvokeAsync(
            methodId,
            request.ToByteArray(),
            timeout: timeout,
            cancellationToken: cancellationToken).ConfigureAwait(false);

        return ProtoDecode.DecodeOrThrow(parser, package.Data);
    }
}
