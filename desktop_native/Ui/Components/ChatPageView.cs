using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Resources;
using LingCat.ClientProtocol.Client;
using LingCat_Desktop.Services;
using MewUI.Material.Controls;
using MewUI.Material.Themes;
using MaterialIconButton = MewUI.Material.Controls.IconButton;

namespace LingCat_Desktop.Ui.Components;

internal sealed class ChatPageView
{
    private const double FollowThreshold = 16;
    private readonly TextBlock _title = new() { TextTrimming = TextTrimming.CharacterEllipsis };
    private readonly MessageStack _messages = new() { Spacing = 4, Padding = new Thickness(16, 12, 16, 12) };
    private readonly ScrollViewer _scroll;
    private readonly MultiLineTextBox _editor;
    private readonly Label _status = new Label().TextWrapping(TextWrapping.Wrap).Margin(4, 0, 4, 4);
    private readonly MaterialProgressBar _progress = new() { IsVisible = false, Height = 4 };
    private readonly Button _send;
    private readonly Button _latest;
    private readonly Button _older;
    private readonly Button _info;
    private readonly AuthSession _auth;
    private readonly ChatService _chatService;
    private readonly List<(SimpleSvgSource Source, Button Button)> _icons = [];
    private ChatSummary? _chat;
    private ChatMessage[] _rendered = [];
    private string? _renderedPeerAvatar;
    private bool _wasLoading;
    private bool _hadHistoryError;
    private bool _scrollQueued;
    private double? _requestedOffset;
    private (uint Id, double ViewportY)? _prependAnchor;
    private uint? _requestedMessage;
    private readonly Dictionary<uint, UIElement> _messageRows = [];
    private double _lastScrollOffset;

    public ChatPageView(AuthSession auth, ChatService chatService)
    {
        _auth = auth;
        _chatService = chatService;
        _scroll = new ScrollViewer().VerticalScroll(ScrollMode.Auto).HorizontalScroll(ScrollMode.Disabled).Content(_messages);
        _scroll.ScrollChanged += OnScrollChanged;
        _messages.Arranged = QueueRequestedScroll;
        _latest = Icon("ic_arrow_downward.svg", "回到最新消息", filled: true)
            .HorizontalAlignment(HorizontalAlignment.Right).VerticalAlignment(VerticalAlignment.Bottom)
            .Margin(0, 0, 22, 10).OnClick(ScrollToLatest);
        _latest.IsVisible = false;
        _older = new TextButton().Content("加载更早消息").HorizontalAlignment(HorizontalAlignment.Center);
        _older.Click += RequestOlder;

        _editor = new MultiLineTextBox().Placeholder("输入...").Wrap(true)
            .MinHeight(48).MaxHeight(168).Padding(4, 12);
        _editor.SizeToDocument = true;
        _editor.TextChanged += text =>
        {
            if (_chat is not null) _chat.Draft = text;
            UpdateSendButton();
        };
        _editor.KeyDown += e =>
        {
            if (e.Handled || e.Key != Key.Enter || !e.PrimaryKey) return;
            e.Handled = true;
            SendCurrentMessage();
        };

        _send = Icon("ic_send.svg", "发送（Ctrl+Enter）").OnClick(SendCurrentMessage);
        _info = Icon("ic_info.svg", "对话资料").OnClick(() =>
        {
            if (_chat is { } chat) ChatProfileRequested?.Invoke(chat);
        });

        Root = new MaterialSurface
        {
            Variant = MaterialSurfaceVariant.ElevatedCard,
            Padding = new Thickness(0),
            Content = new Grid().Rows("Auto,1,*,Auto").Children(
                BuildHeader().GridPosition(0, 0),
                UiFactory.DividerLine(false).GridPosition(1, 0),
                new Grid().Rows("*").Columns("*").Children(_scroll, _latest).GridPosition(2, 0),
                BuildComposer().GridPosition(3, 0)),
        };
        ApplyThemeCore();
        SetChat(null);
    }

