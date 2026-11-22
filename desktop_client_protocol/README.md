# LingCat.ClientProtocol（desktop_client_protocol）

原生 C# 客户端核心库。目标是替代 WebView 套壳，从协议层开始重写，后续由 Avalonia UI 直接引用。

当前已实现：

- `Package` 编解码、XChaCha20-Poly1305 加密 / 解密、seq 防重放
- `SecureKey`：X25519 密钥交换、Ed25519 签名 / 验签、HKDF-SHA256
- `LingCatClient`：WebSocket 连接、握手、加密收发、请求/响应匹配、心跳、自动重连
- `Methods` / `Code`：协议方法 ID 与错误码
- `ProtoDecode.DecodeOrThrow` / `LingCatApiException`：业务错误处理
- `UserApi`：注册、登录、授权、查询用户信息、备注、在线状态等

已与 TypeScript 实现做过字节级互通验证，并通过真实服务端端到端测试（握手、注册、登录、授权、查询、错误响应、手动重连、自动重连）。

## 目录结构

```
desktop_client_protocol/
├── LingCat.ClientProtocol.csproj
├── Protocol/
│   ├── Package.cs              # 协议包
│   ├── SecureKey.cs            # 密钥交换 / 签名 / HKDF
│   ├── Methods.cs              # 125 个方法 ID
│   ├── Code.cs                 # 错误码
│   ├── DecodeOrThrow.cs        # 错误响应解码
│   └── LingCatApiException.cs
└── ClientProtocol/
    ├── LingCatClient.cs        # WebSocket 客户端
    └── UserApi.cs              # 用户 API
```

## 构建

```bash
dotnet build desktop_client_protocol/LingCat.ClientProtocol.csproj
```

依赖：

- `Google.Protobuf`：protobuf 运行时
- `Grpc.Tools`：构建时调用 `protoc` 生成 C#（不需要单独安装 protoc）
- `NSec.Cryptography`：基于 libsodium 的 X25519 / Ed25519 / XChaCha20-Poly1305

目标框架为 `net10.0`。

## 如何把 .proto 编译成 C#

不需要手动执行 `protoc`。在 `LingCat.ClientProtocol.csproj` 里把 `.proto` 声明为 `Protobuf` 项，MSBuild 会在构建时生成 C#：

```xml
<ItemGroup>
  <Protobuf Include="..\protocol\classes.proto" ProtoRoot="..\protocol" GrpcServices="None" />
  <Protobuf Include="..\protocol\methods.proto" ProtoRoot="..\protocol" GrpcServices="None" />
</ItemGroup>
```

说明：

- `ProtoRoot` 必须指向包含所有 import 的目录；`methods.proto` 会 import `classes.proto`。
- `GrpcServices="None"`：这里只用 protobuf 消息，不用 gRPC 服务。
- 生成文件在 `obj/Debug/net10.0/Classes.cs`、`Methods.cs`，不需要提交。
- 生成命名空间由 `package` 决定：`lingcat.classes` → `Lingcat.Classes`，`lingcat.methods` → `Lingcat.Methods`。
- 修改 `.proto` 后直接重新构建即可。

## 基本用法

```csharp
using LingCat.ClientProtocol;
using LingCat.Protocol;

var client = new LingCatClient(
    serverWs: "ws://127.0.0.1:3601",
    serverHttp: "http://127.0.0.1:3601",
    serverPublicKey: Convert.FromHexString(publicKeyHex));

client.LogMessage = Console.WriteLine;

// 一次性连接（失败直接抛异常，不自动重连）
await client.ConnectAsync();

var userId = await client.RegisterAsync("password", "昵称", "username");
var token = await client.LoginAsync("username", "password");
await client.AuthorizeAsync(token, Guid.NewGuid().ToString("N"));
var me = await client.QueryMyUserInfoAsync(token);

await client.DisposeAsync();
```

长期运行的客户端用 `Init()` 启动自动重连循环：

```csharp
client.Initialized += () => Console.WriteLine("handshake done");
client.ConnectionStateChanged += () => Console.WriteLine(client.ConnectionState);

client.Init(); // 后台连接 + 断线自动重连
```

