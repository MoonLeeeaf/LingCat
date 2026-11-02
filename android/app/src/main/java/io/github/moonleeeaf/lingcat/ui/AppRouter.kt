package io.github.moonleeeaf.lingcat.ui

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import io.github.moonleeeaf.lingcat.OAuthEvent
import io.github.moonleeeaf.lingcat.ui.screens.auth.LoginScreen
import io.github.moonleeeaf.lingcat.ui.screens.chat.ChatMembersScreen
import io.github.moonleeeaf.lingcat.ui.screens.chat.ChatScreen
import io.github.moonleeeaf.lingcat.ui.screens.main.AccountListScreen
import io.github.moonleeeaf.lingcat.ui.screens.main.ChatListScreen
import io.github.moonleeeaf.lingcat.ui.screens.main.EditProfileScreen
import io.github.moonleeeaf.lingcat.ui.screens.splash.SplashScreen
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow

object Routes {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val CHAT_LIST = "chat_list"
    const val CHAT = "chat/{chatId}"
    const val ACCOUNT_LIST = "account_list"
    const val CHAT_MEMBERS = "chat_members/{chatId}"
    const val EDIT_PROFILE = "edit_profile"
}

// 动画时长，保持全局一致
private const val DURATION = 300

@Composable
fun LingCatApp(deepLinkChatIdFlow: SharedFlow<String>, oauthEventFlow: SharedFlow<OAuthEvent> ) {
    val navController = rememberNavController()

    val snackbarHostState = remember { SnackbarHostState() }

    // ★ 监听通知点击事件
    LaunchedEffect(Unit) {
        deepLinkChatIdFlow.collect { chatId ->
            // 获取当前的路由栈，判断是否在登录页或主界面
            val currentRoute = navController.currentBackStackEntry?.destination?.route

            if (currentRoute == Routes.CHAT_LIST || currentRoute == Routes.CHAT) {
                // 已经登录且在聊天相关页面，直接跳转
                navController.navigate("chat/$chatId") {
                    // 避免无限叠加，如果已经在某个聊天里，先把它弹出去，再打开新的
                    popUpTo(Routes.CHAT_LIST) {
                        saveState = true
                    }
                    launchSingleTop = true
                    restoreState = true
                }
            } else {
                // 如果用户停留在登录页、选服务器页等，暂时先不跳，或者你可以做延迟跳转处理
                android.util.Log.w("DeepLink", "用户尚未登录，忽略此次跳转")
            }
        }
    }

    LaunchedEffect(Unit) {
        oauthEventFlow.collect { event ->
            when (event) {
                is OAuthEvent.Bound -> {
                    // 资料页绑定时，弹个提示
                    snackbarHostState.showSnackbar("已成功绑定 ${event.provider}")
                    // 此时 EditProfileViewModel 会自己调 loadBindings() 刷新
                }
                is OAuthEvent.LoginSuccess -> {
                    // OAuth 登录成功，跳到主界面
                    snackbarHostState.showSnackbar("登录成功")
                    navController.navigate(Routes.CHAT_LIST) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                }
                is OAuthEvent.Error -> {
                    snackbarHostState.showSnackbar(event.message)
                }
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = Routes.SPLASH,
        // 默认切换动画（淡入淡出），用于兜底
        enterTransition = { fadeIn(tween(DURATION)) },
        exitTransition = { fadeOut(tween(DURATION)) },
        popEnterTransition = { fadeIn(tween(DURATION)) },
        popExitTransition = { fadeOut(tween(DURATION)) }
    ) {
        // 1. 启动页 (Splash)
        composable(
            route = Routes.SPLASH,
            // ★ 纯淡出，不缩放，显得更平静优雅
            exitTransition = {
                fadeOut(animationSpec = tween(400))
            }
        ) {
            SplashScreen(
                onNeedLogin = {
                    navController.navigate(Routes.LOGIN) { popUpTo(Routes.SPLASH) { inclusive = true } }
                },
                onLoggedIn = {
                    navController.navigate(Routes.CHAT_LIST) { popUpTo(Routes.SPLASH) { inclusive = true } }
                }
            )
        }

        // 2. 登录页 (Login)
        composable(
            route = Routes.LOGIN,
            // 从底部向上滑入，表示进入 App
            enterTransition = { slideInVertically(initialOffsetY = { it / 4 }, animationSpec = tween(DURATION)) + fadeIn(tween(DURATION)) },
            // 登录成功后向上滑出/淡出
            exitTransition = { slideOutVertically(targetOffsetY = { -it / 4 }, animationSpec = tween(DURATION)) + fadeOut(tween(DURATION)) },
            // 从其他页面退回登录页时，从底部滑入
            popEnterTransition = { slideInVertically(initialOffsetY = { it / 4 }, animationSpec = tween(DURATION)) + fadeIn(tween(DURATION)) }
        ) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Routes.CHAT_LIST) { popUpTo(Routes.LOGIN) { inclusive = true } }
                },
                onManageAccounts = { navController.navigate(Routes.ACCOUNT_LIST) }
            )
        }

        // 3. 对话列表 (ChatList)
        composable(
            route = Routes.CHAT_LIST,
            // 登录页进来时，从左侧稍作平移+淡入（或直接淡入）
            enterTransition = { slideInHorizontally(initialOffsetX = { -it / 4 }, animationSpec = tween(DURATION)) + fadeIn(tween(DURATION)) },
            // 进入下一级（账号管理/聊天）时，向左微移
            exitTransition = { slideOutHorizontally(targetOffsetX = { -it / 4 }, animationSpec = tween(DURATION)) + fadeOut(tween(DURATION)) },
            // 从聊天页/账号管理返回时，从左侧滑入
            popEnterTransition = { slideInHorizontally(initialOffsetX = { -it / 4 }, animationSpec = tween(DURATION)) + fadeIn(tween(DURATION)) }
        ) {
            ChatListScreen(
                onEditProfile = { navController.navigate(Routes.EDIT_PROFILE) },
                onManageAccounts = { navController.navigate(Routes.ACCOUNT_LIST) },
                onLogout = { navController.navigate(Routes.LOGIN) { popUpTo(0) } },
                onChatClick = { chatId -> navController.navigate("chat/$chatId") }
            )
        }

        // 4. 账号管理 (AccountList) - 作为一个子页面从右侧进入
        composable(
            route = Routes.ACCOUNT_LIST,
            enterTransition = { slideInHorizontally(initialOffsetX = { it }, animationSpec = tween(DURATION)) },
            exitTransition = { slideOutHorizontally(targetOffsetX = { it }, animationSpec = tween(DURATION)) },
            popEnterTransition = { slideInHorizontally(initialOffsetX = { it }, animationSpec = tween(DURATION)) },
            popExitTransition = { slideOutHorizontally(targetOffsetX = { it }, animationSpec = tween(DURATION)) }
        ) {
            AccountListScreen(
                onBack = { navController.popBackStack() },
                onAddAccount = { navController.navigate(Routes.LOGIN) },
                onSwitchSuccess = { navController.navigate(Routes.CHAT_LIST) { popUpTo(Routes.CHAT_LIST) { inclusive = true } } },
                onForceLogout = { navController.navigate(Routes.LOGIN) { popUpTo(0) } }
            )
        }

        // 5. 聊天详情 (Chat)
        composable(
            route = Routes.CHAT,
            enterTransition = { slideInHorizontally(initialOffsetX = { it }, animationSpec = tween(DURATION)) + fadeIn(tween(DURATION)) },
            exitTransition = { slideOutHorizontally(targetOffsetX = { -it / 4 }, animationSpec = tween(DURATION)) + fadeOut(tween(DURATION)) },
            popEnterTransition = { slideInHorizontally(initialOffsetX = { -it / 4 }, animationSpec = tween(DURATION)) + fadeIn(tween(DURATION)) },
            popExitTransition = { slideOutHorizontally(targetOffsetX = { it }, animationSpec = tween(DURATION)) + fadeOut(tween(DURATION)) }
        ) { backStackEntry ->
            val chatId = backStackEntry.arguments?.getString("chatId") ?: ""
            ChatScreen(chatId = chatId, onBack = { navController.popBackStack() }, onNavigateToMembers = { chatId -> navController.navigate("chat_members/$chatId") })
        }

        composable(
            route = Routes.CHAT_MEMBERS,
            enterTransition = { slideInHorizontally(initialOffsetX = { it }) },
            exitTransition = { slideOutHorizontally(targetOffsetX = { it }) },
            popEnterTransition = { slideInHorizontally(initialOffsetX = { it }) },
            popExitTransition = { slideOutHorizontally(targetOffsetX = { it }) }
        ) { backStackEntry ->
            val chatId = backStackEntry.arguments?.getString("chatId") ?: ""
            ChatMembersScreen(
                chatId = chatId,
                onBack = { navController.popBackStack() }
            )
        }

        composable(Routes.EDIT_PROFILE) {
            EditProfileScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}