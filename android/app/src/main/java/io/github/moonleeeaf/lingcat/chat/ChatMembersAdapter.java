package io.github.moonleeeaf.lingcat.chat;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.recyclerview.widget.RecyclerView;

import com.google.android.material.imageview.ShapeableImageView;

import java.util.ArrayList;
import java.util.List;

import coil.Coil;
import coil.request.ImageRequest;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.data.ProfileCache;
import io.github.moonleeeaf.lingcat.data.ServerConfig;
import io.github.moonleeeaf.lingcat.net.FileUrlBuilder;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import lingcat.classes.Classes.IChatAdmin;
import lingcat.classes.Classes.IUser;

public class ChatMembersAdapter extends RecyclerView.Adapter<ChatMembersAdapter.VH> {

    public interface ClickListener {
        void onMemberClick(IUser user);
    }
    public interface LongClickListener {
        void onMemberLongClick(IUser user, @Nullable IChatAdmin admin);
    }

    public static class Row {
        public static final int TYPE_HEADER = 0;
        public static final int TYPE_MEMBER = 1;

        public final int type;
        @Nullable public final String headerText;
        @Nullable public final IUser user;
        @Nullable public final IChatAdmin admin;

        private Row(int type, @Nullable String headerText,
                    @Nullable IUser user, @Nullable IChatAdmin admin) {
            this.type = type;
            this.headerText = headerText;
            this.user = user;
            this.admin = admin;
        }

        public static Row header(String text) {
            return new Row(TYPE_HEADER, text, null, null);
        }

        public static Row member(IUser user, @Nullable IChatAdmin admin) {
            return new Row(TYPE_MEMBER, null, user, admin);
        }
    }

    private final Context ctx;
    private final List<Row> rows = new ArrayList<>();
    private final ClickListener clickListener;
    private final LongClickListener longClickListener;

    public ChatMembersAdapter(Context ctx,
                              ClickListener clickListener,
                              LongClickListener longClickListener) {
        this.ctx = ctx;
        this.clickListener = clickListener;
        this.longClickListener = longClickListener;
    }

    public void submit(List<Row> newRows) {
        rows.clear();
        rows.addAll(newRows);
        notifyDataSetChanged();
    }

    @Override
    public int getItemViewType(int position) {
        return rows.get(position).type;
    }

    @NonNull
    @Override
    public VH onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        LayoutInflater inf = LayoutInflater.from(ctx);
        if (viewType == Row.TYPE_HEADER) {
            return new VH(inf.inflate(R.layout.item_group_header, parent, false), viewType);
        }
        return new VH(inf.inflate(R.layout.item_member, parent, false), viewType);
    }

    @Override
    public void onBindViewHolder(@NonNull VH holder, int position) {
        Row row = rows.get(position);
        if (row.type == Row.TYPE_HEADER) {
            holder.header.setText(row.headerText);
            return;
        }

        IUser user = row.user;
        IChatAdmin admin = row.admin;
        if (user == null) return;

        // 昵称优先从 ProfileCache 拿（更新更及时），fallback 到 user.nickname
        IUser cached = ProfileCache.getCachedUser(user.getId());
        String nickname = (cached != null && cached.getNickname() != null && !cached.getNickname().isEmpty())
                ? cached.getNickname()
                : user.getNickname();
        if (nickname == null || nickname.isEmpty()) {
            nickname = user.getId();
        }
        holder.nickname.setText(nickname);

        // 副标题：管理员/所有者 + 权限
        if (admin != null) {
            String role = "owner".equals(admin.getRole()) ? "所有者" : "管理员";
            String perms = PermissionNames.describe(admin.getPermissions());
            String sub = perms.isEmpty() ? role : (role + " · " + perms);
            holder.subtitle.setText(sub);
            holder.subtitle.setVisibility(View.VISIBLE);
        } else {
            holder.subtitle.setVisibility(View.GONE);
        }

        // 头像
        String hash = (cached != null && cached.getAvatarFileHash() != null)
                ? cached.getAvatarFileHash()
                : user.getAvatarFileHash();
        loadAvatar(holder.avatar, hash);

        // 点击
        holder.itemView.setOnClickListener(v -> {
            if (clickListener != null) clickListener.onMemberClick(user);
        });
        holder.itemView.setOnLongClickListener(v -> {
            if (longClickListener != null) {
                longClickListener.onMemberLongClick(user, admin);
                return true;
            }
            return false;
        });
    }

    @Override
    public int getItemCount() {
        return rows.size();
    }

    private void loadAvatar(ShapeableImageView iv, @Nullable String hash) {
        ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
        Object src;
        if (hash == null || hash.isEmpty() || s == null) {
            src = R.drawable.ic_default_avatar;
        } else {
            String url = FileUrlBuilder.fileUrl(s.getHttpUrl(), hash);
            src = (url != null) ? url : R.drawable.ic_default_avatar;
        }

        ImageRequest req = new ImageRequest.Builder(iv.getContext())
                .data(src)
                .crossfade(false)
                .placeholder(R.drawable.ic_default_avatar)
                .error(R.drawable.ic_default_avatar)
                .target(iv)
                .build();
        Coil.imageLoader(iv.getContext()).enqueue(req);
    }

    static class VH extends RecyclerView.ViewHolder {
        @Nullable TextView header;
        @Nullable ShapeableImageView avatar;
        @Nullable TextView nickname;
        @Nullable TextView subtitle;

        VH(@NonNull View v, int viewType) {
            super(v);
            if (viewType == Row.TYPE_HEADER) {
                header = (TextView) v;
            } else {
                avatar   = v.findViewById(R.id.member_avatar);
                nickname = v.findViewById(R.id.member_nickname);
                subtitle = v.findViewById(R.id.member_subtitle);
            }
        }
    }
}