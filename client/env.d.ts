/// <reference types="mdui/jsx.zh-cn.d.ts" />
/// <reference types="vite/client" />
declare const __PUBLIC_KEY__: string

declare class LingCatClientInterface {
    static setCurrentSession(token: string, server: string, public_key: string): void
}
