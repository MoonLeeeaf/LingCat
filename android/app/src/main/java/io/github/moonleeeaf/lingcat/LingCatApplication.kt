package io.github.moonleeeaf.lingcat

import android.app.Activity
import android.app.Application
import android.os.Bundle
import coil.ImageLoader
import coil.ImageLoaderFactory
import io.github.moonleeeaf.lingcat.app.AppState
import io.github.moonleeeaf.lingcat.app.NotificationHelper
import io.github.moonleeeaf.lingcat.data.DraftCache
import io.github.moonleeeaf.lingcat.data.RemarksCache
import io.github.moonleeeaf.lingcat.data.db.AppDatabase
import io.github.moonleeeaf.lingcat.e2e.E2EStateManager
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import lingcat.client_protocol.HttpClientProvider

class LingCatApplication : Application(), ImageLoaderFactory {
    override fun onCreate() {
        super.onCreate()

        LingCatClientManager.init(this)
        E2EStateManager.init(this)
        RemarksCache.init(this)
        NotificationHelper.createChannels(this)
        AppDatabase.getDatabase(this)
        DraftCache.init(this)

        // ★ 注册 Activity 生命周期回调，监控前后台
        registerActivityLifecycleCallbacks(object : ActivityLifecycleCallbacks {
            private var startedActivities = 0

            override fun onActivityStarted(activity: Activity) {
                startedActivities++
                if (startedActivities > 0) {
                    AppState.isAppForeground = true
                }
            }

            override fun onActivityStopped(activity: Activity) {
                startedActivities--
                if (startedActivities == 0) {
                    AppState.isAppForeground = false
                }
            }

            override fun onActivityCreated(activity: Activity, savedInstanceState: Bundle?) {}
            override fun onActivityResumed(activity: Activity) {}
            override fun onActivityPaused(activity: Activity) {}
            override fun onActivitySaveInstanceState(activity: Activity, outState: Bundle) {}
            override fun onActivityDestroyed(activity: Activity) {}
        })
    }

    override fun newImageLoader(): ImageLoader {
        return ImageLoader.Builder(this)
            .okHttpClient(HttpClientProvider.get()) // ★ 复用信任所有证书的 OkHttpClient
            .crossfade(true)
            .build()
    }
}
