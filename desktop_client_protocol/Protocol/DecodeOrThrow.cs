using Google.Protobuf;

namespace LingCat.Protocol;

/// <summary>
/// 对应 <c>client_protocol/decodeOrThrow.ts</c>。
/// 先尝试解析 <see cref="Lingcat.Methods.Error_Response"/>，如果不是错误响应再解析目标消息。
/// </summary>
public static class ProtoDecode
{
    public static T DecodeOrThrow<T>(MessageParser<T> parser, ReadOnlySpan<byte> data)
        where T : class, IMessage<T>, new()
    {
        try
        {
            var error = Lingcat.Methods.Error_Response.Parser.ParseFrom(data.ToArray());
            if (error.RequestMethod != 0 && !string.IsNullOrEmpty(error.Message))
            {
                throw new LingCatApiException(
                    error.RequestMethod,
                    error.Message,
                    error.HasCode && error.Code != 0 ? (int)error.Code : -2);
            }
        }
        catch (InvalidProtocolBufferException)
        {
            // 不是 Error_Response，继续按目标消息解析。
        }

        return parser.ParseFrom(data.ToArray());
    }
}
