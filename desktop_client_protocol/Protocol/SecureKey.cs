using System.Security.Cryptography;
using NSec.Cryptography;

namespace LingCat.Protocol;

/// <summary>
/// 与 <c>protocol/SecureKey.ts</c> 对应的密钥交换 / 签名工具。
/// </summary>
public static class SecureKey
{
    /// <summary>
    /// 生成 X25519 临时密钥对。
    /// </summary>
    public static (byte[] PublicKey, byte[] PrivateKey) GenerateExchangeKeyPair()
    {
        var creationParameters = new KeyCreationParameters
        {
            ExportPolicy = KeyExportPolicies.AllowPlaintextExport,
        };

        using var key = Key.Create(KeyAgreementAlgorithm.X25519, creationParameters);
        var publicKey = key.PublicKey.Export(KeyBlobFormat.RawPublicKey);
        var privateKey = key.Export(KeyBlobFormat.RawPrivateKey);
        return (publicKey, privateKey);
    }

    /// <summary>
    /// 计算 X25519 共享秘密。
    /// </summary>
    public static byte[] GetSharedSecret(
        ReadOnlySpan<byte> oppositePublicKey,
        ReadOnlySpan<byte> privateKey)
    {
        using var key = Key.Import(
            KeyAgreementAlgorithm.X25519,
            privateKey,
            KeyBlobFormat.RawPrivateKey);

        var publicKey = PublicKey.Import(
            KeyAgreementAlgorithm.X25519,
            oppositePublicKey,
            KeyBlobFormat.RawPublicKey);

        var creationParameters = new SharedSecretCreationParameters
        {
            ExportPolicy = KeyExportPolicies.AllowPlaintextExport,
        };

        using var sharedSecret = KeyAgreementAlgorithm.X25519.Agree(
            key,
            publicKey,
            creationParameters)
            ?? throw new CryptographicException("X25519 key agreement failed");

        return sharedSecret.Export(SharedSecretBlobFormat.RawSharedSecret);
    }

    /// <summary>
    /// 服务端使用长期 Ed25519 私钥对 (serverPublicKey || clientPublicKey) 签名。
    /// </summary>
    public static byte[] ServerSignCheckMessage(
        ReadOnlySpan<byte> serverPublicKey,
        ReadOnlySpan<byte> clientPublicKey,
        ReadOnlySpan<byte> serverLongTermPrivateKey)
    {
        var message = Concat(serverPublicKey, clientPublicKey);
        using var key = Key.Import(
            SignatureAlgorithm.Ed25519,
            serverLongTermPrivateKey,
            KeyBlobFormat.RawPrivateKey);
        return SignatureAlgorithm.Ed25519.Sign(key, message);
    }

    /// <summary>
    /// 客户端使用服务端长期 Ed25519 公钥验证签名。
    /// </summary>
    public static bool ClientCheckSignedMessage(
        ReadOnlySpan<byte> signedMessage,
        ReadOnlySpan<byte> serverPublicKey,
        ReadOnlySpan<byte> clientPublicKey,
        ReadOnlySpan<byte> serverLongTermPublicKey)
    {
        var message = Concat(serverPublicKey, clientPublicKey);
        var publicKey = PublicKey.Import(
            SignatureAlgorithm.Ed25519,
            serverLongTermPublicKey,
            KeyBlobFormat.RawPublicKey);
        return SignatureAlgorithm.Ed25519.Verify(publicKey, message, signedMessage);
    }

    /// <summary>
    /// 根据共享秘密派生双向会话密钥。
    /// </summary>
    public static (byte[] KeyRecv, byte[] KeySend) ClientHkdf(
        ReadOnlySpan<byte> sharedSecret,
        ReadOnlySpan<byte> salt)
    {
        var keyRecv = new byte[32];
        var keySend = new byte[32];

        HKDF.DeriveKey(
            HashAlgorithmName.SHA256,
            sharedSecret,
            keyRecv,
            salt,
            "server-to-client"u8);

        HKDF.DeriveKey(
            HashAlgorithmName.SHA256,
            sharedSecret,
            keySend,
            salt,
            "client-to-server"u8);

        return (keyRecv, keySend);
    }

    /// <summary>
    /// 生成 32 字节随机盐。
    /// </summary>
    public static byte[] RandomSha256Salt()
    {
        return RandomNumberGenerator.GetBytes(32);
    }

    private static byte[] Concat(ReadOnlySpan<byte> first, ReadOnlySpan<byte> second)
    {
        var result = new byte[first.Length + second.Length];
        first.CopyTo(result);
        second.CopyTo(result.AsSpan(first.Length));
        return result;
    }
}
