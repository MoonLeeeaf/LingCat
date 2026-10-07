package io.github.moonleeeaf.lingcat.util;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;

public final class TimeFormatter {

    private TimeFormatter() {}

    private static final SimpleDateFormat HM = new SimpleDateFormat("HH:mm", Locale.getDefault());
    private static final SimpleDateFormat MD = new SimpleDateFormat("MM-dd", Locale.getDefault());
    private static final SimpleDateFormat YMD = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());

    /** 聊天列表用的时间格式 */
    public static String chatList(long timeMs) {
        if (timeMs <= 0) return "";
        long now = System.currentTimeMillis();

        Calendar nowCal = Calendar.getInstance();
        Calendar tgtCal = Calendar.getInstance();
        tgtCal.setTimeInMillis(timeMs);

        // 同一天
        if (sameDay(nowCal, tgtCal)) {
            return HM.format(new Date(timeMs));
        }

        // 昨天
        Calendar yesterday = Calendar.getInstance();
        yesterday.add(Calendar.DAY_OF_YEAR, -1);
        if (sameDay(yesterday, tgtCal)) {
            return "昨天";
        }

        // 本周内（按周一起算）
        nowCal.setFirstDayOfWeek(Calendar.MONDAY);
        tgtCal.setFirstDayOfWeek(Calendar.MONDAY);
        if (nowCal.get(Calendar.YEAR) == tgtCal.get(Calendar.YEAR)
                && nowCal.get(Calendar.WEEK_OF_YEAR) == tgtCal.get(Calendar.WEEK_OF_YEAR)) {
            String[] weekdays = {"", "周日", "周一", "周二", "周三", "周四", "周五", "周六"};
            return weekdays[tgtCal.get(Calendar.DAY_OF_WEEK)];
        }

        // 同年
        if (nowCal.get(Calendar.YEAR) == tgtCal.get(Calendar.YEAR)) {
            return MD.format(new Date(timeMs));
        }
        return YMD.format(new Date(timeMs));
    }

    private static boolean sameDay(Calendar a, Calendar b) {
        return a.get(Calendar.YEAR) == b.get(Calendar.YEAR)
                && a.get(Calendar.DAY_OF_YEAR) == b.get(Calendar.DAY_OF_YEAR);
    }
}