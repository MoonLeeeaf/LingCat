using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using Aprillz.MewUI.Resources;
using MewUI.Material.Controls;
using MaterialIconButton = MewUI.Material.Controls.IconButton;

namespace LingCat_Desktop.Ui.Components;

/// <summary>
/// 右侧聊天页面框架。对应 UserMainLayout 的 main / Outlet：
/// 会话头部、消息滚动区、底部输入区。
/// </summary>
internal sealed class ChatPageView
{
    public MaterialSurface Root { get; }

    private readonly Label _avatarLabel;
    private readonly Border _avatar;
    private readonly Label _titleLabel;
    private readonly Label _subtitleLabel;
    private readonly StackPanel _messagesPanel;
    private readonly ScrollViewer _scroll;
    private readonly MultiLineTextBox _composer;
    private readonly Button _sendButton;
    private readonly SimpleSvgSource _sendIcon;
    private readonly Label _status;

    private ChatSummary? _chat;

    public ChatPageView()
    {
        _avatarLabel = new Label()
            .Text("灵")
            .FontSize(16)
            .Bold()
            .Foreground(UiTheme.OnAccent)
            .HorizontalAlignment(HorizontalAlignment.Center)
            .VerticalAlignment(VerticalAlignment.Center);

        _avatar = new Border()
            .Width(42)
            .Height(42)
            .CornerRadius(21)
            .Background(UiTheme.Accent)
            .Child(_avatarLabel);

        _titleLabel = new Label()
            .Text("选择一个对话")
            .FontSize(UiTheme.Type.TitleMedium.FontSize)
            .FontWeight(UiTheme.Type.TitleMedium.FontWeight);

        _subtitleLabel = UiFactory.Caption("从左侧列表开始", UiTheme.Type.BodySmall.FontSize);

        _messagesPanel = new StackPanel()
            .Spacing(4)
            .Padding(24, 18, 24, 18);

        _scroll = new ScrollViewer()
            .VerticalScroll(ScrollMode.Auto)
            .HorizontalScroll(ScrollMode.Disabled)
            .Content(_messagesPanel);

        _composer = new MultiLineTextBox()
            .Placeholder("输入消息，Ctrl+Enter 发送...")
            .Wrap(true)
            .MinHeight(42)
            .MaxHeight(110)
            .Padding(12, 9);

        _composer.TextChanged += text => { if (_chat != null) _chat.Draft = text; };
        _composer.OnKeyDown(e =>
        {
            if (e.Key == Key.Enter && e.PrimaryKey)
            {
                SendCurrentMessage();
                e.Handled = true;
            }
        });

        _sendIcon = IconAssets.Load("ic_send.svg", UiTheme.OnAccent);
        _sendButton = new FilledIconButton()
            .Content(IconAssets.Create(_sendIcon, 18))
            .Width(44)
            .Height(44)
            .ToolTip("发送")
            .OnClick(SendCurrentMessage);

        _status = new Label().FontSize(UiTheme.Type.BodySmall.FontSize).TextWrapping(TextWrapping.Wrap).Margin(18, 0, 18, 4);

        Root = new MaterialSurface
        {
            Padding = new Thickness(0),
            Content = new Grid()
                .Rows("Auto,1,*,Auto")
                .Children(
                    BuildHeader().GridPosition(0, 0),
                    UiFactory.DividerLine(false).GridPosition(1, 0),
                    _scroll.GridPosition(2, 0),
                    BuildComposer().GridPosition(3, 0)),
        };

        SetChat(null);
    }

    public event Action<ChatSummary, string>? SendRequested;
    public event Action? RefreshRequested;

    public ChatSummary? CurrentChat => _chat;

    public string Draft
    {
        get => _composer.Text ?? string.Empty;
        set => _composer.Text = value;
    }

    public void SetChat(ChatSummary? chat)
    {
        var draft = chat?.Draft ?? string.Empty;
        _chat = chat;
        if (Draft != draft) Draft = draft;

        UpdateChatAppearance();
        RenderMessages();
    }

    public void ApplyTheme()
    {
        _subtitleLabel.Foreground = UiTheme.TextSecondary;
        var scrollOffset = _scroll.VerticalOffset;
        UpdateChatAppearance();
        RenderMessages(scrollToBottom: false);
        _scroll.SetScrollOffsets(_scroll.HorizontalOffset, scrollOffset);
    }

    private void UpdateChatAppearance()
    {
        var chat = _chat;
        if (chat is null)
        {
            _avatar.Background = UiTheme.Accent;
            _avatarLabel.Foreground = UiTheme.OnAccent;
            _avatarLabel.Text = "灵";
            _titleLabel.Text = "选择一个对话";
            _subtitleLabel.Text = "从左侧列表开始";
            _composer.IsEnabled = false;
            _sendButton.IsEnabled = false;
        }
        else
        {
            _avatar.Background = chat.AvatarColor;
            _avatarLabel.Foreground = UiTheme.OnAvatar;
            _avatarLabel.Text = chat.AvatarText;
            _titleLabel.Text = chat.Title;
            _subtitleLabel.Text = chat.IsGroup ? "群聊" : "私聊";
            _composer.IsEnabled = true;
            _sendButton.IsEnabled = !chat.Sending;
        }

        _status.Text = chat?.SendError ?? chat?.HistoryError ?? (chat?.HistoryLoading == true ? "正在加载消息…" : string.Empty);
        _status.IsVisible = _status.Text.Length > 0;
        _status.Foreground = chat?.SendError != null || chat?.HistoryError != null ? UiTheme.Danger : UiTheme.TextSecondary;
        _sendIcon.Tint = _sendButton.IsEnabled ? UiTheme.OnAccent : UiTheme.Text.WithAlpha(97);
    }

