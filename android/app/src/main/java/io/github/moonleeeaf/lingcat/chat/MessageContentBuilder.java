package io.github.moonleeeaf.lingcat.chat;

import android.content.Context;
import android.text.SpannableStringBuilder;
import android.text.method.LinkMovementMethod;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.data.ProfileCache;
import lingcat.classes.Classes.IMessage;
import lingcat.classes.Classes.IMessageEntity;
import lingcat.classes.Classes.IUser;

/**
 * 把 text + entities 渲染进一个 LinearLayout 容器。
 * reply / attachment 是 block 级，独立卡片；其余是 inline，包成 TextView。
 */
public final class MessageContentBuilder {

    /** 单个 TextView 最大宽度（dp） */
    private static final int MAX_TEXT_DP = 260;

    public interface Listener {
        void onMentionUser(String userId);
        void onMentionChat(String chatId);
        void onReplyClick(int seq);
        @Nullable IMessage findMessage(int seq);

        // 附件相关
        void onAttachmentImageClick(String url, String name);
        void onAttachmentFileClick(String url, String name);
    }

    private MessageContentBuilder() {}

    // ============================================================
    //                      入口
    // ============================================================

    public static void build(LinearLayout container, IMessage msg, @Nullable Listener listener) {
        container.removeAllViews();
        if (msg == null) return;

        String text = msg.getText();
        if (text == null) text = "";
        List<IMessageEntity> entities = msg.getEntitiesList();
        Context ctx = container.getContext();
        float density = ctx.getResources().getDisplayMetrics().density;
        int blockPadH = Math.round(6 * density);
        int blockPadV = Math.round(4 * density);

        // 无 entity → 单段
        if (entities == null || entities.isEmpty()) {
            container.addView(makeInlineText(ctx, text, null, listener, container));
            return;
        }

        // 1. 排序
        List<IMessageEntity> sorted = new ArrayList<>(entities);
        sorted.sort(Comparator.comparingInt(IMessageEntity::getOffset));

        // 2. 切段
        List<Segment> segments = new ArrayList<>();
        int cursor = 0;
        int len = text.length();
        for (IMessageEntity e : sorted) {
            int start = e.getOffset();
            int end = start + e.getLength();
            if (start < 0 || end > len || start >= end) continue;
            if (start < cursor) continue;
            if (start > cursor) {
                segments.add(new Segment(text.substring(cursor, start), null));
            }
            segments.add(new Segment(text.substring(start, end), e));
            cursor = end;
        }
        if (cursor < len) segments.add(new Segment(text.substring(cursor), null));

        // 3. 分组
        List<List<Segment>> groups = new ArrayList<>();
        List<Segment> inlineBuf = new ArrayList<>();
        for (Segment s : segments) {
            if (s.entity != null && isBlock(s.entity.getType())) {
                if (!inlineBuf.isEmpty()) {
                    groups.add(new ArrayList<>(inlineBuf));
                    inlineBuf.clear();
                }
                groups.add(Collections.singletonList(s));
            } else {
                inlineBuf.add(s);
            }
        }
        if (!inlineBuf.isEmpty()) groups.add(inlineBuf);

        // 4. 渲染
        for (List<Segment> group : groups) {
            boolean block = group.size() == 1
                    && group.get(0).entity != null
                    && isBlock(group.get(0).entity.getType());

            if (block) {
                Segment s = group.get(0);
                String type = s.entity.getType();
                if ("reply".equals(type)) {
                    container.addView(makeReplyBlock(ctx, s.entity, listener,
                            blockPadH, blockPadV, container));
                } else if ("attachment".equals(type)) {
                    container.addView(makeAttachmentBlock(ctx, s.entity, listener,
                            blockPadH, blockPadV, container));
                } else {
                    container.addView(makeInlineText(ctx, s.text,
                            Collections.singletonList(s.entity), listener, container));
                }
            } else {
                container.addView(makeInlineGroup(ctx, group, listener, container));
            }
        }
    }

