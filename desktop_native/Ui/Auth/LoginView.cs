using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using LingCat_Desktop.Services;
using MewUI.Material.Controls;
using MewUI.Material.Themes;

namespace LingCat_Desktop.Ui.Auth;

/// <summary>
/// 登录 / 注册页面，对应 LoginRoute 与 LoginOrRegisterForm。
/// 首次启动未登录时直接作为窗口内容显示。
/// </summary>
internal sealed class LoginView
{
    private readonly OutlinedTextField _serverBox;
    private readonly OutlinedTextField _accountBox;
    private readonly OutlinedTextField _usernameBox;
    private readonly OutlinedTextField _nicknameBox;
    private readonly OutlinedTextField _passwordBox;
    private readonly StackPanel _loginFields;
    private readonly StackPanel _registerFields;
    private readonly Label _titleLabel;
    private readonly Label _errorLabel;
    private readonly Button _submitButton;
    private readonly Button _modeButton;
    private readonly Button _backButton;
    private readonly Action<AuthSession> _onAuthenticated;

    private bool _isRegister;
    private bool _loading;

    public LoginView(
        string? initialServer,
        Action<AuthSession> onAuthenticated,
        string? initialError = null,
        Action? onBack = null,
        Action<StoredSession>? onRestore = null)
    {
        _onAuthenticated = onAuthenticated;

        _serverBox = new() { Label = "服务端地址", Placeholder = "http(s)://host:port/..." };
        _serverBox.Text = initialServer ?? string.Empty;

        _accountBox = new() { Label = "账号", Placeholder = "用户名 / 用户 ID" };
        _usernameBox = new() { Label = "用户名（可选）" };
        _nicknameBox = new() { Label = "昵称" };
        _passwordBox = new(MaterialTextFieldInputType.Password) { Label = "密码", Placeholder = "密码" };

        _loginFields = new StackPanel().Children(_accountBox);

        _registerFields = new StackPanel()
            .Spacing(12)
            .Children(_usernameBox, _nicknameBox);

        _titleLabel = new Label()
            .Text("登录")
            .FontSize(UiTheme.Type.HeadlineSmall.FontSize)
            .FontWeight(UiTheme.Type.HeadlineSmall.FontWeight)
            .HorizontalAlignment(HorizontalAlignment.Center);

        _errorLabel = new Label()
            .FontSize(11)
            .Foreground(UiTheme.Danger)
            .TextWrapping(TextWrapping.Wrap)
            .IsVisible(false);

        _submitButton = new FilledButton()
            .Content("登录")
            .MinHeight(48)
            .OnClick(Submit);

        _modeButton = new TextButton()
            .Content("创建新账号")
            .OnClick(() => SetMode(!_isRegister));

        _backButton = new TextButton()
            .Content("← 返回")
            .HorizontalAlignment(HorizontalAlignment.Left)
            .IsVisible(onBack is not null)
            .OnClick(() => onBack?.Invoke());

        var savedAccounts = new StackPanel().Spacing(4);
        if (onRestore != null)
        {
            var saved = SessionStore.Instance.ListSessions();
            if (saved.Count != 0) savedAccounts.Add(new Label().Text("已保存的账号").FontSize(UiTheme.Type.LabelMedium.FontSize));
            var rows = new StackPanel().Spacing(4);
            foreach (var session in saved)
            {
                var name = string.IsNullOrWhiteSpace(session.Nickname) ? session.Account : session.Nickname;
                rows.Add(new FilledTonalButton().Content($"{name} · {session.Server}", accessKey: false)
                    .ToolTip(session.Server).OnClick(() => { if (!_loading) onRestore(session); }));
            }
            if (saved.Count != 0)
                savedAccounts.Add(new ScrollViewer().VerticalScroll(ScrollMode.Auto).HorizontalScroll(ScrollMode.Disabled)
                    .MaxHeight(100).Content(rows));
        }

        var form = new StackPanel()
            .Spacing(12)
            .Children(
                _backButton,
                _titleLabel.Margin(0, 2, 0, 0),
                _serverBox.Margin(0, 10, 0, 0),
                _loginFields,
                _registerFields,
                _passwordBox,
                _errorLabel,
                _submitButton.Margin(0, 4, 0, 0),
                _modeButton
                    .HorizontalAlignment(HorizontalAlignment.Center)
                    .Margin(0, -4, 0, 0),
                savedAccounts.IsVisible(savedAccounts.Children.Count != 0));

        var card = new MaterialSurface { Variant = MaterialSurfaceVariant.ElevatedCard, Content = form }
            .Width(420)
            .Padding(30, 28, 30, 24)
            .HorizontalAlignment(HorizontalAlignment.Center)
            .VerticalAlignment(VerticalAlignment.Center);

        Root = new MaterialSurface
        {
            Padding = new Thickness(0),
            Content = new ScrollViewer().VerticalScroll(ScrollMode.Auto).HorizontalScroll(ScrollMode.Disabled).Content(card),
        };

        _serverBox.Submitted += _ => Submit();
        _accountBox.Submitted += _ => Submit();
        _usernameBox.Submitted += _ => Submit();
        _nicknameBox.Submitted += _ => Submit();
        _passwordBox.SubmitRequested += Submit;

        SetMode(false);

        if (!string.IsNullOrWhiteSpace(initialError))
        {
            ShowError(initialError);
        }
    }

