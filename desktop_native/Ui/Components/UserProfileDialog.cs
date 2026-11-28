using Aprillz.MewUI;
using Aprillz.MewUI.Controls;
using LingCat.ClientProtocol.Client;
using LingCat_Desktop.Services;
using MewUI.Material.Controls;

namespace LingCat_Desktop.Ui.Components;

internal static class UserProfileDialog
{
    public static void Show(Window owner, AuthSession auth, string userId, Action<Chat> openChat, Action<User> profileChanged)
    {
        var dialog = new ProfileDialog("用户资料");
        var token = auth.Stored.Token;
        bool isMe = userId == auth.User.Id;
        Chat? selectedChat = null;

        void Render(User user, string? remark, bool canEditRemark)
        {
            dialog.Clear();
            var name = string.IsNullOrWhiteSpace(user.Nickname) ? user.Username ?? user.Id : user.Nickname;
            dialog.Header(new UserAvatar(user, auth.Client, token, 64), remark ?? name, remark is null ? null : name);
            dialog.Field("用户 ID", user.Id, "ic_info.svg");
            dialog.Field("用户名", user.Username, "ic_person.svg");
            dialog.Field("简介", user.Description, "ic_description.svg");

            if (isMe)
            {
                dialog.Action("更换头像", "ic_person.svg", () =>
                {
                    var path = FileDialog.OpenFile(new OpenFileDialogOptions
                    {
                        Owner = dialog.Window, Title = "选择头像",
                        Filters = [new FileFilter("图片（PNG、JPEG）", "*.png", "*.jpg", "*.jpeg")],
                    });
                    if (path is null) return;
                    dialog.Run("正在上传头像…", "更换头像失败", () => AvatarUpload.UpdateAsync(auth, path), updated =>
                    {
                        profileChanged(updated);
                        Render(updated, null, false);
                        dialog.SetStatus("头像已更新");
                    });
                });
                dialog.Action("编辑资料", "ic_edit.svg", () =>
                {
                    var editor = new ProfileDialog("编辑资料");
                    var nickname = new OutlinedTextField { Label = "昵称", Text = user.Nickname };
                    var username = new OutlinedTextField { Label = "用户名", Text = user.Username ?? string.Empty };
                    var description = new OutlinedTextField { Label = "简介", Text = user.Description ?? string.Empty };
                    editor.Add(nickname);
                    editor.Add(username);
                    editor.Add(description);
                    editor.Action("保存", "ic_edit.svg", () =>
                    {
                        var name = nickname.Text.Trim();
                        if (name.Length == 0) { editor.SetStatus("昵称不能为空", error: true); return; }
                        var account = username.Text.Trim();
                        var bio = description.Text.Trim();
                        editor.Run("正在保存…", "保存资料失败", async () =>
                        {
                            await UserApi.UpdateMyProfileAsync(auth.Client, new(token, Username: account, Nickname: name, Description: bio)).ConfigureAwait(false);
                            return await UserApi.QueryMyUserInfoAsync(auth.Client, new(token)).ConfigureAwait(false);
                        }, updated =>
                        {
                            editor.Window.Close();
                            profileChanged(updated);
                            Render(updated, null, false);
                            dialog.SetStatus("资料已保存");
                        });
                    });
                    editor.Show(dialog.Window, () => nickname.Editor.Focus());
                });
            }
            else if (canEditRemark)
            {
                dialog.Action("设置备注", "ic_edit.svg", () =>
                {
                    var editor = new ProfileDialog("设置备注");
                    var field = new OutlinedTextField { Label = "备注", Text = remark ?? string.Empty };
                    editor.Add(field);
                    editor.Add(ProfileDialog.Text("仅自己可见，留空则清除备注", 12, UiTheme.TextSecondary));
                    editor.Action("保存", "ic_edit.svg", () =>
                    {
                        var value = field.Text.Trim();
                        editor.Run("正在保存…", "保存备注失败", async () =>
                        {
                            await UserApi.SetUserRemarkAsync(auth.Client, new(token, userId, value)).ConfigureAwait(false);
                            return value;
                        }, saved =>
                        {
                            editor.Window.Close();
                            Render(user, saved.Length == 0 ? null : saved, true);
                            dialog.SetStatus(saved.Length == 0 ? "备注已清除" : "备注已保存");
                        });
                    });
                    editor.Show(dialog.Window, () => field.Editor.Focus());
                });
            }

            dialog.Action("打开对话", "ic_chats.svg", () => dialog.Run("正在打开对话…", "打开对话失败", async () =>
            {
                var id = await ChatApi.GetOrCreatePrivateChatAsync(auth.Client, new(token, userId)).ConfigureAwait(false);
                return await ChatApi.QueryChatInfoAsync(auth.Client, new(token, id)).ConfigureAwait(false);
            }, chat => { selectedChat = chat; dialog.Window.Close(); }));
        }

        dialog.Show(owner, () => dialog.Run("正在加载用户资料…", "加载用户资料失败", () => isMe
            ? UserApi.QueryMyUserInfoAsync(auth.Client, new(token))
            : UserApi.QueryUserInfoAsync(auth.Client, new(token, userId)), user =>
        {
            Render(user, null, false);
            if (!isMe)
                dialog.Run("正在读取备注…", "读取备注失败", () => UserApi.GetMyUserRemarksAsync(auth.Client, new(token)), remarks =>
                {
                    var remark = remarks.FirstOrDefault(r => r.UserId == userId)?.Remark;
                    Render(user, string.IsNullOrWhiteSpace(remark) ? null : remark, true);
                });
        }));

        if (selectedChat is not null) openChat(selectedChat);
    }
}
