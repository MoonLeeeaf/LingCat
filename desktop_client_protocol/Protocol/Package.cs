using System.Buffers.Binary;
using System.Security.Cryptography;
using Google.Protobuf;
using NSec.Cryptography;

namespace LingCat.Protocol;

/// <summary>
/// LingCat 协议包，对应 <c>protocol/Package.ts</c>。
/// </summary>
public sealed class Package
{
    public const uint FLAG_ENCRYPTED = 1u << 0;
    public const uint FLAG_RESERVED = 1u << 1;
    public const uint PROTOCOL_VERSION = 2;

    /// <summary>未设置序号时使用的值，对应 TypeScript 侧的 <c>-1</c>。</summary>
    public const uint NoSeq = uint.MaxValue;

    public uint MethodId { get; set; }
    public uint Flags { get; set; }
    public byte[] RequestId { get; set; } = Array.Empty<byte>();
    public uint Seq { get; set; } = NoSeq;
    public byte[] Data { get; set; } = Array.Empty<byte>();

    public byte[]? Iv { get; set; }
    public byte[]? Aad { get; set; }
    public byte[]? Tag { get; set; }
    public string? OriginServer { get; set; }
    public byte[]? Signature { get; set; }
    public uint? ProtocolVersion { get; set; } = PROTOCOL_VERSION;

    public int Length => Data.Length;
    public bool IsEncrypted => (Flags & FLAG_ENCRYPTED) != 0;
    public bool IsDecrypted => !IsEncrypted;

    /// <summary>
    /// 创建一个新包。未提供 <paramref name="requestId"/> 时自动生成 6 字节随机请求 ID。
    /// </summary>
    public static Package Create(
        uint methodId,
        byte[]? data = null,
        uint flags = 0,
        byte[]? requestId = null,
        uint seq = NoSeq,
        byte[]? iv = null,
        byte[]? aad = null,
        byte[]? tag = null,
        string? originServer = null,
        byte[]? signature = null,
        uint? protocolVersion = PROTOCOL_VERSION)
    {
        return new Package
        {
            MethodId = methodId,
            Data = data ?? Array.Empty<byte>(),
            Flags = flags,
            RequestId = requestId is { Length: > 0 } ? requestId : RandomRequestId(),
            Seq = seq,
            Iv = iv,
            Aad = aad,
            Tag = tag,
            OriginServer = originServer,
            Signature = signature,
            ProtocolVersion = protocolVersion,
        };
    }

    /// <summary>
    /// 从二进制解码。若包已加密且提供了 <paramref name="secret"/>，会自动解密。
    /// </summary>
    public static Package Decode(
        ReadOnlySpan<byte> bytes,
        ReadOnlySpan<byte> secret = default,
        uint lastSeq = NoSeq)
    {
        var proto = Lingcat.Classes.Package.Parser.ParseFrom(bytes);

        var package = new Package
        {
            MethodId = proto.MethodId,
            Flags = proto.Flags,
            RequestId = proto.RequestId.ToByteArray(),
            Seq = proto.Seq,
            Data = proto.Data.ToByteArray(),
            Iv = proto.Iv.Length > 0 ? proto.Iv.ToByteArray() : null,
            Aad = proto.Aad.Length > 0 ? proto.Aad.ToByteArray() : null,
            Tag = proto.Tag.Length > 0 ? proto.Tag.ToByteArray() : null,
            OriginServer = proto.HasOriginServer ? proto.OriginServer : null,
            Signature = proto.HasSignature ? proto.Signature.ToByteArray() : null,
            ProtocolVersion = proto.HasProtocolVersion ? proto.ProtocolVersion : PROTOCOL_VERSION,
        };

        if (package.IsEncrypted && !secret.IsEmpty)
        {
            package.Decrypt(lastSeq, secret);
        }

        return package;
    }

