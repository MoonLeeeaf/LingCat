package io.github.moonleeeaf.lingcat;

import android.app.Application;

import coil.Coil;
import coil.ImageLoader;
import io.github.moonleeeaf.lingcat.data.AppDataStore;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;

import lingcat.client_protocol.HttpClientProvider;
import okhttp3.OkHttpClient;
import okhttp3.Request;

public class LingCatApplication extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        AppDataStore.init(this);
        LingCatClientManager.init(this);
        setupCoil();
    }

    /** 给所有 Coil 图片请求自动加 file_access_token header */
    private void setupCoil() {
        OkHttpClient client = HttpClientProvider.get().newBuilder()
                .addInterceptor(chain -> {
                    Request req = chain.request();
                    String token = LingCatClientManager.getInstance().getFileAccessToken();
                    if (token != null && !token.isEmpty()) {
                        req = req.newBuilder()
                                .header("file_access_token", token)
                                .build();
                    }
                    return chain.proceed(req);
                })
                .build();

        ImageLoader loader = new ImageLoader.Builder(this)
                .okHttpClient(client)
                .crossfade(true)
                .build();

        Coil.setImageLoader(loader);
    }
}