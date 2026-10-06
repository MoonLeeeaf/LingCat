package lingcat.client_protocol;

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
}