    public MaterialSurface Root { get; }
    public event Action<ChatSummary, string>? SendRequested;
    public event Action<ChatSummary>? ChatProfileRequested;
    public event Action<string>? UserProfileRequested;
    public event Action<string>? ChatMentionRequested;
    public event Action<ChatSummary>? LoadOlderRequested;
    public event Action<ChatSummary>? LoadLatestRequested;
    public event Action<ChatSummary, uint>? JumpToMessageRequested;

    public void SetChat(ChatSummary? chat)
    {
        bool switched = !ReferenceEquals(_chat, chat);
        if (switched)
        {
            _prependAnchor = null;
            _requestedMessage = null;
        }
        bool follow = switched || _requestedOffset == double.MaxValue || DistanceFromBottom <= FollowThreshold;
        double offset = _requestedOffset ?? _scroll.VerticalOffset;
        _chat = chat;
        var draft = chat?.Draft ?? string.Empty;
        if (_editor.Text != draft) _editor.Text = draft;
        UpdateAppearance();

        var messages = chat?.Messages;
        bool loading = chat?.HistoryLoading == true;
        bool historyError = chat?.HistoryError is not null;
        if (switched || chat?.AvatarFileHash != _renderedPeerAvatar || _messages.Children.Count == 0 || loading != _wasLoading || historyError != _hadHistoryError ||
            (messages is not null && !messages.SequenceEqual(_rendered)))
        {
            if (!switched && _rendered.Length > 0 && messages is { Count: > 0 } &&
                messages[0].Id < _rendered[0].Id && messages.Any(message => message.Id == _rendered[0].Id))
            {
                var firstVisible = _rendered.FirstOrDefault(message => _messageRows.TryGetValue(message.Id, out var row) &&
                    row.Bounds.Bottom > _messages.Bounds.Y + _scroll.VerticalOffset);
                if (firstVisible is not null && _messageRows.TryGetValue(firstVisible.Id, out var row))
                    _prependAnchor = (firstVisible.Id, row.Bounds.Y - _messages.Bounds.Y - _scroll.VerticalOffset);
            }
            _rendered = messages?.ToArray() ?? [];
            _renderedPeerAvatar = chat?.AvatarFileHash;
            _wasLoading = loading;
            _hadHistoryError = historyError;
            RenderMessages(follow ? double.MaxValue : offset);
        }
    }

    public void ApplyTheme()
    {
        ApplyThemeCore();
        UpdateAppearance();
        RefreshDisplayNames();
    }

    public void RefreshDisplayNames()
    {
        _title.Text = _chat is { } chat ? _auth.Profiles.ChatTitle(chat) : "选择一个对话";
        RenderMessages(_requestedOffset ?? (DistanceFromBottom <= FollowThreshold ? double.MaxValue : _scroll.VerticalOffset));
    }

    private Grid BuildHeader() => new Grid().Columns("*,Auto").MinHeight(56).Padding(16, 4, 8, 4).Children(
        _title.VerticalAlignment(VerticalAlignment.Center).GridPosition(0, 0),
        _info.VerticalAlignment(VerticalAlignment.Center).GridPosition(0, 1));

    private StackPanel BuildComposer()
    {
        var mic = UnavailableIcon("ic_mic.svg", "录制语音");
        var mood = UnavailableIcon("ic_mood.svg", "贴纸");
        var attachment = UnavailableIcon("ic_attachment.svg", "添加附件");
        var actions = new StackPanel().Horizontal().Children(mood, attachment, _send)
            .VerticalAlignment(VerticalAlignment.Bottom).Margin(0, 0, 0, 4);
        var contents = new Grid().Columns("Auto,*,Auto").Children(
            mic.VerticalAlignment(VerticalAlignment.Bottom).Margin(0, 0, 0, 4).GridPosition(0, 0),
            _editor.GridPosition(0, 1),
            actions.GridPosition(0, 2));
        return new StackPanel().Padding(8, 4, 8, 8).Children(
            _progress, _status, UiFactory.EditorSurface(_editor, contents));
    }

    private MaterialButton Icon(string fileName, string tooltip, bool filled = false)
    {
        MaterialButton button = filled ? new FilledIconButton() : new MaterialIconButton();
        var source = IconAssets.Load(fileName, UiTheme.TextSecondary);
        button.Content = IconAssets.Create(source, 22);
        _icons.Add((source, button));
        return button.Width(40).Height(40).ToolTip(tooltip);
    }

