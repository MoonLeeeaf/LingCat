using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using MewUI.Material.Controls;

namespace LingCat_Desktop.Ui.Components;

/// <summary>
/// 对话列表面板。对应 ChatListFragment：
/// 顶部标题与刷新入口、搜索框、可滚动的会话列表。
/// </summary>
internal sealed class ChatListPane
{
    public MaterialSurface Root { get; }

    private readonly List<ChatSummary> _chats = new();
    private readonly StackPanel _listPanel;
    private readonly Label _scopeLabel;
    private readonly MaterialSearchBar _searchBox;
    private readonly Dictionary<string, MaterialButton> _rows = new();

    private ChatListScope _scope = ChatListScope.All;
    private string _filterText = string.Empty;
    private string? _selectedChatId;
    private string? _status;
    private Label? _statusLabel;

    public ChatListPane()
    {
        _scopeLabel = new Label()
            .Text("全部")
            .FontSize(UiTheme.Type.TitleLarge.FontSize)
            .FontWeight(UiTheme.Type.TitleLarge.FontWeight);
        _searchBox = new MaterialSearchBar { Placeholder = "搜索对话…", ClearButtonText = "清除" };
        _searchBox.Editor.TextChanged += text =>
        {
            _filterText = text;
            RefreshList();
        };

        _listPanel = new StackPanel()
            .Spacing(3)
            .Padding(8, 4, 8, 10);

        var scroll = new ScrollViewer()
            .VerticalScroll(ScrollMode.Auto)
            .HorizontalScroll(ScrollMode.Disabled)
            .Content(_listPanel);

        Root = new MaterialSurface
        {
            Variant = MaterialSurfaceVariant.ElevatedCard,
            Padding = new Thickness(0),
            CornerRadius = 0,
            Content = new Grid()
                .Rows("Auto,Auto,*")
                .Children(
                    BuildHeader().GridPosition(0, 0),
                    _searchBox.Margin(14, 10, 14, 8).GridPosition(1, 0),
                    scroll.GridPosition(2, 0)),
        };
    }

    public event Action<ChatSummary>? ChatSelected;

    public event Action? RefreshRequested;

    public IReadOnlyList<ChatSummary> Chats => _chats;

    public string? SelectedChatId => _selectedChatId;

    public void SetChats(IEnumerable<ChatSummary> chats)
    {
        _chats.Clear();
        _chats.AddRange(chats);

        if (_selectedChatId is not null && _chats.All(c => c.Id != _selectedChatId))
        {
            _selectedChatId = null;
        }

        RefreshList();
    }

    public void SetScope(ChatListScope scope)
    {
        _scope = scope;
        _scopeLabel.Text = scope == ChatListScope.Favourites ? "收藏" : "全部";
        RefreshList();
    }

    public void SelectChat(string chatId)
    {
        _selectedChatId = chatId;
        UpdateSelection();

        var chat = _chats.FirstOrDefault(c => c.Id == chatId);
        if (chat is not null) ChatSelected?.Invoke(chat);
    }

    public void Refresh() => RefreshList();

    public void ApplyTheme()
    {
        UpdateSelection();
        if (_statusLabel != null) _statusLabel.Foreground = UiTheme.TextMuted;
    }

    private void UpdateSelection()
    {
        foreach (var (id, row) in _rows)
        {
            bool active = id == _selectedChatId;
            row.Variant = active ? MaterialButtonVariant.FilledTonal : MaterialButtonVariant.Text;
            row.Foreground = active ? UiTheme.OnSelection : UiTheme.Text;
        }
    }

    public void SetStatus(string? status)
    {
        _status = status;
        RefreshList();
    }

    private Grid BuildHeader()
    {
        var refreshButton = new MewUI.Material.Controls.IconButton()
            .Content("↻")
            .FontSize(18)
            .ToolTip("刷新对话列表")
            .OnClick(() => RefreshRequested?.Invoke());

        return new Grid()
            .Columns("*,Auto")
            .Padding(14, 14, 14, 0)
            .Children(
                new StackPanel()
                    .Spacing(3)
                    .Children(
                        _scopeLabel)
                    .GridPosition(0, 0),
                refreshButton
                    .VerticalAlignment(VerticalAlignment.Center)
                    .GridPosition(0, 1));
    }

    private void RefreshList()
    {
        var query = _filterText.Trim();
        var visible = _chats
            .Where(chat => _scope == ChatListScope.All || chat.IsFavourite)
            .Where(chat => string.IsNullOrEmpty(query)
                || chat.Title.Contains(query, StringComparison.OrdinalIgnoreCase)
                || chat.Snippet.Contains(query, StringComparison.OrdinalIgnoreCase))
            .ToList();

        _listPanel.Clear();
        _rows.Clear();
        _statusLabel = null;

        if (_status != null || visible.Count == 0)
        {
            _listPanel.Add(new Border()
                .Padding(20)
                .Child(_statusLabel = new Label()
                    .Text(_status ?? (_scope == ChatListScope.Favourites ? "暂无收藏对话" : "暂无匹配的对话"))
                    .FontSize(12)
                    .TextWrapping(TextWrapping.Wrap)
                    .Foreground(UiTheme.TextMuted)
                    .HorizontalAlignment(HorizontalAlignment.Center)));
            if (visible.Count == 0) return;
        }

        foreach (var chat in visible)
        {
            _listPanel.Add(BuildChatItem(chat));
        }
    }

    private MaterialButton BuildChatItem(ChatSummary chat)
    {
        var active = chat.Id == _selectedChatId;

        var avatar = UiFactory.Avatar(chat.AvatarText, chat.AvatarColor, 40, 15)
            .VerticalAlignment(VerticalAlignment.Center);

        var title = new Label()
            .Text(chat.Title)
            .FontSize(UiTheme.Type.TitleSmall.FontSize)
            .FontWeight(UiTheme.Type.TitleSmall.FontWeight)
            .TextTrimming(TextTrimming.CharacterEllipsis);

        var time = new Label().Text(chat.Time).FontSize(UiTheme.Type.LabelSmall.FontSize)
            .HorizontalAlignment(HorizontalAlignment.Right);

        var snippet = new Label()
            .Text(chat.Snippet)
            .FontSize(UiTheme.Type.BodySmall.FontSize)
            .TextTrimming(TextTrimming.CharacterEllipsis);

        var grid = new Grid()
            .Columns("Auto,*,Auto")
            .Rows("Auto,Auto")
            .Children(
                avatar
                    .GridPosition(0, 0, 2, 1)
                    .VerticalAlignment(VerticalAlignment.Center),
                title
                    .GridPosition(0, 1)
                    .Margin(5, 0, 0, 0),
                time.GridPosition(0, 2),
                snippet
                    .GridPosition(1, 1)
                    .Margin(5, 2, 0, 0));

        var item = new MaterialButton
        {
            Variant = active ? MaterialButtonVariant.FilledTonal : MaterialButtonVariant.Text,
            Content = grid,
            Foreground = active ? UiTheme.OnSelection : UiTheme.Text,
        }
            .Padding(9, 8)
            .CornerRadius(UiTheme.Shape.Medium)
            .Cursor(CursorType.Hand);
        item.Click += () => SelectChat(chat.Id);
        _rows[chat.Id] = item;

        return item;
    }
}
