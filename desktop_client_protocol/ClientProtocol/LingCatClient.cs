using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Security.Cryptography;
using Google.Protobuf;
using LingCat.Protocol;

namespace LingCat.ClientProtocol;

public enum ClientConnectionState
{
    Idle,
    Connecting,
    Connected,
    Reconnecting,
    Disconnected,
}

/// <summary>
/// 与 <c>client_protocol/LingCatClient.ts</c> 对应的 C# 客户端。
/// 负责 WebSocket 连接、握手、加密、请求/响应匹配、心跳和自动重连。
/// </summary>
public sealed class LingCatClient : IAsyncDisposable
{
    private const int MaxMessageSize = 64 * 1024 * 1024;
    private static readonly TimeSpan HandshakeTimeout = TimeSpan.FromSeconds(15);
    private static readonly TimeSpan DefaultRequestTimeout = TimeSpan.FromSeconds(20);
    private static readonly TimeSpan PingInterval = TimeSpan.FromSeconds(30);

    private readonly SemaphoreSlim _connectLock = new(1, 1);
    private readonly SemaphoreSlim _sendLock = new(1, 1);
    private readonly ConcurrentDictionary<string, PendingRequest> _pendingRequests = new();
    private readonly List<Action<Package>> _receiveListeners = new();

    private Connection? _connection;
    private CancellationTokenSource? _pingCts;
    private Task? _pingTask;
    private DateTimeOffset? _lastPingSentAt;

    private Task? _runTask;
    private CancellationTokenSource? _runCts;
    private bool _manualDisconnect;
    private bool _disposed;
    private ClientConnectionState _connectionState = ClientConnectionState.Idle;

    public LingCatClient(string serverWs, string serverHttp, byte[] serverPublicKey)
    {
        ServerWs = serverWs;
        ServerHttp = serverHttp;
        ServerPublicKey = serverPublicKey;
    }

    public string ServerWs { get; }
    public string ServerHttp { get; }
    public byte[] ServerPublicKey { get; }
    public ClientSession Session { get; } = new();

    public ClientConnectionState ConnectionState => _connectionState;
    public double? LastPingRttMs { get; private set; }
    public DateTimeOffset? LastMessageAt { get; private set; }
    public int ReconnectCount { get; private set; }

    /// <summary>连接状态变化时触发。</summary>
    public event Action? ConnectionStateChanged;

    /// <summary>收到任意服务端包时触发（握手、心跳、事件、响应都会触发）。</summary>
    public event Action<Package>? PackageReceived;

    /// <summary>握手失败时触发，参数为失败原因。</summary>
    public event Action<string>? HandshakeFailed;

    /// <summary>握手完成、可以开始发加密请求时触发。</summary>
    public event Action? Initialized;

    /// <summary>调试日志输出。</summary>
    public Action<string>? LogMessage { get; set; }

    public string GetFileUrlByHash(string hash)
    {
        return ServerHttp.EndsWith('/')
            ? ServerHttp + "uploaded_files/" + hash
            : ServerHttp + "/uploaded_files/" + hash;
    }

    public string GetFileUrlByHashAndToken(string hash, string fileAccessToken)
    {
        return GetFileUrlByHash(hash) + "?file_access_token=" + fileAccessToken;
    }

    public void AddOnReceiveListener(Action<Package> listener)
    {
        lock (_receiveListeners)
        {
            _receiveListeners.Add(listener);
        }
    }

    public void RemoveOnReceiveListener(Action<Package> listener)
    {
        lock (_receiveListeners)
        {
            _receiveListeners.Remove(listener);
        }
    }

    /// <summary>
    /// 启动后台连接循环（自动重连）。适合主客户端长期运行。
    /// </summary>
    public void Init()
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        if (_runTask is { IsCompleted: false })
        {
            return;
        }

