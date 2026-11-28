using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Security.Cryptography;
using Google.Protobuf;
using ProtoMethods = Lingcat.Methods;

namespace LingCat.ClientProtocol.Client;

public enum ClientConnectionState
{
    Idle,
    Connecting,
    Connected,
    Reconnecting,
    Disconnected,
}

/// <summary>
/// 灵猫客户端连接，移植自 client_protocol/LingCatClient.ts。
/// 负责 WebSocket 连接、握手、XChaCha20-Poly1305 加解密、请求匹配与自动重连。
/// </summary>
public class LingCatClient : IAsyncDisposable
{
    /// <summary>会话密钥与收发序列号。</summary>
    public sealed class ClientSession
    {
        public byte[]? KeySend { get; set; }
        public byte[]? KeyRecv { get; set; }
        public long RecvSeq { get; set; } = -1;
        public long SendSeq { get; set; } = -1;
    }

    private sealed class PendingRequest : IDisposable
    {
        public TaskCompletionSource<Package> Completion { get; } =
            new(TaskCreationOptions.RunContinuationsAsynchronously);

        private readonly Timer? _timer;

        public PendingRequest(int timeoutMs, Action onTimeout)
        {
            if (timeoutMs > 0)
            {
                _timer = new Timer(_ => onTimeout(), null, timeoutMs, Timeout.Infinite);
            }
        }

        public void Dispose() => _timer?.Dispose();
    }

    private sealed class ActionDisposable(Action dispose) : IDisposable
    {
        private Action? _dispose = dispose;

        public void Dispose() => Interlocked.Exchange(ref _dispose, null)?.Invoke();
    }

    private readonly object _stateLock = new();
    private readonly object _listenersLock = new();
    private readonly object _seqLock = new();
    private readonly SemaphoreSlim _connectLock = new(1, 1);
    private readonly SemaphoreSlim _sendLock = new(1, 1);
    private readonly ConcurrentDictionary<string, PendingRequest> _pendingRequests = new();
    private readonly HashSet<Action> _connectionListeners = new();
    private readonly List<Action<Package>> _receiveListeners = new();

    private ClientWebSocket? _client;
    private CancellationTokenSource? _connectionCts;
    private CancellationTokenSource? _pingCts;
    private ClientConnectionState _connectionState = ClientConnectionState.Idle;
    private volatile bool _manualDisconnect;
    private int _connectionGeneration;
    private long _lastPingSentAt;

    public LingCatClient(string serverWs, string serverHttp, byte[] serverPublicKey)
    {
        ServerWs = serverWs;
        ServerHttp = serverHttp;
        ServerPublicKey = serverPublicKey;
    }

    public string ServerWs { get; set; }
    public string ServerHttp { get; set; }
    public byte[] ServerPublicKey { get; set; }

    public ClientSession Session { get; } = new();

    /// <summary>最近一次心跳 RTT（毫秒），未收到心跳响应时为 null。</summary>
    public long? LastPingRtt { get; private set; }

    /// <summary>最近一次收到任意服务端消息的时间（Unix 毫秒）。</summary>
    public long? LastMessageAt { get; private set; }

    /// <summary>自动重连次数（实例生命周期内累计）。</summary>
    public long ReconnectCount { get; private set; }

    /// <summary>自动重连前的等待时间，避免服务端不可达时无限空转。</summary>
    public TimeSpan ReconnectDelay { get; set; } = TimeSpan.FromSeconds(1);

    /// <summary>应用层心跳间隔。</summary>
    public TimeSpan PingInterval { get; set; } = TimeSpan.FromSeconds(30);

    /// <summary>可选日志输出；为 null 时不输出。</summary>
    public Action<string>? Logger { get; set; }

    public ClientConnectionState ConnectionState
    {
        get
        {
            lock (_stateLock) return _connectionState;
        }
    }

    public bool IsConnected => ConnectionState == ClientConnectionState.Connected;

    /// <summary>握手校验失败时触发。</summary>
    public event Action<string>? HandshakeFailed;

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

