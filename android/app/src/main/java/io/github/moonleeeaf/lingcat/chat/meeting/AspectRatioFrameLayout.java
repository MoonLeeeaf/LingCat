package io.github.moonleeeaf.lingcat.chat.meeting;

import android.content.Context;
import android.util.AttributeSet;
import android.widget.FrameLayout;

/**
 * 固定宽高比的 FrameLayout。
 * 在 onMeasure 里根据宽度算高度，用于会议网格 tile。
 */
public class AspectRatioFrameLayout extends FrameLayout {

    /** 宽 / 高。默认竖屏 3:4 */
    private float aspectRatio = 3f / 4f;

    public AspectRatioFrameLayout(Context c) { super(c); }
    public AspectRatioFrameLayout(Context c, AttributeSet a) { super(c, a); }
    public AspectRatioFrameLayout(Context c, AttributeSet a, int s) { super(c, a, s); }

    /** 设置宽高比 = width / height。16:9 传 16f/9f；3:4 传 3f/4f */
    public void setAspectRatio(float ratio) {
        if (ratio <= 0) return;
        if (this.aspectRatio != ratio) {
            this.aspectRatio = ratio;
            requestLayout();
        }
    }

    @Override
    protected void onMeasure(int widthSpec, int heightSpec) {
        int wMode = MeasureSpec.getMode(widthSpec);
        int w = MeasureSpec.getSize(widthSpec);

        // 宽度未知 → 退回默认测量
        if (wMode != MeasureSpec.EXACTLY && wMode != MeasureSpec.AT_MOST) {
            super.onMeasure(widthSpec, heightSpec);
            return;
        }

        int h = Math.round(w / aspectRatio);
        super.onMeasure(
                MeasureSpec.makeMeasureSpec(w, MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(h, MeasureSpec.EXACTLY));
    }
}