    /// <summary>
    /// 编码为二进制。
    /// </summary>
    public byte[] ToBuffer()
    {
        var proto = new Lingcat.Classes.Package
        {
            MethodId = MethodId,
            Flags = Flags,
            RequestId = ByteString.CopyFrom(RequestId),
            Seq = Seq,
            Data = ByteString.CopyFrom(Data),
        };

        if (Iv is not null) proto.Iv = ByteString.CopyFrom(Iv);
        if (Aad is not null) proto.Aad = ByteString.CopyFrom(Aad);
        if (Tag is not null) proto.Tag = ByteString.CopyFrom(Tag);
        if (OriginServer is not null) proto.OriginServer = OriginServer;
        if (Signature is not null) proto.Signature = ByteString.CopyFrom(Signature);
        if (ProtocolVersion.HasValue) proto.ProtocolVersion = ProtocolVersion.Value;

        return proto.ToByteArray();
    }

    /// <summary>
    /// 使用 XChaCha20-Poly1305-IETF 加密负载。
    /// </summary>
    /// <param name="seq">发送序号，同时作为 AAD。</param>
    /// <param name="secret">32 字节对称密钥。</param>
    public Package Encrypt(uint seq, ReadOnlySpan<byte> secret)
    {
        if (IsEncrypted)
        {
            throw new InvalidOperationException("Package is already encrypted");
        }

        var aead = AeadAlgorithm.XChaCha20Poly1305;
        var nonce = RandomNumberGenerator.GetBytes(aead.NonceSize);
        var aad = new byte[4];
        BinaryPrimitives.WriteUInt32BigEndian(aad, seq);

        using var key = Key.Import(aead, secret, KeyBlobFormat.RawSymmetricKey);
        var ciphertextWithTag = aead.Encrypt(key, nonce, aad, Data);

        var tagSize = aead.TagSize;
        Data = ciphertextWithTag.AsSpan(0, ciphertextWithTag.Length - tagSize).ToArray();
        Tag = ciphertextWithTag.AsSpan(ciphertextWithTag.Length - tagSize).ToArray();
        Iv = nonce;
        Aad = aad;
        Seq = seq;
        Flags |= FLAG_ENCRYPTED;

        return this;
    }

    /// <summary>
    /// 解密负载。
    /// </summary>
    /// <param name="lastSeq">接收方已处理的最大序号，用于防重放。</param>
    /// <param name="secret">32 字节对称密钥。</param>
    public Package Decrypt(uint lastSeq, ReadOnlySpan<byte> secret)
    {
        if (!IsEncrypted)
        {
            throw new InvalidOperationException("Package is not encrypted");
        }
        if (Iv is null || Aad is null || Tag is null)
        {
            throw new InvalidOperationException("Missing encryption parameters (iv / aad / tag)");
        }
        if (Seq != NoSeq && lastSeq != NoSeq && Seq <= lastSeq)
        {
            throw new InvalidOperationException(
                $"数据包请求 seq 不符合要求, 需要 {lastSeq}, 数据包提供了 {Seq}");
        }

        var aead = AeadAlgorithm.XChaCha20Poly1305;
        var ciphertextWithTag = new byte[Data.Length + Tag.Length];
        Data.CopyTo(ciphertextWithTag, 0);
        Tag.CopyTo(ciphertextWithTag, Data.Length);

        using var key = Key.Import(aead, secret, KeyBlobFormat.RawSymmetricKey);
        var plaintext = aead.Decrypt(key, Iv, Aad, ciphertextWithTag)
            ?? throw new CryptographicException("Package decryption failed");

        Data = plaintext;
        Flags &= ~FLAG_ENCRYPTED;
        Iv = null;
        Aad = null;
        Tag = null;

        return this;
    }

    public override string ToString()
    {
        return $"Package {{ Method = {Methods.GetMethodName(MethodId)}, Flags = {Flags}, " +
               $"Length = {Length}, RequestId = {Convert.ToHexString(RequestId)}, Seq = {Seq} }}";
    }

    private static byte[] RandomRequestId()
    {
        return RandomNumberGenerator.GetBytes(6);
    }
}