        _manualDisconnect = false;
        _runCts?.Dispose();
        _runCts = new CancellationTokenSource();
        _runTask = RunAsync(_runCts.Token);
    }

    /// <summary>
    /// 建立连接并完成握手。失败会抛出异常，不会自动重连。
    /// 主客户端通常用 <see cref="Init"/>；临时客户端可以直接 await 此方法。
    /// </summary>
    public async Task ConnectAsync(CancellationToken cancellationToken = default)
    {
        ObjectDisposedException.ThrowIf(_disposed, this);
        await _connectLock.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            if (_connection is not null)
            {
                return;
            }

            _manualDisconnect = false;
            if (_connectionState != ClientConnectionState.Reconnecting)
            {
                SetConnectionState(ClientConnectionState.Connecting);
            }

            var socket = new ClientWebSocket();
            var connection = new Connection(socket);
            _connection = connection;

            try
            {
                await socket.ConnectAsync(new Uri(ServerWs), cancellationToken)
                    .ConfigureAwait(false);

                connection.ReceiveTask = ReceiveLoopAsync(connection);
                connection.KeyPair = SecureKey.GenerateExchangeKeyPair();

                await SendHandshakeAsync(connection, cancellationToken).ConfigureAwait(false);
                await connection.Handshake.Task
                    .WaitAsync(HandshakeTimeout, cancellationToken)
                    .ConfigureAwait(false);
            }
            catch
            {
                await CleanupConnectionAsync(connection).ConfigureAwait(false);
                if (_runTask is null)
                {
                    SetConnectionState(ClientConnectionState.Disconnected);
                }
                throw;
            }
        }
        finally
        {
            _connectLock.Release();
        }
    }

    /// <summary>
    /// 主动断开。不会触发自动重连。
    /// </summary>
    public async Task DisconnectAsync()
    {
        _manualDisconnect = true;
        SetConnectionState(ClientConnectionState.Disconnected);
        Cancel(_runCts);

        var connection = _connection;
        _connection = null;

        StopPing();
        RejectAllPending("Client disconnected");
        ClearSession();

        if (connection is not null)
        {
            connection.Handshake.TrySetCanceled();
            Cancel(connection.Cts);

            try
            {
                if (connection.Socket.State == WebSocketState.Open)
                {
                    using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));
                    await connection.Socket.CloseOutputAsync(
                        WebSocketCloseStatus.NormalClosure,
                        "disconnect",
                        cts.Token).ConfigureAwait(false);
                }
            }
            catch
            {
                // ignore
            }

            try
            {
                connection.Socket.Dispose();
            }
            catch
            {
                // ignore
            }

            connection.Closed.TrySetResult(null);
        }
    }

    /// <summary>
    /// 强制重连。若后台连接循环正在运行，会关闭当前连接并交给循环重连。
    /// </summary>
    public async Task ReconnectAsync()
    {
        var autoReconnect = _runTask is { IsCompleted: false };
        if (autoReconnect)
        {
            _manualDisconnect = false;

            var connection = _connection;
            _connection = null;

            StopPing();
            RejectAllPending("Reconnecting");
            ClearSession();

            if (connection is not null)
            {
                connection.Handshake.TrySetCanceled();
                Cancel(connection.Cts);
                try
                {
                    connection.Socket.Abort();
                }
                catch
                {
                    // ignore
                }
                connection.Closed.TrySetResult(null);
            }

            return;
        }

        await DisconnectAsync().ConfigureAwait(false);
        _manualDisconnect = false;
        await ConnectAsync().ConfigureAwait(false);
    }

    public Task<Package> InvokeAsync(
        uint methodId,
        byte[] data,
        uint flags = 0,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var package = Package.Create(methodId, data, flags);
        return InvokeInternalAsync(
            package,
            encrypt: true,
            timeout ?? DefaultRequestTimeout,
            cancellationToken);
    }

    public Task<Package> InvokeUnencryptedAsync(
        uint methodId,
        byte[] data,
        uint flags = 0,
        TimeSpan? timeout = null,
        CancellationToken cancellationToken = default)
    {
        var package = Package.Create(methodId, data, flags);
        return InvokeInternalAsync(
            package,
            encrypt: false,
            timeout ?? DefaultRequestTimeout,
            cancellationToken);
    }

    public async ValueTask DisposeAsync()
    {
        if (_disposed)
        {
            return;
        }

        _disposed = true;
        await DisconnectAsync().ConfigureAwait(false);

        var runTask = _runTask;
        if (runTask is not null)
        {
            try
            {
                await runTask.ConfigureAwait(false);
            }
            catch
            {
                // ignore
            }
        }

        _runCts?.Dispose();

        // SemaphoreSlim 不持有需要显式释放的非托管资源；这里不 Dispose，
        // 避免与仍在收尾的后台任务（心跳 / 重连循环）竞争。
    }

    private async Task RunAsync(CancellationToken cancellationToken)
    {
        var backoff = TimeSpan.FromSeconds(1);

        while (!_manualDisconnect && !_disposed)
        {
            try
            {
                await ConnectAsync().ConfigureAwait(false);
                backoff = TimeSpan.FromSeconds(1);

                var connection = _connection;
                if (connection is not null)
                {
                    await connection.Closed.Task.ConfigureAwait(false);
                }
            }
            catch (Exception ex)
            {
                Log($"[client] connect failed: {ex.Message}");
            }

            if (_manualDisconnect || _disposed)
            {
                break;
            }

            SetConnectionState(ClientConnectionState.Reconnecting);
            try
            {
                await Task.Delay(backoff, cancellationToken).ConfigureAwait(false);
            }
            catch (OperationCanceledException)
            {
                break;
            }

            backoff = TimeSpan.FromSeconds(Math.Min(backoff.TotalSeconds * 2, 30));
        }

        if (!_disposed)
        {
            SetConnectionState(ClientConnectionState.Disconnected);
        }
    }

    private async Task SendHandshakeAsync(
        Connection connection,
        CancellationToken cancellationToken)
    {
        var keyPair = connection.KeyPair
            ?? throw new InvalidOperationException("Missing handshake key pair");

        var request = new Lingcat.Methods.HandShake_Request
        {
            ClientPublicKey = ByteString.CopyFrom(keyPair.PublicKey),
        };

        var package = Package.Create(Methods.HandShake_Request, request.ToByteArray());
        await SendPackageAsync(connection, package, encrypt: false, cancellationToken)
            .ConfigureAwait(false);
    }

    private async Task ReceiveLoopAsync(Connection connection)
    {
        var socket = connection.Socket;
        var cancellationToken = connection.Cts.Token;
        var buffer = new byte[64 * 1024];
        using var messageBuffer = new MemoryStream();

        try
        {
            while (!cancellationToken.IsCancellationRequested
                   && socket.State == WebSocketState.Open)
            {
                messageBuffer.SetLength(0);

                ValueWebSocketReceiveResult result;
                do
                {
                    result = await socket.ReceiveAsync(buffer.AsMemory(), cancellationToken)
                        .ConfigureAwait(false);

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        return;
                    }

                    if (result.MessageType == WebSocketMessageType.Binary)
                    {
                        messageBuffer.Write(buffer, 0, result.Count);
                        if (messageBuffer.Length > MaxMessageSize)
                        {
                            throw new InvalidOperationException("WebSocket message too large");
                        }
                    }
                }
                while (!result.EndOfMessage);

                if (messageBuffer.Length == 0)
                {
                    continue;
                }

                await HandlePackageAsync(connection, messageBuffer.ToArray(), cancellationToken)
                    .ConfigureAwait(false);
            }
        }
        catch (OperationCanceledException)
        {
            // normal shutdown
        }
        catch (Exception ex)
        {
            Log($"[client] receive loop failed: {ex.Message}");
        }
        finally
        {
            connection.Handshake.TrySetCanceled();

            if (ReferenceEquals(_connection, connection))
            {
                _connection = null;
                StopPing();
                RejectAllPending("Connection closed");
                ClearSession();
            }

            connection.Closed.TrySetResult(null);

            try
            {
                socket.Dispose();
            }
            catch
            {
                // ignore
            }

            if (!_manualDisconnect && !_disposed && _runTask is null)
            {
                SetConnectionState(ClientConnectionState.Disconnected);
            }
        }
    }

    private async Task HandlePackageAsync(
        Connection connection,
        byte[] data,
        CancellationToken cancellationToken)
    {
        if (!ReferenceEquals(_connection, connection))
        {
            return;
        }

        Package package;
        try
        {
            var keyRecv = Session.KeyRecv;
            package = keyRecv is null
                ? Package.Decode(data, default, Session.RecvSeq)
                : Package.Decode(data, keyRecv, Session.RecvSeq);
        }
        catch (Exception ex)
        {
            Log($"[client] decode failed: {ex.Message}");
            return;
        }

        if (package.IsEncrypted)
        {
            Log("[client] received encrypted package before handshake, dropped");
            return;
        }

        Session.RecvSeq = package.Seq;
        LastMessageAt = DateTimeOffset.UtcNow;
        Log($"[recv] {package}");

        switch (package.MethodId)
        {
            case Methods.HandShake_Response:
                await HandleHandshakeResponseAsync(connection, package).ConfigureAwait(false);
                break;

            case Methods.Ping_Response:
                HandlePingResponse(package);
                break;
        }

        if (package.RequestId.Length > 0)
        {
            var requestId = Convert.ToHexString(package.RequestId);
            if (_pendingRequests.TryRemove(requestId, out var pending))
            {
                pending.Completion.TrySetResult(package);
            }
        }

        PackageReceived?.Invoke(package);

        Action<Package>[] listeners;
        lock (_receiveListeners)
        {
            listeners = _receiveListeners.ToArray();
        }

        foreach (var listener in listeners)
        {
            try
            {
                listener(package);
            }
            catch (Exception ex)
            {
                Log($"[client] receive listener failed: {ex.Message}");
            }
        }

        await Task.CompletedTask.ConfigureAwait(false);
    }

    private Task HandleHandshakeResponseAsync(Connection connection, Package package)
    {
        var response = Lingcat.Methods.HandShake_Response.Parser.ParseFrom(package.Data);
        if (connection.KeyPair is not { } keyPair)
        {
            connection.Handshake.TrySetException(
                new InvalidOperationException("Missing handshake key pair"));
            return Task.CompletedTask;
        }

        var verified = SecureKey.ClientCheckSignedMessage(
            response.MessageToBeVerify.Span,
            response.ServerPublicKey.Span,
            keyPair.PublicKey,
            ServerPublicKey);

        if (!verified)
        {
            _manualDisconnect = true;
            SetConnectionState(ClientConnectionState.Disconnected);
            HandshakeFailed?.Invoke("server_public_key_mismatch");
            connection.Handshake.TrySetException(
                new InvalidOperationException("Server public key verification failed"));

            try
            {
                connection.Socket.Abort();
            }
            catch
            {
                // ignore
            }

            return Task.CompletedTask;
        }

        var sharedSecret = SecureKey.GetSharedSecret(
            response.ServerPublicKey.Span,
            keyPair.PrivateKey);

        var (keyRecv, keySend) = SecureKey.ClientHkdf(sharedSecret, response.Salt.Span);
        CryptographicOperations.ZeroMemory(sharedSecret);

        Session.KeyRecv = keyRecv;
        Session.KeySend = keySend;
        Session.SendSeq = 0;
        Session.RecvSeq = Package.NoSeq;

        StartPing();
        SetConnectionState(ClientConnectionState.Connected);
        Initialized?.Invoke();
        connection.Handshake.TrySetResult(true);

        return Task.CompletedTask;
    }

    private void HandlePingResponse(Package package)
    {
        var response = Lingcat.Methods.Ping_Response.Parser.ParseFrom(package.Data);
        if (_lastPingSentAt is { } sentAt)
        {
            LastPingRttMs = (DateTimeOffset.UtcNow - sentAt).TotalMilliseconds;
        }

        Log($"[client] RTT: {LastPingRttMs:F1}ms, server time: {response.Usage}ms");
    }

    private async Task<Package> InvokeInternalAsync(
        Package package,
        bool encrypt,
        TimeSpan timeout,
        CancellationToken cancellationToken)
    {
        var requestId = Convert.ToHexString(package.RequestId);
        var completion = new TaskCompletionSource<Package>(
            TaskCreationOptions.RunContinuationsAsynchronously);

        using var timeoutCts = new CancellationTokenSource(timeout);
        using var linkedCts = CancellationTokenSource.CreateLinkedTokenSource(
            cancellationToken,
            timeoutCts.Token);

        var pending = new PendingRequest(completion);
        _pendingRequests[requestId] = pending;

        try
        {
            await SendPackageAsync(package, encrypt, linkedCts.Token).ConfigureAwait(false);
            return await completion.Task.WaitAsync(linkedCts.Token).ConfigureAwait(false);
        }
        catch (OperationCanceledException)
            when (timeoutCts.IsCancellationRequested && !cancellationToken.IsCancellationRequested)
        {
            throw new TimeoutException(
                $"Request timeout {timeout.TotalMilliseconds:0}ms " +
                $"({Methods.GetMethodName(package.MethodId)})");
        }
        finally
        {
            _pendingRequests.TryRemove(requestId, out _);
            pending.Dispose();
        }
    }

    private Task SendPackageAsync(
        Package package,
        bool encrypt,
        CancellationToken cancellationToken)
    {
        var connection = _connection
            ?? throw new InvalidOperationException("WebSocket not connected");
        return SendPackageAsync(connection, package, encrypt, cancellationToken);
    }

    private async Task SendPackageAsync(
        Connection connection,
        Package package,
        bool encrypt,
        CancellationToken cancellationToken)
    {
        await _sendLock.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            if (!ReferenceEquals(_connection, connection)
                || connection.Socket.State != WebSocketState.Open)
            {
                throw new InvalidOperationException("WebSocket not connected");
            }

            if (encrypt)
            {
                var keySend = Session.KeySend
                    ?? throw new InvalidOperationException("Client is not handshaken");

                package.Encrypt(Session.SendSeq, keySend);
                Session.SendSeq++;
            }

            var bytes = package.ToBuffer();
            await connection.Socket.SendAsync(
                bytes,
                WebSocketMessageType.Binary,
                endOfMessage: true,
                cancellationToken).ConfigureAwait(false);

            Log($"[send] {package}");
        }
        finally
        {
            _sendLock.Release();
        }
    }

    private void StartPing()
    {
        StopPing();
        _pingCts = new CancellationTokenSource();
        _pingTask = PingLoopAsync(_pingCts.Token);
    }

    private void StopPing()
    {
        Cancel(_pingCts);
        _pingCts?.Dispose();
        _pingCts = null;
        _pingTask = null;
        _lastPingSentAt = null;
        LastPingRttMs = null;
    }

    private async Task PingLoopAsync(CancellationToken cancellationToken)
    {
        try
        {
            using var timer = new PeriodicTimer(PingInterval);
            while (await timer.WaitForNextTickAsync(cancellationToken).ConfigureAwait(false))
            {
                if (Session.KeySend is null)
                {
                    continue;
                }

                try
                {
                    _lastPingSentAt = DateTimeOffset.UtcNow;
                    var request = new Lingcat.Methods.Ping_Request
                    {
                        Time = (ulong)DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
                    };

                    var package = Package.Create(Methods.Ping_Request, request.ToByteArray());
                    await SendPackageAsync(package, encrypt: true, cancellationToken)
                        .ConfigureAwait(false);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    Log($"[client] ping failed: {ex.Message}");
                }
            }
        }
        catch (OperationCanceledException)
        {
            // normal shutdown
        }
    }

    private async Task CleanupConnectionAsync(Connection connection)
    {
        if (ReferenceEquals(_connection, connection))
        {
            _connection = null;
            StopPing();
            RejectAllPending("Connection closed");
            ClearSession();
        }

        connection.Handshake.TrySetCanceled();
        Cancel(connection.Cts);

        try
        {
            connection.Socket.Abort();
        }
        catch
        {
            // ignore
        }

        try
        {
            connection.Socket.Dispose();
        }
        catch
        {
            // ignore
        }

        connection.Closed.TrySetResult(null);

        var receiveTask = connection.ReceiveTask;
        if (receiveTask is not null)
        {
            try
            {
                await receiveTask.ConfigureAwait(false);
            }
            catch
            {
                // ignore
            }
        }
    }

    private void ClearSession()
    {
        if (Session.KeySend is not null)
        {
            CryptographicOperations.ZeroMemory(Session.KeySend);
        }
        if (Session.KeyRecv is not null)
        {
            CryptographicOperations.ZeroMemory(Session.KeyRecv);
        }

        Session.KeySend = null;
        Session.KeyRecv = null;
        Session.SendSeq = 0;
        Session.RecvSeq = Package.NoSeq;
    }

    private void RejectAllPending(string reason)
    {
        foreach (var pair in _pendingRequests)
        {
            if (_pendingRequests.TryRemove(pair.Key, out var pending))
            {
                pending.Completion.TrySetException(new IOException(reason));
                pending.Dispose();
            }
        }
    }

    private void SetConnectionState(ClientConnectionState state)
    {
        if (state == _connectionState)
        {
            return;
        }

        if (state == ClientConnectionState.Reconnecting)
        {
            ReconnectCount++;
        }

        _connectionState = state;
        ConnectionStateChanged?.Invoke();
    }

    private void Log(string message)
    {
        LogMessage?.Invoke(message);
    }

    private static void Cancel(CancellationTokenSource? cts)
    {
        try
        {
            cts?.Cancel();
        }
        catch
        {
            // ignore
        }
    }

    private sealed class Connection
    {
        public Connection(ClientWebSocket socket)
        {
            Socket = socket;
        }

        public ClientWebSocket Socket { get; }
        public CancellationTokenSource Cts { get; } = new();
        public TaskCompletionSource<bool> Handshake { get; } =
            new(TaskCreationOptions.RunContinuationsAsynchronously);
        public TaskCompletionSource<object?> Closed { get; } =
            new(TaskCreationOptions.RunContinuationsAsynchronously);
        public (byte[] PublicKey, byte[] PrivateKey)? KeyPair { get; set; }
        public Task? ReceiveTask { get; set; }
    }

    private sealed class PendingRequest : IDisposable
    {
        public PendingRequest(TaskCompletionSource<Package> completion)
        {
            Completion = completion;
        }

        public TaskCompletionSource<Package> Completion { get; }

        public void Dispose()
        {
        }
    }
}

public sealed class ClientSession
{
    public byte[]? KeySend { get; internal set; }
    public byte[]? KeyRecv { get; internal set; }
    public uint RecvSeq { get; internal set; } = Package.NoSeq;
    public uint SendSeq { get; internal set; }
}