    public IDisposable SubscribeConnectionState(Action listener)
    {
        lock (_listenersLock) _connectionListeners.Add(listener);

        return new ActionDisposable(() =>
        {
            lock (_listenersLock) _connectionListeners.Remove(listener);
        });
    }

    public void AddOnReceiveListener(Action<Package> listener)
    {
        lock (_listenersLock) _receiveListeners.Add(listener);
    }

    public void RemoveOnReceiveListener(Action<Package> listener)
    {
        lock (_listenersLock) _receiveListeners.Remove(listener);
    }

    public Task<Package> Invoke(uint methodId, byte[] data, uint flags = 0, int timeoutMs = 20000)
    {
        var keySend = Session.KeySend
            ?? throw new InvalidOperationException("发送密钥尚未就绪（握手未完成）");

        var package = Package.Encode(methodId, data, flags);
        package.Encrypt(NextSendSeq(), keySend);

        return InvokeInternalAsync(package, timeoutMs);
    }

    public Task<Package> InvokeUnEncrypted(uint methodId, byte[] data, uint flags = 0, int timeoutMs = 20000)
    {
        return InvokeInternalAsync(Package.Encode(methodId, data, flags), timeoutMs);
    }

    private async Task<Package> InvokeInternalAsync(Package package, int timeoutMs)
    {
        var requestId = ToHex(package.RequestId);

        PendingRequest? pending = null;
        pending = new PendingRequest(timeoutMs, () =>
        {
            if (_pendingRequests.TryRemove(requestId, out var removed) && ReferenceEquals(removed, pending))
            {
                removed.Completion.TrySetException(new TimeoutException(
                    $"Request timeout {timeoutMs}ms ({Methods.GetMethodName(package.MethodId)})"));
                removed.Dispose();
            }
        });

        if (!_pendingRequests.TryAdd(requestId, pending))
        {
            pending.Dispose();
            throw new InvalidOperationException($"Duplicate request id: {requestId}");
        }

        var client = _client;
        if (client == null || client.State != WebSocketState.Open)
        {
            if (_pendingRequests.TryRemove(requestId, out var removed)) removed.Dispose();
            throw new InvalidOperationException("WebSocket not connected");
        }

        try
        {
            await SendRawAsync(client, package.ToBuffer(), CancellationToken.None).ConfigureAwait(false);
        }
        catch
        {
            if (_pendingRequests.TryRemove(requestId, out var removed)) removed.Dispose();
            throw;
        }

        Log($"[发] Method: {Methods.GetMethodName(package.MethodId)} | Flags: {package.Flags} " +
            $"| Data length: {package.Length} | Request ID: {requestId}");

        return await pending.Completion.Task.ConfigureAwait(false);
    }

    /// <summary>握手成功后的回调，可在子类中重写。</summary>
    protected virtual void OnInit()
    {
    }

    protected virtual void OnHandshakeFailed(string reason)
    {
        HandshakeFailed?.Invoke(reason);
    }

    public void Init()
    {
        lock (_stateLock)
        {
            if (_client != null) return;
        }

        _ = ConnectAsync();
    }

