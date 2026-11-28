using System.Buffers.Binary;
using System.Security.Cryptography;
using Google.Protobuf;
using Org.BouncyCastle.Crypto.Modes;
using Org.BouncyCastle.Crypto.Parameters;
using ProtoPackage = Lingcat.Classes.Package;

namespace LingCat.ClientProtocol.Client;

/// <summary>
/// 协议数据包封装，移植自 protocol/Package.ts。
/// 负责请求 ID 生成、序列化、XChaCha20-Poly1305 加解密。
/// </summary>
public sealed class Package
{
    public const uint FlagEncrypted = 1u << 0;
    public const uint FlagReserved = 1u << 1;
    public const uint ProtocolVersionDefault = 2;

    private const int AeadTagBytes = 16;
    private const int XChaChaNonceBytes = 24;

    public uint MethodId { get; set; } = uint.MaxValue;
    public int Length { get; set; } = -1;
    public uint Flags { get; set; }
    public byte[] RequestId { get; set; } = Array.Empty<byte>();
    public byte[] Data { get; set; } = Array.Empty<byte>();

    /// <summary>发送/接收序列号。未加密时为 -1。</summary>
    public long Seq { get; set; } = -1;

    public bool IsDecrypted { get; set; }
    public bool IsEncrypted { get; set; }

    public byte[]? Iv { get; set; }
    public byte[]? Aad { get; set; }
    public byte[]? Tag { get; set; }
    public string? OriginServer { get; set; }
    public byte[]? Signature { get; set; }
    public uint? ProtocolVersion { get; set; }

    /// <summary>
    /// 构造一个 Package 实例。
    /// 未提供 request_id 时自动生成 6 字节随机值；未提供 protocol_version 时默认 2。
    /// </summary>
    public static Package Encode(
        uint methodId,
        byte[]? data = null,
        uint flags = 0,
        byte[]? requestId = null,
        long seq = -1,
        byte[]? iv = null,
        byte[]? aad = null,
        byte[]? tag = null,
        string? originServer = null,
        byte[]? signature = null,
        uint? protocolVersion = null)
    {
        var id = requestId is { Length: > 0 } ? requestId : RandomNumberGenerator.GetBytes(6);
        var payload = data ?? Array.Empty<byte>();
        var isEncrypted = (flags & FlagEncrypted) != 0;

        return new Package
        {
            MethodId = methodId,
            Length = payload.Length,
            Flags = flags,
            RequestId = id,
            Data = payload,
            Seq = seq,
            IsEncrypted = isEncrypted,
            IsDecrypted = !isEncrypted,
            Iv = iv,
            Aad = aad,
            Tag = tag,
            OriginServer = originServer,
            Signature = signature,
            ProtocolVersion = protocolVersion ?? ProtocolVersionDefault,
        };
    }

    /// <summary>从二进制解码为 Package；加密包会使用 secret 解密。</summary>
    public static Package Decode(byte[] buffer, byte[]? secret = null, long seq = -1)
    {
        var props = ProtoPackage.Parser.ParseFrom(buffer);

        var package = Encode(
            methodId: props.MethodId,
            data: props.Data.ToByteArray(),
            flags: props.Flags,
            requestId: props.RequestId.ToByteArray(),
            seq: props.Seq,
            iv: props.Iv.ToByteArray(),
            aad: props.Aad.ToByteArray(),
            tag: props.Tag.ToByteArray(),
            originServer: props.HasOriginServer ? props.OriginServer : null,
            signature: props.HasSignature ? props.Signature.ToByteArray() : null,
            protocolVersion: props.HasProtocolVersion ? props.ProtocolVersion : null);

        if ((package.Flags & FlagEncrypted) != 0 && secret != null)
        {
            package.Decrypt(seq, secret);
        }

        return package;
    }

