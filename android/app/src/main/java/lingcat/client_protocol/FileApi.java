package lingcat.client_protocol;

import androidx.annotation.NonNull;

import com.google.protobuf.Parser;

import lingcat.methods.Methods.Request_File_Access_Request;
import lingcat.methods.Methods.Request_File_Access_Response;
import lingcat.methods.Methods.Request_File_Upload_Request;
import lingcat.methods.Methods.Request_File_Upload_Response;
import lingcat.protocol.Methods;
import lingcat.protocol.Package;

import okhttp3.MediaType;
import okhttp3.MultipartBody;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okhttp3.ResponseBody;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public final class FileApi {

    public static final long DEFAULT_TIMEOUT_MS = 30_000L;

    /** 上传失败时抛出，携带 HTTP 状态码和响应体 */
    public static class FileUploadException extends RuntimeException {
        public final int status;
        public final String body;

        public FileUploadException(String message, int status, String body) {
            super(message);
            this.status = status;
            this.body = body;
        }

        @Override
        public String toString() {
            return "FileUploadException{status=" + status
                    + ", body='" + body + "', message='" + getMessage() + "'}";
        }
    }

    private FileApi() {}

    // ============================================================
    //                      工具
    // ============================================================

    private static Package await(LingCatClient client, int methodId,
                                 byte[] data, long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        long effective = timeoutMs > 0 ? timeoutMs : DEFAULT_TIMEOUT_MS;
        return client.invoke(methodId, data, 0, effective)
                .get(effective, TimeUnit.MILLISECONDS);
    }

    private static <T> T decode(Parser<T> parser, byte[] data) {
        return DecodeOrThrow.decode(parser, data);
    }

    /** 拼接 upload_file 的完整 URL —— 与 TS 端 'server_http + (endsWith('/') ? '' : '/') + upload_file' 对齐 */
    private static String buildUploadUrl(String serverHttp) {
        return serverHttp.endsWith("/")
                ? serverHttp + "upload_file"
                : serverHttp + "/upload_file";
    }

    // ============================================================
    //                  新增：断点续传数据类 & 工具
    // ============================================================

    public static class UploadSessionInfo {
        public final String uploadId;
        public final int offset;
        public final int chunkSize;
        public final String uploadToken;

        public UploadSessionInfo(String uploadId, int offset, int chunkSize, String uploadToken) {
            this.uploadId = uploadId;
            this.offset = offset;
            this.chunkSize = chunkSize;
            this.uploadToken = uploadToken;
        }
    }

    public static class UploadStatusInfo {
        public final long offset;
        public final long totalSize;
        public final long expiresAt;

        public UploadStatusInfo(long offset, long totalSize, long expiresAt) {
            this.offset = offset;
            this.totalSize = totalSize;
            this.expiresAt = expiresAt;
        }
    }

    /**
     * 用于 PATCH 请求的自定义 RequestBody，只从 InputStream 读取指定长度的数据
     */
    private static class ChunkRequestBody extends RequestBody {
        private final java.io.InputStream inputStream;
        private final long chunkLength;
        private final ProgressRequestBody.ProgressCallback callback;
        private final long alreadyUploadedOffset;
        private final long totalFileSize;

        public ChunkRequestBody(java.io.InputStream inputStream, long chunkLength,
                                long alreadyUploadedOffset, long totalFileSize,
                                ProgressRequestBody.ProgressCallback callback) {
            this.inputStream = inputStream;
            this.chunkLength = chunkLength;
            this.alreadyUploadedOffset = alreadyUploadedOffset;
            this.totalFileSize = totalFileSize;
            this.callback = callback;
        }

        @Override
        public okhttp3.MediaType contentType() {
            return okhttp3.MediaType.parse("application/offset+octet-stream");
        }

        @Override
        public long contentLength() {
            return chunkLength;
        }

        @Override
        public void writeTo(@NonNull okio.BufferedSink sink) throws IOException {
            byte[] buffer = new byte[8192];
            long remaining = chunkLength;
            long writtenThisChunk = 0;

            while (remaining > 0) {
                int read = inputStream.read(buffer, 0, (int) Math.min(buffer.length, remaining));
                if (read == -1) break; // 流结束

                sink.write(buffer, 0, read);
                remaining -= read;
                writtenThisChunk += read;

                if (callback != null && totalFileSize > 0) {
                    // 计算全局百分比：已上传的 + 当前分块已传的
                    int percent = (int) (((alreadyUploadedOffset + writtenThisChunk) * 100) / totalFileSize);
                    if (percent > 100) percent = 100;
                    callback.onProgress(percent);
                }
            }
        }
    }

    // ============================================================
    //                      令牌
    // ============================================================

    /**
     * 请求上传文件 token
     * @return file_upload_token
     */
    public static String requestUploadFileToken(LingCatClient client,
                                                String accessToken,
                                                long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Request_File_Upload_Request req = Request_File_Upload_Request.newBuilder()
                .setAccessToken(accessToken)
                .build();

        byte[] data = await(client, Methods.Request_File_Upload_Request,
                req.toByteArray(), timeoutMs).data;

        return decode(Request_File_Upload_Response.parser(), data).getToken();
    }

    public static String requestUploadFileToken(LingCatClient client, String accessToken)
            throws InterruptedException, ExecutionException, TimeoutException {
        return requestUploadFileToken(client, accessToken, DEFAULT_TIMEOUT_MS);
    }

    /**
     * 请求访问已上传文件的 token
     * @param fileHash 可为 null
     * @return file_access_token
     */
    public static String requestAccessUploadFileToken(LingCatClient client,
                                                      String accessToken,
                                                      String fileHash,
                                                      long timeoutMs)
            throws InterruptedException, ExecutionException, TimeoutException {
        Request_File_Access_Request.Builder b = Request_File_Access_Request.newBuilder()
                .setAccessToken(accessToken);
        if (fileHash != null) b.setFileHash(fileHash);

        byte[] data = await(client, Methods.Request_File_Access_Request,
                b.build().toByteArray(), timeoutMs).data;

        return decode(Request_File_Access_Response.parser(), data).getToken();
    }

    public static String requestAccessUploadFileToken(LingCatClient client,
                                                      String accessToken,
                                                      String fileHash)
            throws InterruptedException, ExecutionException, TimeoutException {
        return requestAccessUploadFileToken(client, accessToken, fileHash, DEFAULT_TIMEOUT_MS);
    }

    // ============================================================
    //                      上传
    // ============================================================

    /**
     * 上传文件（multipart/form-data）
     *
     * @param fileUploadToken  requestUploadFileToken 拿到的 token
     * @param belongToChatId   可为 null
     * @param fileData         文件字节
     * @param mime             可为 null，默认 application/octet-stream
     * @param fileName         可为 null，默认 "File"
     * @return 服务端返回的 file_hash
     */
    public static String uploadFile(LingCatClient client,
                                    String fileUploadToken,
                                    String belongToChatId,
                                    byte[] fileData,
                                    String mime,
                                    String fileName)
            throws IOException {

        String effectiveMime = (mime != null && !mime.isEmpty())
                ? mime
                : "application/octet-stream";
        String effectiveName = (fileName != null && !fileName.isEmpty())
                ? fileName
                : "File";

        // 文件 part
        RequestBody fileBody = RequestBody.create(
                fileData,
                MediaType.parse(effectiveMime)
        );

        MultipartBody.Builder form = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("file", effectiveName, fileBody);

        // 字段顺序与 TS 端 FormData.append 一致
        if (belongToChatId != null && !belongToChatId.isEmpty()) {
            form.addFormDataPart("belong_to_chat_id", belongToChatId);
        }
        if (mime != null && !mime.isEmpty()) {
            form.addFormDataPart("mime", mime);
        }
        if (fileName != null && !fileName.isEmpty()) {
            form.addFormDataPart("file_name", fileName);
        }

        Request request = new Request.Builder()
                .url(buildUploadUrl(client.getServerHttp()))
                .header("Token", fileUploadToken)
                .post(form.build())
                .build();

        OkHttpClient http = client.getOkHttpClient();

        try (Response response = http.newCall(request).execute()) {
            ResponseBody body = response.body();
            String text = body != null ? body.string() : "";

            // 尝试解析 JSON：成功 → 拿 file_hash；失败 → 抛出带原文的异常
            JSONObject json = null;
            try {
                json = new JSONObject(text);
            } catch (Exception e) {
                // JSON 解析失败，等价 TS 里 catch JSON.parse 的分支
                throw new FileUploadException(text, response.code(), text);
            }

            if (!response.isSuccessful()) {
                // 等价 TS 里 if (!re.ok) throw { message: text, code: re.status }
                throw new FileUploadException(text, response.code(), text);
            }

            return json.optString("file_hash", "");
        }
    }

    /**
     * 从 File 上传的便捷重载。
     *
     * 注意：不读进内存，直接用 OkHttp 的 File RequestBody 流式上传，
     * 避免大文件 OOM
     */
    public static String uploadFile(LingCatClient client,
                                    String fileUploadToken,
                                    String belongToChatId,
                                    File file,
                                    String mime,
                                    String fileName)
            throws IOException {

        String effectiveMime = (mime != null && !mime.isEmpty())
                ? mime
                : "application/octet-stream";
        String effectiveName = (fileName != null && !fileName.isEmpty())
                ? fileName
                : file.getName();

        // OkHttp 的 FileBody：懒读取 + 流式写 socket，不会把整个文件读进内存
        RequestBody fileBody = RequestBody.create(
                file,
                MediaType.parse(effectiveMime)
        );

        MultipartBody.Builder form = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("file", effectiveName, fileBody);

        if (belongToChatId != null && !belongToChatId.isEmpty()) {
            form.addFormDataPart("belong_to_chat_id", belongToChatId);
        }
        if (mime != null && !mime.isEmpty()) {
            form.addFormDataPart("mime", mime);
        }
        if (fileName != null && !fileName.isEmpty()) {
            form.addFormDataPart("file_name", fileName);
        }

        Request request = new Request.Builder()
                .url(buildUploadUrl(client.getServerHttp()))
                .header("Token", fileUploadToken)
                .post(form.build())
                .build();

        OkHttpClient http = client.getOkHttpClient();

        try (Response response = http.newCall(request).execute()) {
            ResponseBody body = response.body();
            String text = body != null ? body.string() : "";

            JSONObject json;
            try {
                json = new JSONObject(text);
            } catch (Exception e) {
                throw new FileUploadException(text, response.code(), text);
            }

            if (!response.isSuccessful()) {
                throw new FileUploadException(text, response.code(), text);
            }

            return json.optString("file_hash", "");
        }
    }

    public static String uploadFile(LingCatClient client,
                                    String fileUploadToken,
                                    String belongToChatId,
                                    byte[] fileData,
                                    String mime,
                                    String fileName,
                                    ProgressRequestBody.ProgressCallback callback)
            throws IOException {

        String effectiveMime = (mime != null && !mime.isEmpty())
                ? mime
                : "application/octet-stream";
        String effectiveName = (fileName != null && !fileName.isEmpty())
                ? fileName
                : "File";

        // 1. 包装原始字节数据
        RequestBody rawFileBody = RequestBody.create(
                fileData,
                MediaType.parse(effectiveMime)
        );
        // ★ 2. 用 ProgressRequestBody 包一层
        ProgressRequestBody progressBody = new ProgressRequestBody(rawFileBody, callback);

        MultipartBody.Builder form = new MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("file", effectiveName, progressBody); // ★ 使用包装后的进度 Body

        if (belongToChatId != null && !belongToChatId.isEmpty()) {
            form.addFormDataPart("belong_to_chat_id", belongToChatId);
        }
        if (mime != null && !mime.isEmpty()) {
            form.addFormDataPart("mime", mime);
        }
        if (fileName != null && !fileName.isEmpty()) {
            form.addFormDataPart("file_name", fileName);
        }

        Request request = new Request.Builder()
                .url(buildUploadUrl(client.getServerHttp()))
                .header("Token", fileUploadToken)
                .post(form.build())
                .build();

        OkHttpClient http = client.getOkHttpClient();

        try (Response response = http.newCall(request).execute()) {
            ResponseBody body = response.body();
            String text = body != null ? body.string() : "";
            JSONObject json;
            try {
                json = new JSONObject(text);
            } catch (Exception e) {
                throw new FileUploadException(text, response.code(), text);
            }
            if (!response.isSuccessful()) {
                throw new FileUploadException(text, response.code(), text);
            }
            return json.optString("file_hash", "");
        }
    }

    /*
    public static String sha256Hex(File file) throws IOException, NoSuchAlgorithmException {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        try (InputStream in = new FileInputStream(file);
             DigestInputStream dis = new DigestInputStream(in, md)) {
            byte[] buf = new byte[8192];
            while (dis.read(buf) > 0) {}
        }
        // md.digest() → hex
        byte[] digest = md.digest();
        StringBuilder sb = new StringBuilder(digest.length * 2);
        for (byte b : digest) sb.append(String.format("%02x", b));
        return sb.toString();
    }
    */

    // ============================================================
    //                  新增：会话管理 API
    // ============================================================

    private static String buildSessionUrl(String serverHttp) {
        String base = serverHttp.endsWith("/") ? serverHttp.substring(0, serverHttp.length() - 1) : serverHttp;
        return base + "/upload_file/session";
    }

    public static UploadSessionInfo createUploadSession(LingCatClient client,
                                                        String fileUploadToken,
                                                        long size,
                                                        String fileName,
                                                        String mime,
                                                        String belongToChatId,
                                                        String expectedHash) throws IOException {
        JSONObject jsonBody = new JSONObject();
        try {
            jsonBody.put("size", size);
            jsonBody.put("file_name", fileName);
            jsonBody.put("mime", mime);
            if (belongToChatId != null) jsonBody.put("belong_to_chat_id", belongToChatId);
            if (expectedHash != null) jsonBody.put("hash", expectedHash);
        } catch (Exception ignored) {}

        RequestBody body = RequestBody.create(
                jsonBody.toString(),
                MediaType.parse("application/json; charset=utf-8")
        );

        Request request = new Request.Builder()
                .url(buildSessionUrl(client.getServerHttp()))
                .header("Token", fileUploadToken)
                .post(body)
                .build();

        try (Response response = client.getOkHttpClient().newCall(request).execute()) {
            String text = response.body() != null ? response.body().string() : "";
            if (!response.isSuccessful()) {
                throw new FileUploadException("Create session failed", response.code(), text);
            }
            JSONObject json = new JSONObject(text);
            return new UploadSessionInfo(
                    json.getString("upload_id"),
                    json.optInt("offset", 0),
                    json.optInt("chunk_size", 8 * 1024 * 1024),
                    json.getString("upload_token")
            );
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    public static UploadStatusInfo getUploadStatus(LingCatClient client, String uploadToken, String uploadId) throws IOException {
        Request request = new Request.Builder()
                .url(buildSessionUrl(client.getServerHttp()) + "/" + uploadId)
                .header("Token", uploadToken)
                .head()
                .build();

        try (Response response = client.getOkHttpClient().newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new FileUploadException("Get status failed", response.code(), "");
            }
            long offset = Long.parseLong(response.header("Upload-Offset", "0"));
            long totalSize = Long.parseLong(response.header("Upload-Length", "0"));
            long expiresAt = Long.parseLong(response.header("Upload-Expires", "0"));
            return new UploadStatusInfo(offset, totalSize, expiresAt);
        }
    }

    public static void abortUpload(LingCatClient client, String uploadToken, String uploadId) throws IOException {
        Request request = new Request.Builder()
                .url(buildSessionUrl(client.getServerHttp()) + "/" + uploadId)
                .header("Token", uploadToken)
                .delete()
                .build();
        client.getOkHttpClient().newCall(request).execute().close();
    }

    public static String completeUpload(LingCatClient client, String uploadToken, String uploadId) throws IOException {
        RequestBody body = RequestBody.create(new byte[0], null); // 空的 JSON
        Request request = new Request.Builder()
                .url(buildSessionUrl(client.getServerHttp()) + "/" + uploadId + "/complete")
                .header("Token", uploadToken)
                .post(body)
                .build();

        try (Response response = client.getOkHttpClient().newCall(request).execute()) {
            String text = response.body() != null ? response.body().string() : "";
            if (!response.isSuccessful()) {
                throw new FileUploadException("Complete upload failed", response.code(), text);
            }
            JSONObject json = new JSONObject(text);
            return json.getString("file_hash");
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }

    // ============================================================
    //                  新增：流式断点续传实现
    // ============================================================

    /**
     * 断点续传上传（基于 InputStream）
     * 注意：调用此方法后，inputStream 会被关闭。
     */
    public static String uploadFileResumable(LingCatClient client,
                                             String fileUploadToken,
                                             String belongToChatId,
                                             java.io.InputStream inputStream,
                                             long totalSize,
                                             String mime,
                                             String fileName,
                                             ProgressRequestBody.ProgressCallback callback)
            throws IOException {

        String effectiveMime = (mime != null && !mime.isEmpty()) ? mime : "application/octet-stream";
        String effectiveName = (fileName != null && !fileName.isEmpty()) ? fileName : "File";

        UploadSessionInfo session = null;
        try {
            session = createUploadSession(client, fileUploadToken, totalSize, effectiveName, effectiveMime, belongToChatId, null);
        } catch (Exception e) {
            try { inputStream.close(); } catch (Exception ignored) {}
            throw new IOException("Failed to create upload session", e);
        }

        long currentOffset = session.offset;

        // 如果服务端已经有部分数据（比如秒传或之前传过），跳过相应字节
        if (currentOffset > 0) {
            long skipped = 0;
            while (skipped < currentOffset) {
                long s = inputStream.skip(currentOffset - skipped);
                if (s <= 0) break;
                skipped += s;
            }
        }

        int maxRetries = 5;
        int retries = 0;

        while (currentOffset < totalSize) {
            long remaining = totalSize - currentOffset;
            long chunkLen = Math.min(remaining, session.chunkSize);

            try {
                // 构造当前分块的流式 Body
                ChunkRequestBody chunkBody = new ChunkRequestBody(inputStream, chunkLen, currentOffset, totalSize, callback);

                String contentRange = "bytes " + currentOffset + "-" + (currentOffset + chunkLen - 1) + "/" + totalSize;

                Request request = new Request.Builder()
                        .url(buildSessionUrl(client.getServerHttp()) + "/" + session.uploadId)
                        .header("Token", session.uploadToken)
                        .header("Content-Range", contentRange)
                        .patch(chunkBody)
                        .build();

                try (Response response = client.getOkHttpClient().newCall(request).execute()) {
                    if (response.isSuccessful()) {
                        currentOffset += chunkLen;
                        retries = 0; // 成功后重置重试次数
                    } else if (response.code() == 409) {
                        // Offset 不匹配，说明服务端和客户端状态不一致
                        String actualOffsetStr = response.header("Upload-Offset");
                        if (actualOffsetStr != null) {
                            long actualOffset = Long.parseLong(actualOffsetStr);
                            if (actualOffset > currentOffset) {
                                // 服务端比客户端多，说明之前其实成功了，需要客户端跳过多余的
                                long toSkip = actualOffset - currentOffset;
                                long skipped = 0;
                                while (skipped < toSkip) {
                                    long s = inputStream.skip(toSkip - skipped);
                                    if (s <= 0) break;
                                    skipped += s;
                                }
                                currentOffset = actualOffset;
                            } else {
                                throw new IOException("Server offset behind client, aborting");
                            }
                        } else {
                            throw new IOException("409 Conflict without Upload-Offset");
                        }
                    } else {
                        throw new FileUploadException("Chunk upload failed", response.code(), response.message());
                    }
                }
            } catch (Exception e) {
                retries++;
                if (retries > maxRetries) {
                    try { inputStream.close(); } catch (Exception ignored) {}
                    throw new IOException("Max retries reached", e);
                }

                // 发生网络异常，等一会去 HEAD 查询真实的 offset
                try { Thread.sleep(1000L * retries); } catch (InterruptedException ignored) {}

                try {
                    UploadStatusInfo status = getUploadStatus(client, session.uploadToken, session.uploadId);
                    long actualOffset = status.offset;

                    if (actualOffset > currentOffset) {
                        // 服务端其实收到了部分（比如刚好断在响应到达前），跳过
                        long toSkip = actualOffset - currentOffset;
                        long skipped = 0;
                        while (skipped < toSkip) {
                            long s = inputStream.skip(toSkip - skipped);
                            if (s <= 0) break;
                            skipped += s;
                        }
                        currentOffset = actualOffset;
                    } else if (actualOffset < currentOffset) {
                        throw new IOException("Server lost data, cannot resume seamlessly.");
                    }
                } catch (Exception ex) {
                    // 获取状态也失败了，如果是 404 可能会话过期
                    if (ex instanceof FileUploadException && ((FileUploadException) ex).status == 404) {
                        try { inputStream.close(); } catch (Exception ignored) {}
                        throw new IOException("Upload session expired", ex);
                    }
                    // 其他网络错误继续重试
                }
            }
        }

        try { inputStream.close(); } catch (Exception ignored) {}

        // 全部传完，调 complete 获取 hash
        return completeUpload(client, session.uploadToken, session.uploadId);
    }

    /**
     * 断点续传的重载版本：基于 Android Uri（极其方便 UI 层调用）
     */
    public static String uploadFileResumable(LingCatClient client,
                                             String fileUploadToken,
                                             String belongToChatId,
                                             android.content.ContentResolver resolver,
                                             android.net.Uri uri,
                                             long totalSize,
                                             String mime,
                                             String fileName,
                                             ProgressRequestBody.ProgressCallback callback)
            throws IOException {
        java.io.InputStream inputStream = resolver.openInputStream(uri);
        if (inputStream == null) throw new IOException("Cannot open InputStream from Uri");

        return uploadFileResumable(client, fileUploadToken, belongToChatId, inputStream, totalSize, mime, fileName, callback);
    }
}