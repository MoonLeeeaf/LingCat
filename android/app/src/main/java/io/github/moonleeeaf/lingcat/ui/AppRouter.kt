package io.github.moonleeeaf.lingcat.ui

import androidx.compose.animation.AnimatedContentTransitionScope
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.consumeWindowInsets
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.material3.VerticalDivider
import androidx.compose.material3.windowsizeclass.WindowSizeClass
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavBackStackEntry
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import io.github.moonleeeaf.lingcat.OAuthEvent
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.net.LingCatClientManager
import io.github.moonleeeaf.lingcat.ui.components.ConnectionStateBanner
import io.github.moonleeeaf.lingcat.ui.components.SwipeDismissSnackbarHost
import io.github.moonleeeaf.lingcat.ui.screens.auth.LoginScreen
import io.github.moonleeeaf.lingcat.ui.screens.chat.ChatMembersScreen
import io.github.moonleeeaf.lingcat.ui.screens.chat.ChatScreen
import io.github.moonleeeaf.lingcat.ui.screens.chat.ChatSettingsScreen
import io.github.moonleeeaf.lingcat.ui.screens.chat.meeting.MeetingScreen
import io.github.moonleeeaf.lingcat.ui.screens.main.AccountListScreen
import io.github.moonleeeaf.lingcat.ui.screens.main.ChatListScreen
import io.github.moonleeeaf.lingcat.ui.screens.main.EditProfileScreen
import io.github.moonleeeaf.lingcat.ui.screens.splash.SplashScreen
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.launch
import lingcat.client_protocol.LingCatClient

object Routes {
    const val SPLASH = "splash"
    const val LOGIN = "login"
    const val CHAT_LIST = "chat_list"
    const val CHAT = "chat/{chatId}"
    const val ACCOUNT_LIST = "account_list"
    const val CHAT_MEMBERS = "chat_members/{chatId}"
    const val CHAT_SETTINGS = "chat_settings/{chatId}"
    const val EDIT_PROFILE = "edit_profile"
    const val MEETING = "meeting"
}

private const val DURATION = 300
private const val TABLET_LIST_WIDTH_DP = 360

// ==========================================
// 统一的页面转场
// ==========================================
// 详情页一律从右侧推入、向右退出；返回时反向。
// 之前聊天页、账号页、设置页、会议页各用一套动画（或默认淡入淡出），
// 会让“进入下一层”的空间关系变得不可预测。
private val detailEnter: AnimatedContentTransitionScope<NavBackStackEntry>.() -> EnterTransition = {
    slideInHorizontally(animationSpec = tween(DURATION)) { it / 4 } + fadeIn(tween(DURATION))
}
private val detailExit: AnimatedContentTransitionScope<NavBackStackEntry>.() -> ExitTransition = {
    slideOutHorizontally(animationSpec = tween(DURATION)) { -it / 4 } + fadeOut(tween(DURATION))
}
private val detailPopEnter: AnimatedContentTransitionScope<NavBackStackEntry>.() -> EnterTransition = {
    slideInHorizontally(animationSpec = tween(DURATION)) { -it / 4 } + fadeIn(tween(DURATION))
}
private val detailPopExit: AnimatedContentTransitionScope<NavBackStackEntry>.() -> ExitTransition = {
    slideOutHorizontally(animationSpec = tween(DURATION)) { it } + fadeOut(tween(DURATION))
}

