using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using Google.Protobuf;
using LingCat.ClientProtocol;
using LingCat.Protocol;
using NSec.Cryptography;

namespace LingCat.Client.Interop;

internal static class Program
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
    };

    private static int Main(string[] args)
    {
        var command = args.Length > 0 ? args[0] : "selftest";

        try
        {
            switch (command)
            {
                case "selftest":
                    RunSelfTest();
                    Console.WriteLine("SELFTEST OK");
                    return 0;

                case "emit":
                    var emitPath = args.Length > 1
                        ? args[1]
                        : "/tmp/opencode/lingcat-interop/csharp_vectors.json";
                    EmitVectors(emitPath);
                    Console.WriteLine($"wrote {emitPath}");
                    return 0;

                case "verify":
                    var verifyPath = args.Length > 1
                        ? args[1]
                        : "/tmp/opencode/lingcat-interop/ts_vectors.json";
                    VerifyTsVectors(verifyPath);
                    Console.WriteLine("INTEROP VERIFY OK");
                    return 0;

                case "e2e":
                    RunE2E(args).GetAwaiter().GetResult();
                    Console.WriteLine("E2E OK");
                    return 0;

                default:
                    Console.Error.WriteLine("usage: LingCat.Client.Interop [selftest|emit [path]|verify [path]]");
                    return 2;
            }
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine($"FAILED: {ex}");
            return 1;
        }
    }

    private static void RunSelfTest()
    {
        TestPackageRoundtrip();
        TestPackageEncryption();
        TestX25519();
        TestEd25519();
        TestHkdfRfc5869();
        TestDecodeOrThrow();
        Console.WriteLine("all internal checks passed");
    }

    private static void TestPackageRoundtrip()
    {
        var requestId = new byte[] { 1, 2, 3, 4, 5, 6 };
        var data = Encoding.UTF8.GetBytes("roundtrip payload");
        var package = Package.Create(Methods.User_Registration_Request, data, requestId: requestId);

        var bytes = package.ToBuffer();
        var decoded = Package.Decode(bytes);

        AssertEqual(package.MethodId, decoded.MethodId, "method id");
        AssertEqual(package.Flags, decoded.Flags, "flags");
        AssertEqual(package.Seq, decoded.Seq, "seq");
        AssertEqual(Package.PROTOCOL_VERSION, decoded.ProtocolVersion, "protocol version");
        AssertBytes(requestId, decoded.RequestId, "request id");
        AssertBytes(data, decoded.Data, "data");
        Assert(!decoded.IsEncrypted, "decoded package should not be encrypted");
    }

    private static void TestPackageEncryption()
    {
        var key = RandomNumberGenerator.GetBytes(32);
        var data = Encoding.UTF8.GetBytes("encrypted payload");
        var package = Package.Create(Methods.Ping_Request, data);
        package.Encrypt(0, key);

        Assert(package.IsEncrypted, "package should be encrypted");
        AssertEqual(24, package.Iv!.Length, "nonce size");
        AssertEqual(16, package.Tag!.Length, "tag size");
        AssertEqual(4, package.Aad!.Length, "aad size");
        AssertEqual(0u, System.Buffers.Binary.BinaryPrimitives.ReadUInt32BigEndian(package.Aad), "aad seq");
        AssertEqual(0u, package.Seq, "package seq");

        var bytes = package.ToBuffer();
        var decoded = Package.Decode(bytes, key, Package.NoSeq);
        Assert(!decoded.IsEncrypted, "decrypted package should not be encrypted");
        AssertBytes(data, decoded.Data, "decrypted data");
        AssertEqual(0u, decoded.Seq, "decrypted seq");

        // 重放：相同 seq 必须被拒绝
        ExpectThrows<InvalidOperationException>(
            () => Package.Decode(bytes, key, 0),
            "replay should be rejected");

        // 篡改密文：认证标签校验必须失败
        var tampered = package.Clone();
        tampered.Data[0] ^= 0x01;
        ExpectThrowsAny(
            () => Package.Decode(tampered.ToBuffer(), key, Package.NoSeq),
            "tampered ciphertext should be rejected");

        // 错误密钥
        var wrongKey = RandomNumberGenerator.GetBytes(32);
        ExpectThrowsAny(
            () => Package.Decode(bytes, wrongKey, Package.NoSeq),
            "wrong key should be rejected");
    }

    private static void TestX25519()
    {
        var alice = SecureKey.GenerateExchangeKeyPair();
        var bob = SecureKey.GenerateExchangeKeyPair();

        AssertEqual(32, alice.PublicKey.Length, "alice public key size");
        AssertEqual(32, alice.PrivateKey.Length, "alice private key size");

        var sharedA = SecureKey.GetSharedSecret(bob.PublicKey, alice.PrivateKey);
        var sharedB = SecureKey.GetSharedSecret(alice.PublicKey, bob.PrivateKey);

        AssertEqual(32, sharedA.Length, "shared secret size");
        AssertBytes(sharedA, sharedB, "x25519 shared secret symmetry");
    }

    private static void TestEd25519()
    {
        var creationParameters = new KeyCreationParameters
        {
            ExportPolicy = KeyExportPolicies.AllowPlaintextExport,
        };

        using var longTerm = Key.Create(SignatureAlgorithm.Ed25519, creationParameters);
        var longTermPublic = longTerm.PublicKey.Export(KeyBlobFormat.RawPublicKey);
        var longTermPrivate = longTerm.Export(KeyBlobFormat.RawPrivateKey);

        var ephemeral = SecureKey.GenerateExchangeKeyPair();
        var signature = SecureKey.ServerSignCheckMessage(
            ephemeral.PublicKey,
            ephemeral.PublicKey,
            longTermPrivate);

        Assert(
            SecureKey.ClientCheckSignedMessage(
                signature,
                ephemeral.PublicKey,
                ephemeral.PublicKey,
                longTermPublic),
            "ed25519 signature should verify");

        var tampered = (byte[])signature.Clone();
        tampered[0] ^= 0x01;
        Assert(
            !SecureKey.ClientCheckSignedMessage(
                tampered,
                ephemeral.PublicKey,
                ephemeral.PublicKey,
                longTermPublic),
            "tampered ed25519 signature should not verify");
    }

    private static void TestHkdfRfc5869()
    {
        // RFC 5869 Test Case 1
        var ikm = Enumerable.Repeat((byte)0x0b, 22).ToArray();
        var salt = Convert.FromHexString("000102030405060708090a0b0c");
        var info = Convert.FromHexString("f0f1f2f3f4f5f6f7f8f9");
        var expected = Convert.FromHexString(
            "3cb25f25faacd57a90434f64d0362f2a" +
            "2d2d0a90cf1a5a4c5db02d56ecc4c5bf" +
            "34007208d5b887185865");

        var okm = new byte[42];
        HKDF.DeriveKey(HashAlgorithmName.SHA256, ikm, okm, salt, info);
        AssertBytes(expected, okm, "RFC 5869 test case 1");
    }

    private static void TestDecodeOrThrow()
    {
        var error = new Lingcat.Methods.Error_Response
        {
            RequestMethod = Methods.User_Login_Request,
            Message = "bad credentials",
            Code = 401,
        };

        try
        {
            ProtoDecode.DecodeOrThrow(
                Lingcat.Methods.User_Login_Response.Parser,
                error.ToByteArray());
            throw new InvalidOperationException("expected LingCatApiException");
        }
        catch (LingCatApiException ex)
        {
            AssertEqual((int)Methods.User_Login_Request, (int)ex.RequestMethod, "error request method");
            AssertEqual("bad credentials", ex.Message, "error message");
            AssertEqual(401, ex.Code, "error code");
        }

        var success = new Lingcat.Methods.User_Login_Response
        {
            AccessToken = "token-123",
        };
        var decoded = ProtoDecode.DecodeOrThrow(
            Lingcat.Methods.User_Login_Response.Parser,
            success.ToByteArray());
        AssertEqual("token-123", decoded.AccessToken, "decoded access token");
    }

    private static async Task RunE2E(string[] args)
    {
        var serverWs = args.Length > 1 ? args[1] : "ws://127.0.0.1:3601";
        var serverHttp = args.Length > 2 ? args[2] : "http://127.0.0.1:3601";
        var publicKeyHex = args.Length > 3
            ? args[3]
            : throw new InvalidOperationException("missing server public key hex");

        var username = "csharp_" + Guid.NewGuid().ToString("N")[..12];
        const string password = "test-password-123";
        const string nickname = "C# Test Cat";

        await using var client = new LingCatClient(
            serverWs,
            serverHttp,
            Convert.FromHexString(publicKeyHex));
        client.LogMessage = message => Console.WriteLine(message);

        Console.WriteLine($"[e2e] connecting to {serverWs}");
        await client.ConnectAsync().WaitAsync(TimeSpan.FromSeconds(20));
        AssertEqual(ClientConnectionState.Connected, client.ConnectionState, "connection state");

        Console.WriteLine($"[e2e] registering {username}");
        var userId = await client.RegisterAsync(password, nickname, username);
        Assert(!string.IsNullOrEmpty(userId), "registered user id should not be empty");
        Console.WriteLine($"[e2e] registered user id = {userId}");

        Console.WriteLine("[e2e] logging in");
        var accessToken = await client.LoginAsync(username, password);
        Assert(!string.IsNullOrEmpty(accessToken), "access token should not be empty");

        Console.WriteLine("[e2e] authorizing");
        await client.AuthorizeAsync(accessToken, Guid.NewGuid().ToString("N"));

        Console.WriteLine("[e2e] querying my user info");
        var info = await client.QueryMyUserInfoAsync(accessToken);
        AssertEqual(userId, info.Id, "queried user id");
        AssertEqual(nickname, info.Nickname, "queried nickname");
        AssertEqual(username, info.Username, "queried username");

        Console.WriteLine("[e2e] checking error response for wrong password");
        try
        {
            await client.LoginAsync(username, "wrong-password");
            throw new InvalidOperationException("expected LingCatApiException");
        }
        catch (LingCatApiException ex)
        {
            AssertEqual((int)Methods.User_Login_Request, (int)ex.RequestMethod, "error request method");
            AssertEqual((int)Code.Bad_Request, ex.Code, "error code");
            Console.WriteLine($"[e2e] got expected error: {ex.Message} (code {ex.Code})");
        }

        Console.WriteLine("[e2e] querying online status");
        var online = await client.GetOnlineStatusAsync(accessToken, new[] { userId });
        Console.WriteLine($"[e2e] online[{userId}] = {online.GetValueOrDefault(userId)}");

        Console.WriteLine("[e2e] testing manual reconnect");
        await client.ReconnectAsync();
        AssertEqual(ClientConnectionState.Connected, client.ConnectionState, "state after manual reconnect");
        var infoAfterManualReconnect = await client.QueryMyUserInfoAsync(accessToken);
        AssertEqual(userId, infoAfterManualReconnect.Id, "user id after manual reconnect");

        Console.WriteLine("[e2e] testing auto reconnect");
        var initialized = new TaskCompletionSource<bool>(
            TaskCreationOptions.RunContinuationsAsynchronously);
        client.Initialized += () => initialized.TrySetResult(true);
        client.Init();
        await client.ReconnectAsync();
        await initialized.Task.WaitAsync(TimeSpan.FromSeconds(20));
        AssertEqual(ClientConnectionState.Connected, client.ConnectionState, "state after auto reconnect");
        var infoAfterAutoReconnect = await client.QueryMyUserInfoAsync(accessToken);
        AssertEqual(userId, infoAfterAutoReconnect.Id, "user id after auto reconnect");
    }

    private static void EmitVectors(string path)
    {
        var alice = SecureKey.GenerateExchangeKeyPair();
        var bob = SecureKey.GenerateExchangeKeyPair();
        var shared = SecureKey.GetSharedSecret(bob.PublicKey, alice.PrivateKey);

        var ikm = RandomNumberGenerator.GetBytes(32);
        var salt = SecureKey.RandomSha256Salt();
        var (keyRecv, keySend) = SecureKey.ClientHkdf(ikm, salt);

        var creationParameters = new KeyCreationParameters
        {
            ExportPolicy = KeyExportPolicies.AllowPlaintextExport,
        };
        using var longTerm = Key.Create(SignatureAlgorithm.Ed25519, creationParameters);
        var longTermPublic = longTerm.PublicKey.Export(KeyBlobFormat.RawPublicKey);
        var longTermPrivate = longTerm.Export(KeyBlobFormat.RawPrivateKey);
        var signature = SecureKey.ServerSignCheckMessage(
            bob.PublicKey,
            alice.PublicKey,
            longTermPrivate);

        var packageKey = RandomNumberGenerator.GetBytes(32);
        var packageData = Encoding.UTF8.GetBytes("hello from csharp");
        var package = Package.Create(Methods.Ping_Request, packageData);
        package.Encrypt(0, packageKey);

        var plain = Package.Create(
            Methods.User_Login_Request,
            Encoding.UTF8.GetBytes("plain payload"),
            requestId: Convert.FromHexString("aabbccddeeff"));

        var vectors = new
        {
            x25519 = new
            {
                alicePrivate = Hex(alice.PrivateKey),
                alicePublic = Hex(alice.PublicKey),
                bobPrivate = Hex(bob.PrivateKey),
                bobPublic = Hex(bob.PublicKey),
                shared = Hex(shared),
            },
            hkdf = new
            {
                ikm = Hex(ikm),
                salt = Hex(salt),
                keyRecv = Hex(keyRecv),
                keySend = Hex(keySend),
            },
            ed25519 = new
            {
                seed = Hex(longTermPrivate),
                longTermPublic = Hex(longTermPublic),
                serverPublic = Hex(bob.PublicKey),
                clientPublic = Hex(alice.PublicKey),
                signature = Hex(signature),
            },
            package = new
            {
                key = Hex(packageKey),
                seq = 0,
                data = Hex(packageData),
                bytes = Hex(package.ToBuffer()),
            },
            plain = new
            {
                methodId = plain.MethodId,
                requestId = Hex(plain.RequestId),
                data = Hex(plain.Data),
                bytes = Hex(plain.ToBuffer()),
            },
        };

        File.WriteAllText(path, JsonSerializer.Serialize(vectors, JsonOptions));
    }

    private static void VerifyTsVectors(string path)
    {
        var root = JsonNode.Parse(File.ReadAllText(path))
            ?? throw new InvalidOperationException("empty vectors file");

        var x25519 = root["x25519"] ?? throw new InvalidOperationException("missing x25519");
        var alicePrivate = FromHex(x25519["alicePrivate"]);
        var alicePublic = FromHex(x25519["alicePublic"]);
        var bobPrivate = FromHex(x25519["bobPrivate"]);
        var bobPublic = FromHex(x25519["bobPublic"]);
        var expectedShared = FromHex(x25519["shared"]);

        AssertBytes(
            expectedShared,
            SecureKey.GetSharedSecret(bobPublic, alicePrivate),
            "ts x25519 shared secret (alice)");
        AssertBytes(
            expectedShared,
            SecureKey.GetSharedSecret(alicePublic, bobPrivate),
            "ts x25519 shared secret (bob)");

        var hkdf = root["hkdf"] ?? throw new InvalidOperationException("missing hkdf");
        var (keyRecv, keySend) = SecureKey.ClientHkdf(
            FromHex(hkdf["ikm"]),
            FromHex(hkdf["salt"]));
        AssertBytes(FromHex(hkdf["keyRecv"]), keyRecv, "ts hkdf keyRecv");
        AssertBytes(FromHex(hkdf["keySend"]), keySend, "ts hkdf keySend");

        var ed25519 = root["ed25519"] ?? throw new InvalidOperationException("missing ed25519");
        Assert(
            SecureKey.ClientCheckSignedMessage(
                FromHex(ed25519["signature"]),
                FromHex(ed25519["serverPublic"]),
                FromHex(ed25519["clientPublic"]),
                FromHex(ed25519["longTermPublic"])),
            "ts ed25519 signature should verify");

        var package = root["package"] ?? throw new InvalidOperationException("missing package");
        var key = FromHex(package["key"]);
        var decoded = Package.Decode(FromHex(package["bytes"]), key, Package.NoSeq);
        Assert(!decoded.IsEncrypted, "ts package should decrypt");
        AssertEqual((uint)package["seq"]!, decoded.Seq, "ts package seq");
        AssertBytes(FromHex(package["data"]), decoded.Data, "ts package data");

        var plain = root["plain"] ?? throw new InvalidOperationException("missing plain");
        var decodedPlain = Package.Decode(FromHex(plain["bytes"]));
        AssertEqual((uint)plain["methodId"]!, decodedPlain.MethodId, "ts plain method id");
        AssertBytes(FromHex(plain["requestId"]), decodedPlain.RequestId, "ts plain request id");
        AssertBytes(FromHex(plain["data"]), decodedPlain.Data, "ts plain data");
    }

    private static string Hex(byte[] bytes) => Convert.ToHexString(bytes).ToLowerInvariant();

    private static byte[] FromHex(JsonNode? node)
    {
        var value = node?.GetValue<string>()
            ?? throw new InvalidOperationException("missing hex value");
        return Convert.FromHexString(value);
    }

    private static void Assert(bool condition, string message)
    {
        if (!condition)
        {
            throw new InvalidOperationException($"assertion failed: {message}");
        }
    }

    private static void AssertEqual<T>(T expected, T actual, string message)
    {
        if (!EqualityComparer<T>.Default.Equals(expected, actual))
        {
            throw new InvalidOperationException(
                $"assertion failed: {message} (expected {expected}, actual {actual})");
        }
    }

    private static void AssertBytes(byte[] expected, byte[] actual, string message)
    {
        if (!expected.AsSpan().SequenceEqual(actual))
        {
            throw new InvalidOperationException(
                $"assertion failed: {message} (expected {Hex(expected)}, actual {Hex(actual)})");
        }
    }

    private static void ExpectThrows<T>(Action action, string message)
        where T : Exception
    {
        try
        {
            action();
        }
        catch (T)
        {
            return;
        }

        throw new InvalidOperationException($"assertion failed: {message} (no {typeof(T).Name})");
    }

    private static void ExpectThrowsAny(Action action, string message)
    {
        try
        {
            action();
        }
        catch
        {
            return;
        }

        throw new InvalidOperationException($"assertion failed: {message} (nothing thrown)");
    }
}

internal static class PackageExtensions
{
    public static Package Clone(this Package package)
    {
        return Package.Decode(package.ToBuffer());
    }
}
