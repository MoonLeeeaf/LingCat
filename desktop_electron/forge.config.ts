import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { FuseV1Options, FuseVersion } from '@electron/fuses'
import type { ForgeConfig } from '@electron-forge/shared-types'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const projectDir = path.dirname(fileURLToPath(import.meta.url))

// 直接指向仓库 assets/ 下的真实文件。
// 注意不要用 ./icon.png 等符号链接：fs-extra 复制时会保留符号链接,
// 打进 deb 后会变成 /usr/share/pixmaps 下的断链, chmod 时报 ENOENT。
const iconPath = (ext: string) => path.join(projectDir, '..', 'assets', `icon${ext}`)

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'LingCat',
    executableName: 'lingcat-desktop-electron',
    // 不写扩展名, electron-packager 会按平台自动选择:
    // Windows -> icon.ico, macOS -> icon.icns, Linux -> 由 maker-deb 的 icon 指定
    icon: iconPath(''),
    extendInfo: {
      NSCameraUsageDescription: '用于语音、视频通话与会议',
      NSMicrophoneUsageDescription: '用于语音通话、会议与语音消息',
      NSLocalNetworkUsageDescription: '用于连接你所在的灵猫服务器',
    },
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'LingCat',
        // Windows 安装程序 (Setup.exe) 的图标
        setupIcon: iconPath('.ico'),
      },
      platforms: ['win32'],
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['win32', 'darwin', 'linux'],
      config: {},
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          // Debian 包名必须小写; 启动器里显示的名字由 productName 决定
          name: 'lingcat',
          productName: 'LingCat',
          maintainer: 'CrescentLeaf',
          homepage: 'https://codeberg.org/CrescentLeaf/LingCat',
          description: 'A noraml IM project. Simple, lightweight, pure, sometimes naive.',
          // 桌面菜单分类: Network = 互联网
          categories: ['Network'],
          // Debian 包与 .desktop 使用的应用图标 (需要 PNG)
          icon: iconPath('.png'),
        },
      },
      platforms: ['linux'],
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
        // DMG 卷图标
        icon: iconPath('.icns'),
      },
      platforms: ['darwin'],
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
}

export default config