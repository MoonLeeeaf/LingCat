package io.github.moonleeeaf.lingcat.chat;

import android.content.Context;
import android.view.ViewGroup;

import androidx.annotation.NonNull;

import com.github.chrisbanes.photoview.PhotoView;

import coil.Coil;
import coil.request.ImageRequest;

import moon3.app.MaterialDialog;

/**
 * 继承 MaterialDialog 的图片查看器。
 * - 复用 Material 3 圆角 / 内边距 / 背景
 * - PhotoView 支持双指缩放、双击放大、拖拽平移
 * - 单击图片 / 点击外部 / 返回键 → 关闭
 */
public class ImageViewerDialog extends MaterialDialog {

    private static final float MAX_SCALE = 8f;
    private static final float MID_SCALE = 3f;
    private static final float MIN_W_DP = 160f;

    public ImageViewerDialog(@NonNull Context context, String url) {
        super(context);

        float density = context.getResources().getDisplayMetrics().density;
        int maxW = (int) (context.getResources().getDisplayMetrics().widthPixels * 0.86f);
        int maxH = (int) (context.getResources().getDisplayMetrics().heightPixels * 0.72f);
        int minSide = (int) (MIN_W_DP * density);

        PhotoView pv = new PhotoView(context);
        pv.setAdjustViewBounds(true);
        pv.setMaxWidth(maxW);
        pv.setMaxHeight(maxH);
        pv.setMinimumWidth(minSide);
        pv.setMinimumHeight(minSide);
        pv.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
        pv.setMaximumScale(MAX_SCALE);
        pv.setMediumScale(MID_SCALE);

        // 单击图片关闭
        pv.setOnClickListener(v -> dismiss());

        ImageRequest req = new ImageRequest.Builder(context)
                .data(url)
                .crossfade(true)
                .allowHardware(false)     // PhotoView 变换需要软件 bitmap
                .target(pv)
                .build();
        Coil.imageLoader(context).enqueue(req);

        // 复用 MaterialDialog 的 setView —— 自动处理 padding / 圆角背景
        setView(pv);
    }

    public static void show(Context ctx, String url) {
        if (ctx == null || url == null || url.isEmpty()) return;
        new ImageViewerDialog(ctx, url).show();
    }
}