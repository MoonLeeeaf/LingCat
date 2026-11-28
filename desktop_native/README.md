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
