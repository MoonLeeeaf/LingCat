package io.github.moonleeeaf.lingcat;

import android.content.Context;
import android.content.SharedPreferences;

public class KV {
    public static SharedPreferences getKV(Context mContext) {
        return mContext.getSharedPreferences("kv", Context.MODE_PRIVATE);
    }
}
