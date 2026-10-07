package io.github.moonleeeaf.lingcat.chat;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.text.SpannableStringBuilder;
import android.text.Spanned;
import android.text.TextPaint;
import android.text.method.LinkMovementMethod;
import android.text.style.BackgroundColorSpan;
import android.text.style.ClickableSpan;
import android.text.style.ForegroundColorSpan;
import android.text.style.StrikethroughSpan;
import android.text.style.StyleSpan;
import android.text.style.TypefaceSpan;
import android.view.View;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.android.material.color.MaterialColors;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

import lingcat.classes.Classes.IMessage;
import lingcat.classes.Classes.IMessageEntity;

/**
 * 把 text + entities 渲染成 TextView 富文本。
 *
 * 支持：bold / italic / code / strikethrough / spoiler / link / user_mention / chat_mention
 * 暂不处理：reply / attachment（由 text 里的占位符呈现）
 */
public final class RichTextRenderer {

    private RichTextRenderer() {}

    public interface MentionListener {
        void onUserMention(String userId);
        void onChatMention(String chatId);
    }

    // ============================================================
    //                      入口
    // ============================================================

    public static void render(TextView tv, IMessage msg,
                              @Nullable MentionListener listener) {
        render(tv, msg.getText(), msg.getEntitiesList(), listener);
    }

    public static void render(TextView tv, String text,
                              @Nullable List<IMessageEntity> entities,
                              @Nullable MentionListener listener) {
        if (text == null) text = "";

        if (entities == null || entities.isEmpty()) {
            tv.setText(text);
            tv.setMovementMethod(null);
            return;
        }

        SpannableStringBuilder sb = new SpannableStringBuilder(text);

        List<IMessageEntity> sorted = new ArrayList<>(entities);
        sorted.sort(Comparator.comparingInt(IMessageEntity::getOffset));

        final int len = text.length();
        for (IMessageEntity e : sorted) {
            int start = e.getOffset();
            int end = start + e.getLength();
            if (start < 0 || end > len || start >= end) continue;
            applyEntity(tv.getContext(), sb, start, end, e, listener);
        }

        tv.setText(sb);
        tv.setMovementMethod(LinkMovementMethod.getInstance());
        tv.setHighlightColor(Color.TRANSPARENT);
    }

    /** 供 MessageContentBuilder 手动构建 Spannable 时使用 */
    public static void applyEntityToSpan(Context ctx,
                                         SpannableStringBuilder sb,
                                         int start, int end,
                                         IMessageEntity e,
                                         @Nullable MentionListener listener) {
        applyEntity(ctx, sb, start, end, e, listener);
    }

    // ============================================================
    //                      分发
    // ============================================================

    public static void applyEntity(Context ctx,
                                   SpannableStringBuilder sb,
                                   int start, int end,
                                   IMessageEntity e,
                                   @Nullable MentionListener listener) {
        String type = e.getType();
        if (type == null) return;
        switch (type) {
            case "bold":
                sb.setSpan(new StyleSpan(Typeface.BOLD), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                break;

            case "italic":
                sb.setSpan(new StyleSpan(Typeface.ITALIC), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                break;

            case "code":
                sb.setSpan(new TypefaceSpan("monospace"), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                sb.setSpan(new BackgroundColorSpan(0x20808080), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                break;

            case "strikethrough":
                sb.setSpan(new StrikethroughSpan(), start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
                break;

            case "spoiler":
                applySpoiler(sb, start, end);
                break;

            case "link":
                applyLink(ctx, sb, start, end, e.hasData() ? e.getData() : null);
                break;

            case "user_mention":
                applyMention(ctx, sb, start, end, e.hasData() ? e.getData() : null,
                        listener, true);
                break;

            case "chat_mention":
                applyMention(ctx, sb, start, end, e.hasData() ? e.getData() : null,
                        listener, false);
                break;

            // reply / attachment：text 里已是 [回复] / [附件]，保持默认文本
            default:
                break;
        }
    }

    // ============================================================
    //                      Spoiler：点击揭示
    // ============================================================

    private static void applySpoiler(SpannableStringBuilder sb, int start, int end) {
        final int mask = 0xFF808080;

        final BackgroundColorSpan bg = new BackgroundColorSpan(mask);
        final ForegroundColorSpan fg = new ForegroundColorSpan(mask);

        sb.setSpan(bg, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
        sb.setSpan(fg, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);

        ClickableSpan reveal = new ClickableSpan() {
            @Override
            public void onClick(@NonNull View widget) {
                sb.removeSpan(bg);
                sb.removeSpan(fg);
                sb.removeSpan(this);
                // 用 onClick 传来 widget（就是被点的 TextView）触发重绘
                if (widget instanceof TextView) {
                    ((TextView) widget).setText(sb);
                }
            }
            @Override
            public void updateDrawState(@NonNull TextPaint ds) { /* 保持原样 */ }
        };
        sb.setSpan(reveal, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    // ============================================================
    //                      Link
    // ============================================================

    private static void applyLink(Context ctx, SpannableStringBuilder sb,
                                  int start, int end, @Nullable String url) {
        if (url == null || url.isEmpty()) return;

        final int linkColor = themeColor(ctx, com.google.android.material.R.attr.colorPrimary);

        ClickableSpan span = new ClickableSpan() {
            @Override
            public void onClick(@NonNull View widget) {
                try {
                    Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                    widget.getContext().startActivity(i);
                } catch (Exception ignored) {}
            }
            @Override
            public void updateDrawState(@NonNull TextPaint ds) {
                ds.setColor(linkColor);
                ds.setUnderlineText(false);
            }
        };
        sb.setSpan(span, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    // ============================================================
    //                      Mention
    // ============================================================

    private static void applyMention(Context ctx, SpannableStringBuilder sb,
                                     int start, int end,
                                     @Nullable String id,
                                     @Nullable MentionListener listener,
                                     boolean isUser) {
        final int color = themeColor(ctx, com.google.android.material.R.attr.colorPrimary);

        ClickableSpan span = new ClickableSpan() {
            @Override
            public void onClick(@NonNull View widget) {
                if (listener == null || id == null || id.isEmpty()) return;
                if (isUser) listener.onUserMention(id);
                else        listener.onChatMention(id);
            }
            @Override
            public void updateDrawState(@NonNull TextPaint ds) {
                ds.setColor(color);
                ds.setUnderlineText(false);
            }
        };
        sb.setSpan(span, start, end, Spanned.SPAN_EXCLUSIVE_EXCLUSIVE);
    }

    // ============================================================
    //                      工具
    // ============================================================

    private static int themeColor(Context ctx, int attr) {
        try {
            return MaterialColors.getColor(ctx, attr, 0xFF6200EE);
        } catch (Exception e) {
            return 0xFF6200EE;
        }
    }
}