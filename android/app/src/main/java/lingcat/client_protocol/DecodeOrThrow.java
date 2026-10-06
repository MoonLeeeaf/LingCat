package lingcat.client_protocol;

import com.google.protobuf.InvalidProtocolBufferException;
import com.google.protobuf.Parser;

import lingcat.protocol.Methods;

/**
 * 与 decodeOrThrow 对齐：
 * 先尝试按 Error_Response 解码；若 requestMethod != 0 且 message 非空，抛 ApiException；
 * 否则按目标类型解码返回。
 */
public final class DecodeOrThrow {

    /** 服务器返回的错误响应封装 */
    public static class ApiException extends RuntimeException {
        /** 触发错误的方法 ID（uint32） */
        public final int requestMethod;
        public final int code;

        public ApiException(int requestMethod, String message, int code) {
            super(message);
            this.requestMethod = requestMethod;
            this.code = code;
        }

        /** 便于日志阅读：把 method id 映射成可读名字 */
        public String requestMethodName() {
            try {
                return Methods.getMethodName(requestMethod);
            } catch (Throwable t) {
                return "unknown(" + requestMethod + ")";
            }
        }

        @Override
        public String toString() {
            return "ApiException{requestMethod=" + requestMethodName()
                    + ", code=" + code + ", message='" + getMessage() + "'}";
        }
    }

    private DecodeOrThrow() {}

    public static <T> T decode(Parser<T> parser, byte[] data) {
        // 1) 先按错误响应试解
        try {
            lingcat.methods.Methods.Error_Response err =
                    lingcat.methods.Methods.Error_Response.parseFrom(data);

            // requestMethod 是 uint32，0 表示"未设置"；message 空串表示"未设置"
            // 对应 `err.requestMethod && err.message`
            if (err.getRequestMethod() != 0 && !err.getMessage().isEmpty()) {
                int code = err.getCode() != 0 ? err.getCode() : -2;  // TS: err.code || -2
                throw new ApiException(err.getRequestMethod(), err.getMessage(), code);
            }
        } catch (InvalidProtocolBufferException ignored) {
            // 不是 Error_Response，继续按目标类型解
        }

        // 2) 按目标类型解码
        try {
            return parser.parseFrom(data);
        } catch (InvalidProtocolBufferException e) {
            throw new ApiException(0, "Failed to decode response: " + e.getMessage(), -1);
        }
    }
}