    /// <summary>序列化为协议二进制。</summary>
    public byte[] ToBuffer()
    {
        var proto = new ProtoPackage
        {
            MethodId = MethodId,
            Flags = Flags,
            RequestId = ByteString.CopyFrom(RequestId),
            Seq = Seq < 0 ? uint.MaxValue : (uint)Seq,
            Data = ByteString.CopyFrom(Data),
            ProtocolVersion = ProtocolVersion ?? ProtocolVersionDefault,
        };

        if (Iv != null) proto.Iv = ByteString.CopyFrom(Iv);
        if (Aad != null) proto.Aad = ByteString.CopyFrom(Aad);
        if (Tag != null) proto.Tag = ByteString.CopyFrom(Tag);
        if (OriginServer != null) proto.OriginServer = OriginServer;
        if (Signature != null) proto.Signature = ByteString.CopyFrom(Signature);

        return proto.ToByteArray();
    }

    /// <summary>
    /// 加密 Package。
    /// </summary>
    /// <param name="seq">发送序列号（同时作为 AAD）。</param>
    /// <param name="secret">32 字节对称密钥。</param>
    public Package Encrypt(long seq, byte[] secret)
    {
        if ((Flags & FlagEncrypted) != 0)
            throw new InvalidOperationException("Package is already encrypted");

        var iv = RandomNumberGenerator.GetBytes(XChaChaNonceBytes);
        var aad = new byte[4];
        BinaryPrimitives.WriteUInt32BigEndian(aad, unchecked((uint)seq));

        var ciphertextWithTag = AeadEncrypt(Data, aad, iv, secret);

        Data = ciphertextWithTag[..^AeadTagBytes];
        Tag = ciphertextWithTag[^AeadTagBytes..];
        Iv = iv;
        Aad = aad;
        Seq = seq;
        Length = Data.Length;
        Flags |= FlagEncrypted;
        IsEncrypted = true;
        IsDecrypted = false;

        return this;
    }

    /// <summary>
    /// 解密 Package。
    /// </summary>
    /// <param name="seq">接收方上次的最大 seq（用于防重放）。</param>
    /// <param name="secret">32 字节对称密钥。</param>
    public Package Decrypt(long seq, byte[] secret)
    {
        if ((Flags & FlagEncrypted) == 0)
            throw new InvalidOperationException("Package is not encrypted");
        if (Iv == null || Aad == null || Tag == null)
            throw new InvalidOperationException("Missing encryption parameters (iv / aad / tag)");
        if (Seq != -1 && Seq <= seq)
            throw new InvalidOperationException($"数据包请求 seq 不符合要求, 需要 {seq}, 数据包提供了 {Seq}");

        var ciphertextWithTag = new byte[Data.Length + AeadTagBytes];
        Buffer.BlockCopy(Data, 0, ciphertextWithTag, 0, Data.Length);
        Buffer.BlockCopy(Tag, 0, ciphertextWithTag, Data.Length, AeadTagBytes);

        Data = AeadDecrypt(ciphertextWithTag, Aad, Iv, secret);
        Length = Data.Length;
        Flags &= ~FlagEncrypted;
        IsDecrypted = true;
        Iv = null;
        Aad = null;
        Tag = null;

        return this;
    }

    private static byte[] AeadEncrypt(byte[] plaintext, byte[] aad, byte[] nonce, byte[] key)
    {
        var cipher = new XChaCha20Poly1305();
        cipher.Init(true, new AeadParameters(new KeyParameter(key), 128, nonce, aad));

        var output = new byte[cipher.GetOutputSize(plaintext.Length)];
        var length = cipher.ProcessBytes(plaintext, 0, plaintext.Length, output, 0);
        length += cipher.DoFinal(output, length);

        return length == output.Length ? output : output[..length];
    }

    private static byte[] AeadDecrypt(byte[] ciphertext, byte[] aad, byte[] nonce, byte[] key)
    {
        var cipher = new XChaCha20Poly1305();
        cipher.Init(false, new AeadParameters(new KeyParameter(key), 128, nonce, aad));

        var output = new byte[cipher.GetOutputSize(ciphertext.Length)];
        var length = cipher.ProcessBytes(ciphertext, 0, ciphertext.Length, output, 0);
        length += cipher.DoFinal(output, length);

        return length == output.Length ? output : output[..length];
    }
}
