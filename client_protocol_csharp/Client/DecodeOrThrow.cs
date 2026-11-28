using Google.Protobuf;
using ProtoMethods = Lingcat.Methods;

namespace LingCat.ClientProtocol.Client;

/// <summary>服务端返回的业务错误，对应 TS 版 decodeOrThrow 抛出的对象。</summary>
public sealed class ProtocolException : Exception
{
    public ProtocolException(uint requestMethod, string message, int code)
        : base(message)
    {
        RequestMethod = requestMethod;
        Code = code;
    }

    /// <summary>出错的方法 ID。</summary>
    public uint RequestMethod { get; }

    /// <summary>业务错误码（默认 -2）。</summary>
    public int Code { get; }
}

/// <summary>响应解码工具，移植自 client_protocol/decodeOrThrow.ts。</summary>
public static class ProtoDecode
{
    /// <summary>
    /// 先尝试把响应解析为 <c>Error_Response</c>，若包含请求方法与消息则抛
    /// <see cref="ProtocolException"/>，否则按目标类型解码。
    /// </summary>
    public static T DecodeOrThrow<T>(MessageParser<T> parser, byte[] data) where T : IMessage<T>
    {
        ProtoMethods.Error_Response? error = null;

        try
        {
            error = ProtoMethods.Error_Response.Parser.ParseFrom(data);
        }
        catch (InvalidProtocolBufferException)
        {
            // 正常响应字段 1 通常是 length-delimited，无法被 Error_Response 解析。
        }

        if (error is not null && error.RequestMethod != 0 && !string.IsNullOrEmpty(error.Message))
        {
            throw new ProtocolException(
                error.RequestMethod,
                error.Message,
                error.Code == 0 ? -2 : (int)error.Code);
        }

        return parser.ParseFrom(data);
    }

    /// <summary>发送请求并解码响应。</summary>
    public static async Task<T> InvokeAndDecodeAsync<T>(
        this LingCatClient client,
        uint methodId,
        IMessage request,
        MessageParser<T> parser,
        int timeoutMs = 20000) where T : IMessage<T>
    {
        var package = await client.Invoke(methodId, request.ToByteArray(), timeoutMs: timeoutMs)
            .ConfigureAwait(false);
        return DecodeOrThrow(parser, package.Data);
    }
}
