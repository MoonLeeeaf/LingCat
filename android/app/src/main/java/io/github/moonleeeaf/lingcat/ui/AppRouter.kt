package io.github.moonleeeaf.lingcat.ui

import androidx.compose.animation.*
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.VerticalDivider
import androidx.compose.material3.windowsizeclass.WindowSizeClass
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
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
fun LingCatApp(deepLinkChatIdFlow: SharedFlow<String>, oauthEventFlow: SharedFlow<OAuthEvent>, windowSizeClass: WindowSizeClass, ) {
    val navController = rememberNavController()
    val isExpanded = windowSizeClass.widthSizeClass == WindowWidthSizeClass.Expanded ||
            windowSizeClass.widthSizeClass == WindowWidthSizeClass.Medium

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

    var selectedChatId by rememberSaveable { mutableStateOf<String?>(null) }

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
        composable(Routes.CHAT_LIST) {
            if (isExpanded) {
                // ★ 平板分栏模式
                Row(modifier = Modifier.fillMaxSize()) {
                    // 左侧：固定宽度的聊天列表
                    Box(modifier = Modifier
                        .width(320.dp)
                        .fillMaxHeight()) {
                        ChatListScreen(
                            onManageAccounts = { navController.navigate(Routes.ACCOUNT_LIST) },
                            onLogout = { navController.navigate(Routes.LOGIN) { popUpTo(0) } },
                            onEditProfile = { navController.navigate(Routes.EDIT_PROFILE) },
                            onChatClick = { chatId -> selectedChatId = chatId } // 只更新选中状态
                        )
                    }

                    VerticalDivider(color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f))

                    // 右侧：独立的嵌套 NavHost
                    Box(modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()) {
                        if (selectedChatId == null) {
                            Scaffold {padding ->
                                Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                                    Text(
                                        "选择一个对话开始聊天喵",
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        } else {
                            // 为右侧创建一个局部的 NavController
                            val rightNavController = rememberNavController()

                            NavHost(
                                navController = rightNavController,
                                startDestination = Routes.CHAT,
                                modifier = Modifier.fillMaxSize()
                            ) {
                                // 嵌套路由 1：聊天详情
                                composable(Routes.CHAT) {
                                    ChatScreen(
                                        chatId = selectedChatId!!,
                                        onBack = { selectedChatId = null }, // 点返回回到未选中
                                        // ★ 重点：这里不再用外层的 navController，而是用局部的 rightNavController
                                        onNavigateToMembers = { chatId ->
                                            rightNavController.navigate("chat_members_2/$chatId")
                                        },
                                        onNavigateToChat = { newChatId ->
                                            selectedChatId = newChatId // 右侧直接切聊天
                                        }
                                    )
                                }
                                // 嵌套路由 2：群成员列表
                                composable("chat_members_2/{chatId}") { backStack ->
                                    val cid = backStack.arguments?.getString("chatId") ?: ""
                                    ChatMembersScreen(
                                        chatId = cid,
                                        onBack = { rightNavController.popBackStack() }, // ★ 这里的返回只影响右侧
                                        onNavigateToChatFromMember = { newChatId ->
                                            selectedChatId = newChatId
                                            // 如果切换到了新聊天，清空右栏的返回栈
                                            rightNavController.popBackStack(Routes.CHAT, inclusive = false)
                                        }
                                    )
                                }
                            }
                        }
                    }
                }
            } else {
                // 手机模式：保持原有逻辑
                ChatListScreen(
                    onManageAccounts = { navController.navigate(Routes.ACCOUNT_LIST) },
                    onLogout = { navController.navigate(Routes.LOGIN) { popUpTo(0) } },
                    onEditProfile = { navController.navigate(Routes.EDIT_PROFILE) },
                    onChatClick = { chatId -> navController.navigate("chat/$chatId") }
                )
            }
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
            ChatScreen(
                chatId = chatId,
                onBack = { navController.popBackStack() },
                onNavigateToMembers = { chatId -> navController.navigate("chat_members/$chatId") },
                onNavigateToChat = { newChatId ->
                    // ★ 核心修复：跳转到新生成的私聊 ID
                    navController.navigate("chat/$newChatId") {
                        // 可选：如果你希望从当前聊天直接替换到新聊天，而不是叠加在返回栈里，可以加上：
                        popUpTo(Routes.CHAT) { inclusive = true }
                    }
                },
            )
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
                onBack = { navController.popBackStack() },
                onNavigateToChatFromMember = { newChatId ->
                    // ★ 核心修复：跳转到新生成的私聊 ID
                    navController.navigate("chat/$newChatId") {
                        // 可选：如果你希望从当前聊天直接替换到新聊天，而不是叠加在返回栈里，可以加上：
                        popUpTo(Routes.CHAT) { inclusive = true }
                    }
                },
            )
        }

        composable(Routes.EDIT_PROFILE) {
            EditProfileScreen(
                onBack = { navController.popBackStack() }
            )
        }
    }
}