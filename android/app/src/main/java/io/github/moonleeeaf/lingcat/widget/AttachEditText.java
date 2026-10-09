package io.github.moonleeeaf.lingcat.widget;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.net.Uri;
import android.util.AttributeSet;

import androidx.appcompat.widget.AppCompatEditText;

/**
 * EditText 增强：粘贴剪贴板里的 URI（图片/文件）时通知宿主处理。
 * 若无 URI，或宿主不处理，则走默认文本粘贴。
 */
public class AttachEditText extends AppCompatEditText {

    public interface OnPasteUriListener {
        /** 返回 true 表示已消费；false 则回落到默认文本粘贴 */
        boolean onPasteUri(Uri uri);
    }

    private OnPasteUriListener pasteUriListener;

    public AttachEditText(Context c) { super(c); }
    public AttachEditText(Context c, AttributeSet a) { super(c, a); }
    public AttachEditText(Context c, AttributeSet a, int s) { super(c, a, s); }

    public void setOnPasteUriListener(OnPasteUriListener l) {
        this.pasteUriListener = l;
    }

    @Override
    public boolean onTextContextMenuItem(int id) {
        if (id == android.R.id.paste && pasteUriListener != null) {
            try {
                ClipboardManager cm = (ClipboardManager) getContext()
                        .getSystemService(Context.CLIPBOARD_SERVICE);
                if (cm != null && cm.hasPrimaryClip()) {
                    ClipData clip = cm.getPrimaryClip();
                    if (clip != null && clip.getItemCount() > 0) {
                        Uri uri = clip.getItemAt(0).getUri();
                        if (uri != null && pasteUriListener.onPasteUri(uri)) {
                            return true;
                        }
                    }
                }
            } catch (Exception ignored) {}
        }
        return super.onTextContextMenuItem(id);
    }
}