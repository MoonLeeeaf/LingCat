import { FusesPlugin } from '@electron-forge/plugin-fuses'
import { FuseV1Options, FuseVersion } from '@electron/fuses'
import type { ForgeConfig } from '@electron-forge/shared-types'

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'LingCat',
    executableName: 'lingcat-desktop-electron',
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
          maintainer: 'CrescentLeaf',
          homepage: 'https://codeberg.org/CrescentLeaf/LingCat',
          description: 'A noraml IM project. Simple, lightweight, pure, sometimes naive.',
        },
      },
      platforms: ['linux'],
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        format: 'ULFO',
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