    // ============================================================
    //                      reply block
    // ============================================================

    private static View makeReplyBlock(Context ctx, IMessageEntity entity,
                                       @Nullable Listener listener,
                                       int padH, int padV, View container) {
        int seq = parseSeq(entity.hasData() ? entity.getData() : null);
        View card = makeReplyView(ctx, seq, listener);

        LinearLayout wrap = new LinearLayout(ctx);
        wrap.setOrientation(LinearLayout.VERTICAL);
        wrap.setPadding(padH, padV, padH, padV);
        wrap.addView(card);

        wrap.setOnLongClickListener(v -> { container.performLongClick(); return true; });
        card.setOnLongClickListener(v -> { container.performLongClick(); return true; });

        return wrap;
    }

    // ============================================================
    //                      attachment block
    // ============================================================

    private static View makeAttachmentBlock(Context ctx, IMessageEntity entity,
                                            @Nullable Listener listener,
                                            int padH, int padV, View container) {
        LinearLayout wrap = new LinearLayout(ctx);
        wrap.setOrientation(LinearLayout.VERTICAL);
        wrap.setPadding(padH, padV, padH, padV);

        String hash = null, name = null;
        String data = entity.hasData() ? entity.getData() : null;
        if (data != null) {
            try {
                JSONObject obj = new JSONObject(data);
                hash = obj.optString("hash", null);
                name = obj.optString("name", null);
            } catch (Exception ignored) {}
        }

        if (hash != null && !hash.isEmpty()) {
            View attach = AttachmentViewBuilder.build(ctx, hash, name, attachmentListener(listener));
            wrap.addView(attach);
        } else {
            TextView tv = new TextView(ctx);
            tv.setText("[无效附件]");
            tv.setTextSize(13);
            tv.setAlpha(0.6f);
            wrap.addView(tv);
        }

        wrap.setOnLongClickListener(v -> { container.performLongClick(); return true; });

        return wrap;
    }

    // ============================================================
    //                      inline
    // ============================================================

    private static TextView makeInlineText(Context ctx, String text,
                                           @Nullable List<IMessageEntity> entities,
                                           @Nullable Listener listener,
                                           View container) {
        TextView tv = new TextView(ctx);
        tv.setTextSize(15);
        tv.setTextColor(themeColor(ctx, com.google.android.material.R.attr.colorOnSurfaceVariant));
        tv.setLineSpacing(0, 1.15f);
        tv.setMaxWidth(dp(ctx, MAX_TEXT_DP));
        int pad = Math.round(12 * ctx.getResources().getDisplayMetrics().density);
        tv.setPadding(pad, pad, pad, pad);
        RichTextRenderer.render(tv, text, entities, mentionAdapter(listener));
        forwardLongClick(tv, container);
        return tv;
    }

    private static TextView makeInlineGroup(Context ctx, List<Segment> group,
                                            @Nullable Listener listener,
                                            View container) {
        SpannableStringBuilder ssb = new SpannableStringBuilder();
        int offset = 0;
        for (Segment s : group) {
            int start = offset;
            int end = offset + s.text.length();
            ssb.append(s.text);
            if (s.entity != null) {
                RichTextRenderer.applyEntityToSpan(ctx, ssb, start, end, s.entity,
                        mentionAdapter(listener));
            }
            offset = end;
        }

        TextView tv = new TextView(ctx);
        tv.setTextSize(15);
        tv.setTextColor(themeColor(ctx, com.google.android.material.R.attr.colorOnSurfaceVariant));
        tv.setLineSpacing(0, 1.15f);
        tv.setMaxWidth(dp(ctx, MAX_TEXT_DP));
        int pad = Math.round(12 * ctx.getResources().getDisplayMetrics().density);
        tv.setPadding(pad, pad, pad, pad);
        tv.setText(ssb);
        tv.setMovementMethod(LinkMovementMethod.getInstance());
        tv.setHighlightColor(0);
        forwardLongClick(tv, container);
        return tv;
    }