@Composable
fun LingCatApp(
    deepLinkChatIdFlow: SharedFlow<String>,
    oauthEventFlow: SharedFlow<OAuthEvent>,
    windowSizeClass: WindowSizeClass,
    openMeetingEventFlow: SharedFlow<Unit>,
) {
    val navController = rememberNavController()
    // 只有真正的 Expanded（>= 840dp）才分栏。
    // Medium（600dp 左右）分栏后右侧只剩 280dp，连消息气泡都放不下。
    val isExpanded = windowSizeClass.widthSizeClass == WindowWidthSizeClass.Expanded

    val snackbarHostState = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    // 全局连接状态：挂在 NavHost 之上，任何页面都能看到。
    // 登录 / 启动 / 会议页有自己的全屏流程或深色主题，不叠加这条横幅。
    val connectionState by LingCatClientManager.connectionState.collectAsState()
    val connectionError by LingCatClientManager.connectionError.collectAsState()
    val currentBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = currentBackStackEntry?.destination?.route
    val bannerRouteHidden = currentRoute == null ||
        currentRoute == Routes.SPLASH ||
        currentRoute == Routes.LOGIN ||
        currentRoute == Routes.MEETING
    val showConnectionBanner = !bannerRouteHidden && (
        connectionState == LingCatClient.ConnectionState.CONNECTING ||
            connectionState == LingCatClient.ConnectionState.RECONNECTING ||
            connectionState == LingCatClient.ConnectionState.DISCONNECTED
        )
    val retryConnection: () -> Unit = {
        val server = LingCatClientManager.currentServer
        if (server == null) {
            Feedback.show(R.string.error_server_not_connected)
        } else {
            scope.launch {
                LingCatClientManager.connect(server).exceptionOrNull()?.let { e ->
                    Feedback.show(e.toUiTextOrNull() ?: uiText(R.string.error_network))
                }
            }
        }
    }

    // 全局反馈总线：复制成功、保存失败之类的短提示统一走 Snackbar。
    // 弹窗（Dialog / ModalBottomSheet）自带 FeedbackHost 时让位，否则提示会被弹窗遮罩挡住。
    LaunchedEffect(Unit) {
        Feedback.events.collect { message ->
            if (Feedback.isModalHostActive) return@collect
            snackbarHostState.showSnackbar(message)
        }
    }

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
        openMeetingEventFlow.collect {
            val currentRoute = navController.currentBackStackEntry?.destination?.route
            // 如果当前不在会议页，才进行跳转
            if (currentRoute != Routes.MEETING) {
                navController.navigate(Routes.MEETING) {
                    launchSingleTop = true
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        oauthEventFlow.collect { event ->
            when (event) {
                is OAuthEvent.Bound -> {
                    // 资料页绑定时，弹个提示
                    Feedback.show(R.string.oauth_bound, event.provider)
                    // 此时 EditProfileViewModel 会自己调 loadBindings() 刷新
                }
                is OAuthEvent.LoginSuccess -> {
                    // OAuth 登录成功，跳到主界面
                    Feedback.show(R.string.login_success)
                    navController.navigate(Routes.CHAT_LIST) {
                        popUpTo(Routes.LOGIN) { inclusive = true }
                    }
                }
                is OAuthEvent.Error -> {
                    Feedback.show(event.message)
                }
            }
        }
    }

    var selectedChatId by rememberSaveable { mutableStateOf<String?>(null) }

    Column(modifier = Modifier.fillMaxSize()) {
        AnimatedVisibility(
            visible = showConnectionBanner,
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut(),
        ) {
            ConnectionStateBanner(
                state = connectionState,
                errorMessage = connectionError,
                onRetry = retryConnection,
                modifier = Modifier.statusBarsPadding(),
            )
        }

        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                // 状态条已经替页面吃掉了状态栏区域，避免各页面的 TopAppBar 再补一次。
                .then(
                    if (showConnectionBanner) {
                        Modifier.consumeWindowInsets(WindowInsets.statusBars)
                    } else {
                        Modifier
                    }
                ),
        ) {
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
                                Box(
                                    modifier = Modifier
                                        .width(TABLET_LIST_WIDTH_DP.dp)
                                        .fillMaxHeight()
                                ) {
                                    ChatListScreen(
                                        onManageAccounts = { navController.navigate(Routes.ACCOUNT_LIST) },
                                        onLogout = { navController.navigate(Routes.LOGIN) { popUpTo(0) } },
                                        onEditProfile = { navController.navigate(Routes.EDIT_PROFILE) },
                                        onChatClick = { chatId -> selectedChatId = chatId },
                                        selectedChatId = selectedChatId,
                                    )
                                }

                                VerticalDivider(color = MaterialTheme.colorScheme.outlineVariant)

                                // 右侧：独立的嵌套 NavHost
                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .fillMaxHeight()
                                ) {
                                    if (selectedChatId == null) {
                                        Scaffold { padding ->
                                            Box(
                                                Modifier
                                                    .fillMaxSize()
                                                    .padding(padding),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(
                                                    stringResource(R.string.nav_pick_chat),
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
                                            modifier = Modifier.fillMaxSize(),
                                            enterTransition = detailEnter,
                                            exitTransition = detailExit,
                                            popEnterTransition = detailPopEnter,
                                            popExitTransition = detailPopExit,
                                        ) {
                                            // 嵌套路由 1：聊天详情
                                            composable(Routes.CHAT) {
                                                ChatScreen(
                                                    chatId = selectedChatId!!,
                                                    onBack = { selectedChatId = null }, // 点返回回到未选中
                                                    onNavigateToMembers = { chatId ->
                                                        rightNavController.navigate("chat_members_2/$chatId")
                                                    },
                                                    onNavigateToSettings = { chatId ->
                                                        rightNavController.navigate("chat_settings_2/$chatId")
                                                    },
                                                    onNavigateToChat = { newChatId ->
                                                        selectedChatId = newChatId // 右侧直接切聊天
                                                    },
                                                    onNavigateToMeeting = {
                                                        navController.navigate(Routes.MEETING)
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
                                            // 嵌套路由 3：对话设定
                                            composable("chat_settings_2/{chatId}") { backStack ->
                                                val cid = backStack.arguments?.getString("chatId") ?: ""
                                                ChatSettingsScreen(
                                                    chatId = cid,
                                                    onBack = { rightNavController.popBackStack() },
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        } else {
                            // 手机模式
                            ChatListScreen(
                                onManageAccounts = { navController.navigate(Routes.ACCOUNT_LIST) },
                                onLogout = { navController.navigate(Routes.LOGIN) { popUpTo(0) } },
                                onEditProfile = { navController.navigate(Routes.EDIT_PROFILE) },
                                onChatClick = { chatId -> navController.navigate("chat/$chatId") }
                            )
                        }
                    }

                    // 4. 账号管理 (AccountList)
                    composable(
                        route = Routes.ACCOUNT_LIST,
                        enterTransition = detailEnter,
                        exitTransition = detailExit,
                        popEnterTransition = detailPopEnter,
                        popExitTransition = detailPopExit,
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
                        enterTransition = detailEnter,
                        exitTransition = detailExit,
                        popEnterTransition = detailPopEnter,
                        popExitTransition = detailPopExit,
                    ) { backStackEntry ->
                        val chatId = backStackEntry.arguments?.getString("chatId") ?: ""
                        ChatScreen(
                            chatId = chatId,
                            onBack = { navController.popBackStack() },
                            onNavigateToMembers = { chatId -> navController.navigate("chat_members/$chatId") },
                            onNavigateToSettings = { chatId -> navController.navigate("chat_settings/$chatId") },
                            onNavigateToChat = { newChatId ->
                                // ★ 核心修复：跳转到新生成的私聊 ID
                                navController.navigate("chat/$newChatId") {
                                    popUpTo(Routes.CHAT) { inclusive = true }
                                }
                            },
                            onNavigateToMeeting = {
                                navController.navigate(Routes.MEETING)
                            },
                        )
                    }

                    composable(
                        route = Routes.CHAT_MEMBERS,
                        enterTransition = detailEnter,
                        exitTransition = detailExit,
                        popEnterTransition = detailPopEnter,
                        popExitTransition = detailPopExit,
                    ) { backStackEntry ->
                        val chatId = backStackEntry.arguments?.getString("chatId") ?: ""
                        ChatMembersScreen(
                            chatId = chatId,
                            onBack = { navController.popBackStack() },
                            onNavigateToChatFromMember = { newChatId ->
                                // ★ 核心修复：跳转到新生成的私聊 ID
                                navController.navigate("chat/$newChatId") {
                                    popUpTo(Routes.CHAT) { inclusive = true }
                                }
                            },
                        )
                    }

                    composable(
                        route = Routes.CHAT_SETTINGS,
                        enterTransition = detailEnter,
                        exitTransition = detailExit,
                        popEnterTransition = detailPopEnter,
                        popExitTransition = detailPopExit,
                    ) { backStackEntry ->
                        val chatId = backStackEntry.arguments?.getString("chatId") ?: ""
                        ChatSettingsScreen(
                            chatId = chatId,
                            onBack = { navController.popBackStack() },
                        )
                    }

                    composable(
                        route = Routes.EDIT_PROFILE,
                        enterTransition = detailEnter,
                        exitTransition = detailExit,
                        popEnterTransition = detailPopEnter,
                        popExitTransition = detailPopExit,
                    ) {
                        EditProfileScreen(
                            onBack = { navController.popBackStack() }
                        )
                    }

                    composable(
                        route = Routes.MEETING,
                        enterTransition = detailEnter,
                        exitTransition = detailExit,
                        popEnterTransition = detailPopEnter,
                        popExitTransition = detailPopExit,
                    ) {
                        MeetingScreen(onBack = { navController.popBackStack() })
                    }
                }

                // 全局 Snackbar：挂在 NavHost 之上，避免每个页面各建一套导致反馈丢失。
                // 支持左右滑动关闭。
                SwipeDismissSnackbarHost(
                    hostState = snackbarHostState,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .navigationBarsPadding()
                        .padding(16.dp),
                )
        }
    }
}
