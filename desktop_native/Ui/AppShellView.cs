using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using LingCat_Desktop.Services;
using LingCat_Desktop.Ui.Auth;
using LingCat_Desktop.Ui.Components;
using MewUI.Material.Controls;
using MewUI.Material.Themes;

namespace LingCat_Desktop.Ui;

/// <summary>
/// 应用外壳：根据登录状态在登录页与主界面之间切换。
/// 对应 AuthRoute 的守卫逻辑，以及 LoginRoute 的入口。
/// </summary>
internal sealed class AppShellView : Grid
{
    private enum ShellState
    {
        Loading,
        Login,
        Main,
    }

    private ShellState _state = ShellState.Loading;
    private string _loadingText = "正在启动...";
    private string? _loginError;
    private bool _started;
    private bool _loginCanGoBack;
    private bool _switchingAccount;
    private bool _closed;
    private AuthSession? _auth;
    private MainWindowView? _mainView;
    private LoginView? _loginView;

    public AppShellView()
    {
        this.Columns("*");
    }

    public void Start()
    {
        if (_started) return;
        _started = true;

        var stored = SessionStore.Instance.GetActiveSession();
        if (stored is null)
        {
            ShowLogin();
            return;
        }

        ShowLoading("正在恢复会话...");
        _ = RestoreAsync(stored);
    }

    public void ApplyTheme(MaterialTheme theme)
    {
        _mainView?.ApplyTheme();
        _loginView?.ApplyTheme(theme);
    }

    public async ValueTask DisposeSessionAsync()
    {
        _closed = true;
        _mainView?.Stop();
        if (_auth is null) return;

        var auth = _auth;
        _auth = null;
        await auth.DisposeAsync().ConfigureAwait(false);
    }

    private async Task RestoreAsync(StoredSession stored)
    {
        try
        {
            var auth = await AuthService.RestoreAsync(stored).ConfigureAwait(false);
            UiThread.Post(() => ShowMain(auth));
        }
        catch (Exception ex)
        {
            UiThread.Post(() => ShowLogin(GetFriendlyMessage(ex)));
        }
    }

    private void OnAuthenticated(AuthSession session)
    {
        UiThread.Post(() => ShowMain(session));
    }

    private void ShowMain(AuthSession session)
    {
        if (_closed)
        {
            _ = session.DisposeAsync().AsTask();
            return;
        }
        _mainView?.Stop();
        var previous = _auth;
        _auth = session;
        if (previous is not null)
        {
            _ = previous.DisposeAsync().AsTask();
        }

        _loginCanGoBack = false;
        _switchingAccount = false;
        _mainView = new MainWindowView(
            session,
            SwitchAccount,
            ShowLoginForAddAccount,
            Logout);
        _state = ShellState.Main;
        Rebuild();
        _mainView.Start();
    }

    private void ShowLogin(string? error = null)
    {
        if (_closed) return;
        _mainView?.Stop();
        DisposeCurrentAuth();

        _mainView = null;
        _loginError = error;
        _loginCanGoBack = false;
        _state = ShellState.Login;
        Rebuild();
    }

    private void ShowLoginForAddAccount()
    {
        if (_switchingAccount) return;
        _loginError = null;
        _loginCanGoBack = true;
        _state = ShellState.Login;
        Rebuild();
    }

    private void CancelAddAccount()
    {
        if (_auth is null) return;

        _loginCanGoBack = false;
        _state = ShellState.Main;
        Rebuild();
    }

    private void Logout()
    {
        if (_switchingAccount) return;
        var key = _auth?.Stored.Key;
        if (key is not null)
        {
            SessionStore.Instance.RemoveSession(key);
        }

        ShowLogin();
    }

    private void SwitchAccount(StoredSession stored)
    {
        if (_switchingAccount) return;

        _switchingAccount = true;
        _ = SwitchAccountAsync(stored);
    }

    private async Task SwitchAccountAsync(StoredSession stored)
    {
        try
        {
            var auth = await AuthService.RestoreAsync(stored).ConfigureAwait(false);
            UiThread.Post(() => ShowMain(auth));
        }
        catch (Exception ex)
        {
            var message = GetFriendlyMessage(ex);
            UiThread.Post(() =>
            {
                _switchingAccount = false;
                _mainView?.ShowAccountError($"切换账号失败：{message}");
            });
        }
    }

    private void ShowLoading(string text)
    {
        _loadingText = text;
        _state = ShellState.Loading;
        Rebuild();
    }

    private void RestoreSavedAccount(StoredSession session)
    {
        if (_closed || _state != ShellState.Login || _loginCanGoBack) return;
        ShowLoading("正在恢复会话...");
        _ = RestoreAsync(session);
    }

    private void DisposeCurrentAuth()
    {
        var previous = _auth;
        _auth = null;
        if (previous is not null)
        {
            _ = previous.DisposeAsync().AsTask();
        }
    }

    private void Rebuild()
    {
        Clear();
        _loginView = null;

        switch (_state)
        {
            case ShellState.Loading:
                Add(BuildLoadingView());
                break;

            case ShellState.Login:
                var login = _loginView = new LoginView(
                    SessionStore.Instance.GetLastServer(),
                    OnAuthenticated,
                    _loginError,
                    _loginCanGoBack ? CancelAddAccount : null,
                    _loginCanGoBack ? null : RestoreSavedAccount);
                Add(login.Root);
                login.FocusFirstField();
                break;

            case ShellState.Main:
                Add(_mainView ??= new MainWindowView(
                    _auth!,
                    SwitchAccount,
                    ShowLoginForAddAccount,
                    Logout));
                break;
        }
    }

    private MaterialSurface BuildLoadingView()
    {
        var stack = new StackPanel()
            .Spacing(12)
            .HorizontalAlignment(HorizontalAlignment.Center)
            .VerticalAlignment(VerticalAlignment.Center)
            .Children(
                new Label()
                    .Text(_loadingText)
                    .FontSize(UiTheme.Type.BodyMedium.FontSize)
                    .HorizontalAlignment(HorizontalAlignment.Center),
                new MaterialProgressBar { Width = 180, IsIndeterminate = true });

        return new MaterialSurface { Content = stack };
    }

    private static string GetFriendlyMessage(Exception exception)
    {
        var current = exception is AggregateException aggregate
            ? aggregate.GetBaseException()
            : exception;

        return string.IsNullOrWhiteSpace(current.Message)
            ? "连接失败，请稍后重试"
            : current.Message;
    }
}
