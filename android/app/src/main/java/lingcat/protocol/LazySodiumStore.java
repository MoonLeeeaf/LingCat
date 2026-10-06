package lingcat.protocol;

import com.goterl.lazysodium.LazySodiumAndroid;
import com.goterl.lazysodium.SodiumAndroid;

public class LazySodiumStore {
    private static LazySodiumAndroid lazySodium;

    public static LazySodiumAndroid getLazySodium() {
        if (lazySodium == null)
            lazySodium = new LazySodiumAndroid(new SodiumAndroid());
        return lazySodium;
    }
}