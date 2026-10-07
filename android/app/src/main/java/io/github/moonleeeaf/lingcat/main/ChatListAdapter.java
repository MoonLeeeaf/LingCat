package io.github.moonleeeaf.lingcat.main;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.DiffUtil;
import androidx.recyclerview.widget.ListAdapter;
import androidx.recyclerview.widget.RecyclerView;

import coil.Coil;
import coil.request.ImageRequest;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.FileUrlBuilder;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import io.github.moonleeeaf.lingcat.util.TimeFormatter;
import lingcat.classes.Classes.IChat;

public class ChatListAdapter extends ListAdapter<IChat, ChatListAdapter.VH> {

    public interface OnChatClickListener {
        void onChatClick(IChat chat);
    }

    private final OnChatClickListener listener;

    public ChatListAdapter(OnChatClickListener listener) {
        super(DIFF);
        this.listener = listener;
    }

    private static final DiffUtil.ItemCallback<IChat> DIFF =
            new DiffUtil.ItemCallback<IChat>() {
                @Override
                public boolean areItemsTheSame(@NonNull IChat a, @NonNull IChat b) {
                    return a.getId().equals(b.getId());
                }

                @Override
                public boolean areContentsTheSame(@NonNull IChat a, @NonNull IChat b) {
                    return a.getLastMessageId() == b.getLastMessageId()
                            && a.getLastMessageTime() == b.getLastMessageTime()
                            && eq(a.getTitle(), b.getTitle())
                            && eq(a.getLastMessageText(), b.getLastMessageText())
                            && eq(a.getAvatarFileHash(), b.getAvatarFileHash());
                }

                private boolean eq(String x, String y) {
                    return x == null ? y == null : x.equals(y);
                }
            };

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_chat, parent, false);
        return new VH(v);
    }

    @Override
    public void onBindViewHolder(@NonNull VH holder, int position) {
        holder.bind(getItem(position));
    }

    class VH extends RecyclerView.ViewHolder {
        final ImageView avatar;
        final TextView title;
        final TextView time;
        final TextView lastMessage;

        VH(@NonNull View itemView) {
            super(itemView);
            avatar = itemView.findViewById(R.id.chat_avatar);
            title = itemView.findViewById(R.id.chat_title);
            time = itemView.findViewById(R.id.chat_time);
            lastMessage = itemView.findViewById(R.id.chat_last_message);
            itemView.setOnClickListener(v -> {
                int pos = getAdapterPosition();
                if (pos == RecyclerView.NO_POSITION) return;
                listener.onChatClick(getItem(pos));
            });
        }

        void bind(IChat chat) {
            // 标题
            String t = chat.getTitle();
            if (t == null || t.isEmpty()) {
                if (chat.getChatUnique() != null && !chat.getChatUnique().isEmpty()) {
                    t = chat.getChatUnique();
                } else if ("private".equals(chat.getType())) {
                    t = "(私聊)";
                } else {
                    t = "(未命名)";
                }
            }
            title.setText(t);

            // 时间
            time.setText(TimeFormatter.chatList(chat.getLastMessageTime()));

            // 预览
            String preview = chat.getLastMessageText();
            lastMessage.setText(preview != null ? preview : "");

            // 头像
            loadAvatar(chat.getAvatarFileHash());
        }

        private void loadAvatar(String hash) {
            Context ctx = itemView.getContext();
            ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();

            if (hash == null || hash.isEmpty() || s == null) {
                avatar.setImageResource(R.drawable.ic_default_avatar);
                return;
            }

            String url = FileUrlBuilder.fileUrl(s.getHttpUrl(), hash);
            if (url == null) {
                avatar.setImageResource(R.drawable.ic_default_avatar);
                return;
            }

            String token = LingCatClientManager.getInstance().getFileAccessToken();
            android.util.Log.d("ChatListAdapter",
                    "loadAvatar url=" + url + " token=" + (token == null ? "null" : "len=" + token.length()));

            ImageRequest req = new ImageRequest.Builder(ctx)
                    .data(url)
                    .crossfade(true)
                    .placeholder(R.drawable.ic_default_avatar)
                    .error(R.drawable.ic_default_avatar)
                    .target(avatar)
                    .build();
            Coil.imageLoader(ctx).enqueue(req);
        }
    }
}