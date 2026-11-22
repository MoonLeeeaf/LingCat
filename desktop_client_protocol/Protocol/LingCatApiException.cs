namespace LingCat.Protocol;

/// <summary>
/// 服务端返回的业务错误。
/// </summary>
public sealed class LingCatApiException : Exception
{
    public uint RequestMethod { get; }
    public int Code { get; }

    public LingCatApiException(uint requestMethod, string message, int code = -2)
        : base(message)
    {
        RequestMethod = requestMethod;
        Code = code;
    }
}
