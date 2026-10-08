package io.github.moonleeeaf.lingcat.chat;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.imageview.ShapeableImageView;

import java.util.Calendar;
import java.util.List;
import java.util.Locale;

import coil.Coil;
import coil.request.ImageRequest;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.data.ProfileCache;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.FileUrlBuilder;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.classes.Classes.IMessage;
import lingcat.classes.Classes.IUser;

public class MessageListAdapter extends RecyclerView.Adapter<MessageListAdapter.BaseVH> {

    /** 同人连发间隔上限：5 分钟 */
    private static final long COMPACT_GAP_MS = 5 * 60 * 1000L;

    private static final int TYPE_SYSTEM        = 0;
    private static final int TYPE_LEFT_NORMAL   = 1;
    private static final int TYPE_LEFT_COMPACT  = 2;
    private static final int TYPE_RIGHT_NORMAL  = 3;
    private static final int TYPE_RIGHT_COMPACT = 4;

    private final Context ctx;
    private final List<IMessage> data;
    private final String myUserId;
    private final MessageActionListener actionListener;

    public MessageListAdapter(Context ctx, List<IMessage> data, @Nullable String myUserId,
                              @Nullable MessageActionListener actionListener) {
        this.ctx = ctx;
        this.data = data;
        this.myUserId = myUserId;
        this.actionListener = actionListener;
    }

    // ============================================================
    //                      判定
    // ============================================================

    private boolean shouldHideSender(int position) {
        if (position + 1 >= data.size()) return false;
        IMessage cur  = data.get(position);
        IMessage prev = data.get(position + 1);

        if (cur.getSystem() || prev.getSystem()) return false;

        String s1 = cur.getSenderUserId();
        String s2 = prev.getSenderUserId();
        if (s1 == null || s2 == null || !s1.equals(s2)) return false;

        long t1 = cur.getTime();
        long t2 = prev.getTime();
        if (t1 <= 0 || t2 <= 0) return false;
        return (t1 - t2) < COMPACT_GAP_MS;
    }

    @Override
    public int getItemViewType(int position) {
        IMessage m = data.get(position);
        if (m.getSystem()) return TYPE_SYSTEM;

        boolean isMe = myUserId != null
                && m.getSenderUserId() != null
                && myUserId.equals(m.getSenderUserId());
        boolean compact = shouldHideSender(position);

        if (isMe) return compact ? TYPE_RIGHT_COMPACT : TYPE_RIGHT_NORMAL;
        return compact ? TYPE_LEFT_COMPACT : TYPE_LEFT_NORMAL;
    }

