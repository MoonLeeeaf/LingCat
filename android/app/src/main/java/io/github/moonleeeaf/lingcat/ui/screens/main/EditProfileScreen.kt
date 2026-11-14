package io.github.moonleeeaf.lingcat.ui.screens.main

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.ui.Feedback
import io.github.moonleeeaf.lingcat.ui.components.LingCatAvatar
import io.github.moonleeeaf.lingcat.ui.components.LoadingState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
    onBack: () -> Unit,
    viewModel: EditProfileViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    // 初始化输入框状态
    var nickname by remember { mutableStateOf("") }
    var username by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var userId by remember { mutableStateOf("") }
    var providerToUnbind by remember { mutableStateOf<OAuthProvider?>(null) }

    // 监听资料变化，回填输入框
    LaunchedEffect(uiState.profile) {
        uiState.profile?.let {
            nickname = it.nickname
            username = it.username
            description = it.description
            userId = it.id
        }
    }

    // 统一走全局 Snackbar 反馈：之前这里自己建了一套 SnackbarHost，
    // 又有几处 Toast，同一个页面出现三种反馈样式。
    LaunchedEffect(uiState.errorMsg) {
        uiState.errorMsg?.let {
            Feedback.show(it)
            viewModel.clearMessages()
        }
    }
    LaunchedEffect(uiState.successMsg) {
        uiState.successMsg?.let { message ->
            Feedback.show(message)
            val justSaved = uiState.justSaved
            viewModel.clearMessages()
            if (justSaved) onBack()
        }
    }

    val lifecycleOwner = androidx.lifecycle.compose.LocalLifecycleOwner.current
    DisposableEffect(lifecycleOwner) {
        val observer = androidx.lifecycle.LifecycleEventObserver { _, event ->
            if (event == androidx.lifecycle.Lifecycle.Event.ON_RESUME) {
                // 当用户从浏览器切回 App 时，自动刷新绑定状态
                viewModel.loadProfile()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose { lifecycleOwner.lifecycle.removeObserver(observer) }
    }

    // 图片选择器
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) viewModel.uploadAvatar(context, uri)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.chat_list_edit_profile)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.action_back))
                    }
                },
                actions = {
                    TextButton(
                        onClick = {
                            viewModel.saveProfile(nickname, username, description)
                        },
                        enabled = !uiState.isSaving && !uiState.isLoading
                    ) {
                        Text(stringResource(R.string.action_save))
                    }
                }
            )
        }
    ) { padding ->
        if (uiState.isLoading && uiState.profile == null) {
            LoadingState(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                label = stringResource(R.string.edit_profile_loading),
            )
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .verticalScroll(rememberScrollState())
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // 头像
                Box(contentAlignment = Alignment.Center) {
                    LingCatAvatar(
                        avatarHash = uiState.profile?.avatarFileHash,
                        size = 100.dp,
                        contentDescription = stringResource(R.string.label_avatar),
                        onClick = {
                            if (!uiState.isSaving) imagePickerLauncher.launch("image/*")
                        },
                    )

                    if (uiState.isSaving) {
                        CircularProgressIndicator(modifier = Modifier.size(32.dp))
                    }
                }
                Text(
                    text = stringResource(R.string.edit_profile_tap_avatar),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 8.dp),
                )

                Spacer(Modifier.height(32.dp))

                // 输入框
                OutlinedTextField(
                    value = nickname,
                    onValueChange = { nickname = it },
                    label = { Text(stringResource(R.string.label_nickname)) },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !uiState.isSaving
                )
                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text(stringResource(R.string.label_username)) },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !uiState.isSaving
                )
                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = userId,
                    onValueChange = {},
                    label = { Text(stringResource(R.string.label_user_id)) },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = false
                )
                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text(stringResource(R.string.label_description)) },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !uiState.isSaving,
                )

                // OAuth 绑定区域
                if (uiState.oauthProviders.isNotEmpty()) {
                    Spacer(Modifier.height(32.dp))
                    Text(stringResource(R.string.edit_profile_oauth_bindings), style = MaterialTheme.typography.titleMedium, modifier = Modifier.fillMaxWidth())
                    Spacer(Modifier.height(16.dp))

                    uiState.oauthProviders.forEach { provider -> // ★ provider 现在是对象了
                        val isBound = uiState.bindings.contains(provider.id)
                        OutlinedButton(
                            onClick = {
                                if (isBound) {
                                    providerToUnbind = provider
                                } else {
                                    val url = viewModel.getOAuthBindUrl(provider.id)
                                    if (url != null) {
                                        try {
                                            context.startActivity(android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(url)))
                                        } catch (e: Exception) {
                                            Feedback.show(R.string.browser_open_failed)
                                        }
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                        ) {
                            // ★ 使用 provider.displayName 展示
                            Text(if (isBound) stringResource(R.string.unbind_provider, provider.displayName) else stringResource(R.string.bind_provider, provider.displayName))
                        }
                    }

                    // 解绑确认弹窗
                    if (providerToUnbind != null) {
                        androidx.compose.material3.AlertDialog(
                            onDismissRequest = { providerToUnbind = null },
                            title = { Text(stringResource(R.string.unbind_provider_title, providerToUnbind?.displayName ?: "")) },
                            text = { Text(stringResource(R.string.unbind_confirm_message)) },
                            confirmButton = {
                                androidx.compose.material3.TextButton(onClick = {
                                    viewModel.unbindOAuth(providerToUnbind!!.id) // ★ 传 id
                                    providerToUnbind = null
                                }) { Text(stringResource(R.string.action_unbind)) }
                            },
                            dismissButton = {
                                androidx.compose.material3.TextButton(onClick = { providerToUnbind = null }) { Text(stringResource(R.string.action_cancel)) }
                            }
                        )
                    }
                }
            }
        }
    }
}