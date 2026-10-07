package io.github.moonleeeaf.lingcat;

import android.content.Intent;
import android.os.Bundle;

import io.github.moonleeeaf.lingcat.auth.AuthActivity;
import moon3.app.Activity;

public class SplashActivity extends Activity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        startActivity(
                new Intent(this, AuthActivity.class)
        );
        finish();
    }
    
}
