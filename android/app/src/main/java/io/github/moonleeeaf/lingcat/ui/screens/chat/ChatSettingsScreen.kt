package io.github.moonleeeaf.lingcat.ui.screens.chat

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.StringRes
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AlternateEmail
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Title
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import io.github.moonleeeaf.lingcat.R
import io.github.moonleeeaf.lingcat.ui.Feedback
import io.github.moonleeeaf.lingcat.ui.asString
import io.github.moonleeeaf.lingcat.ui.components.ErrorState
import io.github.moonleeeaf.lingcat.ui.components.LingCatActionItem
import io.github.moonleeeaf.lingcat.ui.components.LingCatAvatar
import io.github.moonleeeaf.lingcat.ui.components.LoadingState
import lingcat.classes.Classes.IChat

/**
 * 对话设定页。
 *
 * 入口在对话信息面板里的「对话设定」。群组资料与入群方式和 Web 端保持一致，
 * 每次修改都会立刻保存，没有单独的“保存”按钮。
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChatSettingsScreen(
    chatId: String,
    onBack: () -> Unit,
    viewModel: ChatSettingsViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    val context = LocalContext.current

    var editingField by remember { mutableStateOf<ChatProfileField?>(null) }

    LaunchedEffect(chatId) {
        viewModel.init(chatId)
    }
    LaunchedEffect(uiState.errorMsg) {
        uiState.errorMsg?.let {
            Feedback.show(it)
            viewModel.clearMessages()
        }
    }
    // 已经显示过内容后再刷新失败时，错误页会把内容盖掉，这里改用 Snackbar 提示。
    LaunchedEffect(uiState.loadError) {
        if (uiState.chat != null) {
            uiState.loadError?.let { Feedback.show(it) }
        }
    }
    LaunchedEffect(uiState.successMsg) {
        uiState.successMsg?.let {
            Feedback.show(it)
            viewModel.clearMessages()
        }
    }

    val avatarPicker = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri ->
        if (uri != null) viewModel.uploadAvatar(context, uri)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.chat_settings_title)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = stringResource(R.string.action_back),
                        )
                    }
                },
                actions = {
                    if (uiState.isSavingSettings || uiState.isSavingProfile || uiState.isUploadingAvatar) {
                        CircularProgressIndicator(
                            modifier = Modifier
                                .padding(end = 16.dp)
                                .size(20.dp),
                            strokeWidth = 2.dp,
                        )
                    }
                },
            )
        }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            val chat = uiState.chat
            when {
                uiState.isLoading && chat == null -> {
                    LoadingState(
                        modifier = Modifier.align(Alignment.Center),
                        label = stringResource(R.string.chat_settings_loading),
                    )
                }

                uiState.loadError != null && chat == null -> {
                    ErrorState(
                        message = uiState.loadError!!.asString(),
                        onRetry = viewModel::reload,
                        modifier = Modifier.align(Alignment.Center),
                    )
                }

                chat != null -> {
                    ChatSettingsContent(
                        chat = chat,
                        uiState = uiState,
                        onPickAvatar = {
                            if (uiState.canEditInfo && !uiState.isUploadingAvatar) {
                                avatarPicker.launch("image/*")
                            }
                        },
                        onEditField = { editingField = it },
                        onToggleJoin = viewModel::setAllowJoin,
                        onToggleMeeting = viewModel::setAllowMeeting,
                    )
                }
            }
        }
    }

    editingField?.let { field ->
        val chat = uiState.chat
        if (chat != null) {
            ChatProfileFieldDialog(
                field = field,
                chat = chat,
                onDismiss = { editingField = null },
                onConfirm = { value ->
                    editingField = null
                    viewModel.updateProfile(field, value)
                },
            )
        }
    }
}

@Composable
private fun ChatSettingsContent(
    chat: IChat,
    uiState: ChatSettingsUiState,
    onPickAvatar: () -> Unit,
    onEditField: (ChatProfileField) -> Unit,
    onToggleJoin: (Boolean) -> Unit,
    onToggleMeeting: (Boolean) -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(bottom = 24.dp)
    ) {
        // ==========================================
        // 群组头像
        // ==========================================
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(contentAlignment = Alignment.Center) {
                LingCatAvatar(
                    avatarHash = chat.avatarFileHash,
                    size = 96.dp,
                    contentDescription = stringResource(R.string.label_avatar),
                    onClick = if (uiState.canEditInfo) onPickAvatar else null,
                )
                if (uiState.isUploadingAvatar) {
                    CircularProgressIndicator(modifier = Modifier.size(32.dp))
                }
            }
            if (uiState.canEditInfo) {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = stringResource(R.string.chat_settings_change_avatar),
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        // ==========================================
        // 群组资料（需要 edit_info）
        // ==========================================
        if (uiState.canEditInfo) {
            SettingsSectionHeader(R.string.chat_settings_section_profile)

            LingCatActionItem(
                icon = Icons.Default.Title,
                title = stringResource(R.string.chat_settings_edit_title),
                subtitle = chat.title.ifBlank { stringResource(R.string.chat_settings_not_set) },
                enabled = !uiState.isSavingProfile,
                onClick = { onEditField(ChatProfileField.TITLE) },
            )
            LingCatActionItem(
                icon = Icons.Default.Description,
                title = stringResource(R.string.chat_settings_edit_description),
                subtitle = chat.description.ifBlank { stringResource(R.string.chat_settings_not_set) },
                enabled = !uiState.isSavingProfile,
                onClick = { onEditField(ChatProfileField.DESCRIPTION) },
            )
            LingCatActionItem(
                icon = Icons.Default.AlternateEmail,
                title = stringResource(R.string.chat_settings_edit_unique),
                subtitle = chat.chatUnique.ifBlank { stringResource(R.string.chat_settings_not_set) },
                enabled = !uiState.isSavingProfile,
                onClick = { onEditField(ChatProfileField.UNIQUE) },
            )
        }

        // ==========================================
        // 入群设置（需要 edit_settings）
        // ==========================================
        if (uiState.canEditSettings) {
            SettingsSectionHeader(R.string.chat_settings_section_join)

            SettingsSwitchItem(
                title = stringResource(R.string.chat_settings_allow_join),
                description = stringResource(R.string.chat_settings_allow_join_desc),
                checked = uiState.allowJoin,
                enabled = !uiState.isSavingSettings,
                onCheckedChange = onToggleJoin,
            )
            SettingsSwitchItem(
                title = stringResource(R.string.chat_settings_allow_meeting),
                description = stringResource(R.string.chat_settings_allow_meeting_desc),
                checked = uiState.allowMeeting,
                enabled = !uiState.isSavingSettings,
                onCheckedChange = onToggleMeeting,
            )
        }

        if (!uiState.canEditInfo && !uiState.canEditSettings) {
            Text(
                text = stringResource(R.string.chat_settings_readonly),
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(24.dp),
            )
        }
    }
}

@Composable
private fun SettingsSectionHeader(@StringRes titleRes: Int) {
    Text(
        text = stringResource(titleRes),
        style = MaterialTheme.typography.titleSmall,
        fontWeight = FontWeight.Medium,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 16.dp, end = 16.dp, top = 16.dp, bottom = 4.dp),
    )
}

@Composable
private fun SettingsSwitchItem(
    title: String,
    description: String,
    checked: Boolean,
    enabled: Boolean,
    onCheckedChange: (Boolean) -> Unit,
) {
    ListItem(
        headlineContent = {
            Text(
                text = title,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
            )
        },
        supportingContent = {
            Text(
                text = description,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        },
        trailingContent = {
            Switch(
                checked = checked,
                onCheckedChange = null,
                enabled = enabled,
            )
        },
        colors = ListItemDefaults.colors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier
            .fillMaxWidth()
            .toggleable(
                value = checked,
                enabled = enabled,
                role = Role.Switch,
                onValueChange = onCheckedChange,
            ),
    )
}

@Composable
private fun ChatProfileFieldDialog(
    field: ChatProfileField,
    chat: IChat,
    onDismiss: () -> Unit,
    onConfirm: (String) -> Unit,
) {
    val initialValue = when (field) {
        ChatProfileField.TITLE -> chat.title
        ChatProfileField.DESCRIPTION -> chat.description
        ChatProfileField.UNIQUE -> chat.chatUnique
    }
    val titleRes = when (field) {
        ChatProfileField.TITLE -> R.string.chat_settings_edit_title
        ChatProfileField.DESCRIPTION -> R.string.chat_settings_edit_description
        ChatProfileField.UNIQUE -> R.string.chat_settings_edit_unique
    }
    val labelRes = when (field) {
        ChatProfileField.TITLE -> R.string.label_title
        ChatProfileField.DESCRIPTION -> R.string.label_description
        ChatProfileField.UNIQUE -> R.string.label_unique
    }

    var value by remember(field, chat.id) { mutableStateOf(initialValue) }
    val canConfirm = value.isNotBlank()

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(titleRes)) },
        text = {
            OutlinedTextField(
                value = value,
                onValueChange = { value = it },
                label = { Text(stringResource(labelRes)) },
                singleLine = field != ChatProfileField.DESCRIPTION,
                maxLines = if (field == ChatProfileField.DESCRIPTION) 4 else 1,
                modifier = Modifier.fillMaxWidth(),
            )
        },
        confirmButton = {
            TextButton(onClick = { onConfirm(value) }, enabled = canConfirm) {
                Text(stringResource(R.string.action_save))
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text(stringResource(R.string.action_cancel))
            }
        },
    )
}
