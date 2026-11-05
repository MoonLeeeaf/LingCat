package lingcat.client_protocol;

import androidx.annotation.NonNull;

import java.io.IOException;

import okhttp3.MediaType;
import okhttp3.RequestBody;
import okio.BufferedSink;

public class ProgressRequestBody extends RequestBody {

    public interface ProgressCallback {
        void onProgress(int percent);
    }

    private final RequestBody originalBody;
    private final ProgressCallback callback;
    private final long contentLength;

    public ProgressRequestBody(RequestBody originalBody, ProgressCallback callback) {
        this.originalBody = originalBody;
        this.callback = callback;
        long len = -1;
        try {
            len = originalBody.contentLength();
        } catch (IOException ignored) {}
        this.contentLength = len;
    }

    @Override
    public MediaType contentType() {
        return originalBody.contentType();
    }

    @Override
    public long contentLength() throws IOException {
        return originalBody.contentLength();
    }

    @Override
    public void writeTo(@NonNull BufferedSink sink) throws IOException {
        // 如果无法获取总大小，则退化为原样写入（无进度）
        if (contentLength <= 0) {
            originalBody.writeTo(sink);
            return;
        }

        // 使用一个包装的 Sink 监听写入的字节数
        okio.ForwardingSink forwardingSink = new okio.ForwardingSink(sink) {
            long totalBytesWritten = 0;
            int lastPercent = -1;

            @Override
            public void write(@NonNull okio.Buffer source, long byteCount) throws IOException {
                super.write(source, byteCount);
                totalBytesWritten += byteCount;
                int percent = (int) ((totalBytesWritten * 100) / contentLength);
                if (percent > 100) percent = 100;
                if (percent != lastPercent) {
                    lastPercent = percent;
                    if (callback != null) {
                        callback.onProgress(percent);
                    }
                }
            }
        };

        okio.BufferedSink bufferedSink = okio.Okio.buffer(forwardingSink);
        originalBody.writeTo(bufferedSink);
        bufferedSink.flush();
    }
}