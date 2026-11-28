using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using ProtoMethods = Lingcat.Methods;

namespace LingCat.ClientProtocol.Client;

/// <summary>上传会话信息。</summary>
public sealed record UploadSessionInfo
{
    [JsonPropertyName("upload_id")]
    public required string UploadId { get; init; }

    [JsonPropertyName("offset")]
    public long Offset { get; init; }

    [JsonPropertyName("chunk_size")]
    public long ChunkSize { get; init; }

    [JsonPropertyName("upload_token")]
    public required string UploadToken { get; init; }
}

/// <summary>上传状态信息。</summary>
public sealed record UploadStatusInfo
{
    public long Offset { get; init; }
    public long TotalSize { get; init; }
    public long ExpiresAt { get; init; }
}

/// <summary>分块上传失败（携带 HTTP 状态码）。</summary>
public sealed class UploadChunkException : Exception
{
    public UploadChunkException(HttpStatusCode statusCode, string message, string? responseBody = null)
        : base(message)
    {
        StatusCode = statusCode;
        ResponseBody = responseBody;
    }

    public HttpStatusCode StatusCode { get; }
    public string? ResponseBody { get; }
}

/// <summary>文件上传/获取 API，移植自 client_protocol/FileApi.ts。</summary>
public static class FileApi
{
    private static readonly HttpClient Http = new()
    {
        Timeout = Timeout.InfiniteTimeSpan,
    };

    public sealed record RequestUploadFileTokenOptions(
        string AccessToken,
        int TimeoutMs = 20000);

    /// <summary>请求上传文件令牌。</summary>
    public static async Task<string> RequestUploadFileTokenAsync(
        LingCatClient client,
        RequestUploadFileTokenOptions options)
    {
        var request = new ProtoMethods.Request_File_Upload_Request
        {
            AccessToken = options.AccessToken,
        };

        var response = await client.InvokeAndDecodeAsync(
            Methods.Request_File_Upload_Request,
            request,
            ProtoMethods.Request_File_Upload_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Token;
    }

    public sealed record RequestAccessUploadFileTokenOptions(
        string AccessToken,
        string? FileHash = null,
        int TimeoutMs = 20000);

    /// <summary>请求访问已上传文件的令牌。</summary>
    public static async Task<string> RequestAccessUploadFileTokenAsync(
        LingCatClient client,
        RequestAccessUploadFileTokenOptions options)
    {
        var request = new ProtoMethods.Request_File_Access_Request
        {
            AccessToken = options.AccessToken,
        };

        if (options.FileHash is not null) request.FileHash = options.FileHash;

        var response = await client.InvokeAndDecodeAsync(
            Methods.Request_File_Access_Request,
            request,
            ProtoMethods.Request_File_Access_Response.Parser,
            options.TimeoutMs).ConfigureAwait(false);

        return response.Token;
    }

    public sealed record UploadFileOptions(
        string FileUploadToken,
        byte[] FileData,
        string? BelongToChatId = null,
        string? Mime = null,
        string? FileName = null,
        CancellationToken CancellationToken = default);

    /// <summary>上传文件，返回文件 hash。</summary>
    public static Task<string> UploadFileAsync(LingCatClient client, UploadFileOptions options) =>
        UploadFileCoreAsync(client, options.FileUploadToken, new ByteArrayContent(options.FileData),
            options.Mime, options.FileName, options.BelongToChatId, options.CancellationToken);

    /// <summary>Uploads a file without buffering it in memory. The upload disposes the supplied stream.</summary>
    public static Task<string> UploadFileAsync(LingCatClient client, string uploadToken, Stream fileData,
        string? mime = null, string? fileName = null, CancellationToken cancellationToken = default) =>
        UploadFileCoreAsync(client, uploadToken, new StreamContent(fileData), mime, fileName, null, cancellationToken);

    private static async Task<string> UploadFileCoreAsync(LingCatClient client, string uploadToken, HttpContent fileContent,
        string? mime, string? fileName, string? belongToChatId, CancellationToken cancellationToken)
    {
        using var content = fileContent;
        using var form = new MultipartFormDataContent();

        fileContent.Headers.ContentType = new MediaTypeHeaderValue(string.IsNullOrEmpty(mime) ? "application/octet-stream" : mime);
        form.Add(fileContent, "file", string.IsNullOrEmpty(fileName) ? "File" : fileName);

        if (!string.IsNullOrEmpty(belongToChatId))
        {
            form.Add(new StringContent(belongToChatId), "belong_to_chat_id");
        }

        if (!string.IsNullOrEmpty(mime))
        {
            form.Add(new StringContent(mime), "mime");
        }

        if (!string.IsNullOrEmpty(fileName))
        {
            form.Add(new StringContent(fileName), "file_name");
        }

        using var request = new HttpRequestMessage(HttpMethod.Post, BuildUrl(client, "upload_file"))
        {
            Content = form,
        };
        request.Headers.TryAddWithoutValidation("Token", uploadToken);

        using var response = await Http.SendAsync(request, cancellationToken).ConfigureAwait(false);
        var text = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);

        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(text, null, response.StatusCode);
        }