    private async Task ConnectAsync()
    {
        await _connectLock.WaitAsync().ConfigureAwait(false);

        ClientWebSocket? client = null;
        CancellationTokenSource? cts = null;
        var shouldReconnect = false;
        var generation = 0;

        try
        {
            lock (_stateLock)
            {
                if (_client != null) return;
            }

            generation = Volatile.Read(ref _connectionGeneration);

            client = new ClientWebSocket();
            client.Options.KeepAliveInterval = TimeSpan.Zero; // 使用应用层心跳
            cts = new CancellationTokenSource();

            lock (_stateLock)
            {
                if (_manualDisconnect || generation != _connectionGeneration) return;

                _client = client;
                _connectionCts = cts;
            }

            if (_manualDisconnect || generation != Volatile.Read(ref _connectionGeneration)) return;
            if (ConnectionState != ClientConnectionState.Reconnecting)
            {
                SetConnectionState(ClientConnectionState.Connecting);
            }

            await client.ConnectAsync(new Uri(ServerWs), cts.Token).ConfigureAwait(false);

            if (!ReferenceEquals(_client, client) || _manualDisconnect ||
                generation != Volatile.Read(ref _connectionGeneration)) return;

            var keyPair = SecureKey.GenerateExchangeKeyPair();

            var handshake = new ProtoMethods.HandShake_Request
            {
                ClientPublicKey = ByteString.CopyFrom(keyPair.PublicKey),
            };

            var handshakePackage = Package.Encode(Methods.HandShake_Request, handshake.ToByteArray());
            await SendRawAsync(client, handshakePackage.ToBuffer(), cts.Token).ConfigureAwait(false);

            await ReceiveLoopAsync(client, cts.Token, keyPair).ConfigureAwait(false);
        }
        catch (OperationCanceledException) when (cts?.IsCancellationRequested == true)
        {
        }
        catch (Exception ex)
        {
            Log($"[Client] connection error: {ex.Message}");
        }
        finally
        {
            try
            {
                bool ownsConnection;
                lock (_stateLock)
                {
                    ownsConnection = client != null && ReferenceEquals(_client, client);
                    if (ownsConnection)
                    {
                        _client = null;
                        _connectionCts = null;
                    }
                }

                if (ownsConnection)
                {
                    StopPing();
                    LastPingRtt = null;
                    RejectAllPending("Connection closed");

                    if (_manualDisconnect ||
                        generation != Volatile.Read(ref _connectionGeneration))
                    {
                        SetConnectionState(ClientConnectionState.Disconnected);
                    }
                    else
                    {
                        SetConnectionState(ClientConnectionState.Reconnecting);
                        shouldReconnect = true;
                    }
                }

                if (client != null)
                {
                    try { client.Dispose(); } catch { /* ignore */ }
                }

                cts?.Dispose();
            }
            finally
            {
                _connectLock.Release();
            }
        }

        if (shouldReconnect) ScheduleReconnect();
    }

    private void ScheduleReconnect()
    {
        if (ReconnectDelay <= TimeSpan.Zero)
        {
            Init();
            return;
        }

        _ = Task.Run(async () =>
        {
            try
            {
                await Task.Delay(ReconnectDelay).ConfigureAwait(false);
            }
            catch
            {
                return;
            }

            if (!_manualDisconnect) Init();
        });
    }

    private async Task ReceiveLoopAsync(
        ClientWebSocket client,
        CancellationToken cancellationToken,
        (byte[] PublicKey, byte[] PrivateKey) keyPair)
    {
        var buffer = new byte[64 * 1024];
        using var messageBuffer = new MemoryStream();

        while (!cancellationToken.IsCancellationRequested && client.State == WebSocketState.Open)
        {
            WebSocketReceiveResult result;
            try
            {
                result = await client.ReceiveAsync(buffer, cancellationToken).ConfigureAwait(false);
            }
            catch (OperationCanceledException)
            {
                break;
            }
            catch (WebSocketException) when (cancellationToken.IsCancellationRequested ||
                                              client.State != WebSocketState.Open)
            {
                break;
            }

            if (result.MessageType == WebSocketMessageType.Close) break;
            if (result.MessageType != WebSocketMessageType.Binary) continue;

            messageBuffer.Write(buffer, 0, result.Count);
            if (!result.EndOfMessage) continue;

            var bytes = messageBuffer.ToArray();
            messageBuffer.SetLength(0);

            try
            {
                await HandleMessageAsync(bytes, keyPair, client, cancellationToken).ConfigureAwait(false);
            }
            catch (Exception ex)
            {
                Log($"[Client] message handling failed: {ex}");
            }
        }
    }