    @NonNull
    @Override
    public BaseVH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater inf = LayoutInflater.from(ctx);
        switch (viewType) {
            case TYPE_RIGHT_NORMAL:
                return new NormalVH(inf.inflate(R.layout.item_message_right, parent, false));
            case TYPE_RIGHT_COMPACT:
                return new CompactVH(inf.inflate(R.layout.item_message_right_compact, parent, false));
            case TYPE_LEFT_NORMAL:
                return new NormalVH(inf.inflate(R.layout.item_message_left, parent, false));
            case TYPE_LEFT_COMPACT:
                return new CompactVH(inf.inflate(R.layout.item_message_left_compact, parent, false));
            case TYPE_SYSTEM:
            default:
                return new SystemVH(inf.inflate(R.layout.item_message_system, parent, false));
        }
    }

    @Override
    public void onBindViewHolder(@NonNull BaseVH holder, int position) {
        holder.bind(data.get(position));
    }

    @Override
    public int getItemCount() {
        return data.size();
    }

    // ============================================================
    //                      ViewHolder
    // ============================================================

    abstract class BaseVH extends RecyclerView.ViewHolder {
        BaseVH(@NonNull View v) {
            super(v);
            // itemView 长按 → 消息菜单。
            // 气泡内容 (msg_content) 和头像有各自的长按监听，
            // 事件先到达最深的子 View，会优先消费；只有落在
            // 空白区 / 时间 / 头像之外的地方才会冒泡到这里。
            v.setOnLongClickListener(view -> {
                int pos = getAdapterPosition();
                if (pos == RecyclerView.NO_POSITION) return false;
                if (actionListener == null) return false;
                actionListener.onMessageLongClick(data.get(pos), view);
                return true;
            });
        }
        abstract void bind(IMessage m);
    }

    /** 系统消息：只有 msg_content + 长按 */
    class SystemVH extends BaseVH {
        final LinearLayout content;
        SystemVH(@NonNull View v) {
            super(v);
            content = v.findViewById(R.id.msg_content);
        }
        @Override
        void bind(IMessage m) {
            MessageContentBuilder.build(content, m, null);
            content.setOnLongClickListener(v -> {
                if (actionListener == null) return false;
                actionListener.onMessageLongClick(m, content);
                return true;
            });
        }
    }

    /** 紧凑消息：msg_content + 时间 + 长按 */
    class CompactVH extends BaseVH {
        final LinearLayout content;
        final TextView time;
        CompactVH(@NonNull View v) {
            super(v);
            content = v.findViewById(R.id.msg_content);
            time    = v.findViewById(R.id.msg_time);
        }
        @Override
        void bind(IMessage m) {
            MessageContentBuilder.build(content, m, actionListener);
            time.setText(formatTime(m.getTime(), m.getEditedAt()));

            content.setOnLongClickListener(v -> {
                if (actionListener == null) return false;
                actionListener.onMessageLongClick(m, content);
                return true;
            });
        }
    }

    /** 普通消息：头像 + 昵称 + msg_content + 时间 */
    class NormalVH extends BaseVH {
        final ShapeableImageView avatar;
        final TextView sender;
        final LinearLayout content;
        final TextView time;

        NormalVH(@NonNull View v) {
            super(v);
            avatar  = v.findViewById(R.id.msg_avatar);
            sender  = v.findViewById(R.id.msg_sender);
            content = v.findViewById(R.id.msg_content);
            time    = v.findViewById(R.id.msg_time);
        }

        @Override
        void bind(IMessage m) {
            String sid = m.getSenderUserId();
            IUser user = (sid != null && !sid.isEmpty())
                    ? ProfileCache.getCachedUser(sid)
                    : null;

            // 昵称
            if (user != null && user.getNickname() != null && !user.getNickname().isEmpty()) {
                sender.setText(user.getNickname());
            } else if (sid != null && !sid.isEmpty()) {
                sender.setText(sid.length() > 8 ? sid.substring(0, 8) : sid);
            } else {
                sender.setText("");
            }

            // 头像
            loadAvatar(user);

            // 正文（富文本 + reply 卡片）
            MessageContentBuilder.build(content, m, actionListener);

            // 时间
            time.setText(formatTime(m.getTime(), m.getEditedAt()));

            // 长按气泡
            content.setOnLongClickListener(v -> {
                if (actionListener == null) return false;
                actionListener.onMessageLongClick(m, content);
                return true;
            });

            avatar.setOnClickListener(v -> {
                String senderId = m.getSenderUserId();
                if (actionListener == null || senderId == null || senderId.isEmpty()) return;
                actionListener.onAvatarClick(senderId, avatar);
            });

            // 长按头像
            avatar.setOnLongClickListener(v -> {
                String senderId = m.getSenderUserId();
                if (actionListener == null || senderId == null || senderId.isEmpty()) return false;
                actionListener.onAvatarLongClick(senderId, avatar);
                return true;
            });
        }

        private void loadAvatar(@Nullable IUser user) {
            ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
            String hash = (user != null) ? user.getAvatarFileHash() : null;

            Object src;
            if (hash == null || hash.isEmpty() || s == null) {
                src = R.drawable.ic_default_avatar;
            } else {
                String url = FileUrlBuilder.fileUrl(s.getHttpUrl(), hash);
                src = (url != null) ? url : R.drawable.ic_default_avatar;
            }

            ImageRequest req = new ImageRequest.Builder(itemView.getContext())
                    .data(src)
                    .crossfade(false)
                    .placeholder(R.drawable.ic_default_avatar)
                    .error(R.drawable.ic_default_avatar)
                    .target(avatar)
                    .build();
            Coil.imageLoader(itemView.getContext()).enqueue(req);
        }
    }

    // ============================================================
    //                      时间格式
    // ============================================================

    private static String formatTime(long timeMs, long editedMs) {
        if (timeMs <= 0) return "";
        StringBuilder sb = new StringBuilder(24);
        sb.append(formatOne(timeMs));
        if (editedMs > 0) {
            sb.append(" (已编辑)");
        }
        return sb.toString();
    }

    private static String formatOne(long ms) {
        Calendar c = Calendar.getInstance();
        c.setTimeInMillis(ms);
        return String.format(Locale.getDefault(),
                "%d.%d.%d %02d:%02d",
                c.get(Calendar.YEAR),
                c.get(Calendar.MONTH) + 1,
                c.get(Calendar.DAY_OF_MONTH),
                c.get(Calendar.HOUR_OF_DAY),
                c.get(Calendar.MINUTE));
    }
}