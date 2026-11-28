# LingCat 原生桌面客户端

从仓库根目录启动：

```bash
dotnet run --project desktop_native/LingCat-Desktop.csproj
```

默认跟随系统浅色或深色模式，Material 主题种子与 Gallery 的 Teal 一致（`#006A6A`）。登录后可在侧栏的「外观设置」切换主题或减少动态效果。这些外观设置在本次运行中生效。也可在启动时传参，例如：

```bash
dotnet run --project desktop_native/LingCat-Desktop.csproj -- --dark --reduce-motion --data-dir=./LingCat-Data
```

Linux 版在启动时读取 KDE Plasma、GNOME、Cinnamon、MATE 或 Xfce 的界面字体族。修改系统字体后重启 LingCat 即可生效；读取不到设置时使用 MewUI 的默认字体。

头像支持 WebP 和 GIF；动图显示第一帧。发布时请保留输出目录中的 SkiaSharp 原生库。

远程图片按服务器、账号和文件哈希保存在本地，重启后可复用。Linux 默认路径为 `${XDG_CACHE_HOME:-$HOME/.cache}/LingCat/images`；指定 `--data-dir` 时存到该目录下的 `cache/images`。磁盘缓存上限为 256 MiB，单张超过 32 MiB 的图片不写入磁盘缓存。关闭客户端后可以删除缓存目录释放空间。