    private Button UnavailableIcon(string fileName, string tooltip)
    {
        var button = Icon(fileName, $"{tooltip}（原生端暂未支持）");
        button.IsEnabled = false;
        return button;
    }

    private void ApplyThemeCore()
    {
        _title.FontSize = UiTheme.Type.TitleMedium.FontSize;
        _title.Foreground = UiTheme.Text;
        _status.FontSize = UiTheme.Type.BodySmall.FontSize;
        UpdateIconColors();
    }

    private void UpdateAppearance()
    {
        _title.Text = _chat is { } chat ? _auth.Profiles.ChatTitle(chat) : "选择一个对话";
        _editor.IsEnabled = _info.IsEnabled = _chat is not null;
        var error = _chat?.SendError ?? _chat?.HistoryError;
        _status.Text = error ?? (_chat?.Sending == true ? "正在发送…" : string.Empty);
        _status.IsVisible = _status.Text.Length != 0;
        _status.Foreground = error is null ? UiTheme.TextSecondary : UiTheme.Danger;
        _progress.IsVisible = _progress.IsIndeterminate = _chat?.Sending == true;
        _older.IsVisible = _chat?.HasOlderMessages == true;
        _older.IsEnabled = _chat?.HistoryLoading != true;
        _latest.IsEnabled = _chat?.HistoryLoading != true;
        UpdateLatestButton();
        UpdateSendButton();
    }

    private void UpdateSendButton()
    {
        _send.IsEnabled = _chat is { Sending: false } && !string.IsNullOrWhiteSpace(_editor.Text);
        UpdateIconColors();
    }

    private void UpdateIconColors()
    {
        foreach (var (source, button) in _icons)
            source.Tint = !button.IsEnabled ? UiTheme.Text.WithAlpha(97) :
                ReferenceEquals(button, _latest) ? UiTheme.OnAccent :
                ReferenceEquals(button, _send) ? UiTheme.Accent : UiTheme.TextSecondary;
    }

    private void RenderMessages(double offset)
    {
        _requestedOffset = offset;
        _messages.Clear();
        _messageRows.Clear();
        _messages.Add(_older);
        if (_rendered.Length == 0)
        {
            if (_wasLoading)
                _messages.Add(new MaterialProgressBar { IsIndeterminate = true, Width = 120, Margin = new Thickness(0, 28, 0, 0), HorizontalAlignment = HorizontalAlignment.Center });
            else if (!_hadHistoryError)
                _messages.Add(new Label().Text(_chat is null ? "从左侧选择一个对话" : "还没有消息")
                    .Foreground(UiTheme.TextMuted).Margin(0, 28, 0, 0).HorizontalAlignment(HorizontalAlignment.Center));
        }

        var renderedChat = _chat;
        var richContent = new RichMessageContent(_auth, _chatService, renderedChat,
            id => UserProfileRequested?.Invoke(id), id => ChatMentionRequested?.Invoke(id), id =>
            {
                if (renderedChat is not null && ReferenceEquals(_chat, renderedChat)) JumpToMessageRequested?.Invoke(renderedChat, id);
            });
        ChatMessage? previous = null;
        foreach (var message in _rendered)
        {
            bool showTime = previous?.Time != message.Time;
            if (showTime && !string.IsNullOrEmpty(message.Time))
                _messages.Add(new Label().Text(message.Time).FontSize(UiTheme.Type.BodySmall.FontSize)
                    .Foreground(UiTheme.TextMuted).Margin(0, 12, 0, 6).HorizontalAlignment(HorizontalAlignment.Center));

            UIElement row = message.IsSystem
                ? new Border().Child(richContent.Build(message))
                    .Padding(10, 4).CornerRadius(10).Background(UiTheme.BubbleSystem)
                    .HorizontalAlignment(HorizontalAlignment.Center)
                : BuildMessage(message, richContent, showTime || previous is not { IsSystem: false } ||
                    previous.IsMine != message.IsMine || previous.Sender != message.Sender);
            _messageRows[message.Id] = row;
            _messages.Add(row);
            previous = message;
        }
    }

