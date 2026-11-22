namespace LingCat.Protocol;

/// <summary>
/// 协议错误码，对应 <c>protocol/Code.ts</c>。
/// </summary>
public static class Code
{
    public const uint UnAuthorized = 401;
    public const uint Internal_Server_Error = 500;
    public const uint Bad_Request = 400;
    public const uint Not_Found = 404;
    public const uint Forbidden = 403;
}
