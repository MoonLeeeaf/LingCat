using Aprillz.MewUI;
using LingCat.ClientProtocol.Client;
using LingCat_Desktop.Services;

namespace LingCat_Desktop.Ui.Components;

internal static class ChatProfileDialog
{
    public static void Show(Window owner, AuthSession auth, ChatSummary summary, Action<Chat> openChat,
        Action<bool> favouriteChanged, Action<User> profileChanged)
    {
        var dialog = new ProfileDialog("对话资料");
        var token = auth.Stored.Token;
        Chat? selectedChat = null;

        void SelectChat(Chat chat)
        {
            selectedChat = chat;
            dialog.Window.Close();
        }

        void Render(Chat chat, string? remark)
        {
            dialog.Clear();
            var name = string.IsNullOrWhiteSpace(chat.Title) ? chat.ChatUnique ?? chat.Id : chat.Title;
            var avatar = new UserAvatar(chat.AvatarFileHash, auth.Client, token, 64);
            dialog.Header(avatar, remark ?? name, remark is null ? null : name);
            dialog.Field("对话 ID", chat.Id, "ic_info.svg");
            dialog.Field("对话类型", chat.Type == "group" ? "群组" : "私聊", "ic_person.svg", copy: false);
            dialog.Field("对话标识符", chat.ChatUnique, "ic_info.svg");
            dialog.Field("简介", chat.Description, "ic_description.svg");
            if (chat.Type == "private")
            {
                dialog.Action("用户资料", "ic_person.svg", () => dialog.Run("正在查找用户…", "加载用户资料失败", () =>
                    string.IsNullOrWhiteSpace(chat.PeerUserId)
                        ? ChatApi.GetAnotherUserFromPrivateChatAsync(auth.Client, new(token, chat.Id))
                        : Task.FromResult(chat.PeerUserId),
                    id => UserProfileDialog.Show(dialog.Window, auth, id, SelectChat, profileChanged)));
            }

            bool favourited = chat.Favourited ?? summary.IsFavourite;
            dialog.Action(favourited ? "取消收藏" : "收藏对话", "ic_favourited.svg", () =>
                dialog.Run("正在更新收藏…", "更新收藏失败", async () =>
                {
                    await ChatApi.SetChatFavouritedAsync(auth.Client, new(token, chat.Id, !favourited)).ConfigureAwait(false);
                    return !favourited;
                }, saved =>
                {
                    favouriteChanged(saved);
                    Render(chat with { Favourited = saved }, remark);
                    dialog.SetStatus(saved ? "已收藏对话" : "已取消收藏");
                }));
            dialog.Action("打开对话", "ic_chats.svg", () => SelectChat(chat));
        }

        dialog.Show(owner, () => dialog.Run("正在加载对话资料…", "加载对话资料失败",
            () => ChatApi.QueryChatInfoAsync(auth.Client, new(token, summary.Id)), chat =>
            {
                Render(chat, null);
                if (chat.Type == "private" && !string.IsNullOrWhiteSpace(chat.PeerUserId))
                    dialog.Run("正在读取备注…", "读取备注失败", () => UserApi.GetMyUserRemarksAsync(auth.Client, new(token)), remarks =>
                    {
                        var remark = remarks.FirstOrDefault(r => r.UserId == chat.PeerUserId)?.Remark;
                        Render(chat, string.IsNullOrWhiteSpace(remark) ? null : remark);
                    });
            }));

        if (selectedChat is not null) openChat(selectedChat);
    }
}
