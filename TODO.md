# TODO

## 待讨论 / 待修复

### 1. `ProfileCache` 拉取对话信息失败不会自动重试

`ProfileCache.fetchChat()` / `fetchUser()` 失败后只返回空结果，不会重试，也没有失败缓存或延迟重拉的机制。

影响：网络短暂抖动时，聊天页标题会退化成「对话」、成员/资料可能显示空白；用户只能退出重进才会重新拉取。

初步想法（待讨论后再定）：
- **重试放在调用方，不放在 `ProfileCache` 内部**。重试次数、退避时长、是否提示用户，本质是业务/界面决策：聊天页标题可以静默重试一次，资料弹窗应该显示「重试」按钮，列表页可能要指数退避。缓存层不该替它们做决定。
- `ProfileCache` 内部也不适合持有 `CoroutineScope` 或 `delay`，否则取消语义会变模糊（谁取消？重进页面还算数吗？）。
- 真正要先修的是：`ProfileCache` 现在把「请求失败」和「确实不存在」都返回 `null`，调用方根本无法判断要不要重试。应改为抛异常或返回 `Result<T>`，只有确认不存在才返回 `null`。
- 缓存层保留三个职责即可：失败不伪装成空结果、短 TTL 负缓存（避免连续打服务器）、single-flight 合并并发请求。
- 调用方（ViewModel）用 `viewModelScope` 重试，并把 `isLoading / error / retry` 暴露给界面；抽一个 `retryWithBackoff` 小工具避免每个调用点复制循环。

状态：**已完成**。实现方式：

- `ProfileCache` 新增 `ProfileFetchException`、`requireChat()` / `requireUser()`：
  - 失败（未连接 / 网络异常）抛异常，不再伪装成 null；
  - 只有服务器确认不存在才返回 null，并写入 30s 负缓存；
  - 锁内二次查缓存，合并并发请求（single-flight）。
- 旧的 `fetchChat()` / `fetchUser()` 保留为吞异常的包装，通知、保活服务等非 UI 调用方不受影响。
- 新增 `ui/utils/Retry.kt` 的 `retryWithBackoff()`（1s / 3s / 9s，正确传播取消）。
- 聊天页标题：`ChatViewModel.fetchChatInfo()` 静默重试，失败保持「对话」占位，不打扰用户。
- 资料弹窗：`UserProfileViewModel` 暴露 `loadFailed`，`UserProfileDialog` 显示失败态 + 「重试」按钮；
  不在后台静默等待多次退避，否则用户会对着转圈等十几秒。

---

## 已完成（本轮 UI 修复）

- 气泡对比度 / 自适应宽度
- 平板分栏与固定尺寸
- 会话列表筛选（全部 / 收藏）
- 会议页深色主题与系统栏
- 触控目标 ≥ 48dp
- 共享组件（头像 / 列表项 / 状态视图 / 全局反馈）
- 界面文案资源化
- 统一导航转场
- 边到边留白去重
