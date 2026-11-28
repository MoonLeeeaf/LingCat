using Aprillz.MewUI;

namespace LingCat_Desktop.Ui;

internal static class DemoData
{
    public static List<ChatSummary> CreateChats()
    {
        var devGroup = new ChatSummary
        {
            Id = "dev-group",
            Title = "灵猫开发组",
            AvatarText = "灵",
            AvatarColor = UiTheme.Accent,
            Time = "11:42",
            IsGroup = true,
            MemberCount = 8,
            IsFavourite = true,
        };

        devGroup.Messages.AddRange(new[]
        {
            new ChatMessage
            {
                Text = "欢迎来到灵猫开发组",
                Time = "09:12",
                IsSystem = true,
            },
            new ChatMessage
            {
                Text = "桌面端新的布局骨架已经接上了，先做侧边栏、对话列表和聊天页三段结构。",
                Time = "10:03",
                Sender = "弥生",
            },
            new ChatMessage
            {
                Text = "收到，我这边把列表项的选中态先补齐。",
                Time = "10:18",
                Sender = "我",
                IsMine = true,
            },
            new ChatMessage
            {
                Text = "消息气泡先按左右分栏来，后面再接入实体渲染、贴纸和附件。",
                Time = "11:07",
                Sender = "阿七",
            },
            new ChatMessage
            {
                Text = "框架清晰就好，先把可交互的页面跑起来。",
                Time = "11:42",
                Sender = "弥生",
            },
        });

        var xiaolin = new ChatSummary
        {
            Id = "xiaolin",
            Title = "小林",
            AvatarText = "林",
            AvatarColor = UiTheme.Rgb(0xD97757),
            Time = "10:55",
            Snippet = "今晚的版本我会再跑一遍回归。",
            IsFavourite = true,
        };

        xiaolin.Messages.AddRange(new[]
        {
            new ChatMessage
            {
                Text = "桌面端现在能直接连本地服务端了吗？",
                Time = "10:31",
                Sender = "小林",
            },
            new ChatMessage
            {
                Text = "可以，握手和加密请求都已经通了。",
                Time = "10:36",
                Sender = "我",
                IsMine = true,
            },
            new ChatMessage
            {
                Text = "那太好了。今晚的版本我会再跑一遍回归。",
                Time = "10:55",
                Sender = "小林",
            },
        });

        var design = new ChatSummary
        {
            Id = "design-review",
            Title = "设计评审",
            AvatarText = "设",
            AvatarColor = UiTheme.Rgb(0x9B7BFF),
            Time = "昨天",
            Snippet = "配色稿更新到第 3 版了。",
            IsGroup = true,
            MemberCount = 5,
        };

        design.Messages.AddRange(new[]
        {
            new ChatMessage
            {
                Text = "配色稿更新到第 3 版了。",
                Time = "昨天 18:20",
                Sender = "南枝",
            },
            new ChatMessage
            {
                Text = "深色模式的层次比之前清楚了，列表和主内容区不再糊在一起。",
                Time = "昨天 18:34",
                Sender = "我",
                IsMine = true,
            },
        });

        var fileHelper = new ChatSummary
        {
            Id = "file-helper",
            Title = "文件传输助手",
            AvatarText = "文",
            AvatarColor = UiTheme.Rgb(0x4FB6A5),
            Time = "昨天",
            Snippet = "lingcat-desktop-preview.zip",
        };

        fileHelper.Messages.Add(new ChatMessage
        {
            Text = "lingcat-desktop-preview.zip",
            Time = "昨天 16:08",
            Sender = "我",
            IsMine = true,
        });

        var aqi = new ChatSummary
        {
            Id = "aqi",
            Title = "阿七",
            AvatarText = "七",
            AvatarColor = UiTheme.Rgb(0xE2B15C),
            Time = "周一",
            Snippet = "回头我把会议悬浮窗也拆出来。",
        };

        aqi.Messages.AddRange(new[]
        {
            new ChatMessage
            {
                Text = "回头我把会议悬浮窗也拆出来。",
                Time = "周一 21:12",
                Sender = "阿七",
            },
            new ChatMessage
            {
                Text = "好，先保持主窗口三段式。",
                Time = "周一 21:15",
                Sender = "我",
                IsMine = true,
            },
        });

        var product = new ChatSummary
        {
            Id = "product",
            Title = "产品讨论",
            AvatarText = "产",
            AvatarColor = UiTheme.Rgb(0x6FBF73),
            Time = "周一",
            Snippet = "搜索入口放在对话列表顶部比较顺手。",
            IsGroup = true,
            MemberCount = 12,
            IsFavourite = true,
        };

        product.Messages.AddRange(new[]
        {
            new ChatMessage
            {
                Text = "搜索入口放在对话列表顶部比较顺手。",
                Time = "周一 15:40",
                Sender = "林檎",
            },
            new ChatMessage
            {
                Text = "同意，侧边栏只保留一级导航和账号入口。",
                Time = "周一 15:43",
                Sender = "我",
                IsMine = true,
            },
        });

        return new List<ChatSummary>
        {
            devGroup,
            xiaolin,
            design,
            fileHelper,
            aqi,
            product,
        };
    }
}
