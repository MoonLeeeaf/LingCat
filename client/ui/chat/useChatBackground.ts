import React from 'react'
import SessionEnv from '../../SessionEnv.ts'
import { getChatBackground, subscribeChatBackground } from '../../lib/chatBackground.ts'

/** 读取本地对话背景, 返回可直接用于 url() 的 object URL */
export function useChatBackground(chatId: string): string | null {
    const [url, setUrl] = React.useState<string | null>(null)

    React.useEffect(() => {
        let disposed = false
        let objectUrl: string | null = null
        let version = 0

        const load = async () => {
            const request = ++version
            try {
                const blob = await getChatBackground(chatId)
                if (disposed || request !== version) return
                if (objectUrl) {
                    URL.revokeObjectURL(objectUrl)
                    objectUrl = null
                }
                if (blob) {
                    objectUrl = URL.createObjectURL(blob)
                    setUrl(objectUrl)
                } else {
                    setUrl(null)
                }
            } catch {
                if (!disposed && request === version) setUrl(null)
            }
        }

        setUrl(null)
        void load()
        const unsubscribe = subscribeChatBackground(chatId, () => { void load() })

        return () => {
            disposed = true
            unsubscribe()
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [chatId, SessionEnv.myUserId])

    return url
}