    private Grid BuildMessage(ChatMessage message, RichMessageContent richContent, bool showSender)
    {
        int column = message.IsMine ? 1 : 0;
        var side = message.IsMine ? HorizontalAlignment.Right : HorizontalAlignment.Left;
        var row = new Grid().Columns("*,*").Rows(showSender ? "Auto,Auto" : "Auto");
        if (showSender)
        {
            var sender = message.IsMine ? _auth.User.Nickname : _chat is { IsGroup: false } chat
                ? _auth.Profiles.ChatTitle(chat) : _auth.Profiles.GetRemark(message.Sender);
            if (string.IsNullOrWhiteSpace(sender)) sender = message.IsMine ? "我" : "未知用户";
            var hash = message.IsMine ? _auth.User.AvatarFileHash : _chat?.IsGroup == false ? _chat.AvatarFileHash : null;
            var profile = !message.IsMine && _chat?.IsGroup == true && !string.IsNullOrWhiteSpace(message.Sender)
                ? _auth.Profiles.GetUserAsync(message.Sender) : null;
            var avatar = new UserAvatar(hash, _auth, 40, profile).Root;
            UIElement avatarView = avatar;
            if (message.IsMine || !string.IsNullOrWhiteSpace(message.Sender))
            {
                avatarView = new MaterialIconButton { Content = avatar }.ToolTip("用户资料")
                    .OnClick(() => UserProfileRequested?.Invoke(message.IsMine ? string.Empty : message.Sender));
            }
            var name = new Label().Text(sender.Replace("_", "__")).FontSize(UiTheme.Type.LabelLarge.FontSize)
                .TextTrimming(TextTrimming.CharacterEllipsis).VerticalAlignment(VerticalAlignment.Center);
            if (profile is not null) _ = SetSenderNameAsync(name, profile);
            var author = message.IsMine
                ? new Grid().Columns("*,Auto").Children(
                    name.HorizontalAlignment(HorizontalAlignment.Right).Margin(0, 0, 8, 0).GridPosition(0, 0), avatarView.GridPosition(0, 1))
                : new Grid().Columns("Auto,*").Children(avatarView.GridPosition(0, 0), name.Margin(8, 0, 0, 0).GridPosition(0, 1));
            row.Add(author.Margin(0, 4, 0, 0).GridPosition(0, column));
        }

        var body = richContent.Build(message);
        var bubble = new MaterialSurface { Variant = MaterialSurfaceVariant.ElevatedCard, Content = body }
            .Padding(12, 8).HorizontalAlignment(side)
            .Margin(message.IsMine ? 0 : 48, 0, message.IsMine ? 48 : 0, 0)
            .ToolTip(message.Time);
        var copy = new Command("chat.copy-message", "复制消息");
        bubble.Commands.Register(copy, () => { Application.Current.PlatformServices.Clipboard?.TrySetText(
            message.Entities.Any(entity => entity.Type == "e2e") ? "[加密消息]" : message.Text); });
        var reply = new Command("chat.reply-message", "回复消息");
        var chatAtRender = _chat;
        bubble.Commands.Register(reply, () =>
        {
            if (chatAtRender is null || !ReferenceEquals(_chat, chatAtRender)) return;
            var prefix = FormattableString.Invariant($"[reply:{message.Id}]");
            _editor.Text = prefix + _editor.Text;
            _editor.Focus();
            _editor.CaretPosition = _editor.Text.Length;
        });
        bubble.ContextMenu(new ContextMenu().Item(reply).Item(copy));
        row.Add(bubble.GridPosition(showSender ? 1 : 0, column));
        return row;
    }

    private async Task SetSenderNameAsync(Label label, Task<User> profile)
    {
        User user;
        try { user = await profile.ConfigureAwait(false); }
        catch { return; } // Keep the remark or placeholder when the lookup fails.
        UiThread.Post(() =>
        {
            var name = _auth.Profiles.GetRemark(user.Id) ??
                (!string.IsNullOrWhiteSpace(user.Nickname) ? user.Nickname : user.Username);
            if (!string.IsNullOrWhiteSpace(name)) label.Text = name.Replace("_", "__");
        });
    }