    public MaterialSurface Root { get; }

    public void ApplyTheme(MaterialTheme theme) => _errorLabel.Foreground = theme.Colors.Error;

    public void FocusFirstField()
    {
        if (string.IsNullOrWhiteSpace(_serverBox.Text))
        {
            _serverBox.Editor.Focus();
        }
        else
        {
            _accountBox.Editor.Focus();
        }
    }

    private void SetMode(bool register)
    {
        _isRegister = register;
        _titleLabel.Text = register ? "注册" : "登录";
        _loginFields.IsVisible(!register);
        _registerFields.IsVisible(register);
        _submitButton.Content(register ? "注册" : "登录");
        _modeButton.Content(register ? "返回登录" : "创建新账号");
        HideError();
    }

    private void Submit()
    {
        if (_loading) return;

        var server = _serverBox.Text?.Trim() ?? string.Empty;
        var password = _passwordBox.Password;

        if (string.IsNullOrWhiteSpace(server))
        {
            ShowError("请填写服务端地址");
            return;
        }

        if (string.IsNullOrEmpty(password))
        {
            ShowError("请填写密码");
            return;
        }

        string account;
        if (_isRegister)
        {
            var nickname = _nicknameBox.Text?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(nickname))
            {
                ShowError("请填写昵称");
                return;
            }

            account = _usernameBox.Text?.Trim() ?? string.Empty;
        }
        else
        {
            account = _accountBox.Text?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(account))
            {
                ShowError("请填写账号");
                return;
            }
        }

        _ = SubmitAsync(server, account, password);
    }

    private async Task SubmitAsync(string server, string account, string password)
    {
        HideError();
        SetLoading(true);

        try
        {
            var session = _isRegister
                ? await AuthService.RegisterAsync(
                    server,
                    account,
                    _nicknameBox.Text?.Trim() ?? string.Empty,
                    password)
                : await AuthService.LoginAsync(server, account, password);

            UiThread.Post(() =>
            {
                _passwordBox.Password = string.Empty;
                SetLoading(false);
                _onAuthenticated(session);
            });
        }
        catch (Exception ex)
        {
            var message = GetFriendlyMessage(ex);
            UiThread.Post(() =>
            {
                SetLoading(false);
                ShowError(message);
            });
        }
    }

    private void SetLoading(bool loading)
    {
        _loading = loading;

        _serverBox.IsEnabled = !loading;
        _accountBox.IsEnabled = !loading;
        _usernameBox.IsEnabled = !loading;
        _nicknameBox.IsEnabled = !loading;
        _passwordBox.IsEnabled = !loading;
        _modeButton.IsEnabled = !loading;
        _backButton.IsEnabled = !loading;
        _submitButton.IsEnabled = !loading;
        _submitButton.Content(loading
            ? _isRegister ? "注册中..." : "登录中..."
            : _isRegister ? "注册" : "登录");
    }

    private void ShowError(string message)
    {
        _errorLabel.Text = message;
        _errorLabel.IsVisible(true);
    }

    private void HideError()
    {
        _errorLabel.IsVisible(false);
    }

    private static string GetFriendlyMessage(Exception exception)
    {
        var current = exception is AggregateException aggregate
            ? aggregate.GetBaseException()
            : exception;

        return string.IsNullOrWhiteSpace(current.Message)
            ? "操作失败，请稍后重试"
            : current.Message;
    }

}