        try
        {
            using var document = JsonDocument.Parse(text);
            return document.RootElement.GetProperty("file_hash").GetString()
                ?? throw new JsonException("file_hash is null");
        }
        catch (Exception ex) when (ex is JsonException or KeyNotFoundException)
        {
            throw new HttpRequestException(text, ex, response.StatusCode);
        }
    }

    public sealed record CreateUploadSessionOptions(
        long Size,
        string FileName,
        string Mime,
        string? BelongToChatId = null,
        string? Hash = null);

    /// <summary>创建断点续传上传会话。</summary>
    public static async Task<UploadSessionInfo> CreateUploadSessionAsync(
        LingCatClient client,
        string token,
        CreateUploadSessionOptions options,
        CancellationToken cancellationToken = default)
    {
        var body = new Dictionary<string, object?>
        {
            ["size"] = options.Size,
            ["file_name"] = options.FileName,
            ["mime"] = options.Mime,
        };

        if (!string.IsNullOrEmpty(options.BelongToChatId))
        {
            body["belong_to_chat_id"] = options.BelongToChatId;
        }

        if (!string.IsNullOrEmpty(options.Hash)) body["hash"] = options.Hash;

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            BuildUrl(client, "upload_file/session"))
        {
            Content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json"),
        };
        request.Headers.TryAddWithoutValidation("Token", token);

        using var response = await Http.SendAsync(request, cancellationToken).ConfigureAwait(false);
        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"Create session failed: {(int)response.StatusCode}",
                null,
                response.StatusCode);
        }

        var text = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
        return JsonSerializer.Deserialize<UploadSessionInfo>(text)
            ?? throw new HttpRequestException("Create session returned empty response");
    }

    /// <summary>获取上传会话状态。</summary>
    public static async Task<UploadStatusInfo> GetUploadStatusAsync(
        LingCatClient client,
        string token,
        string uploadId,
        CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Head,
            BuildUrl(client, $"upload_file/session/{uploadId}"));
        request.Headers.TryAddWithoutValidation("Token", token);

        using var response = await Http.SendAsync(request, cancellationToken).ConfigureAwait(false);
        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"Get status failed: {(int)response.StatusCode}",
                null,
                response.StatusCode);
        }

        return new UploadStatusInfo
        {
            Offset = GetLongHeader(response, "Upload-Offset"),
            TotalSize = GetLongHeader(response, "Upload-Length"),
            ExpiresAt = GetLongHeader(response, "Upload-Expires"),
        };
    }

    /// <summary>完成上传，返回文件 hash。</summary>
    public static async Task<string> CompleteUploadAsync(
        LingCatClient client,
        string token,
        string uploadId,
        CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            BuildUrl(client, $"upload_file/session/{uploadId}/complete"))
        {
            Content = new StringContent("{}", Encoding.UTF8, "application/json"),
        };
        request.Headers.TryAddWithoutValidation("Token", token);

        using var response = await Http.SendAsync(request, cancellationToken).ConfigureAwait(false);
        if (!response.IsSuccessStatusCode)
        {
            throw new HttpRequestException(
                $"Complete upload failed: {(int)response.StatusCode}",
                null,
                response.StatusCode);
        }

        var text = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
        using var document = JsonDocument.Parse(text);
        return document.RootElement.GetProperty("file_hash").GetString()
            ?? throw new HttpRequestException("Complete upload returned no file_hash");
    }

    /// <summary>取消上传会话。</summary>
    public static async Task AbortUploadAsync(
        LingCatClient client,
        string token,
        string uploadId,
        CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Delete,
            BuildUrl(client, $"upload_file/session/{uploadId}"));
        request.Headers.TryAddWithoutValidation("Token", token);

        using var response = await Http.SendAsync(request, cancellationToken).ConfigureAwait(false);
    }

    /// <summary>断点续传上传，返回文件 hash。</summary>
    public static async Task<string> UploadFileResumableAsync(
        LingCatClient client,
        string fileUploadToken,
        byte[] fileData,
        string fileName,
        string mime,
        string? belongToChatId = null,
        IProgress<double>? progress = null,
        CancellationToken cancellationToken = default)
    {
        var totalSize = (long)fileData.Length;

        var session = await CreateUploadSessionAsync(
            client,
            fileUploadToken,
            new CreateUploadSessionOptions(totalSize, fileName, mime, belongToChatId),
            cancellationToken).ConfigureAwait(false);

        var currentOffset = session.Offset;
        var maxRetries = 5;
        var retries = 0;

        try
        {
            while (currentOffset < totalSize)
            {
                cancellationToken.ThrowIfCancellationRequested();

                var chunkLength = session.ChunkSize > 0
                    ? Math.Min(totalSize - currentOffset, session.ChunkSize)
                    : totalSize - currentOffset;

                var chunk = new byte[chunkLength];
                Array.Copy(fileData, currentOffset, chunk, 0, chunkLength);

                var startOffset = currentOffset;

                try
                {
                    await UploadChunkAsync(
                        client,
                        session.UploadToken,
                        session.UploadId,
                        chunk,
                        startOffset,
                        totalSize,
                        sent =>
                        {
                            if (totalSize <= 0) return;
                            var percent = Math.Floor((startOffset + sent) * 100.0 / totalSize);
                            progress?.Report(percent);
                        },
                        cancellationToken).ConfigureAwait(false);

                    currentOffset += chunkLength;
                    retries = 0;
                }
                catch (UploadChunkException ex) when (ex.StatusCode == HttpStatusCode.Conflict)
                {
                    var status = await GetUploadStatusAsync(
                        client, session.UploadToken, session.UploadId, cancellationToken)
                        .ConfigureAwait(false);
                    currentOffset = status.Offset;
                }
                catch (Exception ex) when (ex is not OperationCanceledException)
                {
                    retries++;
                    if (retries > maxRetries)
                    {
                        throw new InvalidOperationException($"Max retries reached: {ex.Message}", ex);
                    }

                    await Task.Delay(TimeSpan.FromSeconds(retries), cancellationToken).ConfigureAwait(false);

                    try
                    {
                        var status = await GetUploadStatusAsync(
                            client, session.UploadToken, session.UploadId, cancellationToken)
                            .ConfigureAwait(false);
                        currentOffset = status.Offset;
                    }
                    catch
                    {
                        // 查询状态失败时继续循环重试。
                    }
                }
            }
        }
        catch (OperationCanceledException)
        {
            await AbortUploadAsync(client, session.UploadToken, session.UploadId, CancellationToken.None)
                .ConfigureAwait(false);
            throw;
        }

        progress?.Report(100);

        return await CompleteUploadAsync(
            client, session.UploadToken, session.UploadId, cancellationToken).ConfigureAwait(false);
    }

    private static async Task UploadChunkAsync(
        LingCatClient client,
        string token,
        string uploadId,
        byte[] chunk,
        long startOffset,
        long totalSize,
        Action<long>? onProgress,
        CancellationToken cancellationToken)
    {
        using var content = new ProgressByteArrayContent(chunk, onProgress);
        content.Headers.ContentType = new MediaTypeHeaderValue("application/offset+octet-stream");

        using var request = new HttpRequestMessage(
            HttpMethod.Patch,
            BuildUrl(client, $"upload_file/session/{uploadId}"))
        {
            Content = content,
        };
        request.Headers.TryAddWithoutValidation("Token", token);
        request.Content.Headers.TryAddWithoutValidation(
            "Content-Range",
            $"bytes {startOffset}-{startOffset + chunk.Length - 1}/{totalSize}");

        using var response = await Http.SendAsync(request, cancellationToken).ConfigureAwait(false);
        if (response.IsSuccessStatusCode) return;

        var responseBody = await response.Content.ReadAsStringAsync(cancellationToken).ConfigureAwait(false);
        throw new UploadChunkException(
            response.StatusCode,
            $"Chunk upload failed: {(int)response.StatusCode}",
            responseBody);
    }

    private static string BuildUrl(LingCatClient client, string path)
    {
        return client.ServerHttp.TrimEnd('/') + "/" + path;
    }

    private static long GetLongHeader(HttpResponseMessage response, string name)
    {
        IEnumerable<string>? values = null;

        if (!response.Headers.TryGetValues(name, out values) &&
            !response.Content.Headers.TryGetValues(name, out values))
        {
            return 0;
        }

        var text = values.FirstOrDefault();
        return long.TryParse(text, out var value) ? value : 0;
    }

    /// <summary>边写入请求流边报告进度的 <see cref="HttpContent"/>。</summary>
    private sealed class ProgressByteArrayContent(byte[] data, Action<long>? onProgress) : HttpContent
    {
        private const int BufferSize = 81920;

        protected override async Task SerializeToStreamAsync(
            Stream stream,
            TransportContext? context,
            CancellationToken cancellationToken)
        {
            long sent = 0;

            while (sent < data.Length)
            {
                var count = (int)Math.Min(BufferSize, data.Length - sent);
                await stream.WriteAsync(data.AsMemory((int)sent, count), cancellationToken)
                    .ConfigureAwait(false);
                sent += count;
                onProgress?.Invoke(sent);
            }
        }

        protected override Task SerializeToStreamAsync(Stream stream, TransportContext? context)
        {
            return SerializeToStreamAsync(stream, context, CancellationToken.None);
        }

        protected override bool TryComputeLength(out long length)
        {
            length = data.Length;
            return true;
        }
    }
}
