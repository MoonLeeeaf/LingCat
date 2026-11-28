using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using LingCat.ClientProtocol.Client;
using LingCat_Desktop.Services;
using LingCat_Desktop.Ui.Components;
using MewUI.Material.Controls;
using MewUI.Material.Themes;
using Proto = Lingcat.Methods;

namespace LingCat_Desktop.Ui;

/// <summary>
/// 主窗口三段式布局：导航栏 / 对话列表 / 聊天页。
/// Material 控件自行换色；仅刷新聊天等业务专属视觉。
/// </summary>
internal sealed class MainWindowView : Grid
{
    private readonly AuthSession _auth;
    private readonly Action<StoredSession> _onSwitchAccount;
    private readonly Action _onAddAccount;
    private readonly Action _onLogout;
    private readonly List<ChatSummary> _chats = [];
    private readonly ChatService _chatService;
    private readonly CancellationTokenSource _lifetime = new();
    private IDisposable? _connectionSubscription;
    private bool _needsAuthorization;
    private bool _authorizing;
    private bool _loadingChats;
    private bool _refreshPending;
    private string? _chatStatus;

    private SidebarView? _sidebar;
    private ChatListPane? _chatList;
    private ChatPageView? _chatPage;
    private Window? _accountDialog;
    private AccountPanelView? _accountPanel;
    private ChatListScope _scope = ChatListScope.All;
    private string? _selectedChatId;
    private bool _appearanceOpen;

    public MainWindowView(
        AuthSession auth,
        Action<StoredSession> onSwitchAccount,
        Action onAddAccount,
        Action onLogout)
    {
        _auth = auth;
        _chatService = new ChatService(auth);
        _onSwitchAccount = onSwitchAccount;
        _onAddAccount = onAddAccount;
        _onLogout = onLogout;

        this.Columns("80,0,320,0,*");
        BuildTree();
    }

    public void Start()
    {
        if (_connectionSubscription is not null || _lifetime.IsCancellationRequested) return;
        _auth.Client.AddOnReceiveListener(OnPackage);
        _connectionSubscription = _auth.Client.SubscribeConnectionState(() =>
        {
            bool disconnected = !_auth.Client.IsConnected;
            UiThread.Post(() =>
            {
                if (disconnected) _needsAuthorization = true;
                OnConnectionChanged();
            });
        });
        _ = PollChatsAsync(_lifetime.Token);
        OnConnectionChanged();
    }

    public void Stop()
    {
        _lifetime.Cancel();
        _auth.Client.RemoveOnReceiveListener(OnPackage);
        _connectionSubscription?.Dispose();
        _connectionSubscription = null;
        _accountDialog?.Close();
    }

