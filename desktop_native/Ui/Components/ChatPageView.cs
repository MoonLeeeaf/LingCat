using System.Globalization;
using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Resources;
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
    private readonly Func<string> _ownName;
    private readonly List<(SimpleSvgSource Source, Button Button)> _icons = [];
    private ChatSummary? _chat;
    private ChatMessage[] _rendered = [];
    private bool _wasLoading;
    private bool _hadHistoryError;
    private bool _scrollQueued;
    private double? _requestedOffset;

    public ChatPageView(Func<string> ownName)
    {
        _ownName = ownName;
        _scroll = new ScrollViewer().VerticalScroll(ScrollMode.Auto).HorizontalScroll(ScrollMode.Disabled).Content(_messages);
        _scroll.ScrollChanged += UpdateLatestButton;
        _messages.Arranged = QueueRequestedScroll;
        _latest = Icon("ic_arrow_downward.svg", "回到最新消息", filled: true)
            .HorizontalAlignment(HorizontalAlignment.Right).VerticalAlignment(VerticalAlignment.Bottom)
            .Margin(0, 0, 22, 10).OnClick(ScrollToLatest);
        _latest.IsVisible = false;

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

    public void SetChat(ChatSummary? chat)
    {
        bool switched = !ReferenceEquals(_chat, chat);
        bool follow = switched || _requestedOffset == double.MaxValue || DistanceFromBottom <= FollowThreshold;
        double offset = _requestedOffset ?? _scroll.VerticalOffset;
        _chat = chat;
        var draft = chat?.Draft ?? string.Empty;
        if (_editor.Text != draft) _editor.Text = draft;
        UpdateAppearance();

        var messages = chat?.Messages;
        bool loading = chat?.HistoryLoading == true;
        bool historyError = chat?.HistoryError is not null;
        if (switched || _messages.Children.Count == 0 || loading != _wasLoading || historyError != _hadHistoryError ||
            (messages is not null && !messages.SequenceEqual(_rendered)))
        {
            _rendered = messages?.ToArray() ?? [];
            _wasLoading = loading;
            _hadHistoryError = historyError;
            RenderMessages(follow ? double.MaxValue : offset);
        }
    }

    public void ApplyTheme()
    {
        ApplyThemeCore();
        UpdateAppearance();
        RenderMessages(_requestedOffset ?? (DistanceFromBottom <= FollowThreshold ? double.MaxValue : _scroll.VerticalOffset));
    }

    private Grid BuildHeader() => new Grid().MinHeight(56).Padding(16, 4, 8, 4).Children(
        _title.VerticalAlignment(VerticalAlignment.Center));

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
        _title.Text = _chat?.Title ?? "选择一个对话";
        _editor.IsEnabled = _chat is not null;
        var error = _chat?.SendError ?? _chat?.HistoryError;
        _status.Text = error ?? (_chat?.Sending == true ? "正在发送…" : string.Empty);
        _status.IsVisible = _status.Text.Length != 0;
        _status.Foreground = error is null ? UiTheme.TextSecondary : UiTheme.Danger;
        _progress.IsVisible = _progress.IsIndeterminate = _chat?.Sending == true;
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
        if (_rendered.Length == 0)
        {
            if (_wasLoading)
                _messages.Add(new MaterialProgressBar { IsIndeterminate = true, Width = 120, Margin = new Thickness(0, 28, 0, 0), HorizontalAlignment = HorizontalAlignment.Center });
            else if (!_hadHistoryError)
                _messages.Add(new Label().Text(_chat is null ? "从左侧选择一个对话" : "还没有消息")
                    .Foreground(UiTheme.TextMuted).Margin(0, 28, 0, 0).HorizontalAlignment(HorizontalAlignment.Center));
        }

        ChatMessage? previous = null;
        foreach (var message in _rendered)
        {
            bool showTime = previous?.Time != message.Time;
            if (showTime && !string.IsNullOrEmpty(message.Time))
                _messages.Add(new Label().Text(message.Time).FontSize(UiTheme.Type.BodySmall.FontSize)
                    .Foreground(UiTheme.TextMuted).Margin(0, 12, 0, 6).HorizontalAlignment(HorizontalAlignment.Center));

            if (message.IsSystem)
                _messages.Add(new Label().Text(message.Text.Replace("_", "__")).FontSize(UiTheme.Type.BodySmall.FontSize)
                    .TextWrapping(TextWrapping.Wrap).Foreground(UiTheme.TextSecondary)
                    .Padding(10, 4).CornerRadius(10).Background(UiTheme.BubbleSystem)
                    .HorizontalAlignment(HorizontalAlignment.Center));
            else
                _messages.Add(BuildMessage(message, showTime || previous is not { IsSystem: false } ||
                    previous.IsMine != message.IsMine || previous.Sender != message.Sender));
            previous = message;
        }
    }

    private Grid BuildMessage(ChatMessage message, bool showSender)
    {
        int column = message.IsMine ? 1 : 0;
        var side = message.IsMine ? HorizontalAlignment.Right : HorizontalAlignment.Left;
        var row = new Grid().Columns("*,*").Rows(showSender ? "Auto,Auto" : "Auto");
        if (showSender)
        {
            var sender = message.IsMine ? _ownName() : _chat?.IsGroup == false ? _chat.Title : message.Sender;
            if (string.IsNullOrWhiteSpace(sender)) sender = message.IsMine ? "我" : "未知用户";
            var avatar = UiFactory.Avatar(StringInfo.GetNextTextElement(sender).Replace("_", "__"),
                message.IsMine ? UiTheme.Accent : _chat?.AvatarColor ?? UiTheme.Accent, 40, 15);
            var name = new Label().Text(sender.Replace("_", "__")).FontSize(UiTheme.Type.LabelLarge.FontSize)
                .TextTrimming(TextTrimming.CharacterEllipsis).VerticalAlignment(VerticalAlignment.Center);
            var author = message.IsMine
                ? new Grid().Columns("*,Auto").Children(
                    name.HorizontalAlignment(HorizontalAlignment.Right).Margin(0, 0, 8, 0).GridPosition(0, 0), avatar.GridPosition(0, 1))
                : new Grid().Columns("Auto,*").Children(avatar.GridPosition(0, 0), name.Margin(8, 0, 0, 0).GridPosition(0, 1));
            row.Add(author.Margin(0, 4, 0, 0).GridPosition(0, column));
        }

        var body = new TextBlock
        {
            Text = message.Text,
            TextWrapping = TextWrapping.Wrap,
            FontSize = UiTheme.Type.BodyMedium.FontSize,
            Foreground = UiTheme.Text,
        };
        var bubble = new MaterialSurface { Variant = MaterialSurfaceVariant.ElevatedCard, Content = body }
            .Padding(12, 8).HorizontalAlignment(side)
            .Margin(message.IsMine ? 0 : 48, 0, message.IsMine ? 48 : 0, 0)
            .ToolTip(message.Time);
        var copy = new Command("chat.copy-message", "复制消息");
        bubble.Commands.Register(copy, () => { Application.Current.PlatformServices.Clipboard?.TrySetText(message.Text); });
        bubble.ContextMenu(new ContextMenu().Item(copy));
        row.Add(bubble.GridPosition(showSender ? 1 : 0, column));
        return row;
    }

    private double DistanceFromBottom => Math.Max(0, _messages.ActualHeight - _scroll.ViewportHeight - _scroll.VerticalOffset);

    private void UpdateLatestButton() => _latest.IsVisible = _rendered.Length != 0 && DistanceFromBottom > FollowThreshold;

    private void ScrollToLatest()
    {
        _scroll.SetScrollOffsets(0, Math.Max(0, _messages.ActualHeight - _scroll.ViewportHeight));
        UpdateLatestButton();
    }

    private void QueueRequestedScroll()
    {
        // ScrollViewer clamps offsets to the measured extent, so wait until the new rows are arranged.
        if (_requestedOffset is null || _scrollQueued || !Application.IsRunning ||
            Application.Current?.Dispatcher is not { } dispatcher) return;
        _scrollQueued = true;
        dispatcher.BeginInvoke(() =>
        {
            _scrollQueued = false;
            if (_requestedOffset is not { } offset) return;
            _requestedOffset = null;
            if (Root.FindVisualRoot() is not Window) return;
            if (offset == double.MaxValue) ScrollToLatest();
            else _scroll.SetScrollOffsets(0, offset);
            UpdateLatestButton();
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
