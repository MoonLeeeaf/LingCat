package io.github.moonleeeaf.lingcat.data;


import java.net.URI;

/**
 * 服务器 URL 归一化。
 *
 * 规则：
 *  - 必须 "http://" 或 "https://" 开头（让用户写完整）
 *  - scheme 和 host 强制小写
 *  - 去掉尾部 "/"（保留 pathname）
 *  - query / fragment 一律丢弃
 */
public final class ServerUrl {

    private ServerUrl() {}

    /** @return 归一化后的 URL，非法返回 null */
    public static String normalize(String input) {
        if (input == null) return null;
        String s = input.trim();
        if (s.isEmpty()) return null;

        String lower = s.toLowerCase();
        if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
            return null;
        }

        try {
            URI uri = new URI(s);
            String scheme = uri.getScheme();
            String host = uri.getHost();
            if (scheme == null || host == null) return null;

            scheme = scheme.toLowerCase();
            host = host.toLowerCase();

            int port = uri.getPort();
            String path = uri.getPath();
            if (path == null) path = "";

            // 去掉尾部所有 '/'，但保留中间
            while (path.endsWith("/")) {
                path = path.substring(0, path.length() - 1);
            }

            StringBuilder sb = new StringBuilder();
            sb.append(scheme).append("://").append(host);
            if (port > 0) sb.append(':').append(port);
            sb.append(path);

            return sb.toString();
        } catch (Exception e) {
            return null;
        }
    }
}