    /**
     * 把子 View 的长按转发到 container。
     * 因为 LinkMovementMethod 会把 TextView 设为 longClickable，
     * 内部消费了长按事件，外层 LinearLayout 收不到。
     */
    private static void forwardLongClick(View child, View container) {
        child.setOnLongClickListener(v -> {
            container.performLongClick();
            return true;
        });
    }

    @Nullable
    private static RichTextRenderer.MentionListener mentionAdapter(@Nullable Listener l) {
        if (l == null) return null;
        return new RichTextRenderer.MentionListener() {
            @Override public void onUserMention(String userId) { l.onMentionUser(userId); }
            @Override public void onChatMention(String chatId) { l.onMentionChat(chatId); }
        };
    }

    @Nullable
    private static AttachmentViewBuilder.Listener attachmentListener(@Nullable Listener l) {
        if (l == null) return null;
        return new AttachmentViewBuilder.Listener() {
            @Override public void onImageClick(String url, String name) {
                l.onAttachmentImageClick(url, name);
            }
            @Override public void onFileClick(String url, String name) {
                l.onAttachmentFileClick(url, name);
            }
        };
    }

    // ============================================================
    //                      reply view
    // ============================================================

    private static View makeReplyView(Context ctx, int seq, @Nullable Listener listener) {
        View v = LayoutInflater.from(ctx).inflate(R.layout.view_quote_reply, null, false);
        TextView senderTv = v.findViewById(R.id.reply_sender);
        TextView previewTv = v.findViewById(R.id.reply_preview);

        senderTv.setMaxWidth(dp(ctx, MAX_TEXT_DP - 20));
        previewTv.setMaxWidth(dp(ctx, MAX_TEXT_DP - 20));

        IMessage target = (listener != null) ? listener.findMessage(seq) : null;

        if (target != null) {
            senderTv.setText(senderNameOf(target));
            previewTv.setText(previewOf(target));
        } else {
            senderTv.setText("消息 #" + seq);
            previewTv.setText("点击跳转到这条消息");
        }

        v.setOnClickListener(view -> {
            if (listener != null) listener.onReplyClick(seq);
        });
        return v;
    }

    private static String senderNameOf(IMessage m) {
        if (m.getSystem()) return "系统消息";
        String sid = m.getSenderUserId();
        if (sid == null || sid.isEmpty()) return "…";
        IUser u = ProfileCache.getCachedUser(sid);
        if (u != null && u.getNickname() != null && !u.getNickname().isEmpty()) {
            return u.getNickname();
        }
        return sid.length() > 8 ? sid.substring(0, 8) : sid;
    }

    private static String previewOf(IMessage m) {
        String t = m.getText();
        if (t == null) return "[空消息]";
        t = t.replaceAll("\\s+", " ").trim();
        if (t.isEmpty()) return "[空消息]";
        if (t.length() > 80) t = t.substring(0, 80) + "...";
        return t;
    }

    // ============================================================
    //                      util
    // ============================================================

    private static boolean isBlock(@Nullable String type) {
        return "reply".equals(type) || "attachment".equals(type);
    }

    private static int parseSeq(@Nullable String data) {
        if (data == null) return -1;
        try { return Integer.parseInt(data.trim()); } catch (Exception e) { return -1; }
    }

    private static int themeColor(Context ctx, int attr) {
        try {
            return com.google.android.material.color.MaterialColors.getColor(ctx, attr, 0xFF000000);
        } catch (Exception e) {
            return 0xFF000000;
        }
    }

    private static int dp(Context ctx, int dp) {
        return Math.round(dp * ctx.getResources().getDisplayMetrics().density);
    }

    private static class Segment {
        final String text;
        final IMessageEntity entity;
        Segment(String text, IMessageEntity entity) {
            this.text = text;
            this.entity = entity;
        }
    }
}