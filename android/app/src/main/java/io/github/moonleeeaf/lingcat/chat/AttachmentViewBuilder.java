package io.github.moonleeeaf.lingcat.chat;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.Nullable;

import com.google.android.material.card.MaterialCardView;
import com.google.android.material.imageview.ShapeableImageView;

import coil.Coil;
import coil.request.ImageRequest;

import io.github.moonleeeaf.lingcat.R;
import io.github.moonleeeaf.lingcat.net.AttachmentMimeCache;
import io.github.moonleeeaf.lingcat.net.FileUrlBuilder;
import io.github.moonleeeaf.lingcat.net.LingCatClientManager;
import io.github.moonleeeaf.lingcat.data.ServerConfig;

/**
 * 根据 MIME 渲染附件视图。
 * 图片 → 缩略图 + 点击全屏；其他 → 文件卡片 + 点击浏览器打开。
 */
public final class AttachmentViewBuilder {

    public interface Listener {
        void onImageClick(String url, String name);
        void onFileClick(String url, String name);
    }

    private static final int MAX_W_DP = 240;
    private static final int MAX_H_DP = 180;
    private static final int PLACEHOLDER_H_DP = 100;

    private AttachmentViewBuilder() {}

    /** hash + name → View（异步填充） */
    public static View build(Context ctx, String hash, String name,
                             @Nullable Listener listener) {
        FrameLayout holder = new FrameLayout(ctx);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        holder.setLayoutParams(lp);

        ServerConfig s = LingCatClientManager.getInstance().getCurrentServer();
        if (s == null || hash == null || hash.isEmpty()) {
            holder.addView(makeTextPlaceholder(ctx, "附件不可用"));
            return holder;
        }

        String rawUrl = FileUrlBuilder.fileUrl(s.getHttpUrl(), hash);
        if (rawUrl == null) {
            holder.addView(makeTextPlaceholder(ctx, "附件不可用"));
            return holder;
        }

        String displayName = (name != null && !name.isEmpty()) ? name : "附件";

        // 先放占位
        holder.addView(makeGrayPlaceholder(ctx));

        // 拼带 token 的 URL（用于 MIME HEAD 查询 & 外部打开）
        String token = LingCatClientManager.getInstance().getFileAccessToken();
        String queryUrl = (token != null && !token.isEmpty())
                ? rawUrl + "?file_access_token=" + token
                : rawUrl;

        // 异步查 mime
        AttachmentMimeCache.query(queryUrl).whenComplete((mime, err) -> {
            holder.post(() -> {
                holder.removeAllViews();
                if (mime == null) {
                    holder.addView(makeFileCard(ctx, displayName, queryUrl, listener));
                    return;
                }
                // 图片：直接把 queryUrl 传进去，不依赖 header 注入
                if (mime.startsWith("image/")) {
                    holder.addView(makeImage(ctx, queryUrl, displayName, listener));   // ← 从 rawUrl 改成 queryUrl
                } else {
                    holder.addView(makeFileCard(ctx, displayName, queryUrl, listener));
                }
            });
        });

        return holder;
    }

    // ============================================================
    //                      图片
    // ============================================================

    private static View makeImage(Context ctx, String url, String name,
                                  @Nullable Listener listener) {
        ShapeableImageView iv = new ShapeableImageView(ctx);
        int maxW = dp(ctx, MAX_W_DP);
        int maxH = dp(ctx, MAX_H_DP);
        iv.setMaxWidth(maxW);
        iv.setMaxHeight(maxH);
        iv.setAdjustViewBounds(true);
        iv.setScaleType(android.widget.ImageView.ScaleType.CENTER_CROP);
        iv.setMinimumHeight(dp(ctx, PLACEHOLDER_H_DP));
        iv.setMinimumWidth(dp(ctx, 160));

        ImageRequest req = new ImageRequest.Builder(ctx)
                .data(url)
                .crossfade(true)
                .error(R.drawable.ic_attach_file)
                .target(iv)
                .build();
        Coil.imageLoader(ctx).enqueue(req);

        iv.setOnClickListener(v -> {
            if (listener != null) listener.onImageClick(url, name);
        });

        return iv;
    }

    // ============================================================
    //                      文件卡片
    // ============================================================

    private static View makeFileCard(Context ctx, String name, String url,
                                     @Nullable Listener listener) {
        MaterialCardView card = new MaterialCardView(ctx);
        card.setRadius(dp(ctx, 8));
        card.setCardElevation(0);
        card.setStrokeWidth(dp(ctx, 1));
        card.setStrokeColor(themeColor(ctx, com.google.android.material.R.attr.colorOutlineVariant));
        card.setCardBackgroundColor(themeColor(ctx, com.google.android.material.R.attr.colorSurface));
        card.setClickable(true);
        card.setFocusable(true);

        LinearLayout row = new LinearLayout(ctx);
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setGravity(Gravity.CENTER_VERTICAL);
        int padH = dp(ctx, 12);
        int padV = dp(ctx, 10);
        row.setPadding(padH, padV, padH, padV);

        TextView icon = new TextView(ctx);
        icon.setText("📄");
        icon.setTextSize(20);
        LinearLayout.LayoutParams iconLp = new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.WRAP_CONTENT,
                ViewGroup.LayoutParams.WRAP_CONTENT);
        iconLp.setMarginEnd(dp(ctx, 10));
        icon.setLayoutParams(iconLp);
        row.addView(icon);

        TextView nameTv = new TextView(ctx);
        nameTv.setText(name);
        nameTv.setTextSize(14);
        nameTv.setTextColor(themeColor(ctx, com.google.android.material.R.attr.colorOnSurface));
        nameTv.setMaxWidth(dp(ctx, MAX_W_DP - 40));
        nameTv.setMaxLines(2);
        nameTv.setEllipsize(android.text.TextUtils.TruncateAt.END);
        row.addView(nameTv);

        card.addView(row);

        card.setOnClickListener(v -> {
            if (listener != null) listener.onFileClick(url, name);
        });

        return card;
    }

    // ============================================================
    //                      占位
    // ============================================================

    private static View makeGrayPlaceholder(Context ctx) {
        View v = new View(ctx);
        ViewGroup.LayoutParams lp = new ViewGroup.LayoutParams(
                dp(ctx, 160),
                dp(ctx, PLACEHOLDER_H_DP));
        v.setLayoutParams(lp);
        v.setBackgroundColor(0x1A808080);
        return v;
    }

    private static View makeTextPlaceholder(Context ctx, String text) {
        TextView tv = new TextView(ctx);
        tv.setText(text);
        tv.setTextSize(13);
        tv.setAlpha(0.6f);
        return tv;
    }

    // ============================================================
    //                      util
    // ============================================================

    private static int dp(Context ctx, int dp) {
        return Math.round(dp * ctx.getResources().getDisplayMetrics().density);
    }

    private static int themeColor(Context ctx, int attr) {
        try {
            return com.google.android.material.color.MaterialColors.getColor(ctx, attr, 0xFF808080);
        } catch (Exception e) {
            return 0xFF808080;
        }
    }
}