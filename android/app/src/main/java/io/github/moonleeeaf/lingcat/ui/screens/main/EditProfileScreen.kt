package io.github.moonleeeaf.lingcat.ui.screens.main

import android.widget.Toast
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.net.LingCatClientManager

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
    onBack: () -> Unit,
    viewModel: EditProfileViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val snackbarHostState = remember { SnackbarHostState() }

    val fileToken by LingCatClientManager.fileAccessToken.collectAsState()

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

    // 监听错误和成功提示
    LaunchedEffect(uiState.errorMsg, uiState.successMsg) {
        uiState.errorMsg?.let { snackbarHostState.showSnackbar(it); viewModel.clearMessages() }
        uiState.successMsg?.let { snackbarHostState.showSnackbar(it); viewModel.clearMessages() }
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
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = { Text("编辑资料") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                },
                actions = {
                    TextButton(
                        onClick = {
                            viewModel.saveProfile(nickname, username, description)
                            onBack() // 保存后直接返回
                        },
                        enabled = !uiState.isSaving && !uiState.isLoading
                    ) {
                        Text("保存")
                    }
                }
            )
        }
    ) { padding ->
        if (uiState.isLoading && uiState.profile == null) {
            Box(
                Modifier
                    .fillMaxSize()
                    .padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
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
                val avatarHash = uiState.profile?.avatarFileHash
                val avatarUrl = if (!avatarHash.isNullOrEmpty() && !fileToken.isNullOrEmpty()) {
                    LingCatClientManager.currentClient?.getFileUrlByHashAndToken(avatarHash, fileToken ?: "")
                } else null

                Box(contentAlignment = Alignment.BottomEnd) {
                    if (avatarUrl != null) {
                        AsyncImage(
                            model = coil.request.ImageRequest.Builder(androidx.compose.ui.platform.LocalContext.current)
                                .data(avatarUrl)
                                .memoryCacheKey(avatarHash)
                                .diskCacheKey(avatarHash)
                                .build(),
                            contentDescription = "头像",
                            modifier = Modifier
                                .size(100.dp)
                                .clip(CircleShape)
                                .clickable {
                                    if (!uiState.isSaving) imagePickerLauncher.launch("image/*")
                                },
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        androidx.compose.foundation.Image(
                            painter = painterResource(id = R.drawable.ic_default_avatar),
                            contentDescription = "默认头像",
                            modifier = Modifier
                                .size(100.dp)
                                .clip(CircleShape)
                                .clickable {
                                    if (!uiState.isSaving) imagePickerLauncher.launch("image/*")
                                }
                        )
                    }

                    if (uiState.isSaving) {
                        CircularProgressIndicator(modifier = Modifier
                            .size(32.dp)
                            .align(Alignment.Center))
                    }
                }

                Spacer(Modifier.height(32.dp))

                // 输入框
                OutlinedTextField(
                    value = nickname,
                    onValueChange = { nickname = it },
                    label = { Text("昵称") },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !uiState.isSaving
                )
                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = username,
                    onValueChange = { username = it },
                    label = { Text("用户名") },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !uiState.isSaving
                )
                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = userId,
                    onValueChange = {},
                    label = { Text("用户 ID") },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = false
                )
                Spacer(Modifier.height(16.dp))

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("简介") },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !uiState.isSaving,
                )

                // OAuth 绑定区域
                if (uiState.oauthProviders.isNotEmpty()) {
                    Spacer(Modifier.height(32.dp))
                    Text("OAuth 绑定", style = MaterialTheme.typography.titleMedium, modifier = Modifier.fillMaxWidth())
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
                                            Toast.makeText(context, "无法打开浏览器", Toast.LENGTH_SHORT).show()
                                        }
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp)
                        ) {
                            // ★ 使用 provider.displayName 展示
                            Text(if (isBound) "解绑 ${provider.displayName}" else "绑定 ${provider.displayName}")
                        }
                    }

                    // 解绑确认弹窗
                    if (providerToUnbind != null) {
                        androidx.compose.material3.AlertDialog(
                            onDismissRequest = { providerToUnbind = null },
                            title = { Text("解绑 ${providerToUnbind?.displayName}") },
                            text = { Text("解绑后将无法使用该账号登录。如果忘记密码，解绑后将无法再进入此账号。确定继续？") },
                            confirmButton = {
                                androidx.compose.material3.TextButton(onClick = {
                                    viewModel.unbindOAuth(providerToUnbind!!.id) // ★ 传 id
                                    providerToUnbind = null
                                }) { Text("解绑") }
                            },
                            dismissButton = {
                                androidx.compose.material3.TextButton(onClick = { providerToUnbind = null }) { Text("取消") }
                            }
                        )
                    }
                }
            }
        }
    }
}