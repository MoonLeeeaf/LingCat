package moon3.widget;

import android.content.Context;
import android.content.res.ColorStateList;
import android.graphics.Typeface;
import android.graphics.drawable.Drawable;
import android.os.Handler;
import android.os.Looper;
import android.text.Editable;
import android.text.InputFilter;
import android.text.TextUtils;
import android.text.TextWatcher;
import android.util.AttributeSet;
import android.view.Gravity;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.google.android.material.textfield.TextInputEditText;
import com.google.android.material.textfield.TextInputLayout;

public class MaterialEditText extends TextInputLayout {

    private TextInputEditText et;

    public MaterialEditText(Context c) {
        super(c);
        moon3InitEditText();
    }

    public MaterialEditText(Context c, AttributeSet attrs) {
        super(c, attrs);
        moon3InitEditText();
    }

    public MaterialEditText(Context c, AttributeSet attrs, int def) {
        super(c, attrs, def);
        moon3InitEditText();
    }

    protected void moon3InitEditText() {
        et = new TextInputEditText(getContext());
        addView(et, ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
    }

    public TextInputEditText getInnerEditText() {
        return et;
    }

    private void post2(Runnable r) {
        new Handler(Looper.getMainLooper()).postDelayed(r, 10);
    }

    /* ==================== 文本 ==================== */

    public Editable getText() {
        return et.getText();
    }

    public void setText(CharSequence text) {
        post2(() -> et.setText(text));
    }

    public void setText(int resid) {
        post2(() -> et.setText(resid));
    }

    public void setText(CharSequence text, TextView.BufferType type) {
        post2(() -> et.setText(text, type));
    }

    public void append(CharSequence text) {
        post2(() -> et.append(text));
    }

    public void setTextSize(float size) {
        post2(() -> et.setTextSize(size));
    }

    public void setTextSize(int unit, float size) {
        post2(() -> et.setTextSize(unit, size));
    }

    public float getTextSize() {
        return et.getTextSize();
    }

    /* ==================== 颜色 ==================== */

    public void setTextColor(int c) {
        post2(() -> et.setTextColor(c));
    }

    public void setTextColor(ColorStateList colors) {
        post2(() -> et.setTextColor(colors));
    }

    public ColorStateList getTextColor() {
        return et.getTextColors();
    }

    public void setHintTextColor(int c) {
        post2(() -> et.setHintTextColor(c));
    }

    public void setHintTextColor(ColorStateList colors) {
        post2(() -> et.setHintTextColor(colors));
    }

    public ColorStateList getHintTextColor() {
        return et.getHintTextColors();
    }

    /* ==================== 字体 / 排版 ==================== */

    public void setTypeface(Typeface tf) {
        post2(() -> et.setTypeface(tf));
    }

    public void setTypeface(Typeface tf, int style) {
        post2(() -> et.setTypeface(tf, style));
    }

    public Typeface getTypeface() {
        return et.getTypeface();
    }

    public void setGravity(int gravity) {
        post2(() -> et.setGravity(gravity));
    }

    public int getGravity() {
        return et.getGravity();
    }

    public void setLineSpacing(float add, float mult) {
        post2(() -> et.setLineSpacing(add, mult));
    }

    public void setEllipsize(TextUtils.TruncateAt where) {
        post2(() -> et.setEllipsize(where));
    }

    /* ==================== 行 / 长度 ==================== */

    public void setSingleLine(boolean b) {
        post2(() -> et.setSingleLine(b));
    }

    public void setMaxLines(int n) {
        post2(() -> et.setMaxLines(n));
    }

    public int getMaxLines() {
        return et.getMaxLines();
    }

    public void setMinLines(int n) {
        post2(() -> et.setMinLines(n));
    }

    public void setLines(int n) {
        post2(() -> et.setLines(n));
    }

    public void setMaxLength(int length) {
        post2(() -> et.setFilters(new InputFilter[]{ new InputFilter.LengthFilter(length) }));
    }

    public void setFilters(InputFilter[] filters) {
        post2(() -> et.setFilters(filters));
    }

    public InputFilter[] getFilters() {
        return et.getFilters();
    }

    /* ==================== 输入类型 / IME ==================== */

    public void setInputType(int type) {
        post2(() -> et.setInputType(type));
    }

    public int getInputType() {
        return et.getInputType();
    }

    public void setImeOptions(int options) {
        post2(() -> et.setImeOptions(options));
    }

    public int getImeOptions() {
        return et.getImeOptions();
    }

    public void setImeActionLabel(CharSequence label, int actionId) {
        post2(() -> et.setImeActionLabel(label, actionId));
    }

    public void setRawInputType(int type) {
        post2(() -> et.setRawInputType(type));
    }

    /* ==================== 选择 / 光标 ==================== */

    public void setSelection(int index) {
        post2(() -> et.setSelection(index));
    }

    public void setSelection(int start, int stop) {
        post2(() -> et.setSelection(start, stop));
    }

    public void selectAll() {
        post2(() -> et.selectAll());
    }

    public void extendSelection(int index) {
        post2(() -> et.extendSelection(index));
    }

    public int getSelectionStart() {
        return et.getSelectionStart();
    }

    public int getSelectionEnd() {
        return et.getSelectionEnd();
    }

    public void setCursorVisible(boolean v) {
        post2(() -> et.setCursorVisible(v));
    }

    public boolean isCursorVisible() {
        return et.isCursorVisible();
    }

    /* ==================== 启用 / 焦点 ==================== */

    @Override
    public void setEnabled(boolean enabled) {
        super.setEnabled(enabled);
        post2(() -> et.setEnabled(enabled));
    }

    public void setFocusable(boolean focusable) {
        post2(() -> et.setFocusable(focusable));
    }

    public void setFocusableInTouchMode(boolean focusableInTouchMode) {
        post2(() -> et.setFocusableInTouchMode(focusableInTouchMode));
    }

    public void setSelectAllOnFocus(boolean selectAllOnFocus) {
        post2(() -> et.setSelectAllOnFocus(selectAllOnFocus));
    }

    public void setShowSoftInputOnFocus(boolean show) {
        post2(() -> et.setShowSoftInputOnFocus(show));
    }

    /* ==================== 监听器 ==================== */

    public void addTextChangedListener(TextWatcher wc) {
        post2(() -> et.addTextChangedListener(wc));
    }

    public void removeTextChangedListener(TextWatcher wc) {
        post2(() -> et.removeTextChangedListener(wc));
    }

    public void setOnEditorActionListener(TextView.OnEditorActionListener l) {
        post2(() -> et.setOnEditorActionListener(l));
    }

    public void setOnFocusChangeListener(View.OnFocusChangeListener l) {
        post2(() -> et.setOnFocusChangeListener(l));
    }

    public void setOnClickListener(View.OnClickListener l) {
        post2(() -> et.setOnClickListener(l));
    }

    public void setOnLongClickListener(View.OnLongClickListener l) {
        post2(() -> et.setOnLongClickListener(l));
    }

    /* ==================== TIL 自身能力 ==================== */

    public void setError(CharSequence error) {
        super.setError(error);
    }

    public void setErrorEnabled(boolean enabled) {
        super.setErrorEnabled(enabled);
    }

    public void setCounterEnabled(boolean enabled) {
        super.setCounterEnabled(enabled);
    }

    public void setCounterMaxLength(int maxLength) {
        super.setCounterMaxLength(maxLength);
    }

    public void setHelperText(CharSequence text) {
        super.setHelperText(text);
    }

    public void setHelperTextEnabled(boolean enabled) {
        super.setHelperTextEnabled(enabled);
    }

    public void setPlaceholderText(CharSequence text) {
        super.setPlaceholderText(text);
    }

    public void setBoxBackgroundMode(int mode) {
        super.setBoxBackgroundMode(mode);
    }

    public void setBoxStrokeColor(int color) {
        super.setBoxStrokeColor(color);
    }

    public void setBoxStrokeWidth(int width) {
        super.setBoxStrokeWidth(width);
    }

    public void setBoxStrokeWidthFocused(int width) {
        super.setBoxStrokeWidthFocused(width);
    }

    public void setStartIconDrawable(Drawable d) {
        super.setStartIconDrawable(d);
    }

    public void setEndIconDrawable(Drawable d) {
        super.setEndIconDrawable(d);
    }

    public void setEndIconMode(int mode) {
        super.setEndIconMode(mode);
    }

    public void setPasswordVisibilityToggleEnabled(boolean enabled) {
        super.setPasswordVisibilityToggleEnabled(enabled);
    }

    public void setPasswordVisibilityToggleTintList(ColorStateList tint) {
        super.setPasswordVisibilityToggleTintList(tint);
    }

    public void setExpandedHintEnabled(boolean enabled) {
        super.setExpandedHintEnabled(enabled);
    }
}