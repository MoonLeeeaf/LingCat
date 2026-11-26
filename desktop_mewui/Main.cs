using System.Diagnostics;
using System.Reflection;
using Aprillz.MewUI;
using Aprillz.MewUI.Controls;

var assembly = Assembly.GetExecutingAssembly();

Startup();

var iconStream = assembly.GetManifestResourceStream("LingCat_Desktop.icon.ico");

var window = new Window()
    .Resizable(950, 600)
    .Title("LingCat")
    .Content(ChatDemo());

if (iconStream != null)
{
    window.Icon = IconSource.FromStream(iconStream);
}

Application.Run(window);

// ======================================================== //

static void Startup()
{
    var args = Environment.GetCommandLineArgs();

    if (OperatingSystem.IsWindows())
    {
        Win32Platform.Register();

        if (args.Any(a => a is "--gdi"))
        {
            GdiBackend.Register();
        }
        else if (args.Any(a => a is "--vg"))
        {
            MewVGWin32Backend.Register();
        }
        else
        {
            Direct2DBackend.Register();
        }
    }
    else if (OperatingSystem.IsMacOS())
    {
        MacOSPlatform.Register();
        MewVGMacOSBackend.Register();
    }
    else
    {
        X11Platform.Register();
        MewVGX11Backend.Register();
    }
}
FrameworkElement ChatDemo()
{
    // 1. 使用 Proto 兼容的字段初始化模拟数据
    var myUserId = ""; // 假设空字符串代表当前用户
    var otherUserId = "user_other";
    var baseTime = (ulong)DateTimeOffset.UtcNow.ToUnixTimeSeconds();

    var messages = new List<Lingcat.Classes.IMessage>
    {
        new Lingcat.Classes.IMessage { Text = "你好！最近怎么样？", SenderUserId = otherUserId, Time = baseTime - 1800 },
        new Lingcat.Classes.IMessage { Text = "挺好的，你呢？", SenderUserId = myUserId, Time = baseTime - 1740 },
        new Lingcat.Classes.IMessage { Text = "我也不错。今天天气真好！", SenderUserId = otherUserId, Time = baseTime - 1680 },
        new Lingcat.Classes.IMessage { Text = "是啊，适合出去走走。要不要一起去喝咖啡？", SenderUserId = myUserId, Time = baseTime - 1620 },
        new Lingcat.Classes.IMessage { Text = "好主意！我知道附近新开了一家不错的咖啡店。", SenderUserId = otherUserId, Time = baseTime - 1560 },
        new Lingcat.Classes.IMessage { Text = "那太好了，我们什么时候去？", SenderUserId = myUserId, Time = baseTime - 1500 },
        new Lingcat.Classes.IMessage { Text = "下午三点怎么样？", SenderUserId = otherUserId, Time = baseTime - 1440 },
        new Lingcat.Classes.IMessage { Text = "没问题，到时候见！", SenderUserId = myUserId, Time = baseTime - 1380 },
    };

    var inputTextBox = new TextBox().Placeholder("输入消息...");
    ScrollViewer scrollViewer = null!;
    StackPanel messageList = null!;

    void AddMessage(string text, bool isFromMe)
    {
        if (string.IsNullOrWhiteSpace(text)) return;

        // 2. 构造符合 Proto 定义的消息对象
        var message = new Lingcat.Classes.IMessage
        {
            Text = text.Trim(),
            Time = (ulong)DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
            SenderUserId = isFromMe ? myUserId : otherUserId // 用 SenderUserId 标记来源
        };

        messages.Add(message);

        var bubble = CreateMessageBubble(message);

        // 3. 使用 Add 方法而非赋值
        messageList.Children.Append(bubble);
    }

    Element CreateMessageBubble(Lingcat.Classes.IMessage msg)
    {
        // 5. 在渲染时动态判断是否是自己发的
        bool isFromMe = string.IsNullOrEmpty(msg.SenderUserId) || msg.SenderUserId == myUserId;

        var timeText = DateTimeOffset.FromUnixTimeSeconds((long)msg.Time).LocalDateTime.ToString("HH:mm");

        // 气泡内容 - 使用 Border 来实现圆角背景
        var bubbleBorder = new Border()
            .Padding(12, 8)
            .MaxWidth(400)
            .CornerRadius(msg.SenderUserId == "" ?
                new CornerRadius(12, 12, 2, 12) :
                new CornerRadius(12, 12, 12, 2))
            .WithTheme((t, c) =>
            {
                if (msg.SenderUserId == "")
                {
                    // WithAlpha 需要 byte 类型 (0-255)
                    var accentColor = t.Palette.Accent;
                    c.Background(accentColor.WithAlpha(38)); // 0.15 * 255 ≈ 38
                }
                else
                {
                }
            })
            .Child(
                new MultiLineTextBox()
                    .Text(msg.Text)
                    .Wrap(true)
            );

        // 时间标签
        var timeLabel = new Label()
            .Text(timeText)
            .FontSize(10);

        // 头像（使用 Border 包裹实现圆角）
        FrameworkElement avatar = new Border()
            .Child(
                new Image()
                    .SourceFile("default_avatar.png")
                    .Size(32, 32)
                    .StretchMode(Stretch.Uniform)
            )
            .Size(32, 32)
            .CornerRadius(16);

        // 布局容器
        if (!(msg.SenderUserId == ""))
        {
            // 对方的消息：头像在左，气泡在右
            return new StackPanel()
                .Horizontal()
                .Spacing(8)
                .Margin(4, 2)
                .Children(
                    avatar,
                    new StackPanel()
                        .Vertical()
                        .Spacing(2)
                        .Children(
                            bubbleBorder,
                            timeLabel
                        )
                );
        }
        else
        {
            // 我的消息：靠右对齐
            return new StackPanel()
                .Horizontal()
                .Spacing(8)
                .Margin(4, 2)
                .HorizontalAlignment(HorizontalAlignment.Right)
                .Children(
                    new StackPanel()
                        .Vertical()
                        .Spacing(2)
                        .HorizontalAlignment(HorizontalAlignment.Right)
                        .Children(
                            bubbleBorder,
                            new StackPanel()
                                .Horizontal()
                                .HorizontalAlignment(HorizontalAlignment.Right)
                                .Children(timeLabel)
                        )
                );
        }
    }

    // 构建初始消息列表
    var initialMessages = messages.Select(msg => CreateMessageBubble(msg)).ToArray();

    return new DockPanel()
        .LastChildFill()
        .Children(
            // 顶部标题栏
            new StackPanel()
                .DockTop()
                .Horizontal()
                .Spacing(12)
                .Padding(12)
                .Children(
                    new Border()
                        .Child(
                            new Image()
                                .SourceFile("default_avatar.png")
                                .Size(40, 40)
                                .StretchMode(Stretch.Uniform)
                        )
                        .Size(40, 40)
                        .CornerRadius(20),

                    new StackPanel()
                        .Vertical()
                        .Spacing(2)
                        .Children(
                            new Label()
                                .Text("联系人名称")
                                .Bold()
                                .FontSize(14),

                            new Label()
                                .Text("在线")
                                .FontSize(11)
                        )
                ),

            // 消息列表区域
            scrollViewer = new ScrollViewer()
                .VerticalScroll(ScrollMode.Auto)
                .Content(
                    messageList = new StackPanel()
                        .Vertical()
                        .Spacing(4)
                        .Padding(12)
                        .Children(initialMessages)
                ),

            // 底部输入区域
            new StackPanel()
                .DockBottom()
                .Horizontal()
                .Spacing(8)
                .Padding(12)
                .Children(
                    inputTextBox,

                    new Button()
                        .Content("发送")
                        .OnClick(() =>
                        {
                            AddMessage(inputTextBox.Text, true);
                            inputTextBox.Text = string.Empty;
                        }),

                    new Button()
                        .Content("模拟接收")
                        .OnClick(() =>
                        {
                            var responses = new[]
                            {
                                "收到！",
                                "好的，明白了。",
                                "哈哈，有意思。",
                                "我稍后回复你。",
                                "没问题！"
                            };
                            var random = new Random();
                            var response = responses[random.Next(responses.Length)];
                            AddMessage(response, false);
                        })
                )
        );
}
