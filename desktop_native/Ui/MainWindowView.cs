using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using LingCat_Desktop.Services;
using LingCat_Desktop.Ui.Components;
using MewUI.Material.Controls;
using MewUI.Material.Themes;

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
    private bool _loadingChats;
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

    public void Start() => _ = RefreshChatsAsync();

    public void Stop()
    {
        _lifetime.Cancel();
        _accountDialog?.Close();
    }

    private async Task RefreshChatsAsync()
    {
        if (_loadingChats || _lifetime.IsCancellationRequested) return;
        _loadingChats = true;
        _chatList?.SetStatus(_chatStatus = "正在加载对话…");
        try
        {
            var chats = await _chatService.GetChatsAsync(_lifetime.Token).ConfigureAwait(false);
            UiThread.Post(() =>
            {
                if (_lifetime.IsCancellationRequested) return;
                _loadingChats = false;
                var existing = _chats.ToDictionary(chat => chat.Id);
                _chats.Clear();
                foreach (var fresh in chats)
                {
                    if (!existing.TryGetValue(fresh.Id, out var chat)) chat = fresh;
                    else if (!chat.Sending) { chat.Snippet = fresh.Snippet; chat.Time = fresh.Time; }
                    chat.IsFavourite = fresh.IsFavourite;
                    _chats.Add(chat);
                }
                _chatList?.SetStatus(_chatStatus = null);
                _chatList?.SetChats(_chats);
                var target = _chats.FirstOrDefault(chat => chat.Id == _selectedChatId)
                    ?? _chats.FirstOrDefault(chat => _scope == ChatListScope.All || chat.IsFavourite);
                if (target != null) _chatList?.SelectChat(target.Id);
                else { _selectedChatId = null; _chatPage?.SetChat(null); }
            });
        }
        catch (Exception ex)
        {
            UiThread.Post(() =>
            {
                if (_lifetime.IsCancellationRequested) return;
                _loadingChats = false;
                _chatList?.SetStatus(_chatStatus = $"加载对话失败：{ex.Message}");
            });
        }
    }

    private async Task LoadHistoryAsync(ChatSummary chat)
    {
        if (chat.HistoryLoading || _lifetime.IsCancellationRequested) return;
        chat.HistoryLoading = true;
        chat.HistoryError = null;
        UpdatePage(chat);
        try
        {
            var messages = await _chatService.GetMessagesAsync(chat.Id).ConfigureAwait(false);
            UiThread.Post(() =>
            {
                if (_lifetime.IsCancellationRequested) return;
                // Preserve a just-sent message if this request's snapshot predates it.
                uint latest = messages.Count == 0 ? 0 : messages[^1].Id;
                var newer = chat.Messages.Where(message => message.Id > latest).ToArray();
                chat.Messages.Clear();
                chat.Messages.AddRange(messages);
                chat.Messages.AddRange(newer);
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
                if (chat.Messages.All(existing => existing.Id != message.Id))
                {
                    var index = chat.Messages.FindIndex(existing => existing.Id > message.Id);
                    chat.Messages.Insert(index < 0 ? chat.Messages.Count : index, message);
                }
                chat.Snippet = chat.Messages[^1].Text;
                chat.Time = chat.Messages[^1].Time;
                if (chat.Draft == sentDraft) chat.Draft = string.Empty;
                chat.Sending = false;
                UpdatePage(chat);
                _chatList?.Refresh();
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
