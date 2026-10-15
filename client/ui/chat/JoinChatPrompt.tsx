import React from 'react'
import { ChatApi } from 'lingcat-client-protocol'
import ClientManager from '../../ClientManager.ts'
import tipError from '../tipError.ts'
import showSnackbar from '../showSnackbar.ts'
import type { IChat } from 'lingcat-protocol'

export interface JoinChatPromptProps {
    chat: IChat
    /** 加入成功后回调，通知上层重新拉取 chatInfo */
    onJoined?: () => void
}

export function JoinChatPrompt({ chat, onJoined }: JoinChatPromptProps) {
    const canJoin = React.useMemo(() => {
        try {
            const settings = JSON.parse(chat.settings || '{}')
            return settings.allow_join === true
        } catch {
            return false
        }
    }, [chat.settings])

    const handleJoin = async () => {
        const client = ClientManager.getActiveClient()
        const session = ClientManager.getActiveSession()
        if (!client || !session) return

        try {
            await ChatApi.joinChat(client, {
                access_token: session.token,
                chat_id: chat.id,
            })
        } catch (e) {
            console.log(e)
            tipError(e, '加入对话失败')
            return
        }

        showSnackbar({ message: '已加入对话' })
        onJoined?.()
    }

    return (
        <div style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <div style={{
                maxWidth: '300px',
                textAlign: 'center',
            }}>
                {canJoin ? (
                    <mdui-button onClick={handleJoin}>加入对话</mdui-button>
                ) : (
                    <div>
                        <div>该群未开放加入</div>
                        <div style={{ fontSize: '85%', opacity: 0.7, marginTop: '6px' }}>
                            需要管理员在「对话设定 → 入群」中开启「允许加入」
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}