    private async Task HandleMessageAsync(
        byte[] buffer,
        (byte[] PublicKey, byte[] PrivateKey) keyPair,
        ClientWebSocket client,
        CancellationToken cancellationToken)
    {
        LastMessageAt = NowMs();

        var package = Package.Decode(buffer, Session.KeyRecv, Session.RecvSeq);
        Session.RecvSeq = package.Seq;

        Log($"[收] Method: {Methods.GetMethodName(package.MethodId)} | Flags: {package.Flags} " +
            $"| Data length: {package.Length} | Request ID: {ToHex(package.RequestId)}");

        switch (package.MethodId)
        {
            case Methods.HandShake_Response:
            {
                var response = ProtoMethods.HandShake_Response.Parser.ParseFrom(package.Data);

                var verified = SecureKey.ClientCheckSignedMessage(
                    response.MessageToBeVerify.ToByteArray(),
                    response.ServerPublicKey.ToByteArray(),
                    keyPair.PublicKey,
                    ServerPublicKey);

                if (!verified)
                {
                    Log("[Client] Server verification failed, closing connection");
                    _manualDisconnect = true;
                    SetConnectionState(ClientConnectionState.Disconnected);
                    OnHandshakeFailed("server_public_key_mismatch");
                    await CloseQuietlyAsync(client).ConfigureAwait(false);
                    return;
                }

                Log("[Client] Server verified!");

                if (!ReferenceEquals(_client, client) || _manualDisconnect) return;

                lock (_seqLock)
                {
                    Session.SendSeq = 0;
                    Session.RecvSeq = -1;
                }

                var sharedSecret = SecureKey.GetSharedSecret(
                    response.ServerPublicKey.ToByteArray(),
                    keyPair.PrivateKey);

                var (keyRecv, keySend) = SecureKey.ClientHkdf(
                    sharedSecret,
                    response.Salt.ToByteArray());

                CryptographicOperations.ZeroMemory(sharedSecret);

                lock (_seqLock)
                {
                    Session.KeyRecv = keyRecv;
                    Session.KeySend = keySend;
                }

                StartPing();
                SetConnectionState(ClientConnectionState.Connected);
                OnInit();
                break;
            }
            case Methods.Ping_Response:
            {
                var usage = ProtoMethods.Ping_Response.Parser.ParseFrom(package.Data).Usage;
                if (_lastPingSentAt != 0)
                {
                    LastPingRtt = NowMs() - _lastPingSentAt;
                }

                Log($"[Client] RTT: {(LastPingRtt?.ToString() ?? "?")} ms | server time: {usage}ms");
                break;
            }
        }

        ResolvePending(ToHex(package.RequestId), package);

        Action<Package>[] listeners;
        lock (_listenersLock) listeners = _receiveListeners.ToArray();

        foreach (var listener in listeners)
        {
            try
            {
                listener(package);
            }
            catch (Exception ex)
            {
                Log($"[Client] on_receive_listener error: {ex}");
            }
        }
    }

    private void ResolvePending(string requestId, Package package)
    {
        if (_pendingRequests.TryRemove(requestId, out var pending))
        {
            pending.Dispose();
            pending.Completion.TrySetResult(package);
        }
    }

    private void RejectAllPending(string reason)
    {
        foreach (var key in _pendingRequests.Keys)
        {
            if (!_pendingRequests.TryRemove(key, out var pending)) continue;

            pending.Dispose();
            pending.Completion.TrySetException(new InvalidOperationException(reason));
        }
    }

    /// <summary>应用层心跳：定期发送 Ping_Request。</summary>
    public void StartPing()
    {
        StopPing();

        var cts = new CancellationTokenSource();
        lock (_stateLock) _pingCts = cts;

        _ = PingLoopAsync(cts);
    }

    public void StopPing()
    {
        CancellationTokenSource? cts;
        lock (_stateLock)
        {
            cts = _pingCts;
            _pingCts = null;
        }

        if (cts == null) return;

        try { cts.Cancel(); } catch { /* ignore */ }
        cts.Dispose();
    }

