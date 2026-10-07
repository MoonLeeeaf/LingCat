package io.github.moonleeeaf.lingcat.net;

/**
 * 服务器文件 URL 拼接。
 */
public final class FileUrlBuilder {

    private FileUrlBuilder() {}

    /** 结果: https://example.com/uploaded_files/{hash} */
    public static String fileUrl(String serverHttp, String hash) {
        if (serverHttp == null || hash == null) return null;
        String base = serverHttp.endsWith("/") ? serverHttp : serverHttp + "/";
        return base + "uploaded_files/" + hash;
    }
}