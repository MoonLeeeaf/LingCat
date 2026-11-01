package io.github.moonleeeaf.lingcat.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = PrimaryDark,
    onPrimary = OnPrimaryDark,
    primaryContainer = PrimaryContainerDark,
    onPrimaryContainer = OnPrimaryContainerDark,
    secondary = SecondaryDark,
    background = BackgroundDark,
    surface = SurfaceDark,
    onSurface = OnSurfaceDark
)

private val LightColorScheme = lightColorScheme(
    primary = PrimaryLight,
    onPrimary = OnPrimaryLight,
    primaryContainer = PrimaryContainerLight,
    onPrimaryContainer = OnPrimaryContainerLight,
    secondary = SecondaryLight,
    background = BackgroundLight,
    surface = SurfaceLight,
    onSurface = OnSurfaceLight
)

@Composable
fun LingCatTheme(
    // 是否开启深色模式，默认跟随系统
    darkTheme: Boolean = isSystemInDarkTheme(),
    // 是否开启 Android 12+ 的动态取色（Material You）
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        // 1. 优先使用动态取色 (需要 Android 12 / API 31+)
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        // 2. 否则使用我们自定义的配色
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    // ==========================================
    // 沉浸式状态栏与导航栏处理
    // ==========================================
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window

            // 关键点 1：让内容延伸到状态栏和导航栏下方 (Edge-to-Edge)
            WindowCompat.setDecorFitsSystemWindows(window, false)

            // 关键点 2：把状态栏和导航栏的背景设为透明
            window.statusBarColor = android.graphics.Color.TRANSPARENT
            @Suppress("DEPRECATION")
            window.navigationBarColor = android.graphics.Color.TRANSPARENT

            // 关键点 3：根据当前主题，自动切换状态栏图标为深色/浅色
            val insetsController = WindowCompat.getInsetsController(window, view)
            insetsController.isAppearanceLightStatusBars = !darkTheme
            // 如果你的底栏也是浅色，把导航栏图标也设为深色（适配全面屏手势条）
            insetsController.isAppearanceLightNavigationBars = !darkTheme

            // 处理旧版 Android 的导航栏遮罩（避免白底白条）
            if (Build.VERSION.SDK_INT >= 28) {
                @Suppress("DEPRECATION")
                window.navigationBarDividerColor = android.graphics.Color.TRANSPARENT
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}