package io.github.moonleeeaf.lingcat.chat;

import java.util.LinkedHashMap;
import java.util.Map;

/** 管理员权限 key → 中文 */
public final class PermissionNames {

    private PermissionNames() {}

    /** 顺序即显示顺序 */
    public static final Map<String, String> ALL = new LinkedHashMap<>();
    static {
        ALL.put("edit_info",      "编辑资料");
        ALL.put("edit_settings",  "修改设置");
        ALL.put("approve",        "审批加群");
        ALL.put("kick",           "移除成员");
        ALL.put("delete_message", "删除消息");
        ALL.put("mute",           "禁言");
        ALL.put("pin",            "置顶消息");
    }

    public static String cn(String key) {
        String s = ALL.get(key);
        return s != null ? s : key;
    }

    /** permissions JSON → 中文列表，如 "编辑资料, 禁言" */
    public static String describe(String permissionsJson) {
        if (permissionsJson == null || permissionsJson.isEmpty()) return "";
        try {
            org.json.JSONObject obj = new org.json.JSONObject(permissionsJson);
            StringBuilder sb = new StringBuilder();
            for (String key : ALL.keySet()) {
                if (obj.optBoolean(key, false)) {
                    if (sb.length() > 0) sb.append("、");
                    sb.append(ALL.get(key));
                }
            }
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }
}