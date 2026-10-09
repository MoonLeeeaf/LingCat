package io.github.moonleeeaf.lingcat.app;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * 记录"我发送过的消息 seq"，用于判断收到的消息是否回复了我。
 *
 * 按 chat 分组，每 chat 最多保留 N 条；LRU 淘汰。
 * App 重启后丢失，但覆盖近期 99% 场景。
 */
public final class MyMessageSeqs {

    private static final int MAX_PER_CHAT = 500;

    /** chatId -> { seq, seq, ... }（LinkedHashMap 作 LRU） */
    private static final Map<String, Set<Integer>> DATA = new ConcurrentHashMap<>();

    private MyMessageSeqs() {}

    public static void add(String chatId, int seq) {
        if (chatId == null || seq <= 0) return;
        Set<Integer> set = DATA.computeIfAbsent(chatId, k ->
                java.util.Collections.newSetFromMap(
                        new LinkedHashMap<Integer, Boolean>(16, 0.75f, true) {
                            @Override
                            protected boolean removeEldestEntry(Map.Entry<Integer, Boolean> e) {
                                return size() > MAX_PER_CHAT;
                            }
                        }));
        set.add(seq);
    }

    public static boolean contains(String chatId, int seq) {
        if (chatId == null) return false;
        Set<Integer> set = DATA.get(chatId);
        return set != null && set.contains(seq);
    }

    /** 登出 / 切账号时调用 */
    public static void clear() {
        DATA.clear();
    }
}