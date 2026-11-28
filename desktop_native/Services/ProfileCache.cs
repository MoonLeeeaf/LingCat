using LingCat.ClientProtocol.Client;
using LingCat_Desktop.Ui;

namespace LingCat_Desktop.Services;

// Owned by one signed-in session; accessed on the UI thread.
internal sealed class ProfileCache(AuthSession auth)
{
    private readonly Dictionary<string, (DateTimeOffset Expires, Task<User> Request)> _users = new();
    private Dictionary<string, string> _remarks = new(StringComparer.Ordinal);

    public event Action? RemarksChanged;
    public int RemarksRevision { get; private set; }

    public Task<User> GetUserAsync(string id)
    {
        if (id == auth.User.Id) return Task.FromResult(auth.User);
        var now = DateTimeOffset.UtcNow;
        if (_users.TryGetValue(id, out var entry) && (!entry.Request.IsCompleted ||
            (entry.Expires > now && entry.Request.IsCompletedSuccessfully))) return entry.Request;
        if (_users.Count >= 256 && !_users.ContainsKey(id))
            _users.Remove(_users.MinBy(item => item.Value.Expires).Key);
        var request = UserApi.QueryUserInfoAsync(auth.Client, new(auth.Stored.Token, id));
        _users[id] = (now.AddMinutes(5), request);
        return request;
    }

    public string? GetRemark(string? id) => id is not null && _remarks.TryGetValue(id, out var remark) ? remark : null;

    public string ChatTitle(ChatSummary chat) => (chat.IsGroup ? null : GetRemark(chat.PeerUserId)) ?? chat.Title;

    public void SetRemark(string id, string remark)
    {
        RemarksRevision++;
        if (string.IsNullOrWhiteSpace(remark)) _remarks.Remove(id);
        else _remarks[id] = remark;
        RemarksChanged?.Invoke();
    }

    public void ReplaceRemarks(IEnumerable<UserRemark> remarks)
    {
        var next = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var remark in remarks)
            if (!string.IsNullOrWhiteSpace(remark.Remark)) next[remark.UserId] = remark.Remark;
        if (next.Count == _remarks.Count && next.All(pair => GetRemark(pair.Key) == pair.Value)) return;
        _remarks = next;
        RemarksChanged?.Invoke();
    }
}
