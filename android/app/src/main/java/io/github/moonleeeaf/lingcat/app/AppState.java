package io.github.moonleeeaf.lingcat.app;

/**
 * 全局运行时状态。非持久化。
 */
public final class AppState {

    private AppState() {}

    /** 当前活跃的 chatId（ChatActivity onResume 设置，onPause 清空） */
    public static volatile String activeChatId;

    /** App 是否在前台 */
    public static volatile boolean foreground = false;
}