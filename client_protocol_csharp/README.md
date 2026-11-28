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
  - `UserApi` / `ChatApi` / `FileApi` / `E2EApi` / `MeetingApi` / `OAuthApi` / `StickerApi`：客户端业务 API
  - `MessageParser`：轻量富文本语法与 text + entities 的互转
  - `DecodeOrThrow`：响应解码与 `Error_Response` 错误抛出（`ProtocolException`）
  - `Models`：客户端业务模型（`User`、`Chat`、`Message`、`StickerPack` 等）

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

### 业务 API

所有业务 API 都是静态方法，参数使用 `XxxOptions` record，`TimeoutMs` 默认 20000：

```csharp
using LingCat.ClientProtocol.Client;

var userId = await UserApi.RegisterAsync(client, new UserApi.RegisterOptions(
    Password: "password",
    Nickname: "昵称",
    Username: "username"));

var accessToken = await UserApi.LoginAsync(client, new UserApi.LoginOptions("username", "password"));
await UserApi.AuthorizeAsync(client, new UserApi.AuthorizeOptions(accessToken, sessionId));

var me = await UserApi.QueryMyUserInfoAsync(client, new UserApi.QueryMyUserInfoOptions(accessToken));

var chatId = await ChatApi.CreateGroupAsync(client, new ChatApi.CreateGroupOptions(accessToken, "群名称"));

var parsed = MessageParser.ParseMessage("你好 **世界**");
var messageId = await ChatApi.SendChatMessageAsync(client, new ChatApi.SendChatMessageOptions(
    accessToken, chatId, parsed.Text, parsed.Entities));

var messages = await ChatApi.GetChatMessagesAsync(client, new ChatApi.GetChatMessagesOptions(accessToken, chatId));

// 文件上传
var uploadToken = await FileApi.RequestUploadFileTokenAsync(client,
    new FileApi.RequestUploadFileTokenOptions(accessToken));

var fileHash = await FileApi.UploadFileAsync(client, new FileApi.UploadFileOptions(
    uploadToken, File.ReadAllBytes("a.txt"), chatId, "text/plain", "a.txt"));

// 断点续传（chunk_size 由服务端下发）
var resumableHash = await FileApi.UploadFileResumableAsync(
    client, uploadToken, File.ReadAllBytes("big.bin"), "big.bin", "application/octet-stream");
```

服务端返回的业务错误会以 `ProtocolException` 抛出，包含 `RequestMethod` 与 `Code`：

```csharp
try
{
    await ChatApi.SendChatMessageAsync(client, options);
}
catch (ProtocolException ex)
{
    Console.WriteLine($"{Methods.GetMethodName(ex.RequestMethod)} -> {ex.Message} ({ex.Code})");
}
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