    private async Task PingLoopAsync(CancellationTokenSource cts)
    {
        var cancellationToken = cts.Token;

        try
        {
            while (!cancellationToken.IsCancellationRequested)
            {
                await Task.Delay(PingInterval, cancellationToken).ConfigureAwait(false);

                var client = _client;
                var keySend = Session.KeySend;
                if (client == null || keySend == null || client.State != WebSocketState.Open) continue;

                try
                {
                    _lastPingSentAt = NowMs();
                    var payload = new ProtoMethods.Ping_Request { Time = (ulong)_lastPingSentAt }.ToByteArray();

                    var package = Package.Encode(Methods.Ping_Request, payload);
                    package.Encrypt(NextSendSeq(), keySend);

                    await SendRawAsync(client, package.ToBuffer(), cancellationToken).ConfigureAwait(false);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    Log($"[Client] ping failed: {ex.Message}");
                }
            }
        }
        catch (OperationCanceledException)
        {
        }
        finally
        {
            lock (_stateLock)
            {
                if (ReferenceEquals(_pingCts, cts)) _pingCts = null;
            }
        }
    }

    /// <summary>手动强制重连：丢弃旧 socket 后重新握手。</summary>
    public void Reconnect()
    {
        ClientWebSocket? oldClient;
        CancellationTokenSource? oldCts;

        lock (_stateLock)
        {
            oldClient = _client;
            oldCts = _connectionCts;
            _client = null;
            _connectionCts = null;
        }

        _manualDisconnect = false;
        Interlocked.Increment(ref _connectionGeneration);
        StopPing();
        LastPingRtt = null;
        RejectAllPending("Reconnecting");

        oldCts?.Cancel();
        if (oldClient != null)
        {
            try { oldClient.Abort(); } catch { /* ignore */ }
            try { oldClient.Dispose(); } catch { /* ignore */ }
        }

        Init();
    }

    public void Disconnect()
    {
        _manualDisconnect = true;
        Interlocked.Increment(ref _connectionGeneration);
        SetConnectionState(ClientConnectionState.Disconnected);
        StopPing();
        LastPingRtt = null;
        RejectAllPending("Client disconnected");

        ClientWebSocket? client;
        CancellationTokenSource? cts;

        lock (_stateLock)
        {
            client = _client;
            cts = _connectionCts;
            _client = null;
            _connectionCts = null;
        }

        cts?.Cancel();

        if (client != null)
        {
            try { client.Abort(); } catch { /* ignore */ }
            try { client.Dispose(); } catch { /* ignore */ }
        }
    }

    public ValueTask DisposeAsync()
    {
        Disconnect();
        return ValueTask.CompletedTask;
    }

    private async Task SendRawAsync(ClientWebSocket client, byte[] payload, CancellationToken cancellationToken)
    {
        await _sendLock.WaitAsync(cancellationToken).ConfigureAwait(false);
        try
        {
            await client.SendAsync(payload, WebSocketMessageType.Binary, true, cancellationToken)
                .ConfigureAwait(false);
        }
        finally
        {
            _sendLock.Release();
        }
    }

    private static async Task CloseQuietlyAsync(ClientWebSocket client)
    {
        try
        {
            if (client.State == WebSocketState.Open || client.State == WebSocketState.CloseReceived)
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(2));
                await client.CloseAsync(WebSocketCloseStatus.PolicyViolation, "handshake failed", cts.Token)
                    .ConfigureAwait(false);
            }
        }
        catch
        {
            // ignore
        }
    }

    private long NextSendSeq()
    {
        lock (_seqLock) return Session.SendSeq++;
    }

    private void SetConnectionState(ClientConnectionState state)
    {
        Action[] listeners;

        lock (_stateLock)
        {
            if (_connectionState == state) return;

            if (state == ClientConnectionState.Reconnecting) ReconnectCount++;
            _connectionState = state;

            lock (_listenersLock) listeners = _connectionListeners.ToArray();
        }

        foreach (var listener in listeners)
        {
            try
            {
                listener();
            }
            catch (Exception ex)
            {
                Log($"[Client] connection listener failed: {ex}");
            }
        }
    }

    private static long NowMs() => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

    private static string ToHex(byte[] bytes) => Convert.ToHexString(bytes).ToLowerInvariant();

    private void Log(string message) => Logger?.Invoke(message);
}
