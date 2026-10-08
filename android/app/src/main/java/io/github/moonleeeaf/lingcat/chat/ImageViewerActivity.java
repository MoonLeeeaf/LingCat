package io.github.moonleeeaf.lingcat.chat;

import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;

import com.github.chrisbanes.photoview.PhotoView;

import coil.Coil;
import coil.request.ImageRequest;

/**
 * 全屏图片查看器。
 * - 黑底 + 隐藏系统栏（沉浸式）
 * - PhotoView：双指缩放 / 双击放大 / 拖拽平移
 * - 单击图片 / 返回键 → 关闭
 */
public class ImageViewerActivity extends AppCompatActivity {

    public static final String EXTRA_URL = "url";

    private static final float MAX_SCALE = 8f;
    private static final float MID_SCALE = 3f;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 沉浸式：内容扩展到系统栏区域，并隐藏系统栏
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        getWindow().setStatusBarColor(Color.TRANSPARENT);
        getWindow().setNavigationBarColor(Color.TRANSPARENT);

        WindowInsetsControllerCompat controller =
                WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        controller.hide(WindowInsetsCompat.Type.systemBars());
        controller.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);

        String url = getIntent().getStringExtra(EXTRA_URL);
        if (url == null || url.isEmpty()) {
            finish();
            return;
        }

        // 根容器：黑底
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.BLACK);
        root.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));

        // PhotoView
        PhotoView pv = new PhotoView(this);
        pv.setLayoutParams(new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT));
        pv.setScaleType(android.widget.ImageView.ScaleType.FIT_CENTER);
        pv.setMaximumScale(MAX_SCALE);
        pv.setMediumScale(MID_SCALE);

        // 单击关闭
        pv.setOnClickListener(v -> finish());
        root.setOnClickListener(v -> finish());

        root.addView(pv);
        setContentView(root);

        // 加载图片
        ImageRequest req = new ImageRequest.Builder(this)
                .data(url)
                .crossfade(true)
                .allowHardware(false)     // PhotoView 变换需软件 bitmap
                .target(pv)
                .build();
        Coil.imageLoader(this).enqueue(req);
    }

    // ============================================================
    //                      静态入口
    // ============================================================

    public static void show(Context ctx, String url) {
        if (ctx == null || url == null || url.isEmpty()) return;
        Intent i = new Intent(ctx, ImageViewerActivity.class);
        i.putExtra(EXTRA_URL, url);
        ctx.startActivity(i);
    }
}