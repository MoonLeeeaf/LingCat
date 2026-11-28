using System.Security.Cryptography;
using System.Text;
using Org.BouncyCastle.Crypto.Agreement;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Signers;
using Org.BouncyCastle.Security;

namespace LingCat.ClientProtocol.Client;

/// <summary>
/// 客户端握手/密钥派生相关工具，移植自 protocol/SecureKey.ts。
/// 与 libsodium-wrappers-sumo 的实现保持一致：
/// X25519 + Ed25519 + HKDF-SHA256。
/// </summary>
public static class SecureKey
{
    public static (byte[] PublicKey, byte[] PrivateKey) GenerateExchangeKeyPair()
    {
        var privateKey = new X25519PrivateKeyParameters(new SecureRandom());
        var publicKey = privateKey.GeneratePublicKey();
        return (publicKey.GetEncoded(), privateKey.GetEncoded());
    }

    /// <summary>X25519 共享秘密，等价于 sodium.crypto_scalarmult。</summary>
    public static byte[] GetSharedSecret(byte[] oppositePublicKey, byte[] privateKey)
    {
        var privateKeyParameters = new X25519PrivateKeyParameters(privateKey, 0);
        var publicKeyParameters = new X25519PublicKeyParameters(oppositePublicKey, 0);

        var agreement = new X25519Agreement();
        agreement.Init(privateKeyParameters);

        var sharedSecret = new byte[agreement.AgreementSize];
        agreement.CalculateAgreement(publicKeyParameters, sharedSecret, 0);
        return sharedSecret;
    }

    /// <summary>
    /// 校验服务端签名：signature(server_public_key || client_public_key)
    /// </summary>
    public static bool ClientCheckSignedMessage(
        byte[] signedMessage,
        byte[] serverPublicKey,
        byte[] clientPublicKey,
        byte[] serverLongTermPublicKey)
    {
        var message = Concat(serverPublicKey, clientPublicKey);

        var verifier = new Ed25519Signer();
        verifier.Init(false, new Ed25519PublicKeyParameters(serverLongTermPublicKey, 0));
        verifier.BlockUpdate(message, 0, message.Length);
        return verifier.VerifySignature(signedMessage);
    }

    /// <summary>根据共享秘密派生双向会话密钥。</summary>
    public static (byte[] KeyRecv, byte[] KeySend) ClientHkdf(byte[] sharedSecret, byte[] salt)
    {
        return (
            Hkdf(sharedSecret, salt, Encoding.UTF8.GetBytes("server-to-client"), 32),
            Hkdf(sharedSecret, salt, Encoding.UTF8.GetBytes("client-to-server"), 32)
        );
    }

    public static byte[] RandomSha256Salt()
    {
        var salt = new byte[32];
        RandomNumberGenerator.Fill(salt);
        return salt;
    }

    public static string Sha256Hex(byte[] salt, byte[] message)
    {
        var hash = HmacSha256(message, salt);
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private static byte[] Hkdf(byte[] ikm, byte[] salt, byte[] info, int length)
    {
        var prk = HkdfExtract(salt, ikm);
        return HkdfExpand(prk, info, length);
    }

    private static byte[] HkdfExtract(byte[] salt, byte[] ikm)
    {
        // PRK = HMAC-SHA256(salt, ikm)
        return HmacSha256(ikm, salt);
    }

    private static byte[] HkdfExpand(byte[] prk, byte[] info, int length)
    {
        var okm = new byte[length];
        var previous = Array.Empty<byte>();
        var offset = 0;
        byte blockIndex = 1;

        while (offset < length)
        {
            var input = new byte[previous.Length + info.Length + 1];
            Buffer.BlockCopy(previous, 0, input, 0, previous.Length);
            Buffer.BlockCopy(info, 0, input, previous.Length, info.Length);
            input[^1] = blockIndex;

            var block = HmacSha256(input, prk);
            var count = Math.Min(block.Length, length - offset);
            Buffer.BlockCopy(block, 0, okm, offset, count);
            offset += count;
            previous = block;

            if (blockIndex == byte.MaxValue && offset < length)
                throw new InvalidOperationException("HKDF expand too long");
            blockIndex++;
        }

        return okm;
    }

    private static byte[] HmacSha256(byte[] message, byte[] key)
    {
        using var hmac = new HMACSHA256(key);
        return hmac.ComputeHash(message);
    }

    private static byte[] Concat(byte[] first, byte[] second)
    {
        var result = new byte[first.Length + second.Length];
        Buffer.BlockCopy(first, 0, result, 0, first.Length);
        Buffer.BlockCopy(second, 0, result, first.Length, second.Length);
        return result;
    }
}
