/// <reference types="mdui/jsx.zh-cn.d.ts" />
/// <reference types="vite/client" />
declare const __PUBLIC_KEY__: string

// Android 客户端 WebView 注入的桥接口
declare const LingCatClientInterface: {
    setCurrentSession(token: string, server: string, publicKeyHex: string): void
}