    private async Task PollChatsAsync(CancellationToken token)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(30));
        try
        {
            while (await timer.WaitForNextTickAsync(token).ConfigureAwait(false))
                UiThread.Post(OnConnectionChanged);
        }
        catch (OperationCanceledException) when (token.IsCancellationRequested) { }
    }

    private void OnConnectionChanged()
    {
        if (_lifetime.IsCancellationRequested) return;
        if (!_auth.Client.IsConnected) { _needsAuthorization = true; return; }
        if (_needsAuthorization) _ = RestoreEventSubscriptionAsync();
        else _ = RefreshChatsAsync();
    }

    private async Task RestoreEventSubscriptionAsync()
    {
        if (_authorizing) return;
        _authorizing = true;
        bool authorized = false;
        try
        {
            await UserApi.AuthorizeAsync(_auth.Client, new(_auth.Stored.Token, _auth.ConnectionSessionId)).ConfigureAwait(false);
            authorized = true;
        }
        catch (Exception ex) { System.Diagnostics.Trace.TraceWarning("聊天事件订阅恢复失败：{0}", ex.Message); }
        finally
        {
            UiThread.Post(() =>
            {
                _authorizing = false;
                if (_lifetime.IsCancellationRequested || !authorized || !_auth.Client.IsConnected) return;
                _needsAuthorization = false;
                _ = RefreshChatsAsync();
                if (_chats.Find(chat => chat.Id == _selectedChatId) is { } selected) _ = LoadHistoryAsync(selected);
            });
        }
    }

    private void OnPackage(Package package)
    {
        switch (package.MethodId)
        {
            case Methods.Update_My_Chats_Event:
                UiThread.Post(() => _ = RefreshChatsAsync());
                break;
            case Methods.Receive_Chat_Message_Event:
                var msg = Proto.Receive_Chat_Message_Event.Parser.ParseFrom(package.Data).Msg;
                if (msg is null || msg.ChatId.Length == 0) return;
                var message = _chatService.ToMessage(msg.Id, msg.Text, msg.Time, msg.SenderUserId, msg.System);
                UiThread.Post(() =>
                {
                    if (_lifetime.IsCancellationRequested) return;
                    if (_chats.Find(chat => chat.Id == msg.ChatId) is { } chat) ReceiveMessage(chat, message, replace: true);
                    else _ = RefreshChatsAsync();
                });
                break;
            case Methods.Message_Edited_Event:
                var edit = Proto.Message_Edited_Event.Parser.ParseFrom(package.Data);
                UiThread.Post(() =>
                {
                    if (_lifetime.IsCancellationRequested || _chats.Find(chat => chat.Id == edit.ChatId) is not { } chat) return;
                    if (chat.LastMessageId == edit.Id) chat.LastMessageEdited = true;
                    if (chat.Messages.Find(message => message.Id == edit.Id) is { } existing)
                        ReceiveMessage(chat, existing with { Text = edit.Text }, replace: true);
                    else if (chat.LastMessageId == edit.Id)
                    {
                        chat.Snippet = edit.Text;
                        _chatList?.Refresh();
                    }
                });
                break;
        }
    }

    private async Task RefreshChatsAsync()
    {
        if (_lifetime.IsCancellationRequested || !_auth.Client.IsConnected || _needsAuthorization) return;
        if (_loadingChats) { _refreshPending = true; return; }
        _loadingChats = true;
        if (_chats.Count == 0) _chatList?.SetStatus(_chatStatus = "正在加载对话…");
        try
        {
            var chats = await _chatService.GetChatsAsync(_lifetime.Token).ConfigureAwait(false);
            UiThread.Post(() =>
            {
                if (_lifetime.IsCancellationRequested) return;
                _loadingChats = false;
                var existing = _chats.ToDictionary(chat => chat.Id);
                var previousOrder = _chats.ToArray();
                bool changed = _chatStatus is not null;
                _chats.Clear();
                foreach (var fresh in chats)
                {
                    if (!existing.TryGetValue(fresh.Id, out var chat)) chat = fresh;
                    else
                    {
                        changed |= chat.Title != fresh.Title || chat.AvatarText != fresh.AvatarText;
                        chat.Title = fresh.Title;
                        chat.AvatarText = fresh.AvatarText;
                        // The list endpoint may still return the original preview after an edit.
                        if (fresh.LastMessageId > chat.LastMessageId ||
                            (fresh.LastMessageId == chat.LastMessageId && !chat.LastMessageEdited))
                        {
                            changed |= chat.Snippet != fresh.Snippet || chat.Time != fresh.Time;
                            chat.Snippet = fresh.Snippet;
                            chat.Time = fresh.Time;
                            chat.LastMessageId = fresh.LastMessageId;
                            chat.LastMessageEdited = false;
                        }
                    }
                    changed |= chat.IsFavourite != fresh.IsFavourite;
                    chat.IsFavourite = fresh.IsFavourite;
                    _chats.Add(chat);
                }
                if (_chatStatus is not null) _chatList?.SetStatus(_chatStatus = null);
                if (changed || !previousOrder.SequenceEqual(_chats)) _chatList?.SetChats(_chats);
                var target = _chats.FirstOrDefault(chat => chat.Id == _selectedChatId)
                    ?? _chats.FirstOrDefault(chat => _scope == ChatListScope.All || chat.IsFavourite);
                if (target != null)
                {
                    if (target.Id != _selectedChatId) _chatList?.SelectChat(target.Id);
                    else
                    {
                        if (changed) UpdatePage(target);
                        if (target.LastMessageId > (target.Messages.LastOrDefault()?.Id ?? 0) || target.HistoryError is not null)
                            _ = LoadHistoryAsync(target);
                    }
                }
                else { _selectedChatId = null; _chatPage?.SetChat(null); }
                if (_refreshPending) { _refreshPending = false; _ = RefreshChatsAsync(); }
            });
        }
        catch (Exception ex)
        {
            UiThread.Post(() =>
            {
                if (_lifetime.IsCancellationRequested) return;
                _loadingChats = false;
                if (_chats.Count == 0) _chatList?.SetStatus(_chatStatus = $"加载对话失败：{ex.Message}");
                if (_refreshPending) { _refreshPending = false; _ = RefreshChatsAsync(); }
            });
        }
    }

    private async Task LoadHistoryAsync(ChatSummary chat)
    {
        if (chat.HistoryLoading || _lifetime.IsCancellationRequested) return;
        chat.HistoryLoading = true;
        chat.HistoryError = null;
        var beforeRequest = chat.Messages.ToDictionary(message => message.Id);
        UpdatePage(chat);
        try
        {
            var messages = await _chatService.GetMessagesAsync(chat.Id).ConfigureAwait(false);
            UiThread.Post(() =>
            {
                if (_lifetime.IsCancellationRequested) return;
                // Keep pushes that arrived while this history request was in flight.
                var merged = messages.ToDictionary(message => message.Id);
                foreach (var message in chat.Messages)
                    if (!beforeRequest.TryGetValue(message.Id, out var previous) || !ReferenceEquals(previous, message))
                        merged[message.Id] = message;
                chat.Messages.Clear();
                chat.Messages.AddRange(merged.Values.OrderBy(message => message.Id).TakeLast(50));
                chat.HistoryLoading = false;
                UpdatePage(chat);
            });
        }
        catch (Exception ex)
        {
            UiThread.Post(() =>
            {
                if (_lifetime.IsCancellationRequested) return;
                chat.HistoryLoading = false;
                chat.HistoryError = $"加载消息失败：{ex.Message}";
                UpdatePage(chat);
            });
        }
    }

    private async Task SendAsync(ChatSummary chat, string text)
    {
        if (chat.Sending || _lifetime.IsCancellationRequested) return;
        var sentDraft = chat.Draft;
        chat.Sending = true;
        chat.SendError = null;
        UpdatePage(chat);
        try
        {
            var message = await _chatService.SendAsync(chat.Id, text).ConfigureAwait(false);
            UiThread.Post(() =>
            {
                if (_lifetime.IsCancellationRequested) return;
                if (chat.Draft == sentDraft) chat.Draft = string.Empty;
                chat.Sending = false;
                ReceiveMessage(chat, message, replace: false);
            });
        }
        catch (Exception ex)
        {
            UiThread.Post(() =>
            {
                if (_lifetime.IsCancellationRequested) return;
                chat.Sending = false;
                chat.SendError = $"发送失败：{ex.Message}";
                UpdatePage(chat);
            });
        }
    }

    private void ReceiveMessage(ChatSummary chat, ChatMessage message, bool replace)
    {
        int index = chat.Messages.FindIndex(existing => existing.Id >= message.Id);
        if (index < 0) chat.Messages.Add(message);
        else if (chat.Messages[index].Id != message.Id) chat.Messages.Insert(index, message);
        else if (replace && chat.Messages[index] != message) chat.Messages[index] = message;

        if (_selectedChatId != chat.Id && !chat.HistoryLoading && chat.Messages.Count > 50)
            chat.Messages.RemoveRange(0, chat.Messages.Count - 50);

        if (message.Id >= chat.LastMessageId)
        {
            var latest = chat.Messages[^1];
            if (latest.Id != chat.LastMessageId) chat.LastMessageEdited = false;
            chat.LastMessageId = latest.Id;
            chat.Snippet = latest.Text;
            chat.Time = latest.Time;
            _chatList?.Refresh();
        }
        UpdatePage(chat);
    }

    private void UpdatePage(ChatSummary chat)
    {
        if (_selectedChatId == chat.Id) _chatPage?.SetChat(chat);
    }

    public void ApplyTheme()
    {
        _sidebar?.ApplyTheme();
        _chatList?.ApplyTheme();
        _chatPage?.ApplyTheme();
    }

    public void ShowAccountError(string message)
    {
        if (_accountPanel is { } panel) panel.SetError(message);
        else ShowAccountDialog(message);
    }

    private void BuildTree()
    {
        var selectedChatId = _selectedChatId;

        var sidebar = new SidebarView(_auth);
        var chatList = new ChatListPane();
        var chatPage = new ChatPageView();

        _sidebar = sidebar;
        _chatList = chatList;
        _chatPage = chatPage;

        sidebar.ScopeChanged += scope =>
        {
            _scope = scope;
            chatList.SetScope(scope);
        };
        sidebar.AccountRequested += () => ShowAccountDialog();
        sidebar.SettingsRequested += ShowAppearanceSettings;
        chatList.ChatSelected += chat =>
        {
            _selectedChatId = chat.Id;
            chatPage.SetChat(chat);
            _ = LoadHistoryAsync(chat);
        };
        chatPage.SendRequested += (chat, text) => _ = SendAsync(chat, text);
        chatPage.RefreshRequested += () => _ = RefreshChatsAsync();

        Clear();
        Add(sidebar.Root.GridPosition(0, 0));
        Add(UiFactory.DividerLine(true).GridPosition(0, 1));
        Add(chatList.Root.GridPosition(0, 2));
        Add(UiFactory.DividerLine(true).GridPosition(0, 3));
        Add(chatPage.Root.GridPosition(0, 4));

        chatList.SetChats(_chats);
        chatList.SetStatus(_chatStatus);
        sidebar.SetScope(_scope);

        var target = _chats.FirstOrDefault(chat => chat.Id == selectedChatId)
            ?? _chats.FirstOrDefault(chat => _scope == ChatListScope.All || chat.IsFavourite);

        if (target is not null)
        {
            chatList.SelectChat(target.Id);
        }
    }

    private void ShowAppearanceSettings()
    {
        if (_appearanceOpen || FindVisualRoot() is not Window owner) return;
        _appearanceOpen = true;
        var dialog = new Window { Title = "外观设置", Padding = Thickness.Zero };
        dialog.Resizable(400, 310, 340, 280, 700, 600);
        var modes = new MaterialNavigation(MaterialNavigationLayout.Tabs);
        modes.AddDestination("跟随系统");
        modes.AddDestination("浅色");
        modes.AddDestination("深色");
        modes.SelectedIndex = MaterialThemeManager.Mode switch { ThemeVariant.Light => 1, ThemeVariant.Dark => 2, _ => 0 };
        modes.SelectionChanged += index => MaterialThemeManager.SetMode(index switch { 1 => ThemeVariant.Light, 2 => ThemeVariant.Dark, _ => ThemeVariant.System });
        var motion = new MaterialCheckBox { Content = new Label().Text("减少动态效果"), IsChecked = !MaterialThemeManager.MotionEnabled };
        motion.CheckedChanged += value => MaterialThemeManager.SetMotionEnabled(value != true);
        dialog.PreviewKeyDown += e => { if (e.Key == Key.Escape) { e.Handled = true; dialog.Close(); } };
        dialog.Content = new MaterialSurface
        {
            Variant = MaterialSurfaceVariant.Dialog,
            CornerRadius = 0,
            Padding = new Thickness(24),
            Content = new StackPanel().Spacing(12).Children(new Label().Text("外观设置").FontSize(UiTheme.Type.HeadlineSmall.FontSize), modes, motion),
        };
        try
        {
            dialog.ShowDialog(owner);
        }
        finally { _appearanceOpen = false; }
    }

    private void ShowAccountDialog(string? error = null)
    {
        if (_accountDialog is not null || _lifetime.IsCancellationRequested || FindVisualRoot() is not Window owner) return;

        var panel = new AccountPanelView(_auth, error);
        var dialog = new Window
        {
            Title = "账号管理",
            StartupLocation = WindowStartupLocation.CenterOwner,
            Padding = Thickness.Zero,
            Content = panel.Root,
        };
        dialog.Resizable(400, 520, 340, 360, 700, 800);
        dialog.PreviewKeyDown += e => { if (e.Key == Key.Escape) { e.Handled = true; dialog.Close(); } };

        Action? onClose = null;
        void SelectAction(Action action)
        {
            onClose = action;
            dialog.Close();
        }
        panel.SwitchRequested += session => SelectAction(() => _onSwitchAccount(session));
        panel.AddAccountRequested += () => SelectAction(_onAddAccount);
        panel.LogoutRequested += () => SelectAction(_onLogout);

        _accountDialog = dialog;
        _accountPanel = panel;
        try { dialog.ShowDialog(owner); }
        finally
        {
            _accountDialog = null;
            _accountPanel = null;
        }

        if (_lifetime.IsCancellationRequested) return;
        _sidebar?.FocusAccountButton();
        onClose?.Invoke();
    }
}