    private Grid BuildHeader()
    {
        var actions = new StackPanel()
            .Horizontal()
            .Spacing(8)
            .VerticalAlignment(VerticalAlignment.Center)
            .Children(
                HeaderAction("↻", "刷新对话和消息").OnClick(() => RefreshRequested?.Invoke()));

        return new Grid()
            .Columns("Auto,*,Auto")
            .Padding(18, 12, 18, 12)
            .Children(
                _avatar
                    .GridPosition(0, 0)
                    .VerticalAlignment(VerticalAlignment.Center),
                new StackPanel()
                    .Spacing(2)
                    .Margin(11, 0, 0, 0)
                    .VerticalAlignment(VerticalAlignment.Center)
                    .Children(
                        _titleLabel,
                        _subtitleLabel)
                    .GridPosition(0, 1),
                actions.GridPosition(0, 2));
    }

    private Button HeaderAction(string glyph, string tooltip)
    {
        return new MaterialIconButton()
            .Content(glyph)
            .FontSize(15)
            .ToolTip(tooltip);
    }

    private StackPanel BuildComposer()
    {
        var attach = new OutlinedIconButton { IsEnabled = false }
            .Content("+")
            .Width(42)
            .Height(42)
            .FontSize(18)
            .ToolTip("添加附件");

        return new StackPanel()
            .Spacing(0)
            .Children(
                UiFactory.DividerLine(false),
                _status,
                new Grid()
                    .Columns("Auto,*,Auto")
                    .Padding(16, 12, 16, 14)
                    .Children(
                        attach
                            .GridPosition(0, 0)
                            .VerticalAlignment(VerticalAlignment.Bottom),
                        UiFactory.EditorSurface(_composer)
                            .Margin(10, 0, 10, 0)
                            .GridPosition(0, 1),
                        _sendButton
                            .GridPosition(0, 2)
                            .VerticalAlignment(VerticalAlignment.Bottom)));
    }

    private void RenderMessages(bool scrollToBottom = true)
    {
        _messagesPanel.Clear();

        if (_chat is null)
        {
            AddPlaceholder("灵猫", "选择一个对话开始聊天");
            return;
        }

        if (_chat.Messages.Count == 0)
        {
            if (!_chat.HistoryLoading && _chat.HistoryError == null)
                AddPlaceholder(_chat.AvatarText, "还没有消息，发一句问候吧");
            return;
        }

        foreach (var message in _chat.Messages)
        {
            _messagesPanel.Add(BuildMessage(message));
        }

        if (scrollToBottom) ScrollToBottom();
    }

    private void AddPlaceholder(string avatarText, string text)
    {
        _messagesPanel.Add(new StackPanel()
            .Spacing(8)
            .Margin(0, 96, 0, 0)
            .HorizontalAlignment(HorizontalAlignment.Center)
            .Children(
                UiFactory.Avatar(avatarText, UiTheme.SurfaceActive, 58, 22, UiTheme.TextSecondary)
                    .HorizontalAlignment(HorizontalAlignment.Center),
                new Label()
                    .Text(text)
                    .FontSize(13)
                    .Foreground(UiTheme.TextSecondary)
                    .HorizontalAlignment(HorizontalAlignment.Center)));
    }

    private UIElement BuildMessage(ChatMessage message)
    {
        if (message.IsSystem)
        {
            return new Label()
                .Text(message.Text)
                .FontSize(10)
                .Foreground(UiTheme.TextMuted)
                .HorizontalAlignment(HorizontalAlignment.Center)
                .Margin(0, 6, 0, 6)
                .Padding(10, 4)
                .Background(UiTheme.BubbleSystem)
                .CornerRadius(UiTheme.Shape.Small);
        }

        var content = new StackPanel()
            .Spacing(3)
            .Children(
                new Label()
                    .Text(message.Text)
                    .FontSize(UiTheme.Type.BodyMedium.FontSize)
                    .Foreground(message.IsMine ? UiTheme.OnBubbleMine : UiTheme.Text)
                    .TextWrapping(TextWrapping.Wrap)
                    .MaxWidth(470));

        if (!message.IsMine && _chat?.IsGroup == true && !string.IsNullOrEmpty(message.Sender))
        {
            content.Insert(0, new Label()
                .Text(message.Sender)
                .FontSize(10)
                .Bold()
                .Foreground(UiTheme.AccentText));
        }

        content.Add(new Label()
            .Text(message.Time)
            .FontSize(9)
            .Foreground(message.IsMine ? UiTheme.OnBubbleMine : UiTheme.TextMuted)
            .HorizontalAlignment(message.IsMine ? HorizontalAlignment.Right : HorizontalAlignment.Left));

        return new Border()
            .Background(message.IsMine ? UiTheme.BubbleMine : UiTheme.BubbleOther)
            .CornerRadius(UiTheme.Shape.Large)
            .Padding(12, 8)
            .MaxWidth(500)
            .Margin(0, 3, 0, 3)
            .HorizontalAlignment(message.IsMine ? HorizontalAlignment.Right : HorizontalAlignment.Left)
            .Child(content);
    }

    private void SendCurrentMessage()
    {
        if (_chat is null || _chat.Sending) return;

        var text = _composer.Text?.Trim();
        if (string.IsNullOrEmpty(text)) return;

        SendRequested?.Invoke(_chat, text);
    }

    private void ScrollToBottom()
    {
        try
        {
            _scroll.SetScrollOffsets(_scroll.HorizontalOffset, double.MaxValue);
        }
        catch
        {
            // 布局尚未完成时忽略，下一次渲染会自然落到最新消息。
        }
    }
}