    private double DistanceFromBottom => Math.Max(0, _messages.ActualHeight - _scroll.ViewportHeight - _scroll.VerticalOffset);

    private void UpdateLatestButton() => _latest.IsVisible = _chat?.InHistoryWindow == true ||
        (_rendered.Length != 0 && DistanceFromBottom > FollowThreshold);

    private void RequestOlder()
    {
        if (_chat is { HasOlderMessages: true, HistoryLoading: false } chat) LoadOlderRequested?.Invoke(chat);
    }

    private void OnScrollChanged()
    {
        var offset = _scroll.VerticalOffset;
        bool reachedTop = offset < _lastScrollOffset && offset <= FollowThreshold;
        _lastScrollOffset = offset;
        UpdateLatestButton();
        if (!reachedTop || _scrollQueued || _requestedOffset is not null || _requestedMessage is not null ||
            !Application.IsRunning || Application.Current?.Dispatcher is not { } dispatcher) return;
        var chat = _chat;
        dispatcher.BeginInvoke(() =>
        {
            if (ReferenceEquals(_chat, chat) && _scroll.VerticalOffset <= FollowThreshold) RequestOlder();
        });
    }

    private void ScrollToLatest()
    {
        if (_chat is { InHistoryWindow: true } chat) { LoadLatestRequested?.Invoke(chat); return; }
        _scroll.SetScrollOffsets(0, Math.Max(0, _messages.ActualHeight - _scroll.ViewportHeight));
        UpdateLatestButton();
    }

    public void RequestLatestScroll()
    {
        _prependAnchor = null;
        _requestedMessage = null;
        _requestedOffset = double.MaxValue;
        _messages.InvalidateArrange();
    }

    public void RequestMessageScroll(uint id)
    {
        _prependAnchor = null;
        _requestedMessage = id;
        _messages.InvalidateArrange();
    }

    private void QueueRequestedScroll()
    {
        // ScrollViewer clamps offsets to the measured extent, so wait until the new rows are arranged.
        if ((_requestedOffset is null && _requestedMessage is null) || _scrollQueued || !Application.IsRunning ||
            Application.Current?.Dispatcher is not { } dispatcher) return;
        _scrollQueued = true;
        dispatcher.BeginInvoke(() =>
        {
            var offset = _requestedOffset;
            var target = _requestedMessage;
            var anchor = _prependAnchor;
            _requestedOffset = null;
            _requestedMessage = null;
            _prependAnchor = null;
            try
            {
                if (Root.FindVisualRoot() is not Window) return;
                if (target is { } id && _messageRows.TryGetValue(id, out var row))
                    _scroll.SetScrollOffsets(0, Math.Max(0, row.Bounds.Y - _messages.Bounds.Y -
                        Math.Max(0, (_scroll.ViewportHeight - row.Bounds.Height) / 2)));
                else if (anchor is { } position && _messageRows.TryGetValue(position.Id, out var anchored))
                    _scroll.SetScrollOffsets(0, Math.Max(0, anchored.Bounds.Y - _messages.Bounds.Y - position.ViewportY));
                else if (offset == double.MaxValue)
                    _scroll.SetScrollOffsets(0, Math.Max(0, _messages.ActualHeight - _scroll.ViewportHeight));
                else if (offset is { } value) _scroll.SetScrollOffsets(0, value);
                UpdateLatestButton();
            }
            finally { _scrollQueued = false; }
        });
    }

    private void SendCurrentMessage()
    {
        if (_chat is not { Sending: false } chat || string.IsNullOrWhiteSpace(_editor.Text)) return;
        SendRequested?.Invoke(chat, _editor.Text.Trim());
    }

    private sealed class MessageStack : StackPanel
    {
        public Action? Arranged { get; set; }

        protected override void ArrangeContent(Rect bounds)
        {
            base.ArrangeContent(bounds);
            Arranged?.Invoke();
        }
    }
}
