# LingCat-ClientProtocol

LingCat 客户端的 C# 协议库，由 `protocol/*.proto` 通过 `protoc` 生成。

- 项目文件：`LingCat-ClientProtocol.csproj`
- 目标框架：`net10.0`
- 依赖：`Google.Protobuf`、`BouncyCastle.Cryptography`
- 生成代码：`Proto/Classes.cs`、`Proto/Methods.cs`
  - 命名空间：`Lingcat.Classes`、`Lingcat.Methods`
- 手写代码：`Client/`
  - `LingCatClient`：WebSocket 连接、握手、请求匹配、心跳、自动重连
  - `Package`：请求 ID、序列化、XChaCha20-Poly1305 加解密
  - `SecureKey`：X25519 / Ed25519 / HKDF-SHA256
  - `Methods`：方法 ID 常量

## 使用

```csharp
using LingCat.ClientProtocol.Client;

var client = new LingCatClient(
    serverWs: "wss://example.com",
    serverHttp: "https://example.com",
    serverPublicKey: Convert.FromHexString(publicKeyHex));

client.Logger = Console.WriteLine;
client.SubscribeConnectionState(() => Console.WriteLine(client.ConnectionState));
client.AddOnReceiveListener(pkg => Console.WriteLine($"收到 {Methods.GetMethodName(pkg.MethodId)}"));

client.Init();

// 握手完成后调用
var response = await client.Invoke(
    Methods.Ping_Request,
    new Lingcat.Methods.Ping_Request
    {
        Time = (ulong)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
    }.ToByteArray());

client.Disconnect();
```

加解密与前端使用的 `libsodium-wrappers-sumo` 已做跨语言校验（X25519 / Ed25519 / HKDF / XChaCha20-Poly1305）。

## 构建

```bash
dotnet build
```

## 重新生成协议代码

在仓库根目录执行：

```bash
npm run generate-proto-csharp
```

等价于：

```bash
protoc -I=./protocol --csharp_out=./client_protocol_csharp/Proto/ ./protocol/*.proto
```

`Proto/` 下的文件是自动生成的，不要手动修改。
