package io.github.moonleeeaf.lingcat.main;

import java.util.concurrent.CopyOnWriteArrayList;

/**
 * OAuth 绑定成功的全局事件。
 * OAuthCallbackActivity 收到 oauth_bound 时 fire()；
 * EditMyProfileActivity 监听以刷新绑定列表。
 */
public final class OAuthBoundEvent {

    private static final CopyOnWriteArrayList<Runnable> listeners = new CopyOnWriteArrayList<>();

    private OAuthBoundEvent() {}

    public static void add(Runnable r) {
        if (r != null && !listeners.contains(r)) listeners.add(r);
    }

    public static void remove(Runnable r) {
        listeners.remove(r);
    }

    public static void fire() {
        for (Runnable r : listeners) {
            try { r.run(); } catch (Exception ignored) {}
        }
    }
}