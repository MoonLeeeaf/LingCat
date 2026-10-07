package io.github.moonleeeaf.lingcat.chat;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.google.android.material.bottomsheet.BottomSheetDialog;

import java.util.List;

import io.github.moonleeeaf.lingcat.R;

/** 通用长按动作面板 */
public class ActionSheet {

    public static class Action {
        public final int iconRes;
        public final CharSequence title;
        public final Runnable onClick;

        public Action(int iconRes, @NonNull CharSequence title, @NonNull Runnable onClick) {
            this.iconRes = iconRes;
            this.title = title;
            this.onClick = onClick;
        }
    }

    public static void show(Context ctx, @Nullable CharSequence title, List<Action> actions) {
        if (actions == null || actions.isEmpty()) return;

        BottomSheetDialog dialog = new BottomSheetDialog(ctx);
        LinearLayout container = new LinearLayout(ctx);
        container.setOrientation(LinearLayout.VERTICAL);
        container.setBackgroundColor(
                com.google.android.material.color.MaterialColors.getColor(
                        container, com.google.android.material.R.attr.colorSurface));

        if (title != null && title.length() > 0) {
            TextView header = new TextView(ctx);
            header.setText(title);
            header.setTextSize(13);
            header.setAlpha(0.6f);
            int pad = (int) (16 * ctx.getResources().getDisplayMetrics().density);
            header.setPadding(pad * 2, pad, pad * 2, pad / 2);
            container.addView(header);
        }

        LayoutInflater inf = LayoutInflater.from(ctx);
        for (Action a : actions) {
            View item = inf.inflate(R.layout.item_action_sheet, container, false);
            ImageView icon = item.findViewById(R.id.action_icon);
            TextView text = item.findViewById(R.id.action_title);

            if (a.iconRes != 0) {
                icon.setImageResource(a.iconRes);
                icon.setVisibility(View.VISIBLE);
            } else {
                icon.setVisibility(View.GONE);
            }
            text.setText(a.title);

            item.setOnClickListener(v -> {
                dialog.dismiss();
                a.onClick.run();
            });
            container.addView(item);
        }

        // 底部留白（导航栏遮挡）
        View spacer = new View(ctx);
        spacer.setLayoutParams(new LinearLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                (int) (12 * ctx.getResources().getDisplayMetrics().density)));
        container.addView(spacer);

        dialog.setContentView(container);
        dialog.show();
    }
}