常用事件：

- `ConnectionStateChanged`：`Idle / Connecting / Connected / Reconnecting / Disconnected`
- `Initialized`：握手完成，可以发加密请求
- `PackageReceived`：收到任意服务端包（含事件、心跳、响应）
- `HandshakeFailed`：服务端公钥验签失败

## 协议要点

- **加密**：XChaCha20-Poly1305-IETF，24 字节 nonce，16 字节 tag；AAD 为 4 字节大端序 `seq`。
- **序号**：TypeScript 用 `-1` 表示“未设置”；C# 用 `uint` + `Package.NoSeq == uint.MaxValue`。
- **防重放**：`Package.Decode(bytes, key, lastSeq)` 会检查 `seq <= lastSeq`；`NoSeq` 不参与比较。
- **握手**：
  1. 客户端生成 X25519 临时密钥对，发送未加密的 `HandShake_Request`。
  2. 服务端返回 `salt`、`message_to_be_verify`、`server_public_key`。
  3. 客户端用服务端长期 Ed25519 公钥验证 `server_public_key || client_public_key` 的签名。
  4. 用 X25519 共享秘密 + HKDF-SHA256 派生双向密钥：
     - `server-to-client` → `KeyRecv`
     - `client-to-server` → `KeySend`
- **请求匹配**：每个请求自动生成 6 字节 `request_id`，响应按十六进制字符串匹配。
- **加密方向**：服务端只在收到加密包时回复加密包；握手响应始终是明文。
- **服务端公钥**：来自服务端数据目录的 `key/public`，或 HTTP `GET /config.json` 的 `public_key` 字段。

## 测试

### 1. 内部自测

覆盖 Package 往返、加解密、重放 / 篡改 / 错误密钥、X25519 对称性、Ed25519、RFC 5869 HKDF、错误响应解码。

```bash
dotnet run --project desktop_core_tests -- selftest
```

### 2. 与 TypeScript / libsodium 互通

C# 生成向量 → Node 用 libsodium 验证 → Node 生成向量 → C# 验证。

```bash
mkdir -p /tmp/opencode/lingcat-interop

dotnet run --project desktop_core_tests -- \
    emit /tmp/opencode/lingcat-interop/csharp_vectors.json

node desktop_core_tests/interop.mjs /tmp/opencode/lingcat-interop

dotnet run --project desktop_core_tests -- \
    verify /tmp/opencode/lingcat-interop/ts_vectors.json
```

互通脚本依赖仓库根目录已执行 `npm ci`（使用其中的 `libsodium-wrappers-sumo` 和 `protobufjs`）。

### 3. 真实服务端端到端

```bash
npm ci                 # 首次运行需要安装服务端依赖
./desktop_core_tests/run-e2e.sh
```

脚本会在 `/tmp/opencode/lingcat-e2e` 启动一个隔离数据目录的服务端，然后依次测试：

握手 → 注册 → 登录 → 授权 → 查询用户信息 → 错误密码 → 在线状态 → 手动重连 → 自动重连

端口可通过第二个参数覆盖：`./desktop_core_tests/run-e2e.sh /tmp/my-data 3602`。

## 与 TypeScript 实现的差异

- `Package.Seq` 使用 `uint` + `NoSeq`，而不是 `int` + `-1`。
- `Package.Decode` 只有在包已加密且传入非空密钥时才解密。
- `ProtoDecode.DecodeOrThrow` 先用 C# 的 `Error_Response` 解析；遇到 wire type 不匹配会捕获 `InvalidProtocolBufferException` 再解析目标消息，行为与 protobufjs 的“跳过不匹配字段”一致。
- `UserApi` 返回生成的 protobuf 消息（如 `Lingcat.Classes.IUser`），而不是 TS 里的 snake_case 普通对象。

## 后续

- 继续移植 `ChatApi`、`MessageParser`、`FileApi`、`StickerApi`、`MeetingApi`、`E2EApi`、`OAuthApi`
- 事件订阅与本地状态缓存
- Avalonia UI 层（`desktop_avaloniaui` 已引用本项目）
- 文件上传 / 下载、端到端加密会话
